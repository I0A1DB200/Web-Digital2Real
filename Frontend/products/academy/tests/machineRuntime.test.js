import assert from "node:assert/strict";
import test from "node:test";

import { MachineComponent } from "../runtime/machineComponent.js";
import { MachineFaultType, MachineRuntime } from "../runtime/machineRuntime.js";
import { Motor } from "../runtime/motor.js";
import { Sensor } from "../runtime/sensor.js";

const update = (machine, tick, commands = {}, faults = []) => machine.update({
  tick,
  simulationTime: tick * 20,
  commands,
  faults
});

test("initializes a generic immutable component contract", () => {
  const component = new MachineComponent({ id: "component-01", name: "Component", type: "Example", capabilities: ["transport"] });
  const snapshot = component.snapshot();

  assert.equal(snapshot.status, "Stopped");
  assert.equal(snapshot.enabled, true);
  assert.equal(snapshot.fault, null);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.capabilities), true);
});

test("supports deterministic Motor transitions and recoverable faults", () => {
  const motor = new Motor();
  assert.equal(motor.start({ tick: 1 }).status, "Running");
  assert.equal(motor.stop({ tick: 2 }).status, "Stopped");
  assert.equal(motor.disable({ tick: 3 }).status, "Disabled");
  assert.throws(() => motor.start({ tick: 4 }), error => error.code === "MOTOR_DISABLED");
  motor.enable({ tick: 4 });
  assert.equal(motor.injectFault({ tick: 5 }).status, "Faulted");
  assert.throws(() => motor.start({ tick: 6 }), error => error.code === "MOTOR_FAULTED");
  assert.equal(motor.reset({ tick: 0 }).status, "Stopped");
});

test("Sensors derive values from committed Machine state only", () => {
  const sensor = new Sensor({ id: "sensor-test", name: "Test Sensor", observe: state => state.running });
  assert.equal(sensor.update({ machineState: { running: true }, tick: 1 }).value, true);
  assert.equal(sensor.update({ machineState: { running: false }, tick: 2 }).value, false);
  assert.equal(Object.isFrozen(sensor.snapshot()), true);
});

test("initializes the Conveyor Machine in deterministic stopped state", () => {
  const machine = new MachineRuntime();
  const snapshot = machine.initialize();

  assert.equal(snapshot.initialized, true);
  assert.equal(snapshot.state, "Stopped");
  assert.equal(snapshot.tick, 0);
  assert.equal(snapshot.sensors["sensor-running"].value, false);
  assert.equal(snapshot.sensors["sensor-stopped"].value, true);
  assert.equal(snapshot.diagnostics.componentCount, 6);
});

test("executes deterministic Conveyor start and stop transitions", () => {
  const machine = new MachineRuntime();
  machine.initialize();

  assert.equal(update(machine, 1, { run: true }).state, "Starting");
  const running = update(machine, 2, { run: true });
  assert.equal(running.state, "Running");
  assert.equal(running.sensors["sensor-running"].value, true);
  assert.equal(running.diagnostics.updateCount, 2);

  assert.equal(update(machine, 3, { run: false }).state, "Stopping");
  const stopped = update(machine, 4, { run: false });
  assert.equal(stopped.state, "Stopped");
  assert.equal(stopped.sensors["sensor-stopped"].value, true);
});

test("Emergency has priority and Reset never restarts the Conveyor", () => {
  const machine = new MachineRuntime();
  machine.initialize();
  update(machine, 1, { run: true });
  update(machine, 2, { run: true });

  const emergency = update(machine, 3, { run: true, emergencyStop: true });
  assert.equal(emergency.state, "EmergencyStopped");
  assert.equal(emergency.sensors["sensor-running"].value, false);
  assert.equal(emergency.sensors["sensor-emergency"].value, true);
  assert.equal(emergency.diagnostics.faultCount, 1);

  const reset = update(machine, 4, { run: true, reset: true });
  assert.equal(reset.state, "Stopped");
  assert.equal(reset.sensors["sensor-running"].value, false);
  assert.equal(reset.sensors["sensor-emergency"].value, false);
  assert.equal(reset.diagnostics.faultCount, 0);
});

test("handles Motor and Internal faults without confusing command with feedback", () => {
  const motorFault = new MachineRuntime();
  motorFault.initialize();
  const faulted = update(motorFault, 1, { run: true }, [MachineFaultType.MotorFault]);
  assert.equal(faulted.state, "Faulted");
  assert.equal(faulted.sensors["sensor-running"].value, false);
  assert.equal(faulted.sensors["sensor-fault"].value, true);
  assert.equal(faulted.diagnostics.lastFault.type, "MotorFault");

  const internalFault = new MachineRuntime();
  internalFault.initialize();
  assert.equal(update(internalFault, 1, {}, [MachineFaultType.InternalFault]).state, "Faulted");
});

test("full Reset restores a fresh initial execution state on the same object", () => {
  const machine = new MachineRuntime();
  machine.initialize();
  update(machine, 1, { run: true });
  update(machine, 2, { run: true });

  const reset = machine.reset();

  assert.equal(reset.state, "Stopped");
  assert.equal(reset.previousState, null);
  assert.equal(reset.tick, 0);
  assert.equal(reset.simulationTime, 0);
  assert.equal(reset.diagnostics.updateCount, 0);
  assert.equal(reset.diagnostics.resetCount, 1);
  const fresh = new MachineRuntime();
  const freshSnapshot = fresh.initialize();
  const componentState = snapshot => snapshot.components.map(component => ({
    id: component.id,
    status: component.status,
    previousStatus: component.previousStatus,
    enabled: component.enabled,
    fault: component.fault,
    value: component.value,
    quality: component.quality
  }));
  assert.deepEqual(componentState(reset), componentState(freshSnapshot));
  assert.equal(update(machine, 1, { run: false }).state, "Stopped");
});

test("rejects invalid transitions, commands, faults and duplicate updates", () => {
  const machine = new MachineRuntime();
  assert.throws(() => update(machine, 1), error => error.code === "MACHINE_NOT_INITIALIZED");
  machine.initialize();
  assert.throws(() => update(machine, 1, { run: "true" }), error => error.code === "INVALID_MACHINE_COMMAND");
  assert.throws(() => update(machine, 1, {}, ["UnknownFault"]), error => error.code === "INVALID_MACHINE_FAULT");
  update(machine, 1);
  assert.throws(() => update(machine, 1), error => error.code === "INVALID_MACHINE_TICK");
  assert.equal(machine.getSnapshot().diagnostics.rejectedUpdateCount, 4);
});

test("emits immutable ordered events and isolates subscriber failures", () => {
  const machine = new MachineRuntime();
  const events = [];
  machine.subscribe(() => { throw new Error("observer failed"); });
  machine.subscribe(event => events.push(event));
  machine.initialize();
  update(machine, 1, { run: true });
  update(machine, 2, { run: true });

  assert.equal(events.some(event => event.type === "MachineStarted"), true);
  assert.equal(events.some(event => event.type === "ComponentUpdated"), true);
  assert.equal(events.some(event => event.type === "SensorUpdated"), true);
  assert.equal(Object.isFrozen(events[0]), true);
  assert.equal(machine.getSnapshot().diagnostics.subscriberErrorCount, events.length);
});

test("snapshots cannot mutate runtime state", () => {
  const machine = new MachineRuntime();
  machine.initialize();
  const snapshot = update(machine, 1, { run: true });

  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.components), true);
  assert.equal(Object.isFrozen(snapshot.sensors), true);
  assert.throws(() => { snapshot.state = "Running"; }, TypeError);
  assert.equal(machine.getSnapshot().state, "Starting");
});

test("identical command and fault sequences produce identical results", () => {
  const execute = () => {
    const machine = new MachineRuntime();
    const events = [];
    machine.subscribe(event => events.push(event));
    machine.initialize();
    update(machine, 1, { run: true });
    update(machine, 2, { run: true });
    update(machine, 3, { emergencyStop: true });
    update(machine, 4, { reset: true });
    return { snapshot: machine.getSnapshot(), events };
  };

  assert.deepEqual(execute(), execute());
});
