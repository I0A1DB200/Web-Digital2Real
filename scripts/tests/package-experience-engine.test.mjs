import assert from "node:assert/strict";
import {
  access,
  cp,
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { packageExperienceEngine } from "../package-experience-engine.mjs";

const repositoryRoot = new URL("../../", import.meta.url);
const playerSource = new URL("../../experience-engine/player/experiencePlayer.js", import.meta.url);
const canonicalExperienceSource = new URL(
  "../../content/experiences/siemens/EE-0002-drive-reset/experience.yaml",
  import.meta.url
);

async function readRepositoryExperience() {
  return readFile(canonicalExperienceSource, "utf8");
}

async function createRepository({ published = false, includeExperiences = true } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "d2r-package-"));
  const playerDirectory = path.join(root, "experience-engine", "player");
  const experienceDirectory = path.join(
    root,
    "content",
    "experiences",
    "vendor",
    "experience"
  );
  await mkdir(playerDirectory, { recursive: true });
  await mkdir(path.join(root, "Frontend"), { recursive: true });
  await cp(playerSource, path.join(playerDirectory, "experiencePlayer.js"));

  if (includeExperiences) {
    await mkdir(experienceDirectory, { recursive: true });
    let yaml = await readRepositoryExperience();
    if (published) {
      yaml = yaml
        .replaceAll("status: technical_review", "status: published")
        .replace("status: pass_with_warnings", "status: pass");
    }
    await writeFile(path.join(experienceDirectory, "experience.yaml"), yaml, "utf8");
  }
  return root;
}

test("packages the canonical content experience source", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));

  const result = await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });

  assert.deepEqual(result.packaged, ["EXP-SIEMENS-DRIVE-002"]);
});

test("rejects duplicate identifiers within the canonical source", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));
  const duplicateDirectory = path.join(
    root,
    "content",
    "experiences",
    "vendor",
    "duplicate"
  );
  await mkdir(duplicateDirectory, { recursive: true });
  await writeFile(
    path.join(duplicateDirectory, "experience.yaml"),
    await readRepositoryExperience(),
    "utf8"
  );

  await assert.rejects(
    () => packageExperienceEngine({ repositoryRoot: root, mode: "preview" }),
    /Duplicate experience identifier: EXP-SIEMENS-DRIVE-002/
  );
});

test("fails when the canonical experience root is missing without using a legacy fallback", async t => {
  const root = await createRepository({ includeExperiences: false });
  t.after(() => rm(root, { recursive: true, force: true }));
  const legacyDirectory = path.join(
    root,
    "experience-engine",
    "experiences",
    "vendor",
    "experience"
  );
  await mkdir(legacyDirectory, { recursive: true });
  await writeFile(
    path.join(legacyDirectory, "experience.yaml"),
    await readRepositoryExperience(),
    "utf8"
  );

  await assert.rejects(
    () => packageExperienceEngine({ repositoryRoot: root, mode: "preview" }),
    error => error.code === "ENOENT"
  );
});

test("preview packages review content and browser runtime deterministically", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));
  const catalogPath = path.join(root, "Frontend", "generated", "experience-engine", "catalog.json");

  const first = await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });
  const firstCatalog = await readFile(catalogPath, "utf8");
  const second = await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });

  assert.deepEqual(first.packaged, ["EXP-SIEMENS-DRIVE-002"]);
  assert.deepEqual(second.packaged, first.packaged);
  assert.equal(await readFile(catalogPath, "utf8"), firstCatalog);
  await access(path.join(root, "Frontend", "generated", "experience-engine", "player", "experiencePlayer.js"));
  await access(path.join(root, "Frontend", "generated", "experience-engine", "experiences", "EXP-SIEMENS-DRIVE-002.json"));
});

test("cleans obsolete published artifacts before replacement", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));
  const obsolete = path.join(root, "Frontend", "generated", "experience-engine", "obsolete.json");
  await mkdir(path.dirname(obsolete), { recursive: true });
  await writeFile(obsolete, "obsolete", "utf8");

  await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });

  await assert.rejects(() => access(obsolete));
});

test("publish excludes review content and includes passing published content", async t => {
  const reviewRoot = await createRepository();
  const publishedRoot = await createRepository({ published: true });
  t.after(() => Promise.all([
    rm(reviewRoot, { recursive: true, force: true }),
    rm(publishedRoot, { recursive: true, force: true })
  ]));

  const review = await packageExperienceEngine({ repositoryRoot: reviewRoot, mode: "publish" });
  const published = await packageExperienceEngine({ repositoryRoot: publishedRoot, mode: "publish" });

  assert.deepEqual(review.packaged, []);
  assert.deepEqual(published.packaged, ["EXP-SIEMENS-DRIVE-002"]);
});

test("validation failure preserves the previous generated package", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));
  await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });
  const target = path.join(root, "Frontend", "generated", "experience-engine");
  const sentinel = path.join(target, "preserved.txt");
  await writeFile(sentinel, "preserved", "utf8");
  await writeFile(
    path.join(root, "content", "experiences", "vendor", "experience", "experience.yaml"),
    "experience:\n   id: invalid\n  broken: true\n",
    "utf8"
  );

  await assert.rejects(() => packageExperienceEngine({ repositoryRoot: root, mode: "preview" }));
  assert.equal(await readFile(sentinel, "utf8"), "preserved");
});

test("repository fixture remains available", async () => {
  await access(repositoryRoot);
});
