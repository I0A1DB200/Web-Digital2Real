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
const expectedArtifactUrl = new URL(
  "../../experience-engine/packaging/fixtures/ee0002-generated-web-artifact-v1.json",
  import.meta.url
);
const reservedTerms = [
  "root_cause",
  "scoring",
  "correct_answer",
  "rationale",
  "consequence",
  "debrief",
  "fault_model",
  "diagnostic_model"
];

async function createRepository() {
  const root = await mkdtemp(path.join(os.tmpdir(), "digital2real-package-"));
  await cp(new URL("../../experience-engine/", import.meta.url), path.join(root, "experience-engine"), {
    recursive: true
  });
  await cp(new URL("../../content/experiences/", import.meta.url), path.join(root, "content", "experiences"), {
    recursive: true
  });
  await mkdir(path.join(root, "Frontend", "generated"), { recursive: true });
  return root;
}

async function readJson(location) {
  return JSON.parse(await readFile(location, "utf8"));
}

test("preview packages EE-0002 exclusively as its exact Generated Web Artifact", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));

  const result = await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });
  const generatedRoot = path.join(root, "Frontend", "generated", "experience-engine");
  const artifact = await readJson(
    path.join(generatedRoot, "experiences", "EXP-SIEMENS-DRIVE-002.json")
  );
  const expected = await readJson(expectedArtifactUrl);
  const catalog = await readJson(path.join(generatedRoot, "catalog.json"));

  assert.deepEqual(result.packaged, ["EXP-SIEMENS-DRIVE-002"]);
  assert.deepEqual(result.skipped, [{
    file: "content/experiences/siemens/exp-sie-pn-001-cpu-stop-after-power-loss/experience.yaml",
    reason: "publication_state"
  }]);
  assert.deepEqual(artifact, expected);
  assert.deepEqual(catalog.experiences, [{
    id: "EXP-SIEMENS-DRIVE-002",
    class: "learning",
    title: "Drive reset after emergency stop",
    summary: "Diagnose why an infeed conveyor does not restart after an emergency-stop release even though its run command remains active.",
    estimatedDuration: 35,
    path: "experiences/EXP-SIEMENS-DRIVE-002.json"
  }]);
  await access(path.join(generatedRoot, "player", "experiencePlayer.js"));
});

test("published browser files contain no reserved runtime data or authoring document", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));
  await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });

  const generatedRoot = path.join(root, "Frontend", "generated", "experience-engine");
  const artifactText = await readFile(
    path.join(generatedRoot, "experiences", "EXP-SIEMENS-DRIVE-002.json"),
    "utf8"
  );
  const playerText = await readFile(path.join(generatedRoot, "player", "experiencePlayer.js"), "utf8");
  const browserPayload = `${artifactText}\n${playerText}`;

  reservedTerms.forEach(term => assert.equal(browserPayload.includes(term), false, term));
  assert.equal(browserPayload.includes("contract_version"), false);
  assert.equal(browserPayload.includes("runtime_contract_version"), false);
  assert.equal(browserPayload.includes("technical_validation"), false);
});

test("packaging is deterministic and removes obsolete browser artifacts", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));
  const target = path.join(root, "Frontend", "generated", "experience-engine");

  const first = await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });
  const firstCatalog = await readFile(path.join(target, "catalog.json"), "utf8");
  await writeFile(path.join(target, "obsolete.json"), "obsolete", "utf8");
  const second = await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });
  const secondCatalog = await readFile(path.join(target, "catalog.json"), "utf8");

  assert.deepEqual(second, first);
  assert.equal(secondCatalog, firstCatalog);
  await assert.rejects(access(path.join(target, "obsolete.json")));
});

test("a validation failure preserves the previous generated package", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));
  const target = path.join(root, "Frontend", "generated", "experience-engine");
  await mkdir(target, { recursive: true });
  await writeFile(path.join(target, "sentinel.txt"), "preserve", "utf8");

  const source = path.join(
    root,
    "content",
    "experiences",
    "siemens",
    "EE-0002-drive-reset",
    "experience.yaml"
  );
  const invalid = (await readFile(source, "utf8")).replace(
    'contract_version: "1.0.0"',
    'contract_version: "unsupported"'
  );
  await writeFile(source, invalid, "utf8");

  await assert.rejects(
    packageExperienceEngine({ repositoryRoot: root, mode: "preview" })
  );
  assert.equal(await readFile(path.join(target, "sentinel.txt"), "utf8"), "preserve");
});

test("publish excludes a technical-review experience while preview includes it", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));

  const publish = await packageExperienceEngine({ repositoryRoot: root, mode: "publish" });
  const preview = await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });

  assert.deepEqual(publish.packaged, []);
  assert.equal(publish.skipped[0].reason, "publication_state");
  assert.deepEqual(preview.packaged, ["EXP-SIEMENS-DRIVE-002"]);
});

test("duplicate identifiers fail and no legacy fallback is used", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = path.join(
    root,
    "content",
    "experiences",
    "siemens",
    "EE-0002-drive-reset"
  );
  await cp(source, path.join(root, "content", "experiences", "duplicate"), { recursive: true });

  await assert.rejects(
    packageExperienceEngine({ repositoryRoot: root, mode: "preview" }),
    /Duplicate experience identifier/
  );
  await rm(path.join(root, "content", "experiences"), { recursive: true, force: true });
  await assert.rejects(packageExperienceEngine({ repositoryRoot: root, mode: "preview" }));
});

test("the repository Generated Web Artifact fixture remains available", async () => {
  await access(expectedArtifactUrl);
});
