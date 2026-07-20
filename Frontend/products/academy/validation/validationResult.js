import { immutableCopy } from "../core/signalDefinition.js";
import { ValidationRuleState } from "./validationRules.js";

export function createValidationResult({ tick, timestamp, ruleStates, triggeredRules, enabledRuleIds }) {
  const passed = enabledRuleIds.filter(id => ruleStates[id] === ValidationRuleState.Passed);
  const failed = enabledRuleIds.filter(id => ruleStates[id] === ValidationRuleState.Failed);
  const pending = enabledRuleIds.filter(id => ruleStates[id] === ValidationRuleState.Pending);
  const completed = enabledRuleIds.length > 0 && passed.length === enabledRuleIds.length;
  return immutableCopy({
    tick, timestamp, passed, failed, pending, completed, triggeredRules,
    summary: { status: completed ? "Passed" : failed.length > 0 ? "Failed" : "Pending", total: enabledRuleIds.length, passed: passed.length, failed: failed.length, pending: pending.length }
  });
}
