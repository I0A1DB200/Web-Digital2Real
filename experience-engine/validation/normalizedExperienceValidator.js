import { NormalizedExperienceV1Schema } from "../schemas/normalizedExperienceV1Schema.js";

const patterns = Object.fromEntries(
  Object.entries(NormalizedExperienceV1Schema.identifierPatterns)
    .map(([name, pattern]) => [name, new RegExp(pattern)])
);

const plainObject = value => Boolean(value)
  && typeof value === "object"
  && !Array.isArray(value);

const immutableCopy = value => {
  if (Array.isArray(value)) {
    return Object.freeze(value.map(immutableCopy));
  }
  if (plainObject(value)) {
    return Object.freeze(Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, immutableCopy(item)])
    ));
  }
  return value;
};

export function validateNormalizedExperience(candidate) {
  const incidents = [];
  const add = (severity, code, path, message) => {
    incidents.push({ severity, code, path, message });
  };

  if (!plainObject(candidate)) {
    add("error", "RUNTIME_OBJECT_REQUIRED", "$", "Normalized runtime input must be an object.");
    return createResult(candidate, "unknown", incidents);
  }

  const profile = classifyProfile(candidate);
  if (profile !== "normalized_runtime_v1") {
    add(
      "error",
      compatibilityCode(profile),
      "$",
      `Input profile ${profile} is not compatible with Normalized Runtime Contract v1.`
    );
    return createResult(candidate, profile, incidents);
  }

  validateRuntime(candidate, add);
  return createResult(candidate, profile, incidents);
}

function validateRuntime(candidate, add) {
  requireFields(candidate, NormalizedExperienceV1Schema.required.root, "$", add);
  if (candidate.runtime_contract_version !== NormalizedExperienceV1Schema.contractVersion) {
    add(
      "error",
      "RUNTIME_CONTRACT_VERSION_UNSUPPORTED",
      "$.runtime_contract_version",
      `Supported runtime contract version is ${NormalizedExperienceV1Schema.contractVersion}.`
    );
  }

  validateIdentity(candidate.identity, add);
  validateCapabilities(candidate.capabilities, add);
  const publicIndex = validatePublic(candidate.public, add);
  validatePrivate(candidate.private, publicIndex, add);
  validateVisibility(candidate, add);
}

function validateIdentity(identity, add) {
  if (!requireObject(identity, "$.identity", add)) return;
  requireFields(identity, NormalizedExperienceV1Schema.required.identity, "$.identity", add);
  requirePattern(identity.id, patterns.experience, "$.identity.id", "EXPERIENCE_ID_INVALID", add);
  requireText(identity.content_version, "$.identity.content_version", add);
  requireEnum(
    identity.class,
    NormalizedExperienceV1Schema.enums.experienceClass,
    "$.identity.class",
    "EXPERIENCE_CLASS_INVALID",
    add
  );
}

function validateCapabilities(capabilities, add) {
  if (!requireArray(capabilities, "$.capabilities", add)) return;
  const capabilityIds = new Set();
  capabilities.forEach((capability, position) => {
    const path = `$.capabilities[${position}]`;
    if (!requireObject(capability, path, add)) return;
    requireFields(capability, NormalizedExperienceV1Schema.required.capability, path, add);
    requirePattern(
      capability.capability_id,
      patterns.capability,
      `${path}.capability_id`,
      "CAPABILITY_ID_INVALID",
      add
    );
    if (capabilityIds.has(capability.capability_id)) {
      add(
        "error",
        "CAPABILITY_REFERENCE_DUPLICATE",
        `${path}.capability_id`,
        `Duplicate Capability reference: ${String(capability.capability_id)}.`
      );
    }
    capabilityIds.add(capability.capability_id);
    requireStringArray(capability.competency_ids, `${path}.competency_ids`, add);
  });
}

function validatePublic(publicModel, add) {
  const empty = { stages: new Set(), decisions: new Set(), evidence: new Set() };
  if (!requireObject(publicModel, "$.public", add)) return empty;
  requireFields(publicModel, NormalizedExperienceV1Schema.required.public, "$.public", add);
  validateMetadata(publicModel.metadata, add);
  validateScenario(publicModel.scenario, add);

  const stageIds = collectIds(publicModel.stages, "$.public.stages", "STAGE", add);
  const decisionIds = new Set();
  const decisionOwners = new Map();
  if (Array.isArray(publicModel.stages)) {
    publicModel.stages.forEach((stage, stagePosition) => {
      const path = `$.public.stages[${stagePosition}]`;
      if (!plainObject(stage)) return;
      requireFields(stage, NormalizedExperienceV1Schema.required.stage, path, add);
      requireText(stage.title, `${path}.title`, add);
      requireText(stage.situation, `${path}.situation`, add);
      if (!requireArray(stage.decisions, `${path}.decisions`, add)) return;
      stage.decisions.forEach((decision, decisionPosition) => {
        const decisionPath = `${path}.decisions[${decisionPosition}]`;
        if (!requireObject(decision, decisionPath, add)) return;
        requireFields(
          decision,
          NormalizedExperienceV1Schema.required.decision,
          decisionPath,
          add
        );
        validateUniqueId(decision.id, decisionIds, `${decisionPath}.id`, "DECISION", add);
        requireText(decision.action, `${decisionPath}.action`, add);
        if (typeof decision.id === "string") {
          decisionOwners.set(decision.id, stage.id);
        }
      });
    });
  }

  const evidenceIds = collectIds(publicModel.evidence, "$.public.evidence", "EVIDENCE", add);
  if (Array.isArray(publicModel.evidence)) {
    publicModel.evidence.forEach((evidence, position) => {
      const path = `$.public.evidence[${position}]`;
      if (!plainObject(evidence)) return;
      requireFields(evidence, NormalizedExperienceV1Schema.required.evidence, path, add);
      requireEnum(
        evidence.type,
        NormalizedExperienceV1Schema.enums.evidenceType,
        `${path}.type`,
        "EVIDENCE_TYPE_INVALID",
        add
      );
      requireText(evidence.source, `${path}.source`, add);
      requireText(evidence.content, `${path}.content`, add);
      requireEnum(
        evidence.reliability,
        NormalizedExperienceV1Schema.enums.evidenceReliability,
        `${path}.reliability`,
        "EVIDENCE_RELIABILITY_INVALID",
        add
      );
    });
  }
  validateVisual(publicModel.visual, add);
  return { stages: stageIds, decisions: decisionIds, decisionOwners, evidence: evidenceIds };
}

function validateMetadata(metadata, add) {
  if (!requireObject(metadata, "$.public.metadata", add)) return;
  requireFields(metadata, NormalizedExperienceV1Schema.required.metadata, "$.public.metadata", add);
  requirePattern(metadata.slug, patterns.slug, "$.public.metadata.slug", "SLUG_INVALID", add);
  requireText(metadata.title, "$.public.metadata.title", add);
  requireText(metadata.summary, "$.public.metadata.summary", add);
  requirePositiveInteger(
    metadata.estimated_duration,
    "$.public.metadata.estimated_duration",
    "DURATION_INVALID",
    add
  );
  requireText(metadata.language, "$.public.metadata.language", add);
}

function validateScenario(scenario, add) {
  if (!requireObject(scenario, "$.public.scenario", add)) return;
  requireFields(scenario, NormalizedExperienceV1Schema.required.scenario, "$.public.scenario", add);
  ["initial_context", "operational_state", "initiating_event", "learner_role"].forEach(field => {
    requireText(scenario[field], `$.public.scenario.${field}`, add);
  });
  if (!requireObject(scenario.safety_context, "$.public.scenario.safety_context", add)) return;
  requireFields(
    scenario.safety_context,
    NormalizedExperienceV1Schema.required.safetyContext,
    "$.public.scenario.safety_context",
    add
  );
  requireText(scenario.safety_context.safe_state, "$.public.scenario.safety_context.safe_state", add);
  requireStringArray(
    scenario.safety_context.intervention_constraints,
    "$.public.scenario.safety_context.intervention_constraints",
    add
  );
}

function validateVisual(visual, add) {
  if (!requireObject(visual, "$.public.visual", add)) return;
  requireFields(visual, NormalizedExperienceV1Schema.required.visual, "$.public.visual", add);
  requireText(visual.educational_purpose, "$.public.visual.educational_purpose", add);
  requireEnum(
    visual.representation,
    NormalizedExperienceV1Schema.enums.visualRepresentation,
    "$.public.visual.representation",
    "VISUAL_REPRESENTATION_INVALID",
    add
  );
}

function validatePrivate(privateModel, publicIndex, add) {
  if (!requireObject(privateModel, "$.private", add)) return;
  requireFields(privateModel, NormalizedExperienceV1Schema.required.private, "$.private", add);
  const feedbackIds = validateFeedback(privateModel.feedback, add);
  validateRelations(privateModel.relations, publicIndex, feedbackIds, add);
  validateDiagnosis(privateModel.diagnosis, add);
  validateScoring(privateModel.scoring, add);
  validateDebrief(privateModel.debrief, add);
}

function validateRelations(relations, publicIndex, feedbackIds, add) {
  if (!requireArray(relations, "$.private.relations", add)) return;
  const resolved = new Set();
  relations.forEach((relation, position) => {
    const path = `$.private.relations[${position}]`;
    if (!requireObject(relation, path, add)) return;
    requireFields(relation, NormalizedExperienceV1Schema.required.relation, path, add);
    requireReference(
      relation.stage_id,
      publicIndex.stages,
      `${path}.stage_id`,
      "RELATION_STAGE_UNKNOWN",
      add
    );
    requireReference(
      relation.decision_id,
      publicIndex.decisions,
      `${path}.decision_id`,
      "RELATION_DECISION_UNKNOWN",
      add
    );
    if (publicIndex.decisionOwners?.get(relation.decision_id) !== relation.stage_id) {
      add(
        "error",
        "RELATION_DECISION_STAGE_MISMATCH",
        `${path}.decision_id`,
        `Decision ${String(relation.decision_id)} does not belong to stage ${String(relation.stage_id)}.`
      );
    }
    if (resolved.has(relation.decision_id)) {
      add(
        "error",
        "RELATION_DUPLICATE",
        `${path}.decision_id`,
        `Decision ${String(relation.decision_id)} has more than one relation.`
      );
    }
    resolved.add(relation.decision_id);
    if (!publicIndex.stages.has(relation.destination)
      && !NormalizedExperienceV1Schema.enums.terminal.includes(relation.destination)) {
      add(
        "error",
        "RELATION_DESTINATION_UNKNOWN",
        `${path}.destination`,
        `Unknown relation destination: ${String(relation.destination)}.`
      );
    }
    validateReferenceArray(
      relation.evidence_revealed,
      publicIndex.evidence,
      `${path}.evidence_revealed`,
      "RELATION_EVIDENCE_UNKNOWN",
      add
    );
    requireReference(
      relation.feedback_id,
      feedbackIds,
      `${path}.feedback_id`,
      "RELATION_FEEDBACK_UNKNOWN",
      add
    );
    requireInteger(relation.score_effect, `${path}.score_effect`, "SCORE_EFFECT_INVALID", add);
    requireInteger(relation.safety_effect, `${path}.safety_effect`, "SAFETY_EFFECT_INVALID", add);
    if (Object.hasOwn(relation, "time_cost")) {
      requireNonNegativeInteger(relation.time_cost, `${path}.time_cost`, "TIME_COST_INVALID", add);
    }
  });
  publicIndex.decisions.forEach(decisionId => {
    if (!resolved.has(decisionId)) {
      add(
        "error",
        "RELATION_REQUIRED",
        "$.private.relations",
        `Decision ${decisionId} must resolve to exactly one private relation.`
      );
    }
  });
}

function validateFeedback(feedback, add) {
  const ids = collectIds(feedback, "$.private.feedback", "FEEDBACK", add);
  if (!Array.isArray(feedback)) return ids;
  feedback.forEach((item, position) => {
    const path = `$.private.feedback[${position}]`;
    if (!plainObject(item)) return;
    requireFields(item, NormalizedExperienceV1Schema.required.feedback, path, add);
    requireEnum(
      item.classification,
      NormalizedExperienceV1Schema.enums.decisionClassification,
      `${path}.classification`,
      "FEEDBACK_CLASSIFICATION_INVALID",
      add
    );
    requireText(item.rationale, `${path}.rationale`, add);
    requireText(item.consequence, `${path}.consequence`, add);
  });
  return ids;
}

function validateDiagnosis(diagnosis, add) {
  if (!requireObject(diagnosis, "$.private.diagnosis", add)) return;
  requireFields(diagnosis, NormalizedExperienceV1Schema.required.diagnosis, "$.private.diagnosis", add);
  requireText(diagnosis.root_cause, "$.private.diagnosis.root_cause", add);
  requireStringArray(diagnosis.recovery_conditions, "$.private.diagnosis.recovery_conditions", add);
}

function validateScoring(scoring, add) {
  if (!requireObject(scoring, "$.private.scoring", add)) return;
  requireFields(scoring, NormalizedExperienceV1Schema.required.scoring, "$.private.scoring", add);
  if (scoring.purpose !== NormalizedExperienceV1Schema.scoring.purpose) {
    add("error", "SCORING_PURPOSE_INVALID", "$.private.scoring.purpose", "Scoring purpose must be session_feedback.");
  }
  ["initial_score", "minimum_score", "maximum_score", "safety_threshold"].forEach(field => {
    requireInteger(scoring[field], `$.private.scoring.${field}`, "SCORING_VALUE_INVALID", add);
  });
  if (Number.isInteger(scoring.minimum_score)
    && Number.isInteger(scoring.maximum_score)
    && scoring.minimum_score > scoring.maximum_score) {
    add("error", "SCORING_BOUNDS_INVALID", "$.private.scoring", "minimum_score must not exceed maximum_score.");
  }
  if (Number.isInteger(scoring.initial_score)
    && Number.isInteger(scoring.minimum_score)
    && Number.isInteger(scoring.maximum_score)
    && (scoring.initial_score < scoring.minimum_score
      || scoring.initial_score > scoring.maximum_score)) {
    add("error", "SCORING_INITIAL_OUT_OF_RANGE", "$.private.scoring.initial_score", "initial_score must be within the configured bounds.");
  }
}

function validateDebrief(debrief, add) {
  if (!requireObject(debrief, "$.private.debrief", add)) return;
  requireFields(debrief, NormalizedExperienceV1Schema.required.debrief, "$.private.debrief", add);
  requireText(debrief.fault_summary, "$.private.debrief.fault_summary", add);
  requireStringArray(debrief.correct_reasoning, "$.private.debrief.correct_reasoning", add);
  requireStringArray(debrief.recovery, "$.private.debrief.recovery", add);
}

function validateVisibility(candidate, add) {
  if (plainObject(candidate.public)) {
    NormalizedExperienceV1Schema.visibility.privateOnly.forEach(field => {
      if (Object.hasOwn(candidate.public, field)) {
        add("error", "PRIVATE_FIELD_IN_PUBLIC", `$.public.${field}`, `Private field ${field} must not be declared under public.`);
      }
    });
  }
  if (plainObject(candidate.private)) {
    NormalizedExperienceV1Schema.visibility.publicOnly.forEach(field => {
      if (Object.hasOwn(candidate.private, field)) {
        add("error", "PUBLIC_FIELD_IN_PRIVATE", `$.private.${field}`, `Public field ${field} must not be declared under private.`);
      }
    });
  }
}

function classifyProfile(candidate) {
  if (Object.hasOwn(candidate, "runtime_contract_version")) return "normalized_runtime_v1";
  if (Object.hasOwn(candidate, "contract_version")
    && plainObject(candidate.metadata)
    && plainObject(candidate.public)
    && plainObject(candidate.private)) return "authoring_definition_v1";
  if (Object.hasOwn(candidate, "artifact_version")
    || Object.hasOwn(candidate, "artifact_format_version")) return "generated_web_artifact";
  if (Object.hasOwn(candidate, "current_stage")
    || Object.hasOwn(candidate, "completed")
    || Object.hasOwn(candidate, "decision_history")) return "player_progress_state";
  if (typeof candidate.id === "string" || plainObject(candidate.experience)) return "legacy_unadapted";
  return "unknown";
}

function compatibilityCode(profile) {
  return {
    authoring_definition_v1: "AUTHORING_DEFINITION_REQUIRES_NORMALIZATION",
    generated_web_artifact: "GENERATED_ARTIFACT_NOT_RUNTIME_MODEL",
    player_progress_state: "PLAYER_STATE_NOT_RUNTIME_MODEL",
    legacy_unadapted: "LEGACY_CONTRACT_UNSUPPORTED",
    unknown: "RUNTIME_PROFILE_UNKNOWN"
  }[profile];
}

function collectIds(items, path, label, add) {
  const ids = new Set();
  if (!requireArray(items, path, add)) return ids;
  items.forEach((item, position) => {
    const itemPath = `${path}[${position}]`;
    if (!requireObject(item, itemPath, add)) return;
    validateUniqueId(item.id, ids, `${itemPath}.id`, label, add);
  });
  return ids;
}

function validateUniqueId(value, ids, path, label, add) {
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
      add("error", "REQUIRED_FIELD_MISSING", `${path}.${field}`, `Required field is missing: ${field}.`);
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
  value.forEach((item, position) => requireText(item, `${path}[${position}]`, add));
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

function createResult(candidate, profile, incidents) {
  const immutableIncidents = incidents.map(immutableCopy);
  const errors = immutableIncidents.filter(incident => incident.severity === "error");
  const warnings = immutableIncidents.filter(incident => incident.severity === "warning");
  return immutableCopy({
    contract: NormalizedExperienceV1Schema.name,
    validation_contract_version: NormalizedExperienceV1Schema.validationContractVersion,
    runtime_contract_version: typeof candidate?.runtime_contract_version === "string"
      ? candidate.runtime_contract_version
      : null,
    experience_id: plainObject(candidate?.identity) && typeof candidate.identity.id === "string"
      ? candidate.identity.id
      : typeof candidate?.id === "string"
        ? candidate.id
        : null,
    profile,
    valid: errors.length === 0,
    compatible: profile === "normalized_runtime_v1" && errors.length === 0,
    errors,
    warnings,
    incidents: immutableIncidents,
    summary: {
      errors: errors.length,
      warnings: warnings.length
    }
  });
}
