import { immutableCopy } from "../core/signalDefinition.js";
import { MachineComponent, MachineRuntimeError, validateTick } from "./machineComponent.js";
import { Motor, MotorStatus } from "./motor.js";
import { Sensor } from "./sensor.js";

export const MachineState = Object.freeze({
  Stopped: "Stopped",
  Starting: "Starting",
  Running: "Running",
  Stopping: "Stopping",
  Faulted: "Faulted",
  EmergencyStopped: "EmergencyStopped",
  Resetting: "Resetting"
});

export const MachineFaultType = Object.freeze({
  MotorFault: "MotorFault",
  EmergencyStop: "EmergencyStop",
  InternalFault: "InternalFault"
});

export const MachineEventType = Object.freeze({
  Started: "MachineStarted",
  Stopped: "MachineStopped",
  Faulted: "MachineFaulted",
  Reset: "MachineReset",
  ComponentUpdated: "ComponentUpdated",
  SensorUpdated: "SensorUpdated"
});

export class ConveyorComponent extends MachineComponent {
  constructor({ id = "conveyor-01", name = "Conveyor" } = {}) {
    super({ id, name, type: "Conveyor", capabilities: ["transport", "object-interface"], initialStatus: MachineState.Stopped });
  }

  update({ machineState, fault = null, tick } = {}) {
    if (!Object.hasOwn(MachineState, machineState)) throw new MachineRuntimeError("INVALID_MACHINE_STATE", "Conveyor received an unsupported Machine state.", { machineState });
    return super.update({ status: machineState, fault, tick });
  }
}

export class MachineRuntime {
  #id;
  #state = MachineState.Stopped;
  #previousState = null;
  #initialized = false;
  #motor;
  #conveyor;
  #sensors;
  #activeFaults = new Map();
  #subscribers = new Set();
  #eventSequence = 0;
  #lastTick = 0;
  #simulationTime = 0;
  #diagnostics = {
    updateCount: 0,
    resetCount: 0,
    eventCount: 0,
    subscriberErrorCount: 0,
    rejectedUpdateCount: 0,
    lastTransition: null,
    lastFault: null,
    lastReset: null,
    lastError: null
  };

  constructor({ id = "machine-conveyor-01" } = {}) {
    if (typeof id !== "string" || !id.trim()) throw new MachineRuntimeError("INVALID_MACHINE", "Machine id must be a non-empty string.");
    this.#id = id.trim();
    this.#motor = new Motor();
    this.#conveyor = new ConveyorComponent();
    this.#sensors = Object.freeze([
      new Sensor({ id: "sensor-running", name: "Running Feedback", observe: state => state.motorRunning }),
      new Sensor({ id: "sensor-stopped", name: "Stopped Feedback", observe: state => !state.motorRunning }),
      new Sensor({ id: "sensor-fault", name: "Fault Feedback", observe: state => state.faulted }),
      new Sensor({ id: "sensor-emergency", name: "Emergency Feedback", observe: state => state.emergencyActive })
    ]);
  }

  initialize() {
    if (this.#initialized) return this.#reject("MACHINE_ALREADY_INITIALIZED", "Machine Runtime is already initialized.");
    this.#initialized = true;
    this.#evaluateSensors(0);
    return this.getSnapshot();
  }

  update({ tick, simulationTime, commands = {}, faults = [] } = {}) {
    try {
      this.#requireInitialized();
      this.#validateBoundary(tick, simulationTime);
      const commandImage = validateCommands(commands);
      const faultImage = validateFaults(faults);
      this.#lastTick = tick;
      this.#simulationTime = simulationTime;

      if (commandImage.reset) {
        return this.#performReset({ tick, simulationTime, preserveBoundary: true });
      }

      this.#applyFaults(faultImage, tick);
      const previousState = this.#state;

      if (commandImage.emergencyStop || this.#activeFaults.has(MachineFaultType.EmergencyStop)) {
        this.#activateFault(MachineFaultType.EmergencyStop, tick);
        this.#motor.update({ runRequested: false, inhibited: true, tick });
        this.#setState(MachineState.EmergencyStopped, "emergency", previousState);
      } else if (this.#activeFaults.size > 0) {
        if (!this.#motor.fault) this.#motor.update({ runRequested: false, inhibited: true, tick });
        this.#setState(MachineState.Faulted, "fault", previousState);
      } else {
        this.#applyRunCommand(commandImage.run, tick, previousState);
      }

      const machineView = this.#committedObservation();
      this.#conveyor.update({ machineState: this.#state, fault: this.#machineFault(), tick });
      this.#evaluateSensors(tick, machineView);
      this.#diagnostics.updateCount += 1;
      this.#emitComponentEvents();
      return this.getSnapshot();
    } catch (error) {
      this.#diagnostics.rejectedUpdateCount += 1;
      this.#diagnostics.lastError = summarizeError(error);
      throw error;
    }
  }

  reset({ tick = 0, simulationTime = 0 } = {}) {
    this.#requireInitialized();
    validateTick(tick);
    validateSimulationTime(simulationTime);
    return this.#performReset({ tick, simulationTime, preserveBoundary: false });
  }

  subscribe(subscriber) {
    if (typeof subscriber !== "function") throw new MachineRuntimeError("INVALID_SUBSCRIBER", "Machine subscriber must be a function.");
    this.#subscribers.add(subscriber);
    return () => this.unsubscribe(subscriber);
  }

  unsubscribe(subscriber) {
    return this.#subscribers.delete(subscriber);
  }

  getSnapshot() {
    const components = [this.#conveyor.snapshot(), this.#motor.snapshot(), ...this.#sensors.map(sensor => sensor.snapshot())];
    const sensors = Object.freeze(Object.fromEntries(this.#sensors.map(sensor => [sensor.id, immutableCopy({ value: sensor.snapshot().value, quality: sensor.snapshot().quality })])));
    const faultCount = this.#activeFaults.size;
    const runningCount = components.filter(component => component.status === MachineState.Running || component.status === MotorStatus.Running).length;

    return immutableCopy({
      id: this.#id,
      initialized: this.#initialized,
      state: this.#state,
      previousState: this.#previousState,
      tick: this.#lastTick,
      simulationTime: this.#simulationTime,
      components,
      sensors,
      faults: [...this.#activeFaults.values()],
      diagnostics: {
        componentCount: components.length,
        runningCount,
        faultCount,
        updateCount: this.#diagnostics.updateCount,
        resetCount: this.#diagnostics.resetCount,
        eventCount: this.#diagnostics.eventCount,
        subscriberErrorCount: this.#diagnostics.subscriberErrorCount,
        rejectedUpdateCount: this.#diagnostics.rejectedUpdateCount,
        lastTransition: this.#diagnostics.lastTransition,
        lastFault: this.#diagnostics.lastFault,
        lastReset: this.#diagnostics.lastReset,
        lastError: this.#diagnostics.lastError
      }
    });
  }

  #applyRunCommand(runRequested, tick, previousState) {
    if (this.#state === MachineState.Stopped) {
      this.#motor.update({ runRequested, tick });
      this.#setState(runRequested ? MachineState.Starting : MachineState.Stopped, runRequested ? "startRequested" : "holdStopped", previousState);
    } else if (this.#state === MachineState.Starting) {
      this.#motor.update({ runRequested, tick });
      this.#setState(runRequested ? MachineState.Running : MachineState.Stopping, runRequested ? "startCompleted" : "stopRequested", previousState);
    } else if (this.#state === MachineState.Running) {
      this.#motor.update({ runRequested, tick });
      this.#setState(runRequested ? MachineState.Running : MachineState.Stopping, runRequested ? "holdRunning" : "stopRequested", previousState);
    } else if (this.#state === MachineState.Stopping) {
      this.#motor.update({ runRequested, tick });
      this.#setState(runRequested ? MachineState.Starting : MachineState.Stopped, runRequested ? "startRequested" : "stopCompleted", previousState);
    } else {
      throw new MachineRuntimeError("INVALID_MACHINE_TRANSITION", `Normal command is invalid from ${this.#state}.`, { state: this.#state });
    }

    if (previousState !== MachineState.Running && this.#state === MachineState.Running) this.#emit(MachineEventType.Started);
    if (previousState !== MachineState.Stopped && this.#state === MachineState.Stopped) this.#emit(MachineEventType.Stopped);
  }

  #applyFaults(faults, tick) {
    for (const faultType of faults) {
      this.#activateFault(faultType, tick);
      if (faultType === MachineFaultType.MotorFault) this.#motor.injectFault({ tick, type: faultType });
    }
  }

  #activateFault(type, tick) {
    if (this.#activeFaults.has(type)) return;
    const fault = immutableCopy({ type, active: true, recoverable: true, tick });
    this.#activeFaults.set(type, fault);
    this.#diagnostics.lastFault = fault;
    this.#emit(MachineEventType.Faulted, { fault });
  }

  #performReset({ tick, simulationTime, preserveBoundary }) {
    const previousState = this.#state;
    this.#state = MachineState.Resetting;
    this.#motor.reset({ tick });
    this.#conveyor.reset({ tick });
    this.#sensors.forEach(sensor => sensor.reset({ tick }));
    this.#activeFaults.clear();
    this.#previousState = null;
    this.#state = MachineState.Stopped;
    this.#lastTick = preserveBoundary ? tick : 0;
    this.#simulationTime = preserveBoundary ? simulationTime : 0;
    const resetCount = this.#diagnostics.resetCount + 1;
    this.#diagnostics = {
      updateCount: 0,
      resetCount,
      eventCount: 0,
      subscriberErrorCount: 0,
      rejectedUpdateCount: 0,
      lastTransition: immutableCopy({ operation: "reset", from: previousState, to: MachineState.Stopped }),
      lastFault: null,
      lastReset: immutableCopy({ tick: this.#lastTick, simulationTime: this.#simulationTime }),
      lastError: null
    };
    this.#eventSequence = 0;
    this.#evaluateSensors(this.#lastTick);
    this.#emit(MachineEventType.Reset);
    return this.getSnapshot();
  }

  #evaluateSensors(tick, state = this.#committedObservation()) {
    this.#sensors.forEach(sensor => sensor.update({ machineState: state, tick }));
  }

  #committedObservation() {
    return immutableCopy({
      state: this.#state,
      motorRunning: this.#motor.status === MotorStatus.Running,
      faulted: this.#state === MachineState.Faulted || this.#state === MachineState.EmergencyStopped,
      emergencyActive: this.#activeFaults.has(MachineFaultType.EmergencyStop)
    });
  }

  #machineFault() {
    return this.#activeFaults.size ? { type: [...this.#activeFaults.keys()][0], recoverable: true } : null;
  }

  #emitComponentEvents() {
    this.#emit(MachineEventType.ComponentUpdated, { component: this.#conveyor.snapshot() });
    this.#emit(MachineEventType.ComponentUpdated, { component: this.#motor.snapshot() });
    this.#sensors.forEach(sensor => this.#emit(MachineEventType.SensorUpdated, { sensor: sensor.snapshot() }));
  }

  #setState(nextState, operation, previousState = this.#state) {
    this.#previousState = previousState;
    this.#state = nextState;
    this.#diagnostics.lastTransition = immutableCopy({ operation, from: previousState, to: nextState });
  }

  #validateBoundary(tick, simulationTime) {
    validateTick(tick);
    validateSimulationTime(simulationTime);
    if (tick !== this.#lastTick + 1) throw new MachineRuntimeError("INVALID_MACHINE_TICK", "Machine updates must use the next sequential tick exactly once.", { tick, expectedTick: this.#lastTick + 1 });
    if (simulationTime <= this.#simulationTime) throw new MachineRuntimeError("INVALID_MACHINE_TIME", "Machine simulationTime must advance monotonically.", { simulationTime, previousTime: this.#simulationTime });
  }

  #requireInitialized() {
    if (!this.#initialized) throw new MachineRuntimeError("MACHINE_NOT_INITIALIZED", "Machine Runtime must be initialized before use.");
  }

  #reject(code, message) {
    const error = new MachineRuntimeError(code, message);
    this.#diagnostics.rejectedUpdateCount += 1;
    this.#diagnostics.lastError = summarizeError(error);
    throw error;
  }

  #emit(type, payload = {}) {
    const event = immutableCopy({ type, sequence: ++this.#eventSequence, machineId: this.#id, tick: this.#lastTick, simulationTime: this.#simulationTime, state: this.#state, ...payload });
    this.#diagnostics.eventCount += 1;
    for (const subscriber of this.#subscribers) {
      try { subscriber(event); }
      catch (error) {
        this.#diagnostics.subscriberErrorCount += 1;
        this.#diagnostics.lastError = summarizeError(error, "SUBSCRIBER_ERROR");
      }
    }
  }
}

function validateCommands(commands) {
  if (commands === null || typeof commands !== "object" || Array.isArray(commands)) throw new MachineRuntimeError("INVALID_MACHINE_COMMAND", "commands must be a plain object.");
  const supported = new Set(["run", "emergencyStop", "reset"]);
  for (const key of Object.keys(commands)) if (!supported.has(key)) throw new MachineRuntimeError("INVALID_MACHINE_COMMAND", `Unsupported Machine command: ${key}.`, { key });
  const image = { run: false, emergencyStop: false, reset: false, ...commands };
  for (const [key, value] of Object.entries(image)) if (typeof value !== "boolean") throw new MachineRuntimeError("INVALID_MACHINE_COMMAND", `${key} must be Boolean.`, { key, value });
  return Object.freeze(image);
}

function validateFaults(faults) {
  if (!Array.isArray(faults)) throw new MachineRuntimeError("INVALID_MACHINE_FAULT", "faults must be an array.");
  for (const fault of faults) if (!Object.hasOwn(MachineFaultType, fault)) throw new MachineRuntimeError("INVALID_MACHINE_FAULT", `Unsupported Machine fault: ${fault}.`, { fault });
  return Object.freeze([...new Set(faults)]);
}

function validateSimulationTime(simulationTime) {
  if (typeof simulationTime !== "number" || !Number.isFinite(simulationTime) || simulationTime < 0) throw new MachineRuntimeError("INVALID_MACHINE_TIME", "simulationTime must be a finite non-negative number.", { simulationTime });
}

function summarizeError(error, fallbackCode = "MACHINE_RUNTIME_ERROR") {
  return immutableCopy({ code: error?.code ?? fallbackCode, message: error instanceof Error ? error.message : String(error) });
}
