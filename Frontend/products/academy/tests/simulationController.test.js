import assert from "node:assert/strict";
import test from "node:test";

import { SimulationClock } from "../runtime/simulationClock.js";
import { SimulationController } from "../runtime/simulationController.js";

const phaseNames = [
  "applyExternalInputs",
  "reconcileMachinePreScan",
  "publishMachineSensors",
  "copyPlcInputs",
  "executePlcScan",
  "publishPlcOutputs",
  "applyMachineCommands",
  "advanceMachine",
  "publishMachineAndDiagnostics",
  "evaluateValidation",
  "recordEventsAndDiagnostics",
  "determineOutcome"
];

function createController(options = {}) {
  return new SimulationController({
    clock: new SimulationClock({ fixedStep: 20 }),
    ...options
  });
}

test("supports the approved controller lifecycle", () => {
  const controller = createController();
  assert.equal(controller.initialize().state, "Ready");
  assert.equal(controller.start().state, "Running");
  assert.equal(controller.pause().state, "Paused");
  assert.equal(controller.resume().state, "Running");
  assert.equal(controller.stop().state, "Stopped");
});

test("executes canonical phase placeholders in exact order", () => {
  const order = [];
  const handlers = Object.fromEntries(phaseNames.map(name => [name, context => {
    order.push(name);
    assert.equal(context.tick, 1);
    return name === "determineOutcome" ? { status: "continue" } : { phase: name };
  }]));
  const controller = createController({ handlers });
  controller.initialize();
  controller.start();
  const snapshot = controller.tick();

  assert.deepEqual(order, phaseNames);
  assert.equal(snapshot.tick, 1);
  assert.equal(snapshot.simulationTime, 20);
  assert.equal(snapshot.lastTickResult.phaseResults.executePlcScan.phase, "executePlcScan");
});

test("single step performs one complete tick and returns to paused", () => {
  let calls = 0;
  const controller = createController({ handlers: { determineOutcome: () => { calls += 1; return { status: "continue" }; } } });
  controller.initialize();

  const snapshot = controller.step();

  assert.equal(snapshot.state, "Paused");
  assert.equal(snapshot.tick, 1);
  assert.equal(calls, 1);
});

test("applies completion and learner-failure outcomes at the tick boundary", () => {
  const completed = createController({ handlers: { determineOutcome: () => ({ status: "completed" }) } });
  completed.initialize();
  completed.start();
  assert.equal(completed.tick().state, "Completed");

  const failed = createController({ handlers: { determineOutcome: () => ({ status: "failed", reason: "timeout" }) } });
  failed.initialize();
  failed.start();
  assert.equal(failed.tick().state, "Failed");
});

test("phase errors fault the controller without hiding the error", () => {
  const controller = createController({ handlers: { executePlcScan: () => { throw new Error("placeholder failure"); } } });
  controller.initialize();
  controller.start();

  assert.throws(() => controller.tick(), /placeholder failure/);
  assert.equal(controller.getSnapshot().state, "Faulted");
  assert.equal(controller.getSnapshot().diagnostics.lastError.message, "placeholder failure");
});

test("rejects invalid transitions without changing state", () => {
  const controller = createController();
  controller.initialize();

  assert.throws(() => controller.pause(), error => error.code === "INVALID_CONTROLLER_TRANSITION");
  assert.equal(controller.getSnapshot().state, "Ready");
  assert.equal(controller.getSnapshot().diagnostics.rejectedTransitionCount, 1);
});

test("reset restores the controller and invokes the reset extension point", () => {
  let resetCalls = 0;
  const controller = createController({ handlers: { reset: () => { resetCalls += 1; } } });
  controller.initialize();
  controller.start();
  controller.tick();
  controller.pause();

  const reset = controller.reset();

  assert.equal(reset.state, "Ready");
  assert.equal(reset.tick, 0);
  assert.equal(reset.simulationTime, 0);
  assert.equal(reset.diagnostics.resetCount, 1);
  assert.equal(reset.diagnostics.pauseCount, 0);
  assert.equal(resetCalls, 1);
});

test("events and snapshots are immutable and subscriber errors are isolated", () => {
  const events = [];
  const controller = createController();
  controller.subscribe(() => { throw new Error("observer failure"); });
  controller.subscribe(event => events.push(event));
  controller.initialize();
  controller.start();
  const snapshot = controller.tick();

  assert.equal(events.map(event => event.type).includes("SimulationTick"), true);
  assert.equal(Object.isFrozen(events[0]), true);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.clock), true);
  assert.equal(snapshot.diagnostics.subscriberErrorCount, events.length);
});

test("identical inputs produce identical controller snapshots and events", () => {
  const execute = () => {
    const events = [];
    const controller = createController({ handlers: { determineOutcome: context => ({ status: context.tick === 2 ? "completed" : "continue" }) } });
    controller.subscribe(event => events.push(event));
    controller.initialize({ executionId: "deterministic" });
    controller.start();
    controller.tick();
    controller.tick();
    return { snapshot: controller.getSnapshot(), events };
  };

  assert.deepEqual(execute(), execute());
});

test("rejects asynchronous and unknown phase handlers", () => {
  assert.throws(() => createController({ handlers: { unknown: () => null } }), error => error.code === "INVALID_PHASE_HANDLER");
  const controller = createController({ handlers: { executePlcScan: async () => null } });
  controller.initialize();
  controller.start();
  assert.throws(() => controller.tick(), error => error.code === "ASYNCHRONOUS_PHASE");
  assert.equal(controller.getSnapshot().state, "Faulted");
});
