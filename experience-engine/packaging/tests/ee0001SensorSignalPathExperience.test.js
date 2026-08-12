import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization, selectLocaleDocument } from "../../localization/experienceLocalization.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { ExperiencePlayer } from "../../player/experiencePlayer.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";
import { validateNormalizedExperience } from "../../validation/normalizedExperienceValidator.js";
import { packageExperience } from "../experiencePackagingPipeline.js";

const directory = new URL(
  "../../../content/experiences/sensors/EE-0001-sensor-on-plc-input-off/",
  import.meta.url
);
const readYaml = async relative => parseExperienceYaml(
  await readFile(new URL(relative, directory), "utf8")
);
const clone = value => JSON.parse(JSON.stringify(value));
const artifactNames = Object.freeze([
  "ART-001-machine-overview.png",
  "ART-002-sensor-b1-close-up.png",
  "ART-003-electrical-schematic.png",
  "ART-004-plc-watch-table.png",
  "ART-005-signal-voltage-measurement.png",
  "ART-006-continuity-test.png",
  "ART-007-wire-damage-location.png",
  "ART-008-recovery-verification.png"
]);

test("EE-0001 is valid Authoring v1 with governed ICF-02 competencies", async () => {
  const authoring = await readYaml("experience.yaml");
  const result = validateExperienceDefinition(authoring);

  assert.equal(result.valid, true);
  assert.equal(authoring.metadata.id, "EXP-SENSOR-SIGNAL-001");
  assert.equal(authoring.metadata.status, "technical_review");
  assert.deepEqual(authoring.capability_references, [{
    capability_id: "ICF-02",
    competency_ids: [
      "COMP-IIO-SIGNAL-TRACEABILITY",
      "COMP-IIO-STATE-INTERPRETATION",
      "COMP-IIO-CONTROLLED-RECOVERY"
    ]
  }]);
  assert.equal(authoring.public.stages.length, 8);
  assert.equal(authoring.public.decisions.length, 21);
  assert.equal(authoring.public.evidence.length, 8);
  assert.equal(authoring.public.visual.assets.length, 8);
});

test("EE-0001 localization is complete in ES and EN with Spanish fallback", async () => {
  const authoring = await readYaml("experience.yaml");
  const es = await readYaml("locales/es.yaml");
  const en = await readYaml("locales/en.yaml");
  const spanish = resolveExperienceLocalization(authoring, es);
  const english = resolveExperienceLocalization(authoring, en);

  assert.equal(spanish.public.title, "Sensor ON, entrada PLC OFF");
  assert.equal(english.public.title, "Sensor ON, PLC Input OFF");
  assert.equal(english.public.stages.length, 8);
  assert.equal(english.public.decisions.length, 21);
  assert.equal(selectLocaleDocument("de", { es, en }, "es").locale, "es");
  for (const identifier of ["B1", "BK", "X1:17", "I0.3", "Tag_BoxPresent_B1"]) {
    assert.match(JSON.stringify(spanish), new RegExp(identifier.replace(".", "\\.")));
    assert.match(JSON.stringify(english), new RegExp(identifier.replace(".", "\\.")));
  }
});

test("EE-0001 normalizes, validates and packages deterministically without private data", async () => {
  const authoring = await readYaml("experience.yaml");
  const before = clone(authoring);
  const normalized = normalizeExperienceDefinition(authoring);
  const first = packageExperience(authoring);
  const second = packageExperience(clone(authoring));

  assert.equal(normalized.ok, true);
  assert.equal(validateNormalizedExperience(normalized.value).valid, true);
  assert.equal(validateGeneratedWebArtifact(first).valid, true);
  assert.deepEqual(authoring, before);
  assert.deepEqual(second, first);
  assert.equal(Object.isFrozen(first), true);

  const serialized = JSON.stringify(first);
  for (const forbidden of [
    '"private"', '"scoring"', '"score_effect"', '"rationale"',
    '"fault_model"', '"diagnostic_model"', '"correct_answer"'
  ]) assert.doesNotMatch(serialized, new RegExp(forbidden));
  assert.doesNotMatch(first.public.stages.slice(0, 6).map(item => item.situation).join(" "), /cortad|cut conductor|physical damage/i);
});

test("EE-0001 reveals every artifact only in its governed stage and completes in Player", async () => {
  const artifact = packageExperience(await readYaml("experience.yaml"));
  const player = new ExperiencePlayer({ experience: artifact });
  player.start();
  player.continue();

  const seen = [];
  while (player.getState().interaction !== "completion") {
    const state = player.getState();
    seen.push({ stage: state.currentStage.id, media: state.media.map(item => item.id) });
    if (state.interaction === "stage" && state.currentStage.decisions.length) {
      player.selectDecision(state.currentStage.decisions[0].id);
    }
    player.continue();
  }

  artifactNames.forEach((name, index) => {
    const id = `ART-${String(index + 1).padStart(3, "0")}`;
    assert.equal(seen.find(item => item.media.includes(id)).stage, artifact.public.stages[index].id);
  });
  assert.equal(player.getState().completion.title, "Debrief técnico");
  assert.equal(player.getState().decisionHistory.length, 7);
});

test("EE-0001 has eight byte-identical approved assets, no orphan and no discarded variant", async () => {
  const authoring = await readYaml("experience.yaml");
  const referenced = authoring.public.visual.assets.map(asset => path.basename(asset.src)).sort();
  assert.deepEqual(referenced, [...artifactNames].sort());
  assert.deepEqual((await readdir(new URL("media/", directory))).sort(), [...artifactNames].sort());
  assert.deepEqual((await readdir(new URL("assets/", directory))).sort(), [...artifactNames].sort());

  for (const name of artifactNames) {
    assert.deepEqual(
      await readFile(new URL(`assets/${name}`, directory)),
      await readFile(new URL(`media/${name}`, directory)),
      name
    );
  }
});

test("EE-0001 introduces no ID-specific engine, packaging, Player or Frontend logic", async () => {
  const sources = await Promise.all([
    readFile(new URL("../experiencePackagingPipeline.js", import.meta.url), "utf8"),
    readFile(new URL("../../normalization/experienceDefinitionNormalizer.js", import.meta.url), "utf8"),
    readFile(new URL("../../projection/runtimeToWebArtifactProjector.js", import.meta.url), "utf8"),
    readFile(new URL("../../player/experiencePlayer.js", import.meta.url), "utf8"),
    readFile(new URL("../../../scripts/package-experience-engine.mjs", import.meta.url), "utf8"),
    readFile(new URL("../../../Frontend/products/experience-engine/components/experienceWorkspace.js", import.meta.url), "utf8")
  ]);
  sources.forEach(source => assert.doesNotMatch(source, /EE-0001|EXP-SENSOR-SIGNAL-001/));
});
