import assert from "node:assert/strict";
import test from "node:test";

import { SignalRegistry } from "../core/signalRegistry.js";
import { PLCExpressionOperation as E, PLCInstructionOperation as I, PLCMappingDirection as D, PLCMemoryArea as A } from "../runtime/plcConstants.js";
import { PLCRuntime } from "../runtime/plcRuntime.js";

const memorySchema = () => ({
  Input: [{ id: "I_A", defaultValue: false }, { id: "I_B", defaultValue: false }, { id: "I_STOP", defaultValue: false }, { id: "I_EMERGENCY", defaultValue: false }],
  Internal: [{ id: "M_STATE", defaultValue: false }],
  Output: [{ id: "Q_RESULT", defaultValue: false, safeValue: false }]
});
const ref = (area, address) => ({ operation: E.Read, area, address });
const instruction = (operation, target, expression, id = `write-${target}`) => ({ id, operation, target, expression });
const program = (...instructions) => [{ id: "program-main", order: 0, networks: [{ id: "network-main", order: 0, instructions }] }];
const passThroughProgram = () => program(
  instruction(I.WriteInternal, "M_STATE", ref(A.Input, "I_A")),
  instruction(I.WriteOutput, "Q_RESULT", ref(A.Internal, "M_STATE"))
);
const initialize = (runtime, overrides = {}) => runtime.initialize({ memorySchema: memorySchema(), programs: passThroughProgram(), ...overrides });
const inputs = (overrides = {}) => ({ I_A: false, I_B: false, I_STOP: false, I_EMERGENCY: false, ...overrides });

function signalDefinition(overrides = {}) {
  return {
    id: "sig.plc.result", displayName: "Result", description: "PLC-owned Boolean result.", namespace: "PLC/Controller01/Outputs/Result",
    category: "Digital Output", dataType: "Boolean", owner: "PLC", source: "OutputImage", consumers: ["Machine"], accessMode: "Read Only",
    scope: "Lab attempt", persistenceMode: "Attempt", engineeringUnit: null, defaultValue: false, metadata: {}, initialQuality: "Simulated", ...overrides
  };
}

test("initializes separated immutable memory areas and lifecycle", () => {
  const plc = new PLCRuntime(); const snapshot = initialize(plc);
  assert.equal(snapshot.state, "Ready");
  assert.deepEqual(snapshot.memory.inputs, inputs());
  assert.deepEqual(snapshot.memory.internal, { M_STATE: false });
  assert.deepEqual(snapshot.memory.outputs, { Q_RESULT: false });
  assert.equal(Object.isFrozen(snapshot), true); assert.equal(Object.isFrozen(snapshot.memory), true);
});

test("validates lifecycle transitions and Reset returns to Ready", () => {
  const plc = new PLCRuntime();
  assert.throws(() => plc.start(), error => error.code === "InvalidLifecycleTransition");
  initialize(plc); plc.start(); assert.equal(plc.stop().state, "Stopped"); plc.start();
  const reset = plc.reset(); assert.equal(reset.state, "Ready"); assert.equal(reset.diagnostics.scanCount, 0); assert.equal(reset.diagnostics.resetCount, 1);
});

test("samples a stable Input image then commits Internal and Output images", () => {
  const plc = new PLCRuntime(); initialize(plc); plc.start();
  const source = inputs({ I_A: true }); const result = plc.scan({ tick: 1, timestamp: 20, inputSnapshot: source }); source.I_A = false;
  assert.equal(result.sampledInputs.I_A, true); assert.equal(result.internalMemory.M_STATE, true); assert.equal(result.outputs.Q_RESULT, true);
  assert.deepEqual(result.changedOutputs, ["Q_RESULT"]); assert.equal(plc.getSnapshot().memory.inputs.I_A, true);
});

test("supports AND, OR, NOT, normally-open and normally-closed expressions", () => {
  const expression = { operation: E.And, operands: [
    { operation: E.NormallyOpen, area: A.Input, address: "I_A" },
    { operation: E.Or, operands: [
      { operation: E.NormallyClosed, area: A.Input, address: "I_STOP" },
      { operation: E.Not, operand: ref(A.Input, "I_B") }
    ] }
  ] };
  const plc = new PLCRuntime(); plc.initialize({ memorySchema: memorySchema(), programs: program(instruction(I.WriteOutput, "Q_RESULT", expression)) }); plc.start();
  assert.equal(plc.scan({ tick: 1, timestamp: 20, inputSnapshot: inputs({ I_A: true, I_STOP: true, I_B: false }) }).outputs.Q_RESULT, true);
  assert.equal(plc.scan({ tick: 2, timestamp: 40, inputSnapshot: inputs({ I_A: false }) }).outputs.Q_RESULT, false);
});

test("Internal Memory enables seal-in behavior across scans", () => {
  const latch = { operation: E.Or, operands: [ref(A.Input, "I_A"), ref(A.Internal, "M_STATE")] };
  const plc = new PLCRuntime(); plc.initialize({ memorySchema: memorySchema(), programs: program(instruction(I.WriteInternal, "M_STATE", latch), instruction(I.WriteOutput, "Q_RESULT", ref(A.Internal, "M_STATE"))) }); plc.start();
  plc.scan({ tick: 1, timestamp: 20, inputSnapshot: inputs({ I_A: true }) });
  assert.equal(plc.scan({ tick: 2, timestamp: 40, inputSnapshot: inputs({ I_A: false }) }).outputs.Q_RESULT, true);
});

test("deterministic instruction order controls later writes", () => {
  const plc = new PLCRuntime(); plc.initialize({ memorySchema: memorySchema(), programs: program(
    instruction(I.WriteOutput, "Q_RESULT", { operation: E.Literal, value: true }, "first"),
    instruction(I.WriteOutput, "Q_RESULT", { operation: E.Literal, value: false }, "second")
  ) }); plc.start();
  assert.equal(plc.scan({ tick: 1, timestamp: 20, inputSnapshot: inputs() }).outputs.Q_RESULT, false);
});

test("Boolean expressions can represent Stop and Emergency priority generically", () => {
  const request = { operation: E.Or, operands: [ref(A.Input, "I_A"), ref(A.Internal, "M_STATE")] };
  const safe = { operation: E.And, operands: [request, { operation: E.Not, operand: ref(A.Input, "I_STOP") }, { operation: E.Not, operand: ref(A.Input, "I_EMERGENCY") }] };
  const plc = new PLCRuntime(); plc.initialize({ memorySchema: memorySchema(), programs: program(instruction(I.WriteInternal, "M_STATE", safe), instruction(I.WriteOutput, "Q_RESULT", ref(A.Internal, "M_STATE"))) }); plc.start();
  assert.equal(plc.scan({ tick: 1, timestamp: 20, inputSnapshot: inputs({ I_A: true, I_STOP: true }) }).outputs.Q_RESULT, false);
  assert.equal(plc.scan({ tick: 2, timestamp: 40, inputSnapshot: inputs({ I_A: true, I_EMERGENCY: true }) }).outputs.Q_RESULT, false);
});

test("rejects invalid Programs, Instructions and Memory references", () => {
  const invalidProgram = new PLCRuntime(); assert.throws(() => invalidProgram.initialize({ memorySchema: memorySchema(), programs: [] }), error => error.code === "InvalidProgram"); assert.equal(invalidProgram.getSnapshot().state, "Faulted");
  const invalidInstruction = new PLCRuntime(); assert.throws(() => invalidInstruction.initialize({ memorySchema: memorySchema(), programs: program({ id: "bad", operation: "Unknown", target: "Q_RESULT", expression: { operation: E.Literal, value: false } }) }), error => error.code === "InvalidInstruction");
  const invalidReference = new PLCRuntime(); assert.throws(() => invalidReference.initialize({ memorySchema: memorySchema(), programs: program(instruction(I.WriteOutput, "Q_UNKNOWN", { operation: E.Literal, value: false })) }), error => error.code === "InvalidMemoryReference");
});

test("validates mappings and respects Signal Registry ownership", () => {
  const registry = new SignalRegistry(); registry.register(signalDefinition());
  const mappings = [{ direction: D.PLCOutputToSignal, signalId: "sig.plc.result", memoryId: "Q_RESULT" }];
  const plc = new PLCRuntime(); initialize(plc, { mappings, signalRegistry: registry }); plc.start(); plc.scan({ tick: 1, timestamp: 20, inputSnapshot: inputs({ I_A: true }) });
  assert.equal(registry.getSignalValue("sig.plc.result"), true);

  const wrongOwner = new SignalRegistry(); wrongOwner.register(signalDefinition({ id: "sig.machine.result", namespace: "Machine/Test/Result", owner: "Machine" }));
  assert.throws(() => initialize(new PLCRuntime(), { mappings: [{ direction: D.PLCOutputToSignal, signalId: "sig.machine.result", memoryId: "Q_RESULT" }], signalRegistry: wrongOwner }), error => error.code === "InvalidOutputMapping");
  assert.throws(() => initialize(new PLCRuntime(), { mappings: [{ direction: "Unknown", signalId: "x", memoryId: "I_A" }] }), error => error.code === "InvalidInputMapping");
});

test("reads mapped Inputs through the approved Registry API", () => {
  const registry = new SignalRegistry();
  const sources = [
    ["sig.user.command_a", "User/Lab/CommandA", "I_A"],
    ["sig.user.command_b", "User/Lab/CommandB", "I_B"],
    ["sig.user.stop", "User/Lab/Stop", "I_STOP"],
    ["sig.user.emergency", "User/Lab/Emergency", "I_EMERGENCY"]
  ];
  for (const [id, namespace] of sources) registry.register(signalDefinition({ id, namespace, category: "Internal", owner: "User", source: "Learner", consumers: ["PLC"], accessMode: "Read Write" }));
  registry.updateSignal("sig.user.command_a", { value: true, writer: "User", timestamp: 10 });
  const mappings = sources.map(([signalId, , memoryId]) => ({ direction: D.SignalToPLCInput, signalId, memoryId }));
  const plc = new PLCRuntime(); initialize(plc, { mappings, signalRegistry: registry }); plc.start();
  const result = plc.scan({ tick: 1, timestamp: 20 });
  assert.equal(result.sampledInputs.I_A, true);
});

test("Signal read and write failures fault execution predictably", () => {
  const readFailure = new PLCRuntime(); initialize(readFailure, { mappings: [
    { direction: D.SignalToPLCInput, signalId: "a", memoryId: "I_A" }, { direction: D.SignalToPLCInput, signalId: "b", memoryId: "I_B", defaultValue: false },
    { direction: D.SignalToPLCInput, signalId: "s", memoryId: "I_STOP", defaultValue: false }, { direction: D.SignalToPLCInput, signalId: "e", memoryId: "I_EMERGENCY", defaultValue: false }
  ] }); readFailure.start(); assert.throws(() => readFailure.scan({ tick: 1, timestamp: 20 }), error => error.code === "SignalReadFailure"); assert.equal(readFailure.getSnapshot().state, "Faulted");

  const failingRegistry = { has: () => true, getSignalDefinition: () => ({ dataType: "Boolean", owner: "PLC" }), updateSignal: () => { throw new Error("write failed"); } };
  const writeFailure = new PLCRuntime(); initialize(writeFailure, { mappings: [{ direction: D.PLCOutputToSignal, signalId: "sig.plc.out", memoryId: "Q_RESULT" }], signalRegistry: failingRegistry }); writeFailure.start();
  assert.throws(() => writeFailure.scan({ tick: 1, timestamp: 20, inputSnapshot: inputs({ I_A: true }) }), error => error.code === "SignalWriteFailure"); assert.equal(writeFailure.getSnapshot().state, "Faulted");
});

test("publishes Outputs only after execution and emits ordered immutable events", () => {
  const registry = new SignalRegistry(); registry.register(signalDefinition()); const observed = [];
  const plc = new PLCRuntime(); plc.subscribe(() => { throw new Error("observer failed"); }); plc.subscribe(event => observed.push(event));
  initialize(plc, { mappings: [{ direction: D.PLCOutputToSignal, signalId: "sig.plc.result", memoryId: "Q_RESULT" }], signalRegistry: registry }); plc.start(); plc.scan({ tick: 1, timestamp: 20, inputSnapshot: inputs({ I_A: true }) });
  assert.deepEqual(observed.filter(event => ["PLCScanStarted", "PLCOutputChanged", "PLCScanCompleted"].includes(event.type)).map(event => event.type), ["PLCScanStarted", "PLCOutputChanged", "PLCScanCompleted"]);
  assert.equal(Object.isFrozen(observed[0]), true); assert.equal(plc.getDiagnostics().subscriberErrorCount, observed.length);
});

test("snapshots and diagnostics are immutable and Reset preserves configuration", () => {
  const plc = new PLCRuntime(); initialize(plc); plc.start(); plc.scan({ tick: 1, timestamp: 20, inputSnapshot: inputs({ I_A: true }) });
  const snapshot = plc.getSnapshot(); assert.equal(Object.isFrozen(snapshot), true); assert.equal(Object.isFrozen(snapshot.diagnostics), true); assert.throws(() => { snapshot.memory.outputs.Q_RESULT = false; }, TypeError);
  const reset = plc.reset(); assert.equal(reset.state, "Ready"); assert.equal(reset.memory.outputs.Q_RESULT, false); assert.equal(reset.programs.length, 1); assert.equal(reset.diagnostics.scanCount, 0);
});

test("identical PLC executions produce identical Results, Events and Diagnostics", () => {
  const execute = () => { const events = []; const plc = new PLCRuntime(); plc.subscribe(event => events.push(event)); initialize(plc); plc.start(); plc.scan({ tick: 1, timestamp: 20, inputSnapshot: inputs({ I_A: true }) }); plc.scan({ tick: 2, timestamp: 40, inputSnapshot: inputs({ I_A: false }) }); return { snapshot: plc.getSnapshot(), events }; };
  assert.deepEqual(execute(), execute());
});
