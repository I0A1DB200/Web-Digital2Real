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

function diagnosticState(state) {
  return Object.fromEntries([
    "state", "completionStatus", "progress", "decisionHistory", "attemptsByDecision",
    "resolvedDecisions", "unlockedEvidence", "evaluationResult"
  ].map(key => [key, state[key]]));
}

const expectedResults = {
  "DEC-02-COMPARE-STATES": [
    { id: "EVID-03-SUCCESS", media: ["ART-002"] },
    { id: "EVID-04-FAILURE", media: [] }
  ],
  "DEC-05-INSPECT-ALIGNMENT": [{ id: "EVID-07-MARGINAL-ALIGNMENT", media: ["ART-005"] }],
  "DEC-07-VALIDATE-SAMPLE": [{ id: "EVID-09-VALIDATION", media: ["ART-007"] }]
};

function complete(webArtifact, retryStages = [], retryAll = false) {
  const player = new ExperiencePlayer({ experience: webArtifact });
  const authorities = new Map(webArtifact.public.interactions.map(item => [item.action_token, item]));
  const retry = new Set(retryStages);
  player.start();
  assert.equal(player.getState().visual.cover_asset_id, "ART-001");
  player.continue();
  const results = [];
  while (player.getState().interaction !== "completion") {
    const state = player.getState();
    assert.equal(state.interaction, "stage");
    assert.equal(state.progress.totalStages, 7);
    assert.ok(state.media.every(item => !["ART-001", "ART-003", "ART-004", "ART-006", "ART-007"].includes(item.id)));
    const advance = state.currentStage.decisions.find(item => authorities.get(item.action_token).outcome === "advance");
    const incorrect = state.currentStage.decisions.filter(item => authorities.get(item.action_token).outcome === "retry");
    const retries = retryAll ? incorrect : retry.has(state.currentStage.id) ? incorrect.slice(0, 1) : [];
    for (const [index, option] of retries.entries()) {
      const afterRetry = player.selectDecision(option.id);
      assert.equal(afterRetry.currentStage.id, state.currentStage.id);
      assert.deepEqual(afterRetry.unlockedEvidence, state.unlockedEvidence);
      assert.deepEqual(afterRetry.resolvedDecisions, state.resolvedDecisions);
      assert.deepEqual(afterRetry.progress, state.progress);
      assert.deepEqual(afterRetry.media, state.media);
      assert.equal(afterRetry.result, null);
      assert.equal(afterRetry.completionStatus, state.completionStatus);
      assert.equal(afterRetry.attemptsByDecision[state.currentStage.id], index + 1);
      assert.match(afterRetry.feedback.message, /\S/);
    }
    const after = player.selectDecision(advance.id);
    assert.equal(after.attemptsByDecision[state.currentStage.id], retries.length + 1);
    assert.deepEqual(after.unlockedEvidence, [...state.unlockedEvidence, ...authorities.get(advance.action_token).unlocks]);
    if (advance.id === "DEC-06-REALIGN-SECURE") {
      assert.equal(after.currentStage.id, "STAGE-07-VERIFY");
      assert.deepEqual(after.media, []);
      assert.ok(after.unlockedEvidence.includes("EVID-08-REPAIR"));
      assert.equal(after.unlockedEvidence.includes("EVID-09-VALIDATION"), false);
    }
    if (advance.id === "DEC-07-VALIDATE-SAMPLE") {
      assert.equal(after.completionStatus, "completed");
      assert.equal(after.completion, null);
      assert.ok(after.unlockedEvidence.includes("EVID-09-VALIDATION"));
      assert.equal(after.evaluationResult.totalDecisions, 7);
    } else {
      assert.notEqual(after.completionStatus, "completed");
      assert.equal(after.unlockedEvidence.includes("EVID-09-VALIDATION"), false);
    }
    if (Object.hasOwn(expectedResults, advance.id)) {
      assert.equal(after.interaction, "result");
      assert.equal(after.currentStage, null);
      assert.deepEqual(after.media, []);
      assert.deepEqual(after.result.evidence.map(item => ({ id: item.id, media: item.media.map(asset => asset.id) })), expectedResults[advance.id]);
      results.push(advance.id);
      assert.deepEqual(diagnosticState(player.continue()), diagnosticState(after), "Continue changes presentation only");
    } else {
      assert.equal(after.interaction, "stage");
      assert.equal(after.result, null);
    }
  }
  assert.deepEqual(results, Object.keys(expectedResults));
  const final = player.getState();
  assert.deepEqual(final.media.map(item => item.id), ["ART-007"]);
  assert.equal(final.resolvedDecisions.length, 7);
  return final;
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
  assert.equal(authoring.public.decisions.length, 21);
  assert.equal(authoring.private.decision_logic.filter(item => !item.is_correct).length, 14);
  assert.equal(authoring.public.evidence.length, 9);
  assert.equal(authoring.private.decision_logic.filter(item => !item.is_correct).every(item =>
    item.evidence_revealed.length === 0 && item.retry_feedback.trim()
  ), true);
  assert.equal(authoring.public.visual.representation, "available");
  assert.equal(authoring.public.visual.assets.length, 7);
  assert.deepEqual(authoring.public.stages.map(stage => stage.media_ids), [
    [], [], ["ART-002"], [], [], ["ART-005"], []
  ]);
  assert.deepEqual(authoring.public.evidence.map(item => item.media_ids ?? []), [
    [], [], ["ART-002"], [], [], [], ["ART-005"], [], ["ART-007"]
  ]);
  for (const evidence of authoring.public.evidence) {
    assert.deepEqual(evidence.revealed_by, authoring.private.decision_logic
      .filter(item => item.evidence_revealed.includes(evidence.id)).map(item => item.decision_id));
  }
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
    summary: authoring.public.summary,
    educationalPurpose: authoring.public.visual.educational_purpose,
    scenario: authoring.public.scenario,
    stages: authoring.public.stages.slice(0, 4),
    evidence: authoring.public.evidence.slice(0, 5)
  });
  assert.doesNotMatch(earlyPublic, /alineación marginal|eje de detección.*borde/i);
  assert.match(authoring.public.evidence.find(item => item.id === "EVID-07-MARGINAL-ALIGNMENT").content, /eje de detección.*borde/i);
  assert.match(authoring.private.fault_model.root_cause, /alineación marginal/i);
});

test("EE-0002 ES/EN preserve three Results, all fourteen retries and bounded evidence claims", async () => {
  const authoring = await readYaml("experience.yaml");
  for (const locale of ["es", "en"]) {
    const localized = resolveExperienceLocalization(authoring, await readYaml(`locales/${locale}.yaml`));
    const intro = localized.public.summary + " " + localized.public.visual.educational_purpose;
    assert.doesNotMatch(intro, /alineación marginal|marginal alignment|no originan señal|do not originate a signal/i);
    const actions = new Map(localized.public.decisions.map(item => [item.id, item.action]));
    assert.match(actions.get("DEC-01-OBSERVE-CYCLES"), locale === "es" ? /posición segura/ : /safe position/);
    assert.match(actions.get("DEC-02-COMPARE-STATES"), locale === "es" ? /Observar.*monitorizar.*registro de producción/ : /Observe.*monitor.*production record/);
    assert.doesNotMatch(actions.get("DEC-02-COMPARE-STATES"), /volt|VDC/i);
    assert.match(actions.get("DEC-06-REALIGN-SECURE"), locale === "es" ? /parada y aislamiento antes de realinear/ : /stop and isolation procedure before realigning/);
    assert.match(actions.get("DEC-07-VALIDATE-SAMPLE"), locale === "es" ? /Tras la intervención.*muestra repetida/ : /After intervention.*repeated sample/);
    const geometry = localized.public.evidence.find(item => item.id === "EVID-07-MARGINAL-ALIGNMENT");
    assert.doesNotMatch(geometry.content, /funcional|functional|limpio|clean|configurad|configured/i);
    assert.doesNotMatch(localized.private.decision_logic.find(item => item.decision_id === "DEC-04-REPLACE-SENSOR").retry_feedback, /sensor funcional|functional sensor/i);
    assert.doesNotMatch(JSON.stringify(localized.public.visual.assets), /diez|ten (?:of|out of)|ten post|10\s*\/\s*10/i);
    const state = complete(packageExperience(localized), [], true);
    assert.equal(state.evaluationResult.totalDecisions, 7);
    assert.equal(state.evaluationResult.additionalAttempts, 14);
    assert.equal(state.decisionHistory.length, 21);
  }
});
