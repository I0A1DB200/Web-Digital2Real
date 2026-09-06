import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { ExperiencePlayer } from "../../player/experiencePlayer.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";
import { validateNormalizedExperience } from "../../validation/normalizedExperienceValidator.js";
import { packageExperience } from "../experiencePackagingPipeline.js";

const directory = new URL("../../../content/experiences/sensors/EE-0002-intermittent-photoelectric-sensor-detection/", import.meta.url);
const readYaml = async relative => parseExperienceYaml(await readFile(new URL(relative, directory), "utf8"));

async function artifact(locale = "es") {
  const authoring = await readYaml("experience.yaml");
  return packageExperience(resolveExperienceLocalization(authoring, await readYaml(`locales/${locale}.yaml`)));
}

function complete(webArtifact, retryStages = []) {
  const player = new ExperiencePlayer({ experience: webArtifact });
  const authorities = new Map(webArtifact.public.interactions.map(item => [item.action_token, item]));
  const retry = new Set(retryStages);
  player.start();
  player.continue();
  while (player.getState().interaction !== "completion") {
    const state = player.getState();
    const advance = state.currentStage.decisions.find(item => authorities.get(item.action_token).outcome === "advance");
    const incorrect = state.currentStage.decisions.find(item => authorities.get(item.action_token).outcome === "retry");
    if (retry.has(state.currentStage.id)) {
      const afterRetry = player.selectDecision(incorrect.id);
      assert.equal(afterRetry.currentStage.id, state.currentStage.id);
      assert.deepEqual(afterRetry.unlockedEvidence, state.unlockedEvidence);
    }
    player.selectDecision(advance.id);
  }
  return player.getState();
}

test("EE-0002 is a published Authoring V2 Experience using only frozen contracts", async () => {
  const authoring = await readYaml("experience.yaml");
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true);
  assert.equal(validation.profile, "authoring_v2");
  assert.equal(authoring.metadata.id, "EXP-SENSOR-INTERMITTENT-002");
  assert.equal(authoring.metadata.editorial_id, "EE-0002");
  assert.equal(authoring.metadata.status, "published");
  assert.equal(authoring.private.technical_validation.status, "pass");
  assert.deepEqual(authoring.public.stages.map(stage => stage.phase), [
    "incident", "investigation", "investigation", "investigation", "investigation", "investigation", "solution"
  ]);
  assert.equal(authoring.public.stages.every(stage => stage.decision_ids.length === 3), true);
  assert.equal(authoring.private.decision_logic.filter(item => item.is_correct).length, 7);
  assert.equal(authoring.private.decision_logic.filter(item => !item.is_correct).every(item =>
    item.evidence_revealed.length === 0 && item.retry_feedback.trim()
  ), true);
  assert.equal(authoring.public.visual.representation, "available");
  assert.equal(authoring.public.visual.assets.length, 7);
  assert.deepEqual(authoring.public.stages.map(stage => stage.media_ids), [
    ["ART-001"], [], ["ART-002", "ART-003"], ["ART-003"],
    ["ART-004"], ["ART-005"], ["ART-006"]
  ]);
  assert.deepEqual(authoring.public.completion.media_ids, ["ART-007"]);
  assert.deepEqual(
    (await readdir(new URL("assets/", directory))).filter(name => name.endsWith(".png")).sort(),
    [
      "01-cycle-observation.png",
      "02-successful-cycle.png",
      "03-failed-cycle.png",
      "04-position-correlation.png",
      "05-marginal-alignment.png",
      "06-realignment-secured.png",
      "07-validation-cycles.png"
    ]
  );
});

test("EE-0002 localizes every learner-facing V2 field in Spanish and English", async () => {
  const spanish = await artifact("es");
  const english = await artifact("en");
  assert.equal(spanish.metadata.title, "Detección fotoeléctrica intermitente");
  assert.equal(english.metadata.title, "Intermittent Photoelectric Sensor Detection");
  assert.equal(english.public.stages.length, 7);
  assert.equal(english.public.stages.every(stage => stage.decisions.length === 3), true);
  assert.match(english.public.stages[2].situation, /sensor output.*PLC input.*OFF/i);
  assert.doesNotMatch(english.public.stages.slice(0, 4).map(stage => stage.situation).join(" "), /marginal alignment/i);
});

test("EE-0002 validates through Authoring, Runtime and learner-safe projection", async () => {
  const authoring = await readYaml("experience.yaml");
  const normalized = normalizeExperienceDefinition(authoring);
  const webArtifact = packageExperience(authoring);
  assert.equal(normalized.ok, true);
  assert.equal(validateNormalizedExperience(normalized.value).valid, true);
  assert.equal(validateGeneratedWebArtifact(webArtifact).valid, true);
  assert.equal(webArtifact.web_artifact_version, "2.0.0");
  const serialized = JSON.stringify(webArtifact);
  for (const forbidden of [
    '"private"', '"is_correct"', '"retry_feedback"', '"rationale"',
    '"fault_model"', '"diagnostic_model"', '"root_cause"', '"debrief"'
  ]) assert.doesNotMatch(serialized, new RegExp(forbidden));
});

test("EE-0002 retries cannot progress and repeated validation is required for completion", async () => {
  const webArtifact = await artifact("en");
  const stages = webArtifact.public.stages.map(stage => stage.id);
  const pass = complete(webArtifact);
  const guided = complete(webArtifact, stages.slice(0, 3));
  const retry = complete(webArtifact, stages.slice(0, 4));
  assert.equal(pass.evaluationResult.outcome, "PASS");
  assert.equal(pass.evaluationResult.mastered, true);
  assert.equal(guided.evaluationResult.outcome, "PASS_WITH_GUIDANCE");
  assert.equal(retry.evaluationResult.outcome, "RETRY_RECOMMENDED");
  assert.ok(pass.unlockedEvidence.includes("EVID-09-VALIDATION"));
  assert.equal(pass.decisionHistory.at(-1).selectedDecisionId, "DEC-07-VALIDATE-SAMPLE");
});

test("EE-0002 keeps marginal alignment private until correlation and inspection", async () => {
  const authoring = await readYaml("experience.yaml");
  const earlyPublic = JSON.stringify({
    scenario: authoring.public.scenario,
    stages: authoring.public.stages.slice(0, 4),
    evidence: authoring.public.evidence.slice(0, 5)
  });
  assert.doesNotMatch(earlyPublic, /alineación marginal|eje de detección.*borde/i);
  assert.match(authoring.public.evidence.find(item => item.id === "EVID-07-MARGINAL-ALIGNMENT").content, /eje de detección.*borde/i);
  assert.match(authoring.private.fault_model.root_cause, /alineación marginal/i);
});
