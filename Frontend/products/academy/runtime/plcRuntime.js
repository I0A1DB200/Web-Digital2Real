import { immutableCopy } from "../core/signalDefinition.js";
import { PLCEventType, PLCFaultType, PLCLifecycleState, PLCMappingDirection, PLCMemoryArea } from "./plcConstants.js";
import { PLCMemory } from "./plcMemory.js";
import { executePrograms, validatePrograms } from "./programModel.js";

export class PLCRuntimeError extends Error {
  constructor(code, message, context = {}) { super(message); this.name = "PLCRuntimeError"; this.code = code; this.context = immutableCopy(context); }
}

export class PLCRuntime {
  #state = PLCLifecycleState.Uninitialized;
  #memory = null;
  #programs = null;
  #mappings = null;
  #registry = null;
  #subscribers = new Set();
  #eventSequence = 0;
  #lastTick = 0;
  #lastTimestamp = 0;
  #fault = null;
  #lastScanResult = null;
  #diagnostics = createDiagnostics();

  initialize({ memorySchema, programs, mappings = [], signalRegistry = null } = {}) {
    this.#assertState("initialize", [PLCLifecycleState.Uninitialized]);
    try {
      this.#memory = new PLCMemory(memorySchema);
      this.#programs = validatePrograms(programs, this.#memory);
      this.#registry = signalRegistry;
      this.#mappings = validateMappings(mappings, this.#memory, signalRegistry);
      this.#setState("initialize", PLCLifecycleState.Ready);
      this.#emit(PLCEventType.Initialized);
      return this.getSnapshot();
    } catch (error) {
      this.#enterFault(classifyFault(error), error);
      throw error;
    }
  }

  start() {
    this.#assertState("start", [PLCLifecycleState.Ready, PLCLifecycleState.Stopped]);
    this.#setState("start", PLCLifecycleState.Running);
    this.#emit(PLCEventType.Started);
    return this.getSnapshot();
  }

  stop() {
    this.#assertState("stop", [PLCLifecycleState.Running]);
    this.#setState("stop", PLCLifecycleState.Stopped);
    this.#emit(PLCEventType.Stopped);
    return this.getSnapshot();
  }

  scan({ tick, timestamp = tick, inputSnapshot = null } = {}) {
    this.#assertState("scan", [PLCLifecycleState.Running]);
    validateBoundary(tick, timestamp, this.#lastTick, this.#lastTimestamp);
    this.#diagnostics.scanCount += 1;
    this.#lastTick = tick;
    this.#lastTimestamp = timestamp;
    this.#emit(PLCEventType.ScanStarted);

    try {
      const sampledInputs = this.#sampleInputs(inputSnapshot);
      this.#memory.sampleInputs(sampledInputs);
      const executionState = this.#memory.createExecutionState();
      const trace = executePrograms(this.#programs, this.#memory, executionState);
      const publication = this.#memory.commitExecution(executionState);
      this.#publishOutputs(publication.outputs);
      publication.changedOutputs.forEach(id => this.#emit(PLCEventType.OutputChanged, { id, value: publication.outputs[id] }));
      this.#diagnostics.successfulScanCount += 1;
      this.#diagnostics.changedOutputCount += publication.changedOutputs.length;
      this.#lastScanResult = immutableCopy({
        scanNumber: this.#diagnostics.scanCount,
        tick,
        timestamp,
        lifecycleState: this.#state,
        sampledInputs,
        internalMemory: this.#memory.getAreaSnapshot(PLCMemoryArea.Internal),
        outputs: publication.outputs,
        changedOutputs: publication.changedOutputs,
        executionStatus: "Completed",
        trace,
        diagnostics: this.#scanDiagnosticsSummary()
      });
      this.#diagnostics.lastScanResultSummary = immutableCopy({ scanNumber: this.#diagnostics.scanCount, tick, timestamp, executionStatus: "Completed" });
      this.#emit(PLCEventType.ScanCompleted, { scanResult: this.#lastScanResult });
      return this.#lastScanResult;
    } catch (error) {
      this.#diagnostics.failedScanCount += 1;
      this.#memory?.applySafeOutputs();
      this.#enterFault(classifyFault(error), error);
      throw error;
    }
  }

  reset() {
    this.#assertState("reset", [PLCLifecycleState.Ready, PLCLifecycleState.Running, PLCLifecycleState.Stopped, PLCLifecycleState.Faulted]);
    const previousState = this.#state;
    this.#state = PLCLifecycleState.Resetting;
    this.#memory.reset();
    const resetCount = this.#diagnostics.resetCount + 1;
    this.#diagnostics = createDiagnostics();
    this.#diagnostics.resetCount = resetCount;
    this.#diagnostics.lastTransition = immutableCopy({ operation: "reset", from: previousState, to: PLCLifecycleState.Ready });
    this.#fault = null;
    this.#lastScanResult = null;
    this.#lastTick = 0;
    this.#lastTimestamp = 0;
    this.#eventSequence = 0;
    this.#state = PLCLifecycleState.Ready;
    this.#emit(PLCEventType.Reset);
    return this.getSnapshot();
  }

  fault(error) {
    if (this.#state === PLCLifecycleState.Uninitialized) this.#assertState("fault", []);
    this.#enterFault(PLCFaultType.InternalFault, error);
    return this.getSnapshot();
  }

  subscribe(subscriber) {
    if (typeof subscriber !== "function") throw new PLCRuntimeError("InvalidSubscriber", "PLC subscriber must be a function.");
    this.#subscribers.add(subscriber); return () => this.unsubscribe(subscriber);
  }
  unsubscribe(subscriber) { return this.#subscribers.delete(subscriber); }
  getDiagnostics() { return immutableCopy({ ...this.#diagnostics, currentLifecycleState: this.#state, lastFault: this.#fault }); }
  getSnapshot() {
    return immutableCopy({ state: this.#state, status: this.#state, tick: this.#lastTick, timestamp: this.#lastTimestamp, fault: this.#fault, programs: this.#programs, mappings: this.#mappings, memory: this.#memory?.getSnapshot() ?? null, lastScanResult: this.#lastScanResult, diagnostics: this.getDiagnostics() });
  }

  #sampleInputs(inputSnapshot) {
    const inputMappings = this.#mappings.filter(mapping => mapping.direction === PLCMappingDirection.SignalToPLCInput);
    if (inputMappings.length === 0) {
      if (!inputSnapshot || typeof inputSnapshot !== "object" || Array.isArray(inputSnapshot)) throw new PLCRuntimeError(PLCFaultType.SignalReadFailure, "A complete direct Input image is required.");
      this.#diagnostics.inputReadCount += Object.keys(inputSnapshot).length;
      return immutableCopy({ ...inputSnapshot });
    }
    const sampled = {};
    for (const mapping of inputMappings) {
      try {
        let value;
        if (inputSnapshot && Object.hasOwn(inputSnapshot, mapping.signalId)) value = inputSnapshot[mapping.signalId];
        else if (this.#registry) value = this.#registry.getSignalValue(mapping.signalId);
        else if (mapping.hasDefault) value = mapping.defaultValue;
        else throw new Error(`Signal ${mapping.signalId} is unavailable.`);
        if (typeof value !== "boolean") throw new Error(`Signal ${mapping.signalId} is not Boolean.`);
        sampled[mapping.memoryId] = value;
        this.#diagnostics.inputReadCount += 1;
      } catch (error) {
        if (mapping.hasDefault) { sampled[mapping.memoryId] = mapping.defaultValue; this.#diagnostics.inputReadCount += 1; continue; }
        throw new PLCRuntimeError(PLCFaultType.SignalReadFailure, `Unable to read ${mapping.signalId}.`, { signalId: mapping.signalId, cause: error instanceof Error ? error.message : String(error) });
      }
    }
    return immutableCopy(sampled);
  }

  #publishOutputs(outputs) {
    const outputMappings = this.#mappings.filter(mapping => mapping.direction === PLCMappingDirection.PLCOutputToSignal);
    for (const mapping of outputMappings) {
      if (!this.#registry) throw new PLCRuntimeError(PLCFaultType.SignalWriteFailure, "Output mapping requires a Signal Registry.", { signalId: mapping.signalId });
      try {
        this.#registry.updateSignal(mapping.signalId, { value: outputs[mapping.memoryId], writer: "PLC", timestamp: this.#lastTimestamp });
        this.#diagnostics.outputWriteCount += 1;
      } catch (error) {
        throw new PLCRuntimeError(PLCFaultType.SignalWriteFailure, `Unable to publish ${mapping.signalId}.`, { signalId: mapping.signalId, cause: error instanceof Error ? error.message : String(error) });
      }
    }
  }

  #scanDiagnosticsSummary() { return immutableCopy({ scanCount: this.#diagnostics.scanCount, successfulScanCount: this.#diagnostics.successfulScanCount + 1, failedScanCount: this.#diagnostics.failedScanCount, inputReadCount: this.#diagnostics.inputReadCount, outputWriteCount: this.#diagnostics.outputWriteCount }); }
  #assertState(operation, allowed) {
    if (allowed.includes(this.#state)) return;
    const error = new PLCRuntimeError("InvalidLifecycleTransition", `${operation} is invalid from ${this.#state}.`, { operation, state: this.#state, allowed });
    this.#diagnostics.lastFault = summarizeError(error); throw error;
  }
  #setState(operation, next) { const previous = this.#state; this.#state = next; this.#diagnostics.lastTransition = immutableCopy({ operation, from: previous, to: next }); }
  #enterFault(type, error) {
    const previous = this.#state; this.#state = PLCLifecycleState.Faulted; this.#diagnostics.faultCount += 1;
    this.#fault = immutableCopy({ type, tick: this.#lastTick, timestamp: this.#lastTimestamp, error: summarizeError(error) });
    this.#diagnostics.lastFault = this.#fault; this.#diagnostics.lastTransition = immutableCopy({ operation: "fault", from: previous, to: this.#state }); this.#emit(PLCEventType.Faulted, { fault: this.#fault });
  }
  #emit(type, payload = {}) {
    const event = immutableCopy({ type, sequence: ++this.#eventSequence, tick: this.#lastTick, timestamp: this.#lastTimestamp, state: this.#state, ...payload }); this.#diagnostics.eventCount += 1;
    for (const subscriber of this.#subscribers) try { subscriber(event); } catch (error) { this.#diagnostics.subscriberErrorCount += 1; this.#diagnostics.lastSubscriberError = summarizeError(error); }
  }
}

function validateMappings(mappings, memory, registry) {
  if (!Array.isArray(mappings)) throw new PLCRuntimeError("InvalidInputMapping", "mappings must be an array.");
  const inputTargets = new Set(); const outputTargets = new Set(); const outputSignals = new Set();
  const result = mappings.map(mapping => {
    if (!mapping || typeof mapping.signalId !== "string" || !mapping.signalId || typeof mapping.memoryId !== "string" || !mapping.memoryId) throw new PLCRuntimeError("InvalidInputMapping", "Mapping requires signalId and memoryId.");
    if (!Object.hasOwn(PLCMappingDirection, mapping.direction)) throw new PLCRuntimeError("InvalidInputMapping", `Unknown mapping direction: ${mapping.direction}.`);
    const input = mapping.direction === PLCMappingDirection.SignalToPLCInput; const area = input ? PLCMemoryArea.Input : PLCMemoryArea.Output; const code = input ? "InvalidInputMapping" : "InvalidOutputMapping";
    if (!memory.has(area, mapping.memoryId)) throw new PLCRuntimeError(code, `Mapping target ${mapping.memoryId} does not exist in ${area}.`);
    const targets = input ? inputTargets : outputTargets;
    if (targets.has(mapping.memoryId) || (!input && outputSignals.has(mapping.signalId))) throw new PLCRuntimeError(code, "Duplicate mapping writer or memory target.", { mapping });
    targets.add(mapping.memoryId); if (!input) outputSignals.add(mapping.signalId);
    if (registry) {
      if (!registry.has(mapping.signalId)) throw new PLCRuntimeError(code, `Mapped Signal ${mapping.signalId} is not registered.`);
      const definition = registry.getSignalDefinition(mapping.signalId);
      if (definition.dataType !== "Boolean" || (!input && definition.owner !== "PLC")) throw new PLCRuntimeError(code, `Mapped Signal ${mapping.signalId} has incompatible Type or Owner.`);
    }
    if (mapping.defaultValue !== undefined && typeof mapping.defaultValue !== "boolean") throw new PLCRuntimeError(code, "Mapping defaultValue must be Boolean.");
    return { direction: mapping.direction, signalId: mapping.signalId, memoryId: mapping.memoryId, hasDefault: mapping.defaultValue !== undefined, defaultValue: mapping.defaultValue ?? false };
  });
  return immutableCopy(result);
}

function validateBoundary(tick, timestamp, lastTick, lastTimestamp) {
  if (!Number.isInteger(tick) || tick <= lastTick) throw new PLCRuntimeError("ExecutionFault", "PLC tick must increase deterministically.", { tick, lastTick });
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp) || timestamp <= lastTimestamp) throw new PLCRuntimeError("ExecutionFault", "PLC timestamp must increase deterministically.", { timestamp, lastTimestamp });
}
function createDiagnostics() { return { scanCount: 0, successfulScanCount: 0, failedScanCount: 0, inputReadCount: 0, outputWriteCount: 0, changedOutputCount: 0, resetCount: 0, faultCount: 0, eventCount: 0, subscriberErrorCount: 0, lastSubscriberError: null, lastTransition: null, lastScanResultSummary: null, lastFault: null }; }
function classifyFault(error) { return Object.hasOwn(PLCFaultType, error?.code) ? error.code : error?.code === "InvalidMemoryReference" ? PLCFaultType.InvalidMemoryReference : error?.code === "InvalidInstruction" ? PLCFaultType.InvalidInstruction : error?.code === "InvalidProgram" ? PLCFaultType.InvalidProgram : PLCFaultType.ExecutionFault; }
function summarizeError(error) { return immutableCopy({ code: error?.code ?? "PLCError", message: error instanceof Error ? error.message : String(error) }); }
