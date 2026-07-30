const deepFreeze = value => {
  if (Array.isArray(value)) {
    value.forEach(deepFreeze);
    return Object.freeze(value);
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  }
  return value;
};

export const GeneratedWebArtifactV1Schema = deepFreeze({
  name: "Digital2Real Generated Web Artifact",
  contractVersion: "1.0.0",
  validationContractVersion: "1.0.0",
  identifierPatterns: {
    experience: "^EXP-[A-Z0-9]+-[A-Z0-9]+-[0-9]{3}$",
    capability: "^ICF-[0-9]{2}$",
    local: "^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$",
    slug: "^[a-z0-9]+(?:-[a-z0-9]+)*$"
  },
  enums: {
    experienceClass: ["learning", "practice", "assessment"],
    visibility: ["public"],
    visualRepresentation: ["planned", "available"],
    evidenceType: [
      "initial_observation",
      "operator_report",
      "diagnostic",
      "measurement",
      "documentation",
      "inspection",
      "functional_test"
    ],
    evidenceReliability: ["low", "medium", "high", "confirmed"]
  },
  required: {
    root: ["web_artifact_version", "identity", "metadata", "capabilities", "public"],
    identity: ["id", "content_version", "class"],
    metadata: ["slug", "title", "summary", "estimated_duration", "language"],
    capability: ["capability_id", "competency_ids"],
    public: ["scenario", "stages", "evidence", "feedback", "visual"],
    scenario: [
      "initial_context",
      "operational_state",
      "initiating_event",
      "learner_role",
      "safety_context"
    ],
    safetyContext: ["safe_state", "intervention_constraints"],
    stage: ["id", "title", "situation", "decisions"],
    decision: ["id", "action"],
    evidence: ["id", "type", "source", "content", "reliability", "visibility"],
    feedback: ["id", "decision_id", "content", "visibility"],
    visual: ["educational_purpose", "representation"]
  },
  forbiddenProperties: [
    "private",
    "relations",
    "diagnosis",
    "diagnostic_model",
    "fault_model",
    "root_cause",
    "critical_path",
    "decision_logic",
    "destination",
    "next_stage",
    "evidence_revealed",
    "revealed_by",
    "rationale",
    "consequence",
    "classification",
    "scoring",
    "score",
    "score_effect",
    "safety_score",
    "safety_effect",
    "safety_threshold",
    "weights",
    "formula",
    "criteria",
    "correct_answer",
    "answer",
    "solution",
    "debrief",
    "technical_validation",
    "validation_metadata",
    "product_owner",
    "user",
    "user_id",
    "progress",
    "attempts",
    "result"
  ],
  unknownProperties: {
    action: "none",
    securityPrecedence: true,
    description: "Unknown properties produce no incident unless they violate the public security boundary."
  },
  compatibility: {
    profile: "generated_web_artifact_v1",
    implicitAdaptation: false,
    incompatibleProfiles: [
      "authoring_definition_v1",
      "normalized_runtime_v1",
      "legacy_unadapted",
      "player_state",
      "user_progress",
      "generated_web_artifact_unsupported",
      "unknown"
    ]
  }
});
