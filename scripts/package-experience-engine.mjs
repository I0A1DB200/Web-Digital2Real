import {
  access,
  cp,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseExperienceYaml } from "../experience-engine/adapter/yamlExperienceAdapter.js";
import {
  resolveExperienceLocalization,
  selectLocaleDocument
} from "../experience-engine/localization/experienceLocalization.js";
import { packageExperience } from "../experience-engine/packaging/experiencePackagingPipeline.js";
import { validateEnvironmentDefinition } from "../experience-engine/validation/environmentDefinitionValidator.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = path.resolve(scriptDirectory, "..");
const supportedModes = new Set(["preview", "publish"]);

export async function packageExperienceEngine({
  repositoryRoot = defaultRepositoryRoot,
  mode = "publish"
} = {}) {
  if (!supportedModes.has(mode)) throw new Error(`Unsupported packaging mode: ${mode}.`);

  const root = path.resolve(repositoryRoot);
  const frontendRoot = path.join(root, "Frontend");
  const targetRoot = path.join(frontendRoot, "generated", "experience-engine");
  const temporaryRoot = path.join(frontendRoot, "generated", ".experience-engine-build");
  const playerSource = path.join(root, "experience-engine", "player", "experiencePlayer.js");
  const evaluatorSource = path.join(root, "experience-engine", "evaluation", "experienceEvaluator.js");
  const experienceRoot = path.join(root, "content", "experiences");
  const environmentRoot = path.join(root, "content", "environments");
  assertInside(frontendRoot, targetRoot);
  assertInside(frontendRoot, temporaryRoot);
  await access(playerSource);
  await access(evaluatorSource);

  const experienceFiles = await findExperienceFiles(experienceRoot);
  const candidates = [];
  const skipped = [];
  const identifiers = new Set();
  const editorialIdentifiers = new Set();

  for (const file of experienceFiles) {
    const authoring = parseExperienceYaml(await readFile(file, "utf8"));
    const id = authoring?.metadata?.id ?? relative(root, file);

    if (!eligible(authoring, mode)) {
      skipped.push({ file: relative(root, file), reason: "publication_state" });
      continue;
    }

    const localized = await resolvePackageLocales(authoring, path.dirname(file));
    const defaultAuthoring = localized
      ? resolveExperienceLocalization(
          authoring,
          selectLocaleDocument(localized.defaultLocale, localized.documents, localized.defaultLocale)
        )
      : authoring;
    const artifact = packageExperience(defaultAuthoring);
    if (identifiers.has(artifact.identity.id)) {
      throw new Error(`Duplicate experience identifier: ${artifact.identity.id}.`);
    }
    identifiers.add(artifact.identity.id);
    const editorialId = authoring.metadata.editorial_id;
    if (editorialIdentifiers.has(editorialId)) {
      throw new Error(`Duplicate Experience editorial identifier: ${editorialId}.`);
    }
    editorialIdentifiers.add(editorialId);
    const localizedArtifacts = localized
      ? Object.fromEntries(Object.entries(localized.documents).map(([locale, document]) => [
          locale,
          packageExperience(resolveExperienceLocalization(authoring, document))
        ]))
      : null;
    candidates.push({
      artifact,
      localizedArtifacts,
      defaultLocale: localized?.defaultLocale ?? null,
      sourceDirectory: path.dirname(file),
      editorialId,
      access: authoring.metadata.access
    });
  }

  candidates.sort((left, right) => left.artifact.identity.id.localeCompare(right.artifact.identity.id));
  const environments = await resolveEnvironments({
    environmentRoot,
    experienceEditorialIds: editorialIdentifiers,
    mode,
    root
  });
  await rm(temporaryRoot, { recursive: true, force: true });

  try {
    await mkdir(path.join(temporaryRoot, "player"), { recursive: true });
    await mkdir(path.join(temporaryRoot, "evaluation"), { recursive: true });
    await mkdir(path.join(temporaryRoot, "experiences"), { recursive: true });
    await mkdir(path.join(temporaryRoot, "environments"), { recursive: true });
    await cp(playerSource, path.join(temporaryRoot, "player", "experiencePlayer.js"));
    await cp(evaluatorSource, path.join(temporaryRoot, "evaluation", "experienceEvaluator.js"));

    const catalog = {
      format: "Digital2Real Generated Web Artifact Catalog",
      version: 1,
      mode,
      experiences: [],
      environments: []
    };

    for (const candidate of candidates) {
      const { artifact, localizedArtifacts, defaultLocale, sourceDirectory } = candidate;
      await copyMediaAssets({ artifact, sourceDirectory, temporaryRoot });
      const localePaths = {};
      if (localizedArtifacts) {
        for (const [locale, localizedArtifact] of Object.entries(localizedArtifacts)) {
          const localizedFile = `${artifact.identity.id}.${locale}.json`;
          await writeArtifact(temporaryRoot, localizedFile, localizedArtifact);
          localePaths[locale] = `experiences/${localizedFile}`;
        }
      } else {
        await writeArtifact(temporaryRoot, `${artifact.identity.id}.json`, artifact);
      }
      catalog.experiences.push({
        id: artifact.identity.id,
        editorialId: candidate.editorialId,
        access: candidate.access,
        class: artifact.identity.class,
        title: artifact.metadata.title,
        summary: artifact.metadata.summary,
        estimatedDuration: artifact.metadata.estimated_duration,
        cover: findCover(artifact),
        ...(localizedArtifacts
          ? {
              defaultLocale,
              locales: localePaths,
              localizedMetadata: Object.fromEntries(
                Object.entries(localizedArtifacts).map(([locale, localizedArtifact]) => [
                  locale,
                  {
                    title: localizedArtifact.metadata.title,
                    summary: localizedArtifact.metadata.summary
                  }
                ])
              )
            }
          : { path: `experiences/${artifact.identity.id}.json` })
      });
    }

    for (const item of environments) {
      const backgroundFile = path.basename(item.definition.visual.background);
      await cp(item.backgroundSource, path.join(temporaryRoot, "environments", backgroundFile));
      catalog.environments.push({
        id: item.definition.environment.id,
        slug: item.definition.environment.slug,
        title: item.definition.environment.title,
        lifecycle: item.definition.environment.lifecycle,
        capacity: item.definition.environment.capacity,
        background: `environments/${backgroundFile}`,
        width: item.definition.visual.width,
        height: item.definition.visual.height,
        hotspots: item.definition.hotspots.map(hotspot => ({
          experienceEditorialId: hotspot.experience_editorial_id,
          x: hotspot.x,
          y: hotspot.y
        }))
      });
    }

    await writeFile(
      path.join(temporaryRoot, "catalog.json"),
      `${JSON.stringify(catalog, null, 2)}\n`,
      "utf8"
    );

    await rm(targetRoot, { recursive: true, force: true });
    await rename(temporaryRoot, targetRoot);
  } catch (error) {
    await rm(temporaryRoot, { recursive: true, force: true });
    throw error;
  }

  return Object.freeze({
    mode,
    output: relative(root, targetRoot),
    packaged: Object.freeze(candidates.map(candidate => candidate.artifact.identity.id)),
    environments: Object.freeze(environments.map(item => item.definition.environment.id)),
    skipped: Object.freeze(skipped.map(item => Object.freeze(item)))
  });
}

async function resolveEnvironments({ environmentRoot, experienceEditorialIds, mode, root }) {
  const files = await findNamedFiles(environmentRoot, "environment.yaml");
  const environments = [];
  for (const file of files) {
    const definition = parseExperienceYaml(await readFile(file, "utf8"));
    if (!environmentEligible(definition, mode)) continue;
    const validation = validateEnvironmentDefinition(definition, {
      experienceEditorialIds: [...experienceEditorialIds]
    });
    if (!validation.valid) {
      const details = validation.incidents.map(issue => `${issue.path}: ${issue.message}`).join("; ");
      throw new Error(`Invalid Environment ${relative(root, file)}: ${details}`);
    }
    const packageDirectory = path.dirname(file);
    const backgroundSource = path.resolve(packageDirectory, definition.visual.background);
    assertInside(packageDirectory, backgroundSource);
    const dimensions = await readPngDimensions(backgroundSource);
    if (dimensions.width !== definition.visual.width || dimensions.height !== definition.visual.height) {
      throw new Error(`Environment image dimensions do not match ${relative(root, file)}.`);
    }
    environments.push({ definition, backgroundSource });
  }
  environments.sort((left, right) => left.definition.environment.id.localeCompare(right.definition.environment.id));
  return environments;
}

async function readPngDimensions(file) {
  const buffer = await readFile(file);
  const signature = "89504e470d0a1a0a";
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== signature) {
    throw new Error(`Environment background must be a PNG: ${file}.`);
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function environmentEligible(definition, mode) {
  const lifecycle = definition?.environment?.lifecycle;
  return mode === "publish" ? lifecycle === "published" : ["preview", "published"].includes(lifecycle);
}

async function writeArtifact(temporaryRoot, fileName, artifact) {
  await writeFile(
    path.join(temporaryRoot, "experiences", fileName),
    `${JSON.stringify(artifact, null, 2)}\n`,
    "utf8"
  );
}

async function resolvePackageLocales(authoring, packageDirectory) {
  if (!authoring.localization) return null;
  const folderName = path.basename(packageDirectory);
  if (!/^EE-[0-9]{4}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(folderName)) {
    throw new Error(`Invalid Experience Package folder name: ${folderName}.`);
  }
  for (const required of ["experience.yaml", "README.md", "locales", "media-source", "assets"]) {
    await access(path.join(packageDirectory, required));
  }
  const config = authoring.localization;
  if (typeof config.default_locale !== "string"
    || !Array.isArray(config.supported_locales)
    || !config.supported_locales.includes(config.default_locale)
    || !config.locale_files) {
    throw new Error(`Invalid localization configuration in ${folderName}.`);
  }
  const documents = {};
  for (const locale of config.supported_locales) {
    const relativeFile = config.locale_files[locale];
    if (typeof relativeFile !== "string") throw new Error(`Missing locale file for ${locale}.`);
    const localeFile = path.resolve(packageDirectory, relativeFile);
    assertInside(packageDirectory, localeFile);
    const localeStats = await stat(localeFile);
    if (!localeStats.isFile()) throw new Error(`Locale path is not a file: ${relativeFile}.`);
    const document = parseExperienceYaml(await readFile(localeFile, "utf8"));
    if (document.locale !== locale) throw new Error(`Locale identity mismatch for ${relativeFile}.`);
    documents[locale] = document;
    resolveExperienceLocalization(authoring, document);
  }
  await validateAssetReferences(authoring, packageDirectory);
  return { defaultLocale: config.default_locale, documents };
}

async function validateAssetReferences(authoring, packageDirectory) {
  for (const asset of authoring.public?.visual?.assets ?? []) {
    if (typeof asset.src !== "string" || asset.src.includes("..")
      || !asset.src.startsWith(`assets/${authoring.metadata.id}/`)) {
      throw new Error(`Invalid asset path in ${authoring.metadata.id}: ${String(asset.src)}.`);
    }
    const source = path.resolve(packageDirectory, "assets", path.basename(asset.src));
    assertInside(packageDirectory, source);
    await access(source);
  }
}

async function copyMediaAssets({ artifact, sourceDirectory, temporaryRoot }) {
  const assets = artifact.public.visual.assets ?? [];
  for (const asset of assets) {
    const source = path.join(sourceDirectory, "assets", path.basename(asset.src));
    const destination = path.join(temporaryRoot, ...asset.src.split("/"));
    assertInside(temporaryRoot, destination);
    await access(source);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(source, destination);
  }
}

function findCover(artifact) {
  const coverId = artifact.public.visual.cover_asset_id;
  const cover = (artifact.public.visual.assets ?? []).find(asset => asset.id === coverId);
  return cover?.src ?? null;
}

function eligible(authoring, mode) {
  const status = authoring?.metadata?.status;
  const validation = authoring?.private?.technical_validation?.status;
  if (mode === "publish") return status === "published" && validation === "pass";
  return ["technical_review", "approved", "published"].includes(status)
    && ["pending", "pass_with_warnings", "pass"].includes(validation);
}

async function findExperienceFiles(directory) {
  return findNamedFiles(directory, "experience.yaml");
}

async function findNamedFiles(directory, fileName) {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await findNamedFiles(location, fileName));
    else if (entry.isFile() && entry.name === fileName) files.push(location);
  }
  return files;
}

function assertInside(parent, candidate) {
  const relativePath = path.relative(parent, candidate);
  if (!relativePath || relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error(`Unsafe generated path: ${candidate}.`);
  }
}

function relative(root, location) {
  return path.relative(root, location).split(path.sep).join("/");
}

function parseCliArguments(argumentsList) {
  const modeArgument = argumentsList.find(argument => argument.startsWith("--mode="));
  return { mode: modeArgument ? modeArgument.slice("--mode=".length) : "publish" };
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  packageExperienceEngine(parseCliArguments(process.argv.slice(2)))
    .then(result => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`))
    .catch(error => {
      process.stderr.write(`Experience packaging failed: ${error.message}\n`);
      process.exitCode = 1;
    });
}
