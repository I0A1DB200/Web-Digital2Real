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
  assert.deepEqual(normalized.value.private.evaluation_policy.thresholds.map(item => item.outcome), ["RETRY_RECOMMENDED", "PASS_WITH_GUIDANCE", "PASS"]);
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
