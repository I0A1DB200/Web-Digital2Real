# SPEC-002 — Digital2Real PLC Runtime Model

**Status:** Draft functional specification
**Specification owner:** Digital2Real Academy
**Scope:** Canonical virtual PLC execution semantics
**Implementation status:** Not implemented

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** express requirement strength within this specification.

---

# 1. Purpose

The Digital2Real PLC Runtime is the canonical execution model for virtual programmable control within Academy Labs. It defines how controller state is initialized, how Inputs are sampled, how Programs are evaluated, when Outputs become visible, how time-dependent elements advance, and how Diagnostics report runtime behavior.

The runtime exists so that every Lab can rely on one consistent control model. A learner, validator, Digital Twin, or future physical adapter must be able to reason about the same sequence of events and the same state-transition rules.

This specification defines behavior, not implementation. It does not select a programming language, storage format, framework, instruction editor, simulator, device, operating system, or execution platform.

## 1.1 Why a runtime engine exists

A canonical runtime is required to:

- execute abstract PLC Programs consistently across Academy Labs;
- isolate control semantics from Machine and presentation concerns;
- provide a stable contract for Inputs, Outputs, Memory, time, faults, and Diagnostics;
- support repeatable Validation;
- make controller state observable for learning and investigation;
- allow future execution environments to change without changing PLC meaning;
- avoid embedding control behavior separately in each Lab or UI.

## 1.2 Why the runtime must be deterministic

For the same runtime version, configuration, initial state, ordered Input samples, event sequence, and time progression, execution MUST produce the same ordered state changes, Outputs, Diagnostics, and faults.

Determinism is necessary because:

- learners need reproducible outcomes;
- Validation must distinguish solution behavior from platform variability;
- failures must be replayable;
- scoring must compare equivalent attempts;
- timing rules must have consistent boundaries;
- future integrations need a stable behavioral contract.

Determinism does not require every Lab to have fixed Inputs. Randomized or external Inputs are permitted only when their complete ordered values and timing are part of the execution record. Controlled randomness MUST use a recorded reproducible source.

## 1.3 Why the runtime must be independent from UI

The runtime MUST execute without a visual interface. UI actions may submit commands or observe snapshots through an external boundary, but they MUST NOT determine scan ordering, instruction semantics, timer progression, or fault behavior.

UI independence ensures that:

- headless Validation is possible;
- visual frame rate cannot alter control results;
- multiple interfaces can use the same runtime;
- runtime behavior can be replayed and tested;
- accessibility or presentation changes do not change control semantics.

## 1.4 Relationship to SPEC-001

SPEC-001 defines the PLC abstraction, Variables, Challenge, and Validation needs of a Lab. SPEC-002 defines the virtual controller execution semantics used when that PLC abstraction is executed.

SPEC-002 does not redefine Machine behavior, learner Progress, resource delivery, or Lab authoring.

---

# 2. Runtime Architecture

The logical runtime flow is:

```text
PLC Runtime
    ↓
Memory
    ↓
Program
    ↓
Execution
    ↓
Outputs
    ↓
Diagnostics
```

The flow expresses primary responsibility, not separate deployment services.

## 2.1 PLC Runtime

The PLC Runtime owns the controller lifecycle and scan-cycle state machine. It coordinates initialization, commands, Input acquisition, Program scheduling, Memory updates, Output publication, time progression, fault handling, Diagnostics, and shutdown.

The runtime MUST expose an observable lifecycle state. The minimum lifecycle states are:

- `uninitialized`;
- `stopped`;
- `starting`;
- `running`;
- `faulted`.

An execution environment MAY add states, but MUST preserve the meaning of these canonical states.

The runtime MUST NOT own Machine physics, learner Progress, UI state, editorial content, or network transport.

## 2.2 Memory

Memory is the authoritative controller state available to Program evaluation. It is divided into areas with distinct ownership, lifetime, and publication rules.

Memory provides:

- a stable Input image for one scan;
- a working Output image that is not externally visible until publication;
- persistent controller state across scans;
- time and count state;
- temporary evaluation state;
- immutable Constants;
- read-only or runtime-owned System Variables.

Program evaluation MUST access Memory through defined semantics rather than directly observing changing external Inputs.

## 2.3 Program

A Program is an ordered, named control unit evaluated by the runtime. A runtime MAY contain multiple Programs. Program order MUST be explicit and stable.

Programs contain ordered Networks. Networks contain ordered Instructions and Expressions. Programs read the scan’s Memory snapshot and produce defined state updates.

## 2.4 Execution

Execution evaluates Programs using the canonical rules in this specification. It owns evaluation order, operation semantics, intermediate Results, fault propagation, and commit boundaries.

Execution MUST NOT publish Outputs directly to the external environment. It writes the Output image; publication occurs in the Output Update phase.

## 2.5 Outputs

Outputs are controller commands made visible to the Machine or external environment after Program Execution completes successfully according to the runtime fault policy.

Outputs MUST be published as one ordered scan-boundary operation. External consumers MUST NOT observe partially evaluated Output state from the current scan.

## 2.6 Diagnostics

Diagnostics records the lifecycle, execution health, timing, cycle count, warnings, errors, faults, and performance observations of the runtime.

Diagnostics MUST observe runtime behavior without changing Program Results. Diagnostic recording failure MUST be distinguishable from a Program fault.

## 2.7 External boundaries

The runtime has three conceptual external boundaries:

1. **Input provider:** supplies the ordered external Input sample for a scan.
2. **Output consumer:** receives the published Output image.
3. **Runtime observer:** receives Diagnostics, events, and snapshots.

One environment may fulfill all three roles, but the roles remain logically separate.

---

# 3. Memory Model

Memory is partitioned by responsibility. Every memory item MUST have one authoritative owner, a defined value type, an initial value, and a lifetime.

```text
Controller Memory
├── Inputs
├── Outputs
├── Internal Memory
├── Timers
├── Counters
├── Temporary Variables
├── Retentive Variables
├── Constants
└── System Variables
```

## 3.1 Common memory properties

Every memory item SHOULD define:

- stable identifier;
- logical value type;
- initial value;
- current value;
- read authority;
- write authority;
- lifetime and reset behavior;
- optional unit, valid range, or allowed values;
- optional quality state;
- diagnostic visibility.

Memory identifiers MUST be unique within their declared scope. Display labels are not identifiers.

## 3.2 Inputs

Inputs represent values acquired from the external environment. The runtime owns the scan Input image; the external Input provider owns the source values.

At Input Update, the runtime MUST copy one complete ordered Input sample into the Input image. Programs MUST read the Input image, not live external values.

Inputs are read-only to Programs. A Program attempt to write an Input MUST raise a defined execution error.

Each Input SHOULD include a quality state. Invalid Input quality behavior MUST be defined by the Lab or runtime profile and MUST NOT be silently treated as a normal value.

## 3.3 Outputs

Outputs represent controller commands to the external environment.

The runtime owns two conceptual Output states:

- **Output image:** working values used and updated during Program Execution;
- **published Outputs:** the complete values visible outside the controller after Output Update.

Programs MAY read and write the Output image according to Program semantics. The external environment MUST only observe published Outputs.

Every Output MUST define an initial value and a safe value. Fault behavior MUST state whether the current image is published, the prior published image is retained, or safe values are published.

## 3.4 Internal Memory

Internal Memory stores controller-owned state across scans. It includes sequence states, interlocks, latches, intermediate persistent calculations, and controller decisions not represented by a more specific area.

Internal Memory is non-retentive unless explicitly declared retentive. On a cold initialization it MUST return to its defined initial value.

Programs may read and write Internal Memory within their declared authority.

## 3.5 Timers

Timer Memory stores the state of canonical time-dependent elements. Each Timer instance owns its Preset, Elapsed Time, Running state, Done state, Input history required by its type, and Reset state.

Timer state persists across scans while the runtime remains initialized. Retention across runtime restart MUST be explicit and is not the default.

## 3.6 Counters

Counter Memory stores event accumulation. Each Counter instance owns its Preset, Current Value, Done state, direction-specific edge history, and Reset state.

Counter state persists across scans while initialized. Retention across restart MUST be explicit.

## 3.7 Temporary Variables

Temporary Variables exist only within a declared evaluation scope. Their owner is the executing Program, Network, Function, or Custom Block instance.

Temporary Variables MUST be initialized before use. They MUST NOT retain values across scope exit or scan boundaries. Reading an uninitialized Temporary Variable MUST produce a defined error.

## 3.8 Retentive Variables

Retentive Variables preserve controller state across an approved runtime restart or reset class. Each Retentive Variable MUST declare:

- initial factory value;
- retention boundary;
- reset classes that preserve it;
- reset classes that clear it;
- write authority.

Retention MUST be deterministic. The retained snapshot used to start an execution MUST be part of the execution record.

## 3.9 Constants

Constants are immutable named values. They MAY be read by Programs but MUST NOT be modified after runtime initialization.

An attempt to write a Constant MUST raise a defined execution error. Constants SHOULD be resolved before or during initialization so their values do not depend on scan order.

## 3.10 System Variables

System Variables expose runtime-owned facts such as lifecycle status, logical scan time, cycle count, previous cycle duration, and active fault state.

Programs MAY read approved System Variables. Programs MUST NOT write runtime-owned System Variables.

System Variables used by a Program MUST be sampled or updated at defined scan boundaries. A Program MUST NOT observe an ambiguous partially updated diagnostic state.

## 3.11 Ownership summary

| Memory area | Authoritative writer | Typical readers | Default lifetime |
|---|---|---|---|
| Inputs | Runtime during Input Update | Programs, Diagnostics | One scan image |
| Output image | Programs during execution | Programs, runtime | Across scans while initialized |
| Published Outputs | Runtime during Output Update | External environment, Diagnostics | Until next publication |
| Internal Memory | Authorized Programs | Programs, Diagnostics | Across scans while initialized |
| Timers | Timer semantics | Programs, Diagnostics | Across scans while initialized |
| Counters | Counter semantics | Programs, Diagnostics | Across scans while initialized |
| Temporary Variables | Owning execution scope | Owning scope | Scope only |
| Retentive Variables | Authorized Programs | Programs, Diagnostics | Declared restart boundary |
| Constants | Configuration at initialization | Programs | Runtime definition lifetime |
| System Variables | Runtime | Programs, Diagnostics | Runtime-owned |

## 3.12 Memory consistency

The runtime MUST define a single, deterministic order for writes to the same item. Conflicting writes that are permitted follow Program, Network, and Instruction order; the last successfully evaluated authorized write becomes the scan value.

A runtime profile MAY prohibit multiple writers. If prohibited, the conflict MUST be detected before execution or raised as a fault. It MUST NOT produce nondeterministic arbitration.

---

# 4. Scan Cycle

The canonical scan is:

```text
Input Update
    ↓
Program Execution
    ↓
Output Update
    ↓
Diagnostics
    ↓
Next Scan
```

One completed pass through all phases is one scan cycle.

## 4.1 Scan preconditions

A scan MAY begin only when:

- the runtime is initialized;
- lifecycle status permits execution;
- Program definitions and Memory schema are valid;
- no blocking configuration fault exists;
- a complete Input sample and deterministic time increment are available.

## 4.2 Input Update

During Input Update, the runtime MUST:

1. obtain one complete Input sample from the Input provider;
2. assign a logical sample time and ordering identity;
3. validate Input identifiers, value types, ranges when enforced, and quality;
4. copy accepted values into the Input image;
5. preserve the prior Input image for edge semantics where required;
6. record any Input warning or fault.

Programs do not execute during this phase. External Input changes after sampling are deferred until a later scan.

If the Input sample is incomplete or invalid, the runtime MUST follow an explicit policy: reject the scan, substitute defined fallback values, or mark Inputs invalid. The selected behavior MUST be recorded and deterministic.

## 4.3 Program Execution

During Program Execution, the runtime MUST:

1. establish the scan’s logical time and evaluation context;
2. evaluate enabled Programs in explicit order;
3. evaluate each Program’s Networks in explicit order;
4. evaluate Instructions and Expressions according to their semantics;
5. update authorized Memory areas and the Output image;
6. advance Timers and Counters using the scan’s defined time and edge history;
7. collect warnings, errors, faults, and traceable Results;
8. stop, continue, or isolate execution according to the configured fault policy.

The Input image MUST remain stable throughout Program Execution.

## 4.4 Output Update

During Output Update, the runtime MUST publish one complete Output image according to the scan outcome.

If Program Execution completed normally, the final Output image becomes the published Output set.

If Program Execution raised a blocking fault, the runtime MUST use one predefined policy:

- publish configured safe values;
- retain the last successfully published Outputs;
- publish a defined fault image.

The policy MUST be part of the runtime configuration or Lab execution profile. An implementation MUST NOT choose differently between equivalent executions.

## 4.5 Diagnostics

During the Diagnostics phase, the runtime MUST finalize:

- lifecycle status;
- cycle count;
- logical scan time;
- execution duration measurement when available;
- warnings, errors, and faults;
- performance observations;
- scan completion event;
- optional state-change events and trace data.

Diagnostic observations from the just-completed scan become externally visible only after they are finalized.

## 4.6 Next Scan

After Diagnostics, the runtime determines whether to:

- begin the next scan;
- remain paused or stopped;
- process an accepted Reset command;
- transition to `faulted`;
- terminate the execution session.

Commands received during a scan MUST be queued and applied only at their defined boundary. A command MUST NOT interrupt Program order unless a future interrupt model explicitly permits it.

## 4.7 Logical time

The canonical runtime MUST distinguish:

- **logical time:** deterministic time used by Programs, Timers, Validation, and replay;
- **execution duration:** observed host time used for performance Diagnostics.

Logical time advances only by the scan increment supplied or scheduled for the execution. Host scheduling delay MUST NOT change logical timer outcomes.

## 4.8 Cycle identity

Every attempted scan SHOULD have a monotonically increasing cycle identity. A cycle that begins but fails before normal completion MUST remain identifiable in Diagnostics.

The policy for whether the public completed-cycle count includes failed cycles MUST be explicit. This specification recommends separate attempted and completed cycle counts.

---

# 5. Program Model

The canonical abstraction is:

```text
Program
    ↓
Networks
    ↓
Instructions
    ↓
Expressions
    ↓
Result
```

This hierarchy describes execution meaning. It does not prescribe a visual or textual authoring language.

## 5.1 Multiple Programs

The runtime MUST support one or more Programs. Each Program MUST define:

- stable identifier;
- responsibility;
- enabled state or enable condition;
- execution order;
- declared Inputs, Outputs, and Memory access;
- Networks;
- optional parameters and Results;
- fault isolation policy when supported.

Program order MUST be total and deterministic. Duplicate or ambiguous order values MUST be rejected or resolved by a canonical secondary key defined before execution.

## 5.2 Program enablement

Program enablement MUST be evaluated at a defined point before that Program begins. An enabled Program executes once per scan unless a future task model states otherwise.

Changing an enable condition during an earlier Program may affect a later Program in the same scan when the condition reads current Internal Memory. This behavior must remain ordered and deterministic.

## 5.3 Networks

A Network is an ordered execution group within a Program. It MAY represent one logical decision, calculation, state transition, or block invocation.

Each Network SHOULD define:

- stable identifier;
- execution order;
- optional enable condition;
- ordered Instructions;
- optional Result;
- optional diagnostic label.

Networks execute sequentially. A later Network observes committed Memory writes made by earlier Networks in the same scan unless an Instruction explicitly defines deferred behavior.

## 5.4 Instructions

An Instruction performs one defined operation. It reads operands, evaluates its semantics, produces a Result, and MAY write authorized Memory.

Instruction order within a Network MUST be explicit. Side effects MUST occur at a defined point in Instruction evaluation.

## 5.5 Expressions

An Expression computes a value without independent lifecycle behavior. Expressions MAY combine literals, Constants, Variable references, operators, and pure Function Results.

Expression evaluation order MUST be defined. This specification requires deterministic left-to-right operand evaluation unless an operation explicitly declares another canonical order.

An Expression MUST NOT silently mutate Memory.

## 5.6 Result

A Result is the typed outcome of an Expression, Instruction, Network, Program, Function, or Custom Block call.

A Result MAY include:

- value;
- value type;
- quality or validity;
- status;
- warning or error reference;
- optional diagnostic evidence.

Invalid Results MUST propagate according to defined operation rules. They MUST NOT be silently converted into arbitrary normal values.

## 5.7 Functions and Custom Blocks

A Function computes a Result from declared parameters without retaining hidden state. Given the same parameter values and execution context, a Function MUST return the same Result.

A Custom Block MAY retain instance state. Every invocation MUST identify its instance. State MUST NOT be shared between instances unless explicitly declared through a separate shared Memory reference.

Recursive execution is not required by the canonical model. If introduced later, depth and fault behavior MUST be deterministic.

---

# 6. Instruction Model

The runtime instruction model defines categories and observable semantics. It does not define authoring syntax or a vendor instruction set.

Every Instruction MUST declare:

- category and operation;
- operand count and types;
- Result type;
- Memory read and write effects;
- enable behavior where applicable;
- invalid-input behavior;
- overflow, underflow, and division behavior where applicable;
- warning, error, and fault behavior;
- deterministic evaluation order.

## 6.1 Logic

Logic Instructions evaluate boolean relationships such as conjunction, disjunction, exclusive disjunction, and negation.

Boolean operations MUST define how invalid quality propagates. Short-circuit behavior, if supported, MUST be canonical and observable only through Result and permitted side effects.

## 6.2 Arithmetic

Arithmetic Instructions perform addition, subtraction, multiplication, division, remainder, negation, and related numeric operations.

Numeric precision, rounding, overflow, underflow, division by zero, and mixed-type promotion MUST be defined by a future canonical data-type specification before executable conformance is claimed.

## 6.3 Comparison

Comparison Instructions evaluate equality, inequality, ordering, range, and limit relationships.

Comparisons MUST define type compatibility, numeric tolerance where applicable, and invalid-value behavior. Approximate equality MUST require an explicit tolerance.

## 6.4 Timers

Timer Instructions evaluate canonical TON, TOF, and TP instances using logical time. They read enable and Reset conditions and update Timer Memory according to Section 7.

## 6.5 Counters

Counter Instructions evaluate CTU, CTD, and CTUD instances using edge-qualified count signals and update Counter Memory according to Section 8.

## 6.6 Move

Move Instructions copy a source Result into an authorized destination without changing the source.

The source and destination types MUST be compatible. A Move MUST NOT imply conversion unless the canonical type model explicitly defines a safe identity-preserving conversion.

## 6.7 Conversion

Conversion Instructions transform a value from one declared type or unit representation to another.

Conversions MUST define range, precision, rounding, invalid-input, and failure behavior. Lossy conversion SHOULD require explicit author intent.

## 6.8 Edge Detection

Edge Detection identifies transitions between the previous sampled boolean state and the current evaluated state.

The runtime MUST support:

- rising edge: false to true;
- falling edge: true to false.

Each Edge Detection instance MUST own previous-state Memory. The previous state updates exactly once at the defined evaluation point. Reusing one edge instance in multiple locations is prohibited unless evaluation semantics are explicitly defined.

Initial previous state MUST be declared. It MUST NOT depend on uninitialized Memory.

## 6.9 Bit Manipulation

Bit Manipulation Instructions operate on individual bits or bit groups through masking, setting, clearing, toggling, shifting, and rotation.

Bit width, index bounds, signedness, shift fill, and out-of-range behavior MUST be explicit.

## 6.10 Math

Math Instructions provide domain-independent mathematical operations beyond basic arithmetic, such as absolute value, minimum, maximum, limiting, scaling, powers, roots, and approved transcendental operations.

Precision, domain limits, and invalid Results MUST be defined. Equivalent executions MUST use equivalent numeric semantics.

## 6.11 Functions

Function Instructions call stateless, deterministic Functions with declared parameters and Result types.

Functions MUST NOT access undeclared Memory or external state. Any context dependency, such as logical time, MUST be an explicit parameter or declared execution input.

## 6.12 Custom Blocks

Custom Blocks encapsulate reusable behavior and MAY hold instance Memory. Each block MUST define:

- interface parameters;
- instance identity;
- retained and non-retained state;
- evaluation semantics;
- initialization and Reset behavior;
- fault behavior;
- version.

Custom Blocks MUST NOT alter runtime lifecycle, scan order, or external Inputs outside their declared interface.

## 6.13 Unsupported Instructions

An unknown or unsupported Instruction MUST be rejected before execution or raise a deterministic blocking fault. It MUST NOT be ignored.

---

# 7. Timers

Timers use logical time. Host clock speed, rendering frame rate, and execution duration MUST NOT directly determine Timer behavior.

Every Timer instance includes:

- type: TON, TOF, or TP;
- enable or trigger Input;
- Reset Input where applicable;
- Preset;
- Elapsed Time;
- Running state;
- Done state;
- previous Input state when required;
- initialized state.

## 7.1 Common timing rules

- Preset and Elapsed Time MUST use an explicit unit or canonical time base.
- Preset MUST be non-negative.
- Elapsed Time MUST remain within defined bounds.
- Timer state updates at the Timer Instruction’s position in Program order.
- A Timer receives the scan’s logical time increment according to its semantics.
- Re-evaluating the same Timer instance more than once in a scan is prohibited unless a future specification defines canonical behavior.
- Reset has priority over normal Timer evaluation.
- Initialization and Reset MUST define all Timer fields, including prior Input state.

## 7.2 TON — On-delay Timer

TON delays the Done state after its Input becomes true.

Canonical behavior:

1. When Reset is active, Elapsed Time becomes zero, Running becomes false, and Done becomes false.
2. When Input is false, Elapsed Time becomes zero, Running becomes false, and Done becomes false.
3. When Input is true and Elapsed Time is less than Preset, Running is true and Elapsed Time advances by the applicable logical scan increment.
4. When Elapsed Time reaches or exceeds Preset, Elapsed Time is clamped to Preset, Running becomes false, and Done becomes true.
5. When Preset is zero and Input is true, Done becomes true on that evaluation.

TON is non-retentive with respect to a false Input. A separate retentive timer type is not defined by SPEC-002.

## 7.3 TOF — Off-delay Timer

TOF delays clearing Done after its Input becomes false.

Canonical behavior:

1. When Reset is active, Elapsed Time becomes zero, Running becomes false, and Done becomes false.
2. When Input is true, Elapsed Time becomes zero, Running becomes false, and Done becomes true.
3. When Input transitions or remains false while Done is true and Elapsed Time is less than Preset, Running is true and Elapsed Time advances.
4. When Elapsed Time reaches or exceeds Preset, Elapsed Time is clamped to Preset, Running becomes false, and Done becomes false.
5. When Input is false while Done is already false, the Timer remains not Running and Done remains false.
6. When Preset is zero and Input becomes false, Done becomes false on that evaluation.

## 7.4 TP — Pulse Timer

TP produces a fixed-duration Done pulse after a rising edge at its Input.

Canonical behavior:

1. When Reset is active, Elapsed Time becomes zero, Running becomes false, and Done becomes false.
2. A rising Input edge while not Running starts the pulse: Elapsed Time becomes zero, Running becomes true, and Done becomes true.
3. While Running, Elapsed Time advances regardless of subsequent Input changes.
4. Additional rising edges while Running do not restart or extend the pulse.
5. When Elapsed Time reaches or exceeds Preset, Elapsed Time is clamped to Preset, Running becomes false, and Done becomes false.
6. When Preset is zero, a rising edge does not create a duration spanning a completed scan; an optional pulse event MAY be diagnosed, but Done evaluates false after completion.

The zero-Preset TP behavior is a conformance edge case and MUST be tested explicitly.

## 7.5 Elapsed Time

Elapsed Time represents accumulated logical duration for the current timing operation. It MUST NOT decrease except through initialization, Reset, or type-specific Input behavior.

Elapsed Time is clamped at Preset for the canonical Timer types. Negative elapsed values are invalid.

## 7.6 Preset

Preset defines the target duration. If Programs may modify Preset, the effect MUST occur according to normal Program order.

When Preset is reduced below current Elapsed Time, the Timer MUST apply the resulting Done transition during that evaluation and clamp Elapsed Time. When Preset increases, accumulated Elapsed Time is preserved unless Reset or type semantics clear it.

## 7.7 Running

Running is true only while the Timer is actively accumulating logical time toward Preset.

Running is a runtime-owned Timer state. Programs MUST NOT write it directly.

## 7.8 Done

Done is the canonical boolean Timer Result:

- TON: Input has remained true for Preset;
- TOF: Input is true or has been false for less than Preset;
- TP: the triggered pulse duration is active.

Programs MUST NOT write Done directly.

## 7.9 Reset

Reset immediately applies when evaluated and has priority over the normal Timer state transition for that evaluation. Reset behavior MUST be identical for equivalent Timer state and Inputs.

## 7.10 Timer time attribution

The runtime MUST use one canonical rule for attributing scan time to Timers. SPEC-002 chooses end-of-interval attribution: a Timer evaluated in scan `n` advances by the logical interval elapsed since the preceding completed scan boundary.

The first scan after initialization uses a defined initial increment, normally zero unless the execution profile supplies another recorded value.

---

# 8. Counters

Counters accumulate qualified boolean edges. They MUST NOT count every scan for which a count Input remains true.

Every Counter instance includes:

- type: CTU, CTD, or CTUD;
- Preset;
- Current Value;
- Done state;
- Reset Input;
- count Input or Inputs;
- previous Input state for each count direction;
- numeric bounds.

## 8.1 Common counter rules

- Count operations occur on rising edges.
- Edge history is instance-owned and persists across scans while initialized.
- Reset has priority over count edges evaluated in the same invocation.
- Current Value MUST remain within declared numeric bounds.
- Overflow and underflow behavior MUST be explicit. The canonical default is saturation at the bound with a warning.
- A Counter instance MUST be evaluated at most once per scan unless future semantics define otherwise.
- Preset changes affect Done during the current evaluation.

## 8.2 CTU — Count Up

Canonical behavior:

1. Reset sets Current Value to zero and Done to the comparison of zero against Preset.
2. Without Reset, a rising count-up edge increments Current Value by one unless already at the maximum bound.
3. Done is true when Current Value is greater than or equal to Preset.
4. A continuously true count Input produces one increment, not one increment per scan.

## 8.3 CTD — Count Down

CTD requires a declared initial or load value. The default load value is Preset unless the Counter definition supplies another value.

Canonical behavior:

1. Reset or Load sets Current Value to the defined load value and updates Done.
2. Without Reset or Load, a rising count-down edge decrements Current Value by one unless already at the minimum bound.
3. Done is true when Current Value is less than or equal to the completion threshold, canonically zero.
4. A continuously true count Input produces one decrement.

The precedence between Reset and Load MUST be explicit. SPEC-002 assigns Reset higher priority than Load.

## 8.4 CTUD — Count Up/Down

CTUD supports independent count-up and count-down Inputs.

Canonical behavior:

1. Reset has highest priority and sets Current Value to the configured reset value, canonically zero.
2. Load, when supported, has priority after Reset and sets the declared load value.
3. A rising up edge without a simultaneous down edge increments Current Value.
4. A rising down edge without a simultaneous up edge decrements Current Value.
5. Simultaneous rising up and down edges produce no net value change.
6. Done is true when Current Value is greater than or equal to Preset.
7. Optional lower-limit status MAY indicate when Current Value is at or below zero.

The no-net-change rule for simultaneous edges is canonical and MUST be recorded as two observed edges when trace events are enabled.

## 8.5 Preset

Preset is the target used for Done comparison. It does not necessarily initialize Current Value except for the canonical CTD load default.

Preset MUST remain within the Counter’s numeric domain.

## 8.6 Current Value

Current Value is runtime-owned Counter state. Programs may observe it and may configure it only through declared Reset, Load, or approved Counter operations.

Direct arbitrary writes are prohibited by default because they bypass edge and diagnostic semantics.

## 8.7 Done

Done is recalculated on every Counter evaluation after Reset, Load, count processing, and Preset changes are applied.

Programs MUST NOT write Done directly.

## 8.8 Reset

Reset clears or initializes Counter state according to its type and configuration. It also initializes edge history so a count Input already true during Reset does not create an unintended count until it becomes false and rises again.

---

# 9. Events

Runtime Events are ordered, immutable observations of significant runtime occurrences. Events do not replace authoritative Memory or Diagnostics state.

Every Event SHOULD include:

- event type;
- runtime session identity;
- event sequence number;
- cycle identity when applicable;
- logical timestamp;
- severity;
- source identity;
- structured details;
- related fault or state references.

Event sequence numbers MUST provide a total order within one runtime session.

## 9.1 Program Started

Program Started is emitted when an enabled Program begins evaluation in a scan.

It SHOULD identify the Program, cycle, execution order, and logical time. It does not mean the Program will complete successfully.

## 9.2 Program Stopped

Program Stopped is emitted when a Program finishes, is skipped by a defined condition, is halted by a fault policy, or is stopped by a lifecycle transition.

The reason MUST distinguish normal completion, disabled, blocking fault, runtime stop, and cancellation before execution.

## 9.3 Cycle Completed

Cycle Completed is emitted after Output Update and Diagnostics finalization for a successfully completed scan.

It SHOULD reference cycle count, logical time, published Output identity, warning count, and execution duration Diagnostics.

A failed attempted cycle MUST emit a distinct failure or fault event rather than a misleading Cycle Completed event.

## 9.4 Variable Changed

Variable Changed reports an authorized value transition. It SHOULD include variable identity, prior value, new value, quality transition, source, and commit boundary.

To control event volume, an execution profile MAY restrict which Variables emit change events. Filtering MUST NOT change the underlying Memory result.

Sensitive or protected values MAY be redacted from observer payloads while preserving event identity.

## 9.5 Fault Raised

Fault Raised is emitted when a new fault becomes active. It MUST include fault identity, category, severity, source, cycle, logical time, and applied execution/output policy.

Repeated observation of the same active fault SHOULD NOT create a new Fault Raised event unless the fault instance or severity changes.

## 9.6 Reset

Reset is emitted when an accepted Reset command is applied. It MUST identify Reset class, affected state categories, preserved Retentive Variables, cleared faults, and resulting lifecycle state.

## 9.7 Event delivery

Event generation is part of deterministic runtime behavior. External delivery may be asynchronous, but delivery delay MUST NOT alter execution.

If an observer cannot receive events, the runtime MUST follow a defined buffering or diagnostic policy. Observer failure MUST NOT silently change Program Results.

---

# 10. Diagnostics

Diagnostics provides structured evidence about runtime status and execution quality.

## 10.1 Runtime Status

Runtime Status reports the canonical lifecycle state and reason. It SHOULD include:

- runtime session identity;
- runtime model version;
- lifecycle state;
- state transition reason;
- active Program set;
- logical time;
- last completed cycle identity;
- active fault summary.

## 10.2 Execution Time

Execution Time measures host-observed duration for runtime phases and Programs. It is a performance Diagnostic, not logical PLC time.

Execution Time MAY vary between equivalent deterministic executions. Such variation MUST NOT change Program Results, Timer state, or Outputs.

## 10.3 Cycle Count

Diagnostics SHOULD report separately:

- attempted cycles;
- completed cycles;
- failed cycles;
- skipped or paused intervals when relevant.

Counters MUST be monotonic within a runtime session except through a declared full reinitialization.

## 10.4 Warnings

Warnings report non-blocking conditions such as saturation, degraded Input quality under an allowed fallback policy, near-limit performance, deprecated definitions, or recoverable diagnostic loss.

Warnings do not stop execution unless a runtime profile explicitly elevates them.

## 10.5 Errors

Errors report invalid operations or conditions with defined local handling. Examples include invalid conversion, out-of-range access, incompatible operand types, or uninitialized Temporary Variables.

An Error MAY become a Fault according to severity and policy. The conversion from Error to Fault MUST be deterministic.

## 10.6 Faults

Faults are active conditions that affect runtime lifecycle, Program continuation, Output publication, or validation trust.

Each fault MUST define:

- stable fault code;
- category;
- severity;
- source;
- first occurrence;
- active or cleared state;
- latching behavior;
- required Reset class;
- execution policy;
- Output policy;
- learner-solution, modeled-machine, or environment classification where applicable.

Faults MUST distinguish control-solution behavior from a failure of the runtime environment.

## 10.7 Performance

Performance Diagnostics MAY include:

- total scan duration;
- Input, Program, Output, and Diagnostics phase durations;
- per-Program duration;
- maximum, minimum, average, and percentile duration over a declared window;
- event and trace volume;
- memory utilization observations;
- deadline or budget overruns.

Performance measurements MUST state their measurement source and window. They MUST NOT be treated as deterministic control values unless a future execution profile explicitly maps them into logical System Variables.

## 10.8 Diagnostic severity

The minimum severity order is:

```text
information < warning < error < fault
```

Severity affects handling only through an explicit policy. Labels alone MUST NOT create hidden behavior.

## 10.9 Diagnostic immutability

Finalized diagnostic records SHOULD be immutable. Corrections or enrichments SHOULD reference the original record rather than rewriting execution history.

---

# 11. Determinism

Determinism means that identical declared execution inputs produce identical declared execution outputs.

## 11.1 Deterministic input set

A replayable execution MUST identify:

- runtime model and implementation-conformance version;
- Program and Custom Block versions;
- Memory schema and initial values;
- retained-state snapshot;
- Constants;
- Program, Network, and Instruction order;
- ordered Input samples and quality;
- logical scan increments;
- accepted lifecycle commands and their application boundaries;
- Reset operations;
- fault-injection events;
- controlled-random source and seed when used;
- numeric and data-type profile.

## 11.2 Deterministic output set

Equivalent executions MUST produce identical:

- Memory state at each committed boundary;
- published Outputs;
- Timer and Counter state;
- Program Results;
- lifecycle transitions;
- ordered runtime Events, excluding explicitly non-deterministic host measurements;
- warnings, Errors, and Faults;
- logical timestamps and cycle identities;
- Validation-relevant Diagnostics.

Host execution duration and resource utilization MAY differ and MUST be classified as observational performance data.

## 11.3 Ordering rules

Determinism requires total ordering for:

- lifecycle command application;
- Input sampling;
- Programs;
- Networks;
- Instructions;
- expression operands;
- simultaneous Counter edges;
- Memory writes;
- Event sequence assignment;
- fault handling;
- Output publication.

No unordered collection may influence execution order.

## 11.4 Time rules

Timers and time-aware logic MUST use logical time. Wall-clock time, UI animation time, network delay, and host scheduling MUST NOT alter logical results.

The execution record MUST contain every logical time increment required for replay.

## 11.5 Numeric rules

Numeric types, precision, rounding, overflow, exceptional values, and conversion MUST be standardized before runtime implementations can claim cross-platform equivalence.

Host-language default numeric behavior MUST NOT be assumed to be canonical.

## 11.6 External data

External values MUST enter through a recorded boundary. Programs MUST NOT directly read host clocks, network resources, files, UI state, unseeded randomness, or mutable global environment state.

## 11.7 Replay

A conforming execution environment SHOULD support replay from the deterministic input set. Replay comparison SHOULD identify the first divergent cycle, phase, Program, Instruction, Variable, or Event.

## 11.8 Determinism limits

The runtime can guarantee determinism only inside its declared model and Inputs. It cannot guarantee that an unmodeled physical process or external service behaves deterministically.

---

# 12. Future Extensions

Future capabilities must extend the single-task cyclic baseline without silently changing existing semantics.

## 12.1 Multi-task

Multi-task support may introduce multiple cyclic tasks with separate periods, priorities, Program sets, and Memory access.

A future specification MUST define:

- scheduling policy;
- task release and deadline semantics;
- ordering of equal-priority tasks;
- shared Memory consistency;
- Output arbitration;
- task-specific faults and Diagnostics;
- replay rules.

Existing single-task Programs MUST retain their canonical behavior when executed under a compatible single-task profile.

## 12.2 Interrupts

Interrupts may support event-driven execution between normal scan boundaries. A future model MUST define trigger sampling, priority, preemption, atomic state, reentrancy, nesting, Output visibility, and deterministic ordering.

SPEC-002 does not permit asynchronous interruption of the canonical scan.

## 12.3 Real PLC

A real-PLC adapter may map canonical Programs, Variables, Inputs, Outputs, Diagnostics, and scan assumptions to physical equipment.

The adapter MUST declare semantic differences. Physical safety, download, authorization, and commissioning require separate specifications. Conformance MUST NOT be claimed when hardware behavior contradicts canonical semantics without an explicit compatibility profile.

## 12.4 OPC UA

An OPC UA adapter may expose Memory, Diagnostics, Events, and lifecycle commands through a standardized information boundary.

Namespace, node identity, security, subscriptions, quality mapping, and transport timing belong to the adapter. Network behavior MUST NOT alter canonical Program order.

## 12.5 Digital Twin

A Digital Twin may act as Input provider and Output consumer. It supplies Machine state and consumes published Outputs at declared synchronization boundaries.

Twin simulation steps, controller scans, and event ordering require a separate co-simulation contract. UI rendering rate remains irrelevant.

## 12.6 Industrial AI

Industrial AI may observe execution traces, explain Diagnostics, propose changes, or assist Validation. It MUST NOT mutate Program, Memory, Inputs, Outputs, or Validation evidence during an execution unless operating through an explicit recorded command boundary.

AI-generated recommendations are not authoritative runtime state.

## 12.7 Extension governance

Every extension MUST define:

- owner and version;
- compatibility with SPEC-002;
- new lifecycle or execution semantics;
- deterministic ordering;
- Memory and fault effects;
- replay requirements;
- fallback behavior when unsupported.

---

# 13. Sequence Diagram

The following diagram shows one complete normal execution session. It describes logical participants and messages, not implementation components.

```text
Execution Environment        PLC Runtime       Memory        Programs       Outputs       Diagnostics
        │                          │               │               │              │              │
        │  Initialize(config,      │               │               │              │              │
        │  definitions, state)     │               │               │              │              │
        ├─────────────────────────>│               │               │              │              │
        │                          │  Initialize   │               │              │              │
        │                          ├──────────────>│               │              │              │
        │                          │  Validate Programs             │              │              │
        │                          ├──────────────────────────────>│              │              │
        │                          │  Record initialized status     │              │              │
        │                          ├────────────────────────────────────────────────────────────>│
        │                          │               │               │              │              │
        │  Start                   │               │               │              │              │
        ├─────────────────────────>│               │               │              │              │
        │                          │  Apply start at boundary       │              │              │
        │                          │  Emit Program/Runtime events   │              │              │
        │                          │               │               │              │              │
        │  Input sample +          │               │               │              │              │
        │  logical time increment  │               │               │              │              │
        ├─────────────────────────>│               │               │              │              │
        │                          │  Input Update │               │              │              │
        │                          ├──────────────>│               │              │              │
        │                          │               │               │              │              │
        │                          │  Execute ordered Programs      │              │              │
        │                          ├──────────────────────────────>│              │              │
        │                          │               │<──────────────┤ Read Inputs/Memory
        │                          │               │<──────────────┤ Write Memory/Output image
        │                          │               │               │              │              │
        │                          │  Final Output image            │              │              │
        │                          │<──────────────────────────────┤              │              │
        │                          │  Output Update                                │              │
        │                          ├─────────────────────────────────────────────>│              │
        │<──────────────────────────────────────────────────── Published Outputs ┤              │
        │                          │               │               │              │              │
        │                          │  Finalize cycle Diagnostics                                  │
        │                          ├────────────────────────────────────────────────────────────>│
        │<──────────────────────────────────────── Events, status, cycle record ─────────────────┤
        │                          │               │               │              │              │
        │                          │  Decide Next Scan            │              │              │
        │                          │───────────────┐               │              │              │
        │                          │<──────────────┘               │              │              │
        │                          │               │               │              │              │
        │  Next Input sample       │               │               │              │              │
        ├─────────────────────────>│               │               │              │              │
        │                          │      Repeat canonical scan cycle             │              │
        │                          │               │               │              │              │
        │  Stop                    │               │               │              │              │
        ├─────────────────────────>│               │               │              │              │
        │                          │  Apply stop at scan boundary  │              │              │
        │                          │  Publish configured stop state│              │              │
        │                          │  Finalize stopped status                                      │
        │<──────────────────────────────────────── Stopped event and Diagnostics ─────────────────┤
```

## 13.1 Fault variation

If a blocking fault occurs during Program Execution:

1. execution records the exact source and partial evaluation context;
2. the configured fault policy determines whether remaining Programs continue;
3. Output Update applies the configured safe, retained, or fault image;
4. Diagnostics finalizes the fault and failed-cycle record;
5. Fault Raised is emitted in deterministic sequence;
6. the runtime transitions to `faulted` or another explicitly configured state;
7. no next scan begins until lifecycle policy permits it.

---

# 14. UML Diagram

The following conceptual UML-style diagram defines domain relationships. Cardinalities describe the canonical object model, not storage tables or software classes.

```text
┌──────────────────────┐
│      PLCRuntime      │
│ lifecycle            │
│ logicalTime          │
│ runtimeVersion       │
└──────────┬───────────┘
           │ owns 1
           ▼
┌──────────────────────┐       contains 1..*       ┌──────────────────────┐
│        Memory        │<──────────────────────────│       Program        │
│ memoryAreas          │        reads/writes       │ order                │
│ committedState       │                           │ enabled              │
└──────┬───────────────┘                           └──────────┬───────────┘
       │ contains 0..*                                        │ contains 1..*
       ▼                                                       ▼
┌──────────────────────┐                           ┌──────────────────────┐
│      MemoryItem      │                           │       Network        │
│ id                   │                           │ order                │
│ type                 │                           │ enableCondition      │
│ owner                │                           └──────────┬───────────┘
│ lifetime             │                                      │ contains 1..*
└──────────────────────┘                                      ▼
                                                   ┌──────────────────────┐
┌──────────────────────┐  specializes MemoryItem  │     Instruction      │
│ TimerInstance        │──────────────────────────>│ category             │
│ CounterInstance      │                           │ operation            │
│ Input                │                           │ operands             │
│ Output               │                           │ effects              │
│ InternalVariable     │                           └──────┬───────────────┘
│ RetentiveVariable    │                                  │ evaluates 0..*
│ SystemVariable       │                                  ▼
└──────────────────────┘                           ┌──────────────────────┐
                                                   │      Expression      │
┌──────────────────────┐                           │ operands             │
│      ScanCycle       │                           │ resultType           │
│ cycleId              │                           └──────────┬───────────┘
│ inputPhase           │                                      │ produces 1
│ programPhase         │                                      ▼
│ outputPhase          │                           ┌──────────────────────┐
│ diagnosticPhase      │                           │        Result        │
└──────────┬───────────┘                           │ value                │
           │ executes Programs                     │ quality              │
           │ and commits Memory                    │ status               │
           ▼                                       └──────────────────────┘
┌──────────────────────┐
│   OutputPublication  │
│ cycleId              │
│ completeOutputImage  │
└──────────────────────┘

PLCRuntime 1 ───── 1 Memory
PLCRuntime 1 ───── 1..* Program
PLCRuntime 1 ───── 0..* ScanCycle
PLCRuntime 1 ───── 1 Diagnostics
ScanCycle 1 ───── 0..1 OutputPublication
Diagnostics 1 ───── 0..* DiagnosticRecord
Diagnostics 1 ───── 0..* RuntimeEvent
CustomBlockDefinition 1 ───── 0..* CustomBlockInstance
CustomBlockInstance 1 ───── 1 instance Memory scope
```

## 14.1 Relationship rules

- One runtime session owns one active Memory state.
- One runtime executes one or more ordered Programs.
- A Program owns one or more ordered Networks.
- A Network owns one or more ordered Instructions.
- An Instruction may evaluate Expressions and produces a Result.
- Timers and Counters are specialized stateful Memory items evaluated by their Instructions.
- A Scan Cycle reads and updates Memory, executes Programs, and may produce one Output Publication.
- Diagnostics observes the runtime and owns Diagnostic Records and Runtime Events.
- A Custom Block definition may have multiple instances; each stateful instance owns independent instance Memory.

---

# 15. Architectural Decisions

## AD-001 — The runtime defines behavior, not implementation

**Decision:** SPEC-002 describes observable execution semantics without selecting technology.

**Why:** Academy Labs must remain portable, vendor neutral, and independent from current delivery choices.

## AD-002 — One canonical single-task cyclic baseline

**Decision:** The initial model uses one ordered scan with Input Update, Program Execution, Output Update, and Diagnostics.

**Why:** A small deterministic core is teachable, testable, and sufficient for initial Academy requirements. Multi-tasking and interrupts require separate explicit semantics.

## AD-003 — Input and Output images are scan-boundary contracts

**Decision:** Inputs are sampled before Program execution; Outputs are published only after Program execution.

**Why:** Stable Inputs and atomic Output publication prevent external timing and partial state from changing results.

## AD-004 — Logical time is separate from host execution time

**Decision:** Programs and Timers use recorded logical time; host duration is diagnostic only.

**Why:** Simulation speed, CPU load, UI frame rate, and network delay must not change control outcomes.

## AD-005 — Program order is explicit and total

**Decision:** Programs, Networks, and Instructions execute in deterministic order.

**Why:** Memory writes and state transitions must be reproducible and explainable.

## AD-006 — Memory areas have one authoritative owner

**Decision:** Input provider, runtime, Programs, Timer/Counter semantics, and configuration each own defined memory areas.

**Why:** Explicit ownership prevents hidden mutation and duplicated responsibility.

## AD-007 — Outputs use working and published states

**Decision:** Programs modify an Output image; the environment sees only a complete published image.

**Why:** An industrial consumer must not observe half-evaluated scan results.

## AD-008 — Fault Output behavior is explicit

**Decision:** Safe, retained, or fault-image publication must be selected before execution.

**Why:** Fault handling is part of controller behavior and cannot depend on implementation convenience.

## AD-009 — Events are immutable observations

**Decision:** Runtime Events report ordered occurrences but do not replace authoritative Memory or Diagnostics state.

**Why:** Event streams may be filtered or delivered late; control truth must remain stable.

## AD-010 — Expressions are free from hidden side effects

**Decision:** Expressions compute Results; Instructions own declared mutations.

**Why:** Separating calculation from mutation makes execution order inspectable and validation reliable.

## AD-011 — Stateful reusable behavior requires instance identity

**Decision:** Each Timer, Counter, Edge detector, and stateful Custom Block owns distinct state.

**Why:** Hidden shared state would make behavior depend on invocation location and order in non-obvious ways.

## AD-012 — Timer and Counter instances execute once per scan

**Decision:** Re-evaluation of one stateful instance in a scan is prohibited in the baseline.

**Why:** This avoids ambiguous elapsed-time attribution, edge history, and duplicated count behavior.

## AD-013 — Timers use end-of-interval attribution

**Decision:** Timer accumulation uses the logical interval since the previous completed scan boundary.

**Why:** One explicit rule is required for replay and boundary testing; host execution duration is unsuitable.

## AD-014 — Counters count rising edges

**Decision:** CTU, CTD, and CTUD count transitions rather than sustained true states.

**Why:** Event accumulation must be independent from the number of scans for which a signal remains true.

## AD-015 — CTUD simultaneous edges have no net effect

**Decision:** Simultaneous rising count-up and count-down edges preserve Current Value.

**Why:** This is deterministic, symmetric, and avoids arbitrary priority while retaining diagnostic evidence of both edges.

## AD-016 — Retention is explicit

**Decision:** Memory is non-retentive by default; retained lifetime and Reset classes must be declared.

**Why:** Implicit retention creates unreproducible initial state and unsafe assumptions.

## AD-017 — Diagnostics cannot control Program Results

**Decision:** Diagnostic observation is separate from control evaluation.

**Why:** Logging, tracing, and UI observation must not influence learner solutions.

## AD-018 — Performance is not logical control time

**Decision:** Host execution measurements are non-deterministic Diagnostics unless a future profile explicitly models them.

**Why:** Equivalent control behavior can execute at different host speeds.

## AD-019 — Unknown Instructions are never ignored

**Decision:** Unsupported operations are rejected or faulted deterministically.

**Why:** Silent omission would produce unsafe and misleading execution.

## AD-020 — Numeric semantics require a dedicated dependency

**Decision:** Cross-platform runtime conformance depends on a future canonical data-type and numeric specification.

**Why:** Determinism cannot be guaranteed while precision, overflow, conversion, and exceptional values remain undefined.

## AD-021 — Future concurrency requires separate semantics

**Decision:** Multi-task and interrupt behavior are extensions, not assumptions in the initial runtime.

**Why:** Concurrency changes ordering, Memory consistency, fault behavior, and replay and therefore cannot be added implicitly.

## AD-022 — External systems interact through recorded boundaries

**Decision:** Machines, Twins, networks, UIs, and AI provide Inputs, consume Outputs, observe, or issue recorded commands.

**Why:** Direct access to mutable external state would break determinism and ownership.

---

# Summary

SPEC-002 defines a deterministic, vendor-neutral virtual PLC Runtime built around explicit Memory ownership and a canonical cyclic scan:

```text
Input Update → Program Execution → Output Update → Diagnostics → Next Scan
```

The model supports multiple ordered Programs, Networks, Instructions, Expressions, Results, canonical Timer and Counter semantics, runtime Events, lifecycle control, fault policies, and structured Diagnostics. Logical time drives control behavior; host execution time remains observational.

The specification defines no implementation language, UI, editor, simulator, network transport, or vendor platform.

# Dependencies

SPEC-002 depends conceptually on:

- **SPEC-001 Laboratory Model:** PLC, Variable, Challenge, Validation, and execution-profile context.

Future executable conformance requires additional approved specifications for:

- canonical data types and numeric behavior;
- Program representation and semantic validation;
- Function and Custom Block contracts;
- runtime lifecycle commands and Reset classes;
- fault taxonomy and default Output policies;
- execution record and replay format;
- Machine-to-runtime synchronization;
- Validation observation and evidence format;
- real-time or accelerated logical-time profiles;
- physical PLC safety and adapter boundaries.

No dependency, framework, protocol, or runtime implementation is selected by SPEC-002.

# Open Questions

1. Which canonical data types and numeric widths must the first runtime support?
2. Should arithmetic overflow saturate, wrap, invalidate the Result, or raise a blocking fault by default?
3. Which Output fault policy is the Academy default: safe values, last published values, or a Lab-defined fault image?
4. Which Input-quality failures stop a scan, and which may use a declared fallback?
5. Must Programs prohibit multiple writers to one Memory item, or is deterministic last-write behavior acceptable for early Labs?
6. Is a zero-duration TP required to expose a one-evaluation pulse Result, or is the specified no-duration completion sufficient?
7. Should CTD Done mean Current Value at or below zero for every Lab, or should a configurable lower threshold be canonical?
8. Which Reset classes are required: Program reset, warm reset, cold reset, factory reset, or another set?
9. Can Preset values for Timers and Counters change while active in the first runtime profile?
10. What scan-time profiles are required for introductory Labs: fixed increment, variable recorded increment, accelerated time, or all three?
11. Which trace detail must be retained for learners, validation, and replay?
12. Are Program warnings and faults visible to learner Programs through System Variables, or only to Diagnostics?
13. What are the maximum permitted Program size, cycle count, Timer count, Counter count, and retained-state size?
14. Is manual stepping a lifecycle command in the first runtime, and if so, does one step equal one complete scan?
15. Which deterministic behavior is required when an observer or event consumer cannot keep up?
16. Must the first conformance profile support Custom Blocks, or may they remain defined but unavailable?

# Risks

| Risk | Consequence | Required response |
|---|---|---|
| Numeric semantics remain unspecified | Equivalent runtimes may produce different Results | Approve a canonical data-type specification before implementation |
| Fault defaults remain a Product decision | Unsafe or inconsistent Output behavior | Approve lifecycle and fault policy before executable Labs |
| Runtime and Machine time become coupled informally | Simulation speed changes control behavior | Define an explicit synchronization contract |
| UI or host clock leaks into execution | Replay and Validation become unreliable | Enforce recorded Input and logical-time boundaries |
| Multiple writers obscure ownership | Program behavior becomes difficult to explain | Select and validate a writer policy before authoring Labs |
| Stateful instances are reused accidentally | Timers, Counters, or edges behave inconsistently | Require unique instance identity and pre-execution validation |
| Excessive tracing affects host performance | Observation can disrupt execution delivery | Decouple event delivery and define bounded buffering |
| Performance Diagnostics are mistaken for logical time | Non-deterministic host measurements affect control | Maintain strict semantic separation |
| Vendor-specific assumptions enter adapters | Canonical Labs lose portability | Require declared compatibility profiles and semantic differences |
| Physical adapters are treated like simulation | Safety and commissioning risks are understated | Require separate physical-execution and safety specifications |
| Multi-tasking is added without a scheduling model | Ordering and Memory consistency become ambiguous | Keep concurrency outside the baseline until separately specified |
| AI output is treated as authoritative | Unverified behavior can alter control or assessment | Limit AI to explicit, recorded, reviewable boundaries |
