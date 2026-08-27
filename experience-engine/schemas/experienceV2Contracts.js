const freeze = value => {
  if (Array.isArray(value)) value.forEach(freeze);
  else if (value && typeof value === "object") Object.values(value).forEach(freeze);
  return value && typeof value === "object" ? Object.freeze(value) : value;
};

export const ExperienceV2Contracts = freeze({
  authoringVersion: "2.0.0",
  runtimeVersion: "2.0.0",
  webArtifactVersion: "2.0.0",
  phases: ["incident", "investigation", "solution", "debrief"],
  stagePhases: ["incident", "investigation", "solution"],
  outcomes: ["PASS", "PASS_WITH_GUIDANCE", "RETRY_RECOMMENDED"],
  projectedDecisionOutcomes: ["retry", "advance"],
  projectedDecisionFields: {
    retry: ["action_token", "outcome", "message"],
    advance: ["action_token", "outcome", "next", "unlocks"]
  },
  provisionalEvaluationPolicy: {
    provisional: true,
    mastery_outcomes: ["PASS"],
    thresholds: [
      { outcome: "RETRY_RECOMMENDED", minimum: 0, maximum: 49 },
      { outcome: "PASS_WITH_GUIDANCE", minimum: 50, maximum: 79 },
      { outcome: "PASS", minimum: 80, maximum: 100 }
    ]
  },
  webArtifactForbidden: [
    "private", "relations", "decision_logic", "diagnosis", "fault_model",
    "diagnostic_model", "root_cause", "rationale", "consequence",
    "classification", "score_effect", "safety_effect", "scoring", "debrief",
    "is_correct", "correct", "accepted", "retry_feedback", "correct_answer",
    "answer", "next_stage", "evidence_revealed", "evaluation_policy"
  ]
});
