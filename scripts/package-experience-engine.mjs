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
import { ExperiencePlayer } from "../experience-engine/player/experiencePlayer.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = path.resolve(scriptDirectory, "..");
const supportedModes = new Set(["preview", "publish"]);

export async function packageExperienceEngine({
  repositoryRoot = defaultRepositoryRoot,
  mode = "publish"
} = {}) {
  if (!supportedModes.has(mode)) throw new Error(`Unsupported packaging mode: ${mode}.`);

  const root = path.resolve(repositoryRoot);
  const sourceRoot = path.join(root, "experience-engine");
  const frontendRoot = path.join(root, "Frontend");
  const generatedRoot = path.join(frontendRoot, "generated");
  const targetRoot = path.join(generatedRoot, "experience-engine");
  const temporaryRoot = path.join(generatedRoot, ".experience-engine-build");
  assertInside(frontendRoot, targetRoot);
  assertInside(frontendRoot, temporaryRoot);

  const playerSource = path.join(sourceRoot, "player", "experiencePlayer.js");
  await access(playerSource);
  const experienceRoot = path.join(root, "content", "experiences");
  const experienceFiles = await findExperienceFiles(experienceRoot);
  const candidates = [];
  const skipped = [];
  const identifiers = new Set();

  for (const file of experienceFiles) {
    const model = parseExperienceYaml(await readFile(file, "utf8"));
    if (!model.experience) {
      skipped.push({ file: relative(root, file), reason: "legacy_schema" });
      continue;
    }

    validateCanonicalCandidate(model);
    if (identifiers.has(model.experience.id)) {
      throw new Error(`Duplicate experience identifier: ${model.experience.id}.`);
    }
    identifiers.add(model.experience.id);

    if (!eligible(model, mode)) {
      skipped.push({ file: relative(root, file), reason: "publication_state" });
      continue;
    }

    new ExperiencePlayer({ experience: model });
    candidates.push(model);
  }

  candidates.sort((left, right) => left.experience.id.localeCompare(right.experience.id));
  await rm(temporaryRoot, { recursive: true, force: true });

  try {
    await mkdir(path.join(temporaryRoot, "player"), { recursive: true });
    await mkdir(path.join(temporaryRoot, "experiences"), { recursive: true });
    await cp(playerSource, path.join(temporaryRoot, "player", "experiencePlayer.js"));

    const catalog = {
      format: "Digital2Real Experience Package",
      version: 1,
      mode,
      experiences: []
    };

    for (const model of candidates) {
      const fileName = `${model.experience.id}.json`;
      await writeFile(
        path.join(temporaryRoot, "experiences", fileName),
        `${JSON.stringify(model, null, 2)}\n`,
        "utf8"
      );
      catalog.experiences.push({
        id: model.experience.id,
        slug: model.experience.slug,
        title: model.experience.title,
        summary: model.experience.summary,
        difficulty: model.experience.difficulty,
        estimatedDuration: model.experience.estimated_duration,
        status: model.experience.status,
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
    packaged: Object.freeze(candidates.map(model => model.experience.id)),
    skipped: Object.freeze(skipped.map(item => Object.freeze(item)))
  });
}

function validateCanonicalCandidate(model) {
  const id = model.experience.id;
  if (model.experience.status !== model.web?.publication_status) {
    throw new Error(`Publication status mismatch in ${id}.`);
  }
  if (!model.metadata?.technical_validation) {
    throw new Error(`Missing technical validation metadata in ${id}.`);
  }
}

function eligible(model, mode) {
  const status = model.experience.status;
  const validation = model.metadata.technical_validation.status;
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
