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

export const NormalizedExperienceV1Schema = deepFreeze({
  name: "Digital2Real Normalized Experience Runtime Contract",
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
    terminal: ["COMPLETE", "BLOCKED"],
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
    visualRepresentation: ["planned", "available"]
  },
  required: {
    root: [
      "runtime_contract_version",
      "identity",
      "capabilities",
      "public",
      "private"
    ],
    identity: ["id", "content_version", "class"],
    capability: ["capability_id", "competency_ids"],
    public: ["metadata", "scenario", "stages", "evidence", "visual"],
    metadata: ["slug", "title", "summary", "estimated_duration", "language"],
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
    evidence: ["id", "type", "source", "content", "reliability"],
    visual: ["educational_purpose", "representation"],
    private: ["relations", "diagnosis", "feedback", "scoring", "debrief"],
    relation: [
      "stage_id",
      "decision_id",
      "destination",
      "evidence_revealed",
      "feedback_id",
      "score_effect",
      "safety_effect"
    ],
    diagnosis: ["root_cause", "recovery_conditions"],
    feedback: ["id", "classification", "rationale", "consequence"],
    scoring: [
      "purpose",
      "initial_score",
      "minimum_score",
      "maximum_score",
      "safety_threshold"
    ],
    debrief: ["fault_summary", "correct_reasoning", "recovery"]
  },
  relationshipAuthority: {
    collection: "$.private.relations",
    key: ["stage_id", "decision_id"],
    rule: "Every public decision resolves to exactly one private relation."
  },
  visibility: {
    publicOnly: ["metadata", "scenario", "stages", "evidence", "visual"],
    privateOnly: ["relations", "diagnosis", "feedback", "scoring", "debrief"]
  },
  scoring: {
    purpose: "session_feedback"
  },
  compatibility: {
    normalizedProfile: "normalized_runtime_v1",
    incompatibleProfiles: [
      "authoring_definition_v1",
      "legacy_unadapted",
      "generated_web_artifact",
      "player_progress_state",
      "unknown"
    ],
    implicitAdaptation: false
  }
});
