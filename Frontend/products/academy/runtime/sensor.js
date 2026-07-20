import { MachineComponent, MachineRuntimeError } from "./machineComponent.js";

export class Sensor extends MachineComponent {
  #observe;
  #value;
  #defaultValue;
  #quality = "valid";

  constructor({ id, name, observe, defaultValue = false } = {}) {
    super({ id, name, type: "Sensor", capabilities: ["sensor"], initialStatus: "Ready" });
    if (typeof observe !== "function") throw new MachineRuntimeError("INVALID_SENSOR", "Sensor observe must be a function.", { id });
    this.#observe = observe;
    this.#defaultValue = defaultValue;
    this.#value = defaultValue;
  }

  update({ machineState, tick } = {}) {
    if (machineState === null || typeof machineState !== "object" || Array.isArray(machineState)) {
      throw new MachineRuntimeError("INVALID_SENSOR_STATE", "Sensor requires a committed Machine state.", { id: this.id });
    }
    const observed = this.#observe(machineState);
    if (typeof observed !== typeof this.#defaultValue) {
      throw new MachineRuntimeError("INVALID_SENSOR_VALUE", `Sensor ${this.id} produced an invalid value type.`, { id: this.id });
    }
    this.#value = observed;
    this.#quality = this.fault ? "invalid" : "valid";
    super.update({ status: "Updated", tick });
    return this.snapshot();
  }

  reset({ tick = 0 } = {}) {
    this.#value = this.#defaultValue;
    this.#quality = "valid";
    super.reset({ tick });
    return this.snapshot();
  }

  snapshot() {
    const component = super.snapshot();
    return Object.freeze({ ...component, value: this.#value, quality: this.#quality });
  }
}
