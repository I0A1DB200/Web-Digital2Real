import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
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
  "../../../content/experiences/sensors/EE-0009-photoelectric-sensor-misalignment/",
  import.meta.url
);
const capabilityUrl = new URL(
  "../../../docs/04-capabilities/ICF-02-industrial-io/capability.yaml",
  import.meta.url
);
const readYaml = async relative => parseExperienceYaml(
  await readFile(new URL(relative, directory), "utf8")
);
const clone = value => JSON.parse(JSON.stringify(value));
const artifactNames = Object.freeze([
  "ART-001-machine-overview.png",
  "ART-002-sensor-close-up.png",
  "ART-003-electrical-drawing.png",
  "ART-004-plc-watch-table.png",
  "ART-005-hmi-overview.png",
  "ART-006-mechanical-evidence.png",
  "ART-007-recovery-verification.png"
]);

test("ICF-02 owns exactly the three approved canonical competencies", async () => {
  const capability = parseExperienceYaml(await readFile(capabilityUrl, "utf8"));
  assert.equal(capability.id, "ICF-02");
  assert.deepEqual(capability.competencies.map(item => item.id), [
    "COMP-IIO-SIGNAL-TRACEABILITY",
    "COMP-IIO-STATE-INTERPRETATION",
    "COMP-IIO-CONTROLLED-RECOVERY"
  ]);
  capability.competencies.forEach(item => {
    assert.ok(item.title.es);
    assert.ok(item.title.en);
    assert.ok(item.definition.es);
    assert.ok(item.definition.en);
    assert.equal(item.observable_behaviors.length, 5);
  });
});

test("EE-0009 is valid Authoring v1 with governed ICF-02 competencies", async () => {
  const authoring = await readYaml("experience.yaml");
  const result = validateExperienceDefinition(authoring);

  assert.equal(result.valid, true);
  assert.equal(authoring.metadata.class, "practice");
  assert.equal(authoring.metadata.status, "technical_review");
  assert.deepEqual(authoring.capability_references, [{
    capability_id: "ICF-02",
    competency_ids: [
      "COMP-IIO-SIGNAL-TRACEABILITY",
      "COMP-IIO-STATE-INTERPRETATION",
      "COMP-IIO-CONTROLLED-RECOVERY"
    ]
  }]);
  assert.equal(authoring.public.stages.length, 10);
  assert.equal(authoring.public.decisions.length, 25);
  assert.equal(authoring.public.visual.assets.length, 7);
});

test("EE-0009 localization is complete in ES and EN with Spanish fallback", async () => {
  const authoring = await readYaml("experience.yaml");
  const es = await readYaml("locales/es.yaml");
  const en = await readYaml("locales/en.yaml");
  const spanish = resolveExperienceLocalization(authoring, es);
  const english = resolveExperienceLocalization(authoring, en);

  assert.equal(spanish.public.title, "Desalineación de sensor fotoeléctrico");
  assert.equal(english.public.title, "Photoelectric Sensor Misalignment");
  assert.equal(english.public.stages.length, 10);
  assert.equal(english.public.decisions.length, 25);
  assert.equal(selectLocaleDocument("de", { es, en }, "es").locale, "es");
});

test("EE-0009 normalizes and packages deterministically without private data", async () => {
  const authoring = await readYaml("experience.yaml");
  const before = clone(authoring);
  const normalized = normalizeExperienceDefinition(authoring);
  const runtimeValidation = validateNormalizedExperience(normalized.value);
  const first = packageExperience(authoring);
  const second = packageExperience(clone(authoring));

  assert.equal(normalized.ok, true);
  assert.equal(runtimeValidation.valid, true);
  assert.equal(validateGeneratedWebArtifact(first).valid, true);
  assert.deepEqual(authoring, before);
  assert.deepEqual(second, first);
  assert.equal(Object.isFrozen(normalized.value), true);
  assert.equal(Object.isFrozen(first), true);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(first)));

  const forbidden = new Set([
    "private", "scoring", "score_effect", "rationale", "consequence",
    "decision_logic", "fault_model", "diagnostic_model", "correct_answer"
  ]);
  walk(first, key => assert.equal(forbidden.has(key), false, key));
});

test("EE-0009 reveals ART-006 and ART-007 only in their governed stages", async () => {
  const artifact = packageExperience(await readYaml("experience.yaml"));
  const player = new ExperiencePlayer({ experience: artifact });
  player.start();
  player.continue();

  const seen = [];
  while (player.getState().interaction !== "completion") {
    const state = player.getState();
    seen.push({
      stage: state.currentStage.id,
      media: state.media.map(item => item.id)
    });
    if (state.interaction === "stage" && state.currentStage.decisions.length) {
      player.selectDecision(state.currentStage.decisions[0].id);
    }
    player.continue();
  }

  assert.equal(seen.find(item => item.media.includes("ART-006")).stage, "STAGE-08-MECHANICAL");
  assert.equal(seen.find(item => item.media.includes("ART-007")).stage, "STAGE-10-VERIFICATION");
  assert.equal(player.getState().completion.title, "Debrief técnico");
  assert.equal(player.getState().decisionHistory.length, 9);
});

test("EE-0009 has seven resolved byte-identical approved assets and no orphan", async () => {
  const authoring = await readYaml("experience.yaml");
  const referenced = authoring.public.visual.assets.map(asset => path.basename(asset.src));
  assert.deepEqual(referenced.sort(), [...artifactNames].sort());

  for (const name of artifactNames) {
    const source = await readFile(new URL(`media/${name}`, directory));
    const derived = await readFile(new URL(`assets/${name}`, directory));
    assert.deepEqual(derived, source, name);
    assert.equal(derived.subarray(1, 4).toString("ascii"), "PNG", name);
  }
  await access(new URL("README.md", directory));
});

test("EE-0009 introduces no ID-specific runtime, packaging, Player, or Frontend logic", async () => {
  const sources = await Promise.all([
    readFile(new URL("../experiencePackagingPipeline.js", import.meta.url), "utf8"),
    readFile(new URL("../../normalization/experienceDefinitionNormalizer.js", import.meta.url), "utf8"),
    readFile(new URL("../../projection/runtimeToWebArtifactProjector.js", import.meta.url), "utf8"),
    readFile(new URL("../../player/experiencePlayer.js", import.meta.url), "utf8"),
    readFile(new URL("../../../scripts/package-experience-engine.mjs", import.meta.url), "utf8"),
    readFile(new URL("../../../Frontend/products/experience-engine/components/experienceWorkspace.js", import.meta.url), "utf8")
  ]);
  sources.forEach(source => assert.doesNotMatch(source, /EE-0009|EXP-SENSOR-PHOTOELECTRIC-009/));
});

function walk(value, visitKey) {
  if (Array.isArray(value)) return value.forEach(item => walk(item, visitKey));
  if (!value || typeof value !== "object") return;
  Object.entries(value).forEach(([key, item]) => {
    visitKey(key);
    walk(item, visitKey);
  });
}
