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

export const ExperienceDefinitionV1Schema = deepFreeze({
  name: "Digital2Real Experience Authoring Definition",
  contractVersion: "1.0.0",
  validationContractVersion: "1.0.0",
  legacyProfile: "legacy_unadapted",
  identifierPatterns: {
    experience: "^EXP-[A-Z0-9]+-[A-Z0-9]+-[0-9]{3}$",
    capability: "^ICF-[0-9]{2}$",
    local: "^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$",
    slug: "^[a-z0-9]+(?:-[a-z0-9]+)*$"
  },
  enums: {
    experienceClass: ["learning", "practice", "assessment"],
    status: ["draft", "technical_review", "approved", "published", "archived"],
    difficulty: ["foundation", "intermediate", "advanced", "expert"],
    decisionClassification: ["strong", "acceptable", "weak", "unsafe"],
    evidenceType: [
      "initial_observation",
      "operator_report",
      "diagnostic",
      "measurement",
      "documentation",
      "inspection",
      "functional_test"
    ],
    evidenceReliability: ["low", "medium", "high", "confirmed"],
    hypothesisStatus: ["possible", "likely", "unlikely"],
    terminal: ["COMPLETE", "BLOCKED"],
    visualRepresentation: ["planned", "available"],
    technicalValidation: ["pending", "pass", "pass_with_warnings", "blocked"]
  },
  required: {
    root: [
      "contract_version",
      "metadata",
      "classification",
      "capability_references",
      "public",
      "private"
    ],
    metadata: ["id", "content_version", "class", "status", "language"],
    classification: ["platform", "domain", "industry", "machine_type", "difficulty"],
    capabilityReference: ["capability_id", "competency_ids"],
    public: [
      "slug",
      "title",
      "summary",
      "estimated_duration",
      "scenario",
      "learning_objectives",
      "stages",
      "evidence",
      "decisions",
      "visual"
    ],
    scenario: [
      "initial_context",
      "operational_state",
      "initiating_event",
      "learner_role",
      "safety_context"
    ],
    safetyContext: ["safe_state", "intervention_constraints"],
    learningObjective: [
      "id",
      "description",
      "capability_id",
      "competency_id"
    ],
    stage: ["id", "title", "situation", "evidence_ids", "decision_ids"],
    evidence: ["id", "type", "source", "content", "reliability", "revealed_by"],
    publicDecision: ["id", "stage_id", "action"],
    visual: ["educational_purpose", "representation"],
    private: [
      "fault_model",
      "diagnostic_model",
      "decision_logic",
      "scoring",
      "debrief",
      "technical_validation"
    ],
    faultModel: ["root_cause", "recovery_conditions"],
    diagnosticModel: ["hypotheses", "confirmed_root_cause", "critical_path"],
    hypothesis: ["id", "statement", "initial_status"],
    decisionLogic: [
      "decision_id",
      "rationale",
      "classification",
      "consequence",
      "evidence_revealed",
      "next_stage",
      "score_effect",
      "safety_effect"
    ],
    scoring: [
      "purpose",
      "initial_score",
      "minimum_score",
      "maximum_score",
      "safety_threshold"
    ],
    debrief: ["fault_summary", "correct_reasoning", "recovery"],
    technicalValidation: ["status", "evidence"]
  },
  visibility: {
    publicOnly: [
      "slug",
      "title",
      "summary",
      "estimated_duration",
      "scenario",
      "learning_objectives",
      "stages",
      "evidence",
      "decisions",
      "visual"
    ],
    privateOnly: [
      "fault_model",
      "diagnostic_model",
      "decision_logic",
      "scoring",
      "debrief",
      "technical_validation"
    ]
  },
  scoring: {
    purpose: "session_feedback",
    allowedFields: [
      "purpose",
      "initial_score",
      "minimum_score",
      "maximum_score",
      "safety_threshold"
    ],
    explicitlyOutOfScopeFields: [
      "dimensions",
      "weights",
      "result",
      "user_result",
      "capability_validation"
    ]
  },
  unknownProperties: {
    action: "none",
    description: "Unknown properties are preserved and produce no error, warning, removal, normalization, or default."
  },
  compatibility: {
    implicitLegacyAdaptation: false,
    legacyClassification: "legacy_unadapted",
    legacyEligibleForV1: false
  }
});
