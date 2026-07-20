import assert from "node:assert/strict";
import test from "node:test";

import { SignalRegistry } from "../core/signalRegistry.js";
import { ValidationEngine } from "../validation/validationEngine.js";
import { ValidationRuleType as T } from "../validation/validationRules.js";

const rule = (overrides = {}) => ({
  id: "rule-running", name: "Running", description: "The observed running signal is true.", enabled: true,
  severity: "Error", type: T.SignalTrue, condition: { signalId: "sig.machine.running" }, ...overrides
});
const start = engine => engine.startSession({ id: "session-001", startTick: 0 });

test("registers immutable rule definitions with separate runtime state", () => {
  const input = rule(); const engine = new ValidationEngine({ rules: [input] }); input.name = "Changed"; const snapshot = engine.getSnapshot();
  assert.equal(snapshot.rules[0].name, "Running"); assert.equal(snapshot.rules[0].initialState, "Pending"); assert.equal(snapshot.session, null);
  assert.equal(Object.isFrozen(snapshot.rules[0]), true); assert.equal(Object.isFrozen(snapshot), true);
});

test("evaluates Signal True and Signal False rules", () => {
  const engine = new ValidationEngine({ rules: [rule(), rule({ id: "rule-stopped", name: "Stopped", type: T.SignalFalse, condition: { signalId: "sig.machine.stopped" } })] }); start(engine);
  const result = engine.evaluate({ tick: 1, signals: { "sig.machine.running": true, "sig.machine.stopped": false } });
  assert.deepEqual(result.passed, ["rule-running", "rule-stopped"]); assert.equal(result.completed, true); assert.equal(result.summary.status, "Passed");
});

test("evaluates Equals and Not Equals without coercion", () => {
  const engine = new ValidationEngine({ rules: [
    rule({ id: "rule-mode", name: "Mode", type: T.SignalEqualsValue, condition: { signalId: "sig.machine.mode" }, expectedValue: "Running" }),
    rule({ id: "rule-no-fault", name: "No Fault", type: T.SignalNotEqualsValue, condition: { signalId: "sig.machine.fault" }, expectedValue: "Active" })
  ] }); start(engine);
  const result = engine.evaluate({ tick: 1, signals: { "sig.machine.mode": "Running", "sig.machine.fault": "None" } });
  assert.equal(result.completed, true); assert.equal(result.failed.length, 0);
});

test("reports failed and pending rules deterministically", () => {
  const engine = new ValidationEngine({ rules: [rule(), rule({ id: "rule-missing", name: "Missing", condition: { signalId: "sig.missing" } })] }); start(engine);
  const result = engine.evaluate({ tick: 1, signals: { "sig.machine.running": false } });
  assert.deepEqual(result.failed, ["rule-running"]); assert.deepEqual(result.pending, ["rule-missing"]); assert.equal(result.completed, false);
});

test("evaluates All and Any composite rules independently of declaration order", () => {
  const engine = new ValidationEngine({ rules: [
    rule({ id: "rule-all", name: "All", type: T.AllRulesPass, condition: { ruleIds: ["rule-a", "rule-b"] } }),
    rule({ id: "rule-any", name: "Any", type: T.AnyRulePass, condition: { ruleIds: ["rule-a", "rule-b"] } }),
    rule({ id: "rule-a", name: "A", condition: { signalId: "sig.a" } }),
    rule({ id: "rule-b", name: "B", condition: { signalId: "sig.b" } })
  ] }); start(engine);
  const result = engine.evaluate({ tick: 1, signals: { "sig.a": true, "sig.b": false } });
  assert.equal(result.failed.includes("rule-all"), true); assert.equal(result.passed.includes("rule-any"), true);
});

test("rejects duplicate, malformed and circular rule definitions", () => {
  assert.throws(() => new ValidationEngine({ rules: [rule(), rule()] }), error => error.code === "DUPLICATE_RULE");
  assert.throws(() => new ValidationEngine({ rules: [rule({ type: "Script" })] }), error => error.code === "INVALID_RULE");
  assert.throws(() => new ValidationEngine({ rules: [
    rule({ id: "a", name: "A", type: T.AllRulesPass, condition: { ruleIds: ["b"] } }),
    rule({ id: "b", name: "B", type: T.AllRulesPass, condition: { ruleIds: ["a"] } })
  ] }), error => error.code === "CIRCULAR_RULE_REFERENCE");
});

test("maintains Validation Session lifecycle and progress", () => {
  const engine = new ValidationEngine({ rules: [rule()] }); const started = start(engine);
  assert.equal(started.session.state, "InProgress"); assert.equal(started.session.startTick, 0);
  const failed = engine.evaluate({ tick: 1, signals: { "sig.machine.running": false } }); assert.equal(failed.completed, false);
  const passed = engine.evaluate({ tick: 2, signals: { "sig.machine.running": true } }); assert.equal(passed.completed, true);
  const session = engine.getSnapshot().session; assert.equal(session.currentTick, 2); assert.equal(session.evaluationCount, 2); assert.equal(session.completionState, "Completed");
});

test("reads Signal Registry values without modifying Registry state", () => {
  const registry = new SignalRegistry(); registry.register({
    id: "sig.machine.running", displayName: "Running", description: "Machine running feedback.", namespace: "Machine/Test/Running", category: "Digital Input",
    dataType: "Boolean", owner: "Machine", source: "Sensor", consumers: ["Validation"], accessMode: "Read Only", scope: "Lab attempt",
    persistenceMode: "Attempt", engineeringUnit: null, defaultValue: false, metadata: {}, initialQuality: "Simulated"
  });
  registry.updateSignal("sig.machine.running", { value: true, writer: "Machine", timestamp: 20 });
  const before = registry.getDiagnostics(); const engine = new ValidationEngine({ rules: [rule()], signalRegistry: registry }); start(engine);
  assert.equal(engine.evaluate({ tick: 1, timestamp: 20 }).completed, true); assert.deepEqual(registry.getDiagnostics(), before);
});

test("emits immutable lifecycle and rule events while isolating subscriber failures", () => {
  const events = []; const engine = new ValidationEngine({ rules: [rule()] });
  engine.subscribe(() => { throw new Error("observer failed"); }); engine.subscribe(event => events.push(event)); start(engine);
  engine.evaluate({ tick: 1, signals: { "sig.machine.running": false } });
  engine.evaluate({ tick: 2, signals: { "sig.machine.running": true } });
  assert.deepEqual(events.map(event => event.type), ["ValidationStarted", "RuleFailed", "ValidationFailed", "RulePassed", "ValidationPassed", "ValidationCompleted"]);
  assert.equal(events.every(Object.isFrozen), true); assert.equal(engine.getDiagnostics().subscriberErrorCount, events.length);
});

test("returns immutable Results and diagnostics", () => {
  const engine = new ValidationEngine({ rules: [rule()] }); start(engine); const result = engine.evaluate({ tick: 1, signals: { "sig.machine.running": false } });
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result.summary), true); assert.equal(Object.isFrozen(engine.getDiagnostics()), true);
  assert.throws(() => { result.failed.push("other"); }, TypeError);
});

test("Reset clears runtime state while preserving definitions", () => {
  const engine = new ValidationEngine({ rules: [rule()] }); start(engine); engine.evaluate({ tick: 1, signals: { "sig.machine.running": false } });
  const reset = engine.reset(); assert.equal(reset.session.state, "NotStarted"); assert.equal(reset.session.evaluationCount, 0); assert.equal(reset.rules.length, 1); assert.equal(reset.diagnostics.evaluations, 0);
  engine.startSession({ id: "session-002", startTick: 0 }); assert.equal(engine.evaluate({ tick: 1, signals: { "sig.machine.running": true } }).completed, true);
});

test("identical evaluations produce identical Results, Events and diagnostics", () => {
  const execute = () => { const events = []; const engine = new ValidationEngine({ rules: [rule()] }); engine.subscribe(event => events.push(event)); start(engine); const first = engine.evaluate({ tick: 1, signals: { "sig.machine.running": false } }); const second = engine.evaluate({ tick: 2, signals: { "sig.machine.running": true } }); return { first, second, events, snapshot: engine.getSnapshot() }; };
  assert.deepEqual(execute(), execute());
});
