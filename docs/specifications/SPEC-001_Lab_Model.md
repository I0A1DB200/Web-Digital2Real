# SPEC-001 — Digital2Real Laboratory Model

**Status:** Draft functional specification
**Specification owner:** Digital2Real Academy
**Scope:** Canonical Laboratory domain model
**Implementation status:** Not implemented

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** express requirement strength within this specification.

---

# 1. Purpose

A Digital2Real Lab is a structured industrial learning experience in which a learner understands a machine, investigates or solves an automation problem, and demonstrates the expected result through defined validation criteria.

A Lab is not a page, simulation screen, PLC program, video, or downloadable project. Those may represent or support a Lab, but the Lab itself is the complete, implementation-independent learning definition.

The Laboratory model exists to:

- give every Lab a consistent educational and engineering structure;
- separate learning intent from presentation and execution technology;
- describe machines and control systems without depending on a vendor;
- make objectives, constraints, completion, and failure explicit;
- allow the same Lab definition to support explanation, simulation, assessment, and future physical execution;
- prevent each new Lab from inventing incompatible concepts;
- support a growing catalogue without duplicating domain responsibility.

Long-term scalability comes from stable boundaries. Metadata supports discovery and lifecycle management. Objectives define learning intent. Machine and PLC models define the controlled system. Variables establish explicit information ownership. Challenge and Validation define the work and its acceptance criteria. Resources support learning without becoming required runtime behavior. Progress records learner outcomes separately from the Lab definition.

Every future Digital2Real Lab MUST conform to this specification or to an explicitly approved successor specification.

---

# 2. Design Principles

## 2.1 Data Driven

A Lab MUST be expressible as structured data. Its identity, learning goals, system definition, challenge, and validation criteria MUST NOT depend on hardcoded presentation behavior.

## 2.2 Vendor Neutral

The canonical model MUST describe industrial concepts rather than proprietary products. Vendor-specific material MAY be attached as an optional resource or adapter, but MUST NOT redefine the Lab’s core meaning.

## 2.3 Component Based

A Lab MUST be composed from explicit domain sections with clear responsibilities. Machine, PLC, Variables, Challenge, Validation, Resources, and Progress MUST remain independently understandable.

## 2.4 Extensible

The model MUST allow additional machine types, control capabilities, validation rules, and learning resources without changing the meaning of existing Labs. Extensions MUST preserve compatibility or declare a new specification version.

## 2.5 Educational

Every Lab MUST have measurable learning objectives. Technical activity without an educational purpose is not an Academy Lab.

## 2.6 Machine Independent

The Machine model MUST support any industrial machine or process unit whose relevant behavior can be described through actuators, sensors, internal state, and events. It MUST NOT assume a conveyor, robot, pump, tank, or other single machine type.

## 2.7 PLC Independent

The PLC model MUST describe control concepts without requiring a particular manufacturer, programming environment, instruction set, or communication stack.

## 2.8 Simulation Ready

A Lab SHOULD define sufficient state, signal, event, and timing meaning to be simulated. Simulation readiness does not require that a simulator already exists.

## 2.9 Validation Ready

Expected behavior MUST be stated in observable terms. Completion MUST be decidable through defined evidence, even when final assessment is manual.

## 2.10 Deterministic Where Required

When safety, sequence, or timing outcomes matter, the Lab MUST identify the conditions under which behavior is evaluated. Acceptable tolerances MUST be explicit.

## 2.11 Separation of Definition and Progress

The canonical Lab definition describes the learning experience. Learner progress describes an individual or group’s interaction with it. Progress MUST NOT alter the canonical Lab.

---

# 3. High-Level Structure

The complete logical structure is:

```text
Lab
├── Metadata
├── Objectives
├── Machine
│   ├── Actuators
│   ├── Sensors
│   ├── Internal State
│   └── Events
├── PLC
│   ├── Inputs
│   ├── Outputs
│   ├── Memory
│   ├── Timers
│   ├── Counters
│   ├── Tags
│   ├── Programs
│   ├── Scan Cycle
│   └── Diagnostics
├── Variables
│   ├── Machine Variables
│   ├── PLC Variables
│   ├── Shared Variables
│   └── Derived Variables
├── Challenge
│   ├── Problem
│   ├── Initial State
│   ├── Expected Behaviour
│   ├── Constraints
│   ├── Hints
│   ├── Completion Conditions
│   └── Failure Conditions
├── Validation
├── Resources
└── Progress
```

## 3.1 Required sections

Every Lab definition MUST include:

- `metadata`;
- at least one `objective`;
- `machine`;
- `plc` when PLC behavior is within scope;
- `variables`;
- `challenge`;
- `validation`.

`resources` MAY be empty. `progress` is a related record schema and SHOULD be stored separately from the canonical Lab definition.

## 3.2 Identity and references

Every entity that may be referenced elsewhere SHOULD have a stable identifier. References MUST target identifiers, not display titles or list positions.

Identifiers MUST remain stable across editorial changes. Display names MAY change without changing identity.

## 3.3 Units and time

Quantities MUST declare their unit when the unit is not inherent in the data type. Time-related values MUST state their unit and tolerance where validation depends on timing.

---

# 4. Metadata

Metadata identifies, classifies, governs, and presents the Lab as a learning product.

| Field | Type | Required | Definition |
|---|---|---:|---|
| `id` | string | Yes | Stable, globally unique Lab identifier. MUST NOT be reused. |
| `slug` | string | Yes | Human-readable, URL-safe identifier. SHOULD remain stable after publication. |
| `title` | string | Yes | Primary learner-facing Lab name. |
| `subtitle` | string | No | Concise clarification of the Lab focus. |
| `description` | string | Yes | Short summary of the industrial context and learning activity. |
| `category` | string | Yes | Primary catalogue classification. Controlled vocabulary SHOULD be used. |
| `difficulty` | enum | Yes | Relative learner level: `introductory`, `intermediate`, `advanced`, or an approved future value. |
| `estimated_time` | object | Yes | Expected completion duration with numeric `value` and explicit `unit`. |
| `language` | string | Yes | Primary natural language using a recognized language code. |
| `version` | string | Yes | Version of this Lab definition. |
| `model_version` | string | Yes | Version of the Laboratory specification to which the Lab conforms. |
| `status` | enum | Yes | Lifecycle state: `draft`, `review`, `validated`, `published`, `deprecated`, or `archived`. |
| `author` | object | Yes | Accountable author or owning team, identified independently from display text. |
| `reviewers` | array | No | People or roles that verified educational or engineering quality. |
| `tags` | array of strings | No | Search and discovery terms. Tags MUST NOT replace structured fields. |
| `prerequisites` | array | No | Required knowledge, skills, or previously completed Labs. |
| `created_at` | date-time | Yes | Date and time when the Lab definition was created. |
| `updated_at` | date-time | Yes | Date and time of the latest approved definition change. |
| `published_at` | date-time or null | No | First publication date and time. |
| `license` | string or object | No | Terms governing reuse of the Lab definition and supplied resources. |

## 4.1 Metadata rules

- `id` and `model_version` MUST be immutable for a published Lab version.
- A material change to objectives, expected behavior, or validation MUST increment `version`.
- `status: validated` means the Lab has passed its defined validation review; it does not mean a learner has completed it.
- Difficulty MUST describe the expected learner challenge, not the complexity of the authoring process.
- Estimated time is guidance, not learner progress.

---

# 5. Objectives

An objective states what the learner is expected to understand, demonstrate, diagnose, design, or validate.

Each objective has:

| Field | Required | Definition |
|---|---:|---|
| `id` | Yes | Stable objective identifier within the Lab. |
| `type` | Yes | `mandatory`, `optional`, or `bonus`. |
| `statement` | Yes | Observable learning outcome written from the learner perspective. |
| `evidence` | Yes | Evidence that can demonstrate achievement. |
| `weight` | No | Relative contribution to scoring when scoring is enabled. |
| `related_validation_rules` | No | Validation rule identifiers that assess the objective. |
| `prerequisites` | No | Other objective identifiers that should be achieved first. |

## 5.1 Mandatory objectives

Mandatory objectives define the minimum educational outcome. A Lab MUST NOT be considered complete unless every mandatory objective is satisfied.

## 5.2 Optional objectives

Optional objectives provide additional practice or alternative exploration. Failure to complete them MUST NOT prevent baseline Lab completion.

## 5.3 Bonus objectives

Bonus objectives reward deeper reasoning, optimization, robustness, or additional investigation. They MAY affect score or achievements but MUST NOT replace mandatory objectives.

## 5.4 Objective quality rules

Objectives MUST be:

- specific enough to validate;
- independent from a particular UI action;
- independent from proprietary commands or software menus;
- linked to observable evidence;
- limited to learning outcomes actually exercised by the Challenge.

---

# 6. Machine Model

The Machine model describes the physical or simulated industrial system controlled, observed, or diagnosed in the Lab.

```text
Machine
  ↓
Actuators
  ↓
Sensors
  ↓
Internal State
  ↓
Events
```

The arrows express behavioral interaction, not a fixed execution order. Actuators influence the machine. Sensors observe relevant conditions. Internal state captures behavior not fully represented by exposed signals. Events describe meaningful occurrences and transitions.

## 6.1 Machine

| Field | Required | Definition |
|---|---:|---|
| `id` | Yes | Stable machine identifier. |
| `name` | Yes | Human-readable machine or process name. |
| `type` | Yes | General machine classification without vendor dependence. |
| `description` | Yes | Relevant physical purpose and operating context. |
| `operating_modes` | No | Supported modes such as stopped, manual, automatic, setup, or faulted. |
| `actuators` | Yes | Actuating devices that influence machine behavior. MAY be empty for observation-only Labs. |
| `sensors` | Yes | Devices or logical observations that expose conditions. MAY be empty only when explicitly justified. |
| `internal_state` | Yes | State variables required to explain machine behavior. |
| `events` | Yes | Meaningful machine occurrences and transitions. |
| `safety_assumptions` | No | Simplified safety boundary and conditions assumed by the Lab. |
| `physical_constraints` | No | Motion, capacity, energy, sequence, or process limits. |

## 6.2 Actuators

An actuator represents a controllable machine element, not necessarily an electrical output.

Each actuator SHOULD define:

- `id`;
- name and general type;
- accepted commands;
- possible states;
- default and safe state;
- response characteristics when relevant;
- interlocks or operating constraints;
- feedback references when available.

Examples include motors, valves, cylinders, heaters, brakes, grippers, pumps, and virtual process actuators. The model MUST allow additional actuator types.

## 6.3 Sensors

A sensor represents an observation from the machine or process.

Each sensor SHOULD define:

- `id`;
- name and general type;
- measured or detected property;
- value type and unit;
- normal range or possible states;
- update or response characteristics when relevant;
- quality states such as valid, uncertain, or invalid;
- failure behaviors included in the Lab.

Sensors MAY be discrete, analog, calculated, or event-producing.

## 6.4 Internal State

Internal state represents facts necessary to explain machine behavior that are not direct PLC variables. Examples include position, accumulated material, energy, phase, wear state, or a simulated fault.

Each state item SHOULD define:

- `id`;
- value type;
- initial value;
- allowed range or states;
- unit where applicable;
- update cause;
- observability.

## 6.5 Events

Events represent meaningful occurrences such as state transitions, threshold crossings, completed movements, faults, resets, or external disturbances.

Each event SHOULD define:

- `id`;
- trigger condition;
- payload when applicable;
- effects on Machine state;
- whether it is deterministic, scheduled, external, or fault-induced;
- whether it is visible to the PLC or learner.

## 6.6 Generality rule

The Machine model MUST NOT encode assumptions that all machines transport products, move linearly, use discrete sensors, or follow one fixed sequence. A Lab author specializes the generic model through data.

---

# 7. PLC Model

The PLC model describes a cyclic industrial controller as a logical abstraction. It defines the control boundary and observable controller behavior without prescribing hardware or programming language.

## 7.1 PLC identity

The PLC section SHOULD define:

| Field | Required | Definition |
|---|---:|---|
| `id` | Yes when PLC is in scope | Stable controller identifier. |
| `name` | Yes | Human-readable controller name. |
| `role` | Yes | Controller responsibility within the Lab. |
| `execution_model` | Yes | Expected control execution semantics, normally cyclic scan. |
| `initial_mode` | Yes | Controller mode at Challenge start. |
| `capabilities` | No | Abstract capabilities required by the Lab. |

## 7.2 Inputs

Inputs are values made available to control logic from the Machine, operator intent, another system, or the Lab environment.

Each input SHOULD define an identifier, value type, source reference, initial value, update semantics, and quality behavior.

## 7.3 Outputs

Outputs are controller commands exposed to the Machine or another system.

Each output SHOULD define an identifier, value type, destination reference, initial value, safe value, and update semantics.

## 7.4 Memory

Memory represents retained or non-retained controller state used by the solution. Its lifetime MUST be explicit.

Memory MAY include sequence state, latches, historical samples, setpoints, or intermediate calculations. It MUST NOT duplicate a direct Input or Output without a stated reason.

## 7.5 Timers

Timers represent time-dependent control behavior. Each timer SHOULD define its mode, time base, preset or configuration boundary, elapsed value, output behavior, and reset semantics.

The canonical model describes timer semantics, not vendor instruction names.

## 7.6 Counters

Counters represent event accumulation. Each counter SHOULD define count direction, trigger semantics, limits, initial value, reset behavior, and overflow behavior where relevant.

## 7.7 Tags

Tags provide named controller values not more precisely owned by Inputs, Outputs, Memory, Timers, or Counters. A tag MUST declare its type, purpose, initial value, and lifetime.

## 7.8 Programs

Programs describe logical execution units expected by the Lab. A program definition MAY state responsibility, invocation order, Inputs, Outputs, and acceptance boundaries. It MUST NOT require a vendor language unless a separate optional resource specializes the Lab.

## 7.9 Scan Cycle

The Scan Cycle defines the controller’s observable cyclic behavior. It SHOULD describe:

1. input acquisition;
2. program evaluation;
3. output publication;
4. diagnostic and timing updates.

The model MAY define scan time, scan-time range, execution order, or asynchronous events when they materially affect the Challenge. Exact implementation mechanics remain outside the canonical Lab.

## 7.10 Diagnostics

Diagnostics describe controller-observable health and execution information. They MAY include controller mode, scan duration, invalid signal quality, program fault, communication status, and validation-specific diagnostic facts.

Diagnostics MUST distinguish an industrial fault modeled by the Challenge from a failure of the learning environment.

---

# 8. Variables

Variables form the explicit information contract between the Machine, PLC, Challenge, and Validation model.

Every variable MUST have one primary owner.

## 8.1 Common variable fields

| Field | Required | Definition |
|---|---:|---|
| `id` | Yes | Stable variable identifier. |
| `name` | Yes | Human-readable name. |
| `owner` | Yes | `machine`, `plc`, `shared`, or `derived`. |
| `data_type` | Yes | Logical value type. |
| `initial_value` | Yes | Value at Challenge initialization. MAY be null only when absence is meaningful. |
| `unit` | Conditional | Required for physical quantities. |
| `range` or `allowed_values` | No | Valid domain where constrained. |
| `readable_by` | Yes | Actors allowed to observe the value. |
| `writable_by` | Yes | Actor responsible for changing the value. |
| `description` | Yes | Engineering meaning. |
| `quality` | No | Validity model where signal quality matters. |
| `retention` | No | Lifetime across resets or attempts. |

## 8.2 Machine variables

Machine variables are owned by the physical or simulated Machine. They represent physical state, sensor values, actuator feedback, disturbances, or process conditions.

The PLC MAY read or influence them through mapped Inputs and Outputs, but it does not own their physical truth.

## 8.3 PLC variables

PLC variables are owned by the controller. They include controller Inputs, Outputs, Memory, Tags, Timer state, Counter state, modes, and diagnostics.

## 8.4 Shared variables

Shared variables represent an intentional exchange contract between two or more domain actors. Their producer, consumers, write authority, and synchronization semantics MUST be explicit.

Shared ownership does not mean unrestricted writes. Exactly one authoritative writer SHOULD exist at any moment.

## 8.5 Derived variables

Derived variables are calculated from other variables. They MUST define their source references, expression or semantic rule, update condition, type, and unit.

Derived variables MUST NOT become competing sources of truth. Their authoritative inputs remain the source data.

## 8.6 Mapping

Signal mappings SHOULD connect Machine variables to PLC Inputs and PLC Outputs to Machine commands by stable identifiers. Mapping MUST NOT depend on UI labels or list order.

---

# 9. Challenge

The Challenge defines the industrial problem presented to the learner and the conditions under which it must be solved.

## 9.1 Problem

The Problem explains the industrial situation, its significance, and the learner’s responsibility. It MUST describe the engineering need without prescribing the complete solution.

## 9.2 Initial State

Initial State defines the deterministic starting conditions for the Machine, PLC, Variables, faults, environment, and learner-visible information.

It MUST identify any randomized values and their allowed bounds. A validation attempt MUST be reproducible from its initial-state record.

## 9.3 Expected Behaviour

Expected Behaviour describes the observable result of a valid solution. It SHOULD use states, events, sequences, invariants, ranges, and timing rather than UI actions or proprietary instructions.

## 9.4 Constraints

Constraints define what a solution must respect. They MAY include:

- safety invariants;
- allowed signals and resources;
- sequence restrictions;
- timing or performance limits;
- prohibited bypasses;
- reset and recovery requirements;
- assumptions intentionally simplified for education.

## 9.5 Hints

Hints are ordered learning aids. Each hint SHOULD define:

- `id`;
- content or resource reference;
- availability condition;
- optional score effect;
- related objective or concept.

Hints MUST support reasoning rather than reveal an unexplained final answer.

## 9.6 Completion Conditions

Completion Conditions are the minimum observable conditions required to complete the Challenge. They MUST map to mandatory objectives and Validation rules.

## 9.7 Failure Conditions

Failure Conditions identify outcomes that invalidate an attempt, such as a safety invariant violation, forbidden state, unrecoverable sequence, timeout, or prohibited action.

Failure Conditions MUST distinguish:

- learner-solution failure;
- expected machine fault used by the lesson;
- learning-environment failure that should not penalize the learner.

---

# 10. Validation

Validation determines whether observed evidence satisfies the Lab’s objectives, expected behavior, constraints, completion conditions, and failure conditions.

Validation MUST be defined independently from a particular runtime. A validation rule states what must be true, not which framework function checks it.

## 10.1 Validation rule fields

| Field | Required | Definition |
|---|---:|---|
| `id` | Yes | Stable validation rule identifier. |
| `type` | Yes | Validation category. |
| `description` | Yes | Human-readable acceptance statement. |
| `severity` | Yes | `required`, `advisory`, or `bonus`. |
| `objective_refs` | Yes | Objectives evaluated by this rule. |
| `observations` | Yes | Variables, states, events, or evidence used. |
| `condition` | Yes | Implementation-independent condition to satisfy. |
| `evaluation_window` | No | State, event, or time interval over which it is evaluated. |
| `tolerance` | No | Accepted numeric or timing tolerance. |
| `failure_message` | No | Learner-facing explanation when appropriate. |

## 10.2 Automatic validation

Automatic validation evaluates evidence without a reviewer. Rules MUST be deterministic for the same initial state and observation history.

## 10.3 Manual validation

Manual validation uses a defined rubric when engineering reasoning, documentation, or design quality cannot be assessed reliably by an automatic rule. The reviewer and evidence MUST be recorded.

## 10.4 Simulation validation

Simulation validation evaluates behavior in a modeled Machine and PLC environment. It MUST declare relevant simulation assumptions and MUST NOT claim physical validation beyond those assumptions.

## 10.5 State validation

State validation checks values, modes, combinations, invariants, or transitions. It MAY evaluate a single state or a sequence of states.

## 10.6 Timing validation

Timing validation checks duration, delay, response time, ordering, frequency, timeout, or scan-related behavior. It MUST declare time units, measurement boundaries, and tolerances.

## 10.7 Validation outcome

A Validation result SHOULD contain:

- overall status;
- rule-by-rule results;
- observed evidence;
- objective completion;
- failure conditions encountered;
- score when scoring is enabled;
- validation environment and model versions;
- timestamp.

Passing Validation demonstrates conformance to this Lab’s defined conditions. It does not establish universal correctness outside the stated model and assumptions.

---

# 11. Resources

Resources are optional learning materials associated with a Lab. A Resource supports understanding or execution but MUST NOT contain canonical data that belongs to another Lab section.

## 11.1 Resource types

- **Documentation:** explanations, reference material, procedures, or conceptual notes.
- **Video:** demonstrations, observations, walkthroughs, or lectures.
- **Schematics:** electrical, pneumatic, hydraulic, mechanical, process, or signal diagrams.
- **Downloads:** datasets, templates, project files, or printable material.
- **External references:** third-party standards, documentation, research, or public resources.

## 11.2 Resource fields

Each Resource SHOULD define:

- stable `id`;
- `type`;
- title and description;
- location or content reference;
- language;
- optional objective or hint relationship;
- access requirements;
- license or usage terms where relevant;
- integrity or version information for downloadable files;
- whether it is required or supplementary.

External references SHOULD be replaceable and MUST NOT become the sole source for essential Lab meaning.

---

# 12. Progress

Progress records a learner’s or group’s relationship with a specific Lab version. It is not part of the canonical Lab definition and MUST NOT modify it.

## 12.1 Progress fields

| Field | Required | Definition |
|---|---:|---|
| `subject_id` | Yes | Learner or group identifier. |
| `lab_id` | Yes | Referenced Lab identifier. |
| `lab_version` | Yes | Lab version attempted. |
| `status` | Yes | `not_started`, `in_progress`, `completed`, or an approved future state. |
| `completed` | Yes | Whether all mandatory completion conditions were satisfied. |
| `attempts` | Yes | Count and/or records of started attempts. |
| `best_score` | No | Highest comparable score for this Lab version. |
| `time` | Yes | Accumulated active time and optional per-attempt durations with units. |
| `objective_progress` | Yes | Outcome for each mandatory, optional, and bonus objective. |
| `achievements` | No | Achievement identifiers earned through defined criteria. |
| `last_activity_at` | No | Most recent learner activity timestamp. |
| `completed_at` | No | First or latest completion timestamp, as policy defines. |

## 12.2 Attempts

An Attempt SHOULD record:

- unique attempt identifier;
- start and end time;
- initial-state identity or seed;
- completion status;
- validation result reference;
- score;
- hints used;
- failure conditions encountered;
- environment and model versions.

## 12.3 Best Score

Best Score MAY be used only when scoring rules are stable and comparable for the referenced Lab version. A Lab version change MAY require score separation or invalidation.

## 12.4 Time

Time MUST distinguish estimated duration from measured learner activity. The progress policy SHOULD define whether paused, idle, review, and validation time are included.

## 12.5 Achievements

Achievements MUST reference defined criteria. They MUST NOT be awarded through undocumented behavior or replace objective completion.

---

# 13. Future Extensions

The core model supports future capabilities through explicit adapters, execution environments, additional resources, and extension namespaces. Future extensions MUST preserve the canonical meaning of the Lab.

## 13.1 Digital Twin

A Digital Twin can implement the Machine state, actuator response, sensor behavior, events, and physical constraints. The Lab remains independent from a particular twin engine.

## 13.2 OPC UA

An OPC UA integration can map canonical Variables to an external information model. Node identifiers, namespaces, and transport details belong to an integration mapping, not to core variable identity.

## 13.3 Industrial AI

Industrial AI can support hints, diagnosis, explanation, assessment assistance, or scenario generation. AI output MUST NOT silently redefine objectives, constraints, or validation. Authoritative completion remains governed by approved Validation rules.

## 13.4 Real PLCs

A real-controller adapter can map canonical PLC Inputs, Outputs, Tags, Timers, Counters, Programs, diagnostics, and execution assumptions to physical equipment. Hardware safety and access requirements require a separate execution specification.

## 13.5 Collaborative Labs

Progress and Attempts can associate a group subject with roles, contributions, shared evidence, and review outcomes. Collaboration MUST NOT weaken individual or group objective clarity.

## 13.6 Multiplayer

Multiplayer execution can add participants, roles, authority, synchronized events, and shared state. Concurrency and conflict policies belong to the execution model, while the Lab retains its canonical objectives and validation.

## 13.7 Cloud Execution

A cloud environment can host simulation, validation, persistence, or collaboration. The canonical Lab MUST remain portable and MUST NOT require one cloud provider.

## 13.8 Extension governance

An extension MUST:

- declare its owner and version;
- avoid collision with canonical fields;
- define whether it is optional or required for a particular execution profile;
- remain ignorable by consumers that do not support it, unless the Lab explicitly declares that execution profile as required;
- never override canonical identity or Validation meaning silently.

---

# 14. JSON Example

The following example is illustrative. It demonstrates the complete model using a small liquid-transfer station; it does not prescribe storage format, runtime logic, UI, or a machine template.

`progress_example` illustrates a separate learner record and is not canonical Lab content.

```json
{
  "lab": {
    "metadata": {
      "id": "D2R-LAB-001",
      "slug": "safe-liquid-transfer-sequence",
      "title": "Safe Liquid Transfer Sequence",
      "subtitle": "Control, monitor, and validate a batch transfer",
      "description": "Develop and validate a controller sequence that transfers liquid from a source vessel to a receiving vessel while respecting level and fault constraints.",
      "category": "sequence-control",
      "difficulty": "introductory",
      "estimated_time": {
        "value": 45,
        "unit": "minute"
      },
      "language": "en",
      "version": "1.0.0",
      "model_version": "SPEC-001",
      "status": "draft",
      "author": {
        "id": "digital2real-academy",
        "name": "Digital2Real Academy"
      },
      "reviewers": [],
      "tags": [
        "sequence",
        "pump",
        "level",
        "diagnostics"
      ],
      "prerequisites": [
        {
          "type": "knowledge",
          "id": "discrete-signals",
          "description": "Understand discrete Inputs and Outputs."
        }
      ],
      "created_at": "2026-07-19T00:00:00Z",
      "updated_at": "2026-07-19T00:00:00Z",
      "published_at": null,
      "license": "To be defined"
    },
    "objectives": [
      {
        "id": "OBJ-START-INTERLOCKS",
        "type": "mandatory",
        "statement": "Apply the required permissive conditions before starting the transfer pump.",
        "evidence": "The pump starts only when the source contains liquid, the receiver has capacity, and no active fault exists.",
        "weight": 40,
        "related_validation_rules": [
          "VAL-SAFE-START"
        ],
        "prerequisites": []
      },
      {
        "id": "OBJ-STOP-CONDITIONS",
        "type": "mandatory",
        "statement": "Stop transfer safely when the receiving vessel reaches its target level or a critical permissive is lost.",
        "evidence": "The output and machine response satisfy every defined stop condition.",
        "weight": 40,
        "related_validation_rules": [
          "VAL-TARGET-STOP",
          "VAL-FAULT-STOP"
        ],
        "prerequisites": [
          "OBJ-START-INTERLOCKS"
        ]
      },
      {
        "id": "OBJ-DIAGNOSTIC",
        "type": "optional",
        "statement": "Expose a diagnostic state explaining why transfer cannot start.",
        "evidence": "A diagnostic value identifies the active blocking condition.",
        "weight": 10,
        "related_validation_rules": [
          "VAL-DIAGNOSTIC"
        ],
        "prerequisites": []
      },
      {
        "id": "OBJ-RESPONSE",
        "type": "bonus",
        "statement": "Stop the pump within the tighter bonus response target after a critical fault.",
        "evidence": "The measured stop response is within the bonus limit.",
        "weight": 10,
        "related_validation_rules": [
          "VAL-BONUS-RESPONSE"
        ],
        "prerequisites": [
          "OBJ-STOP-CONDITIONS"
        ]
      }
    ],
    "machine": {
      "id": "MACHINE-TRANSFER-01",
      "name": "Liquid Transfer Station",
      "type": "batch-transfer-unit",
      "description": "A source vessel, receiving vessel, and transfer pump represented as one controlled process unit.",
      "operating_modes": [
        "stopped",
        "automatic",
        "faulted"
      ],
      "actuators": [
        {
          "id": "ACT-PUMP-01",
          "name": "Transfer Pump",
          "type": "pump",
          "commands": [
            "stop",
            "run"
          ],
          "states": [
            "stopped",
            "starting",
            "running",
            "faulted"
          ],
          "default_state": "stopped",
          "safe_state": "stopped",
          "response": {
            "start_delay": 250,
            "stop_delay": 150,
            "unit": "millisecond"
          },
          "constraints": [
            "MUST NOT run when source_low is true",
            "MUST NOT run when receiver_high is true"
          ],
          "feedback_refs": [
            "VAR-MACHINE-PUMP-RUNNING"
          ]
        }
      ],
      "sensors": [
        {
          "id": "SNS-SOURCE-LOW",
          "name": "Source Low Level",
          "type": "discrete-level",
          "property": "source_low",
          "data_type": "boolean",
          "unit": null,
          "allowed_values": [
            false,
            true
          ],
          "quality_states": [
            "valid",
            "invalid"
          ]
        },
        {
          "id": "SNS-RECEIVER-LEVEL",
          "name": "Receiver Level",
          "type": "continuous-level",
          "property": "receiver_level",
          "data_type": "number",
          "unit": "percent",
          "normal_range": {
            "minimum": 0,
            "maximum": 100
          },
          "quality_states": [
            "valid",
            "invalid"
          ]
        }
      ],
      "internal_state": [
        {
          "id": "STATE-SOURCE-VOLUME",
          "data_type": "number",
          "initial_value": 60,
          "range": {
            "minimum": 0,
            "maximum": 100
          },
          "unit": "percent",
          "update_cause": "Decreases while the pump transfers liquid.",
          "observability": "indirect"
        },
        {
          "id": "STATE-RECEIVER-VOLUME",
          "data_type": "number",
          "initial_value": 20,
          "range": {
            "minimum": 0,
            "maximum": 100
          },
          "unit": "percent",
          "update_cause": "Increases while the pump transfers liquid.",
          "observability": "direct"
        }
      ],
      "events": [
        {
          "id": "EVT-TARGET-REACHED",
          "trigger": "STATE-RECEIVER-VOLUME is greater than or equal to 80 percent",
          "payload": {
            "state_ref": "STATE-RECEIVER-VOLUME"
          },
          "effects": [
            "VAR-MACHINE-RECEIVER-HIGH becomes true"
          ],
          "origin": "deterministic",
          "visible_to": [
            "machine",
            "plc",
            "validation"
          ]
        },
        {
          "id": "EVT-PUMP-FAULT",
          "trigger": "Fault scenario activates during transfer",
          "payload": {
            "fault_code": "PUMP_TRIP"
          },
          "effects": [
            "ACT-PUMP-01 enters faulted state"
          ],
          "origin": "fault-induced",
          "visible_to": [
            "machine",
            "plc",
            "validation"
          ]
        }
      ],
      "safety_assumptions": [
        "The Lab models control behavior only and does not represent a complete physical safety system.",
        "Emergency protection is outside the learner-editable control boundary."
      ],
      "physical_constraints": [
        "Receiver level MUST remain at or below 100 percent.",
        "Transfer flow is positive only while the pump is running."
      ]
    },
    "plc": {
      "id": "PLC-CONTROLLER-01",
      "name": "Transfer Controller",
      "role": "Control the automatic transfer sequence and expose diagnostics.",
      "execution_model": "cyclic-scan",
      "initial_mode": "run",
      "capabilities": [
        "boolean-logic",
        "timing",
        "state-memory",
        "diagnostics"
      ],
      "inputs": [
        {
          "id": "PLC-IN-START",
          "data_type": "boolean",
          "source_ref": "VAR-SHARED-START-REQUEST",
          "initial_value": false,
          "update_semantics": "Acquired at the beginning of each scan.",
          "quality_behavior": "Invalid quality prevents start."
        },
        {
          "id": "PLC-IN-SOURCE-LOW",
          "data_type": "boolean",
          "source_ref": "VAR-MACHINE-SOURCE-LOW",
          "initial_value": false,
          "update_semantics": "Acquired at the beginning of each scan.",
          "quality_behavior": "Invalid quality is treated as unsafe."
        },
        {
          "id": "PLC-IN-RECEIVER-HIGH",
          "data_type": "boolean",
          "source_ref": "VAR-MACHINE-RECEIVER-HIGH",
          "initial_value": false,
          "update_semantics": "Acquired at the beginning of each scan.",
          "quality_behavior": "Invalid quality is treated as unsafe."
        },
        {
          "id": "PLC-IN-PUMP-FAULT",
          "data_type": "boolean",
          "source_ref": "VAR-MACHINE-PUMP-FAULT",
          "initial_value": false,
          "update_semantics": "Acquired at the beginning of each scan.",
          "quality_behavior": "Invalid quality is treated as a fault."
        }
      ],
      "outputs": [
        {
          "id": "PLC-OUT-PUMP-RUN",
          "data_type": "boolean",
          "destination_ref": "VAR-SHARED-PUMP-COMMAND",
          "initial_value": false,
          "safe_value": false,
          "update_semantics": "Published at the end of each completed scan."
        }
      ],
      "memory": [
        {
          "id": "PLC-MEM-SEQUENCE-ACTIVE",
          "data_type": "boolean",
          "initial_value": false,
          "retention": "non-retained",
          "purpose": "Remember that an accepted automatic transfer is active."
        }
      ],
      "timers": [
        {
          "id": "PLC-TIMER-START-CONFIRM",
          "mode": "on-delay",
          "time_base": "millisecond",
          "preset": 500,
          "elapsed_initial": 0,
          "output_behavior": "True after continuous pump feedback for the preset duration.",
          "reset_semantics": "Reset when pump feedback is false."
        }
      ],
      "counters": [
        {
          "id": "PLC-COUNTER-COMPLETED-BATCHES",
          "direction": "up",
          "trigger": "A transfer changes from active to complete without failure.",
          "initial_value": 0,
          "minimum": 0,
          "maximum": 999,
          "reset_semantics": "Reset only by an explicit maintenance action.",
          "overflow_behavior": "Remain at maximum."
        }
      ],
      "tags": [
        {
          "id": "PLC-TAG-BLOCKING-REASON",
          "data_type": "string",
          "purpose": "Identify why an automatic transfer cannot start.",
          "initial_value": "NONE",
          "retention": "non-retained"
        }
      ],
      "programs": [
        {
          "id": "PLC-PROGRAM-TRANSFER",
          "responsibility": "Evaluate permissives, sequence transfer, stop safely, and update diagnostics.",
          "invocation_order": 1,
          "input_refs": [
            "PLC-IN-START",
            "PLC-IN-SOURCE-LOW",
            "PLC-IN-RECEIVER-HIGH",
            "PLC-IN-PUMP-FAULT"
          ],
          "output_refs": [
            "PLC-OUT-PUMP-RUN",
            "PLC-TAG-BLOCKING-REASON"
          ]
        }
      ],
      "scan_cycle": {
        "phases": [
          "acquire-inputs",
          "evaluate-programs",
          "publish-outputs",
          "update-diagnostics"
        ],
        "nominal_time": 20,
        "maximum_time": 50,
        "unit": "millisecond"
      },
      "diagnostics": [
        {
          "id": "PLC-DIAG-SCAN-TIME",
          "data_type": "number",
          "unit": "millisecond",
          "meaning": "Duration of the most recent completed scan."
        },
        {
          "id": "PLC-DIAG-CONTROLLER-MODE",
          "data_type": "string",
          "allowed_values": [
            "run",
            "stopped",
            "faulted"
          ],
          "meaning": "Current abstract controller execution mode."
        }
      ]
    },
    "variables": {
      "machine_variables": [
        {
          "id": "VAR-MACHINE-SOURCE-LOW",
          "name": "Source Low",
          "owner": "machine",
          "data_type": "boolean",
          "initial_value": false,
          "unit": null,
          "allowed_values": [
            false,
            true
          ],
          "readable_by": [
            "plc",
            "validation"
          ],
          "writable_by": [
            "machine"
          ],
          "description": "True when the source vessel no longer contains enough liquid for transfer.",
          "quality": "valid",
          "retention": "attempt"
        },
        {
          "id": "VAR-MACHINE-RECEIVER-HIGH",
          "name": "Receiver High",
          "owner": "machine",
          "data_type": "boolean",
          "initial_value": false,
          "unit": null,
          "allowed_values": [
            false,
            true
          ],
          "readable_by": [
            "plc",
            "validation"
          ],
          "writable_by": [
            "machine"
          ],
          "description": "True when the receiving vessel reaches the target level.",
          "quality": "valid",
          "retention": "attempt"
        },
        {
          "id": "VAR-MACHINE-PUMP-FAULT",
          "name": "Pump Fault",
          "owner": "machine",
          "data_type": "boolean",
          "initial_value": false,
          "unit": null,
          "allowed_values": [
            false,
            true
          ],
          "readable_by": [
            "plc",
            "validation"
          ],
          "writable_by": [
            "machine",
            "lab-environment"
          ],
          "description": "True when the modeled pump fault is active.",
          "quality": "valid",
          "retention": "attempt"
        },
        {
          "id": "VAR-MACHINE-PUMP-RUNNING",
          "name": "Pump Running Feedback",
          "owner": "machine",
          "data_type": "boolean",
          "initial_value": false,
          "unit": null,
          "allowed_values": [
            false,
            true
          ],
          "readable_by": [
            "plc",
            "validation"
          ],
          "writable_by": [
            "machine"
          ],
          "description": "Observed running state of the transfer pump.",
          "quality": "valid",
          "retention": "attempt"
        }
      ],
      "plc_variables": [
        {
          "id": "VAR-PLC-SEQUENCE-ACTIVE",
          "name": "Sequence Active",
          "owner": "plc",
          "data_type": "boolean",
          "initial_value": false,
          "unit": null,
          "allowed_values": [
            false,
            true
          ],
          "readable_by": [
            "plc",
            "validation"
          ],
          "writable_by": [
            "plc"
          ],
          "description": "Controller state indicating an accepted transfer is active.",
          "retention": "non-retained"
        }
      ],
      "shared_variables": [
        {
          "id": "VAR-SHARED-START-REQUEST",
          "name": "Start Request",
          "owner": "shared",
          "data_type": "boolean",
          "initial_value": false,
          "unit": null,
          "allowed_values": [
            false,
            true
          ],
          "readable_by": [
            "plc",
            "validation"
          ],
          "writable_by": [
            "learner-environment"
          ],
          "description": "Request to begin an automatic transfer.",
          "retention": "attempt"
        },
        {
          "id": "VAR-SHARED-PUMP-COMMAND",
          "name": "Pump Run Command",
          "owner": "shared",
          "data_type": "boolean",
          "initial_value": false,
          "unit": null,
          "allowed_values": [
            false,
            true
          ],
          "readable_by": [
            "machine",
            "validation"
          ],
          "writable_by": [
            "plc"
          ],
          "description": "Controller command requesting pump operation.",
          "retention": "attempt"
        }
      ],
      "derived_variables": [
        {
          "id": "VAR-DERIVED-START-PERMITTED",
          "name": "Start Permitted",
          "owner": "derived",
          "data_type": "boolean",
          "initial_value": true,
          "unit": null,
          "allowed_values": [
            false,
            true
          ],
          "readable_by": [
            "validation"
          ],
          "writable_by": [
            "derivation-engine"
          ],
          "description": "True when source is available, receiver target is not reached, and no pump fault is active.",
          "source_refs": [
            "VAR-MACHINE-SOURCE-LOW",
            "VAR-MACHINE-RECEIVER-HIGH",
            "VAR-MACHINE-PUMP-FAULT"
          ],
          "derivation": "NOT source_low AND NOT receiver_high AND NOT pump_fault",
          "update_condition": "Whenever any source variable changes.",
          "retention": "none"
        }
      ],
      "mappings": [
        {
          "source_ref": "VAR-MACHINE-SOURCE-LOW",
          "target_ref": "PLC-IN-SOURCE-LOW"
        },
        {
          "source_ref": "VAR-MACHINE-RECEIVER-HIGH",
          "target_ref": "PLC-IN-RECEIVER-HIGH"
        },
        {
          "source_ref": "VAR-MACHINE-PUMP-FAULT",
          "target_ref": "PLC-IN-PUMP-FAULT"
        },
        {
          "source_ref": "VAR-SHARED-START-REQUEST",
          "target_ref": "PLC-IN-START"
        },
        {
          "source_ref": "PLC-OUT-PUMP-RUN",
          "target_ref": "VAR-SHARED-PUMP-COMMAND"
        }
      ]
    },
    "challenge": {
      "problem": "The transfer station must move liquid into the receiving vessel automatically. The existing control behavior does not consistently enforce permissives or stop safely when conditions change.",
      "initial_state": {
        "machine_mode": "stopped",
        "plc_mode": "run",
        "variable_overrides": {
          "VAR-MACHINE-SOURCE-LOW": false,
          "VAR-MACHINE-RECEIVER-HIGH": false,
          "VAR-MACHINE-PUMP-FAULT": false,
          "VAR-SHARED-START-REQUEST": false
        },
        "randomization": null,
        "faults_active": []
      },
      "expected_behaviour": [
        "A valid start request begins transfer only while every start permissive is true.",
        "Transfer remains active after the momentary start request is removed.",
        "The pump stops when the receiving vessel reaches its target level.",
        "The pump stops when source-low or pump-fault becomes active.",
        "A blocked start exposes the applicable diagnostic reason."
      ],
      "constraints": [
        "The pump command MUST remain false while any critical permissive is false.",
        "A critical fault MUST NOT be bypassed.",
        "A new transfer MUST require a new start request after completion or failure.",
        "The receiving vessel MUST NOT exceed 100 percent level."
      ],
      "hints": [
        {
          "id": "HINT-PERMISSIVE",
          "content": "Separate the conditions that permit a start from the conditions that permit continued operation.",
          "availability_condition": "Available after the first failed attempt.",
          "score_effect": 0,
          "objective_refs": [
            "OBJ-START-INTERLOCKS",
            "OBJ-STOP-CONDITIONS"
          ]
        },
        {
          "id": "HINT-DIAGNOSTIC",
          "content": "A diagnostic is clearer when each blocking condition has one stable meaning.",
          "availability_condition": "Available at any time.",
          "score_effect": 0,
          "objective_refs": [
            "OBJ-DIAGNOSTIC"
          ]
        }
      ],
      "completion_conditions": [
        "VAL-SAFE-START passes",
        "VAL-TARGET-STOP passes",
        "VAL-FAULT-STOP passes",
        "No required failure condition is encountered"
      ],
      "failure_conditions": [
        {
          "id": "FAIL-PUMP-WITHOUT-PERMISSIVE",
          "type": "learner-solution",
          "condition": "Pump command is true while start permission is false."
        },
        {
          "id": "FAIL-OVERFILL",
          "type": "learner-solution",
          "condition": "Receiver level exceeds 100 percent."
        },
        {
          "id": "FAIL-ENVIRONMENT",
          "type": "learning-environment",
          "condition": "The simulator cannot produce a valid state update.",
          "learner_penalty": false
        }
      ]
    },
    "validation": {
      "strategy": "automatic-with-optional-manual-review",
      "rules": [
        {
          "id": "VAL-SAFE-START",
          "type": "state-validation",
          "description": "The pump starts only when every start permissive is satisfied.",
          "severity": "required",
          "objective_refs": [
            "OBJ-START-INTERLOCKS"
          ],
          "observations": [
            "VAR-DERIVED-START-PERMITTED",
            "VAR-SHARED-START-REQUEST",
            "VAR-SHARED-PUMP-COMMAND"
          ],
          "condition": "Pump command may transition to true only when start request and start permission are both true.",
          "evaluation_window": "From initialization until transfer becomes active.",
          "tolerance": null,
          "failure_message": "The pump started without all required permissives."
        },
        {
          "id": "VAL-TARGET-STOP",
          "type": "timing-validation",
          "description": "The pump stops after the receiving target is reached.",
          "severity": "required",
          "objective_refs": [
            "OBJ-STOP-CONDITIONS"
          ],
          "observations": [
            "EVT-TARGET-REACHED",
            "VAR-SHARED-PUMP-COMMAND"
          ],
          "condition": "Pump command becomes false no later than 100 milliseconds after the target event is visible to the PLC.",
          "evaluation_window": "From EVT-TARGET-REACHED until pump command is false.",
          "tolerance": {
            "maximum": 100,
            "unit": "millisecond"
          },
          "failure_message": "The pump did not stop within the allowed target response time."
        },
        {
          "id": "VAL-FAULT-STOP",
          "type": "simulation-validation",
          "description": "A pump fault causes the command to stop and prevents restart.",
          "severity": "required",
          "objective_refs": [
            "OBJ-STOP-CONDITIONS"
          ],
          "observations": [
            "EVT-PUMP-FAULT",
            "VAR-MACHINE-PUMP-FAULT",
            "VAR-SHARED-PUMP-COMMAND"
          ],
          "condition": "Pump command becomes false within the required response and remains false while the fault is active.",
          "evaluation_window": "From EVT-PUMP-FAULT until fault reset.",
          "tolerance": {
            "maximum": 100,
            "unit": "millisecond"
          },
          "failure_message": "The control solution did not respond safely to the pump fault."
        },
        {
          "id": "VAL-DIAGNOSTIC",
          "type": "manual-validation",
          "description": "Blocking diagnostics are specific and understandable.",
          "severity": "advisory",
          "objective_refs": [
            "OBJ-DIAGNOSTIC"
          ],
          "observations": [
            "PLC-TAG-BLOCKING-REASON",
            "learner-explanation"
          ],
          "condition": "A reviewer confirms that each modeled blocking condition has a distinct and accurate diagnostic meaning.",
          "evaluation_window": "After automatic validation completes.",
          "tolerance": null,
          "failure_message": "The diagnostic does not clearly identify the blocking condition."
        },
        {
          "id": "VAL-BONUS-RESPONSE",
          "type": "timing-validation",
          "description": "The pump command stops within the bonus response target after a critical fault.",
          "severity": "bonus",
          "objective_refs": [
            "OBJ-RESPONSE"
          ],
          "observations": [
            "EVT-PUMP-FAULT",
            "VAR-SHARED-PUMP-COMMAND"
          ],
          "condition": "Pump command becomes false no later than 50 milliseconds after the fault is visible to the PLC.",
          "evaluation_window": "From EVT-PUMP-FAULT until pump command is false.",
          "tolerance": {
            "maximum": 50,
            "unit": "millisecond"
          },
          "failure_message": "The solution is safe but did not meet the bonus response target."
        }
      ],
      "result_fields": [
        "overall_status",
        "rule_results",
        "observed_evidence",
        "objective_completion",
        "failure_conditions",
        "score",
        "environment_version",
        "timestamp"
      ]
    },
    "resources": [
      {
        "id": "RES-SEQUENCE-GUIDE",
        "type": "documentation",
        "title": "Sequence and Interlock Principles",
        "description": "Conceptual guidance for separating start permissives, run permissives, and stop conditions.",
        "location": "academy-resource:sequence-and-interlock-principles",
        "language": "en",
        "objective_refs": [
          "OBJ-START-INTERLOCKS",
          "OBJ-STOP-CONDITIONS"
        ],
        "access": "included",
        "license": "To be defined",
        "required": false
      },
      {
        "id": "RES-TRANSFER-SCHEMATIC",
        "type": "schematic",
        "title": "Liquid Transfer Functional Schematic",
        "description": "Implementation-independent representation of vessels, pump, signals, and flow direction.",
        "location": "academy-resource:liquid-transfer-functional-schematic",
        "language": "en",
        "objective_refs": [],
        "access": "included",
        "license": "To be defined",
        "required": true
      }
    ]
  },
  "progress_example": {
    "subject_id": "LEARNER-EXAMPLE",
    "lab_id": "D2R-LAB-001",
    "lab_version": "1.0.0",
    "status": "in_progress",
    "completed": false,
    "attempts": [
      {
        "id": "ATTEMPT-EXAMPLE-001",
        "started_at": "2026-07-19T09:00:00Z",
        "ended_at": "2026-07-19T09:18:00Z",
        "initial_state_ref": "DEFAULT",
        "initial_state_seed": null,
        "status": "failed",
        "validation_result_ref": "VALIDATION-EXAMPLE-001",
        "score": 40,
        "hints_used": [
          "HINT-PERMISSIVE"
        ],
        "failure_conditions": [
          "FAIL-PUMP-WITHOUT-PERMISSIVE"
        ],
        "environment_version": "illustrative",
        "model_version": "SPEC-001"
      }
    ],
    "best_score": 40,
    "time": {
      "active": 18,
      "unit": "minute"
    },
    "objective_progress": [
      {
        "objective_id": "OBJ-START-INTERLOCKS",
        "status": "completed"
      },
      {
        "objective_id": "OBJ-STOP-CONDITIONS",
        "status": "in_progress"
      },
      {
        "objective_id": "OBJ-DIAGNOSTIC",
        "status": "not_started"
      },
      {
        "objective_id": "OBJ-RESPONSE",
        "status": "not_started"
      }
    ],
    "achievements": [],
    "last_activity_at": "2026-07-19T09:18:00Z",
    "completed_at": null
  }
}
```

---

# 15. Architectural Decisions

## AD-001 — A Lab is a domain definition, not a presentation

**Decision:** The canonical model is independent from UI, framework, storage, and runtime.

**Why:** One Lab must be reusable across editorial explanation, simulation, assessment, and future execution environments without duplicating its meaning.

## AD-002 — Educational intent is mandatory

**Decision:** Every Lab requires measurable objectives linked to evidence and Validation.

**Why:** A technical demonstration without a learning outcome does not satisfy the Academy purpose.

## AD-003 — Machine and PLC are separate abstractions

**Decision:** Physical or simulated process truth belongs to Machine; controller state and control execution belong to PLC.

**Why:** This separation preserves engineering meaning, prevents signal ownership ambiguity, and allows either side to be simulated or replaced independently.

## AD-004 — The Machine model is generic

**Decision:** Machines are described through actuators, sensors, internal state, events, and constraints rather than a fixed machine template.

**Why:** Academy must support diverse industrial systems without redesigning its core model for every machine type.

## AD-005 — The PLC model is vendor neutral

**Decision:** PLC concepts use abstract Inputs, Outputs, Memory, Timers, Counters, Tags, Programs, Scan Cycle, and Diagnostics.

**Why:** Learning should transfer across platforms, and future adapters should not alter canonical Lab content.

## AD-006 — Every variable has one primary owner

**Decision:** Variables are classified as Machine, PLC, Shared, or Derived, with explicit read and write authority.

**Why:** Ownership prevents duplicated responsibility, contradictory state, and hidden coupling.

## AD-007 — Shared does not mean uncontrolled

**Decision:** Shared variables define exchange contracts and SHOULD have one authoritative writer at a time.

**Why:** Multiple readers are common, but ambiguous write authority produces nondeterministic behavior.

## AD-008 — Derived values are not new sources of truth

**Decision:** Derived variables reference authoritative inputs and declare their derivation.

**Why:** Calculated convenience must not duplicate or compete with its source data.

## AD-009 — Challenge and Validation are separate

**Decision:** Challenge explains the problem and required outcome; Validation defines the evidence and decision rules.

**Why:** Separation keeps learning narrative readable while making assessment precise and reusable.

## AD-010 — Multiple validation modes are first-class

**Decision:** Automatic, manual, simulation, state, and timing validation are supported.

**Why:** Industrial competence includes observable behavior and engineering reasoning; no single validation mode covers both reliably.

## AD-011 — Validation declares assumptions and tolerances

**Decision:** Rules must specify evidence, evaluation boundaries, and tolerance when relevant.

**Why:** A pass result is meaningful only within known conditions and measurement limits.

## AD-012 — Progress is separate from Lab definition

**Decision:** Learner Progress references an immutable Lab identity and version but does not live inside or alter canonical content.

**Why:** Many learners and attempts must use the same authoritative Lab without creating copies or state conflicts.

## AD-013 — Version is part of assessment identity

**Decision:** Progress and Validation results reference the exact Lab version and model version.

**Why:** Scores and completion are not necessarily comparable after objectives or acceptance conditions change.

## AD-014 — Resources are optional and non-authoritative

**Decision:** Resources support the Lab but do not replace canonical objectives, system definitions, or Validation criteria.

**Why:** External files and links can change; essential Lab meaning must remain stable.

## AD-015 — Future integrations use adapters and extensions

**Decision:** Digital Twins, industrial communication, AI, real controllers, collaboration, multiplayer, and cloud execution extend the model through explicit boundaries.

**Why:** This preserves vendor neutrality and allows new execution environments without rewriting existing Labs.

## AD-016 — No runtime is selected by this specification

**Decision:** SPEC-001 defines functional meaning only.

**Why:** A domain model must be approved before storage, schema validation, simulation, or execution technology is chosen. This avoids speculative architecture.

---

# Summary

SPEC-001 defines a Digital2Real Lab as a versioned, vendor-neutral, data-driven learning definition composed of Metadata, Objectives, Machine, PLC, Variables, Challenge, Validation, Resources, and separate learner Progress.

The model supports any industrial machine, makes ownership and observable outcomes explicit, and remains independent from presentation and runtime technology. Every future Lab must conform to this model or an approved successor.

# Future Dependencies

The specification creates functional dependencies for future work but does not select implementations:

- a controlled vocabulary for categories, tags, difficulty, units, and lifecycle status;
- a formal schema and schema-versioning policy;
- a Lab authoring and engineering review workflow;
- an execution-environment contract;
- a simulation model contract;
- a Validation rule expression specification;
- a scoring and achievement policy;
- a Progress privacy, identity, and retention policy;
- a resource storage, integrity, accessibility, and licensing policy;
- vendor or protocol adapter specifications when concrete requirements exist;
- safety governance for Labs connected to physical equipment.

# Questions for Product Owner

1. Which learner profiles define the meaning of each difficulty level?
2. Are all published Labs required to support simulation, or may some be manual or explanation-only?
3. Can a Lab omit the PLC section when the learning objective concerns another controller or an observation-only machine problem?
4. Which natural languages must the first Lab catalogue support, and how will translated variants share identity and versioning?
5. Is scoring required for every Lab, optional by Lab, or deferred in favor of completion only?
6. Should optional objectives affect completion percentage, or be reported separately?
7. What constitutes an Academy achievement, and can achievements span multiple Labs?
8. When a published Lab changes materially, should existing learner completion remain valid, require revalidation, or follow a per-Lab policy?
9. Which evidence requires human review, and who is authorized to approve manual Validation?
10. Are collaborative outcomes assessed for the group, each learner, or both?
11. What safety and supervision boundary is required before any Lab can interact with real equipment?
12. Which resource licenses and external-reference policies are acceptable for published Academy content?
13. Should Labs permit controlled randomization by default, or only when reproducibility through a recorded seed is guaranteed?
14. Which Product Owner-approved taxonomy should replace the illustrative category and prerequisite values?
