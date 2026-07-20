import { immutableCopy } from "../core/signalDefinition.js";
import { ValidationRuleState } from "./validationRules.js";

export const ValidationSessionState = Object.freeze({ NotStarted: "NotStarted", InProgress: "InProgress", Completed: "Completed" });

export class ValidationSession {
  #id; #startTick; #currentTick; #state = ValidationSessionState.NotStarted; #evaluationCount = 0; #ruleStates;

  constructor({ id, startTick, rules } = {}) {
    if (typeof id !== "string" || !id.trim()) throw new TypeError("Validation Session id must be a non-empty string.");
    if (!Number.isInteger(startTick) || startTick < 0) throw new TypeError("Validation Session startTick must be a non-negative integer.");
    this.#id = id.trim(); this.#startTick = startTick; this.#currentTick = startTick;
    this.#ruleStates = Object.fromEntries(rules.map(rule => [rule.id, ValidationRuleState.Pending]));
  }

  start() { if (this.#state !== ValidationSessionState.NotStarted) throw new Error("Validation Session is already started."); this.#state = ValidationSessionState.InProgress; return this.getSnapshot(); }
  applyEvaluation({ tick, ruleStates, completed }) {
    if (this.#state !== ValidationSessionState.InProgress) throw new Error("Validation Session is not active.");
    if (!Number.isInteger(tick) || tick < this.#currentTick) throw new Error("Validation tick must be monotonic.");
    this.#currentTick = tick; this.#evaluationCount += 1; this.#ruleStates = { ...ruleStates };
    if (completed) this.#state = ValidationSessionState.Completed;
    return this.getSnapshot();
  }
  reset() { this.#currentTick = this.#startTick; this.#state = ValidationSessionState.NotStarted; this.#evaluationCount = 0; this.#ruleStates = Object.fromEntries(Object.keys(this.#ruleStates).map(id => [id, ValidationRuleState.Pending])); return this.getSnapshot(); }
  getRuleStates() { return immutableCopy(this.#ruleStates); }
  getSnapshot() {
    const passedRules = Object.keys(this.#ruleStates).filter(id => this.#ruleStates[id] === ValidationRuleState.Passed);
    const failedRules = Object.keys(this.#ruleStates).filter(id => this.#ruleStates[id] === ValidationRuleState.Failed);
    return immutableCopy({ id: this.#id, startTick: this.#startTick, currentTick: this.#currentTick, state: this.#state, passedRules, failedRules, evaluationCount: this.#evaluationCount, completionState: this.#state === ValidationSessionState.Completed ? "Completed" : "Incomplete", ruleStates: this.#ruleStates });
  }
}
