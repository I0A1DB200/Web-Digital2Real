import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

import { createEnvironmentProgressStore } from "../../../Frontend/products/experience-engine/components/environmentProgressStore.js";
import { createExperienceProgressResult } from "../../../Frontend/products/experience-engine/components/experienceWorkspace.js";
import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { ExperiencePlayer } from "../../player/experiencePlayer.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";
import { validateNormalizedExperience } from "../../validation/normalizedExperienceValidator.js";
import { packageExperience } from "../experiencePackagingPipeline.js";

const directory = new URL("../../../content/experiences/drives/EE-0003-vfd-command-authority-mismatch/", import.meta.url);
const readYaml = async relative => parseExperienceYaml(await readFile(new URL(relative, directory), "utf8"));

async function artifact(locale = "es") {
  const authoring = await readYaml("experience.yaml");
  const localized = resolveExperienceLocalization(authoring, await readYaml(`locales/${locale}.yaml`));
  return packageExperience(localized);
}

function run(webArtifact, retryStageIds = []) {
  const player = new ExperiencePlayer({ experience: webArtifact });
  const authority = new Map(webArtifact.public.interactions.map(item => [item.action_token, item]));
  const retries = new Set(retryStageIds);
  const progression = [];
  player.start();
  player.continue();
  while (player.getState().interaction !== "completion") {
    const before = player.getState();
    progression.push({ id: before.currentStage.id, media: before.media.map(item => item.id) });
    const correct = before.currentStage.decisions.find(item => authority.get(item.action_token).outcome === "advance");
    const incorrect = before.currentStage.decisions.find(item => authority.get(item.action_token).outcome === "retry");
    if (retries.has(before.currentStage.id)) {
      const after = player.selectDecision(incorrect.id);
      assert.equal(after.currentStage.id, before.currentStage.id);
      assert.deepEqual(after.unlockedEvidence, before.unlockedEvidence);
      assert.equal(after.decisionHistory.length, before.decisionHistory.length + 1);
    }
    player.selectDecision(correct.id);
  }
  return { state: player.getState(), progression };
}

function memoryStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}

test("EE-0003 is a technically validated technical-review Authoring V2 Experience with one authority per stage", async () => {
  const authoring = await readYaml("experience.yaml");
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true);
  assert.equal(validation.profile, "authoring_v2");
  assert.equal(authoring.metadata.id, "EXP-VFD-AUTHORITY-003");
  assert.equal(authoring.metadata.editorial_id, "EE-0003");
  assert.equal(authoring.metadata.status, "technical_review");
  assert.equal(authoring.private.technical_validation.status, "pass");
  assert.equal(authoring.public.stages.length, 6);
  assert.equal(authoring.public.stages.every(stage => stage.decision_ids.length === 3), true);
  assert.equal(authoring.private.decision_logic.filter(item => item.is_correct).length, 6);
  assert.equal(authoring.private.decision_logic.filter(item => !item.is_correct).every(item => item.evidence_revealed.length === 0), true);
});

test("EE-0003 resolves all seven assets and localizes ES and EN without hybrid paragraphs", async () => {
  const authoring = await readYaml("experience.yaml");
  const files = (await readdir(new URL("assets/", directory))).filter(name => name.endsWith(".png")).sort();
  assert.equal(files.length, 7);
  assert.deepEqual(files, authoring.public.visual.assets.map(item => item.src.split("/").at(-1)).sort());
  const spanish = await artifact("es");
  const english = await artifact("en");
  assert.equal(spanish.metadata.title, "El variador recibe orden, pero el transportador no arranca");
  assert.equal(english.metadata.title, "Drive Command Present, Conveyor Does Not Start");
  assert.doesNotMatch(english.public.stages.map(item => `${item.title} ${item.situation}`).join(" "), /variador|transportador|marcha|permiso/i);
  assert.doesNotMatch(spanish.public.stages.slice(0, 3).map(item => item.situation).join(" "), /HAND|BOP|autoridad de mando/i);
});

test("EE-0003 validates Runtime and projection without private authority leakage", async () => {
  const authoring = await readYaml("experience.yaml");
  const normalized = normalizeExperienceDefinition(authoring);
  const webArtifact = packageExperience(authoring);
  assert.equal(normalized.ok, true);
  assert.equal(validateNormalizedExperience(normalized.value).valid, true);
  assert.equal(validateGeneratedWebArtifact(webArtifact).valid, true);
  const serialized = JSON.stringify(webArtifact);
  for (const forbidden of ["private", "is_correct", "retry_feedback", "classification", "rationale", "fault_model", "diagnostic_model", "root_cause", "debrief"])
    assert.equal(serialized.includes(`\"${forbidden}\"`), false, forbidden);
});

test("EE-0003 retries stay in stage and explicit transitions unlock evidence in order", async () => {
  const webArtifact = await artifact("en");
  const stages = webArtifact.public.stages.map(item => item.id);
  const pass = run(webArtifact);
  const guided = run(webArtifact, stages.slice(0, 2)).state;
  const retry = run(webArtifact, stages.slice(0, 4)).state;
  assert.deepEqual(pass.progression.map(item => item.media), [["ART-001"], ["ART-002"], ["ART-003"], ["ART-004"], ["ART-005"], ["ART-006"]]);
  assert.equal(pass.state.completionStatus, "completed");
  assert.equal(pass.state.evaluationResult.outcome, "PASS");
  assert.equal(guided.evaluationResult.outcome, "PASS_WITH_GUIDANCE");
  assert.equal(retry.evaluationResult.outcome, "RETRY_RECOMMENDED");
  assert.ok(pass.state.unlockedEvidence.includes("EVID-07-RECOVERY"));
  assert.deepEqual((await readYaml("experience.yaml")).public.completion.media_ids, ["ART-007"]);
});

test("EE-0003 integrates with ENV Progress V2 and mastery remains monotonic", async () => {
  const webArtifact = await artifact("en");
  const stages = webArtifact.public.stages.map(item => item.id);
  const store = createEnvironmentProgressStore({ storage: memoryStorage() });
  store.registerEnvironment({
    environmentId: "ENV-001", contractVersion: "2.0.0",
    experienceIds: ["EXP-VFD-AUTHORITY-003"], theorySectionIds: ["TH-01"]
  });
  store.recordExperienceResult("ENV-001", "EXP-VFD-AUTHORITY-003", createExperienceProgressResult(run(webArtifact, stages.slice(0, 2)).state));
  assert.deepEqual(store.getEnvironmentProgress("ENV-001").experiences, { completed: 1, mastered: 0, total: 1 });
  store.recordExperienceResult("ENV-001", "EXP-VFD-AUTHORITY-003", createExperienceProgressResult(run(webArtifact).state));
  store.recordExperienceResult("ENV-001", "EXP-VFD-AUTHORITY-003", createExperienceProgressResult(run(webArtifact, stages.slice(0, 4)).state));
  assert.deepEqual(store.getEnvironmentProgress("ENV-001").experiences, { completed: 1, mastered: 1, total: 1 });
});
