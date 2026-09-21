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

const directory = new URL("../../../content/experiences/pneumatics/EE-0004-pneumatic-cylinder-extension-timeout/", import.meta.url);
const readYaml = async relative => parseExperienceYaml(await readFile(new URL(relative, directory), "utf8"));

async function artifact(locale = "es") {
  const authoring = await readYaml("experience.yaml");
  return packageExperience(resolveExperienceLocalization(authoring, await readYaml(`locales/${locale}.yaml`)));
}

function run(webArtifact, retryStages = []) {
  const player = new ExperiencePlayer({ experience: webArtifact });
  const authority = new Map(webArtifact.public.interactions.map(item => [item.action_token, item]));
  const retry = new Set(retryStages);
  const progression = [];
  player.start();
  player.continue();
  while (player.getState().interaction !== "completion") {
    const before = player.getState();
    progression.push({ id: before.currentStage.id, media: before.media.map(item => item.id) });
    const correct = before.currentStage.decisions.find(item => authority.get(item.action_token).outcome === "advance");
    const incorrect = before.currentStage.decisions.find(item => authority.get(item.action_token).outcome === "retry");
    if (retry.has(before.currentStage.id)) {
      const after = player.selectDecision(incorrect.id);
      assert.equal(after.currentStage.id, before.currentStage.id);
      assert.deepEqual(after.unlockedEvidence, before.unlockedEvidence);
    }
    player.selectDecision(correct.id);
  }
  return { state: player.getState(), progression };
}

test("EE-0004 is valid Authoring V2 with one private authority per stage", async () => {
  const authoring = await readYaml("experience.yaml");
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true);
  assert.equal(validation.profile, "authoring_v2");
  assert.equal(authoring.metadata.editorial_id, "EE-0004");
  assert.equal(authoring.metadata.status, "technical_review");
  assert.equal(authoring.public.stages.length, 6);
  assert.equal(authoring.private.decision_logic.filter(item => item.is_correct).length, 6);
  assert.equal(authoring.private.decision_logic.filter(item => !item.is_correct).every(item => item.retry_feedback && item.evidence_revealed.length === 0), true);
});

test("EE-0004 localizes completely and resolves the seven approved assets", async () => {
  const authoring = await readYaml("experience.yaml");
  const files = (await readdir(new URL("assets/", directory))).filter(name => name.endsWith(".png")).sort();
  assert.deepEqual(files, ["01.png", "02.png", "03.png", "04.png", "05.png", "06.png", "07.png"]);
  const spanish = await artifact("es");
  const english = await artifact("en");
  assert.deepEqual(spanish.public.stages.map(item => item.id), english.public.stages.map(item => item.id));
  assert.equal(english.metadata.title, "Pneumatic Cylinder Extension Timeout");
  assert.doesNotMatch(english.public.stages.map(item => item.situation).join(" "), /cilindro|presión|caudal|válvula/i);
  assert.doesNotMatch(spanish.public.stages.slice(0, 4).map(item => item.situation).join(" "), /restricción excesiva|regulador unidireccional/i);
  assert.equal(authoring.public.visual.assets.length, 7);
});

test("EE-0004 projection validates without private diagnostic leakage", async () => {
  const authoring = await readYaml("experience.yaml");
  const normalized = normalizeExperienceDefinition(authoring);
  const webArtifact = packageExperience(authoring);
  assert.equal(normalized.ok, true);
  assert.equal(validateNormalizedExperience(normalized.value).valid, true);
  assert.equal(validateGeneratedWebArtifact(webArtifact).valid, true);
  const serialized = JSON.stringify(webArtifact);
  for (const forbidden of ["private", "is_correct", "retry_feedback", "classification", "rationale", "fault_model", "diagnostic_model", "root_cause", "debrief"])
    assert.equal(serialized.includes(`"${forbidden}"`), false, forbidden);
});

test("EE-0004 retries do not progress and assets 06 and 07 unlock only at their boundaries", async () => {
  const webArtifact = await artifact("en");
  const stages = webArtifact.public.stages.map(item => item.id);
  const pass = run(webArtifact);
  const guided = run(webArtifact, stages.slice(0, 2)).state;
  const retry = run(webArtifact, stages.slice(0, 4)).state;
  assert.deepEqual(pass.progression.map(item => item.media), [["ART-001", "ART-002"], ["ART-003"], ["ART-004"], ["ART-005"], ["ART-006"], ["ART-007"]]);
  assert.equal(pass.progression.slice(0, 4).flatMap(item => item.media).includes("ART-006"), false);
  assert.equal(pass.progression.slice(0, 5).flatMap(item => item.media).includes("ART-007"), false);
  assert.equal(pass.state.evaluationResult.outcome, "PASS");
  assert.equal(guided.evaluationResult.outcome, "PASS_WITH_GUIDANCE");
  assert.equal(retry.evaluationResult.outcome, "RETRY_RECOMMENDED");
});

test("EE-0004 uses generic monotonic ENV progress and mastery", async () => {
  const webArtifact = await artifact("en");
  const stages = webArtifact.public.stages.map(item => item.id);
  const values = new Map();
  const store = createEnvironmentProgressStore({ storage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) } });
  store.registerEnvironment({ environmentId: "ENV-001", contractVersion: "2.0.0", experienceIds: ["EXP-PNEUMATIC-CYLINDER-004"], theorySectionIds: ["TH-16"] });
  store.recordExperienceResult("ENV-001", "EXP-PNEUMATIC-CYLINDER-004", createExperienceProgressResult(run(webArtifact, stages.slice(0, 2)).state));
  store.recordExperienceResult("ENV-001", "EXP-PNEUMATIC-CYLINDER-004", createExperienceProgressResult(run(webArtifact).state));
  store.recordExperienceResult("ENV-001", "EXP-PNEUMATIC-CYLINDER-004", createExperienceProgressResult(run(webArtifact, stages.slice(0, 4)).state));
  assert.deepEqual(store.getEnvironmentProgress("ENV-001").experiences, { completed: 1, mastered: 1, total: 1 });
});
