import { immutableCopy } from "../../core/signalDefinition.js";
import { SignalRegistry } from "../../core/signalRegistry.js";
import { MachineRuntime } from "../../runtime/machineRuntime.js";
import { PLCRuntime } from "../../runtime/plcRuntime.js";
import { SimulationClock } from "../../runtime/simulationClock.js";
import { SimulationController } from "../../runtime/simulationController.js";
import { ValidationEngine } from "../../validation/validationEngine.js";
import { lab001Definition } from "./lab.js";

const COMMANDS = Object.freeze({
  Start: "sig.user.lab001.start",
  Stop: "sig.user.lab001.stop",
  Emergency: "sig.user.lab001.emergency",
  Reset: "sig.user.lab001.reset"
});

const EVIDENCE = Object.freeze({
  started: "sig.academy.lab001.evidence_started",
  held: "sig.academy.lab001.evidence_held_after_release",
  stopped: "sig.academy.lab001.evidence_stopped",
  stopPriority: "sig.academy.lab001.evidence_stop_priority",
  emergencyPriority: "sig.academy.lab001.evidence_emergency_priority",
  resetCleared: "sig.academy.lab001.evidence_reset_cleared",
  resetNoRestart: "sig.academy.lab001.evidence_reset_no_restart",
  restarted: "sig.academy.lab001.evidence_restarted_after_new_start"
});

export class Lab001SessionError extends Error {
  constructor(code, message, context = {}) { super(message); this.name = "Lab001SessionError"; this.code = code; this.context = immutableCopy(context); }
}

export class Lab001Session {
  #registry;
  #clock;
  #controller;
  #plc;
  #machine;
  #validation;
  #initialized = false;
  #attempt = 1;
  #stage = 0;
  #runningBeforeEmergency = false;
  #newStartArmed = false;
  #lastValidationResult = null;
  #diagnostics = {
    initializationCount: 0,
    executedTickCount: 0,
    learnerCommandCount: 0,
    resetCount: 0,
    completionCount: 0,
    faultCount: 0,
    lastLearnerCommand: null,
    lastTickResultSummary: null,
    lastValidationResultSummary: null,
    lastError: null
  };

  constructor() {
    this.#registry = new SignalRegistry();
    this.#clock = new SimulationClock({ fixedStep: lab001Definition.metadata.fixedStep, maximumTicks: 3000 });
    this.#plc = new PLCRuntime();
    this.#machine = new MachineRuntime({ id: lab001Definition.machine.id });
    this.#validation = new ValidationEngine({ rules: lab001Definition.validationRules, signalRegistry: this.#registry });
    this.#controller = new SimulationController({ clock: this.#clock, handlers: {
      publishMachineSensors: context => this.#publishMachineFeedback(context.simulationTime),
      executePlcScan: context => this.#plc.scan({ tick: context.tick, timestamp: context.simulationTime }),
      advanceMachine: context => this.#machine.update({
        tick: context.tick,
        simulationTime: context.simulationTime,
        commands: {
          run: this.#registry.getSignalValue("sig.plc.lab001.motor_command"),
          emergencyStop: this.#registry.getSignalValue(COMMANDS.Emergency),
          reset: this.#registry.getSignalValue(COMMANDS.Reset)
        }
      }),
      publishMachineAndDiagnostics: context => this.#publishMachineFeedback(context.simulationTime),
      evaluateValidation: context => this.#evaluateValidation(context.tick, context.simulationTime),
      determineOutcome: () => this.#lastValidationResult?.completed ? { status: "completed" } : { status: "continue" },
      reset: () => this.#resetParticipants()
    } });
  }

  initialize() {
    if (this.#initialized) throw new Lab001SessionError("SESSION_ALREADY_INITIALIZED", "Lab 001 Session is already initialized.");
    try {
      this.#registry.registerMany(lab001Definition.signalDefinitions);
      this.#machine.initialize();
      this.#plc.initialize({ ...lab001Definition.plc, signalRegistry: this.#registry });
      this.#validation.startSession({ id: `lab001-validation-${this.#attempt}`, startTick: 0 });
      this.#publishMachineFeedback(0);
      this.#controller.initialize({ labId: lab001Definition.id, version: lab001Definition.version });
      this.#initialized = true;
      this.#diagnostics.initializationCount += 1;
      return this.getSnapshot();
    } catch (error) {
      this.#recordFault(error);
      throw error;
    }
  }

  start() {
    this.#requireInitialized();
    if (["Ready", "Stopped"].includes(this.#plc.getSnapshot().state)) this.#plc.start();
    this.#controller.start();
    return this.getSnapshot();
  }

  pause() { this.#requireInitialized(); this.#controller.pause(); return this.getSnapshot(); }
  resume() { this.#requireInitialized(); this.#controller.resume(); return this.getSnapshot(); }
  stop() {
    this.#requireInitialized(); this.#controller.stop();
    if (this.#plc.getSnapshot().state === "Running") this.#plc.stop();
    return this.getSnapshot();
  }

  advanceTick() {
    this.#requireInitialized();
    try {
      const controller = this.#controller.getSnapshot();
      if (controller.state === "Ready") {
        if (this.#plc.getSnapshot().state !== "Running") this.#plc.start();
        this.#controller.step();
      } else if (controller.state === "Paused") {
        this.#controller.step();
      } else if (controller.state === "Running") {
        this.#controller.tick();
      } else {
        throw new Lab001SessionError("INVALID_SESSION_TRANSITION", `Cannot advance Lab 001 from ${controller.state}.`, { state: controller.state });
      }
      this.#diagnostics.executedTickCount += 1;
      const snapshot = this.getSnapshot();
      this.#diagnostics.lastTickResultSummary = immutableCopy({ tick: snapshot.simulation.tick, state: snapshot.lifecycleState, machineState: snapshot.machine.state });
      if (snapshot.completed && this.#diagnostics.completionCount === 0) this.#diagnostics.completionCount = 1;
      return this.getSnapshot();
    } catch (error) {
      this.#recordFault(error);
      throw error;
    }
  }

  runTicks(count) {
    if (!Number.isInteger(count) || count < 0) throw new Lab001SessionError("INVALID_TICK_COUNT", "runTicks requires a non-negative integer.", { count });
    let snapshot = this.getSnapshot();
    for (let index = 0; index < count && snapshot.lifecycleState !== "Completed"; index += 1) snapshot = this.advanceTick();
    return snapshot;
  }

  pressStart() { return this.#writeCommand("pressStart", COMMANDS.Start, true); }
  releaseStart() { return this.#writeCommand("releaseStart", COMMANDS.Start, false); }
  pressStop() { return this.#writeCommand("pressStop", COMMANDS.Stop, true); }
  releaseStop() { return this.#writeCommand("releaseStop", COMMANDS.Stop, false); }
  engageEmergencyStop() { return this.#writeCommand("engageEmergencyStop", COMMANDS.Emergency, true); }
  releaseEmergencyStop() { return this.#writeCommand("releaseEmergencyStop", COMMANDS.Emergency, false); }
  pressReset() { return this.#writeCommand("pressReset", COMMANDS.Reset, true); }
  releaseReset() { return this.#writeCommand("releaseReset", COMMANDS.Reset, false); }

  applyLearnerCommand(command) {
    const operations = {
      pressStart: () => this.pressStart(), releaseStart: () => this.releaseStart(), pressStop: () => this.pressStop(), releaseStop: () => this.releaseStop(),
      engageEmergencyStop: () => this.engageEmergencyStop(), releaseEmergencyStop: () => this.releaseEmergencyStop(), pressReset: () => this.pressReset(), releaseReset: () => this.releaseReset()
    };
    if (!Object.hasOwn(operations, command)) throw new Lab001SessionError("INVALID_LEARNER_COMMAND", `Unsupported learner command: ${command}.`, { command });
    return operations[command]();
  }

  resetLab() {
    this.#requireInitialized();
    try { this.#controller.reset(); this.#diagnostics.resetCount += 1; return this.getSnapshot(); }
    catch (error) { this.#recordFault(error); throw error; }
  }

  getValidationResult() { return immutableCopy(this.#lastValidationResult); }

  getSnapshot() {
    const controller = this.#controller.getSnapshot();
    const plc = this.#plc.getSnapshot();
    const machine = this.#machine.getSnapshot();
    const motor = machine.components.find(component => component.type === "Motor") ?? null;
    const commands = Object.fromEntries(Object.entries(COMMANDS).map(([name, id]) => [name[0].toLowerCase() + name.slice(1), this.#registry.has(id) ? this.#registry.getSignalValue(id) : false]));
    return immutableCopy({
      lab: { id: lab001Definition.id, slug: lab001Definition.slug, title: lab001Definition.title, version: lab001Definition.version },
      lifecycleState: controller.state,
      initialized: this.#initialized,
      completed: controller.state === "Completed",
      simulation: { tick: controller.tick, time: controller.simulationTime },
      learnerCommands: commands,
      plc: { state: plc.state, inputs: plc.memory?.inputs ?? null, internalMemory: plc.memory?.internal ?? null, outputs: plc.memory?.outputs ?? null, diagnostics: plc.diagnostics },
      machine: { state: machine.state, motor, sensors: machine.sensors, faults: machine.faults, diagnostics: machine.diagnostics },
      validation: { result: this.#lastValidationResult, session: this.#validation.getSnapshot().session, diagnostics: this.#validation.getDiagnostics() },
      diagnostics: { ...this.#diagnostics, currentLifecycleState: controller.state }
    });
  }

  #writeCommand(operation, signalId, value) {
    this.#requireInitialized();
    if (this.#controller.getSnapshot().state === "Completed") throw new Lab001SessionError("SESSION_COMPLETED", "Completed Lab 001 Session does not accept learner commands.");
    const timestamp = this.#clock.getSnapshot().simulationTime;
    this.#registry.updateSignal(signalId, { value, writer: "User", timestamp });
    this.#diagnostics.learnerCommandCount += 1;
    this.#diagnostics.lastLearnerCommand = immutableCopy({ operation, signalId, value, tick: this.#clock.getSnapshot().tick, timestamp });
    return this.getSnapshot();
  }

  #publishMachineFeedback(timestamp) {
    const machine = this.#machine.getSnapshot();
    const values = {
      "sig.machine.lab001.motor_running": machine.sensors["sensor-running"].value,
      "sig.machine.lab001.conveyor_running": machine.state === "Running",
      "sig.machine.lab001.conveyor_stopped": machine.sensors["sensor-stopped"].value,
      "sig.machine.lab001.fault": machine.sensors["sensor-fault"].value,
      "sig.machine.lab001.emergency": machine.sensors["sensor-emergency"].value
    };
    for (const [id, value] of Object.entries(values)) this.#registry.updateSignal(id, { value, writer: "Machine", timestamp });
    return immutableCopy(values);
  }

  #evaluateValidation(tick, timestamp) {
    this.#advanceEvidence(timestamp);
    this.#lastValidationResult = this.#validation.evaluate({ tick, timestamp });
    this.#diagnostics.lastValidationResultSummary = immutableCopy({ tick, completed: this.#lastValidationResult.completed, passed: this.#lastValidationResult.passed.length, pending: this.#lastValidationResult.pending.length, failed: this.#lastValidationResult.failed.length });
    return this.#lastValidationResult;
  }

  #advanceEvidence(timestamp) {
    const machine = this.#machine.getSnapshot();
    const running = machine.state === "Running";
    const stopped = machine.state === "Stopped";
    const start = this.#registry.getSignalValue(COMMANDS.Start);
    const stop = this.#registry.getSignalValue(COMMANDS.Stop);
    const emergencyCommand = this.#registry.getSignalValue(COMMANDS.Emergency);
    const reset = this.#registry.getSignalValue(COMMANDS.Reset);
    const emergencyFeedback = machine.sensors["sensor-emergency"].value;

    if (this.#stage === 0 && running) { this.#setEvidence(EVIDENCE.started, timestamp); this.#stage = 1; }
    if (this.#stage === 1 && !start && running) { this.#setEvidence(EVIDENCE.held, timestamp); this.#stage = 2; }
    if (this.#stage === 2 && stop && stopped) { this.#setEvidence(EVIDENCE.stopped, timestamp); this.#stage = 3; }
    if (this.#stage === 3 && start && stop && stopped) { this.#setEvidence(EVIDENCE.stopPriority, timestamp); this.#stage = 4; }
    if (this.#stage === 4 && running && !emergencyCommand) this.#runningBeforeEmergency = true;
    if (this.#stage === 4 && this.#runningBeforeEmergency && emergencyCommand && emergencyFeedback && !running) { this.#setEvidence(EVIDENCE.emergencyPriority, timestamp); this.#stage = 5; }
    if (this.#stage === 5 && reset && !emergencyFeedback && stopped) {
      this.#setEvidence(EVIDENCE.resetCleared, timestamp); this.#setEvidence(EVIDENCE.resetNoRestart, timestamp); this.#stage = 6;
    }
    if (this.#stage === 6 && !start && !reset) this.#newStartArmed = true;
    if (this.#stage === 6 && this.#newStartArmed && start && running) { this.#setEvidence(EVIDENCE.restarted, timestamp); this.#stage = 7; }
  }

  #setEvidence(signalId, timestamp) {
    if (!this.#registry.getSignalValue(signalId)) this.#registry.updateSignal(signalId, { value: true, writer: "Academy", timestamp });
  }

  #resetParticipants() {
    this.#registry.resetAll({ timestamp: 0 });
    this.#plc.reset();
    this.#machine.reset();
    this.#validation.reset();
    this.#attempt += 1;
    this.#validation.startSession({ id: `lab001-validation-${this.#attempt}`, startTick: 0 });
    this.#stage = 0; this.#runningBeforeEmergency = false; this.#newStartArmed = false; this.#lastValidationResult = null;
    const initializationCount = this.#diagnostics.initializationCount; const resetCount = this.#diagnostics.resetCount;
    this.#diagnostics = { initializationCount, executedTickCount: 0, learnerCommandCount: 0, resetCount, completionCount: 0, faultCount: 0, lastLearnerCommand: null, lastTickResultSummary: null, lastValidationResultSummary: null, lastError: null };
    this.#publishMachineFeedback(0);
  }

  #requireInitialized() { if (!this.#initialized) throw new Lab001SessionError("SESSION_NOT_INITIALIZED", "Lab 001 Session must be initialized first."); }
  #recordFault(error) { this.#diagnostics.faultCount += 1; this.#diagnostics.lastError = immutableCopy({ code: error?.code ?? "LAB001_ERROR", message: error instanceof Error ? error.message : String(error) }); }
}

export function createLab001Session() { return new Lab001Session(); }
