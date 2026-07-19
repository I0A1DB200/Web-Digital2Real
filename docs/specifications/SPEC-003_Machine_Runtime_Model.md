# SPEC-003 — Digital2Real Machine Runtime Model

**Status:** Draft functional specification
**Specification owner:** Digital2Real Academy
**Scope:** Canonical industrial Machine simulation semantics
**Implementation status:** Not implemented

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** express requirement strength within this specification.

---

# 1. Purpose

The Digital2Real Machine Runtime is the canonical behavioral model for industrial Machines used throughout Academy Labs. It defines how a Machine receives actuator commands, updates Components and deterministic physical state, produces Events, derives Sensor observations, and exposes those observations to an external controller.

A Machine Runtime is required because control logic and Machine behavior are different domains. A controller decides what it requests. A Machine determines what physically happens. A motor command does not directly create a product-detected signal; it influences a motor, motion changes the Machine, an object reaches a Sensor region, and the Sensor then observes that state.

The canonical interaction is:

```text
PLC publishes Output commands
            ↓
Machine accepts actuator commands
            ↓
Machine advances Components and Physics
            ↓
Machine updates authoritative State
            ↓
Machine produces Events
            ↓
Sensors observe Machine State
            ↓
Machine publishes a Sensor image
            ↓
PLC samples that Sensor image during a later Input Update
```

## 1.1 Why the Machine Runtime exists

The runtime exists to:

- provide one coherent behavioral contract for Academy Machines;
- separate physical and process behavior from control logic;
- make Sensor values consequences of Machine State;
- support repeatable Lab execution and Validation;
- allow simple mechanisms and complex industrial systems to use the same core concepts;
- support fault injection, diagnosis, replay, and learning evidence;
- permit future visualization, Digital Twins, and physical integrations without changing canonical Machine meaning.

## 1.2 Mandatory independence from PLC implementation

The Machine Runtime MUST remain independent from the PLC Runtime.

The Machine Runtime:

- MUST NOT execute PLC Programs or Instructions;
- MUST NOT inspect PLC Memory, Timers, Counters, scan internals, or Program structure;
- MUST NOT infer commands from a UI;
- MUST accept only a declared actuator-command image and synchronization context;
- MUST derive Sensors only from Machine-owned State, Component State, Physics, Faults, and environment state;
- MUST publish Sensor observations without writing PLC Inputs directly.

The PLC Runtime:

- controls its Output image;
- does not own Machine Components or physical State;
- observes only the published Sensor image during a later Input Update;
- does not advance Machine Physics.

An orchestration boundary may coordinate both runtimes, but neither runtime may depend on the internal implementation of the other.

## 1.3 Why independence enables scalability

Independence allows:

- one Machine to be controlled by different compatible controller runtimes;
- one PLC solution to be evaluated against different Machine scenarios;
- Machine models to grow in physical detail without changing Program semantics;
- control logic to evolve without embedding physical simulation rules;
- headless Machine Validation;
- independent replay of command histories;
- replacement of a simulation with a Digital Twin or physical adapter through an explicit contract;
- multiple Machines and controllers to be orchestrated without becoming one coupled runtime.

## 1.4 Scope boundary

This specification defines behavior, ownership, state transitions, and synchronization meaning. It does not define:

- implementation code;
- numerical solver technology;
- UI or 3D rendering;
- PLC execution;
- a Ladder editor;
- transport protocols;
- storage schemas;
- one mandatory industrial Machine type.

---

# 2. Runtime Architecture

The logical Machine Runtime architecture is:

```text
Machine Runtime
      ↓
Components
      ↓
Physics
      ↓
State
      ↓
Events
      ↓
Sensors
```

The downward flow expresses the primary update direction. Diagnostics and Validation may observe every layer without becoming authoritative writers.

## 2.1 Machine Runtime

The Machine Runtime owns the lifecycle and deterministic update cycle of one Machine model. It coordinates command acceptance, Component evaluation, Physics advancement, State commitment, Event generation, Sensor evaluation, fault handling, and publication.

It MUST define:

- Machine identity and model version;
- lifecycle state;
- Component graph;
- deterministic update order;
- logical time and step progression;
- command-image acceptance rules;
- state commitment boundaries;
- Event ordering;
- Sensor publication boundaries;
- fault and Reset policies.

## 2.2 Components

Components are independently identified Machine elements with State, Parameters, Connections, lifecycle, and behavior contracts.

Components specialize generic capabilities such as actuation, sensing, containment, transport, transformation, energy supply, safety response, and communication. The runtime coordinates Components through declared interfaces and Connections rather than hardcoded type checks.

## 2.3 Physics

Physics advances the Machine’s modeled physical and process State using logical time, Component behavior, current conditions, accepted actuator commands, objects, and faults.

Physics may be simple, such as a fixed actuation delay, or complex, such as coupled motion, flow, pressure, and thermal behavior. The canonical contract is deterministic state transition, not a prescribed solver.

## 2.4 State

State is the authoritative description of the Machine at a committed step boundary. It includes lifecycle, Component State, physical quantities, objects, faults, environment conditions, and connection state.

The runtime MUST distinguish current committed State from a working next State so observers never see a partially updated Machine.

## 2.5 Events

Events are ordered, immutable observations of significant Machine occurrences and transitions. They support Diagnostics, Validation, learning feedback, replay, and future visualization.

Events do not replace authoritative State. Event delivery MUST NOT change physical outcomes.

## 2.6 Sensors

Sensors observe committed Machine State through declared measurement models. They produce Sensor observations with value, quality, and timestamp.

Sensors MUST NOT read PLC Outputs. A Sensor may observe an actuator’s physical State, but not the controller command that requested it.

## 2.7 External boundaries

The Machine Runtime has four conceptual external boundaries:

1. **Command provider:** supplies a complete actuator-command image.
2. **Environment provider:** supplies declared disturbances or boundary conditions.
3. **Sensor consumer:** receives published Sensor images.
4. **Machine observer:** receives Events, State snapshots, faults, and Diagnostics.

These roles may be hosted together, but their authority remains separate.

## 2.8 Canonical update cycle

One Machine update step is:

```text
Accept command image
        ↓
Resolve Component commands and constraints
        ↓
Advance Physics by declared logical interval
        ↓
Commit Component and Machine State
        ↓
Generate ordered Events
        ↓
Evaluate Sensors from committed State
        ↓
Publish complete Sensor image
        ↓
Finalize Machine Diagnostics
```

The Sensor image resulting from a Machine step is available to a PLC only at a subsequent PLC Input Update selected by the external synchronization contract.

---

# 3. Component Model

Every Machine is composed of Components. A Component represents an identifiable physical, process, safety, sensing, or support element participating in Machine behavior.

## 3.1 General Component contract

Every Component MUST declare:

- stable Identifier;
- Component Type;
- capabilities;
- Current State;
- Previous State;
- Health;
- Parameters;
- Connections;
- Lifecycle;
- accepted commands when actuated;
- produced observations when sensing;
- physical participation;
- fault responses;
- Reset behavior;
- deterministic update contract.

## 3.2 Component capabilities

Capabilities describe what a Component can do without requiring the Machine Runtime to know every Component Type.

Canonical capability categories MAY include:

- `actuator`;
- `sensor`;
- `transport`;
- `storage`;
- `flow-control`;
- `motion`;
- `thermal`;
- `pressure`;
- `transformation`;
- `safety`;
- `energy-source`;
- `communication-endpoint`;
- `object-interface`.

A Component may expose multiple capabilities. Capability interfaces MUST be versioned and deterministic.

## 3.3 Example Component Types

The model supports, but is not limited to:

| Component Type | Typical capabilities |
|---|---|
| Motor | actuator, motion, energy conversion |
| Cylinder | actuator, linear motion |
| Valve | actuator, flow-control |
| Tank | storage, level, pressure or thermal state |
| Pump | actuator, flow, pressure |
| Robot | multi-axis motion, object-interface |
| Axis | controlled motion, position, speed |
| Encoder | sensor, position or speed observation |
| Conveyor | transport, object-interface |
| Camera | sensor, vision observation |
| Light | actuator, illumination or indication |
| Sensor | observation of declared Machine State |
| Emergency Stop | safety input, lifecycle influence |
| Power Supply | energy-source, health, availability |
| Actuator | generic command-to-physical-response element |

These examples do not form a closed enumeration.

## 3.4 Extending Component Types

New Component Types MUST be addable without modifying the canonical Machine Runtime.

A new type conforms by declaring:

- one or more known capability contracts, or a separately versioned new capability;
- its Parameters and State schema;
- accepted command contract;
- physical update contract;
- connection requirements;
- Sensor or Event outputs;
- fault, lifecycle, and Reset behavior;
- deterministic ordering dependencies.

The runtime coordinates registered capabilities and declared dependencies. It MUST NOT require a central conditional branch for every industrial device type.

## 3.5 Component identity

Component Identifiers MUST be unique within a Machine model and stable across executions of the same model version.

Display name, physical label, location, and external address MAY change without changing canonical identity when their engineering meaning is unchanged.

## 3.6 Component hierarchy

A Component MAY contain child Components. A composite Component must define:

- ownership of child lifecycle;
- command distribution;
- State aggregation;
- fault propagation;
- connection exposure;
- update ordering.

Hierarchy MUST NOT create ambiguous multiple ownership. Every child has exactly one containing parent or the Machine root.

## 3.7 Connections

Connections define interactions between Components. Connection categories MAY include:

- mechanical;
- electrical-power;
- fluid;
- pneumatic;
- hydraulic;
- thermal;
- material-flow;
- signal-observation;
- spatial;
- logical safety dependency.

Each Connection MUST identify endpoints, directionality, capacity or constraints when relevant, and failure behavior.

Connections do not imply controller wiring. Controller command and Sensor publication mappings belong to external contracts.

---

# 4. Component State

Every Component owns one committed Current State and retains the Previous State needed for transition detection and deterministic evaluation.

## 4.1 Identifier

The Identifier is the stable reference used by Machine State, Connections, Events, faults, Sensors, and Validation.

It MUST NOT depend on array position, display order, or UI hierarchy.

## 4.2 Type

Type identifies the Component’s behavioral definition and version. A Type MUST declare its supported capabilities and State contract.

Changing Type semantics requires a model version change. A runtime MUST reject unsupported Types rather than silently substituting behavior.

## 4.3 Current State

Current State is the authoritative committed Component condition at the latest Machine step boundary.

It MAY contain:

- operating mode;
- physical values;
- actuator response;
- object occupancy;
- energy availability;
- active interlocks;
- local faults;
- quality indicators.

Current State MUST be internally consistent at publication.

## 4.4 Previous State

Previous State is the preceding committed State or the explicitly required subset of it. It supports:

- transition detection;
- edge-based Events;
- movement integration;
- fault onset and recovery;
- Sensor hysteresis;
- Validation evidence.

Previous State MUST be updated only at the State commit boundary.

## 4.5 Health

Health represents the Component’s ability to perform its intended behavior. The minimum canonical Health states are:

- `healthy`;
- `degraded`;
- `faulted`;
- `unavailable`;
- `unknown`.

Health is not identical to operating State. A stopped motor may be healthy; a running motor may be degraded.

Health changes MUST be caused by declared faults, maintenance actions, lifecycle transitions, or modeled degradation.

## 4.6 Parameters

Parameters define stable or configurable Component characteristics such as:

- dimensions;
- rated speed;
- acceleration limit;
- travel limit;
- response delay;
- capacity;
- nominal flow;
- thermal coefficient;
- pressure range;
- Sensor threshold;
- tolerance;
- fault thresholds.

Each Parameter MUST define type, unit where applicable, allowed range, default value, and mutability.

Changing a Parameter during execution is permitted only when its update boundary and State consequences are declared.

## 4.7 Connections

Component State MAY include the operational condition of declared Connections, but the Connection definition remains independently identified.

Broken, restricted, or unavailable Connections MUST affect behavior through declared physical or fault rules rather than hidden side effects.

## 4.8 Lifecycle

Component lifecycle is independent from, but constrained by, Machine lifecycle. The minimum states are:

- `uninitialized`;
- `ready`;
- `active`;
- `inactive`;
- `faulted`;
- `maintenance`;
- `unavailable`.

A Component MUST NOT become active when the Machine lifecycle or its own constraints prohibit activation.

## 4.9 State update ownership

Only the Machine Runtime and the Component’s declared behavior may commit Component State. PLC commands are requests and MUST NOT write Component State directly.

Observers, UIs, Validators, and Sensor consumers are read-only. Maintenance and fault-injection commands enter through explicit Machine command boundaries.

---

# 5. Machine State

Machine State combines global lifecycle, committed Component State, physical State, objects, active faults, environment conditions, and synchronization identity.

The canonical Machine lifecycle states are:

- Running;
- Stopped;
- Paused;
- Emergency;
- Fault;
- Resetting;
- Power Off;
- Maintenance.

## 5.1 Running

The Machine advances normal Physics, resolves accepted actuator commands, moves material, and evaluates operational Events and Sensors.

Running does not mean every Component is active. Individual Components remain governed by commands, constraints, Health, and process conditions.

## 5.2 Stopped

The Machine is powered and initialized but not performing normal production behavior.

Physics MAY still settle safe motion, pressure, temperature, or gravity-dependent State when the model requires it. Stopped MUST NOT be interpreted as frozen time unless the Machine model explicitly defines that simplification.

## 5.3 Paused

Paused suspends declared progression for educational inspection or orchestration. The pause policy MUST state which physical processes freeze and which continue.

For deterministic replay, pause and resume commands and their application boundaries MUST be recorded.

Paused is a simulation lifecycle state. It is not automatically equivalent to an industrial stop condition.

## 5.4 Emergency

Emergency represents an active emergency condition requiring the Machine to apply its declared emergency response.

The response MAY include command rejection, energy removal, braking, venting, controlled stopping, object retention, and fault propagation. It MUST be declared by Component and Machine safety assumptions.

Emergency MUST have priority over normal actuator commands.

## 5.5 Fault

Fault represents an active Machine fault that prevents or restricts normal operation.

The Machine model MUST define whether a particular fault causes full Machine Fault, Component-only degradation, continued restricted operation, or Emergency.

## 5.6 Resetting

Resetting applies declared reset behavior to Machine and Component State. It may clear eligible faults, return Components to defined conditions, rebuild Sensor quality, and prepare the Machine for Stopped or Running.

Resetting MUST NOT clear non-resettable faults or restore unavailable physical conditions without an authorized maintenance action.

## 5.7 Power Off

Power Off represents absence of required Machine energy. Actuator commands are rejected or ineffective. Components transition according to their power-loss behavior.

Physical effects such as inertia, gravity, stored pressure, residual heat, or material movement MAY continue if modeled.

Sensor availability and quality during Power Off MUST be defined per Sensor and power domain.

## 5.8 Maintenance

Maintenance permits declared inspection, manual intervention, component replacement, fault repair, or calibration behavior.

Normal production commands SHOULD be rejected unless a specific maintenance mode permits controlled actuation. Maintenance actions MUST be recorded when they affect deterministic State.

## 5.9 Transition model

The canonical transitions are constrained, not fully automatic:

```text
Power Off ──power available──> Resetting
Resetting ──successful reset──> Stopped
Stopped ──valid start conditions──> Running
Running ──normal stop──> Stopped
Running ──pause command──> Paused
Paused ──resume command──> Running or Stopped
Any powered state ──emergency condition──> Emergency
Emergency ──condition cleared + authorized reset──> Resetting
Any active state ──blocking fault──> Fault
Fault ──eligible fault cleared + reset──> Resetting
Stopped or Fault ──maintenance entry──> Maintenance
Maintenance ──authorized completion──> Resetting
Any state ──power removed──> Power Off
```

Each transition MUST define:

- trigger;
- guards;
- source states;
- target state;
- Component actions;
- fault effects;
- Sensor effects;
- Events;
- rejection reason when invalid.

## 5.10 Transition priority

When multiple transitions are eligible at one boundary, priority MUST be deterministic. The canonical priority is:

1. Power Off;
2. Emergency;
3. blocking Fault;
4. Resetting;
5. Maintenance;
6. Pause or Stop;
7. Start or Resume;
8. remain in current state.

A Machine profile may refine priority but MUST NOT silently reverse safety-related precedence.

---

# 6. Physics Layer

The Physics layer advances modeled physical and process behavior from one committed State to the next.

Physics is a domain abstraction. It may use discrete transitions, continuous approximations, lookup relationships, state machines, or coupled models. This specification does not mandate a numerical solver.

## 6.1 Physics inputs

Physics evaluation receives only declared inputs:

- Current and Previous Machine State;
- Component State and Parameters;
- accepted actuator commands;
- logical time increment;
- objects and their properties;
- Connections;
- environment boundary conditions;
- active faults and maintenance state;
- deterministic external disturbances.

It MUST NOT read PLC internal State, UI state, host wall-clock time, rendering frames, or unrecorded random values.

## 6.2 Movement

Movement updates location, displacement, orientation, path position, or occupancy. It MUST define coordinate or path references, units, bounds, collision or obstruction behavior, and connection transfer rules.

Movement may apply to Components or transported objects.

## 6.3 Acceleration

Acceleration describes the rate of speed change. A model MAY use fixed acceleration, bounded acceleration, profiles, or a simplified immediate response.

If acceleration is simplified away, the Component definition MUST state that assumption. Validation MUST NOT infer unmodeled dynamics.

## 6.4 Delay

Delay represents deterministic time between cause and physical response, including start delay, valve travel, Sensor response, communication-independent Component delay, heating delay, or settling time.

Delay MUST use Machine logical time and declare reset or interruption behavior.

## 6.5 Inertia

Inertia represents continued motion or delayed response after command change or energy removal. Where relevant, the model MUST define deceleration, coast, brake, load, and Emergency behavior.

## 6.6 Material Flow

Material Flow updates transfer of liquid, gas, bulk material, discrete objects, or energy-like process quantities across Connections.

Flow MUST respect direction, capacity, source availability, destination capacity, valve or pump State, losses when modeled, and conservation assumptions.

## 6.7 Temperature

Temperature behavior MAY include heating, cooling, ambient exchange, thermal capacity, delay, limits, and overtemperature faults.

Every thermal quantity MUST declare unit and valid range.

## 6.8 Pressure

Pressure behavior MAY include source pressure, volume, flow resistance, compression, venting, leakage, limits, and pressure faults.

The model MUST state whether pressure is physically calculated, approximated, or represented by discrete states.

## 6.9 Position

Position identifies a Component or object location in a declared coordinate system, axis, zone, or process path.

Position models MUST define origin, unit, bounds, and transfer between connected spaces.

## 6.10 Speed

Speed describes position change over logical time. It MUST define unit, sign or direction convention, limits, and relationship to actuator State and load when modeled.

## 6.11 Timing

All Physics timing MUST use Machine logical time. Host execution duration is diagnostic only.

Each update step MUST declare its logical interval. If substeps are required for stability or accuracy, their count and ordering MUST be deterministic and part of the execution profile.

## 6.12 Deterministic Physics

For identical model version, initial State, command images, environment inputs, faults, object State, Parameters, and logical time sequence, Physics MUST produce identical committed State and ordered Events.

Numeric precision, rounding, tolerance, collision ordering, and simultaneous interactions require a canonical profile before cross-platform conformance can be claimed.

## 6.13 Conservation and constraints

Models SHOULD declare applicable invariants such as:

- material cannot appear without a modeled source;
- an object cannot occupy incompatible exclusive positions;
- tank volume remains within declared bounds;
- Component speed remains within physical limits;
- energy-dependent actuation requires available energy;
- closed flow paths do not transfer material;
- physical interlocks override ineffective commands.

Violation MUST produce a deterministic correction, warning, error, or fault according to the model.

---

# 7. Sensors

Sensors are Machine Components that observe Machine-owned State and produce measurements or detections.

The mandatory rule is:

> Sensors never read PLC Outputs. Sensors observe Machine State.

A PLC Output may command an actuator. The actuator changes physical State. A Sensor may then observe that physical State. The command is not the measurement.

## 7.1 Sensor contract

Every Sensor MUST define:

- Identifier and Type;
- observed State references or spatial region;
- measurement function;
- output value type and unit;
- update boundary;
- valid range or allowed values;
- quality model;
- response delay;
- tolerance, resolution, hysteresis, or quantization when relevant;
- initialization behavior;
- power dependency;
- fault behavior;
- publication mapping identity.

## 7.2 Sensor evaluation

Sensors MUST evaluate from committed Machine State after Physics and State commitment for the step.

One Sensor MUST NOT observe another Sensor’s published value as physical truth unless it is explicitly modeled as a derived observation. Derived Sensors must reference authoritative Machine State whenever possible.

## 7.3 Sensor image

The runtime publishes one complete Sensor image containing:

- Machine and model identity;
- Machine step identity;
- logical timestamp;
- Sensor Identifier;
- value;
- quality;
- optional status or fault identity.

The image MUST be immutable after publication. A PLC Runtime may sample it only during a later Input Update selected by orchestration.

## 7.4 Sensor quality

The minimum Sensor quality states are:

- `valid`;
- `uncertain`;
- `invalid`;
- `unavailable`.

Quality is separate from value. A retained last value with invalid quality MUST NOT be mistaken for a fresh valid observation.

## 7.5 Photoelectric Sensor

A Photoelectric Sensor observes whether an object intersects its declared detection region under the modeled optical assumptions.

It SHOULD define beam geometry, detection conditions, response delay, object eligibility, occlusion assumptions, and fault behavior.

## 7.6 Limit Switch

A Limit Switch observes physical contact or position threshold. It SHOULD define activation region, hysteresis, contact State, mechanical delay, and stuck or broken fault modes.

## 7.7 Encoder

An Encoder observes motion or position. It MAY produce count, position, speed, direction, or pulse Events.

Resolution, rollover, direction convention, sampling, and fault behavior MUST be explicit.

## 7.8 Analog Sensor

An Analog Sensor observes a continuous or discretized physical quantity. It MUST define unit, measurement range, resolution, tolerance, saturation, and out-of-range behavior.

## 7.9 Pressure Sensor

A Pressure Sensor observes modeled pressure at a Component or Connection location. Its value MUST derive from pressure State, not pump command.

## 7.10 Temperature Sensor

A Temperature Sensor observes modeled thermal State and may include lag, range, and fault behavior.

## 7.11 Level Sensor

A Level Sensor observes material level, volume, height, mass, or a threshold derived from storage State. The observed quantity and geometry assumptions MUST be declared.

## 7.12 Position Sensor

A Position Sensor observes coordinate, path location, zone occupancy, or Component travel. It MUST identify its reference frame.

## 7.13 Vision Sensor

A Vision Sensor observes declared object or scene properties. A simplified model MAY return classification, presence, position, quality, or inspection Result.

Vision behavior MUST be deterministic for the same committed scene unless controlled uncertainty is explicitly recorded.

## 7.14 RFID Sensor

An RFID Sensor observes eligible object identities or data within a declared read region. Range, simultaneous-object ordering, read delay, and failure behavior MUST be defined.

## 7.15 Barcode Sensor

A Barcode Sensor observes encoded object data under declared visibility, orientation, and quality conditions. Failed read and no-object MUST remain distinguishable.

## 7.16 PLC Input generation

Sensors do not generate PLC Inputs directly. They generate the canonical Sensor image. An external mapping contract converts Sensor observations into a future PLC Input sample.

This extra boundary ensures:

- Machine independence from controller addressing;
- explicit quality mapping;
- deterministic sample timing;
- reuse with different controllers;
- traceable signal ownership.

---

# 8. Actuators

Actuators are Machine Components that accept declared command values and influence physical State.

PLC Outputs command actuators through an external mapping contract. A command expresses requested behavior; physical response depends on Machine lifecycle, Health, energy, constraints, interlocks, faults, delay, and Physics.

## 8.1 Actuator command contract

Every actuator command MUST define:

- command Identifier;
- destination Component and command capability;
- value type, unit, and allowed range;
- default command;
- command validity and quality rules;
- acceptance boundary;
- priority relative to Emergency, faults, and maintenance;
- stale or missing command behavior.

The Machine Runtime accepts a complete command image. It MUST NOT read the PLC Output image directly.

## 8.2 Actuator response

Every Actuator SHOULD define:

- commanded State;
- accepted State;
- physical Current State;
- feedback State;
- transition delay;
- dynamic limits;
- energy dependency;
- safe response;
- fault response;
- rejection reason.

Commanded and physical State MUST remain distinguishable.

## 8.3 Motors

Motors convert an accepted command into rotational or linear drive behavior. A Motor model MAY include start delay, speed, acceleration, inertia, direction, load, thermal State, current-like load indication, and faults.

A run command does not guarantee Running State.

## 8.4 Cylinders

Cylinders produce bounded linear movement. A model SHOULD define retracted and extended positions, travel, speed, pressure or energy dependency, end stops, load, delays, and jam behavior.

Extend and retract commands that conflict MUST have a deterministic rejection or priority rule.

## 8.5 Servos

Servos act on position, speed, torque-like, or motion-profile commands. A model SHOULD define enable State, target, actual position, actual speed, following behavior, limits, homing assumptions, and faults.

## 8.6 Valves

Valves influence flow paths. A Valve model MAY be discrete or proportional and SHOULD define position, travel delay, fail position, leakage assumptions, pressure constraints, and stuck behavior.

## 8.7 Pumps

Pumps influence material Flow and pressure. The model SHOULD define availability, start delay, flow relationship, source conditions, destination restrictions, dry-run behavior, and faults.

## 8.8 Lights

Lights produce modeled illumination or indication State. A simple Light may follow an accepted command after delay; a scene Light may influence Camera or vision State.

## 8.9 Buzzers

Buzzers produce modeled audible State. Frequency, pattern, delay, and availability MAY be represented when educationally relevant.

## 8.10 Command precedence

Canonical actuator command precedence is:

1. Power Off physical response;
2. Emergency response;
3. blocking Component or Machine fault response;
4. Maintenance restrictions;
5. physical constraints and interlocks;
6. accepted external command;
7. default or idle behavior.

The resulting accepted command and any rejection reason SHOULD be observable in Machine Diagnostics.

---

# 9. Events

Machine Events are immutable, ordered observations of committed Machine transitions.

Every Event SHOULD include:

- Event Type;
- Machine session identity;
- monotonically increasing Event sequence number;
- Machine step identity;
- logical timestamp;
- source Component or Machine identity;
- prior and resulting State references when applicable;
- severity;
- structured details;
- related fault or object identity.

Events MUST be generated from deterministic transition rules. Delivery delay MUST NOT change Machine State.

## 9.1 Component Started

Component Started is emitted when a Component transitions into its declared active physical State. Command acceptance alone MUST NOT emit Component Started unless physical activation is immediate by definition.

## 9.2 Component Stopped

Component Stopped is emitted when an active Component reaches its declared stopped physical State. The Event SHOULD identify normal, commanded, constrained, faulted, emergency, or power-loss cause.

## 9.3 Object Entered

Object Entered is emitted when an object crosses into a declared Component, zone, Sensor region, or Connection boundary.

The target region, object identity, transition direction, and boundary ordering MUST be explicit.

## 9.4 Object Left

Object Left is emitted when an object crosses out of a declared region. An object transfer between connected regions SHOULD produce an ordered leave and enter pair according to the connection contract.

## 9.5 Fault Raised

Fault Raised is emitted when a new Machine or Component Fault becomes active. It MUST identify classification, severity, propagation, lifecycle effect, and reset eligibility.

## 9.6 Emergency

Emergency is emitted when the Machine enters Emergency or when an Emergency condition changes materially. It MUST identify the trigger and applied Machine response.

## 9.7 Maintenance

Maintenance is emitted for accepted entry, action, completion, or exit events that affect Machine State, Health, Parameters, or fault recovery.

## 9.8 Reset

Reset is emitted when an accepted Machine Reset begins and when it completes or fails. It MUST identify Reset class, affected Components, preserved State, cleared faults, remaining faults, and resulting lifecycle State.

## 9.9 Event ordering

Events generated in one Machine step MUST have a total canonical order. The recommended order is:

1. lifecycle transitions;
2. fault and emergency transitions;
3. Component transitions in declared update order;
4. object boundary transitions in object and boundary order;
5. Sensor quality transitions;
6. step-completion observation.

The exact secondary ordering keys MUST be stable and independent from unordered storage iteration.

---

# 10. Object Model

Transported or processed objects represent discrete material entities handled by the Machine. The Object model is optional for Machines that operate only on continuous processes.

Examples include:

- boxes;
- parts;
- pallets;
- bottles;
- containers;
- products.

These examples do not restrict Object Type.

## 10.1 Object properties

Every object SHOULD define:

- stable object identity within the execution;
- Object Type;
- lifecycle;
- position and reference frame;
- orientation when relevant;
- dimensions or occupied geometry;
- mass when relevant;
- speed and motion relationship;
- material or product properties;
- quality State;
- payload or contained objects;
- process history;
- tags, RFID data, barcode data, or visual features when relevant;
- current owning region or Component;
- active faults or damage State.

## 10.2 Object lifecycle

The minimum Object lifecycle states are:

- `created`;
- `present`;
- `in_process`;
- `transferred`;
- `completed`;
- `rejected`;
- `removed`;
- `lost`.

Lifecycle transitions MUST be caused by declared Machine behavior or external material-boundary Events.

## 10.3 Object ownership

At a committed State boundary, each object MUST have one authoritative spatial or process owner: a Component, zone, Connection transition, external boundary, or explicit unassigned State.

An object MUST NOT occupy two exclusive owners simultaneously. Overlapping non-exclusive Sensor regions do not change ownership.

## 10.4 Object movement

Object movement is caused by Physics and Component interactions, not PLC Outputs directly.

Movement MUST account for declared transport surfaces, robot or gripper ownership, flow, collisions, stops, queues, obstructions, and transfer rules relevant to the model.

## 10.5 Object creation and removal

Objects may enter or leave through declared Machine boundaries. Creation and removal MUST be recorded as deterministic Events with source, reason, and logical timestamp.

Unrecorded object appearance or disappearance is invalid.

## 10.6 Object transformations

A Machine may transform object properties, combine objects, split material, fill containers, inspect quality, or change process history.

Every transformation MUST declare conservation assumptions, identity policy, resulting properties, and Event behavior.

## 10.7 Ordering and collisions

When multiple objects interact simultaneously, collision and transfer resolution MUST use deterministic ordering. Object identity or an explicit priority key SHOULD serve as the stable secondary order.

---

# 11. Fault Model

A Fault is a modeled abnormal condition affecting Component behavior, Machine behavior, Sensor truth, communication boundary, lifecycle, or Validation.

Faults MUST be separate from runtime-environment failures. A modeled broken Sensor is part of the Lab; an unavailable simulation service is an environment failure and must not be misclassified as Machine behavior.

## 11.1 Common Fault properties

Every Fault SHOULD define:

- stable Fault Identifier;
- category;
- source;
- affected Components and Connections;
- severity;
- onset condition or injection command;
- active, latched, acknowledged, and cleared State;
- physical effects;
- Sensor effects;
- lifecycle effects;
- propagation rules;
- reset eligibility;
- required maintenance action;
- deterministic recovery behavior.

## 11.2 Mechanical Fault

Mechanical Faults affect motion, structure, load, alignment, friction, obstruction, coupling, or physical integrity.

Examples include jam, broken coupling, excessive friction, end-stop failure, or misalignment. Effects MUST be represented through Physics and Component State.

## 11.3 Electrical Fault

Electrical Faults affect modeled power availability, actuation, Sensor power, overload, connection availability, or electrical Health.

Electrical Fault is a general Machine abstraction and does not model hazardous electrical behavior unless explicitly specified.

## 11.4 Sensor Fault

Sensor Faults affect measurement value, delay, quality, availability, calibration, noise, stuck State, or intermittent behavior.

A Sensor Fault MUST NOT rewrite underlying physical State. It changes observation behavior.

## 11.5 Motor Fault

Motor Faults specialize Component behavior such as failure to start, unexpected stop, reduced speed, overload, overheating, direction failure, or feedback mismatch.

The motor command may remain requested while physical Motor State is faulted or stopped.

## 11.6 Communication Fault

Communication Faults affect command-image or Sensor-image exchange at declared external boundaries.

The Machine Runtime MUST NOT model a Communication Fault by reading PLC internals. It models missing, stale, invalid, delayed, or rejected external data according to a synchronization profile.

## 11.7 Timeout

Timeout Faults occur when an expected physical transition or operation does not complete within a declared Machine logical duration.

Timeout must be based on Machine State and logical time, not a controller Timer value.

## 11.8 Blocked Material

Blocked Material represents objects or process material unable to progress because of obstruction, capacity, collision, Component failure, or invalid flow conditions.

The blockage MUST exist in object or material State and influence Physics. A PLC diagnostic bit alone does not create the blockage.

## 11.9 Fault propagation

Fault propagation MUST follow declared Connections, containment, capability dependencies, and Machine policies.

Possible propagation outcomes include:

- local Component degradation;
- connected Component restriction;
- Sensor quality change;
- object blockage or damage;
- Machine Fault;
- Emergency;
- loss of power domain;
- warning without lifecycle transition.

Propagation MUST be acyclic or use a deterministic fixed-point rule with a declared iteration bound. Infinite propagation is a runtime-model fault.

## 11.10 Fault priority

When faults conflict, the more restrictive safety or lifecycle outcome has priority. Equal-severity faults remain independently active and ordered by occurrence and stable Fault Identifier.

## 11.11 Fault recovery

Clearing a trigger does not necessarily clear a Fault. The Fault definition MUST state whether recovery is:

- automatic;
- Reset-dependent;
- acknowledgement-dependent;
- maintenance-dependent;
- non-recoverable within the current attempt.

Recovery MUST restore only the State explicitly covered by the recovery action.

---

# 12. Determinism

Determinism means equal declared Machine execution inputs produce equal declared Machine behavior.

For the same Machine model version, Component definitions, Parameters, initial State, object set, command-image sequence, environment sequence, fault sequence, maintenance actions, logical time increments, and numeric profile, the runtime MUST produce the same committed State, Event order, Sensor images, faults, and Validation evidence.

## 12.1 Equal PLC Outputs

Equal PLC Output values alone are not sufficient unless their publication order and application times are also equal. The deterministic command input is the complete ordered command-image sequence with logical synchronization identity.

Given equal command sequences and every other declared Machine input, Machine behavior MUST be equal.

## 12.2 Deterministic input set

A replayable Machine execution MUST identify:

- Machine model and specification version;
- Component Type and capability versions;
- Component Parameters;
- initial Current and Previous State;
- object definitions and initial ownership;
- Connection graph;
- ordered actuator-command images;
- command quality and stale-data decisions;
- logical time increments and substep profile;
- environment boundary inputs;
- fault injections and clear actions;
- lifecycle, Reset, and maintenance commands;
- controlled random source and seed when used;
- numeric, collision, and tolerance profile.

## 12.3 Deterministic output set

Equivalent executions MUST produce identical:

- committed Machine and Component State;
- object State and ownership;
- accepted and rejected actuator commands;
- Physics Results;
- ordered Events;
- Sensor values and quality;
- Sensor-image identity;
- faults and lifecycle transitions;
- logical Diagnostics and Validation evidence.

Host performance measurements and rendering behavior are not deterministic Machine outputs.

## 12.4 Ordering rules

Total deterministic ordering is required for:

- command acceptance;
- lifecycle transition priority;
- Component evaluation;
- Connection interactions;
- Physics substeps;
- fault propagation;
- object collision and transfer resolution;
- State commitment;
- Event sequence assignment;
- Sensor evaluation;
- Sensor publication.

Unordered collection iteration MUST NOT influence Results.

## 12.5 Logical time

Machine Physics, delays, inertia, movement, timeouts, Sensor response, and fault progression MUST use Machine logical time.

Wall-clock delay, UI frame rate, host load, and network arrival time MUST NOT alter behavior once external inputs have been assigned to deterministic Machine step boundaries.

## 12.6 Controlled uncertainty

Noise, variation, wear, random faults, and uncertain Sensor behavior MAY be modeled only through a recorded deterministic source. The seed, distribution definition, sampling order, and model version MUST be part of the execution record.

## 12.7 Numeric conformance

Cross-platform conformance requires a future numeric and unit profile defining precision, rounding, tolerance, overflow, integration, collision, and solver behavior.

An implementation MUST NOT claim canonical equality based only on its host-language numeric defaults.

## 12.8 Replay

A conforming environment SHOULD replay the deterministic input set and identify the first divergence by Machine step, Component, physical value, object, fault, Event, or Sensor.

---

# 13. Future Extensions

Future capabilities must extend declared boundaries rather than coupling Machine behavior to a particular controller, UI, or platform.

## 13.1 Digital Twin

A Digital Twin may implement or synchronize Machine Components, Physics, State, Events, and Sensors.

The Twin adapter MUST declare model fidelity, synchronization authority, latency assumptions, conflict resolution, and which State is authoritative. A Digital Twin must not bypass the command and Sensor image contracts silently.

## 13.2 3D Rendering

3D Rendering may observe committed Machine State and interpolate visuals between State boundaries.

Rendering MUST be read-only with respect to canonical Machine behavior. Frame rate, animation interpolation, camera, and visual effects MUST NOT alter Physics or Sensor Results.

## 13.3 OPC UA

An OPC UA adapter may expose commands, State, Sensors, Events, faults, and Diagnostics.

Node identity, namespace, security, transport quality, and subscription behavior belong to the adapter. The Machine model remains protocol-independent.

## 13.4 Real PLC

A real PLC may act as command provider and Sensor consumer through an approved I/O adapter.

Physical execution requires separate safety, authorization, commissioning, timing, and fail-safe specifications. The Machine Runtime MUST not assume a specific controller vendor.

## 13.5 Industrial AI

Industrial AI may observe Machine State, Events, faults, and Diagnostics to explain behavior, assist diagnosis, or propose scenarios.

AI MUST NOT mutate Machine State outside explicit, recorded fault, environment, maintenance, or command boundaries. AI output is not authoritative physical truth.

## 13.6 Multiple Machines

Multiple Machine Runtimes may interact through declared material, energy, spatial, or information boundaries.

An orchestrator MUST define update order, shared object transfer, time synchronization, fault propagation, and Sensor/command boundaries. One Machine MUST NOT directly mutate another Machine’s internal State.

## 13.7 Distributed Simulation

Distributed execution may host Components or Machines separately. A future specification MUST define:

- logical clock coordination;
- message ordering;
- State ownership;
- rollback or recovery;
- partition behavior;
- deterministic replay;
- latency abstraction;
- fault distinction between modeled communication and infrastructure failure.

Distribution MUST NOT weaken canonical ownership.

## 13.8 Extension governance

Every extension MUST declare:

- owner and version;
- capability contracts;
- State and lifecycle effects;
- deterministic ordering;
- fault and recovery behavior;
- synchronization requirements;
- replay requirements;
- compatibility with SPEC-003.

---

# 14. UML

The following conceptual UML-style diagram describes domain relationships. It does not prescribe software classes or storage structures.

```text
┌──────────────────────────┐
│      MachineRuntime      │
│ lifecycle                │
│ logicalTime              │
│ modelVersion             │
└────────────┬─────────────┘
             │ owns 1
             ▼
┌──────────────────────────┐       contains 1..*       ┌──────────────────────────┐
│       MachineState       │<──────────────────────────│        Component         │
│ current                  │       contributes State   │ id                       │
│ previous                 │                           │ type                     │
│ stepId                   │                           │ health                   │
└────────────┬─────────────┘                           │ lifecycle                │
             │ contains 0..*                          └──────┬───────────┬───────┘
             ▼                                                │           │
┌──────────────────────────┐                    specializes    │           │ specializes
│          Object          │                                   ▼           ▼
│ id                       │                         ┌──────────────┐ ┌──────────────┐
│ type                     │                         │   Actuator   │ │    Sensor    │
│ position                 │                         │ commands     │ │ observation  │
│ properties               │                         │ response     │ │ quality      │
│ lifecycle                │                         └──────┬───────┘ └──────┬───────┘
└──────────────────────────┘                                │                │
                                                            │ affects        │ observes
                                                            ▼                ▼
┌──────────────────────────┐       advances       ┌──────────────────────────┐
│       PhysicsModel       │─────────────────────>│       MachineState       │
│ deterministicStep       │                      └──────────────────────────┘
│ constraints              │                                   │
└────────────┬─────────────┘                                   │ produces
             │ uses 0..*                                       ▼
             ▼                                      ┌──────────────────────────┐
┌──────────────────────────┐                        │      MachineEvent        │
│        Connection        │                        │ sequence                 │
│ endpoints                │                        │ logicalTimestamp         │
│ capability               │                        │ source                   │
│ constraints              │                        └──────────────────────────┘
└──────────────────────────┘

┌──────────────────────────┐       accepted by       ┌──────────────────────────┐
│      CommandImage        │────────────────────────>│      MachineRuntime      │
│ command values           │                         └──────────────────────────┘
│ source identity          │
│ synchronization identity │
└──────────────────────────┘

┌──────────────────────────┐       published by      ┌──────────────────────────┐
│       SensorImage        │<────────────────────────│      MachineRuntime      │
│ observations             │                         └──────────────────────────┘
│ quality                  │
│ machineStepId            │
└──────────────────────────┘

┌──────────────────────────┐       affects 1..*      ┌──────────────────────────┐
│          Fault           │────────────────────────>│ Component / Connection   │
│ category                 │                         │ / MachineState           │
│ severity                 │                         └──────────────────────────┘
│ recovery                 │
└──────────────────────────┘
```

## 14.1 Relationship rules

- One Machine Runtime owns one authoritative Machine State per execution session.
- One Machine contains one or more Components.
- A Component may contain child Components but has one parent owner.
- Components connect through identified Connections.
- Actuators are Components that accept external command mappings.
- Sensors are Components that observe committed Machine State.
- Physics advances Machine State using Components, Connections, objects, commands, faults, and logical time.
- Objects occupy one authoritative spatial or process owner at a committed boundary.
- Faults affect Components, Connections, Sensors, objects, or global Machine lifecycle through declared propagation.
- The runtime accepts Command images and publishes Sensor images; neither image exposes the other runtime’s internal State.
- Machine Events describe committed transitions but do not own physical State.

---

# 15. Example

This section defines one complete illustrative conveyor Machine model. The conveyor demonstrates the generic Component, Physics, State, Event, Sensor, Actuator, Object, and Fault contracts. It is not the base architecture and does not restrict other Machine Types.

## 15.1 Machine identity

| Property | Value |
|---|---|
| Identifier | `MACHINE-CONVEYOR-DEMO-001` |
| Type | Discrete-object transport cell |
| Model version | `1.0.0` |
| SPEC version | `SPEC-003` |
| Purpose | Transport one box through an entry Sensor, inspection zone, and exit Sensor |
| Initial lifecycle | Stopped |
| Logical step | 20 milliseconds |

## 15.2 Components

| Identifier | Type | Capabilities | Initial State | Health |
|---|---|---|---|---|
| `POWER-01` | Power Supply | energy-source | available | healthy |
| `MOTOR-01` | Motor | actuator, motion | stopped, speed 0 m/s | healthy |
| `BELT-01` | Conveyor | transport, object-interface | stopped | healthy |
| `PE-ENTRY-01` | Photoelectric Sensor | sensor | clear | healthy |
| `PE-EXIT-01` | Photoelectric Sensor | sensor | clear | healthy |
| `ESTOP-01` | Emergency Stop | safety, sensor | released | healthy |
| `LIGHT-RUN-01` | Light | actuator, indication | off | healthy |

## 15.3 Component Parameters

### Motor `MOTOR-01`

| Parameter | Value |
|---|---|
| Rated speed | 0.5 m/s |
| Acceleration | 1.0 m/s² |
| Deceleration | 1.5 m/s² |
| Start delay | 100 ms |
| Stop behavior | Controlled deceleration |
| Power source | `POWER-01` |
| Safe State | stopped |

### Conveyor `BELT-01`

| Parameter | Value |
|---|---|
| Path origin | 0.0 m |
| Path end | 3.0 m |
| Width | 0.6 m |
| Drive source | `MOTOR-01` |
| Maximum object count | 5 |
| Transfer rule | Objects move at committed belt speed when unblocked |

### Entry Sensor `PE-ENTRY-01`

| Parameter | Value |
|---|---|
| Observed region | 0.20 m to 0.25 m along `BELT-01` |
| Value Type | boolean |
| Response delay | 20 ms |
| Quality when unpowered | unavailable |

### Exit Sensor `PE-EXIT-01`

| Parameter | Value |
|---|---|
| Observed region | 2.75 m to 2.80 m along `BELT-01` |
| Value Type | boolean |
| Response delay | 20 ms |
| Quality when unpowered | unavailable |

### Emergency Stop `ESTOP-01`

| Parameter | Value |
|---|---|
| Normal State | released |
| Emergency State | pressed |
| Effect | Machine enters Emergency; Motor accepted run command becomes false |
| Reset | Requires released State and authorized Machine Reset |

## 15.4 Connections

| Identifier | Type | From | To | Rule |
|---|---|---|---|---|
| `CONN-POWER-MOTOR` | electrical-power | `POWER-01` | `MOTOR-01` | Motor may actuate only while power is available |
| `CONN-MOTOR-BELT` | mechanical | `MOTOR-01` | `BELT-01` | Belt speed follows committed Motor physical speed |
| `CONN-BELT-ENTRY` | spatial | `BELT-01` | `PE-ENTRY-01` | Sensor observes objects in entry region |
| `CONN-BELT-EXIT` | spatial | `BELT-01` | `PE-EXIT-01` | Sensor observes objects in exit region |
| `CONN-ESTOP-MACHINE` | logical safety | `ESTOP-01` | Machine root | Pressed State requests Emergency transition |

## 15.5 Actuator command image

The Machine accepts one complete command image at each synchronization boundary:

| Command | Destination | Type | Initial/default | Meaning |
|---|---|---|---|---|
| `CMD-MOTOR-RUN` | `MOTOR-01` | boolean | false | Request Motor run |
| `CMD-RUN-LIGHT` | `LIGHT-RUN-01` | boolean | false | Request run indication |

Command precedence applies. `CMD-MOTOR-RUN = true` cannot produce Motor Running while Power is unavailable, Emergency is active, or a blocking Motor Fault exists.

## 15.6 Objects

One initial box is declared:

| Property | Value |
|---|---|
| Identifier | `BOX-001` |
| Type | box |
| Lifecycle | present |
| Initial owner | `BELT-01` |
| Initial path position | 0.0 m |
| Length | 0.30 m |
| Width | 0.25 m |
| Height | 0.20 m |
| Mass | 1.5 kg |
| Barcode | `D2R-DEMO-001` |
| Quality | unknown |

## 15.7 Initial Machine State

| State item | Initial value |
|---|---|
| Lifecycle | Stopped |
| Logical time | 0 ms |
| Machine step | 0 |
| Power | available |
| Emergency | inactive |
| Motor command accepted | false |
| Motor physical State | stopped |
| Motor speed | 0 m/s |
| Belt speed | 0 m/s |
| Box position | 0.0 m |
| Entry Sensor observation | false, valid |
| Exit Sensor observation | false, valid |
| Active faults | none |

## 15.8 Physics behavior

For each 20 ms logical Machine step:

1. The runtime accepts the complete command image.
2. Lifecycle and command precedence are evaluated.
3. When `CMD-MOTOR-RUN` is accepted continuously for 100 ms, Motor acceleration begins.
4. Motor speed changes toward 0.5 m/s at the declared acceleration or deceleration.
5. Belt speed equals committed Motor speed through the mechanical Connection.
6. If the box is unblocked, its path position advances by belt speed over the logical interval.
7. Position is bounded by the Conveyor path and transfer rules.
8. Component and object State commits atomically.
9. Object boundary and Component transition Events are generated.
10. Photoelectric Sensors evaluate box overlap with their regions from committed State.
11. A complete Sensor image is published.

Numeric integration and rounding require the future canonical numeric profile. Within one chosen profile, Results are deterministic.

## 15.9 Sensor image

| Sensor observation | Source State | Type | Quality |
|---|---|---|---|
| `SNS-MOTOR-RUNNING` | `MOTOR-01` physical Running State | boolean | valid while powered |
| `SNS-ENTRY-BLOCKED` | Box overlap with entry region | boolean | valid while Sensor powered and healthy |
| `SNS-EXIT-BLOCKED` | Box overlap with exit region | boolean | valid while Sensor powered and healthy |
| `SNS-ESTOP-ACTIVE` | `ESTOP-01` physical State | boolean | valid while safety observation available |
| `SNS-MOTOR-SPEED` | `MOTOR-01` committed physical speed | number in m/s | valid while feedback available |

No Sensor reads `CMD-MOTOR-RUN`. `SNS-MOTOR-RUNNING` observes physical Motor State after command acceptance, delay, lifecycle, Health, and Physics are applied.

## 15.10 Expected Events

Normal operation may produce:

1. Component Started for `MOTOR-01` when physical motion begins;
2. Component Started for `BELT-01` when committed belt speed becomes positive;
3. Object Entered for `BOX-001` entering the entry Sensor region;
4. Object Left for `BOX-001` leaving the entry Sensor region;
5. Object Entered for `BOX-001` entering the exit Sensor region;
6. Object Left for `BOX-001` leaving the Machine boundary;
7. Component Stopped when the Motor and Belt reach stopped State.

## 15.11 Fault scenarios

### Motor failure to start

- Trigger: modeled fault injection after a run command is accepted.
- Effect: Motor remains stopped, Health becomes faulted, Belt remains stopped.
- Events: Fault Raised; no Component Started.
- Sensors: Motor Running remains false; Motor speed remains zero.
- Recovery: maintenance action and Reset.

### Blocked box

- Trigger: obstruction introduced at 1.5 m.
- Effect: `BOX-001` stops; belt may continue according to simplified slip assumptions.
- Event: Fault Raised after 2 seconds without expected object movement.
- Sensors: entry and exit Sensors continue to observe physical regions only.
- Recovery: obstruction removal in Maintenance and Reset.

### Entry Sensor stuck true

- Trigger: Sensor Fault.
- Effect: physical box State is unchanged; Sensor observation remains true with degraded or invalid quality according to the fault definition.
- Event: Fault Raised for `PE-ENTRY-01`.
- Recovery: maintenance replacement or fault clear policy.

### Emergency Stop

- Trigger: `ESTOP-01` becomes pressed.
- Effect: Machine enters Emergency, Motor run request is rejected, Motor decelerates using emergency response, and the run Light follows its declared safe behavior.
- Events: Emergency, Component Stopped when physical stop completes.
- Recovery: release Emergency Stop and apply authorized Reset.

## 15.12 PLC separation timeline

An illustrative synchronized exchange is:

```text
Boundary A: PLC publishes CMD-MOTOR-RUN = true
            ↓
Machine Step A: accepts command, advances Motor delay and Physics
            ↓
Machine publishes Sensor Image A from committed Machine State
            ↓
Later PLC Input Update samples Sensor Image A
            ↓
PLC Program evaluates those sampled Inputs
            ↓
PLC publishes the next complete command image at Boundary B
```

The Machine never reads the PLC Program or live Output Memory. The PLC never reads live Machine State between Sensor-image publications.

---

# 16. Architectural Decisions

## AD-001 — Machine and PLC Runtimes are independent

**Decision:** The Machine accepts command images and publishes Sensor images without accessing PLC internals.

**Why:** Controller decisions and physical consequences require separate ownership, validation, reuse, and evolution.

## AD-002 — Commands are requests, not physical State

**Decision:** An actuator command passes through lifecycle, Health, energy, constraints, faults, delays, and Physics before changing Component State.

**Why:** Treating a command as physical truth would eliminate realistic diagnosis and feedback behavior.

## AD-003 — Sensors observe Machine State only

**Decision:** Sensors derive values from committed Component, object, Physics, and environment State and never from PLC Outputs.

**Why:** Sensor feedback must represent what happened, not what was requested.

## AD-004 — Sensor publication is delayed to a boundary

**Decision:** Sensors publish a complete image after Machine State commits; a PLC may sample it only during a later Input Update.

**Why:** This prevents same-cycle circular causality and partial observations.

## AD-005 — Machines are Component compositions

**Decision:** Every Machine is constructed from identified Components and Connections.

**Why:** Composition supports small mechanisms, complex cells, reuse, testing, and clear ownership.

## AD-006 — New types use capability contracts

**Decision:** New Component Types conform through versioned capabilities rather than runtime-specific type branches.

**Why:** The runtime must scale beyond a fixed device catalogue without modification for every new Machine.

## AD-007 — Current and Previous State are explicit

**Decision:** Each Component retains committed Current and Previous State.

**Why:** Transitions, Events, Sensor hysteresis, Physics, and replay require known boundaries.

## AD-008 — State commits atomically

**Decision:** The runtime builds working next State and publishes only a complete committed State.

**Why:** Sensors and observers must not see partial Component updates.

## AD-009 — Physics is abstract but deterministic

**Decision:** Models may use different fidelity approaches while satisfying deterministic state-transition contracts.

**Why:** Educational Machines need proportional fidelity; one mandatory solver would be speculative and restrictive.

## AD-010 — Logical time governs Machine behavior

**Decision:** Movement, delays, inertia, process change, Sensor response, and timeouts use recorded logical time.

**Why:** Host performance and rendering must not alter industrial behavior.

## AD-011 — Lifecycle has safety-related priority

**Decision:** Power Off, Emergency, and blocking Fault responses override normal commands.

**Why:** Machine behavior must not permit normal actuation to bypass more restrictive conditions.

## AD-012 — Paused is a simulation state, not an industrial stop

**Decision:** Pause semantics are explicit and separate from Stopped.

**Why:** Educational inspection controls must not be confused with Machine control behavior.

## AD-013 — Objects are first-class optional entities

**Decision:** Discrete products have identity, State, ownership, movement, and lifecycle, but continuous-process Machines may omit them.

**Why:** The runtime must support both material handling and process systems without making either the base architecture.

## AD-014 — Object ownership is singular at commit boundaries

**Decision:** Each object has one authoritative spatial or process owner.

**Why:** This prevents duplication, disappearance, and ambiguous transfer.

## AD-015 — Faults change modeled behavior, not just flags

**Decision:** Faults affect Physics, Component State, Sensor quality, lifecycle, Connections, or objects through declared rules.

**Why:** A diagnostic flag without physical consequences cannot support meaningful troubleshooting.

## AD-016 — Sensor faults do not rewrite physical truth

**Decision:** Sensor faults alter observation value or quality while underlying Machine State remains authoritative.

**Why:** Diagnosis depends on distinguishing a process condition from a failed measurement.

## AD-017 — Events are observations, not State owners

**Decision:** Events describe committed transitions and remain immutable.

**Why:** Delivery may be delayed or filtered; physical truth must remain in Machine State.

## AD-018 — Communication faults exist at external boundaries

**Decision:** Missing or stale command and Sensor images are modeled without coupling to controller internals.

**Why:** Communication behavior must remain protocol- and vendor-neutral.

## AD-019 — Rendering is a read-only consumer

**Decision:** 2D or 3D presentation observes committed State and may interpolate visuals only.

**Why:** Visual frame rate must not become Physics.

## AD-020 — Multiple Machines require orchestration

**Decision:** Machines exchange through declared boundaries and never mutate one another directly.

**Why:** Independent ownership is necessary for distributed simulation, replay, and scale.

## AD-021 — Conveyor is an example only

**Decision:** The canonical architecture is based on Components, capabilities, Physics, State, Events, and Sensors, not conveyor concepts.

**Why:** Academy must support robots, process units, packaging machines, storage systems, utilities, and future unknown Machines.

## AD-022 — Physical integrations require separate safety specifications

**Decision:** SPEC-003 does not authorize control of real equipment.

**Why:** Simulation assumptions do not satisfy physical safety, commissioning, authorization, or fail-safe requirements.

---

# Summary

SPEC-003 defines a deterministic, vendor-neutral Machine Runtime composed of Components, Physics, State, Events, and Sensors.

Its mandatory control boundary is:

```text
PLC Output image
      ↓
Actuator command image
      ↓
Machine Components and Physics
      ↓
Committed Machine State
      ↓
Sensor observations
      ↓
Published Sensor image
      ↓
Later PLC Input Update
```

The Machine never executes or inspects PLC logic. Sensors never read PLC Outputs. Commands are requests, physical State is authoritative, and Sensor values are consequences of committed Machine behavior.

The model supports discrete and continuous processes, generic Component extension, objects, faults, deterministic replay, Digital Twins, and future multi-Machine execution without treating conveyors as the base architecture.

# Dependencies

SPEC-003 depends conceptually on:

- **SPEC-001 Laboratory Model:** canonical Machine, Components, Variables, Challenge, and Validation context;
- **SPEC-002 PLC Runtime Model:** external Output publication and later Input sampling semantics only. Neither runtime depends on the other’s implementation.

Future executable conformance requires approved specifications for:

- PLC–Machine orchestration and synchronization;
- command-image and Sensor-image contracts;
- canonical data types, units, numeric precision, and tolerances;
- Component capability registration and versioning;
- Machine lifecycle commands and Reset classes;
- Physics update and solver profiles;
- object geometry, collision, and material-transfer semantics;
- fault taxonomy and propagation policy;
- execution record and replay format;
- Digital Twin fidelity and synchronization;
- real-equipment safety and authorization.

No implementation, rendering, protocol, or vendor dependency is selected by SPEC-003.

# Risks

| Risk | Consequence | Required response |
|---|---|---|
| PLC and Machine updates are coupled directly | Circular same-cycle behavior and hidden dependencies | Approve an explicit orchestration specification |
| Sensors read commands instead of physical State | Faults and delayed responses cannot be diagnosed | Enforce State-based Sensor contracts |
| Component extension relies on central type branching | Every new Machine requires runtime modification | Standardize versioned capability contracts |
| Physics fidelity is unspecified | Labs may claim more realism than they provide | Declare assumptions and fidelity per Machine model |
| Numeric semantics differ across platforms | Replay diverges | Approve canonical numeric and solver profiles |
| Object collision order is ambiguous | Material behavior becomes nondeterministic | Define stable resolution ordering |
| Pause freezes unsafe or unintended processes | Educational controls misrepresent Machine behavior | Require explicit pause policy per model |
| Faults exist only as flags | Troubleshooting lacks physical consequences | Require declared propagation and State effects |
| Communication and environment failures are confused | Learners may be penalized for platform faults | Maintain fault classification boundaries |
| Sensor quality is ignored | Stale or invalid observations appear trustworthy | Include quality in every Sensor image |
| 3D rendering becomes the simulation authority | Frame rate changes Physics | Keep rendering read-only |
| Real equipment reuses simulation assumptions | Safety and commissioning risks | Require separate physical-execution governance |
| Distributed execution weakens ownership | State conflicts and irreproducible behavior | Define synchronization and authority before distribution |
| Excessive universal Physics complexity | Initial Labs become costly and fragile | Use proportional, declared fidelity without speculative models |

# Open Questions

1. What is the canonical PLC–Machine synchronization order and logical-time relationship for the first Academy runtime?
2. Does every Machine step consume one new command image, or may several Machine substeps use the latest accepted image?
3. Which stale or missing command-image policy is the default: safe commands, last commands, or Machine Fault?
4. Which Sensor quality states map to PLC Input quality, fallback values, and faults?
5. Which canonical units and numeric precision must the first Machine profile support?
6. What minimum Physics fidelity is required for introductory, intermediate, and advanced Labs?
7. Which Component capabilities must be standardized for the first release?
8. Are Machine lifecycle commands controlled by the learner, Lab orchestrator, PLC mappings, or a combination with explicit priority?
9. Which processes continue while a simulation is Paused?
10. What Reset classes are required, and which Machine, Component, object, and Fault State does each preserve?
11. How are simultaneous object transfers and collisions resolved in the first profile?
12. Is Sensor noise supported initially, or deferred until deterministic uncertainty profiles exist?
13. Which Fault categories are learner-injectable, scenario-controlled, or maintenance-only?
14. How much Machine State and Event history must be retained for replay and Validation?
15. Can a Machine model contain multiple independent power or safety domains in the first release?
16. What fidelity claims may be used publicly for a simulated Machine or Digital Twin?
17. Which safety review is required before any adapter exchanges data with real equipment?
18. Should the first implementation support continuous-process models, discrete-object models, or one narrow profile while preserving the complete specification?
