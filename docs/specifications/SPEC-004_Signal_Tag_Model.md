# SPEC-004 — Digital2Real Signal & Tag Model

**Status:** Draft functional specification
**Specification owner:** Digital2Real Academy
**Scope:** Canonical cross-subsystem information model
**Implementation status:** Not implemented

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** express requirement strength within this specification.

---

# 1. Purpose

The Digital2Real Signal & Tag Model is the canonical language used to describe every value exchanged between Digital2Real subsystems. It defines identity, meaning, type, ownership, routing, access, lifecycle, value history, timestamp, quality, units, and relationships independently from any runtime, protocol, user interface, storage technology, or vendor.

The model is the Single Source of Truth for signal meaning throughout Digital2Real.

The following subsystems MUST exchange information exclusively through conforming signals, catalogues, snapshots, or events:

- PLC Runtime;
- Machine Runtime;
- Validation Engine;
- Simulation Engine;
- visualization consumers;
- analytics consumers;
- future OPC UA servers and clients;
- future Digital Twins;
- future AI services.

No subsystem may directly access another subsystem’s internal state. A subsystem exposes only the signals it owns or is authorized to publish. Consumers observe those signals through declared contracts.

## 1.1 Why a unified signal model exists

Without a unified model, the same engineering fact can acquire different names, types, units, ownership rules, and quality meanings in each subsystem. That creates duplicated responsibility, ambiguous truth, unsafe conversion, and integrations that depend on internal implementation details.

The unified model exists to:

- give every exchanged value one stable identity and one authoritative owner;
- distinguish signal meaning from transport and storage;
- preserve engineering units, quality, and time context;
- support deterministic snapshots, Events, replay, and Validation;
- make read and write authority explicit;
- enable safe mapping without copying ownership;
- provide consistent metadata for learning, visualization, analytics, OPC UA, and AI;
- prevent direct cross-runtime memory access.

## 1.2 Why loose coupling is critical

Loose coupling means a consumer depends on an approved signal contract, not on the producer’s internal classes, memory layout, scheduling, database, or programming technology.

Loose coupling is critical because:

- PLC and Machine Runtimes must remain independently replaceable;
- Simulation must advance time without owning controller or Machine state;
- Validation must observe evidence without mutating the system under test;
- visualization must never become execution authority;
- analytics and AI must consume governed data without hidden write access;
- protocol adapters must map signals without redefining them;
- subsystem failures must remain isolated and diagnosable.

## 1.3 Why the model enables scalability

The model enables scalability through stable identifiers, nested namespaces, typed values, single ownership, explicit quality, relationship graphs, and transport-neutral metadata.

New Machines, Labs, Validation rules, visualizations, analytics, Digital Twins, and external protocols can reuse the same contracts. A new consumer does not require producers to expose internal state. A new signal category or data structure can be versioned without renaming unrelated signals.

## 1.4 Signal and Tag terminology

A **Signal** is a versioned information contract and its observed value state.

A **Tag** is a named reference used by a subsystem, Lab, adapter, or authoring context to address a Signal. A Tag MUST resolve to one canonical Signal Identifier. A Tag does not create another source of truth.

This specification uses “Signal” for the canonical entity and “Tag” for a reference or presentation name.

## 1.5 Scope boundary

This specification defines information semantics. It does not define:

- a message broker;
- a database;
- a network protocol;
- an API;
- runtime code;
- PLC or Machine execution;
- UI widgets;
- an OPC UA implementation;
- an AI model;
- an authorization provider.

---

# 2. High-Level Architecture

The conceptual information path is:

```text
Machine Runtime
       ↓
Signal Layer
       ↓
PLC Runtime
       ↓
Validation
       ↓
Visualization
       ↓
Analytics
       ↓
OPC UA
       ↓
AI
```

The vertical diagram illustrates participation in one shared Signal Layer. It does not mean that every value must pass sequentially through every subsystem. All consumers and producers connect through governed signals; none forms an implicit relay for another unless a declared relationship says so.

A more precise ownership view is:

```text
                        ┌─────────────────────┐
Machine Runtime ───────>│                     │<─────── PLC Runtime
Simulation Engine ─────>│    Signal Layer     │<─────── Validation Engine
System Diagnostics ────>│                     │<─────── Academy Services
                        └──────────┬──────────┘
                                   │
                   ┌───────────────┼────────────────┐
                   ▼               ▼                ▼
             Visualization     Analytics       OPC UA Adapter
                   │               │                │
                   └───────────────┼────────────────┘
                                   ▼
                              AI Services
```

Arrows into the Signal Layer represent authorized publication. Arrows out represent authorized consumption. Bidirectional participation requires separate read and write permissions and does not grant internal-state access.

## 2.1 Machine Runtime relationship

The Machine Runtime owns physical and simulated Machine observations, including Sensor values, Component feedback, Machine lifecycle, object State, and modeled faults that it elects to expose.

It consumes declared actuator-command Signals owned by the PLC or another authorized command source. It MUST NOT read PLC Memory directly.

Machine Sensors publish observations derived from committed Machine State according to SPEC-003. They do not mirror PLC Outputs.

## 2.2 Signal Layer relationship

The Signal Layer is the logical contract boundary. It governs:

- Signal definitions and catalogue versions;
- identity and namespaces;
- type and unit conformance;
- ownership and access;
- current and previous observed value;
- timestamp and sequence context;
- quality;
- update and lifecycle rules;
- Events and history contracts;
- relationships and mappings.

The Signal Layer does not calculate Machine Physics or execute PLC Programs. It validates and communicates declared information contracts.

## 2.3 PLC Runtime relationship

The PLC Runtime consumes Machine-owned Sensor Signals during its Input Update boundary. It owns PLC Output command Signals, PLC Internal Variables chosen for exposure, controller Diagnostics, and other declared controller observations.

Publishing a PLC Output Signal does not mean the commanded physical action occurred. Machine feedback remains Machine-owned.

## 2.4 Validation relationship

The Validation Engine consumes authorized Signal snapshots, Events, and history as evidence. It owns Validation result Signals, score Signals, rule outcomes, and completion observations.

Validation MUST NOT mutate Machine, PLC, or Simulation-owned Signals. A Validation rule that needs to influence a scenario does so through an explicitly owned Validation command or scenario request Signal, never through direct state access.

## 2.5 Visualization relationship

Visualization consumes authorized Signals for presentation. It does not own the underlying engineering truth.

User interactions that request change MUST publish to separately authorized command Signals. Changing a visual control must not directly mutate a read-only observed Signal.

## 2.6 Analytics relationship

Analytics consumes governed Signal Events and history. It MAY own calculated analytic Signals when their formulas, windows, source references, and quality propagation are declared.

Analytics MUST NOT rewrite source history or promote an estimate into source truth.

## 2.7 OPC UA relationship

A future OPC UA adapter maps canonical Signals to OPC UA Nodes, values, timestamps, quality/status, access, and hierarchy. The adapter consumes the canonical catalogue; it does not become the owner of mapped Signals unless a separately declared external-source Signal says so.

## 2.8 AI relationship

AI services consume authorized Signal context, Events, and history for explanation, diagnosis, prediction, or assistance. They MAY publish separately owned recommendation or inference Signals.

AI MUST NOT overwrite authoritative Machine, PLC, Simulation, Validation, or System Signals. AI-produced values must be identifiable as inferred or calculated and retain source provenance.

## 2.9 Simulation Engine relationship

The Simulation Engine owns canonical simulation time, execution step, pause state, speed factor, synchronization status, and scenario coordination Signals.

It MUST NOT own Machine Sensors, PLC Outputs, or Validation scores. It coordinates boundaries through declared Signals and orchestration contracts.

---

# 3. Signal Definition

Every Signal MUST have one definition and one current observed state. Definitions change only through catalogue versioning. Values change through authorized updates.

## 3.1 Required Signal fields

| Field | Required | Definition |
|---|---:|---|
| `Identifier` | Yes | Stable, globally unique, machine-readable Signal identity. |
| `Display Name` | Yes | Human-readable name. It may be localized and is not identity. |
| `Description` | Yes | Precise engineering meaning and interpretation. |
| `Type` | Yes | Canonical data type from Section 5 or an approved extension. |
| `Owner` | Yes | Subsystem or domain with authoritative write responsibility. |
| `Source` | Yes | Exact producer or derivation origin within the Owner boundary. |
| `Destination` | Yes | Authorized consumer set or declared publication audience. May be empty for internal-only exposed Diagnostics. |
| `Access` | Yes | `read-only`, `write-only`, or `read-write` from the perspective of each declared participant. |
| `Scope` | Yes | Lifetime and visibility boundary such as runtime session, Machine, PLC, Lab attempt, learner, Lab, or system. |
| `Persistence` | Yes | Whether and how value history survives update, session, attempt, or archival boundaries. |
| `Timestamp` | Yes for initialized values | Time associated with the current value, including time domain. |
| `Quality` | Yes | Current quality from Section 9 with optional detail. |
| `Engineering Units` | Conditional | Required for physical or quantified values; explicitly `none` when dimensionless. |
| `Default Value` | Yes | Definition-level value used before another approved initialization rule. |
| `Current Value` | Yes after initialization | Latest accepted value. |
| `Previous Value` | Yes after first update | Prior accepted value or explicit absence before the first update. |
| `Metadata` | Yes | Versioned supporting information, constraints, provenance, relationships, and governance. May be empty only when no optional metadata applies. |

## 3.2 Identifier

Identifier is immutable for the lifetime of a Signal definition. It SHOULD be opaque enough to survive display-name and namespace changes while remaining diagnosable.

An Identifier MUST NOT be reused for another meaning, type, owner, or unit. A breaking semantic change requires a new Identifier or an approved new major catalogue version with explicit migration.

Recommended Identifier form:

```text
sig.<domain>.<stable-local-id>
```

Example:

```text
sig.machine.conveyor01.entry_blocked
```

## 3.3 Display Name

Display Name is intended for people and MAY be localized. It MUST NOT be used as a cross-subsystem key.

## 3.4 Description

Description MUST state what the Signal means, not merely repeat its name. For commands it states the request. For observations it states the physical, logical, calculated, or diagnostic fact represented.

## 3.5 Type

Type defines the legal value domain and operations. A value that does not conform to Type MUST be rejected or accepted with `Invalid` quality according to the update contract; it MUST NOT be silently coerced.

## 3.6 Owner

Owner is the sole authority that may publish normal authoritative updates. Ownership is a domain responsibility, not necessarily one process or server.

An adapter transporting a Signal does not become its Owner.

## 3.7 Source

Source identifies the exact producer, Sensor, PLC Output, rule, calculation, clock, service, or diagnostic origin. Owner may be broad; Source is specific.

## 3.8 Destination

Destination is a set of logical consumers or audiences. It does not require a point-to-point transport. An undeclared Destination MUST NOT receive the Signal unless an authorization policy explicitly grants broader discovery.

## 3.9 Access

Access is participant-relative:

- `read-only`: participant may observe but not update;
- `write-only`: participant may submit an update but not observe the resulting value, used only when justified;
- `read-write`: participant may observe and submit updates within declared authority.

Owner write authority and consumer Access are separate. `read-write` does not permit a consumer to bypass Owner validation.

## 3.10 Scope

Scope defines identity context and lifetime. Canonical Scopes include:

- component;
- Machine;
- PLC;
- runtime session;
- Simulation session;
- Lab attempt;
- learner;
- Lab definition;
- Academy;
- system.

A scoped Signal MUST include enough context to distinguish concurrent Machines, PLCs, learners, attempts, and sessions.

## 3.11 Persistence

Persistence policy states whether only Current Value, limited history, attempt history, long-term history, or archival records are retained.

Canonical policies are:

- `none`: value exists only in active evaluation;
- `current`: latest accepted state only;
- `session`: retained for one runtime or Simulation session;
- `attempt`: retained for one Lab attempt;
- `historical`: retained according to an approved history policy;
- `archival`: retained as an immutable long-term record.

Persistence does not change ownership.

## 3.12 Timestamp

Timestamp MUST include or reference its time domain:

- simulation logical time;
- PLC logical time;
- Machine logical time;
- system event time;
- external source time.

Where source time and ingestion time differ, both SHOULD be retained. Timestamp ordering MUST NOT be inferred across unsynchronized domains without a synchronization contract.

## 3.13 Quality

Quality expresses trust and availability independently from value. Consumers MUST evaluate Quality according to Section 9.

## 3.14 Engineering Units

Units MUST be canonical, explicit, and machine-readable. Display conversion does not change the stored canonical value unless a Conversion relationship creates a separately identified Signal.

Commands and observations describing the same quantity SHOULD use compatible dimensions, but ownership remains separate.

## 3.15 Default Value

Default Value belongs to the definition. It MUST conform to Type and Units. It is not automatically a safe value, retained value, or valid measured value.

Initialization policy determines whether Default Value begins with `Good`, `Unknown`, `Simulated`, or another Quality.

## 3.16 Current Value and Previous Value

Current Value is the latest accepted value state. Previous Value is the immediately preceding accepted value state.

Each value state includes value, Timestamp, Quality, source sequence, and optional update reason. Previous Value MUST update atomically with Current Value.

Repeated updates with an equal value still update Current Timestamp and may emit Signal Updated, but do not emit Signal Changed unless Quality or value changed according to canonical equality.

## 3.17 Metadata

Metadata MAY include:

- catalogue version;
- Signal definition version;
- namespace path;
- category;
- value constraints;
- enum labels;
- array length;
- Structure fields;
- Bitfield layout;
- unit definition;
- sampling expectation;
- update mode;
- deadband or change tolerance;
- access roles;
- privacy classification;
- retention policy reference;
- relationship references;
- source provenance;
- Lab, Machine, PLC, objective, or Validation references;
- deprecation and replacement information;
- localization keys;
- OPC UA mapping hints;
- AI-use restrictions.

Metadata MUST NOT contain an undeclared second Current Value.

## 3.18 Signal definition versus Signal sample

A **Signal definition** contains stable identity, meaning, Type, Owner, Source, Destination, Access, Scope, Persistence, Units, Default Value, and Metadata.

A **Signal sample** contains Identifier, Current Value, Previous Value when required, Timestamp, Quality, sequence, and provenance.

Definitions and samples MAY be transported separately. A sample MUST resolve to exactly one compatible definition.

---

# 4. Signal Categories

Category classifies engineering role. Category does not replace Type, Owner, or Access.

## 4.1 Digital Input

A Digital Input is a boolean or finite-state observation sampled by a PLC Input boundary. It is normally owned by the Machine when derived from a Sensor.

“Input” describes PLC consumption direction, not ownership.

Examples include object detected, limit reached, pressure switch active, and Emergency State observed.

## 4.2 Digital Output

A Digital Output is a discrete command published by the PLC for an actuator or external consumer. It is owned by the PLC.

It represents requested action, not confirmed physical State.

## 4.3 Analog Input

An Analog Input is a numeric Machine or external observation sampled by the PLC. It MUST define Units, valid range, resolution or precision when relevant, and Quality.

Examples include temperature, pressure, level, speed, and position.

## 4.4 Analog Output

An Analog Output is a numeric PLC command such as speed reference, position request, valve opening request, or process setpoint.

It MUST define Units, command range, and out-of-range policy. It does not prove the Machine achieved the requested value.

## 4.5 Internal Variable

An Internal Variable exposes selected controller, Machine, Validation, Academy, or service-owned internal domain state through a governed Signal.

Only intentionally published Internal Variables belong in the Signal catalogue. Subsystem internals remain private by default.

## 4.6 Derived Signal

A Derived Signal is produced deterministically from one or more source Signals while preserving source ownership.

It MUST declare source references, derivation semantics, update trigger, Type, Units, and Quality propagation.

## 4.7 Diagnostic Signal

A Diagnostic Signal reports runtime health, execution status, fault State, quality, synchronization, performance, or capacity.

Diagnostic Signals are owned by the subsystem diagnosing itself or by System when they represent cross-system health.

## 4.8 Virtual Signal

A Virtual Signal represents a modeled concept with no required direct physical counterpart, such as a learner command, simulated selector, virtual mode, or educational scenario control.

Virtual does not mean ungoverned. Ownership, Type, Quality, and lifecycle remain mandatory.

## 4.9 Calculated Signal

A Calculated Signal is a numeric, textual, structured, or categorical Result computed through an explicit formula, aggregation, or algorithm.

Compared with Derived Signal, Calculated emphasizes computational Result and may use a history window. Both require provenance. A project may classify one Signal as both derived and calculated through Metadata, but one primary category MUST be selected.

## 4.10 Simulation Signal

A Simulation Signal is owned by the Simulation Engine and represents logical time, step identity, execution speed, pause State, scenario State, or synchronization status.

Simulation Signals coordinate execution but MUST NOT replace Machine physical State or PLC controller State.

## 4.11 Validation Signal

A Validation Signal is owned by the Validation Engine and represents rule outcome, score, completion, evidence status, or Validation lifecycle.

Validation Signals observe system behavior and MUST NOT become Machine or PLC control truth.

## 4.12 System Signal

A System Signal is owned by System and represents cross-platform lifecycle, availability, catalogue version, security-neutral service health, or infrastructure Diagnostics.

System Signals MUST remain distinct from modeled Machine faults and learner-solution failures.

---

# 5. Data Types

Canonical data types define value domains and supported operations. Cross-platform conformance requires exact numeric and serialization profiles in a future specification.

## 5.1 Common operation rules

Every operation MUST define:

- accepted operand Types;
- Result Type;
- null or absent-value behavior when allowed;
- Quality propagation;
- range and bound behavior;
- equality semantics;
- ordering semantics when applicable;
- conversion requirements;
- failure behavior.

Implicit lossy conversion is prohibited.

## 5.2 Boolean

Boolean supports `true` and `false`.

Supported operations include:

- logical conjunction, disjunction, exclusive disjunction, and negation;
- equality and inequality;
- edge or change detection using Previous and Current Value;
- aggregation such as all, any, and count-true through a Calculated Signal.

Quality is not encoded as a third boolean state.

## 5.3 Integer

Integer represents whole numbers with a declared signedness and width profile.

Supported operations include:

- arithmetic;
- comparison;
- range checks;
- increment and decrement in an owning runtime;
- exact conversion when destination range permits;
- bitwise operations when Metadata permits.

Overflow behavior MUST be declared by the numeric profile.

## 5.4 Float

Float represents a finite-precision real number under an approved canonical precision profile.

Supported operations include arithmetic, comparison with explicit tolerance where needed, scaling, limiting, aggregation, and conversion.

NaN, infinity, rounding, and overflow behavior MUST be defined before implementation conformance.

## 5.5 Double

Double represents a higher-precision real number than Float under the canonical numeric profile.

Supported operations are equivalent to Float with separately defined precision and range.

Float and Double are not interchangeable without explicit Conversion.

## 5.6 String

String represents ordered text using a declared character encoding and optional maximum length.

Supported operations include:

- equality and inequality;
- lexical ordering when locale and normalization are declared;
- length;
- concatenation in a Calculated Signal;
- pattern or membership checks;
- explicit parsing and formatting conversions.

Strings MUST NOT replace structured engineering Types for convenience.

## 5.7 Enum

Enum represents one value from a versioned finite set. Each member has a stable machine identity and a human label.

Supported operations include equality, inequality, membership, and ordering only when the definition explicitly declares order.

Unknown future members MUST produce defined compatibility behavior rather than being silently mapped to an unrelated member.

## 5.8 Array

Array represents an ordered collection of values of one declared element Type. Length may be fixed or bounded.

Supported operations include indexed read, length, equality according to element order, iteration by authorized calculations, aggregation, and slice only when declared.

Index bounds and update atomicity MUST be explicit. Partial cross-subsystem updates are prohibited unless the Signal definition defines a versioned patch contract.

## 5.9 Structure

Structure represents a versioned set of named fields, each with its own Type and optional Unit.

Supported operations include field access, whole-value equality, field-based calculation, and whole-value update. Partial update is allowed only through a declared atomic patch contract.

Field names, required status, defaults, and compatibility rules MUST be versioned.

## 5.10 Bitfield

Bitfield represents a fixed-width set of named bits or bit ranges.

Supported operations include mask, set, clear, test, equality, bitwise logic, shift, and extraction according to declared width and ordering.

Every meaningful bit SHOULD have a stable name. Unassigned bits MUST have defined write and preservation behavior.

## 5.11 Timestamp

Timestamp represents a point or ordered position in a declared time domain.

Supported operations include equality, ordering within one synchronized domain, duration calculation between compatible timestamps, and explicit conversion when a synchronization mapping exists.

Timestamp MUST identify time domain and precision. Cross-domain ordering without synchronization is invalid.

## 5.12 Composite value equality

Array and Structure equality requires equal compatible definitions, length or fields, element values, and canonical comparison semantics. Quality is compared separately from value.

## 5.13 Conversion

Conversion MUST be explicit when Type, Units, precision, representation, or time domain changes. A converted value SHOULD be a separately identified Calculated or Mapped Signal when consumers require independent traceability.

---

# 6. Ownership

Every Signal has exactly one authoritative Owner. Consumers may read, map, validate, display, store, or calculate from a Signal without acquiring ownership.

## 6.1 Ownership principles

1. Owner defines the authoritative update semantics.
2. Owner validates submitted writes within its boundary.
3. Owner assigns source sequence, Timestamp, and Quality.
4. Owner publishes Current and Previous Value atomically.
5. Owner declares lifecycle and persistence.
6. Owner is accountable for semantic versioning.
7. Consumers MUST NOT overwrite Owner State.
8. Transport and storage do not confer ownership.
9. Aliases and Mirrors do not duplicate ownership.
10. Ownership transfer requires a documented breaking decision and migration.

## 6.2 Machine ownership

Machine owns:

- Sensor observations;
- physical Component feedback;
- Machine lifecycle observations;
- object and process observations chosen for publication;
- modeled Machine fault observations.

Machine does not own PLC commands even when it consumes them.

## 6.3 PLC ownership

PLC owns:

- Digital and Analog Output command Signals;
- selected exposed PLC Internal Variables;
- controller Program status;
- controller-owned Timer, Counter, or Tag observations chosen for exposure;
- PLC Runtime Diagnostics that are specific to the controller.

PLC does not own Sensor truth merely because it samples Sensors into Inputs.

## 6.4 Validation ownership

Validation owns:

- rule Results;
- objective outcomes;
- scores;
- completion State;
- evidence sufficiency;
- Validation lifecycle and Diagnostics.

Validation reads source Signals but MUST NOT rewrite them.

## 6.5 Simulation ownership

Simulation owns:

- logical Simulation time;
- Simulation step identity;
- run, pause, and speed coordination State;
- scenario orchestration State;
- synchronization Diagnostics.

Simulation does not own Machine Physics Results or PLC Program State.

## 6.6 System ownership

System owns:

- Signal catalogue version;
- cross-subsystem availability and health Diagnostics;
- platform lifecycle Signals;
- routing-neutral synchronization health;
- canonical environment identity.

System MUST NOT reclassify modeled Machine Faults as infrastructure Diagnostics or vice versa.

## 6.7 Academy ownership

Academy owns curriculum and Lab-context Signals such as active Lab identity, objective identity, mission stage, and governed learning state not owned by Progress or Validation.

Academy does not own learner-entered command intent if that Signal is explicitly User-owned.

## 6.8 User ownership

User-owned Signals represent explicit learner or instructor intent, such as a virtual pushbutton request, acknowledgement request, or answer submission.

User ownership does not permit direct writes to PLC Output, Machine Sensor, Validation score, Simulation time, or System Diagnostic Signals.

## 6.9 Derived and calculated ownership

The subsystem responsible for the derivation owns the Derived or Calculated Signal. Source Owners remain unchanged.

The definition MUST name the derivation Owner, Sources, formula or rule version, update mode, and Quality propagation.

## 6.10 Ownership conflict

If two producers claim authoritative write access to one Identifier, the Signal catalogue is invalid. The conflict MUST be resolved before execution. Last-writer-wins across independent Owners is prohibited.

---

# 7. Update Rules

Signal updates are accepted only through the Owner’s declared update contract. Every accepted update creates a new value state even when the value is equal, unless the definition explicitly suppresses unchanged samples.

## 7.1 Read Only

Read Only means the participant may consume the Signal but may not submit updates. Most Machine Sensor, PLC Output, Validation, Simulation, and Diagnostic Signals are read-only to consumers.

Read-only access does not restrict the Owner’s authoritative update.

## 7.2 Write Only

Write Only means the participant may submit a command or request but is not authorized to read the resulting Signal State.

Write Only SHOULD be rare because learning and Diagnostics normally benefit from visibility. It may be required for protected credentials or one-way external actions, which are outside the initial Academy scope.

## 7.3 Read Write

Read Write means the authorized participant may observe the current Signal and submit updates through the Owner boundary.

Read Write MUST NOT permit direct memory mutation. The Owner validates Type, range, lifecycle, authorization, and conflict policy before accepting the update.

## 7.4 Calculated

A Calculated Signal updates when its declared calculation is evaluated. It MUST define:

- source Signals;
- formula or algorithm identity and version;
- update trigger;
- history window when applicable;
- output Type and Units;
- missing-source behavior;
- Quality propagation;
- Timestamp policy.

Consumers cannot write a Calculated Signal directly.

## 7.5 Event Driven

An Event Driven Signal updates when a declared Event occurs. Multiple Events in one logical interval MUST have deterministic order.

The Event source, event sequence, and Signal update relationship MUST be traceable.

## 7.6 Scan Driven

A Scan Driven Signal updates at a PLC scan boundary. It MUST identify whether the value is sampled during Input Update, committed during Program Execution, published during Output Update, or finalized during Diagnostics.

Scan Driven does not imply Machine ownership.

## 7.7 Simulation Driven

A Simulation Driven Signal updates at a declared Simulation or Machine step boundary using Simulation logical time.

Machine Sensors and Machine physical observations are typically Simulation Driven in virtual Labs, but their Owner remains Machine.

## 7.8 Manual or command-driven update

User, instructor, or external commands update only their own request Signals. A target subsystem consumes the request and may publish a separate accepted State or Result Signal.

Request and Result MUST NOT share one Identifier when acceptance can fail or be delayed.

## 7.9 Atomic update

An accepted update atomically changes:

- Previous Value to the prior Current Value state;
- Current Value to the accepted new value;
- Timestamp;
- Quality;
- source sequence;
- update Metadata required by the definition.

Consumers MUST NOT observe a new value with an old Quality or Timestamp.

## 7.10 Update priority

Priority resolves competing candidate updates within one Owner boundary. It never resolves conflicting Owners.

The canonical priority is:

1. lifecycle destruction or archival rejection;
2. explicit invalidation or disconnection policy;
3. Owner-authoritative fault or safety update;
4. Owner-authoritative normal update;
5. accepted mapped external update;
6. calculated or derived update;
7. default initialization;
8. no update.

Within one priority, ordering uses declared logical time, source sequence, and a stable deterministic secondary key.

A Signal definition MAY refine priority but MUST document why and preserve one Owner.

## 7.11 Same-value update

If an accepted value equals Current Value and Quality is unchanged:

- Signal Updated MAY be emitted;
- Signal Changed MUST NOT be emitted;
- Timestamp and source sequence update according to sampling policy;
- Previous Value changes only if the model preserves every accepted sample; otherwise it remains the last distinct state.

The catalogue MUST declare whether Previous Value means previous sample or previous distinct value. SPEC-004 recommends previous accepted sample for deterministic replay.

## 7.12 Update rejection

An update MUST be rejected when:

- Identifier is unknown or archived;
- producer lacks authority;
- Type is incompatible;
- value violates a hard constraint;
- Timestamp or sequence violates ordering policy;
- scope context is missing;
- lifecycle does not permit update;
- source definition version is incompatible.

Rejection MUST create a Diagnostic or Event without changing Current Value.

---

# 8. Signal Lifecycle

Signal lifecycle governs definitions and value availability.

```text
Created → Initialized → Updated → Consumed → Archived → Destroyed
```

Consumed may occur repeatedly after Initialized or Updated. Archived and Destroyed are governance transitions, not value updates.

## 8.1 Created

A Signal is Created when a valid definition is accepted into a catalogue version.

At Created:

- Identifier is reserved;
- definition fields are validated;
- Owner and Source are registered;
- relationships are checked;
- no Current Value is required yet.

A created but uninitialized Signal has `Unknown` Quality and no authoritative Current Value unless catalogue policy assigns the Default Value as an explicit initial sample.

## 8.2 Initialized

A Signal is Initialized when the Owner publishes the first accepted value state or an approved initialization policy applies Default Value.

Initialization MUST establish Current Value, explicit Previous Value absence, Timestamp, Quality, and source sequence.

## 8.3 Updated

A Signal is Updated whenever an authorized accepted sample changes the value state. Updated includes same-value samples when sampling policy retains them.

## 8.4 Consumed

Consumed records that an authorized Destination observed a versioned Signal sample or snapshot. Consumption MUST NOT change ownership or Current Value.

Consumption recording MAY be omitted for high-frequency consumers unless audit or learning requirements demand it.

## 8.5 Archived

Archived means the Signal definition is no longer active for new updates but remains available for history, replay, migration, or audit.

An archived Signal:

- rejects new normal updates;
- retains definition and approved history;
- identifies replacement when one exists;
- remains resolvable by historical records.

## 8.6 Destroyed

Destroyed means the active runtime instance and non-required transient State are released. It does not permit reuse of Identifier or deletion of mandatory archival evidence.

Destruction policy MUST respect persistence, Progress, Validation, audit, and retention requirements.

## 8.7 Definition version lifecycle

Definition changes are classified as:

- non-breaking metadata clarification;
- compatible extension;
- breaking semantic change.

Breaking changes require a new major definition version and migration. Owner, Type, Units, or engineering meaning changes are breaking by default.

---

# 9. Quality Model

Quality describes the confidence, origin, availability, and validity of a Signal sample independently from its value.

The canonical primary Quality states are:

- Good;
- Bad;
- Unknown;
- Simulated;
- Disconnected;
- Fault;
- Invalid.

## 9.1 Good

Good means the Owner considers the value valid, current enough for its declared update policy, and produced under normal conditions.

Good does not mean the underlying industrial condition is desirable. A valid `motor_fault = true` observation may have Good Quality.

## 9.2 Bad

Bad means the value cannot be trusted for its intended use because acquisition or production failed, but a more specific canonical state does not apply or is unavailable.

Consumers SHOULD preserve the last value only with Bad Quality and MUST NOT treat it as fresh truth.

## 9.3 Unknown

Unknown means Quality has not yet been established, commonly before initialization or when provenance is insufficient.

Unknown is not equivalent to false, zero, empty, or disconnected.

## 9.4 Simulated

Simulated means the value is valid within a declared simulation model rather than measured from physical equipment.

Simulated MAY be treated as acceptable for Academy Validation when the Lab execution profile allows it. It MUST remain distinguishable from physical Good data.

## 9.5 Disconnected

Disconnected means the Owner or source boundary is not currently connected or synchronized, so the value cannot be refreshed.

The last value MAY be retained with its original source Timestamp and Disconnected Quality. Ingestion Timestamp MUST NOT disguise staleness.

## 9.6 Fault

Fault means the Signal source is affected by a modeled or runtime fault that changes value trust or availability.

Fault Quality is distinct from a Signal whose valid value reports a fault condition. Definitions MUST state which representation applies.

## 9.7 Invalid

Invalid means the value violates Type, range, semantic constraints, calculation domain, or definition compatibility.

An Invalid sample SHOULD be rejected as Current Value unless a diagnostic profile requires retaining it as evidence. If retained, it MUST never appear with Good Quality.

## 9.8 Quality detail

Primary Quality MAY include detail such as:

- reason code;
- source fault;
- stale duration;
- last Good Timestamp;
- uncertainty estimate;
- simulation profile;
- invalid constraint;
- disconnected source;
- substitution policy.

Detail MUST NOT redefine primary Quality.

## 9.9 Quality propagation

Derived, Calculated, Aggregated, Mirrored, and Mapped Signals MUST declare Quality propagation.

Canonical default precedence from most restrictive to least is:

```text
Invalid → Fault → Disconnected → Bad → Unknown → Simulated → Good
```

The Result normally inherits the most restrictive relevant source Quality. Exceptions require a declared rule.

Examples:

- a calculation with one Invalid required source becomes Invalid;
- a Mirror of a Disconnected source becomes Disconnected;
- an aggregate may remain Good when an optional source is Bad only if its completeness metadata declares the omission;
- a calculation from only Simulated Good sources becomes Simulated;
- a Signal reporting Sensor fault State may be Good even while another measured value from that Sensor has Fault Quality.

## 9.10 Quality recovery

When a source recovers, the next accepted valid sample may restore Good or Simulated Quality. Recovery MUST emit Quality Changed and preserve the prior quality State in history.

---

# 10. Events

Signal Events are ordered, immutable records of lifecycle, value, and Quality transitions. Events do not replace Current Signal State.

Every Event SHOULD include:

- Event Type;
- Signal Identifier;
- Signal definition version;
- scope and session context;
- event sequence;
- source sequence;
- logical or source Timestamp;
- ingestion Timestamp when applicable;
- prior state reference;
- resulting state reference;
- Owner and Source;
- reason or provenance;
- correlation identity.

## 10.1 Signal Created

Emitted when a Signal definition enters a catalogue version. It includes definition identity, Owner, Type, Scope, and catalogue version.

## 10.2 Signal Updated

Emitted for each accepted update according to sampling policy, including equal-value samples when retained.

Signal Updated includes new value state identity and prior sample identity.

## 10.3 Signal Changed

Emitted only when Current Value differs from Previous Value according to canonical Type equality or when a Structure/Array field changes under its declared equality rules.

Quality-only changes do not require Signal Changed; they produce Quality Changed.

## 10.4 Signal Invalidated

Emitted when a Signal becomes Invalid or its Current Value is explicitly invalidated due to schema, source, lifecycle, or semantic failure.

It MUST state whether Current Value was rejected, retained with Invalid Quality, or replaced under an approved substitution policy.

## 10.5 Signal Archived

Emitted when a Signal definition transitions to Archived. It includes reason, replacement reference, archival policy, and final active value state.

## 10.6 Quality Changed

Emitted whenever primary Quality or material Quality detail changes, even if value is equal.

It includes prior and new Quality, reason, and recovery or degradation classification.

## 10.7 Event ordering

Events within one Signal Owner boundary MUST have a total source sequence. Cross-owner ordering requires synchronization context or a common orchestration sequence.

Transport delivery order MUST NOT be assumed to be source order unless guaranteed by the transport profile.

## 10.8 Event history

Persistence of Events follows Signal Persistence and explicit audit policy. Archival Signals MUST preserve required lifecycle and migration Events.

---

# 11. Namespace

Namespace provides hierarchical discovery and human-readable context. Identifier remains the immutable canonical key.

## 11.1 Root namespaces

The canonical roots are:

```text
Machine/
PLC/
Simulation/
Validation/
System/
Academy/
User/
```

## 11.2 Machine namespace

Recommended form:

```text
Machine/<machine-id>/<domain>/<component-id>/<signal-name>
```

Examples:

```text
Machine/Conveyor01/Sensors/EntryBlocked
Machine/Conveyor01/Components/Motor01/ActualSpeed
Machine/Transfer01/Process/Tank01/Level
Machine/RobotCell01/Faults/ActiveCode
```

## 11.3 PLC namespace

Recommended form:

```text
PLC/<plc-id>/<area>/<signal-name>
```

Examples:

```text
PLC/Controller01/Outputs/MotorRunCommand
PLC/Controller01/Outputs/SpeedReference
PLC/Controller01/Internal/SequenceState
PLC/Controller01/Diagnostics/CycleCount
```

## 11.4 Simulation namespace

Examples:

```text
Simulation/Session01/Time/Logical
Simulation/Session01/Execution/Step
Simulation/Session01/Execution/Paused
Simulation/Session01/Synchronization/Status
```

## 11.5 Validation namespace

Examples:

```text
Validation/Attempt01/Rules/SafeStart/Passed
Validation/Attempt01/Score/Current
Validation/Attempt01/Completion/Status
```

## 11.6 System namespace

Examples:

```text
System/SignalCatalogue/Version
System/Health/SignalLayer/Status
System/Diagnostics/ActiveFaultCount
```

## 11.7 Academy namespace

Examples:

```text
Academy/Lab/D2R-LAB-001/ActiveObjective
Academy/Lab/D2R-LAB-001/MissionStage
```

## 11.8 User namespace

Examples:

```text
User/Learner01/Attempt01/Commands/StartRequest
User/Learner01/Attempt01/Commands/ResetRequest
```

User namespace MUST NOT expose private identity beyond approved scope.

## 11.9 Nested namespace rules

- Segments MUST have stable meaning and consistent case.
- Separator is `/` in canonical documentation.
- Empty segments are prohibited.
- `.` and `..` navigation semantics are prohibited.
- Reserved characters require a future encoding specification.
- Runtime session or attempt context MUST appear when concurrent instances could collide.
- Display Name MUST NOT be derived mechanically when localization or engineering clarity requires another label.
- Namespace movement does not change Identifier, but requires Alias or migration metadata for discoverability.
- A namespace path MUST resolve to at most one active Signal in a catalogue version.

## 11.10 Namespace and ownership

Root namespace SHOULD match Owner domain. Exceptions such as a Machine-owned Signal presented under a Lab-specific view MUST use an Alias, not move ownership or create a duplicate Signal.

---

# 12. Relationships

Relationships connect Signals without merging identity or ownership. Every relationship MUST have an Identifier, Type, source reference, destination reference, Owner, direction, transformation semantics, Quality propagation, lifecycle, and version.

## 12.1 Alias

Alias provides another address or Tag for the same canonical Signal.

Rules:

- Alias has no independent Current Value;
- writes, if authorized, resolve to the canonical Signal Owner;
- Quality, Timestamp, and history are the canonical Signal’s State;
- Alias cycles are prohibited;
- Alias must identify its canonical Signal directly or resolve without ambiguity.

## 12.2 Mirror

Mirror reproduces a source Signal in another boundary for availability or transport purposes while retaining source provenance.

Rules:

- Mirror has a separate Identifier only when it represents a separately observable replication contract;
- source Owner remains authoritative;
- Mirror Owner owns replication health, not source truth;
- Timestamp retains source time and may add replication time;
- Quality becomes Disconnected or Bad when replication fails;
- consumers must be able to identify that the value is mirrored.

## 12.3 Calculated

Calculated relationship produces a Result from declared source Signals using a versioned formula or algorithm.

It MUST declare formula, source order, update trigger, history window, Units, precision, and Quality propagation.

## 12.4 Aggregated

Aggregated relationship combines multiple Signals into a summary such as total, average, minimum, maximum, count, distribution, collection, or status overview.

It MUST declare membership, window, missing-value policy, weighting, completeness, and output Quality.

## 12.5 Derived

Derived relationship produces a semantic State from one or more Signals, such as `MachineReady`, `TransferPermitted`, or `EnergyAvailable`.

It MUST declare a deterministic rule and MUST NOT become the source truth for its inputs.

## 12.6 Mapped

Mapped relationship transforms a Signal between domain boundaries, names, Types, Units, ranges, quality models, or protocols.

Examples include:

- Machine Sensor Signal to PLC Input sample;
- PLC Output Signal to Machine actuator-command Signal;
- canonical Signal to OPC UA Node value;
- external physical Input to canonical Machine observation.

Mapping MUST declare direction, conversion, synchronization boundary, failure behavior, Quality propagation, and ownership. Mapping does not grant direct access to internal state.

## 12.7 Relationship graph rules

- Relationship cycles are prohibited unless a separately approved feedback model defines delay and ownership boundaries.
- Calculation order MUST be deterministic.
- A relationship MUST NOT create a second authoritative writer for a Signal.
- Source and destination definition versions MUST be compatible.
- Archived source behavior MUST be declared.
- Every derived or mapped value must retain provenance.

---

# 13. Future OPC UA Mapping

The canonical model maps naturally to OPC UA concepts without depending on OPC UA.

## 13.1 Conceptual mapping

| Signal & Tag concept | Potential OPC UA concept |
|---|---|
| Identifier | Stable Node identifier or mapping key |
| Namespace path | Object hierarchy and BrowseName path |
| Display Name | DisplayName |
| Description | Description |
| Type | DataType |
| Current Value | Variable Value |
| Timestamp | SourceTimestamp and ServerTimestamp mapping |
| Quality | StatusCode mapping |
| Engineering Units | EngineeringUnits property |
| Access | AccessLevel and UserAccessLevel mapping |
| Range constraints | EURange or declared properties |
| Metadata | Properties and references |
| Signal Events | EventTypes or data-change notifications |
| Relationships | References between Nodes |
| Owner and Source | Custom properties or information-model references |

## 13.2 Mapping principles

- Canonical Signal Identifier remains authoritative.
- OPC UA Node identity MUST map reversibly to Signal Identifier.
- OPC UA namespace design MUST NOT redefine Digital2Real ownership.
- Status mapping MUST preserve Good, Bad, Unknown, Simulated, Disconnected, Fault, and Invalid distinctions as far as the protocol profile permits.
- Source Timestamp and ingestion/server Timestamp MUST remain distinguishable.
- Units and range metadata MUST be preserved.
- read and write permissions MUST not exceed canonical Access.
- Arrays, Structures, Enums, and Bitfields require declared compatible representations.
- unsupported metadata MUST remain available through a documented extension or mapping record.
- browse hierarchy may reflect Namespace without making path the immutable identity.

## 13.3 External OPC UA sources

When a future OPC UA source owns a physical value, Digital2Real MUST create a canonical externally sourced Signal with explicit Owner boundary or a Mirror/Mapping relationship. The adapter MUST NOT impersonate Machine or PLC ownership silently.

## 13.4 No implementation decision

SPEC-004 does not select an OPC UA stack, server topology, security configuration, transport, subscription policy, sampling rate, or historical-access implementation.

---

# 14. AI Compatibility

The Signal model supports AI consumption through governed, typed, timestamped, quality-aware, provenance-preserving data.

AI compatibility does not grant AI authority over source Signals.

## 14.1 Event history

AI may consume ordered Signal Created, Updated, Changed, Invalidated, Archived, and Quality Changed Events within its authorization scope.

Events provide causal context, but AI must consider source ordering and synchronization domains.

## 14.2 State history

State history provides time-indexed Signal samples and snapshots. AI consumers SHOULD receive:

- Signal definitions and versions;
- values and Types;
- Units;
- source and ingestion Timestamps;
- Quality;
- Owner and Source;
- scope and session context;
- relationship provenance.

## 14.3 Fault history

Fault analysis may combine Machine fault Signals, PLC Diagnostic Signals, System health Signals, Signal Quality changes, and Validation outcomes.

Modeled faults, learner-solution failures, Sensor-quality failures, and infrastructure failures MUST remain distinguishable.

## 14.4 Timing

AI may analyze Simulation, Machine, PLC, and system time only when time domains and synchronization mappings are provided.

It MUST NOT infer precise causal order from unsynchronized wall-clock timestamps.

## 14.5 Performance

AI may consume scan duration, Machine step duration, event volume, synchronization delay, throughput, cycle time, and Validation performance Signals.

Host performance data must remain distinct from logical control time and physical Machine time.

## 14.6 AI-produced Signals

AI outputs MUST use separate AI-owned or Analytics-owned Signals such as:

- anomaly score;
- predicted fault probability;
- explanation reference;
- recommended inspection;
- confidence;
- model identity and version.

AI-produced Signals MUST declare:

- source Signal set or query provenance;
- model identity and version;
- inference Timestamp;
- confidence or uncertainty;
- Quality;
- intended use;
- human-review requirement;
- expiration or staleness policy.

An AI recommendation MUST NOT be mapped directly to a physical actuator command without a separately approved authority and safety specification.

## 14.7 Privacy and minimization

User and Progress-related Signals require purpose limitation, authorization, retention, and minimization. AI services SHOULD receive only the Signal fields and history required for the approved task.

---

# 15. Example

This illustrative catalogue defines 25 Signals for one conveyor Lab attempt. It demonstrates the complete model; it does not prescribe storage, transport, runtime, UI, or a conveyor-based architecture.

## 15.1 Catalogue context

| Property | Value |
|---|---|
| Catalogue | `D2R-SIGNAL-CATALOGUE-CONVEYOR-DEMO` |
| Catalogue version | `1.0.0` |
| Lab | `D2R-LAB-CONVEYOR-DEMO` |
| Attempt scope | `ATTEMPT-EXAMPLE-001` |
| Machine | `Conveyor01` |
| PLC | `Controller01` |
| Simulation session | `Session01` |
| Canonical physical units | metre, metre/second, millisecond, percent |
| Previous Value policy | previous accepted sample |
| Default physical source Quality | Simulated |

Every Destination listed below has read-only access unless a participant-specific Access entry explicitly says otherwise.

## 15.2 Identity, meaning, and typing

| # | Identifier | Namespace | Display Name | Description | Category | Type | Units |
|---:|---|---|---|---|---|---|---|
| 1 | `sig.machine.conveyor01.entry_blocked` | `Machine/Conveyor01/Sensors/EntryBlocked` | Entry Sensor Blocked | True when committed Machine State places an eligible object in the entry photoelectric detection region. | Digital Input | Boolean | none |
| 2 | `sig.machine.conveyor01.exit_blocked` | `Machine/Conveyor01/Sensors/ExitBlocked` | Exit Sensor Blocked | True when an eligible object occupies the exit detection region. | Digital Input | Boolean | none |
| 3 | `sig.machine.conveyor01.motor_running` | `Machine/Conveyor01/Components/Motor01/Running` | Motor Running Feedback | Physical Running State of Motor01 after lifecycle, command acceptance, delay, Health, and Physics. | Digital Input | Boolean | none |
| 4 | `sig.machine.conveyor01.motor_speed` | `Machine/Conveyor01/Components/Motor01/ActualSpeed` | Motor Actual Speed | Committed physical speed of Motor01. | Analog Input | Double | metre/second |
| 5 | `sig.machine.conveyor01.box_position` | `Machine/Conveyor01/Objects/Box001/PathPosition` | Box Path Position | Committed path position of Box001 along the Conveyor reference path. | Analog Input | Double | metre |
| 6 | `sig.machine.conveyor01.estop_active` | `Machine/Conveyor01/Safety/EmergencyStopActive` | Emergency Stop Active | True when the Machine emergency-stop condition is physically active. | Digital Input | Boolean | none |
| 7 | `sig.machine.conveyor01.motor_fault` | `Machine/Conveyor01/Faults/Motor01/Active` | Motor Fault Active | Valid Machine observation indicating whether Motor01 has an active modeled fault. | Diagnostic Signal | Boolean | none |
| 8 | `sig.machine.conveyor01.lifecycle` | `Machine/Conveyor01/Lifecycle/State` | Machine Lifecycle | Current committed Machine lifecycle State. | Internal Variable | Enum | none |
| 9 | `sig.plc.controller01.motor_run_command` | `PLC/Controller01/Outputs/MotorRunCommand` | Motor Run Command | PLC request for Motor01 to run; it does not confirm physical motion. | Digital Output | Boolean | none |
| 10 | `sig.plc.controller01.speed_reference` | `PLC/Controller01/Outputs/SpeedReference` | Conveyor Speed Reference | PLC requested Conveyor speed before Machine acceptance and physical response. | Analog Output | Double | metre/second |
| 11 | `sig.plc.controller01.run_light_command` | `PLC/Controller01/Outputs/RunLightCommand` | Run Light Command | PLC request for the run indicator Light to illuminate. | Digital Output | Boolean | none |
| 12 | `sig.plc.controller01.sequence_state` | `PLC/Controller01/Internal/SequenceState` | Sequence State | Exposed controller-owned State of the conveyor control sequence. | Internal Variable | Enum | none |
| 13 | `sig.plc.controller01.transfer_count` | `PLC/Controller01/Internal/TransferCount` | Completed Transfer Count | Controller-owned count of completed transfer sequences. | Internal Variable | Integer | count |
| 14 | `sig.plc.controller01.cycle_count` | `PLC/Controller01/Diagnostics/CycleCount` | PLC Cycle Count | Number of completed PLC scan cycles in the current runtime session. | Diagnostic Signal | Integer | count |
| 15 | `sig.plc.controller01.last_scan_duration` | `PLC/Controller01/Diagnostics/LastScanDuration` | Last PLC Scan Duration | Host-observed duration of the latest completed PLC scan; not logical control time. | Diagnostic Signal | Double | millisecond |
| 16 | `sig.simulation.session01.logical_time` | `Simulation/Session01/Time/Logical` | Simulation Logical Time | Canonical logical time of Session01. | Simulation Signal | Timestamp | simulation-time |
| 17 | `sig.simulation.session01.step` | `Simulation/Session01/Execution/Step` | Simulation Step | Monotonic Simulation orchestration step identity. | Simulation Signal | Integer | count |
| 18 | `sig.simulation.session01.paused` | `Simulation/Session01/Execution/Paused` | Simulation Paused | True when Simulation progression is paused under the declared pause policy. | Simulation Signal | Boolean | none |
| 19 | `sig.validation.attempt01.safe_start_passed` | `Validation/Attempt01/Rules/SafeStart/Passed` | Safe Start Rule Passed | Validation Result for the mandatory safe-start rule. | Validation Signal | Boolean | none |
| 20 | `sig.validation.attempt01.score` | `Validation/Attempt01/Score/Current` | Current Validation Score | Current score produced by approved Validation rules for Attempt01. | Validation Signal | Float | percent |
| 21 | `sig.validation.attempt01.completed` | `Validation/Attempt01/Completion/Status` | Attempt Completed | True when all mandatory completion conditions are satisfied. | Validation Signal | Boolean | none |
| 22 | `sig.system.signal_layer.status` | `System/Health/SignalLayer/Status` | Signal Layer Status | Cross-system health State of the canonical Signal Layer. | System Signal | Enum | none |
| 23 | `sig.system.catalogue.version` | `System/SignalCatalogue/Version` | Signal Catalogue Version | Active canonical Signal catalogue version. | System Signal | String | none |
| 24 | `sig.academy.lab.active_objective` | `Academy/Lab/D2R-LAB-CONVEYOR-DEMO/ActiveObjective` | Active Learning Objective | Academy-owned identity of the currently focused learning objective. | Virtual Signal | String | none |
| 25 | `sig.user.attempt01.start_request` | `User/Learner01/Attempt01/Commands/StartRequest` | Learner Start Request | Learner-owned momentary request to start the Lab sequence; acceptance is determined by the consuming control boundary. | Virtual Signal | Boolean | none |

## 15.3 Ownership, routing, access, scope, and persistence

| # | Owner | Source | Destination | Access | Scope | Persistence | Update mode |
|---:|---|---|---|---|---|---|---|
| 1 | Machine | `Conveyor01.PE-ENTRY-01` | PLC, Validation, Visualization, Analytics, AI, OPC UA | Machine write; destinations read-only | Machine + session | attempt history | Simulation Driven |
| 2 | Machine | `Conveyor01.PE-EXIT-01` | PLC, Validation, Visualization, Analytics, AI, OPC UA | Machine write; destinations read-only | Machine + session | attempt history | Simulation Driven |
| 3 | Machine | `Conveyor01.MOTOR-01` | PLC, Validation, Visualization, Analytics, AI, OPC UA | Machine write; destinations read-only | Machine + session | attempt history | Simulation Driven |
| 4 | Machine | `Conveyor01.MOTOR-01` | PLC, Validation, Visualization, Analytics, AI, OPC UA | Machine write; destinations read-only | Machine + session | attempt history | Simulation Driven |
| 5 | Machine | `Conveyor01.BOX-001` | Validation, Visualization, Analytics, AI, OPC UA | Machine write; destinations read-only | Machine + session | attempt history | Simulation Driven |
| 6 | Machine | `Conveyor01.ESTOP-01` | PLC, Validation, Visualization, Analytics, AI, OPC UA | Machine write; destinations read-only | Machine + session | archival for safety evidence | Event + Simulation Driven |
| 7 | Machine | `Conveyor01.MOTOR-01.FaultModel` | PLC, Validation, Visualization, Analytics, AI, OPC UA | Machine write; destinations read-only | Machine + session | attempt history | Event Driven |
| 8 | Machine | `Conveyor01.Lifecycle` | PLC, Validation, Visualization, Analytics, AI, OPC UA | Machine write; destinations read-only | Machine + session | attempt history | Event Driven |
| 9 | PLC | `Controller01.OutputImage.MotorRun` | Machine, Validation, Visualization, Analytics, AI, OPC UA | PLC write; destinations read-only | PLC + session | attempt history | Scan Driven at Output Update |
| 10 | PLC | `Controller01.OutputImage.SpeedReference` | Machine, Validation, Visualization, Analytics, AI, OPC UA | PLC write; destinations read-only | PLC + session | attempt history | Scan Driven at Output Update |
| 11 | PLC | `Controller01.OutputImage.RunLight` | Machine, Validation, Visualization, Analytics, OPC UA | PLC write; destinations read-only | PLC + session | attempt history | Scan Driven at Output Update |
| 12 | PLC | `Controller01.Program.TransferSequence` | Validation, Visualization, Analytics, AI, OPC UA | PLC write; destinations read-only | PLC + session | attempt history | Scan Driven at Program commit |
| 13 | PLC | `Controller01.Counter.CompletedTransfers` | Validation, Visualization, Analytics, AI, OPC UA | PLC write; destinations read-only | PLC + session | attempt history | Scan Driven |
| 14 | PLC | `Controller01.Runtime.Diagnostics` | Validation, Visualization, Analytics, AI, OPC UA | PLC write; destinations read-only | PLC runtime session | session history | Scan Driven at Diagnostics |
| 15 | PLC | `Controller01.Runtime.Performance` | Analytics, AI, System Diagnostics | PLC write; destinations read-only | PLC runtime session | session history | Scan Driven at Diagnostics |
| 16 | Simulation | `Session01.Clock` | Machine, PLC orchestration, Validation, Visualization, Analytics, AI | Simulation write; destinations read-only | Simulation session | attempt history | Simulation Driven |
| 17 | Simulation | `Session01.Orchestrator` | Machine, PLC orchestration, Validation, Visualization, Analytics | Simulation write; destinations read-only | Simulation session | attempt history | Simulation Driven |
| 18 | Simulation | `Session01.Lifecycle` | Machine, PLC orchestration, Validation, Visualization | Simulation write; destinations read-only | Simulation session | attempt history | Event Driven |
| 19 | Validation | `Attempt01.Rule.SafeStart` | Academy, Visualization, Analytics, AI | Validation write; destinations read-only | Lab attempt | archival | Event + Calculated |
| 20 | Validation | `Attempt01.Scoring` | Academy, User, Visualization, Analytics, AI | Validation write; destinations read-only | Lab attempt | archival | Calculated |
| 21 | Validation | `Attempt01.Completion` | Academy, User, Visualization, Analytics, AI | Validation write; destinations read-only | Lab attempt | archival | Event + Calculated |
| 22 | System | `SignalLayer.Health` | Visualization, Analytics, AI, Operations | System write; destinations read-only | system | historical | Event Driven |
| 23 | System | `SignalCatalogue.Registry` | All subsystems | System write; all read-only | system | archival | Event Driven on catalogue activation |
| 24 | Academy | `LabContext.ActiveObjective` | User, Validation, Visualization, Analytics, AI | Academy write; destinations read-only | Lab attempt | attempt history | Event Driven |
| 25 | User | `Learner01.Input.StartRequest` | PLC command mapping, Validation, Visualization | User submits; Owner read-write through command boundary; destinations read-only | learner + Lab attempt | attempt history | Event Driven |

## 15.4 Defaults, illustrative current state, timestamp, and quality

All Timestamps below use Simulation logical time unless marked as system event time. Values are illustrative initial or early-attempt values.

| # | Default Value | Previous Value | Current Value | Timestamp | Quality |
|---:|---|---|---|---|---|
| 1 | false | false | true | 1.240 s | Simulated |
| 2 | false | false | false | 1.240 s | Simulated |
| 3 | false | false | true | 1.240 s | Simulated |
| 4 | 0.0 | 0.46 | 0.48 | 1.240 s | Simulated |
| 5 | 0.0 | 0.19 | 0.20 | 1.240 s | Simulated |
| 6 | false | false | false | 1.240 s | Simulated |
| 7 | false | false | false | 1.240 s | Simulated |
| 8 | `Stopped` | `Stopped` | `Running` | 0.100 s | Simulated |
| 9 | false | false | true | PLC cycle 63 at 1.220 s | Good |
| 10 | 0.0 | 0.5 | 0.5 | PLC cycle 63 at 1.220 s | Good |
| 11 | false | false | true | PLC cycle 63 at 1.220 s | Good |
| 12 | `Idle` | `Starting` | `Transporting` | PLC cycle 63 at 1.220 s | Good |
| 13 | 0 | 0 | 0 | PLC cycle 63 at 1.220 s | Good |
| 14 | 0 | 62 | 63 | PLC cycle 63 at 1.220 s | Good |
| 15 | 0.0 | 0.82 | 0.79 | system event time 2026-07-20T10:00:01.240Z | Good |
| 16 | 0 s | 1.220 s | 1.240 s | 1.240 s | Simulated |
| 17 | 0 | 61 | 62 | 1.240 s | Simulated |
| 18 | false | false | false | 1.240 s | Simulated |
| 19 | false | false | true | 1.240 s | Simulated |
| 20 | 0.0 | 20.0 | 40.0 | 1.240 s | Simulated |
| 21 | false | false | false | 1.240 s | Simulated |
| 22 | `Unknown` | `Starting` | `Healthy` | system event time 2026-07-20T10:00:00Z | Good |
| 23 | empty string | `1.0.0` | `1.0.0` | system event time 2026-07-20T10:00:00Z | Good |
| 24 | empty string | `OBJ-SAFE-START` | `OBJ-TRANSPORT` | 1.240 s | Simulated |
| 25 | false | true | false | 0.140 s | Simulated |

## 15.5 Metadata and constraints

| # | Metadata |
|---:|---|
| 1 | Definition `1.0`; boolean equality; source region 0.20–0.25 m; no deadband; maps to PLC Input `EntryBlocked`; objective `OBJ-TRANSPORT`. |
| 2 | Definition `1.0`; source region 2.75–2.80 m; maps to PLC Input `ExitBlocked`; objective `OBJ-TRANSPORT`. |
| 3 | Definition `1.0`; physical feedback only; maps to PLC Input `MotorRunning`; must not alias Signal 9. |
| 4 | Definition `1.0`; range 0.0–0.5 m/s; resolution 0.01 m/s; change tolerance 0.005 m/s; physical feedback. |
| 5 | Definition `1.0`; range 0.0–3.0 m; resolution 0.001 m; object `BOX-001`; privacy none. |
| 6 | Definition `1.0`; safety evidence; changes require archival Event; physical Emergency observation. |
| 7 | Definition `1.0`; Good `true` means a valid active-fault observation; fault code is a related Signal in an extended catalogue. |
| 8 | Definition `1.0`; Enum members `PowerOff`, `Resetting`, `Stopped`, `Running`, `Paused`, `Emergency`, `Fault`, `Maintenance`; ordered only by lifecycle rules. |
| 9 | Definition `1.0`; safe/default false; command mapping target `Motor01.RunRequest`; physical Result Signal 3. |
| 10 | Definition `1.0`; allowed range 0.0–0.5 m/s; out-of-range update rejected; target `Motor01.SpeedRequest`; feedback Signal 4. |
| 11 | Definition `1.0`; safe/default false; target `RunLight01.Command`; no physical feedback in this catalogue. |
| 12 | Definition `1.0`; Enum members `Idle`, `Starting`, `Transporting`, `Complete`, `Faulted`; Program-owned; no external writes. |
| 13 | Definition `1.0`; non-negative integer; saturation policy deferred to PLC numeric profile; related completion Event. |
| 14 | Definition `1.0`; non-negative monotonic Integer per PLC session; Reset only through new session. |
| 15 | Definition `1.0`; host performance only; must not drive PLC logical behavior; source time is system event time. |
| 16 | Definition `1.0`; monotonic Simulation Timestamp within Session01; authoritative time domain for orchestration. |
| 17 | Definition `1.0`; monotonic non-negative Integer; one increment per completed orchestration step. |
| 18 | Definition `1.0`; pause policy reference `SIM-PAUSE-001`; not equivalent to Machine Stopped. |
| 19 | Definition `1.0`; sources Signals 1, 3, 6, 7, 9; rule version `SAFE-START-1.0`; restrictive Quality propagation. |
| 20 | Definition `1.0`; range 0–100 percent; source Validation rule Results; formula version `SCORE-1.0`; manual writes prohibited. |
| 21 | Definition `1.0`; sources mandatory rule outcomes; formula `all-required-pass`; irreversible within one finalized attempt unless Validation reopens it explicitly. |
| 22 | Definition `1.0`; Enum `Unknown`, `Starting`, `Healthy`, `Degraded`, `Faulted`, `Unavailable`; infrastructure Diagnostic, not Machine Fault. |
| 23 | Definition `1.0`; semantic version String; archival; update only on approved catalogue activation. |
| 24 | Definition `1.0`; stable objective Identifier String; must resolve to SPEC-001 objective; empty only before objective selection. |
| 25 | Definition `1.0`; momentary request; accepted through User command boundary; not a PLC Output; correlation identity required. |

## 15.6 Declared relationships

| Relationship | Type | Source | Destination | Rule |
|---|---|---|---|---|
| `REL-ENTRY-TO-PLC` | Mapped | Signal 1 | PLC Input image entry tag | Sample at a later PLC Input Update; preserve Quality and source Timestamp. |
| `REL-EXIT-TO-PLC` | Mapped | Signal 2 | PLC Input image exit tag | Sample at a later PLC Input Update. |
| `REL-MOTOR-CMD` | Mapped | Signal 9 | Machine actuator-command image | Apply only at declared PLC–Machine synchronization boundary. |
| `REL-SPEED-CMD` | Mapped | Signal 10 | Machine actuator-command image | Preserve units; Machine may reject or constrain the request. |
| `REL-START-REQUEST` | Mapped | Signal 25 | PLC Input request tag | User request sampled through command mapping; does not write PLC Memory directly. |
| `REL-SAFE-START` | Calculated | Signals 1, 3, 6, 7, 9 | Signal 19 | Rule `SAFE-START-1.0`; evaluate ordered evidence at declared Validation boundary. |
| `REL-SCORE` | Aggregated | Validation rule Signals | Signal 20 | Formula `SCORE-1.0`; report completeness and Quality. |
| `REL-COMPLETION` | Derived | Mandatory Validation Signals | Signal 21 | True only when all mandatory conditions pass. |

## 15.7 Catalogue completeness

Each of the 25 Signals defines:

- Identifier and Namespace;
- Display Name and Description;
- Type and Category;
- Owner, Source, and Destination;
- participant Access;
- Scope and Persistence;
- Timestamp and Quality;
- Engineering Units;
- Default, Previous, and Current Values;
- Metadata;
- update mode;
- relationships when applicable.

The illustrative values are not runtime requirements.

---

# 16. UML

The following conceptual UML-style diagram defines domain relationships. It does not prescribe software classes, files, or database tables.

```text
┌──────────────────────────┐
│     SignalCatalogue      │
│ id                       │
│ version                  │
│ lifecycle                │
└────────────┬─────────────┘
             │ contains 1..*
             ▼
┌──────────────────────────┐       owns 1       ┌──────────────────────────┐
│    SignalDefinition      │────────────────────>│          Owner           │
│ identifier               │                     │ domain                   │
│ namespace                │                     │ authority                │
│ displayName              │                     └──────────────────────────┘
│ description              │
│ category                 │       produced by 1 ┌──────────────────────────┐
│ type                     │────────────────────>│          Source          │
│ access                   │                     │ producer identity        │
│ scope                    │                     └──────────────────────────┘
│ persistence              │
│ units                    │       consumed by * ┌──────────────────────────┐
│ defaultValue             │────────────────────>│       Destination        │
│ metadata                 │                     │ consumer identity        │
└────────────┬─────────────┘                     └──────────────────────────┘
             │ has 0..1 active
             ▼
┌──────────────────────────┐       references 1  ┌──────────────────────────┐
│       SignalState        │────────────────────>│    SignalDefinition      │
│ current                  │                     └──────────────────────────┘
│ previous                 │
│ timestamp                │       has 1         ┌──────────────────────────┐
│ quality                  │────────────────────>│         Quality          │
│ sourceSequence           │                     │ primaryState             │
└────────────┬─────────────┘                     │ detail                   │
             │ emits 0..*                        └──────────────────────────┘
             ▼
┌──────────────────────────┐
│       SignalEvent        │
│ eventType                │
│ eventSequence            │
│ priorStateRef            │
│ resultingStateRef        │
└──────────────────────────┘

┌──────────────────────────┐      source 1..*     ┌──────────────────────────┐
│    SignalRelationship    │─────────────────────>│    SignalDefinition      │
│ id                       │                      └──────────────────────────┘
│ type                     │
│ transformation           │      destination 1   ┌──────────────────────────┐
│ qualityPropagation       │─────────────────────>│    SignalDefinition      │
│ version                  │                      └──────────────────────────┘
└──────────────────────────┘

SignalRelationship specializes:
  Alias | Mirror | Calculated | Aggregated | Derived | Mapped

SignalDefinition has exactly one canonical DataType.
SignalDefinition has exactly one Owner and one declared Source.
SignalDefinition has zero or more Destinations.
Tag resolves to exactly one SignalDefinition.
NamespacePath addresses at most one active SignalDefinition per catalogue version.
```

## 16.1 Relationship rules

- A Catalogue contains one or more Signal Definitions.
- A Signal Definition has exactly one Owner and one declared Source.
- A Signal Definition may declare multiple Destinations with participant-specific Access.
- One active runtime instance of a Signal has one Current State and one Previous accepted State.
- Every State references the compatible Signal Definition version.
- Each accepted State has one primary Quality.
- State transitions may emit immutable Signal Events.
- Relationships connect definitions while preserving identity and ownership.
- A Tag and Namespace path resolve to a canonical Signal Definition; neither owns an independent value.
- A Derived, Calculated, Aggregated, or Mapped destination has its own Owner and provenance.

---

# 17. Architectural Decisions

## AD-001 — The Signal model is the exclusive subsystem boundary

**Decision:** Subsystems exchange information only through conforming Signals, catalogues, snapshots, Events, and relationships.

**Why:** Direct internal-state access destroys independence, ownership, replay, and replaceability.

## AD-002 — Every Signal has one authoritative Owner

**Decision:** Multiple authoritative writers for one Identifier are prohibited.

**Why:** A Signal cannot be a Single Source of Truth when ownership is ambiguous.

## AD-003 — Signal identity is separate from namespace and display

**Decision:** Identifier is immutable; Namespace and Display Name support discovery and presentation.

**Why:** Refactoring a hierarchy or translating a label must not break historical identity.

## AD-004 — Tags are references, not duplicate values

**Decision:** A Tag resolves to one canonical Signal.

**Why:** Multiple named references are useful, but multiple value stores create conflicting truth.

## AD-005 — Definition and sample are separate

**Decision:** Stable Signal meaning is versioned independently from observed Signal samples.

**Why:** High-frequency values should not duplicate definitions, and historical samples must remain interpretable.

## AD-006 — Value, Timestamp, and Quality update atomically

**Decision:** Consumers observe one complete value state.

**Why:** A new value with old time or Quality is semantically inconsistent.

## AD-007 — Quality is independent from value

**Decision:** Good, Bad, Unknown, Simulated, Disconnected, Fault, and Invalid are not encoded in ordinary values.

**Why:** `false`, zero, empty, and valid fault indications must not be confused with unavailable data.

## AD-008 — Simulated data is explicitly identified

**Decision:** Valid Simulation observations use Simulated Quality unless a profile defines a more detailed compatible status.

**Why:** Academy needs valid simulated evidence without presenting it as physical measurement.

## AD-009 — Commands and feedback are separate Signals

**Decision:** PLC Output commands and Machine physical feedback have different Identifiers and Owners.

**Why:** A request does not prove that an actuator responded.

## AD-010 — Machine owns Sensors

**Decision:** Machine-owned Sensor Signals derive from committed Machine State.

**Why:** The PLC observes the Machine; it does not own physical truth.

## AD-011 — PLC owns Outputs

**Decision:** PLC Output Signals are controller-owned requests published at the PLC Output boundary.

**Why:** Command intent originates in controller execution even when the Machine may reject it.

## AD-012 — Validation owns scores and outcomes

**Decision:** Validation Results are separate Validation-owned Signals.

**Why:** Assessment must observe evidence without writing the behavior being assessed.

## AD-013 — Simulation owns time

**Decision:** Cross-runtime Simulation logical time and orchestration step are Simulation-owned Signals.

**Why:** Neither PLC nor Machine may silently control shared time progression.

## AD-014 — System owns cross-platform Diagnostics

**Decision:** System health Signals are separate from Machine faults, PLC faults, and learner failures.

**Why:** Infrastructure failure must not be mistaken for industrial behavior.

## AD-015 — Relationships preserve provenance

**Decision:** Alias, Mirror, Calculated, Aggregated, Derived, and Mapped relationships declare sources, transformations, ownership, and Quality propagation.

**Why:** Reuse and integration must not hide where values came from.

## AD-016 — Aliases do not own State

**Decision:** Alias is another address for the same Signal.

**Why:** Independent Alias State would be duplication.

## AD-017 — Mirrors expose replication health

**Decision:** A Mirror preserves source time and Quality while adding replication status.

**Why:** Consumers must distinguish source truth from transport freshness.

## AD-018 — Calculations are first-class Signals

**Decision:** Governed calculations publish separately identified, owned, typed, unit-aware Results.

**Why:** Derived information requires provenance and cannot overwrite sources.

## AD-019 — Timestamps identify time domain

**Decision:** A Timestamp without its logical or physical time domain is incomplete.

**Why:** PLC, Machine, Simulation, external, and system clocks cannot be ordered safely without synchronization.

## AD-020 — Events do not replace State

**Decision:** Events record transitions; Current State remains authoritative.

**Why:** Events may be filtered, delayed, or replayed, while consumers still need a consistent current snapshot.

## AD-021 — Namespace roots express domain ownership

**Decision:** Machine, PLC, Simulation, Validation, System, Academy, and User are canonical roots.

**Why:** Predictable discovery reinforces separation and responsibility.

## AD-022 — OPC UA is an adapter, not the canonical model

**Decision:** Future OPC UA Nodes map from Signals.

**Why:** Digital2Real must remain vendor and protocol neutral.

## AD-023 — AI is a governed consumer and separate producer

**Decision:** AI consumes authorized Signals and publishes separately owned inference Signals.

**Why:** Probabilistic output must not silently become authoritative control or physical State.

## AD-024 — Update ordering is deterministic within ownership boundaries

**Decision:** Priority, time, sequence, and stable keys resolve candidate updates.

**Why:** Equivalent input histories must produce equivalent Signal histories.

## AD-025 — Archived Signals remain historically resolvable

**Decision:** Archival stops normal updates but preserves identity, definition, history, and replacement information.

**Why:** Replays, Progress, Validation, and long-term analysis depend on historical meaning.

## AD-026 — No transport or storage is selected

**Decision:** SPEC-004 defines semantics only.

**Why:** A protocol or database choice is not required to establish canonical information ownership.

---

# Summary

SPEC-004 defines the Signal & Tag Model as the exclusive, vendor-neutral information boundary between Digital2Real subsystems.

Every Signal has:

- immutable identity;
- human-readable meaning;
- canonical Type and Units;
- exactly one authoritative Owner and Source;
- declared Destinations and Access;
- Scope and Persistence;
- atomic Current Value, Previous Value, Timestamp, and Quality;
- governed Metadata, lifecycle, Events, and relationships.

Machine owns Sensors. PLC owns Outputs. Validation owns scores and outcomes. Simulation owns shared logical time. System owns cross-platform Diagnostics. Consumers never gain authority by reading, storing, displaying, mapping, or transporting a Signal.

No subsystem may directly access another subsystem’s internal state. Commands, observations, calculations, Diagnostics, Validation Results, visualization, analytics, future OPC UA, Digital Twins, and AI all communicate through canonical Signals.

# Dependencies

SPEC-004 depends conceptually on:

- **SPEC-001 Laboratory Model:** Lab identity, Variables, ownership, Challenge, Validation, and Progress context;
- **SPEC-002 PLC Runtime Model:** PLC Input sampling, Output publication, controller Memory exposure, scan time, and Diagnostics boundaries;
- **SPEC-003 Machine Runtime Model:** actuator-command consumption, committed Machine State, Sensor-image publication, Machine Events, and faults.

Future executable conformance requires approved specifications for:

- canonical numeric widths, precision, conversion, and exceptional values;
- engineering unit identifiers and conversion rules;
- PLC–Machine–Simulation synchronization;
- Signal catalogue schema and compatibility validation;
- snapshot, event-history, and replay records;
- authorization, privacy, and access enforcement;
- persistence and retention profiles;
- relationship calculation and scheduling;
- external transport adapters;
- OPC UA information-model mapping;
- AI provenance, inference, and safety governance.

No implementation, protocol, database, broker, framework, or vendor dependency is selected by SPEC-004.

# Risks

| Risk | Consequence | Required response |
|---|---|---|
| Subsystems bypass the Signal Layer | Hidden coupling and conflicting truth | Enforce contract-only integration boundaries |
| Multiple Owners publish one Identifier | Non-deterministic value authority | Reject the catalogue before execution |
| Commands and feedback share one Signal | Requested and physical State become indistinguishable | Require separate PLC and Machine Signals |
| Namespace path is treated as immutable identity | Refactoring breaks history and integrations | Use stable Identifiers and versioned Aliases |
| Quality is ignored | Stale, disconnected, or invalid values appear trustworthy | Require quality-aware consumers and mappings |
| Time domains are mixed | Causal and timing analysis becomes incorrect | Require time-domain identity and synchronization |
| Implicit Type or Unit conversion occurs | Values change meaning silently | Require explicit Mapped or Calculated relationships |
| Derived Signals lose provenance | AI and Validation cannot explain Results | Preserve source references and rule versions |
| Mirrors look authoritative | Replication delay is mistaken for source truth | Expose source and replication timestamps and Quality |
| Excessive history is retained | Cost, privacy, and performance risks increase | Define persistence and retention by Signal purpose |
| Too little history is retained | Replay and Validation evidence are incomplete | Identify mandatory attempt and archival Signals |
| User read-write access bypasses Owner validation | Unsafe or invalid updates enter the system | Route writes through Owner command boundaries |
| OPC UA concepts redefine canonical semantics | Protocol choice creates lock-in | Treat OPC UA as a reversible adapter |
| AI output overwrites source Signals | Probabilistic inference becomes false authority | Publish separate AI-owned Signals |
| Catalogue changes are not versioned | Historical samples lose meaning | Enforce definition compatibility and archival rules |
| High-frequency Signal Events overwhelm consumers | Observation disrupts platform operation | Define sampling, deadband, batching, and backpressure profiles |

# Open Questions

1. What exact canonical widths and ranges define Integer, Float, and Double?
2. Which unit vocabulary and dimensional-analysis standard should Digital2Real adopt?
3. Does primary Quality require a separate `Good-Simulated` hierarchy, or is Simulated a complete primary state as specified?
4. What is the default Quality of an initialized virtual command Signal?
5. Which Signal categories and metadata fields are mandatory for the first Academy runtime profile?
6. Should Previous Value always mean previous accepted sample, as recommended, or previous distinct value for selected Signals?
7. Which Signals require every sample, change-only history, periodic snapshots, or no history?
8. What are the maximum String, Array, Structure, and Bitfield sizes in the initial profile?
9. How are atomic snapshots defined across multiple Owners and time domains?
10. What common orchestration sequence orders PLC, Machine, Simulation, and Validation Events?
11. Which update deadband and sampling policies are allowed without changing Validation evidence?
12. Can a consumer discover Signals outside its declared Destination through catalogue browsing?
13. Which authorization roles may submit User, instructor, maintenance, and scenario command Signals?
14. What retention and privacy rules apply to User, Progress, and AI-consumed Signal history?
15. Which metadata is permitted to reach external OPC UA or AI consumers?
16. How should incompatible Enum or Structure evolution be migrated?
17. Which cross-owner relationship engine owns Mapped and Calculated updates?
18. What failure policy applies when the Signal Layer cannot publish or persist a required update?
19. Are physical, simulated, and replayed Signals separate definitions or execution-profile variations with different Quality and provenance?
20. Which 25-signal catalogue fields should become the minimum authoring template for the first Lab?
