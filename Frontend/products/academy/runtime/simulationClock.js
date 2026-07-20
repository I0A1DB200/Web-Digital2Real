import { immutableCopy } from "../core/signalDefinition.js";

export const SimulationClockState = Object.freeze({
  Idle: "Idle",
  Ready: "Ready",
  Running: "Running",
  Paused: "Paused",
  Stopped: "Stopped",
  Completed: "Completed",
  Faulted: "Faulted",
  Resetting: "Resetting"
});

export class SimulationLifecycleError extends Error {
  constructor(code, message, context = {}) {
    super(message);
    this.name = "SimulationLifecycleError";
    this.code = code;
    this.context = immutableCopy(context);
  }
}

export class SimulationClock {
  #fixedStep;
  #maximumTicks;
  #speedMultiplier;
  #state = SimulationClockState.Idle;
  #tickCount = 0;
  #simulationTime = 0;
  #diagnostics = {
    resetCount: 0,
    pauseCount: 0,
    resumeCount: 0,
    rejectedTransitionCount: 0,
    lastTransition: null,
    lastError: null
  };

  constructor({ fixedStep, maximumTicks = null, speedMultiplier = 1 } = {}) {
    if (typeof fixedStep !== "number" || !Number.isFinite(fixedStep) || fixedStep <= 0) {
      throw new SimulationLifecycleError("INVALID_FIXED_STEP", "fixedStep must be a positive finite number.", { fixedStep });
    }

    if (maximumTicks !== null && (!Number.isInteger(maximumTicks) || maximumTicks <= 0)) {
      throw new SimulationLifecycleError("INVALID_MAXIMUM_TICKS", "maximumTicks must be null or a positive integer.", { maximumTicks });
    }

    this.#validateSpeedMultiplier(speedMultiplier);
    this.#fixedStep = fixedStep;
    this.#maximumTicks = maximumTicks;
    this.#speedMultiplier = speedMultiplier;
  }

  initialize() {
    this.#transition("initialize", [SimulationClockState.Idle], SimulationClockState.Ready);
    return this.getSnapshot();
  }

  start() {
    this.#transition("start", [SimulationClockState.Ready], SimulationClockState.Running);
    return this.getSnapshot();
  }

  pause() {
    this.#transition("pause", [SimulationClockState.Running], SimulationClockState.Paused);
    this.#diagnostics.pauseCount += 1;
    return this.getSnapshot();
  }

  resume() {
    this.#transition("resume", [SimulationClockState.Paused], SimulationClockState.Running);
    this.#diagnostics.resumeCount += 1;
    return this.getSnapshot();
  }

  stop() {
    this.#transition("stop", [SimulationClockState.Ready, SimulationClockState.Running, SimulationClockState.Paused], SimulationClockState.Stopped);
    return this.getSnapshot();
  }

  complete() {
    this.#transition("complete", [SimulationClockState.Running, SimulationClockState.Paused], SimulationClockState.Completed);
    return this.getSnapshot();
  }

  fault(error) {
    if (this.#state === SimulationClockState.Idle) {
      return this.#reject("fault", [SimulationClockState.Ready, SimulationClockState.Running, SimulationClockState.Paused], error);
    }

    const previousState = this.#state;
    this.#state = SimulationClockState.Faulted;
    this.#diagnostics.lastTransition = immutableCopy({ operation: "fault", from: previousState, to: this.#state });
    this.#diagnostics.lastError = errorSummary(error);
    return this.getSnapshot();
  }

  tick() {
    if (this.#state !== SimulationClockState.Running) {
      return this.#reject("tick", [SimulationClockState.Running]);
    }

    return this.#advance("tick");
  }

  step() {
    if (![SimulationClockState.Ready, SimulationClockState.Paused].includes(this.#state)) {
      return this.#reject("step", [SimulationClockState.Ready, SimulationClockState.Paused]);
    }

    const previousState = this.#state;
    this.#state = SimulationClockState.Paused;
    this.#diagnostics.lastTransition = immutableCopy({ operation: "step", from: previousState, to: this.#state });
    return this.#advance("step");
  }

  reset() {
    const allowed = Object.values(SimulationClockState).filter(state => state !== SimulationClockState.Idle && state !== SimulationClockState.Resetting);

    if (!allowed.includes(this.#state)) {
      return this.#reject("reset", allowed);
    }

    const resetCount = this.#diagnostics.resetCount + 1;
    const previousState = this.#state;
    this.#state = SimulationClockState.Resetting;
    this.#tickCount = 0;
    this.#simulationTime = 0;
    this.#diagnostics = {
      resetCount,
      pauseCount: 0,
      resumeCount: 0,
      rejectedTransitionCount: 0,
      lastTransition: immutableCopy({ operation: "reset", from: previousState, to: SimulationClockState.Ready }),
      lastError: null
    };
    this.#state = SimulationClockState.Ready;
    return this.getSnapshot();
  }

  setSpeedMultiplier(speedMultiplier) {
    this.#validateSpeedMultiplier(speedMultiplier);
    this.#speedMultiplier = speedMultiplier;
    return this.getSnapshot();
  }

  getSnapshot() {
    return immutableCopy({
      state: this.#state,
      status: this.#state,
      tick: this.#tickCount,
      simulationTime: this.#simulationTime,
      fixedStep: this.#fixedStep,
      maximumTicks: this.#maximumTicks,
      speedMultiplier: this.#speedMultiplier,
      diagnostics: {
        tickCount: this.#tickCount,
        resetCount: this.#diagnostics.resetCount,
        pauseCount: this.#diagnostics.pauseCount,
        resumeCount: this.#diagnostics.resumeCount,
        rejectedTransitionCount: this.#diagnostics.rejectedTransitionCount,
        lastTransition: this.#diagnostics.lastTransition,
        lastError: this.#diagnostics.lastError,
        totalExecutionTime: this.#simulationTime,
        currentState: this.#state
      }
    });
  }

  #advance(operation) {
    if (this.#maximumTicks !== null && this.#tickCount >= this.#maximumTicks) {
      return this.#reject(operation, [], new SimulationLifecycleError("EXECUTION_LIMIT_REACHED", "The configured maximum tick count has been reached.", { maximumTicks: this.#maximumTicks }));
    }

    this.#tickCount += 1;
    this.#simulationTime = this.#tickCount * this.#fixedStep;
    return this.getSnapshot();
  }

  #transition(operation, allowedStates, nextState) {
    if (!allowedStates.includes(this.#state)) return this.#reject(operation, allowedStates);
    const previousState = this.#state;
    this.#state = nextState;
    this.#diagnostics.lastTransition = immutableCopy({ operation, from: previousState, to: nextState });
    this.#diagnostics.lastError = null;
  }

  #reject(operation, allowedStates, cause = null) {
    const error = cause instanceof SimulationLifecycleError
      ? cause
      : new SimulationLifecycleError("INVALID_CLOCK_TRANSITION", `Clock operation ${operation} is invalid from ${this.#state}.`, { operation, state: this.#state, allowedStates });
    this.#diagnostics.rejectedTransitionCount += 1;
    this.#diagnostics.lastError = errorSummary(error);
    throw error;
  }

  #validateSpeedMultiplier(speedMultiplier) {
    if (typeof speedMultiplier !== "number" || !Number.isFinite(speedMultiplier) || speedMultiplier <= 0) {
      throw new SimulationLifecycleError("INVALID_SPEED_MULTIPLIER", "speedMultiplier must be a positive finite number.", { speedMultiplier });
    }
  }
}

function errorSummary(error) {
  return immutableCopy({
    code: error?.code ?? "SIMULATION_ERROR",
    message: error instanceof Error ? error.message : String(error)
  });
}
