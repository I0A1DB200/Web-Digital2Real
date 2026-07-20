import { immutableCopy } from "../core/signalDefinition.js";

export const ValidationRuleType = Object.freeze({
  SignalEqualsValue: "SignalEqualsValue",
  SignalNotEqualsValue: "SignalNotEqualsValue",
  SignalTrue: "SignalTrue",
  SignalFalse: "SignalFalse",
  AllRulesPass: "AllRulesPass",
  AnyRulePass: "AnyRulePass"
});

export const ValidationRuleState = Object.freeze({ Pending: "Pending", Passed: "Passed", Failed: "Failed" });
export const ValidationSeverity = Object.freeze({ Information: "Information", Warning: "Warning", Error: "Error", Safety: "Safety", Blocking: "Blocking" });

export class ValidationRuleError extends Error {
  constructor(code, message, context = {}) { super(message); this.name = "ValidationRuleError"; this.code = code; this.context = immutableCopy(context); }
}

export function createValidationRules(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) throw new ValidationRuleError("INVALID_RULE_SET", "At least one Validation rule is required.");
  const ids = new Set();
  const rules = candidates.map(candidate => {
    const rule = createRule(candidate);
    if (ids.has(rule.id)) throw new ValidationRuleError("DUPLICATE_RULE", `Duplicate Validation rule: ${rule.id}.`, { id: rule.id });
    ids.add(rule.id); return rule;
  });
  validateCompositeReferences(rules, ids);
  validateNoCycles(rules);
  return immutableCopy(rules);
}

export function evaluateRule(rule, values, ruleStates) {
  if (!rule.enabled) return ValidationRuleState.Pending;
  if ([ValidationRuleType.AllRulesPass, ValidationRuleType.AnyRulePass].includes(rule.type)) {
    const states = rule.condition.ruleIds.map(id => ruleStates[id] ?? ValidationRuleState.Pending);
    if (rule.type === ValidationRuleType.AllRulesPass) {
      if (states.every(state => state === ValidationRuleState.Passed)) return ValidationRuleState.Passed;
      if (states.some(state => state === ValidationRuleState.Failed)) return ValidationRuleState.Failed;
      return ValidationRuleState.Pending;
    }
    if (states.some(state => state === ValidationRuleState.Passed)) return ValidationRuleState.Passed;
    if (states.every(state => state === ValidationRuleState.Failed)) return ValidationRuleState.Failed;
    return ValidationRuleState.Pending;
  }
  if (!Object.hasOwn(values, rule.condition.signalId)) return ValidationRuleState.Pending;
  const value = values[rule.condition.signalId];
  const passed = {
    [ValidationRuleType.SignalEqualsValue]: () => value === rule.expectedValue,
    [ValidationRuleType.SignalNotEqualsValue]: () => value !== rule.expectedValue,
    [ValidationRuleType.SignalTrue]: () => value === true,
    [ValidationRuleType.SignalFalse]: () => value === false
  }[rule.type]();
  return passed ? ValidationRuleState.Passed : ValidationRuleState.Failed;
}

function createRule(candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) throw new ValidationRuleError("INVALID_RULE", "Validation rule must be an object.");
  const type = enumValue(candidate.type, ValidationRuleType, "type");
  const composite = [ValidationRuleType.AllRulesPass, ValidationRuleType.AnyRulePass].includes(type);
  const condition = composite ? validateCompositeCondition(candidate.condition) : validateSignalCondition(candidate.condition);
  if ([ValidationRuleType.SignalEqualsValue, ValidationRuleType.SignalNotEqualsValue].includes(type) && !Object.hasOwn(candidate, "expectedValue")) throw new ValidationRuleError("INVALID_RULE", `${type} requires expectedValue.`);
  return immutableCopy({
    id: text(candidate.id, "id"), name: text(candidate.name, "name"), description: text(candidate.description, "description"),
    enabled: candidate.enabled !== false, severity: enumValue(candidate.severity, ValidationSeverity, "severity"), type, condition,
    expectedValue: Object.hasOwn(candidate, "expectedValue") ? immutableCopy(candidate.expectedValue) : null,
    initialState: ValidationRuleState.Pending
  });
}

function validateSignalCondition(condition) {
  if (!condition || typeof condition.signalId !== "string" || !condition.signalId.trim()) throw new ValidationRuleError("INVALID_RULE", "Signal rule condition requires signalId.");
  return immutableCopy({ signalId: condition.signalId.trim() });
}
function validateCompositeCondition(condition) {
  if (!condition || !Array.isArray(condition.ruleIds) || condition.ruleIds.length === 0 || condition.ruleIds.some(id => typeof id !== "string" || !id.trim())) throw new ValidationRuleError("INVALID_RULE", "Composite rule condition requires ruleIds.");
  return immutableCopy({ ruleIds: [...new Set(condition.ruleIds.map(id => id.trim()))] });
}
function validateCompositeReferences(rules, ids) {
  for (const rule of rules) for (const id of rule.condition.ruleIds ?? []) {
    if (!ids.has(id) || id === rule.id) throw new ValidationRuleError("INVALID_RULE_REFERENCE", `Rule ${rule.id} references invalid rule ${id}.`, { ruleId: rule.id, reference: id });
  }
}
function validateNoCycles(rules) {
  const graph = Object.fromEntries(rules.map(rule => [rule.id, rule.condition.ruleIds ?? []])); const states = {};
  const visit = id => { if (states[id] === 1) throw new ValidationRuleError("CIRCULAR_RULE_REFERENCE", `Circular rule reference detected at ${id}.`); if (states[id] === 2) return; states[id] = 1; graph[id].forEach(visit); states[id] = 2; };
  rules.forEach(rule => visit(rule.id));
}
function text(value, field) { if (typeof value !== "string" || !value.trim()) throw new ValidationRuleError("INVALID_RULE", `${field} must be a non-empty string.`); return value.trim(); }
function enumValue(value, enumeration, field) { if (!Object.hasOwn(enumeration, value)) throw new ValidationRuleError("INVALID_RULE", `Unsupported ${field}: ${value}.`); return value; }
