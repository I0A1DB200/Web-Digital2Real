import { immutableCopy } from "../../core/signalDefinition.js";
import { PLCExpressionOperation as E, PLCInstructionOperation as I, PLCMappingDirection as D, PLCMemoryArea as A } from "../../runtime/plcConstants.js";
import { ValidationRuleType as V } from "../../validation/validationRules.js";

const signal = ({ id, namespace, displayName, description, owner, category, source, consumers, defaultValue = false }) => ({
  id, namespace, displayName, description, category, dataType: "Boolean", owner, source, consumers,
  accessMode: owner === "User" ? "Read Write" : "Read Only", scope: "Lab attempt", persistenceMode: "Attempt",
  engineeringUnit: null, defaultValue, metadata: { labId: "lab-001" }, initialQuality: "Simulated"
});

const evidence = [
  ["started", "Start activates the conveyor"],
  ["held_after_release", "Conveyor remains active after Start release"],
  ["stopped", "Stop deactivates the conveyor"],
  ["stop_priority", "Stop overrides simultaneous Start"],
  ["emergency_priority", "Emergency overrides normal operation"],
  ["reset_cleared", "Reset clears the recoverable emergency"],
  ["reset_no_restart", "Reset does not automatically restart"],
  ["restarted_after_new_start", "A new Start is required after Reset"]
];

const input = address => ({ operation: E.Read, area: A.Input, address });
const memory = address => ({ operation: E.Read, area: A.Internal, address });

export const lab001Definition = immutableCopy({
  id: "lab-001",
  slug: "start-stop-conveyor",
  title: "Start / Stop Conveyor",
  shortDescription: "A headless industrial Start/Stop control laboratory using deterministic PLC and Machine runtimes.",
  learningObjective: "Verify seal-in operation, command priority, emergency behavior and safe reset of a conventional Start/Stop circuit.",
  difficulty: "Beginner",
  estimatedDuration: "10 minutes",
  version: "1.0.0",
  metadata: { language: "en", status: "MVP", randomness: false, fixedStep: 20, specification: "SPEC-001" },
  initialState: { lifecycle: "Ready", conveyor: "Stopped", motorCommand: false, emergency: false, validation: "InProgress" },
  signalDefinitions: [
    signal({ id: "sig.user.lab001.start", namespace: "User/Lab001/Commands/Start", displayName: "Start", description: "Momentary learner Start request.", owner: "User", category: "Internal", source: "Learner", consumers: ["PLC", "Academy"] }),
    signal({ id: "sig.user.lab001.stop", namespace: "User/Lab001/Commands/Stop", displayName: "Stop", description: "Momentary learner Stop request.", owner: "User", category: "Internal", source: "Learner", consumers: ["PLC", "Academy"] }),
    signal({ id: "sig.user.lab001.emergency", namespace: "User/Lab001/Commands/Emergency", displayName: "Emergency Stop", description: "Learner request to engage the modeled Emergency Stop.", owner: "User", category: "Internal", source: "Learner", consumers: ["Machine", "Academy"] }),
    signal({ id: "sig.user.lab001.reset", namespace: "User/Lab001/Commands/Reset", displayName: "Reset", description: "Momentary learner Reset request.", owner: "User", category: "Internal", source: "Learner", consumers: ["PLC", "Machine", "Academy"] }),
    signal({ id: "sig.plc.lab001.motor_command", namespace: "PLC/Lab001/Outputs/MotorCommand", displayName: "Motor Command", description: "PLC-owned request for Conveyor Motor operation.", owner: "PLC", category: "Digital Output", source: "OutputImage", consumers: ["Machine", "Validation"] }),
    signal({ id: "sig.machine.lab001.motor_running", namespace: "Machine/Lab001/Sensors/MotorRunning", displayName: "Motor Running", description: "Committed physical Motor running feedback.", owner: "Machine", category: "Digital Input", source: "RunningFeedback", consumers: ["PLC", "Validation", "Academy"] }),
    signal({ id: "sig.machine.lab001.conveyor_running", namespace: "Machine/Lab001/State/ConveyorRunning", displayName: "Conveyor Running", description: "Committed Conveyor running observation.", owner: "Machine", category: "Digital Input", source: "Conveyor", consumers: ["Validation", "Academy"] }),
    signal({ id: "sig.machine.lab001.conveyor_stopped", namespace: "Machine/Lab001/Sensors/ConveyorStopped", displayName: "Conveyor Stopped", description: "Committed Conveyor stopped feedback.", owner: "Machine", category: "Digital Input", source: "StoppedFeedback", consumers: ["Validation", "Academy"], defaultValue: true }),
    signal({ id: "sig.machine.lab001.fault", namespace: "Machine/Lab001/Sensors/Fault", displayName: "Machine Fault", description: "Committed Machine fault feedback.", owner: "Machine", category: "Diagnostic", source: "FaultFeedback", consumers: ["Validation", "Academy"] }),
    signal({ id: "sig.machine.lab001.emergency", namespace: "Machine/Lab001/Sensors/Emergency", displayName: "Emergency Active", description: "Committed Machine Emergency feedback sampled by the PLC on the next scan.", owner: "Machine", category: "Digital Input", source: "EmergencyFeedback", consumers: ["PLC", "Validation", "Academy"] }),
    ...evidence.map(([key, title]) => signal({ id: `sig.academy.lab001.evidence_${key}`, namespace: `Academy/Lab001/Evidence/${key}`, displayName: title, description: `Ordered Lab 001 evidence: ${title}.`, owner: "Academy", category: "Validation", source: "Lab001Session", consumers: ["Validation"] }))
  ],
  plc: {
    memorySchema: {
      Input: ["I_START", "I_STOP", "I_EMERGENCY", "I_RESET"].map(id => ({ id, defaultValue: false })),
      Internal: [{ id: "M_RUN", defaultValue: false }],
      Output: [{ id: "Q_MOTOR", defaultValue: false, safeValue: false }]
    },
    mappings: [
      { direction: D.SignalToPLCInput, signalId: "sig.user.lab001.start", memoryId: "I_START" },
      { direction: D.SignalToPLCInput, signalId: "sig.user.lab001.stop", memoryId: "I_STOP" },
      { direction: D.SignalToPLCInput, signalId: "sig.machine.lab001.emergency", memoryId: "I_EMERGENCY" },
      { direction: D.SignalToPLCInput, signalId: "sig.user.lab001.reset", memoryId: "I_RESET" },
      { direction: D.PLCOutputToSignal, signalId: "sig.plc.lab001.motor_command", memoryId: "Q_MOTOR" }
    ],
    programs: [{
      id: "program-start-stop", order: 0, networks: [{ id: "network-run-control", order: 0, instructions: [
        { id: "write-run-memory", operation: I.WriteInternal, target: "M_RUN", expression: { operation: E.And, operands: [
          { operation: E.Or, operands: [input("I_START"), memory("M_RUN")] },
          { operation: E.Not, operand: input("I_STOP") },
          { operation: E.Not, operand: input("I_EMERGENCY") },
          { operation: E.Not, operand: input("I_RESET") }
        ] } },
        { id: "write-motor-output", operation: I.WriteOutput, target: "Q_MOTOR", expression: memory("M_RUN") }
      ] }]
    }]
  },
  machine: { id: "machine-conveyor-01", type: "Conveyor", components: ["Conveyor", "Motor", "RunningFeedback", "StoppedFeedback", "FaultFeedback", "EmergencyFeedback"], physics: "Discrete" },
  validationRules: evidence.map(([key, title]) => ({ id: `rule-${key}`, name: title, description: title, enabled: true, severity: key.includes("emergency") ? "Safety" : "Error", type: V.SignalTrue, condition: { signalId: `sig.academy.lab001.evidence_${key}` } })),
  completionCriteria: evidence.map(([key]) => `rule-${key}`),
  resetPolicy: { commands: false, plcMemory: "defaults", machine: "stopped", recoverableFaults: "clear", validation: "restart", automaticRestart: false }
});
