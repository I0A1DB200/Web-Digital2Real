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
    stages.filter(stage => stage.decision_ids?.length).forEach((stage, position) => {
      const entries = stage.decision_ids.map(id => logicById.get(id)).filter(Boolean);
      const correct = entries.filter(item => item.is_correct === true).length;
      if (correct !== 1) incidents.push(incident("DECISION_CORRECTNESS_CARDINALITY", `$.public.stages[${position}].decision_ids`, `Decision point ${stage.id} requires exactly one correct option; received ${correct}.`));
      entries.filter(item => item.is_correct === false).forEach(item => {
        if (typeof item.retry_feedback !== "string" || !item.retry_feedback.trim()) {
          incidents.push(incident("RETRY_FEEDBACK_REQUIRED", `$.private.decision_logic.${item.decision_id}.retry_feedback`, "Every incorrect V2 option requires learner-safe retry feedback."));
        }
      });
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
  });
  validatePolicy(candidate.private?.evaluation_policy, "$.private.evaluation_policy", incidents);
  return result("Digital2Real Normalized Experience Runtime Contract V2", "normalized_runtime_v2", candidate, incidents);
}

export function validateWebArtifactV2(candidate, baseIncidents = []) {
  const incidents = [...baseIncidents];
  if (candidate?.web_artifact_version !== ExperienceV2Contracts.webArtifactVersion) incidents.push(incident("WEB_ARTIFACT_VERSION_UNSUPPORTED", "$.web_artifact_version", "Web Artifact V2 requires version 2.0.0."));
  scanForbidden(candidate, "$", incidents);
  const stages = candidate.public?.stages;
  if (!Array.isArray(stages)) incidents.push(incident("V2_STAGES_REQUIRED", "$.public.stages", "Web Artifact V2 stages are required."));
  else validatePhases(stages, incidents);
  return result("Digital2Real Generated Web Artifact V2", "generated_web_artifact_v2", candidate, incidents);
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
