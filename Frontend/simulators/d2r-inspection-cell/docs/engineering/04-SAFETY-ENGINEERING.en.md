# 04 · Safety Engineering

**Status:** working framework v0.3 approved for teaching use · approved risk assessment pending
**Objective:** define the work required to specify, implement, and validate safety functions for a real machine.

> The simulator's `SafetyReady` signal is a constant logical indication. It is not an input from a safety relay or safety PLC, it does not demonstrate a safety function, and it must not be used to size or validate a system. The transparent panels in the 3D model are graphical only: they have not been assessed as guards and must not receive credit in a risk assessment.

## Design principle

Safety starts with intended use, machine limits, and hazard identification—not by copying a simulator bit. A competent person must assess risk using the regulations and standards applicable to the jurisdiction, machine type, and design. The need for PLr/SIL, architecture, components, and tests follows from that assessment.

## Required work

1. Define operating modes, access, cleaning/jam-clearing tasks, maintenance, and foreseeable fault conditions.
2. Identify mechanical, electrical, pneumatic, and process hazards; estimate and reduce risk using the applicable method.
3. Specify each safety function: initiating event, zone, required response, stopping time/distance, reset, and diagnostics.
4. Select guards, interlocks, emergency stops, and control elements only after establishing requirements.
5. Separate standard control from safety functions and define their interfaces.
6. Verify the design and validate each function with a traceable protocol; record measurements, faults, changes, and responsible approval.

ISO 12100, ISO 13849-1, IEC 62061, and applicable type-C standards are references for review with the Safety team. Citing a standard does not establish compliance or certify this simulator.

## Topics to assess for this case

Access to the magazine and pinch zones; access to the belt, rollers, pusher, and ramps; jam-clearing intervention; residual energy and air loss; camera/lighting protection; and recovery after a stop. These are assessment topics, not a complete hazard list or a selected solution.

| Deliverable | Required evidence | Status |
| --- | --- | --- |
| Risk assessment | Limits, hazards, estimation, measures, and residual risk. | Pending |
| Function specification | Requirements, zones, safe state, reset, and measured times. | Pending |
| Safety design | Architecture, components, calculations, and electrical documentation. | Pending |
| Validation | Protocol, measured results, deviations, and approval. | Pending |

**Traceability:** `REQ-014` from brief 00; interfaces with documents 01–03.

**Teaching limit:** the HTML retains its existing conceptual model; this document does not modify or extend its Safety behavior.

## Initial hazard register for review

This register organizes questions for a risk workshop. It is not a complete assessment, assigns no risk level, and prescribes no architecture. Review each row against real tasks, probability/exposure, and existing measures.

| ID | Zone/task to investigate | Possible hazard | Harm to consider | Measure/function to study | Rating |
| --- | --- | --- | --- | --- | --- |
| `HZ-001` | Replenish parts / clear feeder jam. | Pinch/crush at pusher and guides. | Finger/hand injury. | Access, retention, energy isolation, guarding/interlock if required. | Pending competent assessment. |
| `HZ-002` | Operate, clean, or remove object from belt. | Drawing-in/entrapment at belt, rollers, or drive. | Hand/arm injury. | Geometry, access, guard, and stop response. | Pending competent assessment. |
| `HZ-003` | Work near pusher and ramp. | Impact, pinch, or ejected/falling part. | Injury from mechanism or moving part. | Separation, containment, and safe access. | Pending competent assessment. |
| `HZ-004` | Reset after stop, fault, or power loss. | Unexpected restart when a permissive or signal returns. | Exposure to unexpected motion. | Reset logic and separate start; confirm by assessment. | Pending competent assessment. |
| `HZ-005` | Maintain cylinders, valves, and hoses. | Stored pneumatic energy or residual motion. | Unexpected movement/ejection. | Isolation, venting, and zero-energy verification. | Pending competent assessment. |
| `HZ-006` | Adjust camera/lighting. | Optical or electrical risk depending on selected source. | Exposure or electric shock. | Assess source and service conditions. | Pending competent assessment. |

Pending status does not mean low risk. The assessor must record machine limits, intended use and reasonably foreseeable misuse, exposed persons, severity, exposure, avoidance possibility, measures, residual risk, and applicable standards.

## Safety-function specification

For each function resulting from assessment, complete a specification with:

- Identifier, hazard, zone, and affected operating modes.
- Initiating event and detecting devices.
- Safe state for each final element (motor, valve, brake, air dump), determined by assessment; do not assume de-energizing is always sufficient.
- Required response time/distance and measurement method/conditions.
- Required PLr or SIL and standards rationale, where applicable.
- Architecture, certified components, diagnostics, common-cause failures, and reliability calculation.
- Manual-reset rule, location, zone visibility, and condition before another START is allowed.
- Test criteria, interval, record, and approval owner.

Normal controls `FIN DE PIEZA`, HMI RESET, simulator PAUSE, and RESET SIM do not replace an emergency stop or Safety function. Safety reset should not start a cycle automatically.

## Validation template (per function)

| Field | Record during validation |
| --- | --- |
| Function / version | ID, drawing, installed software, and configuration. |
| Preconditions | Mode, load, pressure/voltage, guards, and initial state. |
| Method | Instrument, connection, sequence, and measurement limitation. |
| Result | Measured time/distance, final-element response, and diagnostics. |
| Introduced faults | Circuit/channel affected per approved procedure and risk assessment. |
| Test result | PASS/FAIL, deviation, retest, and evidence. |
| Approval | Competent person, approval-record reference, and controlled evidence. |

Physical validation requires a safe commissioning plan. No Safety test is considered performed by observing an animation.
