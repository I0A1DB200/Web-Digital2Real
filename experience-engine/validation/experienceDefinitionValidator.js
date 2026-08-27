import { ExperienceDefinitionV1Schema } from "../schemas/experienceDefinitionV1Schema.js";
import { validateAuthoringV2 } from "./experienceV2ContractValidator.js";

const plainObject = value => value !== null
  && typeof value === "object"
  && Object.getPrototypeOf(value) === Object.prototype;

const immutableCopy = value => {
  if (Array.isArray(value)) return Object.freeze(value.map(immutableCopy));
  if (plainObject(value)) {
    return Object.freeze(Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, immutableCopy(item)])
    ));
  }
  return value;
};

const patterns = Object.freeze(Object.fromEntries(
  Object.entries(ExperienceDefinitionV1Schema.identifierPatterns)
    .map(([name, pattern]) => [name, new RegExp(pattern, "u")])
));

export function validateExperienceDefinition(candidate) {
  if (candidate?.contract_version === "2.0.0") {
    const base = structuredClone(candidate);
    base.contract_version = ExperienceDefinitionV1Schema.contractVersion;
    base.public?.stages?.forEach(stage => { delete stage.phase; });
    base.private?.decision_logic?.forEach(logic => { delete logic.is_correct; delete logic.retry_feedback; });
    if (base.private) delete base.private.evaluation_policy;
    return validateAuthoringV2(candidate, validateExperienceDefinition(base).incidents);
  }
  const incidents = [];
  const add = (severity, code, path, message) => {
    incidents.push({ severity, code, path, message });
  };

  if (!plainObject(candidate)) {
    add("error", "DEFINITION_NOT_OBJECT", "$", "Experience Definition must be a plain object.");
    return createResult(candidate, "invalid", incidents);
  }

  if (isLegacy(candidate)) {
    add(
      "error",
      "LEGACY_CONTRACT_UNSUPPORTED",
      "$.contract_version",
      "Legacy Experience content is not implicitly adapted to Experience Definition v1."
    );
    return createResult(candidate, ExperienceDefinitionV1Schema.legacyProfile, incidents);
  }

  validateContract(candidate, add);
  validateMetadata(candidate.metadata, add);
  validateClassification(candidate.classification, add);
  const capabilityIndex = validateCapabilities(candidate.capability_references, add);
  const publicIndex = validatePublic(candidate.public, capabilityIndex, add);
  validatePrivate(candidate.private, publicIndex, add);
  validateVisibility(candidate, add);

  return createResult(candidate, "authoring_v1", incidents);
}

function validateContract(candidate, add) {
  requireFields(candidate, ExperienceDefinitionV1Schema.required.root, "$", add);
  if (!Object.hasOwn(candidate, "contract_version")) return;
  if (typeof candidate.contract_version !== "string" || !candidate.contract_version.trim()) {
    add(
      "error",
      "CONTRACT_VERSION_INVALID_TYPE",
      "$.contract_version",
      "contract_version must be a non-empty string."
    );
  } else if (candidate.contract_version !== ExperienceDefinitionV1Schema.contractVersion) {
    add(
      "error",
      "CONTRACT_VERSION_UNSUPPORTED",
      "$.contract_version",
      `Unsupported authoring contract version: ${candidate.contract_version}.`
    );
  }
}

function validateMetadata(metadata, add) {
  if (!requireObject(metadata, "$.metadata", add)) return;
  requireFields(metadata, ExperienceDefinitionV1Schema.required.metadata, "$.metadata", add);
  requirePattern(metadata.id, patterns.experience, "$.metadata.id", "EXPERIENCE_ID_INVALID", add);
  requirePattern(
    metadata.editorial_id,
    patterns.experienceEditorial,
    "$.metadata.editorial_id",
    "EXPERIENCE_EDITORIAL_ID_INVALID",
    add
  );
  requireText(metadata.content_version, "$.metadata.content_version", add);
  requireEnum(
    metadata.class,
    ExperienceDefinitionV1Schema.enums.experienceClass,
    "$.metadata.class",
    "EXPERIENCE_CLASS_INVALID",
    add
  );
  requireEnum(
    metadata.access,
    ExperienceDefinitionV1Schema.enums.access,
    "$.metadata.access",
    "EXPERIENCE_ACCESS_INVALID",
    add
  );
  requireEnum(
    metadata.status,
    ExperienceDefinitionV1Schema.enums.status,
    "$.metadata.status",
    "EXPERIENCE_STATUS_INVALID",
    add
  );
  requireText(metadata.language, "$.metadata.language", add);
}

function validateClassification(classification, add) {
  if (!requireObject(classification, "$.classification", add)) return;
  requireFields(
    classification,
    ExperienceDefinitionV1Schema.required.classification,
    "$.classification",
    add
  );
  ["platform", "domain", "industry", "machine_type"].forEach(field => {
    requireText(classification[field], `$.classification.${field}`, add);
  });
  requireEnum(
    classification.difficulty,
    ExperienceDefinitionV1Schema.enums.difficulty,
    "$.classification.difficulty",
    "DIFFICULTY_INVALID",
    add
  );
}

function validateCapabilities(references, add) {
  const index = new Map();
  if (!requireArray(references, "$.capability_references", add)) return index;
  if (!references.length) {
    add(
      "error",
      "CAPABILITY_REFERENCE_REQUIRED",
      "$.capability_references",
      "At least one governed Capability reference is required."
    );
  }

  references.forEach((reference, position) => {
    const path = `$.capability_references[${position}]`;
    if (!requireObject(reference, path, add)) return;
    requireFields(
      reference,
      ExperienceDefinitionV1Schema.required.capabilityReference,
      path,
      add
    );
    requirePattern(
      reference.capability_id,
      patterns.capability,
      `${path}.capability_id`,
      "CAPABILITY_ID_INVALID",
      add
    );
    if (typeof reference.capability_id === "string") {
      if (index.has(reference.capability_id)) {
        add(
          "error",
          "CAPABILITY_REFERENCE_DUPLICATE",
          `${path}.capability_id`,
          `Duplicate Capability reference: ${reference.capability_id}.`
        );
      } else {
        index.set(reference.capability_id, new Set());
      }
    }

    if (!requireArray(reference.competency_ids, `${path}.competency_ids`, add)) return;
    if (!reference.competency_ids.length) {
      add(
        "error",
        "COMPETENCY_REFERENCE_REQUIRED",
        `${path}.competency_ids`,
        "A Capability reference must include at least one competency identifier."
      );
    }
    const competencies = index.get(reference.capability_id) ?? new Set();
    reference.competency_ids.forEach((id, competencyPosition) => {
      const competencyPath = `${path}.competency_ids[${competencyPosition}]`;
      requirePattern(id, patterns.local, competencyPath, "COMPETENCY_ID_INVALID", add);
      if (competencies.has(id)) {
        add(
          "error",
          "COMPETENCY_REFERENCE_DUPLICATE",
          competencyPath,
          `Duplicate competency reference: ${id}.`
        );
      }
      competencies.add(id);
    });
    if (typeof reference.capability_id === "string" && !index.has(reference.capability_id)) {
      index.set(reference.capability_id, competencies);
    }
  });

  return index;
}

function validatePublic(publicContent, capabilityIndex, add) {
  const emptyIndex = {
    stages: new Set(),
    evidence: new Set(),
    decisions: new Set()
  };
  if (!requireObject(publicContent, "$.public", add)) return emptyIndex;
  requireFields(publicContent, ExperienceDefinitionV1Schema.required.public, "$.public", add);

  requirePattern(
    publicContent.slug,
    patterns.slug,
    "$.public.slug",
    "EXPERIENCE_SLUG_INVALID",
    add
  );
  ["title", "summary"].forEach(field => requireText(publicContent[field], `$.public.${field}`, add));
  requirePositiveInteger(
    publicContent.estimated_duration,
    "$.public.estimated_duration",
    "ESTIMATED_DURATION_INVALID",
    add
  );

  validateScenario(publicContent.scenario, add);
  validateLearningObjectives(publicContent.learning_objectives, capabilityIndex, add);
  const stageIds = collectIds(publicContent.stages, "$.public.stages", "STAGE", add);
  const evidenceIds = collectIds(publicContent.evidence, "$.public.evidence", "EVIDENCE", add);
  const decisionIds = collectIds(publicContent.decisions, "$.public.decisions", "DECISION", add);

  validateEvidence(publicContent.evidence, decisionIds, add);
  validatePublicDecisions(publicContent.decisions, stageIds, add);
  validateStages(publicContent.stages, stageIds, evidenceIds, decisionIds, publicContent.decisions, add);
  validateVisual(publicContent.visual, add);

  return { stages: stageIds, evidence: evidenceIds, decisions: decisionIds };
}

function validateScenario(scenario, add) {
  if (!requireObject(scenario, "$.public.scenario", add)) return;
  requireFields(scenario, ExperienceDefinitionV1Schema.required.scenario, "$.public.scenario", add);
  ["initial_context", "operational_state", "initiating_event", "learner_role"].forEach(field => {
    requireText(scenario[field], `$.public.scenario.${field}`, add);
  });
  if (!requireObject(scenario.safety_context, "$.public.scenario.safety_context", add)) return;
  requireFields(
    scenario.safety_context,
    ExperienceDefinitionV1Schema.required.safetyContext,
    "$.public.scenario.safety_context",
    add
  );
  requireText(
    scenario.safety_context.safe_state,
    "$.public.scenario.safety_context.safe_state",
    add
  );
  requireStringArray(
    scenario.safety_context.intervention_constraints,
    "$.public.scenario.safety_context.intervention_constraints",
    add
  );
}

function validateLearningObjectives(objectives, capabilityIndex, add) {
  if (!requireArray(objectives, "$.public.learning_objectives", add)) return;
  if (!objectives.length) {
    add(
      "error",
      "LEARNING_OBJECTIVE_REQUIRED",
      "$.public.learning_objectives",
      "At least one learning objective is required."
    );
  }
  const ids = new Set();
  objectives.forEach((objective, position) => {
    const path = `$.public.learning_objectives[${position}]`;
    if (!requireObject(objective, path, add)) return;
    requireFields(
      objective,
      ExperienceDefinitionV1Schema.required.learningObjective,
      path,
      add
    );
    validateUniqueLocalId(objective.id, ids, `${path}.id`, "LEARNING_OBJECTIVE", add);
    requireText(objective.description, `${path}.description`, add);
    if (!capabilityIndex.has(objective.capability_id)) {
      add(
        "error",
        "LEARNING_OBJECTIVE_CAPABILITY_UNKNOWN",
        `${path}.capability_id`,
        `Unknown Capability reference: ${String(objective.capability_id)}.`
      );
    } else if (!capabilityIndex.get(objective.capability_id).has(objective.competency_id)) {
      add(
        "error",
        "LEARNING_OBJECTIVE_COMPETENCY_UNKNOWN",
        `${path}.competency_id`,
        `Unknown competency reference: ${String(objective.competency_id)}.`
      );
    }
  });
}

function validateEvidence(evidence, decisionIds, add) {
  if (!Array.isArray(evidence)) return;
  evidence.forEach((item, position) => {
    const path = `$.public.evidence[${position}]`;
    if (!plainObject(item)) return;
    requireFields(item, ExperienceDefinitionV1Schema.required.evidence, path, add);
    requireEnum(
      item.type,
      ExperienceDefinitionV1Schema.enums.evidenceType,
      `${path}.type`,
      "EVIDENCE_TYPE_INVALID",
      add
    );
    requireText(item.source, `${path}.source`, add);
    requireText(item.content, `${path}.content`, add);
    requireEnum(
      item.reliability,
      ExperienceDefinitionV1Schema.enums.evidenceReliability,
      `${path}.reliability`,
      "EVIDENCE_RELIABILITY_INVALID",
      add
    );
    validateReferenceArray(
      item.revealed_by,
      decisionIds,
      `${path}.revealed_by`,
      "EVIDENCE_REVEAL_DECISION_UNKNOWN",
      add
    );
  });
}

function validatePublicDecisions(decisions, stageIds, add) {
  if (!Array.isArray(decisions)) return;
  decisions.forEach((decision, position) => {
    const path = `$.public.decisions[${position}]`;
    if (!plainObject(decision)) return;
    requireFields(decision, ExperienceDefinitionV1Schema.required.publicDecision, path, add);
    requireReference(
      decision.stage_id,
      stageIds,
      `${path}.stage_id`,
      "DECISION_STAGE_UNKNOWN",
      add
    );
    requireText(decision.action, `${path}.action`, add);
  });
}

function validateStages(stages, stageIds, evidenceIds, decisionIds, decisions, add) {
  if (!Array.isArray(stages)) return;
  const decisionOwners = new Map(
    Array.isArray(decisions)
      ? decisions.filter(plainObject).map(decision => [decision.id, decision.stage_id])
      : []
  );
  stages.forEach((stage, position) => {
    const path = `$.public.stages[${position}]`;
    if (!plainObject(stage)) return;
    requireFields(stage, ExperienceDefinitionV1Schema.required.stage, path, add);
    requireText(stage.title, `${path}.title`, add);
    requireText(stage.situation, `${path}.situation`, add);
    validateReferenceArray(
      stage.evidence_ids,
      evidenceIds,
      `${path}.evidence_ids`,
      "STAGE_EVIDENCE_UNKNOWN",
      add
    );
    validateReferenceArray(
      stage.decision_ids,
      decisionIds,
      `${path}.decision_ids`,
      "STAGE_DECISION_UNKNOWN",
      add
    );
    if (Array.isArray(stage.decision_ids)) {
      stage.decision_ids.forEach((id, referencePosition) => {
        if (decisionOwners.has(id) && decisionOwners.get(id) !== stage.id) {
          add(
            "error",
            "STAGE_DECISION_OWNER_MISMATCH",
            `${path}.decision_ids[${referencePosition}]`,
            `Decision ${id} belongs to ${decisionOwners.get(id)}, not ${stage.id}.`
          );
        }
      });
    }
  });
  if (stageIds.size === 0) {
    add("error", "STAGE_REQUIRED", "$.public.stages", "At least one stage is required.");
  }
}

function validateVisual(visual, add) {
  if (!requireObject(visual, "$.public.visual", add)) return;
  requireFields(visual, ExperienceDefinitionV1Schema.required.visual, "$.public.visual", add);
  requireText(visual.educational_purpose, "$.public.visual.educational_purpose", add);
  requireEnum(
    visual.representation,
    ExperienceDefinitionV1Schema.enums.visualRepresentation,
    "$.public.visual.representation",
    "VISUAL_REPRESENTATION_INVALID",
    add
  );
}

function validatePrivate(privateContent, publicIndex, add) {
  if (!requireObject(privateContent, "$.private", add)) return;
  requireFields(privateContent, ExperienceDefinitionV1Schema.required.private, "$.private", add);
  validateFaultModel(privateContent.fault_model, add);
  validateDiagnosticModel(privateContent.diagnostic_model, publicIndex.decisions, add);
  validateDecisionLogic(privateContent.decision_logic, publicIndex, add);
  validateScoring(privateContent.scoring, add);
  validateDebrief(privateContent.debrief, add);
  validateTechnicalValidation(privateContent.technical_validation, add);
}

function validateFaultModel(faultModel, add) {
  if (!requireObject(faultModel, "$.private.fault_model", add)) return;
  requireFields(
    faultModel,
    ExperienceDefinitionV1Schema.required.faultModel,
    "$.private.fault_model",
    add
  );
  requireText(faultModel.root_cause, "$.private.fault_model.root_cause", add);
  requireStringArray(
    faultModel.recovery_conditions,
    "$.private.fault_model.recovery_conditions",
    add
  );
}

function validateDiagnosticModel(model, decisionIds, add) {
  if (!requireObject(model, "$.private.diagnostic_model", add)) return;
  requireFields(
    model,
    ExperienceDefinitionV1Schema.required.diagnosticModel,
    "$.private.diagnostic_model",
    add
  );
  const hypothesisIds = collectIds(
    model.hypotheses,
    "$.private.diagnostic_model.hypotheses",
    "HYPOTHESIS",
    add
  );
  if (Array.isArray(model.hypotheses)) {
    model.hypotheses.forEach((hypothesis, position) => {
      const path = `$.private.diagnostic_model.hypotheses[${position}]`;
      if (!plainObject(hypothesis)) return;
      requireFields(
        hypothesis,
        ExperienceDefinitionV1Schema.required.hypothesis,
        path,
        add
      );
      requireText(hypothesis.statement, `${path}.statement`, add);
      requireEnum(
        hypothesis.initial_status,
        ExperienceDefinitionV1Schema.enums.hypothesisStatus,
        `${path}.initial_status`,
        "HYPOTHESIS_STATUS_INVALID",
        add
      );
    });
  }
  requireReference(
    model.confirmed_root_cause,
    hypothesisIds,
    "$.private.diagnostic_model.confirmed_root_cause",
    "ROOT_CAUSE_HYPOTHESIS_UNKNOWN",
    add
  );
  validateReferenceArray(
    model.critical_path,
    decisionIds,
    "$.private.diagnostic_model.critical_path",
    "CRITICAL_PATH_DECISION_UNKNOWN",
    add
  );
}

function validateDecisionLogic(logic, publicIndex, add) {
  if (!requireArray(logic, "$.private.decision_logic", add)) return;
  const logicIds = new Set();
  logic.forEach((item, position) => {
    const path = `$.private.decision_logic[${position}]`;
    if (!requireObject(item, path, add)) return;
    requireFields(item, ExperienceDefinitionV1Schema.required.decisionLogic, path, add);
    requireReference(
      item.decision_id,
      publicIndex.decisions,
      `${path}.decision_id`,
      "DECISION_LOGIC_REFERENCE_UNKNOWN",
      add
    );
    if (logicIds.has(item.decision_id)) {
      add(
        "error",
        "DECISION_LOGIC_DUPLICATE",
        `${path}.decision_id`,
        `Duplicate decision logic: ${String(item.decision_id)}.`
      );
    }
    logicIds.add(item.decision_id);
    requireText(item.rationale, `${path}.rationale`, add);
    requireEnum(
      item.classification,
      ExperienceDefinitionV1Schema.enums.decisionClassification,
      `${path}.classification`,
      "DECISION_CLASSIFICATION_INVALID",
      add
    );
    requireText(item.consequence, `${path}.consequence`, add);
    validateReferenceArray(
      item.evidence_revealed,
      publicIndex.evidence,
      `${path}.evidence_revealed`,
      "DECISION_EVIDENCE_UNKNOWN",
      add
    );
    if (!publicIndex.stages.has(item.next_stage)
      && !ExperienceDefinitionV1Schema.enums.terminal.includes(item.next_stage)) {
      add(
        "error",
        "DECISION_DESTINATION_UNKNOWN",
        `${path}.next_stage`,
        `Unknown decision destination: ${String(item.next_stage)}.`
      );
    }
    requireInteger(item.score_effect, `${path}.score_effect`, "SCORE_EFFECT_INVALID", add);
    requireInteger(item.safety_effect, `${path}.safety_effect`, "SAFETY_EFFECT_INVALID", add);
    if (Object.hasOwn(item, "time_cost")) {
      requireNonNegativeInteger(item.time_cost, `${path}.time_cost`, "TIME_COST_INVALID", add);
    }
  });

  publicIndex.decisions.forEach(id => {
    if (!logicIds.has(id)) {
      add(
        "error",
        "DECISION_LOGIC_REQUIRED",
        "$.private.decision_logic",
        `Decision ${id} has no private decision logic.`
      );
    }
  });
}

function validateScoring(scoring, add) {
  if (!requireObject(scoring, "$.private.scoring", add)) return;
  requireFields(scoring, ExperienceDefinitionV1Schema.required.scoring, "$.private.scoring", add);
  ExperienceDefinitionV1Schema.scoring.explicitlyOutOfScopeFields.forEach(field => {
    if (Object.hasOwn(scoring, field)) {
      add(
        "error",
        "SCORING_FIELD_OUT_OF_SCOPE",
        `$.private.scoring.${field}`,
        `Scoring field ${field} is outside the approved authoring scope.`
      );
    }
  });
  if (scoring.purpose !== ExperienceDefinitionV1Schema.scoring.purpose) {
    add(
      "error",
      "SCORING_PURPOSE_INVALID",
      "$.private.scoring.purpose",
      "Scoring purpose must be session_feedback."
    );
  }
  ["initial_score", "minimum_score", "maximum_score", "safety_threshold"].forEach(field => {
    requireInteger(
      scoring[field],
      `$.private.scoring.${field}`,
      "SCORING_VALUE_INVALID",
      add
    );
  });
  if (Number.isInteger(scoring.minimum_score)
    && Number.isInteger(scoring.maximum_score)
    && scoring.minimum_score > scoring.maximum_score) {
    add(
      "error",
      "SCORING_BOUNDS_INVALID",
      "$.private.scoring",
      "minimum_score must not exceed maximum_score."
    );
  }
  if (Number.isInteger(scoring.initial_score)
    && Number.isInteger(scoring.minimum_score)
    && Number.isInteger(scoring.maximum_score)
    && (scoring.initial_score < scoring.minimum_score
      || scoring.initial_score > scoring.maximum_score)) {
    add(
      "error",
      "SCORING_INITIAL_OUT_OF_RANGE",
      "$.private.scoring.initial_score",
      "initial_score must be within the configured bounds."
    );
  }
}

function validateDebrief(debrief, add) {
  if (!requireObject(debrief, "$.private.debrief", add)) return;
  requireFields(debrief, ExperienceDefinitionV1Schema.required.debrief, "$.private.debrief", add);
  requireText(debrief.fault_summary, "$.private.debrief.fault_summary", add);
  requireStringArray(debrief.correct_reasoning, "$.private.debrief.correct_reasoning", add);
  requireStringArray(debrief.recovery, "$.private.debrief.recovery", add);
}

function validateTechnicalValidation(validation, add) {
  if (!requireObject(validation, "$.private.technical_validation", add)) return;
  requireFields(
    validation,
    ExperienceDefinitionV1Schema.required.technicalValidation,
    "$.private.technical_validation",
    add
  );
  requireEnum(
    validation.status,
    ExperienceDefinitionV1Schema.enums.technicalValidation,
    "$.private.technical_validation.status",
    "TECHNICAL_VALIDATION_STATUS_INVALID",
    add
  );
  requireStringArray(validation.evidence, "$.private.technical_validation.evidence", add);
}

function validateVisibility(candidate, add) {
  if (plainObject(candidate.public)) {
    ExperienceDefinitionV1Schema.visibility.privateOnly.forEach(field => {
      if (Object.hasOwn(candidate.public, field)) {
        add(
          "error",
          "PRIVATE_FIELD_IN_PUBLIC",
          `$.public.${field}`,
          `Private field ${field} must not be declared under public.`
        );
      }
    });
  }
  if (plainObject(candidate.private)) {
    ExperienceDefinitionV1Schema.visibility.publicOnly.forEach(field => {
      if (Object.hasOwn(candidate.private, field)) {
        add(
          "error",
          "PUBLIC_FIELD_IN_PRIVATE",
          `$.private.${field}`,
          `Public field ${field} must not be declared under private.`
        );
      }
    });
  }
}

function collectIds(items, path, label, add) {
  const ids = new Set();
  if (!requireArray(items, path, add)) return ids;
  items.forEach((item, position) => {
    const itemPath = `${path}[${position}]`;
    if (!requireObject(item, itemPath, add)) return;
    validateUniqueLocalId(item.id, ids, `${itemPath}.id`, label, add);
  });
  return ids;
}

function validateUniqueLocalId(value, ids, path, label, add) {
  requirePattern(value, patterns.local, path, `${label}_ID_INVALID`, add);
  if (typeof value !== "string") return;
  if (ids.has(value)) {
    add("error", `${label}_ID_DUPLICATE`, path, `Duplicate ${label.toLowerCase()} id: ${value}.`);
  }
  ids.add(value);
}

function requireFields(object, fields, path, add) {
  fields.forEach(field => {
    if (!Object.hasOwn(object, field)) {
      add(
        "error",
        field === "contract_version" ? "CONTRACT_VERSION_REQUIRED" : "REQUIRED_FIELD_MISSING",
        `${path}.${field}`,
        `Required field is missing: ${field}.`
      );
    }
  });
}

function requireObject(value, path, add) {
  if (plainObject(value)) return true;
  add("error", "OBJECT_REQUIRED", path, `${path} must be an object.`);
  return false;
}

function requireArray(value, path, add) {
  if (Array.isArray(value)) return true;
  add("error", "ARRAY_REQUIRED", path, `${path} must be an array.`);
  return false;
}

function requireText(value, path, add) {
  if (typeof value === "string" && value.trim()) return;
  add("error", "TEXT_REQUIRED", path, `${path} must be a non-empty string.`);
}

function requireStringArray(value, path, add) {
  if (!requireArray(value, path, add)) return;
  value.forEach((item, position) => {
    if (typeof item !== "string" || !item.trim()) {
      add(
        "error",
        "TEXT_REQUIRED",
        `${path}[${position}]`,
        `${path}[${position}] must be a non-empty string.`
      );
    }
  });
}

function requirePattern(value, pattern, path, code, add) {
  if (typeof value === "string" && pattern.test(value)) return;
  add("error", code, path, `${path} has an invalid identifier format.`);
}

function requireEnum(value, allowed, path, code, add) {
  if (allowed.includes(value)) return;
  add("error", code, path, `${path} must be one of: ${allowed.join(", ")}.`);
}

function requireReference(value, identifiers, path, code, add) {
  if (typeof value === "string" && identifiers.has(value)) return;
  add("error", code, path, `${path} references an unknown identifier: ${String(value)}.`);
}

function validateReferenceArray(value, identifiers, path, code, add) {
  if (!requireArray(value, path, add)) return;
  value.forEach((reference, position) => {
    requireReference(reference, identifiers, `${path}[${position}]`, code, add);
  });
}

function requireInteger(value, path, code, add) {
  if (Number.isInteger(value)) return;
  add("error", code, path, `${path} must be an integer.`);
}

function requirePositiveInteger(value, path, code, add) {
  if (Number.isInteger(value) && value > 0) return;
  add("error", code, path, `${path} must be a positive integer.`);
}

function requireNonNegativeInteger(value, path, code, add) {
  if (Number.isInteger(value) && value >= 0) return;
  add("error", code, path, `${path} must be a non-negative integer.`);
}

function isLegacy(candidate) {
  if (Object.hasOwn(candidate, "contract_version")) return false;
  if (plainObject(candidate.public) || plainObject(candidate.private)) return false;
  return typeof candidate.id === "string" || plainObject(candidate.experience);
}

function createResult(candidate, profile, incidents) {
  const immutableIncidents = incidents.map(incident => immutableCopy(incident));
  const errors = immutableIncidents.filter(incident => incident.severity === "error");
  const warnings = immutableIncidents.filter(incident => incident.severity === "warning");
  const result = {
    contract: ExperienceDefinitionV1Schema.name,
    validation_contract_version: ExperienceDefinitionV1Schema.validationContractVersion,
    authoring_contract_version: typeof candidate?.contract_version === "string"
      ? candidate.contract_version
      : null,
    definition_id: plainObject(candidate?.metadata) && typeof candidate.metadata.id === "string"
      ? candidate.metadata.id
      : typeof candidate?.id === "string"
        ? candidate.id
        : null,
    profile,
    valid: errors.length === 0,
    compatible: profile === "authoring_v1" && errors.length === 0,
    errors,
    warnings,
    incidents: immutableIncidents,
    summary: {
      errors: errors.length,
      warnings: warnings.length
    }
  };
  return immutableCopy(result);
}
