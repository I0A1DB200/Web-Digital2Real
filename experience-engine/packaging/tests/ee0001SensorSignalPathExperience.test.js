import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { createEnvironmentProgressStore } from "../../../Frontend/products/experience-engine/components/environmentProgressStore.js";
import { createExperienceProgressResult } from "../../../Frontend/products/experience-engine/components/experienceWorkspace.js";
import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization, selectLocaleDocument } from "../../localization/experienceLocalization.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { ExperiencePlayer } from "../../player/experiencePlayer.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";
import { validateNormalizedExperience } from "../../validation/normalizedExperienceValidator.js";
import { packageExperience } from "../experiencePackagingPipeline.js";

const directory = new URL("../../../content/experiences/sensors/EE-0001-sensor-on-plc-input-off/", import.meta.url);
const readYaml = async relative => parseExperienceYaml(await readFile(new URL(relative, directory), "utf8"));
const clone = value => structuredClone(value);
const artifactNames = Object.freeze([
  "ART-001-machine-overview.png", "ART-002-sensor-b1-close-up.png",
  "ART-003-electrical-schematic.png", "ART-004-plc-watch-table.png",
  "ART-005-signal-voltage-measurement.png", "ART-006-continuity-test.png",
  "ART-007-wire-damage-location.png", "ART-008-recovery-verification.png"
]);

async function artifact(locale = "es") {
  const authoring = await readYaml("experience.yaml");
  return packageExperience(resolveExperienceLocalization(authoring, await readYaml(`locales/${locale}.yaml`)));
}

function runExperience(webArtifact, retryStageIds = []) {
  const player = new ExperiencePlayer({ experience: webArtifact });
  const retryStages = new Set(retryStageIds);
  const authorities = new Map(webArtifact.public.interactions.map(item => [item.action_token, item]));
  player.start(); player.continue();
  const progression = [];
  while (player.getState().interaction !== "completion") {
    const before = player.getState();
    const correct = before.currentStage.decisions.find(item => authorities.get(item.action_token).outcome === "advance");
    const incorrect = before.currentStage.decisions.find(item => authorities.get(item.action_token).outcome === "retry");
    progression.push({ stage: before.currentStage.id, media: before.media.map(item => item.id) });
    if (retryStages.has(before.currentStage.id)) {
      const retried = player.selectDecision(incorrect.id);
      assert.equal(retried.currentStage.id, before.currentStage.id);
      assert.equal(retried.attemptsByDecision[before.currentStage.id], 1);
      assert.deepEqual(retried.unlockedEvidence, before.unlockedEvidence);
      assert.match(retried.feedback.message, /\S/);
    }
    const advanced = player.selectDecision(correct.id);
    assert.equal(advanced.attemptsByDecision[before.currentStage.id], retryStages.has(before.currentStage.id) ? 2 : 1);
  }
  return { state: player.getState(), progression };
}

function memoryStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test("EE-0001 is the single canonical Authoring V2 pilot with explicit decision points", async () => {
  const authoring = await readYaml("experience.yaml");
  const result = validateExperienceDefinition(authoring);
  assert.equal(result.valid, true);
  assert.equal(result.profile, "authoring_v2");
  assert.equal(authoring.contract_version, "2.0.0");
  assert.equal(authoring.metadata.id, "EXP-SENSOR-SIGNAL-001");
  assert.equal(authoring.metadata.status, "published");
  assert.deepEqual(authoring.public.stages.map(item => item.phase), [
    "incident", "investigation", "investigation", "investigation",
    "investigation", "investigation", "solution"
  ]);
  assert.equal(authoring.public.stages.every(stage => stage.decision_ids.length === 3), true);
  assert.equal(authoring.private.decision_logic.filter(item => item.is_correct).length, 7);
  assert.equal(authoring.private.decision_logic.filter(item => !item.is_correct).every(item =>
    item.evidence_revealed.length === 0 && typeof item.retry_feedback === "string"
  ), true);
  assert.deepEqual(authoring.private.decision_logic.filter(item => item.is_correct).map(item => item.next_stage), [
    "STAGE-03-ELECTRICAL", "STAGE-04-PLC", "STAGE-05-MEASURE",
    "STAGE-06-CONTINUITY", "STAGE-07-LOCALIZE", "STAGE-08-VERIFY", "COMPLETE"
  ]);
});

test("EE-0001 localization includes learner-safe V2 retry feedback in ES and EN", async () => {
  const authoring = await readYaml("experience.yaml");
  const es = await readYaml("locales/es.yaml");
  const en = await readYaml("locales/en.yaml");
  const spanish = resolveExperienceLocalization(authoring, es);
  const english = resolveExperienceLocalization(authoring, en);
  assert.equal(spanish.public.title, "Sensor ON, entrada PLC OFF");
  assert.equal(english.public.title, "Sensor ON, PLC Input OFF");
  assert.equal(english.public.stages.length, 7);
  assert.equal(english.public.decisions.length, 21);
  assert.match(english.private.decision_logic.find(item => item.decision_id === "DEC-01-REPLACE").retry_feedback, /^Replacing B1/);
  assert.equal(selectLocaleDocument("de", { es, en }, "es").locale, "es");
  for (const identifier of ["B1", "BK", "X1:17", "I0.3", "Tag_BoxPresent_B1"]) {
    assert.match(JSON.stringify(spanish), new RegExp(identifier.replace(".", "\\.")));
    assert.match(JSON.stringify(english), new RegExp(identifier.replace(".", "\\.")));
  }
});

test("EE-0001 validates through Authoring, Runtime, projection and public security", async () => {
  const authoring = await readYaml("experience.yaml");
  const before = clone(authoring);
  const normalized = normalizeExperienceDefinition(authoring);
  const first = packageExperience(authoring);
  assert.equal(normalized.ok, true);
  assert.equal(normalized.outputProfile, "normalized_runtime_v2");
  assert.equal(validateNormalizedExperience(normalized.value).valid, true);
  assert.equal(first.web_artifact_version, "2.0.0");
  assert.equal(validateGeneratedWebArtifact(first).valid, true);
  assert.deepEqual(authoring, before);
  assert.deepEqual(packageExperience(clone(authoring)), first);
  assert.equal(Object.isFrozen(first), true);
  assert.deepEqual(Object.keys(first.public.evaluation_policy), ["provisional", "outcomes", "mastery_outcomes", "thresholds"]);
  const serialized = JSON.stringify(first);
  for (const forbidden of [
    '"private"', '"relations"', '"decision_logic"', '"is_correct"', '"retry_feedback"',
    '"classification"', '"rationale"', '"score_effect"', '"safety_effect"', '"scoring"',
    '"fault_model"', '"diagnostic_model"', '"root_cause"', '"debrief"'
  ]) assert.doesNotMatch(serialized, new RegExp(forbidden));
  assert.doesNotMatch(first.public.stages.slice(0, 4).map(item => item.situation).join(" "), /cortad|cut conductor|physical damage/i);
});

test("EE-0001 happy path unlocks evidence sequentially and completes with PASS mastery", async () => {
  const { state, progression } = runExperience(await artifact());
  assert.deepEqual(progression.map(item => item.stage), [
    "STAGE-01-OBSERVE", "STAGE-03-ELECTRICAL", "STAGE-04-PLC",
    "STAGE-05-MEASURE", "STAGE-06-CONTINUITY", "STAGE-07-LOCALIZE", "STAGE-08-VERIFY"
  ]);
  assert.deepEqual(progression.map(item => item.media), [
    ["ART-001", "ART-002"], ["ART-003"], ["ART-004"], ["ART-005"],
    ["ART-006"], ["ART-007"], ["ART-008"]
  ]);
  assert.equal(state.completionStatus, "completed");
  assert.equal(state.decisionHistory.length, 7);
  assert.deepEqual(state.evaluationResult, {
    totalDecisions: 7, firstAttemptCorrect: 7, additionalAttempts: 0,
    firstAttemptSuccessRatio: { numerator: 7, denominator: 7 },
    displayPercentage: 100, outcome: "PASS", mastered: true
  });
});

test("EE-0001 retries stay in stage, increment once and drive guided/retry outcomes", async () => {
  const webArtifact = await artifact();
  const stages = webArtifact.public.stages.map(item => item.id);
  const guided = runExperience(webArtifact, stages.slice(0, 3)).state;
  const retry = runExperience(webArtifact, stages.slice(0, 4)).state;
  assert.equal(guided.evaluationResult.outcome, "PASS_WITH_GUIDANCE");
  assert.equal(guided.evaluationResult.mastered, false);
  assert.equal(guided.evaluationResult.additionalAttempts, 3);
  assert.equal(guided.decisionHistory.length, 10);
  assert.equal(retry.evaluationResult.outcome, "RETRY_RECOMMENDED");
  assert.equal(retry.evaluationResult.mastered, false);
  assert.equal(retry.evaluationResult.additionalAttempts, 4);
  assert.equal(retry.decisionHistory.length, 11);
});

test("EE-0001 integrates with ENV Progress V2 and mastery upgrades monotonically", async () => {
  const webArtifact = await artifact();
  const stages = webArtifact.public.stages.map(item => item.id);
  const store = createEnvironmentProgressStore({ storage: memoryStorage() });
  store.registerEnvironment({
    environmentId: "ENV-001", contractVersion: "2.0.0",
    experienceIds: ["EXP-SENSOR-SIGNAL-001"], theorySectionIds: ["THEORY-01"]
  });
  const guided = runExperience(webArtifact, stages.slice(0, 3)).state;
  store.recordExperienceResult("ENV-001", "EXP-SENSOR-SIGNAL-001", createExperienceProgressResult(guided));
  assert.deepEqual(store.getEnvironmentProgress("ENV-001").experiences, { completed: 1, mastered: 0, total: 1 });
  const pass = runExperience(webArtifact).state;
  store.recordExperienceResult("ENV-001", "EXP-SENSOR-SIGNAL-001", createExperienceProgressResult(pass));
  assert.deepEqual(store.getEnvironmentProgress("ENV-001").experiences, { completed: 1, mastered: 1, total: 1 });
  const worse = runExperience(webArtifact, stages.slice(0, 4)).state;
  store.recordExperienceResult("ENV-001", "EXP-SENSOR-SIGNAL-001", createExperienceProgressResult(worse));
  assert.deepEqual(store.getEnvironmentProgress("ENV-001").experiences, { completed: 1, mastered: 1, total: 1 });
});

test("EE-0001 has eight byte-identical approved assets and no obsolete variant", async () => {
  const authoring = await readYaml("experience.yaml");
  const referenced = authoring.public.visual.assets.map(asset => path.basename(asset.src)).sort();
  assert.deepEqual(referenced, [...artifactNames].sort());
  assert.deepEqual((await readdir(new URL("media/", directory))).sort(), [...artifactNames].sort());
  assert.deepEqual((await readdir(new URL("assets/", directory))).sort(), [...artifactNames].sort());
  for (const name of artifactNames) {
    assert.deepEqual(await readFile(new URL(`assets/${name}`, directory)), await readFile(new URL(`media/${name}`, directory)), name);
  }
  assert.doesNotMatch(JSON.stringify(authoring), /loose terminal|loose termination/i);
});

test("EE-0001 introduces no ID-specific Engine, packaging, Player or Frontend logic", async () => {
  const sources = await Promise.all([
    readFile(new URL("../experiencePackagingPipeline.js", import.meta.url), "utf8"),
    readFile(new URL("../../normalization/experienceDefinitionNormalizer.js", import.meta.url), "utf8"),
    readFile(new URL("../../projection/runtimeToWebArtifactProjector.js", import.meta.url), "utf8"),
    readFile(new URL("../../player/experiencePlayer.js", import.meta.url), "utf8"),
    readFile(new URL("../../../scripts/package-experience-engine.mjs", import.meta.url), "utf8"),
    readFile(new URL("../../../Frontend/products/experience-engine/components/experienceWorkspace.js", import.meta.url), "utf8"),
    readFile(new URL("../../../Frontend/products/experience-engine/components/environmentProgressStore.js", import.meta.url), "utf8")
  ]);
  sources.forEach(source => assert.doesNotMatch(source, /EE-0001|EXP-SENSOR-SIGNAL-001/));
});
