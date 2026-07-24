import assert from "node:assert/strict";
import test from "node:test";

import { SignalRegistry } from "../core/signalRegistry.js";
import { lab001Definition } from "../labs/lab-001/lab.js";
import { createLab001Session } from "../labs/lab-001/session.js";

function executeCompleteSequence() {
  const session = createLab001Session();
  session.initialize();
  session.start();
  session.pressStart();
  session.runTicks(2);
  session.releaseStart();
  session.advanceTick();
  session.pressStop();
  session.runTicks(2);
  session.pressStart();
  session.advanceTick();
  session.releaseStart();
  session.releaseStop();
  session.pressStart();
  session.runTicks(2);
  session.engageEmergencyStop();
  session.advanceTick();
  session.pressReset();
  session.advanceTick();
  session.releaseEmergencyStop();
  session.releaseReset();
  session.releaseStart();
  session.advanceTick();
  session.pressStart();
  session.runTicks(2);
  return session;
}

test("Lab 001 definition is complete, isolated and immutable", () => {
  assert.equal(lab001Definition.id, "lab-001");
  assert.equal(lab001Definition.slug, "start-stop-conveyor");
  assert.equal(lab001Definition.title, "Start / Stop Conveyor");
  assert.equal(lab001Definition.signalDefinitions.length, 18);
  assert.equal(lab001Definition.validationRules.length, 8);
  assert.equal(Object.isFrozen(lab001Definition), true);
  assert.equal(Object.isFrozen(lab001Definition.plc.programs), true);
  assert.throws(() => { lab001Definition.title = "Changed"; }, TypeError);
});

test("signals register with one authoritative owner and enforce writes", () => {
  const registry = new SignalRegistry(); registry.registerMany(lab001Definition.signalDefinitions);
  assert.equal(registry.getDiagnostics().registeredSignalCount, 18);
  assert.equal(registry.getSignalDefinition("sig.user.lab001.start").owner, "User");
  assert.equal(registry.getSignalDefinition("sig.plc.lab001.motor_command").owner, "PLC");
  assert.equal(registry.getSignalDefinition("sig.machine.lab001.motor_running").owner, "Machine");
  assert.equal(registry.getSignalDefinition("sig.academy.lab001.evidence_started").owner, "Academy");
  assert.throws(() => registry.updateSignal("sig.plc.lab001.motor_command", { value: true, writer: "User", timestamp: 0 }), error => error.code === "WRITE_ACCESS_DENIED");
});

test("PLC mappings connect Signals only to supported process-image addresses", () => {
  const mappings = lab001Definition.plc.mappings;
  assert.deepEqual(mappings.map(mapping => mapping.memoryId), ["I_START", "I_STOP", "I_EMERGENCY", "I_RESET", "Q_MOTOR"]);
  assert.equal(mappings.filter(mapping => mapping.direction === "SignalToPLCInput").length, 4);
  assert.equal(mappings.filter(mapping => mapping.direction === "PLCOutputToSignal").length, 1);
});

test("session initializes Ready with a stopped Conveyor and safe process images", () => {
  const session = createLab001Session(); const snapshot = session.initialize();
  assert.equal(snapshot.lifecycleState, "Ready");
  assert.equal(snapshot.machine.state, "Stopped");
  assert.equal(snapshot.machine.motor.status, "Stopped");
  assert.equal(snapshot.machine.sensors["sensor-running"].value, false);
  assert.equal(snapshot.machine.sensors["sensor-stopped"].value, true);
  assert.equal(snapshot.plc.outputs.Q_MOTOR, false);
  assert.deepEqual(snapshot.learnerCommands, { start: false, stop: false, emergency: false, reset: false });
});

test("Start activates the Conveyor and release preserves the seal-in state", () => {
  const session = createLab001Session(); session.initialize(); session.start(); session.pressStart();
  assert.equal(session.runTicks(2).machine.state, "Running");
  session.releaseStart(); const held = session.advanceTick();
  assert.equal(held.plc.internalMemory.M_RUN, true); assert.equal(held.plc.outputs.Q_MOTOR, true); assert.equal(held.machine.state, "Running");
});

test("Stop deactivates the Conveyor and overrides simultaneous Start", () => {
  const session = createLab001Session(); session.initialize(); session.start(); session.pressStart(); session.runTicks(2);
  session.pressStop(); assert.equal(session.runTicks(2).machine.state, "Stopped"); assert.equal(session.getSnapshot().plc.outputs.Q_MOTOR, false);
  session.pressStart(); const priority = session.advanceTick();
  assert.equal(priority.plc.inputs.I_START, true); assert.equal(priority.plc.inputs.I_STOP, true); assert.equal(priority.plc.outputs.Q_MOTOR, false); assert.equal(priority.machine.state, "Stopped");
});

test("Emergency has priority while running and over an active Start command", () => {
  const session = createLab001Session(); session.initialize(); session.start(); session.pressStart(); session.runTicks(2);
  session.engageEmergencyStop(); const emergency = session.advanceTick();
  assert.equal(emergency.learnerCommands.start, true); assert.equal(emergency.machine.state, "EmergencyStopped");
  assert.equal(emergency.machine.sensors["sensor-emergency"].value, true); assert.equal(emergency.machine.sensors["sensor-running"].value, false);
});

test("process Reset clears Emergency and never restarts without a new Start", () => {
  const session = createLab001Session(); session.initialize(); session.start(); session.pressStart(); session.runTicks(2); session.engageEmergencyStop(); session.advanceTick();
  session.pressReset(); const reset = session.advanceTick();
  assert.equal(reset.machine.state, "Stopped"); assert.equal(reset.machine.sensors["sensor-emergency"].value, false); assert.equal(reset.machine.faults.length, 0);
  assert.equal(reset.plc.internalMemory.M_RUN, false); assert.equal(reset.plc.outputs.Q_MOTOR, false);
  session.releaseEmergencyStop(); session.releaseReset(); session.releaseStart(); assert.equal(session.advanceTick().machine.state, "Stopped");
  session.pressStart(); assert.equal(session.runTicks(2).machine.state, "Running");
});

test("Machine feedback is published and sampled by the PLC on the next scan", () => {
  const session = createLab001Session(); session.initialize(); session.start(); session.engageEmergencyStop();
  const first = session.advanceTick(); assert.equal(first.machine.sensors["sensor-emergency"].value, true); assert.equal(first.plc.inputs.I_EMERGENCY, false);
  const second = session.advanceTick(); assert.equal(second.plc.inputs.I_EMERGENCY, true); assert.equal(second.plc.outputs.Q_MOTOR, false);
});

test("Validation completes only after the full ordered learning sequence", () => {
  const session = createLab001Session(); session.initialize(); session.start(); session.pressStart(); session.runTicks(2);
  assert.equal(session.getSnapshot().completed, false);
  const completed = executeCompleteSequence().getSnapshot();
  assert.equal(completed.completed, true); assert.equal(completed.lifecycleState, "Completed");
  assert.equal(completed.validation.result.completed, true); assert.equal(completed.validation.result.passed.length, 8); assert.equal(completed.validation.result.failed.length, 0);
});

test("aggregate snapshots are immutable and contain no runtime instances", () => {
  const session = createLab001Session(); session.initialize(); const snapshot = session.getSnapshot();
  assert.equal(Object.isFrozen(snapshot), true); assert.equal(Object.isFrozen(snapshot.machine), true); assert.equal(Object.isFrozen(snapshot.plc.inputs), true);
  assert.equal(Object.hasOwn(snapshot, "registry"), false); assert.equal(Object.hasOwn(snapshot, "controller"), false);
  assert.throws(() => { snapshot.machine.state = "Running"; }, TypeError);
});

test("full Lab reset coordinates every runtime deterministically", () => {
  const session = createLab001Session(); session.initialize(); session.start(); session.pressStart(); session.runTicks(2);
  const reset = session.resetLab();
  assert.equal(reset.lifecycleState, "Ready"); assert.equal(reset.simulation.tick, 0); assert.equal(reset.simulation.time, 0);
  assert.equal(reset.machine.state, "Stopped"); assert.equal(reset.plc.state, "Ready"); assert.equal(reset.plc.internalMemory.M_RUN, false); assert.equal(reset.plc.outputs.Q_MOTOR, false);
  assert.deepEqual(reset.learnerCommands, { start: false, stop: false, emergency: false, reset: false });
  assert.equal(reset.validation.session.state, "InProgress"); assert.equal(reset.validation.session.evaluationCount, 0); assert.equal(reset.diagnostics.resetCount, 1);
});

test("invalid learner commands and integration transitions fail explicitly", () => {
  const session = createLab001Session(); session.initialize();
  assert.throws(() => session.applyLearnerCommand("toggleStart"), error => error.code === "INVALID_LEARNER_COMMAND");
  session.stop();
  assert.throws(() => session.advanceTick(), error => error.code === "INVALID_SESSION_TRANSITION");
  assert.equal(session.getSnapshot().diagnostics.faultCount, 1);
});

test("repeated complete executions produce identical deterministic snapshots", () => {
  assert.deepEqual(executeCompleteSequence().getSnapshot(), executeCompleteSequence().getSnapshot());
});
