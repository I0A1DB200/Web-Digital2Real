import { immutableCopy } from "../core/signalDefinition.js";
import { SimulationClockState, SimulationLifecycleError } from "./simulationClock.js";

export const SimulationControllerState = Object.freeze({
  Idle: "Idle",
  Initializing: "Initializing",
  Ready: "Ready",
  Running: "Running",
  Paused: "Paused",
  Completed: "Completed",
  Failed: "Failed",
  Stopped: "Stopped",
  Faulted: "Faulted",
  Resetting: "Resetting"
});

export const SimulationEventType = Object.freeze({
  Started: "SimulationStarted",
  Paused: "SimulationPaused",
  Resumed: "SimulationResumed",
  Stopped: "SimulationStopped",
  Reset: "SimulationReset",
  Tick: "SimulationTick",
  Completed: "SimulationCompleted",
  Failed: "SimulationFailed",
  Faulted: "SimulationFaulted"
});

const TICK_PHASES = Object.freeze([
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
]);

const SUPPORTED_HANDLERS = new Set(["initialize", "reset", ...TICK_PHASES]);

export class SimulationController {
  #clock;
  #handlers;
  #state = SimulationControllerState.Idle;
  #subscribers = new Set();
  #eventSequence = 0;
  #lastTickResult = null;
  #diagnostics = {
    resetCount: 0,
    pauseCount: 0,
    resumeCount: 0,
    eventCount: 0,
    rejectedTransitionCount: 0,
    subscriberErrorCount: 0,
    lastTransition: null,
    lastError: null
  };

  constructor({ clock, handlers = {} } = {}) {
    if (!clock || typeof clock.getSnapshot !== "function") {
      throw new SimulationLifecycleError("INVALID_CLOCK", "SimulationController requires an injected SimulationClock contract.");
    }

    if (handlers === null || typeof handlers !== "object" || Array.isArray(handlers)) {
      throw new SimulationLifecycleError("INVALID_PHASE_HANDLERS", "handlers must be a plain object.");
    }

    for (const [name, handler] of Object.entries(handlers)) {
      if (!SUPPORTED_HANDLERS.has(name) || typeof handler !== "function") {
        throw new SimulationLifecycleError("INVALID_PHASE_HANDLER", `Unsupported simulation handler: ${name}.`, { name });
      }
    }

    this.#clock = clock;
    this.#handlers = Object.freeze({ ...handlers });
  }

  initialize(configuration = {}) {
    this.#assertState("initialize", [SimulationControllerState.Idle]);
    this.#setState("initialize", SimulationControllerState.Initializing);

    try {
      this.#invokeHandler("initialize", { configuration: immutableCopy(configuration) });
      this.#clock.initialize();
      this.#setState("initializeComplete", SimulationControllerState.Ready);
      return this.getSnapshot();
    } catch (error) {
      this.#fault(error);
      throw error;
    }
  }

  start() {
    this.#assertState("start", [SimulationControllerState.Ready]);
    this.#clock.start();
    this.#setState("start", SimulationControllerState.Running);
    this.#emit(SimulationEventType.Started);
    return this.getSnapshot();
  }

  pause() {
    this.#assertState("pause", [SimulationControllerState.Running]);
    this.#clock.pause();
    this.#diagnostics.pauseCount += 1;
    this.#setState("pause", SimulationControllerState.Paused);
    this.#emit(SimulationEventType.Paused);
    return this.getSnapshot();
  }

  resume() {
    this.#assertState("resume", [SimulationControllerState.Paused]);
    this.#clock.resume();
    this.#diagnostics.resumeCount += 1;
    this.#setState("resume", SimulationControllerState.Running);
    this.#emit(SimulationEventType.Resumed);
    return this.getSnapshot();
  }

  stop() {
    this.#assertState("stop", [SimulationControllerState.Ready, SimulationControllerState.Running, SimulationControllerState.Paused]);
    this.#clock.stop();
    this.#setState("stop", SimulationControllerState.Stopped);
    this.#emit(SimulationEventType.Stopped);
    return this.getSnapshot();
  }

  tick() {
    this.#assertState("tick", [SimulationControllerState.Running]);
    return this.#executeTick(false);
  }

  step() {
    this.#assertState("step", [SimulationControllerState.Ready, SimulationControllerState.Paused]);
    return this.#executeTick(true);
  }

  complete() {
    this.#assertState("complete", [SimulationControllerState.Running, SimulationControllerState.Paused]);
    this.#clock.complete();
    this.#setState("complete", SimulationControllerState.Completed);
    this.#emit(SimulationEventType.Completed);
    return this.getSnapshot();
  }

  fail(reason = null) {
    this.#assertState("fail", [SimulationControllerState.Running, SimulationControllerState.Paused]);
    this.#clock.stop();
    this.#setState("fail", SimulationControllerState.Failed);
    this.#emit(SimulationEventType.Failed, { reason: immutableCopy(reason) });
    return this.getSnapshot();
  }

  fault(error) {
    if (this.#state === SimulationControllerState.Idle) this.#assertState("fault", []);
    this.#fault(error);
    return this.getSnapshot();
  }

  reset() {
    const allowed = [SimulationControllerState.Ready, SimulationControllerState.Running, SimulationControllerState.Paused, SimulationControllerState.Completed, SimulationControllerState.Failed, SimulationControllerState.Stopped, SimulationControllerState.Faulted];
    this.#assertState("reset", allowed);
    const previousState = this.#state;
    this.#state = SimulationControllerState.Resetting;

    try {
      this.#invokeHandler("reset", { previousState });
      this.#clock.reset();
      const resetCount = this.#diagnostics.resetCount + 1;
      this.#diagnostics = {
        resetCount,
        pauseCount: 0,
        resumeCount: 0,
        eventCount: 0,
        rejectedTransitionCount: 0,
        subscriberErrorCount: 0,
        lastTransition: immutableCopy({ operation: "reset", from: previousState, to: SimulationControllerState.Ready }),
        lastError: null
      };
      this.#eventSequence = 0;
      this.#lastTickResult = null;
      this.#state = SimulationControllerState.Ready;
      this.#emit(SimulationEventType.Reset);
      return this.getSnapshot();
    } catch (error) {
      this.#fault(error);
      throw error;
    }
  }

  subscribe(subscriber) {
    if (typeof subscriber !== "function") throw new SimulationLifecycleError("INVALID_SUBSCRIBER", "Subscriber must be a function.");
    this.#subscribers.add(subscriber);
    return () => this.unsubscribe(subscriber);
  }

  unsubscribe(subscriber) {
    return this.#subscribers.delete(subscriber);
  }

  getSnapshot() {
    const clock = this.#clock.getSnapshot();
    return immutableCopy({
      state: this.#state,
      status: this.#state,
      tick: clock.tick,
      simulationTime: clock.simulationTime,
      clock,
      lastTickResult: this.#lastTickResult,
      diagnostics: {
        tickCount: clock.tick,
        resetCount: this.#diagnostics.resetCount,
        pauseCount: this.#diagnostics.pauseCount,
        resumeCount: this.#diagnostics.resumeCount,
        eventCount: this.#diagnostics.eventCount,
        rejectedTransitionCount: this.#diagnostics.rejectedTransitionCount,
        subscriberErrorCount: this.#diagnostics.subscriberErrorCount,
        lastTransition: this.#diagnostics.lastTransition,
        lastError: this.#diagnostics.lastError,
        totalExecutionTime: clock.simulationTime,
        currentState: this.#state
      }
    });
  }

  #executeTick(singleStep) {
    try {
      const clock = singleStep ? this.#clock.step() : this.#clock.tick();
      if (singleStep) this.#setState("step", SimulationControllerState.Paused);
      const phaseResults = {};

      for (const phase of TICK_PHASES) {
        phaseResults[phase] = this.#invokeHandler(phase, {
          phase,
          tick: clock.tick,
          simulationTime: clock.simulationTime,
          fixedStep: clock.fixedStep,
          controllerState: this.#state,
          clock
        });
      }

      this.#lastTickResult = immutableCopy({
        tick: clock.tick,
        simulationTime: clock.simulationTime,
        fixedStep: clock.fixedStep,
        phaseResults
      });
      this.#emit(SimulationEventType.Tick, { tickResult: this.#lastTickResult });
      this.#applyOutcome(phaseResults.determineOutcome);
      return this.getSnapshot();
    } catch (error) {
      this.#fault(error);
      throw error;
    }
  }

  #applyOutcome(outcome) {
    const status = outcome?.status ?? "continue";
    if (status === "continue") return;
    if (status === "completed") this.complete();
    else if (status === "failed") this.fail(outcome.reason ?? null);
    else if (status === "faulted") throw new SimulationLifecycleError("RUNTIME_FAULT", "A phase reported a runtime fault.", { outcome });
    else throw new SimulationLifecycleError("INVALID_TICK_OUTCOME", `Unsupported tick outcome: ${status}.`, { status });
  }

  #invokeHandler(name, context) {
    const handler = this.#handlers[name];
    if (!handler) return null;
    const result = handler(immutableCopy(context));
    if (result && typeof result.then === "function") {
      throw new SimulationLifecycleError("ASYNCHRONOUS_PHASE", `Handler ${name} returned a Promise; MVP phases must be synchronous.`, { name });
    }
    return immutableCopy(result ?? null);
  }

  #assertState(operation, allowedStates) {
    if (allowedStates.includes(this.#state)) return;
    const error = new SimulationLifecycleError("INVALID_CONTROLLER_TRANSITION", `Controller operation ${operation} is invalid from ${this.#state}.`, { operation, state: this.#state, allowedStates });
    this.#diagnostics.rejectedTransitionCount += 1;
    this.#diagnostics.lastError = summarizeError(error);
    throw error;
  }

  #setState(operation, nextState) {
    const previousState = this.#state;
    this.#state = nextState;
    this.#diagnostics.lastTransition = immutableCopy({ operation, from: previousState, to: nextState });
    this.#diagnostics.lastError = null;
  }

  #fault(error) {
    const previousState = this.#state;
    try {
      if (this.#clock.getSnapshot().state !== SimulationClockState.Idle) this.#clock.fault(error);
    } catch {
      // Controller fault ownership must survive a secondary Clock transition failure.
    }
    this.#state = SimulationControllerState.Faulted;
    this.#diagnostics.lastTransition = immutableCopy({ operation: "fault", from: previousState, to: this.#state });
    this.#diagnostics.lastError = summarizeError(error);
    this.#emit(SimulationEventType.Faulted, { error: this.#diagnostics.lastError });
  }

  #emit(type, payload = {}) {
    const clock = this.#clock.getSnapshot();
    const event = immutableCopy({ type, sequence: ++this.#eventSequence, tick: clock.tick, simulationTime: clock.simulationTime, state: this.#state, ...payload });
    this.#diagnostics.eventCount += 1;
    for (const subscriber of this.#subscribers) {
      try {
        subscriber(event);
      } catch (error) {
        this.#diagnostics.subscriberErrorCount += 1;
        this.#diagnostics.lastError = summarizeError(error, "SUBSCRIBER_ERROR");
      }
    }
  }
}

function summarizeError(error, fallbackCode = "SIMULATION_ERROR") {
  return immutableCopy({ code: error?.code ?? fallbackCode, message: error instanceof Error ? error.message : String(error) });
}
