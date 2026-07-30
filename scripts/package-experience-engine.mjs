import {
  access,
  cp,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseExperienceYaml } from "../experience-engine/adapter/yamlExperienceAdapter.js";
import { packageExperience } from "../experience-engine/packaging/experiencePackagingPipeline.js";

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
  const experienceRoot = path.join(root, "content", "experiences");
  assertInside(frontendRoot, targetRoot);
  assertInside(frontendRoot, temporaryRoot);
  await access(playerSource);

  const experienceFiles = await findExperienceFiles(experienceRoot);
  const candidates = [];
  const skipped = [];
  const identifiers = new Set();

  for (const file of experienceFiles) {
    const authoring = parseExperienceYaml(await readFile(file, "utf8"));
    const id = authoring?.metadata?.id ?? relative(root, file);

    if (!eligible(authoring, mode)) {
      skipped.push({ file: relative(root, file), reason: "publication_state" });
      continue;
    }

    const artifact = packageExperience(authoring);
    if (identifiers.has(artifact.identity.id)) {
      throw new Error(`Duplicate experience identifier: ${artifact.identity.id}.`);
    }
    identifiers.add(artifact.identity.id);
    candidates.push(artifact);
  }

  candidates.sort((left, right) => left.identity.id.localeCompare(right.identity.id));
  await rm(temporaryRoot, { recursive: true, force: true });

  try {
    await mkdir(path.join(temporaryRoot, "player"), { recursive: true });
    await mkdir(path.join(temporaryRoot, "experiences"), { recursive: true });
    await cp(playerSource, path.join(temporaryRoot, "player", "experiencePlayer.js"));

    const catalog = {
      format: "Digital2Real Generated Web Artifact Catalog",
      version: 1,
      mode,
      experiences: []
    };

    for (const artifact of candidates) {
      const fileName = `${artifact.identity.id}.json`;
      await writeFile(
        path.join(temporaryRoot, "experiences", fileName),
        `${JSON.stringify(artifact, null, 2)}\n`,
        "utf8"
      );
      catalog.experiences.push({
        id: artifact.identity.id,
        class: artifact.identity.class,
        title: artifact.metadata.title,
        summary: artifact.metadata.summary,
        estimatedDuration: artifact.metadata.estimated_duration,
        path: `experiences/${fileName}`
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
    packaged: Object.freeze(candidates.map(artifact => artifact.identity.id)),
    skipped: Object.freeze(skipped.map(item => Object.freeze(item)))
  });
}

function eligible(authoring, mode) {
  const status = authoring?.metadata?.status;
  const validation = authoring?.private?.technical_validation?.status;
  if (mode === "publish") return status === "published" && validation === "pass";
  return ["technical_review", "approved", "published"].includes(status)
    && ["pending", "pass_with_warnings", "pass"].includes(validation);
}

async function findExperienceFiles(directory) {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await findExperienceFiles(location));
    else if (entry.isFile() && entry.name === "experience.yaml") files.push(location);
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
