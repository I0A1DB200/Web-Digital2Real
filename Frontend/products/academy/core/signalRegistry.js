import { SignalEventType, SignalQuality } from "./signalConstants.js";
import { SignalDomainError, createSignalDefinition, immutableCopy, validateSignalValue, validateTimestamp } from "./signalDefinition.js";

export class SignalRegistry {
  #definitions = new Map(); #states = new Map(); #subscribers = new Set();
  #diagnostics = { totalUpdateCount: 0, rejectedUpdateCount: 0, eventCount: 0, subscriberErrorCount: 0, lastErrorSummary: null, resetCount: 0 };

  register(candidate, { timestamp = 0 } = {}) {
    validateTimestamp(timestamp);
    const definition = createSignalDefinition(candidate);
    if (this.has(definition.id)) throw this.#error("DUPLICATE_SIGNAL", `${definition.id} is already registered.`, { id: definition.id });
    this.#add(definition, timestamp);
    return this.getSignalDefinition(definition.id);
  }

  registerMany(candidates, { timestamp = 0 } = {}) {
    validateTimestamp(timestamp);
    if (!Array.isArray(candidates)) throw this.#error("INVALID_SIGNAL_DEFINITION", "Bulk registration requires an array.");
    const definitions = candidates.map(createSignalDefinition);
    const ids = new Set();
    for (const definition of definitions) {
      if (ids.has(definition.id) || this.has(definition.id)) throw this.#error("DUPLICATE_SIGNAL", `${definition.id} is already registered.`, { id: definition.id });
      ids.add(definition.id);
    }
    definitions.forEach(definition => this.#add(definition, timestamp));
    return Object.freeze(definitions.map(({ id }) => this.getSignalDefinition(id)));
  }

  has(id) { return this.#definitions.has(id); }
  getSignalDefinition(id) { return immutableCopy(this.#required(id)); }
  getSignalState(id) { this.#required(id); return immutableCopy(this.#states.get(id)); }
  getSignalValue(id) { return this.getSignalState(id).currentValue; }
  listSignals() { return Object.freeze([...this.#definitions.keys()].map(id => immutableCopy({ definition: this.#definitions.get(id), state: this.#states.get(id) }))); }

  updateSignal(id, { value, writer, timestamp, quality } = {}) {
    try {
      const definition = this.#required(id);
      if (typeof writer !== "string" || !writer) throw this.#error("INVALID_WRITER", "A writer identity is required.", { id });
      if (writer !== definition.owner) throw this.#error("WRITE_ACCESS_DENIED", `${writer} does not own ${id}.`, { id, writer, owner: definition.owner });
      validateTimestamp(timestamp);
      validateSignalValue(definition.dataType, value, definition.metadata);
      const previous = this.#states.get(id);
      const nextQuality = quality ?? previous.quality;
      if (!Object.hasOwn(SignalQuality, nextQuality)) throw this.#error("INVALID_QUALITY", "Quality is unsupported.", { quality: nextQuality });
      const changed = previous.currentValue !== value;
      const qualityChanged = previous.quality !== nextQuality;
      const next = { currentValue: value, previousValue: previous.currentValue, timestamp, quality: nextQuality, updateCount: previous.updateCount + 1, changed, initialized: true };
      this.#states.set(id, next);
      this.#diagnostics.totalUpdateCount += 1;
      const event = { signalId: id, timestamp, previousValue: previous.currentValue, currentValue: value, previousQuality: previous.quality, currentQuality: nextQuality, writer, metadata: {} };
      this.#emit(SignalEventType["Signal Updated"], event);
      if (changed) this.#emit(SignalEventType["Signal Changed"], event);
      if (qualityChanged) this.#emit(SignalEventType["Signal Quality Changed"], event);
      return this.getSignalState(id);
    } catch (error) {
      this.#diagnostics.rejectedUpdateCount += 1;
      this.#diagnostics.lastErrorSummary = { code: error?.code ?? "UNKNOWN_ERROR", message: error instanceof Error ? error.message : String(error) };
      throw error;
    }
  }

  updateSignalQuality(id, { quality, writer, timestamp } = {}) { return this.updateSignal(id, { value: this.getSignalValue(id), quality, writer, timestamp }); }
  resetSignal(id, { timestamp } = {}) {
    const definition = this.#required(id); validateTimestamp(timestamp); this.#states.set(id, this.#initial(definition, timestamp)); this.#diagnostics.resetCount += 1;
    this.#emit(SignalEventType["Signal Reset"], { signalId: id, timestamp, writer: "Signal Registry", metadata: {} }); return this.getSignalState(id);
  }
  resetAll({ timestamp } = {}) {
    validateTimestamp(timestamp); for (const [id, definition] of this.#definitions) this.#states.set(id, this.#initial(definition, timestamp)); this.#diagnostics.resetCount += 1;
    this.#emit(SignalEventType["Registry Reset"], { signalId: null, timestamp, writer: "Signal Registry", metadata: { signalCount: this.#definitions.size } }); return this.listSignals();
  }
  subscribe(subscriber) {
    if (typeof subscriber !== "function") throw new SignalDomainError("INVALID_SUBSCRIBER", "Subscriber must be a function.");
    this.#subscribers.add(subscriber); return () => this.unsubscribe(subscriber);
  }
  unsubscribe(subscriber) { return this.#subscribers.delete(subscriber); }
  getDiagnostics() { return immutableCopy({ registeredSignalCount: this.#definitions.size, ...this.#diagnostics }); }

  #add(definition, timestamp) { this.#definitions.set(definition.id, definition); this.#states.set(definition.id, this.#initial(definition, timestamp)); this.#emit(SignalEventType["Signal Registered"], { signalId: definition.id, timestamp, writer: definition.owner, metadata: {} }); }
  #initial(definition, timestamp) { return { currentValue: definition.defaultValue, previousValue: null, timestamp, quality: definition.initialQuality, updateCount: 0, changed: false, initialized: true }; }
  #required(id) { const definition = this.#definitions.get(id); if (!definition) throw this.#error("SIGNAL_NOT_FOUND", `${id} is not registered.`, { id }); return definition; }
  #emit(type, payload) {
    const event = immutableCopy({ type, ...payload }); this.#diagnostics.eventCount += 1;
    for (const subscriber of this.#subscribers) try { subscriber(event); } catch (error) { this.#diagnostics.subscriberErrorCount += 1; this.#diagnostics.lastErrorSummary = { code: "SUBSCRIBER_ERROR", message: error instanceof Error ? error.message : String(error) }; }
  }
  #error(code, message, context = {}) { const error = new SignalDomainError(code, message, context); this.#diagnostics.lastErrorSummary = { code, message }; return error; }
}
