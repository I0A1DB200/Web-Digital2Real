import { ExperienceV2Contracts } from "../schemas/experienceV2Contracts.js";

const object = value => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const incident = (code, path, message) => ({ severity: "error", code, path, message });

export function validateAuthoringV2(candidate, baseIncidents = []) {
  const incidents = [...baseIncidents];
  if (candidate?.contract_version !== ExperienceV2Contracts.authoringVersion) {
    incidents.push(incident("CONTRACT_VERSION_UNSUPPORTED", "$.contract_version", "Authoring V2 requires contract_version 2.0.0."));
    return result("Digital2Real Experience Authoring Definition V2", "authoring_v2", candidate, incidents);
  }
  const stages = candidate.public?.stages;
  const decisions = candidate.public?.decisions;
  const logic = candidate.private?.decision_logic;
  if (!Array.isArray(stages) || !Array.isArray(decisions) || !Array.isArray(logic)) {
    incidents.push(incident("V2_STRUCTURE_REQUIRED", "$", "V2 stages, decisions and private decision_logic are required arrays."));
  } else {
    validatePhases(stages, incidents);
    const logicById = new Map(logic.map(item => [item.decision_id, item]));
    const decisionPoints = stages.filter(stage => stage.decision_ids?.length);
    if (!decisionPoints.length) incidents.push(incident("DECISION_POINTS_REQUIRED", "$.public.stages", "An evaluable V2 Experience requires at least one decision point."));
    decisionPoints.forEach((stage, position) => {
      const entries = stage.decision_ids.map(id => logicById.get(id)).filter(Boolean);
      const correct = entries.filter(item => item.is_correct === true).length;
      if (correct !== 1) incidents.push(incident("DECISION_CORRECTNESS_CARDINALITY", `$.public.stages[${position}].decision_ids`, `Decision point ${stage.id} requires exactly one correct option; received ${correct}.`));
      entries.filter(item => item.is_correct === false).forEach(item => {
        if (typeof item.retry_feedback !== "string" || !item.retry_feedback.trim()) {
          incidents.push(incident("RETRY_FEEDBACK_REQUIRED", `$.private.decision_logic.${item.decision_id}.retry_feedback`, "Every incorrect V2 option requires learner-safe retry feedback."));
        }
      });
      entries.filter(item => item.is_correct === true && Object.hasOwn(item, "retry_feedback")).forEach(item => incidents.push(incident("CORRECT_RETRY_FEEDBACK_FORBIDDEN", `$.private.decision_logic.${item.decision_id}.retry_feedback`, "Correct options must not define retry feedback.")));
    });
  }
  validatePolicy(candidate.private?.evaluation_policy, "$.private.evaluation_policy", incidents);
  return result("Digital2Real Experience Authoring Definition V2", "authoring_v2", candidate, incidents);
}

export function validateRuntimeV2(candidate, baseIncidents = []) {
  const incidents = [...baseIncidents];
  if (candidate?.runtime_contract_version !== ExperienceV2Contracts.runtimeVersion) incidents.push(incident("RUNTIME_CONTRACT_VERSION_UNSUPPORTED", "$.runtime_contract_version", "Runtime V2 requires version 2.0.0."));
  const stages = candidate.public?.stages;
  if (!Array.isArray(stages)) incidents.push(incident("V2_STAGES_REQUIRED", "$.public.stages", "Runtime V2 stages are required."));
  else validatePhases(stages, incidents);
  const relations = candidate.private?.relations;
  if (!Array.isArray(relations)) incidents.push(incident("V2_RELATIONS_REQUIRED", "$.private.relations", "Runtime V2 private relations are required."));
  else relations.forEach((relation, index) => {
    if (typeof relation.is_correct !== "boolean") incidents.push(incident("CORRECTNESS_REQUIRED", `$.private.relations[${index}].is_correct`, "Explicit correctness is required."));
    if (relation.is_correct === false && (typeof relation.retry_feedback !== "string" || !relation.retry_feedback.trim())) incidents.push(incident("RETRY_FEEDBACK_REQUIRED", `$.private.relations[${index}].retry_feedback`, "Incorrect relations require retry feedback."));
    if (relation.is_correct === true && Object.hasOwn(relation, "retry_feedback")) incidents.push(incident("CORRECT_RETRY_FEEDBACK_FORBIDDEN", `$.private.relations[${index}].retry_feedback`, "Correct relations must not define retry feedback."));
    if (relation.is_correct === false && relation.evidence_revealed?.length) incidents.push(incident("INCORRECT_EVIDENCE_UNLOCK_FORBIDDEN", `$.private.relations[${index}].evidence_revealed`, "Incorrect options cannot unlock V2 evidence."));
  });
  if (Array.isArray(stages) && Array.isArray(relations)) validateRuntimeAuthority(candidate, stages, relations, incidents);
  validatePolicy(candidate.private?.evaluation_policy, "$.private.evaluation_policy", incidents);
  return result("Digital2Real Normalized Experience Runtime Contract V2", "normalized_runtime_v2", candidate, incidents);
}

export function validateWebArtifactV2(candidate, baseIncidents = []) {
  const incidents = [...baseIncidents];
  if (candidate?.web_artifact_version !== ExperienceV2Contracts.webArtifactVersion) incidents.push(incident("WEB_ARTIFACT_VERSION_UNSUPPORTED", "$.web_artifact_version", "Web Artifact V2 requires version 2.0.0."));
  scanForbidden(candidate, "$", incidents);
  const stages = candidate.public?.stages;
  if (!Array.isArray(stages)) incidents.push(incident("V2_STAGES_REQUIRED", "$.public.stages", "Web Artifact V2 stages are required."));
  else {
    validatePhases(stages, incidents);
    validateProjectedDecisions(candidate, stages, incidents);
  }
  return result("Digital2Real Generated Web Artifact V2", "generated_web_artifact_v2", candidate, incidents);
}

function validateProjectedDecisions(candidate, stages, incidents) {
  const interactions = candidate.public?.interactions;
  if (!Array.isArray(interactions)) {
    incidents.push(incident("PROJECTED_INTERACTIONS_REQUIRED", "$.public.interactions", "Web Artifact V2 requires a projected interaction table."));
    return;
  }
  const stageIds = new Set(stages.map(stage => stage.id));
  const evidenceIds = new Set((candidate.public?.evidence ?? []).map(item => item.id));
  const tokens = [];
  stages.forEach((stage, stageIndex) => stage.decisions?.forEach((decision, decisionIndex) => {
    const path = `$.public.stages[${stageIndex}].decisions[${decisionIndex}].action_token`;
    if (typeof decision.action_token !== "string" || !decision.action_token.trim()) incidents.push(incident("ACTION_TOKEN_REQUIRED", path, "Every visible V2 decision requires an action token."));
    else tokens.push(decision.action_token);
    ["is_correct", "correct", "accepted"].forEach(field => {
      if (Object.hasOwn(decision, field)) incidents.push(incident("VISIBLE_ANSWER_HINT_FORBIDDEN", `$.public.stages[${stageIndex}].decisions[${decisionIndex}].${field}`, "Visible decisions cannot contain answer-state fields."));
    });
  }));
  const uniqueTokens = new Set(tokens);
  if (uniqueTokens.size !== tokens.length) incidents.push(incident("ACTION_TOKEN_DUPLICATE", "$.public.stages", "Visible V2 action tokens must be unique."));
  const interactionTokens = new Set();
  interactions.forEach((item, index) => {
    const path = `$.public.interactions[${index}]`;
    if (!object(item)) { incidents.push(incident("PROJECTED_INTERACTION_INVALID", path, "Each projected interaction must be an object.")); return; }
    if (!uniqueTokens.has(item.action_token)) incidents.push(incident("ACTION_TOKEN_UNKNOWN", `${path}.action_token`, "Projected interaction references an unknown action token."));
    if (interactionTokens.has(item.action_token)) incidents.push(incident("ACTION_TOKEN_AUTHORITY_DUPLICATE", `${path}.action_token`, "Each action token requires exactly one projected authority."));
    interactionTokens.add(item.action_token);
    if (!ExperienceV2Contracts.projectedDecisionOutcomes.includes(item.outcome)) incidents.push(incident("PROJECTED_OUTCOME_INVALID", `${path}.outcome`, "Projected outcome must be retry or advance."));
    const allowed = ExperienceV2Contracts.projectedDecisionFields[item.outcome];
    if (allowed && Object.keys(item).some(field => !allowed.includes(field))) incidents.push(incident("PROJECTED_INTERACTION_FIELD_FORBIDDEN", path, "Projected interaction contains a non-allowlisted field."));
    if (item.outcome === "retry") {
      if (typeof item.message !== "string" || !item.message.trim()) incidents.push(incident("LEARNER_FEEDBACK_REQUIRED", `${path}.message`, "Retry interactions require learner-safe feedback."));
      if (Object.hasOwn(item, "next") || Object.hasOwn(item, "unlocks")) incidents.push(incident("RETRY_PROGRESSION_FORBIDDEN", path, "Retry interactions cannot progress or unlock evidence."));
    }
    if (item.outcome === "advance") {
      if (item.next !== "COMPLETE" && !stageIds.has(item.next)) incidents.push(incident("PROJECTED_DESTINATION_UNKNOWN", `${path}.next`, "Advance destination must be a public stage or COMPLETE."));
      if (!Array.isArray(item.unlocks)) incidents.push(incident("PROJECTED_UNLOCKS_REQUIRED", `${path}.unlocks`, "Advance interactions require an evidence unlock list."));
      else {
        if (new Set(item.unlocks).size !== item.unlocks.length) incidents.push(incident("PROJECTED_EVIDENCE_DUPLICATE", `${path}.unlocks`, "Projected evidence unlocks must be unique."));
        item.unlocks.forEach(id => { if (!evidenceIds.has(id)) incidents.push(incident("PROJECTED_EVIDENCE_UNKNOWN", `${path}.unlocks`, `Projected evidence ${id} is not public.`)); });
      }
    }
  });
  tokens.forEach(token => { if (!interactionTokens.has(token)) incidents.push(incident("ACTION_TOKEN_AUTHORITY_MISSING", "$.public.interactions", `Action token ${token} has no projected authority.`)); });
}

function validatePhases(stages, incidents) {
  const order = { incident: 0, investigation: 1, solution: 2 };
  let previous = -1;
  const seen = new Set();
  stages.forEach((stage, index) => {
    if (!ExperienceV2Contracts.stagePhases.includes(stage.phase)) incidents.push(incident("STAGE_PHASE_INVALID", `$.public.stages[${index}].phase`, "Stage phase must be incident, investigation or solution."));
    else {
      if (order[stage.phase] < previous) incidents.push(incident("STAGE_PHASE_ORDER_INVALID", `$.public.stages[${index}].phase`, "V2 stage phases must be ordered."));
      previous = order[stage.phase]; seen.add(stage.phase);
    }
  });
  ["incident", "investigation", "solution"].forEach(phase => { if (!seen.has(phase)) incidents.push(incident("STAGE_PHASE_REQUIRED", "$.public.stages", `V2 requires a ${phase} stage.`)); });
  if (!object(stages) && stages.some(stage => stage.phase === "debrief")) incidents.push(incident("DEBRIEF_NOT_STAGE", "$.public.stages", "Debrief is terminal content, not a stage phase."));
}

function validatePolicy(policy, path, incidents) {
  if (!object(policy) || policy.provisional !== true || !Array.isArray(policy.thresholds)) { incidents.push(incident("EVALUATION_POLICY_REQUIRED", path, "A provisional V2 evaluation policy is required.")); return; }
  const ordered = [...policy.thresholds].sort((a, b) => a.minimum - b.minimum);
  const expected = ExperienceV2Contracts.provisionalEvaluationPolicy.thresholds;
  if (ordered.length !== expected.length
    || policy.thresholds.some((item, index) => item !== ordered[index])
    || ordered.some((item, index) => !ExperienceV2Contracts.outcomes.includes(item.outcome)
      || item.outcome !== expected[index].outcome
      || item.minimum !== expected[index].minimum
      || item.maximum !== expected[index].maximum)) {
    incidents.push(incident("EVALUATION_POLICY_INVALID", `${path}.thresholds`, "Thresholds must cover 0-100 exactly once with all V2 outcomes and no gaps or overlaps."));
  }
  if (!Array.isArray(policy.mastery_outcomes)
    || policy.mastery_outcomes.length !== ExperienceV2Contracts.provisionalEvaluationPolicy.mastery_outcomes.length
    || policy.mastery_outcomes.some((outcome, index) => outcome !== ExperienceV2Contracts.provisionalEvaluationPolicy.mastery_outcomes[index])) {
    incidents.push(incident("EVALUATION_MASTERY_POLICY_INVALID", `${path}.mastery_outcomes`, "The provisional V2 mastery outcome mapping is invalid."));
  }
}

function validateRuntimeAuthority(candidate, stages, relations, incidents) {
  const decisionPoints = stages.filter(stage => stage.decisions?.length);
  if (!decisionPoints.length) incidents.push(incident("DECISION_POINTS_REQUIRED", "$.public.stages", "An evaluable V2 Runtime requires at least one decision point."));
  const unlockOwner = new Map();
  decisionPoints.forEach((stage, stageIndex) => {
    const ids = new Set(stage.decisions.map(decision => decision.id));
    const authority = relations.filter(relation => relation.stage_id === stage.id && ids.has(relation.decision_id));
    const correct = authority.filter(relation => relation.is_correct === true);
    if (correct.length !== 1) incidents.push(incident("RUNTIME_CORRECTNESS_CARDINALITY", `$.public.stages[${stageIndex}].decisions`, `Runtime decision point ${stage.id} requires exactly one correct authority.`));
    correct.forEach(relation => (relation.evidence_revealed ?? []).forEach(evidenceId => {
      if (unlockOwner.has(evidenceId) && unlockOwner.get(evidenceId) !== relation.decision_id) incidents.push(incident("EVIDENCE_UNLOCK_AMBIGUOUS", "$.private.relations", `Evidence ${evidenceId} is unlocked by multiple correct authorities.`));
      unlockOwner.set(evidenceId, relation.decision_id);
    }));
  });
  const knownStages = new Set(stages.map(stage => stage.id));
  const knownEvidence = new Set((candidate.public?.evidence ?? []).map(evidence => evidence.id));
  relations.forEach((relation, index) => {
    if (relation.is_correct === true && relation.destination !== "COMPLETE" && !knownStages.has(relation.destination)) incidents.push(incident("TRANSITION_DESTINATION_UNKNOWN", `$.private.relations[${index}].destination`, "Correct transition destination is unknown."));
    relation.evidence_revealed?.forEach(id => { if (!knownEvidence.has(id)) incidents.push(incident("EVIDENCE_UNLOCK_UNKNOWN", `$.private.relations[${index}].evidence_revealed`, `Unknown evidence ${id}.`)); });
  });
}

function scanForbidden(value, path, incidents) {
  if (Array.isArray(value)) return value.forEach((item, index) => scanForbidden(item, `${path}[${index}]`, incidents));
  if (!object(value)) return;
  Object.entries(value).forEach(([key, item]) => {
    if (ExperienceV2Contracts.webArtifactForbidden.includes(key)) incidents.push(incident("WEB_ARTIFACT_PRIVATE_FIELD_FORBIDDEN", `${path}.${key}`, `Field ${key} is forbidden in Web Artifact V2.`));
    scanForbidden(item, `${path}.${key}`, incidents);
  });
}

function result(contract, profile, candidate, incidents) {
  const errors = incidents.filter(item => item.severity === "error");
  return Object.freeze({ contract, validation_contract_version: "1.0.0", profile, valid: !errors.length, compatible: !errors.length, errors: Object.freeze(errors), warnings: Object.freeze([]), incidents: Object.freeze(incidents), summary: Object.freeze({ errors: errors.length, warnings: 0 }), authoring_contract_version: candidate?.contract_version ?? null, runtime_contract_version: candidate?.runtime_contract_version ?? null, web_artifact_version: candidate?.web_artifact_version ?? null });
}
