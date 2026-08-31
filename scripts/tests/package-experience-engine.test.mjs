import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
  await cp(new URL("../../content/environments/", import.meta.url), path.join(root, "content", "environments"), {
    recursive: true
  });
  await mkdir(path.join(root, "Frontend", "generated"), { recursive: true });
  return root;
}

async function readJson(location) {
  return JSON.parse(await readFile(location, "utf8"));
}

async function sha256(location) {
  return createHash("sha256").update(await readFile(location)).digest("hex");
}

test("preview packages every eligible canonical Experience", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));

  const result = await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });
  const generatedRoot = path.join(root, "Frontend", "generated", "experience-engine");
  const catalog = await readJson(path.join(generatedRoot, "catalog.json"));

  assert.deepEqual(result.packaged, ["EXP-SENSOR-SIGNAL-001"]);
  assert.deepEqual(result.environments, ["ENV-001", "ENV-002", "ENV-003"]);
  assert.equal(result.skipped.length, 2);
  assert.equal(catalog.experiences.length, 1);
  const remaining = catalog.experiences[0];
  assert.equal(remaining.id, "EXP-SENSOR-SIGNAL-001");
  assert.equal(remaining.editorialId, "EE-0001");
  assert.equal(remaining.access, "free");
  assert.equal(remaining.locales.es, "experiences/EXP-SENSOR-SIGNAL-001.es.json");
  assert.equal(remaining.locales.en, "experiences/EXP-SENSOR-SIGNAL-001.en.json");
  assert.equal(catalog.environments.length, 3);
  assert.deepEqual(catalog.environments[0].hotspots, [{
    experienceEditorialId: "EE-0001",
    x: 8.6,
    y: 36.8
  }]);
  assert.deepEqual(catalog.environments[0].theory, {
    defaultLocale: "es",
    sectionIds: ["TH-01-DIGITAL-SIGNAL-PATH", "TH-02-PNP-REFERENCE", "TH-03-OBSERVATION-BOUNDARIES"],
    locales: {
      es: "environments/ENV-001/theory.es.json",
      en: "environments/ENV-001/theory.en.json"
    }
  });
  assert.equal(catalog.environments[0].contractVersion, "2.0.0");
  assert.equal(catalog.environments[1].contractVersion, "1.0.0");
  const theoryEs = await readJson(path.join(generatedRoot, catalog.environments[0].theory.locales.es));
  const theoryEn = await readJson(path.join(generatedRoot, catalog.environments[0].theory.locales.en));
  assert.deepEqual(theoryEs.sections.map(item => item.id), theoryEn.sections.map(item => item.id));
  assert.match(theoryEs.sections[0].title, /sensor/i);
  assert.match(theoryEn.sections[0].title, /sensor/i);
  assert.equal(theoryEs.media.length, 1);
  await access(path.join(generatedRoot, theoryEs.media[0].src));
  assert.equal(Object.hasOwn(catalog.environments[1], "theory"), false);
  assert.equal(catalog.environments[1].hotspots.length, 0);
  assert.equal(catalog.environments[2].hotspots.length, 0);
  for (const environment of catalog.environments) {
    assert.equal(environment.capacity, 10);
    assert.equal(environment.width, 1672);
    assert.equal(environment.height, 941);
    assert.equal(Object.hasOwn(environment, "summary"), false);
    assert.equal(Object.hasOwn(environment, "access"), false);
    assert.equal(Object.hasOwn(environment, "completed"), false);
    const generatedImage = path.join(generatedRoot, environment.background);
    const sourceImage = path.join(
      root,
      "content",
      "environments",
      `${environment.id}-${environment.slug}`,
      "media",
      path.basename(environment.background)
    );
    assert.equal(await sha256(generatedImage), await sha256(sourceImage));
  }
  assert.equal(catalog.experiences.some(item => item.editorialId === "EE-0009"), false);
  await access(path.join(
    root,
    "content",
    "experiences",
    "sensors",
    "EE-0009-photoelectric-sensor-misalignment",
    "experience.yaml"
  ));
  await assert.rejects(access(path.join(
    generatedRoot,
    "experiences",
    "EXP-SENSOR-PHOTOELECTRIC-009.es.json"
  )));
  await access(path.join(generatedRoot, remaining.locales.es));
  await access(path.join(generatedRoot, remaining.locales.en));
  await assert.rejects(access(path.join(generatedRoot, "media-source")));
  await access(path.join(generatedRoot, "player", "experiencePlayer.js"));
  await access(path.join(generatedRoot, "evaluation", "experienceEvaluator.js"));
});

test("published browser files contain no reserved runtime data or authoring document", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));
  await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });

  const generatedRoot = path.join(root, "Frontend", "generated", "experience-engine");
  const artifactText = await readFile(
    path.join(generatedRoot, "experiences", "EXP-SENSOR-SIGNAL-001.es.json"),
    "utf8"
  );
  const playerText = await readFile(path.join(generatedRoot, "player", "experiencePlayer.js"), "utf8");
  const evaluatorText = await readFile(path.join(generatedRoot, "evaluation", "experienceEvaluator.js"), "utf8");
  const browserPayload = `${artifactText}\n${playerText}\n${evaluatorText}`;

  assert.match(playerText, /\.\.\/evaluation\/experienceEvaluator\.js/);

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

  const source = path.join(root, "content", "environments", "ENV-001-automated-factory", "theory.yaml");
  const original = await readFile(source, "utf8");
  const invalid = original.replace(
    /version:\s*"[^"]+"/u,
    'version: "unsupported"'
  );
  assert.notEqual(invalid, original, "The Theory fixture version must be invalidated.");
  await writeFile(source, invalid, "utf8");

  await assert.rejects(
    packageExperienceEngine({ repositoryRoot: root, mode: "preview" })
  );
  assert.equal(await readFile(path.join(target, "sentinel.txt"), "utf8"), "preserve");
});

test("publish excludes technical-review experiences while preview includes them", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = path.join(
    root,
    "content",
    "experiences",
    "sensors",
    "EE-0001-sensor-on-plc-input-off",
    "experience.yaml"
  );
  const authoring = (await readFile(source, "utf8"))
    .replace('  status: "published"', '  status: "technical_review"')
    .replace('    status: "pass"', '    status: "pass_with_warnings"');
  await writeFile(source, authoring, "utf8");

  const publish = await packageExperienceEngine({ repositoryRoot: root, mode: "publish" });
  const preview = await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });

  assert.deepEqual(publish.packaged, []);
  assert.equal(publish.skipped[0].reason, "publication_state");
  assert.deepEqual(preview.packaged, ["EXP-SENSOR-SIGNAL-001"]);
  assert.deepEqual(preview.environments, ["ENV-001", "ENV-002", "ENV-003"]);
  assert.deepEqual(publish.environments, []);
});

test("Theory packaging copies only media referenced by canonical sections", async t => {
  const root = await createRepository();
  t.after(() => rm(root, { recursive: true, force: true }));
  const environmentRoot = path.join(root, "content", "environments", "ENV-001-automated-factory");
  await cp(path.join(environmentRoot, "media", "ENV-001-automated-factory.png"), path.join(environmentRoot, "media", "unused.png"));
  const theoryFile = path.join(environmentRoot, "theory.yaml");
  const source = await readFile(theoryFile, "utf8");
  await writeFile(theoryFile, source.replace("\nsections:", "\n  - id: \"TH-MEDIA-UNUSED\"\n    type: \"image\"\n    src: \"media/unused.png\"\n    alt: \"Unused declared media\"\n\nsections:"), "utf8");

  await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });
  await assert.rejects(access(path.join(root, "Frontend", "generated", "experience-engine", "environments", "ENV-001", "media", "unused.png")));
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
      "EE-0001-sensor-on-plc-input-off",
      "experience.yaml"
    );
    const authoring = (await readFile(source, "utf8"))
      .replace('  status: "published"', `  status: "${scenario.status}"`)
      .replace('    status: "pass"', `    status: "${scenario.validation}"`);
    await writeFile(source, authoring, "utf8");

    const preview = await packageExperienceEngine({ repositoryRoot: root, mode: "preview" });
    const publish = await packageExperienceEngine({ repositoryRoot: root, mode: "publish" });
    assert.equal(
      preview.packaged.includes("EXP-SENSOR-SIGNAL-001"),
      scenario.preview,
      `preview/${scenario.status}/${scenario.validation}`
    );
    assert.equal(
      publish.packaged.includes("EXP-SENSOR-SIGNAL-001"),
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
    "EE-0001-sensor-on-plc-input-off"
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
