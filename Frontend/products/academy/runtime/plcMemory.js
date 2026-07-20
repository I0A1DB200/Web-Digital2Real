import { immutableCopy } from "../core/signalDefinition.js";
import { PLCMemoryArea } from "./plcConstants.js";

export class PLCMemoryError extends Error {
  constructor(code, message, context = {}) { super(message); this.name = "PLCMemoryError"; this.code = code; this.context = immutableCopy(context); }
}

export class PLCMemory {
  #schema;
  #inputs;
  #internal;
  #outputs;
  #publishedOutputs;

  constructor(schema) {
    this.#schema = validateMemorySchema(schema);
    this.#inputs = initialArea(this.#schema.Input);
    this.#internal = initialArea(this.#schema.Internal);
    this.#outputs = initialArea(this.#schema.Output);
    this.#publishedOutputs = { ...this.#outputs };
  }

  has(area, id) { return Object.hasOwn(this.#area(area), id); }

  sampleInputs(values) {
    validateCompleteImage(values, this.#schema.Input, "Input");
    this.#inputs = { ...values };
    return this.getAreaSnapshot(PLCMemoryArea.Input);
  }

  createExecutionState() {
    return { Input: { ...this.#inputs }, Internal: { ...this.#internal }, Output: { ...this.#outputs } };
  }

  commitExecution(executionState) {
    validateCompleteImage(executionState.Internal, this.#schema.Internal, "Internal");
    validateCompleteImage(executionState.Output, this.#schema.Output, "Output");
    const previous = this.#publishedOutputs;
    this.#internal = { ...executionState.Internal };
    this.#outputs = { ...executionState.Output };
    this.#publishedOutputs = { ...this.#outputs };
    return immutableCopy({ outputs: this.#publishedOutputs, changedOutputs: Object.keys(this.#publishedOutputs).filter(id => previous[id] !== this.#publishedOutputs[id]) });
  }

  applySafeOutputs() {
    const safe = Object.fromEntries(this.#schema.Output.map(item => [item.id, item.safeValue]));
    const previous = this.#publishedOutputs;
    this.#outputs = { ...safe };
    this.#publishedOutputs = { ...safe };
    return immutableCopy({ outputs: safe, changedOutputs: Object.keys(safe).filter(id => previous[id] !== safe[id]) });
  }

  read(executionState, area, id) {
    const values = executionState[area];
    if (!values || !Object.hasOwn(values, id)) throw new PLCMemoryError("InvalidMemoryReference", `Unknown ${area} memory reference: ${id}.`, { area, id });
    return values[id];
  }

  write(executionState, area, id, value) {
    if (![PLCMemoryArea.Internal, PLCMemoryArea.Output].includes(area) || !Object.hasOwn(executionState[area] ?? {}, id)) throw new PLCMemoryError("InvalidMemoryReference", `Cannot write ${area} memory reference: ${id}.`, { area, id });
    validateBoolean(value, id);
    executionState[area][id] = value;
  }

  reset() {
    this.#inputs = initialArea(this.#schema.Input); this.#internal = initialArea(this.#schema.Internal); this.#outputs = initialArea(this.#schema.Output); this.#publishedOutputs = { ...this.#outputs };
    return this.getSnapshot();
  }

  getAreaSnapshot(area) { return immutableCopy({ ...this.#area(area) }); }
  getSnapshot() { return immutableCopy({ schema: this.#schema, inputs: this.#inputs, internal: this.#internal, outputs: this.#publishedOutputs }); }

  #area(area) {
    if (area === PLCMemoryArea.Input) return this.#inputs;
    if (area === PLCMemoryArea.Internal) return this.#internal;
    if (area === PLCMemoryArea.Output) return this.#publishedOutputs;
    throw new PLCMemoryError("InvalidMemoryReference", `Unknown memory area: ${area}.`, { area });
  }
}

export function validateMemorySchema(schema) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) throw new PLCMemoryError("InvalidMemoryReference", "Memory schema must be an object.");
  const result = {};
  const allIds = new Set();
  for (const area of Object.values(PLCMemoryArea)) {
    const entries = schema[area] ?? [];
    if (!Array.isArray(entries)) throw new PLCMemoryError("InvalidMemoryReference", `${area} schema must be an array.`);
    result[area] = entries.map(entry => {
      if (!entry || typeof entry.id !== "string" || !entry.id.trim()) throw new PLCMemoryError("InvalidMemoryReference", `${area} memory requires an id.`);
      if (allIds.has(`${area}:${entry.id}`)) throw new PLCMemoryError("InvalidMemoryReference", `Duplicate ${area} memory id: ${entry.id}.`);
      validateBoolean(entry.defaultValue, entry.id); allIds.add(`${area}:${entry.id}`);
      const item = { id: entry.id, defaultValue: entry.defaultValue };
      if (area === PLCMemoryArea.Output) { validateBoolean(entry.safeValue, entry.id); item.safeValue = entry.safeValue; }
      return item;
    });
  }
  return immutableCopy(result);
}

function initialArea(entries) { return Object.fromEntries(entries.map(item => [item.id, item.defaultValue])); }
function validateCompleteImage(values, schema, area) {
  if (!values || typeof values !== "object" || Array.isArray(values)) throw new PLCMemoryError("InvalidMemoryReference", `${area} image must be an object.`);
  const expected = schema.map(item => item.id); const actual = Object.keys(values);
  if (actual.length !== expected.length || expected.some(id => !Object.hasOwn(values, id))) throw new PLCMemoryError("InvalidMemoryReference", `${area} image must contain every configured address exactly once.`, { expected, actual });
  expected.forEach(id => validateBoolean(values[id], id));
}
function validateBoolean(value, id) { if (typeof value !== "boolean") throw new PLCMemoryError("InvalidMemoryReference", `Memory ${id} accepts Boolean values only.`, { id, value }); }
