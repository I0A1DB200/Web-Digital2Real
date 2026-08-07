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

test("preview packages only the remaining canonical Experience", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));

  const result = await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });
  const generatedRoot = path.join(root, "Frontend", "generated", "experience-engine");
  const catalog = await readJson(path.join(generatedRoot, "catalog.json"));

  assert.deepEqual(result.packaged, ["EXP-SENSOR-PHOTOELECTRIC-009"]);
  assert.deepEqual(result.skipped, [{
    file: "content/experiences/siemens/exp-sie-pn-001-cpu-stop-after-power-loss/experience.yaml",
    reason: "publication_state"
  }]);
  assert.equal(catalog.experiences.length, 1);
  const remaining = catalog.experiences[0];
  assert.equal(remaining.id, "EXP-SENSOR-PHOTOELECTRIC-009");
  assert.equal(remaining.locales.es, "experiences/EXP-SENSOR-PHOTOELECTRIC-009.es.json");
  assert.equal(remaining.locales.en, "experiences/EXP-SENSOR-PHOTOELECTRIC-009.en.json");
  assert.equal(remaining.localizedMetadata.en.title, "Photoelectric Sensor Misalignment");
  await access(path.join(generatedRoot, remaining.locales.es));
  await access(path.join(generatedRoot, remaining.locales.en));
  await assert.rejects(access(path.join(generatedRoot, "media-source")));
  await access(path.join(generatedRoot, "player", "experiencePlayer.js"));
});

test("published browser files contain no reserved runtime data or authoring document", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));
  await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });

  const generatedRoot = path.join(root, "Frontend", "generated", "experience-engine");
  const artifactText = await readFile(
    path.join(generatedRoot, "experiences", "EXP-SENSOR-PHOTOELECTRIC-009.es.json"),
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
    "sensors",
    "EE-0009-photoelectric-sensor-misalignment",
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
  assert.deepEqual(preview.packaged, ["EXP-SENSOR-PHOTOELECTRIC-009"]);
});

test("catalog modes enforce the complete approved publication-state boundary", async t => {
  const scenarios = [
    { status: "technical_review", validation: "pass_with_warnings", preview: true, publish: false },
    { status: "approved", validation: "pass", preview: true, publish: false },
    { status: "published", validation: "pass", preview: true, publish: true },
    { status: "published", validation: "pass_with_warnings", preview: true, publish: false }
  ];

  for (const scenario of scenarios) {
    const root = await createRepository();
    t.after(() => rm(root, { recursive: true, force: true }));
    const source = path.join(
      root,
      "content",
      "experiences",
      "sensors",
      "EE-0009-photoelectric-sensor-misalignment",
      "experience.yaml"
    );
    const authoring = (await readFile(source, "utf8"))
      .replace('  status: "technical_review"', `  status: "${scenario.status}"`)
      .replace('    status: "pass_with_warnings"', `    status: "${scenario.validation}"`);
    await writeFile(source, authoring, "utf8");

    const preview = await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });
    const publish = await packageExperienceEngine({ repositoryRoot: root, mode: "publish" });
    assert.equal(
      preview.packaged.includes("EXP-SENSOR-PHOTOELECTRIC-009"),
      scenario.preview,
      `preview/${scenario.status}/${scenario.validation}`
    );
    assert.equal(
      publish.packaged.includes("EXP-SENSOR-PHOTOELECTRIC-009"),
      scenario.publish,
      `publish/${scenario.status}/${scenario.validation}`
    );
  }
});

test("duplicate identifiers fail and no legacy fallback is used", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = path.join(
    root,
    "content",
    "experiences",
    "sensors",
    "EE-0009-photoelectric-sensor-misalignment"
  );
  await cp(
    source,
    path.join(root, "content", "experiences", "sensors", "EE-9999-duplicate-package"),
    { recursive: true }
  );

  await assert.rejects(
    packageExperienceEngine({ repositoryRoot: root, mode: "preview" }),
    /Duplicate experience identifier/
  );
  await rm(path.join(root, "content", "experiences"), { recursive: true, force: true });
  await assert.rejects(packageExperienceEngine({ repositoryRoot: root, mode: "preview" }));
});
