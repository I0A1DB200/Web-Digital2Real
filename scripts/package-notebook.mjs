import {
  access,
  cp,
  mkdir,
  readFile,
  rename,
  rm
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = path.resolve(scriptDirectory, "..");

export async function packageNotebook({
  repositoryRoot = defaultRepositoryRoot
} = {}) {
  const root = path.resolve(repositoryRoot);
  const source = path.join(root, "content", "notebooks", "notebook.js");
  const frontendRoot = path.join(root, "Frontend");
  const generatedRoot = path.join(frontendRoot, "generated");
  const targetRoot = path.join(generatedRoot, "notebooks");
  const temporaryRoot = path.join(generatedRoot, ".notebook-build");

  assertInside(frontendRoot, targetRoot);
  assertInside(frontendRoot, temporaryRoot);
  await access(source);
  await validateNotebookModule(source);
  await rm(temporaryRoot, { recursive: true, force: true });

  try {
    await mkdir(temporaryRoot, { recursive: true });
    await cp(source, path.join(temporaryRoot, "notebook.js"));
    await rm(targetRoot, { recursive: true, force: true });
    await rename(temporaryRoot, targetRoot);
  } catch (error) {
    await rm(temporaryRoot, { recursive: true, force: true });
    throw error;
  }

  return Object.freeze({
    source: relative(root, source),
    output: relative(root, path.join(targetRoot, "notebook.js"))
  });
}

async function validateNotebookModule(source) {
  const sourceText = await readFile(source, "utf8");
  const moduleUrl = `${pathToFileURL(source).href}?validate=${encodeURIComponent(sourceText.length)}`;
  const module = await import(moduleUrl);

  if (!Array.isArray(module.notebook)) {
    throw new Error("Notebook content must export a notebook array.");
  }

  const identifiers = new Set();
  const slugs = new Set();

  module.notebook.forEach((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`Notebook entry ${index} must be an object.`);
    }
    requireText(entry.id, `Notebook entry ${index} id`);
    requireText(entry.slug, `Notebook entry ${entry.id} slug`);
    requireText(entry.title, `Notebook entry ${entry.id} title`);
    if (!Array.isArray(entry.sections)) {
      throw new Error(`Notebook entry ${entry.id} must define sections.`);
    }
    if (identifiers.has(entry.id)) {
      throw new Error(`Duplicate Notebook identifier: ${entry.id}.`);
    }
    if (slugs.has(entry.slug)) {
      throw new Error(`Duplicate Notebook slug: ${entry.slug}.`);
    }
    identifiers.add(entry.id);
    slugs.add(entry.slug);
  });
}

function requireText(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} must be a non-empty string.`);
  }
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

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;

if (invokedPath === import.meta.url) {
  packageNotebook()
    .then(result => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`))
    .catch(error => {
      process.stderr.write(`Notebook packaging failed: ${error.message}\n`);
      process.exitCode = 1;
    });
}

