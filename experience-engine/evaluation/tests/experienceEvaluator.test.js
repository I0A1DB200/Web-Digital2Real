import assert from "node:assert/strict";
import test from "node:test";
import { evaluateExperience, ExperienceEvaluationError } from "../experienceEvaluator.js";
import { ExperienceV2Contracts } from "../../schemas/experienceV2Contracts.js";

const policy = ExperienceV2Contracts.provisionalEvaluationPolicy;
const run = attempts => evaluateExperience({ decisionPoints: attempts.map((_, i) => `D${i}`), attemptsByDecision: Object.fromEntries(attempts.map((count, i) => [`D${i}`, count])), policy });

test("evaluates one decision", () => {
  assert.deepEqual(run([1]), { totalDecisions: 1, firstAttemptCorrect: 1, additionalAttempts: 0, firstAttemptSuccessRatio: { numerator: 1, denominator: 1 }, displayPercentage: 100, outcome: "PASS", mastered: true });
  assert.deepEqual({ ...run([2]), firstAttemptSuccessRatio: { ...run([2]).firstAttemptSuccessRatio } }, { totalDecisions: 1, firstAttemptCorrect: 0, additionalAttempts: 1, firstAttemptSuccessRatio: { numerator: 0, denominator: 1 }, displayPercentage: 0, outcome: "RETRY_RECOMMENDED", mastered: false });
});

test("evaluates five-decision outcomes", () => {
  assert.equal(run([1, 1, 1, 1, 2]).outcome, "PASS");
  assert.equal(run([1, 1, 1, 2, 2]).outcome, "PASS_WITH_GUIDANCE");
  assert.equal(run([1, 1, 2, 2, 2]).outcome, "RETRY_RECOMMENDED");
});

test("uses supplied thresholds and mastery mapping", () => {
  const custom = { thresholds: [{ outcome: "LOW", minimum: 0, maximum: 79 }, { outcome: "HIGH", minimum: 80, maximum: 100 }], mastery_outcomes: ["HIGH"] };
  const result = evaluateExperience({ decisionPoints: ["A", "B", "C", "D", "E"], attemptsByDecision: { A: 1, B: 1, C: 1, D: 1, E: 2 }, policy: custom });
  assert.equal(result.outcome, "HIGH"); assert.equal(result.mastered, true);
});

test("handles exact 49, 50, 79 and 80 boundaries", () => {
  const at = first => run([...Array(first).fill(1), ...Array(100 - first).fill(2)]).outcome;
  assert.equal(at(49), "RETRY_RECOMMENDED"); assert.equal(at(50), "PASS_WITH_GUIDANCE");
  assert.equal(at(79), "PASS_WITH_GUIDANCE"); assert.equal(at(80), "PASS");
});

test("classifies fractional exact ratios without rounding into a higher outcome", () => {
  assert.equal(run([...Array(99).fill(1), ...Array(101).fill(2)]).outcome, "RETRY_RECOMMENDED");
  assert.equal(run([...Array(159).fill(1), ...Array(41).fill(2)]).outcome, "PASS_WITH_GUIDANCE");
});

test("derives additional attempts without restoring first-attempt success", () => {
  const result = run([1, 2, 4]); assert.equal(result.firstAttemptCorrect, 1); assert.equal(result.additionalAttempts, 4);
});

test("is deterministic and rejects zero or unresolved decisions", () => {
  assert.deepEqual(run([1, 2, 1]), run([1, 2, 1]));
  assert.throws(() => evaluateExperience({ decisionPoints: [], attemptsByDecision: {}, policy }), error => error instanceof ExperienceEvaluationError && error.code === "DECISIONS_REQUIRED");
  assert.throws(() => evaluateExperience({ decisionPoints: ["A"], attemptsByDecision: {}, policy }), error => error.code === "DECISION_UNRESOLVED");
});
