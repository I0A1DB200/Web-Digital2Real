import assert from "node:assert/strict";
import test from "node:test";
import { SignalRegistry } from "../core/signalRegistry.js";

const signal = (overrides = {}) => ({
  id: "sig.machine.conveyor01.running", displayName: "Motor running", description: "Reports committed physical motor operation.",
  namespace: "Machine/Conveyor01/Sensors/MotorRunning", category: "Digital Input", dataType: "Boolean", owner: "Machine", source: "MotorRunningSensor",
  consumers: ["PLC", "Validation"], accessMode: "Read Only", scope: "Lab attempt", persistenceMode: "Attempt", engineeringUnit: null,
  defaultValue: false, metadata: {}, initialQuality: "Simulated", ...overrides
});

test("registers a valid signal and returns isolated immutable snapshots", () => {
  const registry = new SignalRegistry(); const input = signal(); const definition = registry.register(input); input.metadata.external = true;
  assert.equal(registry.has(input.id), true); assert.equal(registry.getSignalValue(input.id), false); assert.equal(definition.metadata.external, undefined);
  assert.equal(Object.isFrozen(definition), true); assert.equal(Object.isFrozen(registry.getSignalState(input.id)), true);
});

test("rejects duplicates and malformed definitions", () => {
  const registry = new SignalRegistry(); registry.register(signal());
  assert.throws(() => registry.register(signal()), error => error.code === "DUPLICATE_SIGNAL");
  assert.throws(() => new SignalRegistry().register(signal({ namespace: "Invalid" })), error => error.code === "INVALID_NAMESPACE");
  assert.throws(() => new SignalRegistry().register(signal({ displayName: "" })), error => error.code === "INVALID_SIGNAL_DEFINITION");
});

test("bulk registration validates atomically", () => {
  const registry = new SignalRegistry();
  assert.throws(() => registry.registerMany([signal(), signal({ id: "sig.machine.second", namespace: "Invalid" })]));
  assert.equal(registry.getDiagnostics().registeredSignalCount, 0);
});

test("enforces ownership, types, values and deterministic state transitions", () => {
  const registry = new SignalRegistry(); registry.register(signal());
  assert.throws(() => registry.updateSignal(signal().id, { value: true, writer: "PLC", timestamp: 20 }), error => error.code === "WRITE_ACCESS_DENIED");
  assert.throws(() => registry.updateSignal(signal().id, { value: "true", writer: "Machine", timestamp: 20 }), error => error.code === "INVALID_VALUE_TYPE");
  const changed = registry.updateSignal(signal().id, { value: true, writer: "Machine", timestamp: 20 });
  assert.deepEqual([changed.previousValue, changed.currentValue, changed.changed, changed.updateCount], [false, true, true, 1]);
  assert.equal(registry.updateSignal(signal().id, { value: true, writer: "Machine", timestamp: 40 }).changed, false);
  const enumRegistry = new SignalRegistry();
  enumRegistry.register(signal({ id: "sig.system.runtime.status", namespace: "System/Runtime/Status", category: "System", dataType: "Enum", owner: "System", source: "Runtime", defaultValue: "Ready", metadata: { enumValues: ["Ready", "Faulted"] }, initialQuality: "Good" }));
  assert.throws(() => enumRegistry.updateSignal("sig.system.runtime.status", { value: "Running", writer: "System", timestamp: 1 }), error => error.code === "INVALID_ENUM_VALUE");
});

test("updates quality and continues after subscriber failure", () => {
  const registry = new SignalRegistry(); const events = [];
  registry.subscribe(() => { throw new Error("observer failed"); }); registry.subscribe(event => events.push(event));
  registry.register(signal()); registry.updateSignalQuality(signal().id, { quality: "Fault", writer: "Machine", timestamp: 10 });
  assert.equal(events.some(event => event.type === "Signal Quality Changed"), true); assert.equal(registry.getSignalState(signal().id).quality, "Fault");
  assert.equal(registry.getDiagnostics().subscriberErrorCount, events.length); assert.equal(Object.isFrozen(events[0]), true);
});

test("resets signals without deleting definitions", () => {
  const registry = new SignalRegistry();
  registry.registerMany([signal(), signal({ id: "sig.plc.motor.command", namespace: "PLC/Controller01/Outputs/MotorRun", category: "Digital Output", owner: "PLC", source: "OutputImage", initialQuality: "Good" })]);
  registry.updateSignal(signal().id, { value: true, writer: "Machine", timestamp: 20 });
  assert.deepEqual(registry.resetSignal(signal().id, { timestamp: 100 }), { currentValue: false, previousValue: null, timestamp: 100, quality: "Simulated", updateCount: 0, changed: false, initialized: true });
  assert.equal(registry.resetAll({ timestamp: 200 }).length, 2); assert.equal(registry.getDiagnostics().resetCount, 2);
});

test("repeated sequences are identical and diagnostics are immutable", () => {
  const execute = () => { const registry = new SignalRegistry(); const events = []; registry.subscribe(event => events.push(event)); registry.register(signal()); registry.updateSignal(signal().id, { value: true, writer: "Machine", timestamp: 20 }); return { signals: registry.listSignals(), events, diagnostics: registry.getDiagnostics() }; };
  assert.deepEqual(execute(), execute());
  const registry = new SignalRegistry(); registry.register(signal()); const diagnostics = registry.getDiagnostics(); assert.equal(Object.isFrozen(diagnostics), true);
  assert.throws(() => { diagnostics.totalUpdateCount = 99; }, TypeError); assert.equal(registry.getDiagnostics().totalUpdateCount, 0);
});
