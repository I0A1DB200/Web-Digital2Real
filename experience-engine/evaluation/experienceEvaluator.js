const object = value => Boolean(value) && typeof value === "object" && !Array.isArray(value);

export class ExperienceEvaluationError extends Error {
  constructor(code, message) { super(message); this.name = "ExperienceEvaluationError"; this.code = code; }
}

export function evaluateExperience({ decisionPoints, attemptsByDecision, policy } = {}) {
  if (!Array.isArray(decisionPoints) || !decisionPoints.length) throw new ExperienceEvaluationError("DECISIONS_REQUIRED", "At least one decision point is required.");
  if (new Set(decisionPoints).size !== decisionPoints.length || decisionPoints.some(id => typeof id !== "string" || !id)) throw new ExperienceEvaluationError("DECISIONS_INVALID", "Decision identifiers must be unique strings.");
  if (!object(attemptsByDecision)) throw new ExperienceEvaluationError("ATTEMPTS_INVALID", "Attempts must be keyed by decision.");
  validatePolicy(policy);
  const attempts = decisionPoints.map(id => {
    const count = attemptsByDecision[id];
    if (!Number.isInteger(count) || count < 1) throw new ExperienceEvaluationError("DECISION_UNRESOLVED", `Decision ${id} is unresolved.`);
    return count;
  });
  const totalDecisions = decisionPoints.length;
  const firstAttemptCorrect = attempts.filter(count => count === 1).length;
  const additionalAttempts = attempts.reduce((sum, count) => sum + count - 1, 0);
  const threshold = [...policy.thresholds].reverse().find(item => firstAttemptCorrect * 100 >= item.minimum * totalDecisions);
  if (!threshold) throw new ExperienceEvaluationError("POLICY_NO_MATCH", "Policy does not cover the exact result ratio.");
  return Object.freeze({
    totalDecisions, firstAttemptCorrect, additionalAttempts,
    firstAttemptSuccessRatio: Object.freeze({ numerator: firstAttemptCorrect, denominator: totalDecisions }),
    displayPercentage: Math.round(firstAttemptCorrect * 100 / totalDecisions),
    outcome: threshold.outcome,
    mastered: policy.mastery_outcomes.includes(threshold.outcome)
  });
}

function validatePolicy(policy) {
  if (!object(policy) || !Array.isArray(policy.thresholds) || !policy.thresholds.length || !Array.isArray(policy.mastery_outcomes)) throw new ExperienceEvaluationError("POLICY_INVALID", "A normalized evaluation policy is required.");
  const outcomes = new Set(policy.thresholds.map(item => item.outcome));
  if (policy.mastery_outcomes.some(outcome => !outcomes.has(outcome))) throw new ExperienceEvaluationError("POLICY_INVALID", "Mastery outcomes must exist in policy thresholds.");
}
