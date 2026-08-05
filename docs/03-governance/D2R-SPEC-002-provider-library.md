# Provider Library

| Field | Value |
|---|---|
| Document ID | D2R-SPEC-002 |
| Version | 1.0.0 |
| Status | Approved baseline |
| Owner | Digital2Real Architecture |
| Scope | Governed sources of information requested by Experience Blueprints |

## Purpose

The Provider Library defines the canonical categories from which an Experience may request industrial information. A Provider describes the authority and semantics of information; it is not a software service, data connector, vendor integration, runtime API, or artifact renderer.

Blueprints request Providers through [D2R-SPEC-003](D2R-SPEC-003-blueprint-schema.md). Providers may be represented through artifacts governed by [D2R-SPEC-004](D2R-SPEC-004-engineering-artifact-library.md), while the educational role of the resulting information follows [D2R-SPEC-001](D2R-SPEC-001-experience-information-model.md).

Provider requests move through review and production only under [D2R-FACTORY-001](D2R-FACTORY-001-experience-production-workflow.md).

## Provider Philosophy

- Source authority must be explicit before information becomes Evidence.
- Provider categories remain vendor-neutral; bounded Experience parameters may be vendor-specific.
- Providers expose information, not answers or hidden diagnostic logic.
- One information responsibility should have one Provider authority.
- A Provider request describes a production need and does not guarantee implementation support.
- The same Provider may serve different Experiences through different approved parameters.
- Provider output must remain traceable to its Blueprint request and resulting artifact.

## Provider Categories

| Provider ID | Category | Information authority |
|---|---|---|
| `PROV-FIELD` | Field | Observable equipment and process state |
| `PROV-PLC` | PLC | Controller status, execution, diagnostics, and signals |
| `PROV-DB` | Data Block | Structured controller data state |
| `PROV-ELECTRICAL` | Electrical | Electrical topology, supply, wiring, and measurements |
| `PROV-HMI` | HMI | Operator-facing commands, states, and diagnostics |
| `PROV-SCADA` | SCADA | Supervisory state, events, and historical context |
| `PROV-NETWORK` | Network | Industrial communication topology and diagnostics |
| `PROV-IOLINK` | IO-Link | Master, port, device, and communication state |
| `PROV-ALARM` | Alarm | Alarm occurrence, lifecycle, priority, and context |
| `PROV-TREND` | Trend | Time-ordered values and state changes |
| `PROV-MANUAL` | Manual | Approved procedures, drawings, manuals, and records |

## Field Provider

`PROV-FIELD` supplies directly observable machine, equipment, product, or process information. Typical requests concern position, alignment, movement, mechanical condition, indication, environment, or the visible result of an action.

It must distinguish observation from inferred diagnosis and identify whether the representation is initial state, investigation evidence, recovery state, or verification state.

## PLC Provider

`PROV-PLC` supplies controller-level information such as operating state, process-image values, diagnostic status, program observation, or signal relationships.

It must not invent program logic, addresses, diagnostic messages, or vendor behavior. Exact values require approved case information or authoritative technical review.

## Data Block Provider

`PROV-DB` supplies structured controller data grouped by an approved logical data authority. It is used when the educational distinction depends on stored, calculated, commanded, or state-model data rather than a general PLC view.

Data Block information must identify its relationship to PLC signals and avoid duplicating the same value under conflicting names.

## Electrical Provider

`PROV-ELECTRICAL` supplies electrical source, distribution, protection, wiring, terminal, connector, and measurement information.

Requests must specify measurement conditions, units, reference points, safety constraints, and whether a value is expected, observed, or verified. Drawings and measurements must agree.

## HMI Provider

`PROV-HMI` supplies operator-facing state, commands, alarms, permissions, and process context. It represents what an authorized operator or technician can observe through the HMI at a defined point in the Incident.

HMI information must not become an alternative authority for PLC, field, or root-cause state. Differences between display and underlying state may be educational evidence when explicitly designed.

## SCADA Provider

`PROV-SCADA` supplies supervisory information across equipment or time, including events, trends, production context, and correlated states.

It must declare time range, source scope, signal identity, sampling limits, and any loss of detail relevant to interpretation.

## Network Provider

`PROV-NETWORK` supplies network topology, device presence, communication state, path, and diagnostic context.

It must distinguish physical link, configured identity, protocol communication, application data validity, and device health. Vendor-specific statuses require verification.

## IO-Link Provider

`PROV-IOLINK` supplies information associated with IO-Link masters, ports, devices, process data, events, and communication state.

It must distinguish device power, physical connection, port configuration, communication, process-data validity, and the field condition being sensed. It must not assume that a communication symptom proves device failure.

## Alarm Provider

`PROV-ALARM` supplies alarm identity, source, occurrence, acknowledgement, clearance, priority, and related state at a defined time.

Alarm wording must be approved or explicitly generic. An alarm is evidence of a reported condition, not automatically proof of root cause.

## Trend Provider

`PROV-TREND` supplies time-correlated signal or process history. It may expose order, duration, coincidence, drift, intermittency, or recovery behavior.

Requests must define signals, units, interval, sampling intent, relevant events, and visual scale. Trends must not imply precision unsupported by the source.

## Manual Provider

`PROV-MANUAL` supplies approved documentary information such as operating procedures, technical manuals, wiring documents, maintenance records, or change history.

Every request must identify document type, authority, version or date where material, and the bounded information required. Documentation supports investigation but must not be fabricated to force a conclusion.

## Provider Contract

A Provider request contains the following governance information:

| Field | Responsibility |
|---|---|
| Request ID | Stable Blueprint-local identity |
| Provider ID | One canonical Provider category |
| Information purpose | Question the request must help answer |
| Availability | Point in the investigation where information can be obtained |
| Parameters | Case-specific inputs required by the Provider |
| Artifact template | Approved representation requested, when needed |
| Visibility | Learner-visible, review-only, or private authority |
| Dependencies | Prior state, decision, source, or approval required |
| Validation source | Authority used to verify technical correctness |
| Required status | Planned, source-required, producible, review-required, or approved |

This is a governance contract between Blueprint and production. It is not an executable schema and must not be imported into Runtime or Player. Generated Authoring must use only fields permitted by the approved Authoring contract.

## Parameters

Parameters make a Provider request specific enough to produce accurate information without embedding reusable content in the Provider definition. Parameters may include equipment role, state, signal identity, value, unit, timestamp, viewpoint, document reference, safety condition, or localization requirement.

Required parameters depend on Provider and artifact template. They must be explicit, minimal, internally consistent, and traceable to the approved industrial case. Missing parameters block production; they are not filled by assumption.

## Template Philosophy

Providers define information semantics. Artifact templates define representation. A Provider may support multiple templates, and a template may represent information from more than one Provider when the Blueprint declares one authoritative source for each displayed fact.

Templates are referenced from D2R-SPEC-004. Providers must not contain layout, visual style, media-generation instructions, or Experience-specific assets.

## Validation Rules

- Every Provider request must use one Provider ID from this document.
- Each request must state an information purpose and investigation availability.
- Parameters must be sufficient to verify the requested information.
- Provider authority must not conflict with another request for the same fact.
- Every learner-visible output must trace to an approved artifact or direct textual representation.
- Private information must not be requested through a learner-visible artifact.
- Provider requests must not expose Root Cause prematurely.
- Exact vendor information must have an identified validation source.
- Unsupported requests remain explicit production gaps and must not cause speculative implementation.
- Provider definitions must remain free of concrete Experience content.
