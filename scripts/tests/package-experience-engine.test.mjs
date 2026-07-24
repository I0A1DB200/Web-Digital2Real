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
const experienceSource = new URL(
  "../../experience-engine/experiences/siemens/EE-0002-drive-reset/experience.yaml",
  import.meta.url
);

async function createRepository({ published = false } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "d2r-package-"));
  const playerDirectory = path.join(root, "experience-engine", "player");
  const experienceDirectory = path.join(root, "experience-engine", "experiences", "vendor", "experience");
  await mkdir(playerDirectory, { recursive: true });
  await mkdir(experienceDirectory, { recursive: true });
  await mkdir(path.join(root, "Frontend"), { recursive: true });
  await cp(playerSource, path.join(playerDirectory, "experiencePlayer.js"));

  let yaml = await readFile(experienceSource, "utf8");
  if (published) {
    yaml = yaml
      .replaceAll("status: technical_review", "status: published")
      .replace("status: pass_with_warnings", "status: pass");
  }
  await writeFile(path.join(experienceDirectory, "experience.yaml"), yaml, "utf8");
  return root;
}

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
    path.join(root, "experience-engine", "experiences", "vendor", "experience", "experience.yaml"),
    "experience:\n   id: invalid\n  broken: true\n",
    "utf8"
  );

  await assert.rejects(() => packageExperienceEngine({ repositoryRoot: root, mode: "preview" }));
  assert.equal(await readFile(sentinel, "utf8"), "preserved");
});

test("repository fixture remains available", async () => {
  await access(repositoryRoot);
});
