import { immutableCopy } from "../core/signalDefinition.js";

export class MachineRuntimeError extends Error {
  constructor(code, message, context = {}) {
    super(message);
    this.name = "MachineRuntimeError";
    this.code = code;
    this.context = immutableCopy(context);
  }
}

export class MachineComponent {
  #id;
  #name;
  #type;
  #capabilities;
  #initialStatus;
  #initialEnabled;
  #status;
  #previousStatus = null;
  #enabled;
  #fault = null;
  #updateCount = 0;
  #resetCount = 0;
  #lastUpdate = null;

  constructor({ id, name, type, capabilities = [], initialStatus = "Stopped", enabled = true } = {}) {
    this.#id = requiredText(id, "id");
    this.#name = requiredText(name, "name");
    this.#type = requiredText(type, "type");
    if (!Array.isArray(capabilities) || capabilities.some(capability => typeof capability !== "string" || !capability.trim())) {
      throw new MachineRuntimeError("INVALID_COMPONENT", "Component capabilities must be non-empty strings.", { id });
    }
    if (typeof enabled !== "boolean") throw new MachineRuntimeError("INVALID_COMPONENT", "Component enabled must be Boolean.", { id });
    this.#capabilities = Object.freeze([...new Set(capabilities.map(capability => capability.trim()))]);
    this.#initialStatus = requiredText(initialStatus, "initialStatus");
    this.#status = this.#initialStatus;
    this.#initialEnabled = enabled;
    this.#enabled = enabled;
  }

  get id() { return this.#id; }
  get name() { return this.#name; }
  get type() { return this.#type; }
  get status() { return this.#status; }
  get enabled() { return this.#enabled; }
  get fault() { return immutableCopy(this.#fault); }
  get diagnostics() { return this.snapshot().diagnostics; }

  update({ status = this.#status, enabled = this.#enabled, fault = this.#fault, tick = null } = {}) {
    validateTick(tick);
    if (typeof enabled !== "boolean") throw new MachineRuntimeError("INVALID_COMPONENT_UPDATE", "Component enabled must be Boolean.", { id: this.#id });
    this.#previousStatus = this.#status;
    this.#status = requiredText(status, "status");
    this.#enabled = enabled;
    this.#fault = fault === null ? null : validateFault(fault);
    this.#updateCount += 1;
    this.#lastUpdate = immutableCopy({ tick, status: this.#status });
    return this.snapshot();
  }

  reset({ tick = 0 } = {}) {
    validateTick(tick);
    this.#previousStatus = null;
    this.#status = this.#initialStatus;
    this.#enabled = this.#initialEnabled;
    this.#fault = null;
    this.#updateCount = 0;
    this.#resetCount += 1;
    this.#lastUpdate = immutableCopy({ tick, status: this.#status });
    return this.snapshot();
  }

  snapshot() {
    return immutableCopy({
      id: this.#id,
      name: this.#name,
      type: this.#type,
      capabilities: this.#capabilities,
      status: this.#status,
      previousStatus: this.#previousStatus,
      enabled: this.#enabled,
      fault: this.#fault,
      diagnostics: {
        updateCount: this.#updateCount,
        resetCount: this.#resetCount,
        lastUpdate: this.#lastUpdate
      }
    });
  }
}

export function validateTick(tick) {
  if (!Number.isInteger(tick) || tick < 0) throw new MachineRuntimeError("INVALID_MACHINE_TICK", "Machine tick must be a non-negative integer.", { tick });
}

function validateFault(fault) {
  if (fault === null || typeof fault !== "object" || Array.isArray(fault)) throw new MachineRuntimeError("INVALID_COMPONENT_FAULT", "Component fault must be a plain object.");
  return immutableCopy({ type: requiredText(fault.type, "fault.type"), recoverable: fault.recoverable !== false });
}

function requiredText(value, field) {
  if (typeof value !== "string" || !value.trim()) throw new MachineRuntimeError("INVALID_COMPONENT", `${field} must be a non-empty string.`, { field });
  return value.trim();
}
