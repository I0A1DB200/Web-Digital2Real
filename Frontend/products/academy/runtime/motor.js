import { MachineComponent, MachineRuntimeError } from "./machineComponent.js";

export const MotorStatus = Object.freeze({
  Stopped: "Stopped",
  Running: "Running",
  Disabled: "Disabled",
  Faulted: "Faulted"
});

export class Motor extends MachineComponent {
  constructor({ id = "motor-01", name = "Conveyor Motor" } = {}) {
    super({ id, name, type: "Motor", capabilities: ["actuator", "motion"], initialStatus: MotorStatus.Stopped });
  }

  start({ tick } = {}) {
    if (this.fault) throw new MachineRuntimeError("MOTOR_FAULTED", `Motor ${this.id} cannot start while faulted.`, { id: this.id });
    if (!this.enabled) throw new MachineRuntimeError("MOTOR_DISABLED", `Motor ${this.id} cannot start while disabled.`, { id: this.id });
    return super.update({ status: MotorStatus.Running, tick });
  }

  stop({ tick } = {}) {
    return super.update({ status: this.enabled ? MotorStatus.Stopped : MotorStatus.Disabled, tick });
  }

  enable({ tick } = {}) {
    return super.update({ status: this.fault ? MotorStatus.Faulted : MotorStatus.Stopped, enabled: true, tick });
  }

  disable({ tick } = {}) {
    return super.update({ status: MotorStatus.Disabled, enabled: false, tick });
  }

  injectFault({ tick, type = "MotorFault" } = {}) {
    return super.update({ status: MotorStatus.Faulted, fault: { type, recoverable: true }, tick });
  }

  update({ runRequested = false, inhibited = false, tick } = {}) {
    if (typeof runRequested !== "boolean" || typeof inhibited !== "boolean") {
      throw new MachineRuntimeError("INVALID_MOTOR_COMMAND", "Motor commands must be Boolean.", { runRequested, inhibited });
    }
    if (this.fault) return super.update({ status: MotorStatus.Faulted, tick });
    if (inhibited || !this.enabled || !runRequested) return super.update({ status: this.enabled ? MotorStatus.Stopped : MotorStatus.Disabled, tick });
    return super.update({ status: MotorStatus.Running, tick });
  }
}
