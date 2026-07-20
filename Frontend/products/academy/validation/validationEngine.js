import { immutableCopy } from "../core/signalDefinition.js";
import { createValidationResult } from "./validationResult.js";
import { createValidationRules, evaluateRule, ValidationRuleState, ValidationRuleType } from "./validationRules.js";
import { ValidationSession } from "./validationSession.js";

export const ValidationEventType = Object.freeze({ Started: "ValidationStarted", Passed: "ValidationPassed", Failed: "ValidationFailed", Completed: "ValidationCompleted", RulePassed: "RulePassed", RuleFailed: "RuleFailed" });

export class ValidationEngine {
  #rules; #ruleById; #registry; #session = null; #lastResult = null; #subscribers = new Set(); #eventSequence = 0;
  #diagnostics = { evaluations: 0, passedRules: 0, failedRules: 0, lastEvaluation: null, lastCompletion: null, errors: 0, lastError: null, eventCount: 0, subscriberErrorCount: 0 };

  constructor({ rules, signalRegistry = null } = {}) {
    this.#rules = createValidationRules(rules); this.#ruleById = Object.fromEntries(this.#rules.map(rule => [rule.id, rule])); this.#registry = signalRegistry;
  }

  startSession({ id, startTick = 0 } = {}) {
    if (this.#session && this.#session.getSnapshot().state !== "NotStarted") throw new Error("A Validation Session is already active.");
    this.#session = new ValidationSession({ id, startTick, rules: this.#rules }); this.#session.start(); this.#lastResult = null;
    this.#emit(ValidationEventType.Started, { session: this.#session.getSnapshot() }, startTick, startTick);
    return this.getSnapshot();
  }

  evaluate({ tick, timestamp = tick, signals = null } = {}) {
    this.#requireActiveSession(); validateBoundary(tick, timestamp);
    const previousStates = this.#session.getRuleStates();
    const values = this.#resolveValues(signals);
    const states = {}; const visiting = new Set();
    const evaluateById = id => {
      if (states[id]) return states[id];
      if (visiting.has(id)) throw new Error(`Circular runtime rule dependency: ${id}.`);
      visiting.add(id); const rule = this.#ruleById[id];
      for (const dependency of rule.condition.ruleIds ?? []) evaluateById(dependency);
      states[id] = evaluateRule(rule, values, states); visiting.delete(id); return states[id];
    };

    try { this.#rules.forEach(rule => evaluateById(rule.id)); }
    catch (error) { this.#diagnostics.errors += 1; this.#diagnostics.lastError = summarizeError(error); throw error; }

    const triggeredRules = this.#rules.filter(rule => rule.enabled && previousStates[rule.id] !== states[rule.id]).map(rule => rule.id);
    const enabledRuleIds = this.#rules.filter(rule => rule.enabled).map(rule => rule.id);
    const result = createValidationResult({ tick, timestamp, ruleStates: states, triggeredRules, enabledRuleIds });
    this.#session.applyEvaluation({ tick, ruleStates: states, completed: result.completed });
    this.#lastResult = result;
    this.#diagnostics.evaluations += 1; this.#diagnostics.passedRules = result.passed.length; this.#diagnostics.failedRules = result.failed.length;
    this.#diagnostics.lastEvaluation = immutableCopy({ tick, timestamp, status: result.summary.status });

    for (const id of triggeredRules) {
      if (states[id] === ValidationRuleState.Passed) this.#emit(ValidationEventType.RulePassed, { ruleId: id }, tick, timestamp);
      if (states[id] === ValidationRuleState.Failed) this.#emit(ValidationEventType.RuleFailed, { ruleId: id }, tick, timestamp);
    }
    if (triggeredRules.some(id => states[id] === ValidationRuleState.Failed)) this.#emit(ValidationEventType.Failed, { failedRules: result.failed }, tick, timestamp);
    if (result.completed) {
      this.#emit(ValidationEventType.Passed, { passedRules: result.passed }, tick, timestamp);
      this.#emit(ValidationEventType.Completed, { result }, tick, timestamp);
      this.#diagnostics.lastCompletion = immutableCopy({ tick, timestamp, status: "Passed" });
    }
    return result;
  }

  reset() {
    if (this.#session) this.#session.reset(); this.#lastResult = null; this.#eventSequence = 0;
    this.#diagnostics = { evaluations: 0, passedRules: 0, failedRules: 0, lastEvaluation: null, lastCompletion: null, errors: 0, lastError: null, eventCount: 0, subscriberErrorCount: 0 };
    return this.getSnapshot();
  }

  subscribe(subscriber) { if (typeof subscriber !== "function") throw new TypeError("Validation subscriber must be a function."); this.#subscribers.add(subscriber); return () => this.unsubscribe(subscriber); }
  unsubscribe(subscriber) { return this.#subscribers.delete(subscriber); }
  getDiagnostics() { return immutableCopy(this.#diagnostics); }
  getSnapshot() { return immutableCopy({ rules: this.#rules, session: this.#session?.getSnapshot() ?? null, lastResult: this.#lastResult, diagnostics: this.#diagnostics }); }

  #resolveValues(signals) {
    if (signals !== null && (typeof signals !== "object" || Array.isArray(signals))) throw new TypeError("Validation signals must be an object snapshot.");
    const values = {};
    const ids = [...new Set(this.#rules.filter(rule => ![ValidationRuleType.AllRulesPass, ValidationRuleType.AnyRulePass].includes(rule.type)).map(rule => rule.condition.signalId))];
    for (const id of ids) {
      try {
        if (signals && Object.hasOwn(signals, id)) {
          const sample = signals[id]; values[id] = sample && typeof sample === "object" && Object.hasOwn(sample, "currentValue") ? sample.currentValue : sample;
        } else if (this.#registry) values[id] = this.#registry.getSignalValue(id);
      } catch (error) {
        this.#diagnostics.errors += 1; this.#diagnostics.lastError = summarizeError(error);
      }
    }
    return immutableCopy(values);
  }

  #requireActiveSession() { if (!this.#session || this.#session.getSnapshot().state !== "InProgress") throw new Error("Validation Session is not active."); }
  #emit(type, payload, tick, timestamp) {
    const event = immutableCopy({ type, sequence: ++this.#eventSequence, sessionId: this.#session?.getSnapshot().id ?? null, tick, timestamp, ...payload }); this.#diagnostics.eventCount += 1;
    for (const subscriber of this.#subscribers) try { subscriber(event); } catch (error) { this.#diagnostics.subscriberErrorCount += 1; this.#diagnostics.lastError = summarizeError(error); }
  }
}

function validateBoundary(tick, timestamp) { if (!Number.isInteger(tick) || tick < 0) throw new TypeError("Validation tick must be a non-negative integer."); if (typeof timestamp !== "number" || !Number.isFinite(timestamp) || timestamp < 0) throw new TypeError("Validation timestamp must be a finite non-negative number."); }
function summarizeError(error) { return immutableCopy({ code: error?.code ?? "VALIDATION_ERROR", message: error instanceof Error ? error.message : String(error) }); }
