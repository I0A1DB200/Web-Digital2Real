import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { packageExperience } from "../../packaging/experiencePackagingPipeline.js";
import { projectRuntimeToWebArtifact } from "../../projection/runtimeToWebArtifactProjector.js";
import { validateExperienceDefinition } from "../experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../generatedWebArtifactValidator.js";
import { validateNormalizedExperience } from "../normalizedExperienceValidator.js";

const sourceUrl = new URL("../fixtures/experience-definition-v1-valid.json", import.meta.url);
const source = async () => JSON.parse(await readFile(sourceUrl, "utf8"));
const clone = value => structuredClone(value);

async function authoringV2() {
  const value = await source();
  value.contract_version = "2.0.0";
  value.public.stages[0].phase = "incident";
  value.public.stages.splice(1, 0, {
    id: "STAGE-INVESTIGATE", title: "Investigation", situation: "Review the evidence.",
    evidence_ids: ["EVID-INITIAL"], decision_ids: [], phase: "investigation"
  });
  value.public.stages[2].phase = "solution";
  value.private.decision_logic.forEach(item => { item.is_correct = true; });
  for (const stage of [value.public.stages[0], value.public.stages[2]]) {
    const id = `${stage.decision_ids[0]}-RETRY`;
    stage.decision_ids.push(id);
    value.public.decisions.push({ id, stage_id: stage.id, action: "Choose a plausible but unsupported action." });
    value.private.decision_logic.push({
      decision_id: id, rationale: "The evidence does not support this action.", classification: "weak",
      consequence: "The diagnosis remains unresolved.", evidence_revealed: [], next_stage: stage.id,
      score_effect: 0, safety_effect: 0, is_correct: false,
      retry_feedback: "Reconsider which conclusion is supported by the available evidence."
    });
  }
  value.private.evaluation_policy = {
    provisional: true,
    mastery_outcomes: ["PASS"],
    thresholds: [
      { outcome: "RETRY_RECOMMENDED", minimum: 0, maximum: 49 },
      { outcome: "PASS_WITH_GUIDANCE", minimum: 50, maximum: 79 },
      { outcome: "PASS", minimum: 80, maximum: 100 }
    ]
  };
  return value;
}

test("dispatches valid V1 and V2 authoring contracts explicitly", async () => {
  assert.equal(validateExperienceDefinition(await source()).profile, "authoring_v1");
  const result = validateExperienceDefinition(await authoringV2());
  assert.equal(result.profile, "authoring_v2");
  assert.equal(result.compatible, true);
  const unsupported = await source(); unsupported.contract_version = "3.0.0";
  assert.equal(validateExperienceDefinition(unsupported).errors.some(item => item.code === "CONTRACT_VERSION_UNSUPPORTED"), true);
});

test("requires exactly one explicit correct option per V2 decision point", async () => {
  const valid = await authoringV2();
  assert.equal(validateExperienceDefinition(valid).compatible, true);
  const zero = clone(valid); zero.private.decision_logic.filter(item => zero.public.stages[0].decision_ids.includes(item.decision_id)).forEach(item => { item.is_correct = false; item.retry_feedback ??= "Retry."; });
  assert.equal(validateExperienceDefinition(zero).errors.some(item => item.code === "DECISION_CORRECTNESS_CARDINALITY"), true);
  const multiple = clone(valid); multiple.private.decision_logic.find(item => item.decision_id.endsWith("-RETRY")).is_correct = true;
  assert.equal(validateExperienceDefinition(multiple).errors.some(item => item.code === "DECISION_CORRECTNESS_CARDINALITY"), true);
});

test("validates phase semantics and retry feedback", async () => {
  const invalid = await authoringV2(); invalid.public.stages[1].phase = "solution"; invalid.public.stages[2].phase = "investigation";
  assert.equal(validateExperienceDefinition(invalid).errors.some(item => item.code === "STAGE_PHASE_ORDER_INVALID"), true);
  const feedback = await authoringV2(); delete feedback.private.decision_logic.find(item => item.is_correct === false).retry_feedback;
  assert.equal(validateExperienceDefinition(feedback).errors.some(item => item.code === "RETRY_FEEDBACK_REQUIRED"), true);
});

test("validates complete, non-overlapping provisional evaluation thresholds", async () => {
  const overlap = await authoringV2(); overlap.private.evaluation_policy.thresholds[1].minimum = 49;
  assert.equal(validateExperienceDefinition(overlap).errors.some(item => item.code === "EVALUATION_POLICY_INVALID"), true);
  const gap = await authoringV2(); gap.private.evaluation_policy.thresholds[1].minimum = 51;
  assert.equal(validateExperienceDefinition(gap).errors.some(item => item.code === "EVALUATION_POLICY_INVALID"), true);
  const outcome = await authoringV2(); outcome.private.evaluation_policy.thresholds[0].outcome = "UNKNOWN";
  assert.equal(validateExperienceDefinition(outcome).errors.some(item => item.code === "EVALUATION_POLICY_INVALID"), true);
  const order = await authoringV2(); order.private.evaluation_policy.thresholds.reverse();
  assert.equal(validateExperienceDefinition(order).errors.some(item => item.code === "EVALUATION_POLICY_INVALID"), true);
});

test("normalizes and validates the private Runtime V2 boundary", async () => {
  const normalized = normalizeExperienceDefinition(await authoringV2());
  assert.equal(normalized.ok, true);
  assert.equal(normalized.outputProfile, "normalized_runtime_v2");
  assert.equal(validateNormalizedExperience(normalized.value).compatible, true);
  assert.equal(normalized.value.private.relations.some(item => item.is_correct === false && item.retry_feedback), true);
  assert.equal(normalized.value.private.relations.filter(item => item.is_correct).every(item => !Object.hasOwn(item, "retry_feedback")), true);
  assert.deepEqual(normalized.value.private.evaluation_policy.thresholds.map(item => item.outcome), ["RETRY_RECOMMENDED", "PASS_WITH_GUIDANCE", "PASS"]);
});

test("rejects invalid Runtime V2 transition, evidence and authority boundaries", async () => {
  const runtime = normalizeExperienceDefinition(await authoringV2()).value;
  const transition = clone(runtime); transition.private.relations.find(item => item.is_correct).destination = "STAGE-UNKNOWN";
  assert.equal(validateNormalizedExperience(transition).errors.some(item => item.code === "TRANSITION_DESTINATION_UNKNOWN"), true);
  const evidence = clone(runtime); evidence.private.relations.find(item => item.is_correct).evidence_revealed = ["EVID-UNKNOWN"];
  assert.equal(validateNormalizedExperience(evidence).errors.some(item => item.code === "EVIDENCE_UNLOCK_UNKNOWN"), true);
  const ambiguous = clone(runtime); const correct = ambiguous.private.relations.filter(item => item.is_correct); correct[1].evidence_revealed = [...correct[0].evidence_revealed];
  assert.equal(validateNormalizedExperience(ambiguous).errors.some(item => item.code === "EVIDENCE_UNLOCK_AMBIGUOUS"), true);
  const duplicate = clone(runtime); duplicate.private.relations.find(item => item.is_correct === false).is_correct = true;
  assert.equal(validateNormalizedExperience(duplicate).errors.some(item => item.code === "RUNTIME_CORRECTNESS_CARDINALITY"), true);
});

test("rejects an evaluable V2 Experience with zero decision points", async () => {
  const authoring = await authoringV2(); authoring.public.stages.forEach(stage => { stage.decision_ids = []; });
  assert.equal(validateExperienceDefinition(authoring).errors.some(item => item.code === "DECISION_POINTS_REQUIRED"), true);
});

test("projects a V2 public boundary without correctness or private feedback", async () => {
  const runtime = normalizeExperienceDefinition(await authoringV2()).value;
  const artifact = projectRuntimeToWebArtifact(runtime);
  assert.equal(artifact.web_artifact_version, "2.0.0");
  assert.equal(validateGeneratedWebArtifact(artifact).compatible, true);
  assert.deepEqual(artifact.public.stages.map(item => item.phase), ["incident", "investigation", "solution"]);
  assert.doesNotMatch(JSON.stringify(artifact), /is_correct|retry_feedback|rationale|score_effect|private/);
  assert.deepEqual(packageExperience(await authoringV2()), artifact);
});

test("projects separated deterministic retry and advance interactions", async () => {
  const runtime = normalizeExperienceDefinition(await authoringV2()).value;
  const artifact = projectRuntimeToWebArtifact(runtime);
  const decisions = artifact.public.stages.flatMap(stage => stage.decisions);
  const select = decisionId => artifact.public.interactions.find(item =>
    item.action_token === decisions.find(decision => decision.id === decisionId).action_token);
  const incorrectId = runtime.private.relations.find(item => item.is_correct === false).decision_id;
  const correct = runtime.private.relations.find(item => item.is_correct === true && item.destination !== "COMPLETE");
  const terminal = runtime.private.relations.find(item => item.is_correct === true && item.destination === "COMPLETE");

  assert.deepEqual(Object.keys(decisions[0]), ["id", "action", "action_token"]);
  assert.equal(decisions.every(item => !["is_correct", "correct", "accepted"].some(field => Object.hasOwn(item, field))), true);
  assert.deepEqual(select(incorrectId), {
    action_token: decisions.find(item => item.id === incorrectId).action_token,
    outcome: "retry",
    message: "Reconsider which conclusion is supported by the available evidence."
  });
  assert.deepEqual(select(correct.decision_id), {
    action_token: decisions.find(item => item.id === correct.decision_id).action_token,
    outcome: "advance",
    next: correct.destination,
    unlocks: correct.evidence_revealed
  });
  assert.equal(select(terminal.decision_id).next, "COMPLETE");
  assert.deepEqual(select(terminal.decision_id).unlocks, []);
  assert.equal(artifact.public.interactions.every(item => item.outcome !== "retry" || (!Object.hasOwn(item, "next") && !Object.hasOwn(item, "unlocks"))), true);
});

test("publishes only evidence required by projected advance interactions", async () => {
  const artifact = projectRuntimeToWebArtifact(normalizeExperienceDefinition(await authoringV2()).value);
  const unlocked = new Set(artifact.public.interactions.flatMap(item => item.unlocks ?? []));
  const published = new Set(artifact.public.evidence.map(item => item.id));

  assert.deepEqual(published, unlocked);
  assert.equal(artifact.public.evidence.every(item => item.visibility === "public"), true);
});

test("does not leak private Runtime authority through Web Artifact V2", async () => {
  const runtime = normalizeExperienceDefinition(await authoringV2()).value;
  const artifact = projectRuntimeToWebArtifact(runtime);
  const forbidden = new Set([
    "private", "relations", "decision_logic", "is_correct", "retry_feedback",
    "classification", "rationale", "score_effect", "safety_effect", "scoring",
    "debrief", "fault_model", "diagnostic_model"
  ]);
  const leaked = [];
  const walk = value => {
    if (Array.isArray(value)) return value.forEach(walk);
    if (!value || typeof value !== "object") return;
    Object.entries(value).forEach(([key, item]) => { if (forbidden.has(key)) leaked.push(key); walk(item); });
  };
  walk(artifact);

  assert.deepEqual(leaked, []);
  assert.equal(Object.hasOwn(artifact.public, "interactions"), true);
  assert.deepEqual(Object.keys(artifact.public.evaluation_policy), ["provisional", "outcomes", "mastery_outcomes", "thresholds"]);
});

test("rejects malformed projected decision authority", async () => {
  const artifact = projectRuntimeToWebArtifact(normalizeExperienceDefinition(await authoringV2()).value);
  const retry = artifact.public.interactions.find(item => item.outcome === "retry");
  const advance = artifact.public.interactions.find(item => item.outcome === "advance" && item.unlocks.length);

  const retryProgresses = clone(artifact);
  Object.assign(retryProgresses.public.interactions.find(item => item.action_token === retry.action_token), { next: "COMPLETE" });
  assert.equal(validateGeneratedWebArtifact(retryProgresses).errors.some(item => item.code === "RETRY_PROGRESSION_FORBIDDEN"), true);

  const missingEvidence = clone(artifact);
  missingEvidence.public.interactions.find(item => item.action_token === advance.action_token).unlocks = ["EVID-UNKNOWN"];
  assert.equal(validateGeneratedWebArtifact(missingEvidence).errors.some(item => item.code === "PROJECTED_EVIDENCE_UNKNOWN"), true);

  const unknownDestination = clone(artifact);
  unknownDestination.public.interactions.find(item => item.outcome === "advance").next = "STAGE-UNKNOWN";
  assert.equal(validateGeneratedWebArtifact(unknownDestination).errors.some(item => item.code === "PROJECTED_DESTINATION_UNKNOWN"), true);

  const visibleLeak = clone(artifact);
  visibleLeak.public.stages[0].decisions[0].accepted = true;
  assert.equal(validateGeneratedWebArtifact(visibleLeak).errors.some(item => item.code === "VISIBLE_ANSWER_HINT_FORBIDDEN"), true);

  const policyLeak = clone(artifact);
  policyLeak.public.evaluation_policy.scoring = { weights: [] };
  assert.equal(validateGeneratedWebArtifact(policyLeak).errors.some(item => item.code === "PROJECTED_EVALUATION_POLICY_FIELD_FORBIDDEN"), true);

  const thresholdLeak = clone(artifact);
  thresholdLeak.public.evaluation_policy.thresholds[0].score = 10;
  assert.equal(validateGeneratedWebArtifact(thresholdLeak).errors.some(item => item.code === "PROJECTED_EVALUATION_THRESHOLD_FIELD_FORBIDDEN"), true);
});
