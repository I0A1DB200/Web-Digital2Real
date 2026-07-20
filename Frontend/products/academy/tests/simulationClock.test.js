import assert from "node:assert/strict";
import test from "node:test";

import { SimulationClock, SimulationClockState } from "../runtime/simulationClock.js";

test("initializes with deterministic zero time and immutable snapshots", () => {
  const clock = new SimulationClock({ fixedStep: 20, maximumTicks: 10 });
  const snapshot = clock.initialize();

  assert.equal(snapshot.state, SimulationClockState.Ready);
  assert.equal(snapshot.tick, 0);
  assert.equal(snapshot.simulationTime, 0);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.diagnostics), true);
});

test("advances by exactly one fixed step per running tick", () => {
  const clock = new SimulationClock({ fixedStep: 20 });
  clock.initialize();
  clock.start();

  assert.deepEqual(
    [clock.tick().tick, clock.tick().simulationTime],
    [1, 40]
  );
});

test("pause blocks ticks and resume preserves fixed-step progression", () => {
  const clock = new SimulationClock({ fixedStep: 25 });
  clock.initialize();
  clock.start();
  clock.tick();
  clock.pause();

  assert.throws(() => clock.tick(), error => error.code === "INVALID_CLOCK_TRANSITION");
  assert.deepEqual([clock.getSnapshot().tick, clock.getSnapshot().simulationTime], [1, 25]);

  clock.resume();
  const resumed = clock.tick();
  assert.deepEqual([resumed.tick, resumed.simulationTime], [2, 50]);
});

test("single step advances once and remains paused", () => {
  const clock = new SimulationClock({ fixedStep: 10 });
  clock.initialize();

  const first = clock.step();
  const second = clock.step();

  assert.deepEqual([first.state, first.tick, second.state, second.tick], ["Paused", 1, "Paused", 2]);
});

test("speed multiplier never changes logical results", () => {
  const execute = speedMultiplier => {
    const clock = new SimulationClock({ fixedStep: 20, speedMultiplier });
    clock.initialize();
    clock.start();
    clock.tick();
    clock.tick();
    return [clock.getSnapshot().tick, clock.getSnapshot().simulationTime];
  };

  assert.deepEqual(execute(0.5), execute(8));
});

test("reset restores initial execution state and clears attempt diagnostics", () => {
  const clock = new SimulationClock({ fixedStep: 20 });
  clock.initialize();
  clock.start();
  clock.tick();
  clock.pause();
  clock.resume();

  const reset = clock.reset();

  assert.equal(reset.state, "Ready");
  assert.equal(reset.tick, 0);
  assert.equal(reset.simulationTime, 0);
  assert.equal(reset.diagnostics.resetCount, 1);
  assert.equal(reset.diagnostics.pauseCount, 0);
  assert.equal(reset.diagnostics.resumeCount, 0);
  assert.equal(reset.diagnostics.lastError, null);
});

test("rejects invalid configuration, transitions and execution limits", () => {
  assert.throws(() => new SimulationClock({ fixedStep: 0 }), error => error.code === "INVALID_FIXED_STEP");
  const clock = new SimulationClock({ fixedStep: 20, maximumTicks: 1 });
  assert.throws(() => clock.start(), error => error.code === "INVALID_CLOCK_TRANSITION");
  clock.initialize();
  clock.start();
  clock.tick();
  assert.throws(() => clock.tick(), error => error.code === "EXECUTION_LIMIT_REACHED");
  assert.equal(clock.getSnapshot().tick, 1);
});

test("identical clock sequences produce identical snapshots", () => {
  const execute = () => {
    const clock = new SimulationClock({ fixedStep: 20 });
    clock.initialize();
    clock.start();
    clock.tick();
    clock.pause();
    clock.step();
    clock.resume();
    clock.tick();
    return clock.getSnapshot();
  };

  assert.deepEqual(execute(), execute());
});
