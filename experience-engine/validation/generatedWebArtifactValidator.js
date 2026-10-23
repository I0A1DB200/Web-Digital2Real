import { GeneratedWebArtifactV1Schema } from "../schemas/generatedWebArtifactV1Schema.js";
import { validateWebArtifactV2 } from "./experienceV2ContractValidator.js";

const patterns = Object.freeze(Object.fromEntries(
  Object.entries(GeneratedWebArtifactV1Schema.identifierPatterns)
    .map(([name, pattern]) => [name, new RegExp(pattern, "u")])
));
const forbiddenProperties = new Set(GeneratedWebArtifactV1Schema.forbiddenProperties);

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

export function validateGeneratedWebArtifact(candidate) {
  if (candidate?.web_artifact_version === "2.0.0") {
    const base = structuredClone(candidate);
    base.web_artifact_version = GeneratedWebArtifactV1Schema.contractVersion;
    base.public?.stages?.forEach(stage => { delete stage.phase; });
    return validateWebArtifactV2(candidate, validateGeneratedWebArtifact(base).incidents);
  }
  const incidents = [];
  const add = (severity, code, path, message) => {
    incidents.push({ severity, code, path, message });
  };

  if (!plainObject(candidate)) {
    add("error", "WEB_ARTIFACT_OBJECT_REQUIRED", "$", "Web Artifact must be a plain object.");
    return createResult(candidate, "unknown", incidents);
  }

  const profile = classifyProfile(candidate);
  if (!["generated_web_artifact_v1", "generated_web_artifact_unsupported"].includes(profile)) {
    add(
      "error",
      compatibilityCode(profile),
      "$",
      `Input profile ${profile} is not compatible with Generated Web Artifact v1.`
    );
    return createResult(candidate, profile, incidents);
  }

  validateArtifact(candidate, add);
  validatePublicSecurity(candidate, add);
  return createResult(candidate, profile, incidents);
}

function validateArtifact(candidate, add) {
  requireFields(candidate, GeneratedWebArtifactV1Schema.required.root, "$", add);
  if (!Object.hasOwn(candidate, "web_artifact_version")) {
    add(
      "error",
      "WEB_ARTIFACT_VERSION_REQUIRED",
      "$.web_artifact_version",
      "web_artifact_version is required."
    );
  } else if (candidate.web_artifact_version !== GeneratedWebArtifactV1Schema.contractVersion) {
    add(
      "error",
      "WEB_ARTIFACT_VERSION_UNSUPPORTED",
      "$.web_artifact_version",
      `Supported Web Artifact version is ${GeneratedWebArtifactV1Schema.contractVersion}.`
    );
  }

  validateIdentity(candidate.identity, add);
  validateMetadata(candidate.metadata, add);
  validateCapabilities(candidate.capabilities, add);
  validatePublic(candidate.public, add);
}

function validateIdentity(identity, add) {
  if (!requireObject(identity, "$.identity", add)) return;
  requireFields(identity, GeneratedWebArtifactV1Schema.required.identity, "$.identity", add);
  requirePattern(identity.id, patterns.experience, "$.identity.id", "EXPERIENCE_ID_INVALID", add);
  requireText(identity.content_version, "$.identity.content_version", add);
  requireEnum(
    identity.class,
    GeneratedWebArtifactV1Schema.enums.experienceClass,
    "$.identity.class",
    "EXPERIENCE_CLASS_INVALID",
    add
  );
}

function validateMetadata(metadata, add) {
  if (!requireObject(metadata, "$.metadata", add)) return;
  requireFields(metadata, GeneratedWebArtifactV1Schema.required.metadata, "$.metadata", add);
  requirePattern(metadata.slug, patterns.slug, "$.metadata.slug", "SLUG_INVALID", add);
  requireText(metadata.title, "$.metadata.title", add);
  requireText(metadata.summary, "$.metadata.summary", add);
  requirePositiveInteger(
    metadata.estimated_duration,
    "$.metadata.estimated_duration",
    "DURATION_INVALID",
    add
  );
  requireText(metadata.language, "$.metadata.language", add);
}

function validateCapabilities(capabilities, add) {
  if (!requireArray(capabilities, "$.capabilities", add)) return;
  const ids = new Set();
  capabilities.forEach((capability, position) => {
    const path = `$.capabilities[${position}]`;
    if (!requireObject(capability, path, add)) return;
    requireFields(capability, GeneratedWebArtifactV1Schema.required.capability, path, add);
    requirePattern(
      capability.capability_id,
      patterns.capability,
      `${path}.capability_id`,
      "CAPABILITY_ID_INVALID",
      add
    );
    if (ids.has(capability.capability_id)) {
      add(
        "error",
        "CAPABILITY_REFERENCE_DUPLICATE",
        `${path}.capability_id`,
        `Duplicate Capability reference: ${String(capability.capability_id)}.`
      );
    }
    ids.add(capability.capability_id);
    requireStringArray(capability.competency_ids, `${path}.competency_ids`, add);
  });
}

function validatePublic(publicContent, add) {
  if (!requireObject(publicContent, "$.public", add)) return;
  requireFields(publicContent, GeneratedWebArtifactV1Schema.required.public, "$.public", add);
  validateScenario(publicContent.scenario, add);

  const decisionIds = new Set();
  const stageIds = new Set();
  if (requireArray(publicContent.stages, "$.public.stages", add)) {
    publicContent.stages.forEach((stage, position) => {
      const path = `$.public.stages[${position}]`;
      if (!requireObject(stage, path, add)) return;
      requireFields(stage, GeneratedWebArtifactV1Schema.required.stage, path, add);
      validateUniqueId(stage.id, stageIds, `${path}.id`, "STAGE", add);
      requireText(stage.title, `${path}.title`, add);
      requireText(stage.situation, `${path}.situation`, add);
      if (!requireArray(stage.decisions, `${path}.decisions`, add)) return;
      stage.decisions.forEach((decision, decisionPosition) => {
        const decisionPath = `${path}.decisions[${decisionPosition}]`;
        if (!requireObject(decision, decisionPath, add)) return;
        requireFields(
          decision,
          GeneratedWebArtifactV1Schema.required.decision,
          decisionPath,
          add
        );
        validateUniqueId(decision.id, decisionIds, `${decisionPath}.id`, "DECISION", add);
        requireText(decision.action, `${decisionPath}.action`, add);
      });
    });
  }

  validateEvidence(publicContent.evidence, add);
  validateFeedback(publicContent.feedback, decisionIds, add);
  validateVisual(publicContent.visual, add);
}

function validateScenario(scenario, add) {
  if (!requireObject(scenario, "$.public.scenario", add)) return;
  requireFields(scenario, GeneratedWebArtifactV1Schema.required.scenario, "$.public.scenario", add);
  ["initial_context", "operational_state", "initiating_event", "learner_role"].forEach(field => {
    requireText(scenario[field], `$.public.scenario.${field}`, add);
  });
  if (!requireObject(scenario.safety_context, "$.public.scenario.safety_context", add)) return;
  requireFields(
    scenario.safety_context,
    GeneratedWebArtifactV1Schema.required.safetyContext,
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

function validateEvidence(evidence, add) {
  if (!requireArray(evidence, "$.public.evidence", add)) return;
  const ids = new Set();
  evidence.forEach((item, position) => {
    const path = `$.public.evidence[${position}]`;
    if (!requireObject(item, path, add)) return;
    requireFields(item, GeneratedWebArtifactV1Schema.required.evidence, path, add);
    validateUniqueId(item.id, ids, `${path}.id`, "EVIDENCE", add);
    requireEnum(
      item.type,
      GeneratedWebArtifactV1Schema.enums.evidenceType,
      `${path}.type`,
      "EVIDENCE_TYPE_INVALID",
      add
    );
    requireText(item.source, `${path}.source`, add);
    requireText(item.content, `${path}.content`, add);
    requireEnum(
      item.reliability,
      GeneratedWebArtifactV1Schema.enums.evidenceReliability,
      `${path}.reliability`,
      "EVIDENCE_RELIABILITY_INVALID",
      add
    );
    requirePublicVisibility(item.visibility, `${path}.visibility`, "EVIDENCE_NOT_PUBLIC", add);
  });
}

function validateFeedback(feedback, decisionIds, add) {
  if (!requireArray(feedback, "$.public.feedback", add)) return;
  const ids = new Set();
  feedback.forEach((item, position) => {
    const path = `$.public.feedback[${position}]`;
    if (!requireObject(item, path, add)) return;
    requireFields(item, GeneratedWebArtifactV1Schema.required.feedback, path, add);
    validateUniqueId(item.id, ids, `${path}.id`, "FEEDBACK", add);
    requireReference(
      item.decision_id,
      decisionIds,
      `${path}.decision_id`,
      "FEEDBACK_DECISION_UNKNOWN",
      add
    );
    requireText(item.content, `${path}.content`, add);
    requirePublicVisibility(item.visibility, `${path}.visibility`, "FEEDBACK_NOT_PUBLIC", add);
  });
}

function validateVisual(visual, add) {
  if (!requireObject(visual, "$.public.visual", add)) return;
  requireFields(visual, GeneratedWebArtifactV1Schema.required.visual, "$.public.visual", add);
  requireText(visual.educational_purpose, "$.public.visual.educational_purpose", add);
  requireEnum(
    visual.representation,
    GeneratedWebArtifactV1Schema.enums.visualRepresentation,
    "$.public.visual.representation",
    "VISUAL_REPRESENTATION_INVALID",
    add
  );
}

function validatePublicSecurity(candidate, add) {
  const visited = new WeakSet();
  walk(candidate, "$", visited, add);
}

function walk(value, path, visited, add) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      add("error", "NON_SERIALIZABLE_VALUE", path, `${path} must contain a finite number.`);
    }
    return;
  }
  if (typeof value !== "object") {
    add("error", "NON_SERIALIZABLE_VALUE", path, `${path} contains a non-serializable value.`);
    return;
  }
  if (visited.has(value)) {
    add("error", "CIRCULAR_REFERENCE", path, `${path} contains a circular reference.`);
    return;
  }
  visited.add(value);

  if (Array.isArray(value)) {
    value.forEach((item, position) => walk(item, `${path}[${position}]`, visited, add));
    visited.delete(value);
    return;
  }
  if (!plainObject(value)) {
    add("error", "NON_SERIALIZABLE_OBJECT", path, `${path} must contain JSON-compatible objects.`);
    visited.delete(value);
    return;
  }

  Object.keys(value).sort().forEach(key => {
    const propertyPath = `${path}.${key}`;
    if (forbiddenProperties.has(key)) {
      add(
        "error",
        "PRIVATE_PROPERTY_FORBIDDEN",
        propertyPath,
        `Property ${key} is forbidden in a public Web Artifact.`
      );
    }
    walk(value[key], propertyPath, visited, add);
  });
  visited.delete(value);
}

function classifyProfile(candidate) {
  if (Object.hasOwn(candidate, "runtime_contract_version")) return "normalized_runtime_v1";
  if (Object.hasOwn(candidate, "contract_version")
    && plainObject(candidate.public)
    && plainObject(candidate.private)) return "authoring_definition_v1";
  if (Object.hasOwn(candidate, "web_artifact_version")) {
    return candidate.web_artifact_version === GeneratedWebArtifactV1Schema.contractVersion
      ? "generated_web_artifact_v1"
      : "generated_web_artifact_unsupported";
  }
  if (plainObject(candidate.identity)
    && plainObject(candidate.metadata)
    && Array.isArray(candidate.capabilities)
    && plainObject(candidate.public)) return "generated_web_artifact_v1";
  if (Object.hasOwn(candidate, "attempts")
    || Object.hasOwn(candidate, "user_id")
    || Object.hasOwn(candidate, "progress")) return "user_progress";
  if (Object.hasOwn(candidate, "current_stage")
    || Object.hasOwn(candidate, "completed")
    || Object.hasOwn(candidate, "decision_history")) return "player_state";
  if (typeof candidate.id === "string" || plainObject(candidate.experience)) return "legacy_unadapted";
  return "unknown";
}

function compatibilityCode(profile) {
  return {
    authoring_definition_v1: "AUTHORING_DEFINITION_NOT_WEB_ARTIFACT",
    normalized_runtime_v1: "RUNTIME_CONTRACT_NOT_WEB_ARTIFACT",
    legacy_unadapted: "LEGACY_CONTRACT_UNSUPPORTED",
    player_state: "PLAYER_STATE_NOT_WEB_ARTIFACT",
    user_progress: "USER_PROGRESS_NOT_WEB_ARTIFACT",
    unknown: "WEB_ARTIFACT_PROFILE_UNKNOWN"
  }[profile];
}

function validateUniqueId(value, identifiers, path, label, add) {
  requirePattern(value, patterns.local, path, `${label}_ID_INVALID`, add);
  if (typeof value !== "string") return;
  if (identifiers.has(value)) {
    add("error", `${label}_ID_DUPLICATE`, path, `Duplicate ${label.toLowerCase()} id: ${value}.`);
  }
  identifiers.add(value);
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
  add("error", "OBJECT_REQUIRED", path, `${path} must be a plain object.`);
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

function requirePublicVisibility(value, path, code, add) {
  requireEnum(value, GeneratedWebArtifactV1Schema.enums.visibility, path, code, add);
}

function requireReference(value, identifiers, path, code, add) {
  if (typeof value === "string" && identifiers.has(value)) return;
  add("error", code, path, `${path} references an unknown identifier: ${String(value)}.`);
}

function requirePositiveInteger(value, path, code, add) {
  if (Number.isInteger(value) && value > 0) return;
  add("error", code, path, `${path} must be a positive integer.`);
}

function createResult(candidate, profile, incidents) {
  const immutableIncidents = incidents.map(immutableCopy);
  const errors = immutableIncidents.filter(incident => incident.severity === "error");
  const warnings = immutableIncidents.filter(incident => incident.severity === "warning");
  return immutableCopy({
    contract: GeneratedWebArtifactV1Schema.name,
    validation_contract_version: GeneratedWebArtifactV1Schema.validationContractVersion,
    web_artifact_version: typeof candidate?.web_artifact_version === "string"
      ? candidate.web_artifact_version
      : null,
    experience_id: plainObject(candidate?.identity) && typeof candidate.identity.id === "string"
      ? candidate.identity.id
      : typeof candidate?.id === "string"
        ? candidate.id
        : null,
    profile,
    valid: errors.length === 0,
    compatible: profile === "generated_web_artifact_v1" && errors.length === 0,
    errors,
    warnings,
    incidents: immutableIncidents,
    summary: {
      errors: errors.length,
      warnings: warnings.length
    }
  });
}
