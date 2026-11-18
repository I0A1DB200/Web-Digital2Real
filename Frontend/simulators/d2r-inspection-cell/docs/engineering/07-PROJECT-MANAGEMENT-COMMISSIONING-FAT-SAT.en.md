# 07 · Project management and commissioning

**Status:** teaching work plan v0.3 approved for teaching use · no physical tests executed
**Objective:** organize deliverables, reviews, and tests from the brief through acceptance of a real installation.

**Terms:** commissioning = placing the equipment into operation; FAT = Factory Acceptance Test; SAT = Site Acceptance Test; URS = User Requirements Specification; BOM = bill of materials.

## Milestones and review gates

| Gate | Output package | Entry criterion for next gate |
| --- | --- | --- |
| G0 · Kickoff | Scope, owners, risks, and customer questions. | Owner identified for each decision. |
| G1 · Requirements | URS/brief, traceable functional specification, and initial hazard identification. | Verifiable requirements, agreed exceptions and owners; preliminary risk assessment started. |
| G2 · Concept and design | Layout, mechanical design, electrical/pneumatic schematics, interfaces, and preliminary Safety constraints. | Interdisciplinary review closed; hazards and access limits inform the design. |
| G3 · Hardware and Safety | BOM, addresses, risk assessment, safety-function specification, and Safety design. | Selection and validation planned by competent owners before design freeze. |
| G4 · Software | PLC, HMI, camera, alarms, and version documentation. | Compilation, simulation, and integration tests recorded. |
| G5 · FAT | Factory acceptance protocol and results. | Deviations resolved or formally accepted. |
| G6 · SAT | Installation, plant interfaces, safety, and process tests. | Site tests accepted by the customer/team. |
| G7 · Handover | As-built, backups, manuals, training, and spares. | Final package and operating owners accepted. |

Hazard identification starts during requirements and concept; risk assessment and Safety design inform the design before freeze. The actual order may vary by contract and risk assessment. No simulator capture replaces FAT, SAT, or Safety validation.

## Commissioning preparation

Before energizing, review mechanical release, drawings, connections, cable identification, grounding, air, network, software versions, backups, and work permits. Then check I/O with equipment isolated and under an approved procedure; test actuators individually; verify camera and recipe; integrate the sequence; and measure acceptance criteria with suitable instruments.

Define criteria in advance for: one-part feeding, inspection stop, result-to-part association, route A/B, counting, FIN DE PIEZA, RESET, communication recovery, alarms, recipe changes, and safe behavior. For each test, state initial condition, steps, expected, measured, owner, and evidence.

## Initial proposed FAT/SAT matrix

| Case | Master criterion (doc. 01) | Test | Evidence type |
| --- | --- | --- | --- |
| `TC-101` | `TC-001`, `TC-003`, `TC-005` | Run AUTO for 100 consecutive physical cycles, one correctly oriented part per cycle, with no loss or duplication; reconcile counts and A/B routes. | PLC/HMI record and product observation. |
| `TC-102` | `TC-005`, `TC-006`, `TC-007`, `TC-013`, `TC-016` | HMI operation; PIEZA and FIN DE PIEZA; HMI RESET disabled in RUN and accepted in READY without restart; recovery after a stop/alarm. | Approved protocol and state record. |
| `TC-103` | `TC-009`, `TC-013` | Camera communication loss and recovery. | Logs, diagnostics, and part association. |
| `TC-104` | `TC-002`, `TC-003` | Test 100 NOK (50 missing holes, 50 obstructed holes) and 100 good parts; target: reject all NOK and accept at least 98 good parts. Verify A/B routes. | Identified samples, ground truth, and acceptance record. |
| `TC-105` | `TC-014` | Validate each specified Safety function. | Safety protocol, measurements, and competent-person report. |
| `TC-106` | `TC-004` | Capacity target: average 5 parts/min over 30 stable minutes under the requirement's conditions. | Part count, duration, and stop record. |
| `TC-107` | `TC-008` | Unique record per part with the fields defined in the requirement, correlation, persistence, and 30-day retention checked against the approved system. | Data-service evidence and record check. |
| `TC-108` | `TC-010` | Compile a project compatible with the selected TIA target and verify I/O/diagnostics online. | Project/versions and online-test record. |
| `TC-109` | `TC-011`, `TC-012` | Verify 24 VDC, filtered dry air at nominal 6 bar, and operation at 10–35 °C indoors, without condensation or pressure washing. | Voltage, pressure, and environment measurements per protocol. |
| `TC-110` | `TC-015` | Review the reproducible package with versions, conditions, samples, results, incidents, owners, and acceptance. | Handover index and controlled acceptance record. |

Cases `TC-101`…`TC-110` are execution packages linked to the master criteria in document 01; they do not replace them and have not been executed. Vision sample counts and acceptance rates are teaching-pilot targets, not a statistical production guarantee. Safe procedures and results must be defined for the real equipment. The virtual 4 OK/3 NOK batch does not prove production capacity or quality.

## Issue tracking and closeout

Record each deviation with ID, version, symptom, reproduction condition, impact, owner, correction, retest, and status. Maintain an identifiable approved configuration and backups. Handover includes as-built drawings, software/hardware list, manuals, training, spares, and change log.

**Traceability:** `REQ` → `TC` → evidence → deviation/closure matrix.<br>
**Pending:** schedule, owners, contractual criteria, versions, samples, instruments, and acceptance format.

## Team responsibilities

| Role | Responsible for | Delivery evidence |
| --- | --- | --- |
| Customer / process owner | URS, product, rate, OK/NOK criteria, interfaces, and acceptance. | Approved requirements and review minutes. |
| Project Manager | Scope, gates, risks, changes, cost, dependencies, and open decisions. | Plan, RAID register (risks, assumptions, issues, dependencies), decision register, and minutes. |
| Mechanical engineering | Layout, CAD, loads, access, fabrication, and as-built records. | Released drawings, mechanical BOM, and reviews. |
| Electrical engineering | Cabinet, power, schematics, protection, wiring, and network. | Approved drawings, cable list, and inspection records. |
| PLC/HMI | Architecture, tags, program, alarms, versions, and tests. | Versioned project/backup, tag list, and FAT protocol. |
| Vision integration | Optics/light, job, samples, interface, limits, and result traces. | Agreed capability report, backed-up job, and data map. |
| Safety owner | Assessment, specification, architecture, calculation, and validation. | Safety file signed by competent owner. |
| Quality / commissioning | Samples, inspection, traceability, deviations, and acceptance. | Signed protocols and nonconformance log. |

One person may cover multiple roles on a small project; Safety and customer approvals still require appropriate competence and authority.

## Commissioning activity phases

### 1. Document review and pre-commissioning

- Confirm serial number, software/firmware version, drawings, and configuration against the approved design.
- Review assembly, fasteners, guards, labels, grounding, continuity, protection, pressure, and air quality.
- Identify open tests, permits, calibrations, and measurement equipment.
- Create an initial backup of PLC, HMI, camera, and drive before changing parameters.

### 2. Electrical I/O check

With the area controlled and approved procedures followed, check tag ↔ terminal ↔ device, voltage/polarity, normal state, transition, lost-channel diagnostic, and program response. Operate outputs only when the area is ready and movement is authorized. Record every channel; do not infer status from an HMI LED alone.

### 3. Individual motion and integration

Test drive, feeder, and pusher individually under agreed risk limits; check direction, speed, stroke, pressure, cushioning, and feedback. Then integrate feed → vision → sorting; test real parts, part variation, and bin; confirm each camera response belongs to the correct part ID.

### 4. FAT

1. Agree build, backups, sample, instruments, protocol, and owners.
2. Run nominal and boundary tests against each traced requirement.
3. Check alarms, communication loss, recovery, reset, piece mode, and operational stop.
4. Retest corrected faults and attach evidence identified by version.
5. Record deviations; accept, reject, or defer each with an owner and controlled-record reference.

### 5. SAT and handover

Check site utilities and connections; repeat relevant tests after transport/installation; validate plant interfaces, product formats, environmental conditions, and Safety functions on site. Close the outstanding-items list (punch list) before signing acceptance. Deliver as-built drawings, tested backups, spares lists, training, and support contacts.

## Traceable test record

| Field | Example of what to document |
| --- | --- |
| ID / requirement | `TC-104` / `REQ-003`; document version. |
| Equipment / configuration | Serial number, CPU/firmware, program, Cognex recipe/job. |
| Preconditions | Part/revision, mode, speed, pressure, bin, and initial state. |
| Steps | Exact command sequence, induced inputs, and relevant environmental conditions. |
| Expected | Criterion with unit and tolerance approved before testing. |
| Observed | Measured value, instrument/calibration, tag/log, and behavior. |
| Result | PASS/FAIL/BLOCKED; deviation and impact assessment. |
| Approvals | Executor, witness, customer, and approval-record reference. |

Do not substitute the virtual batch “4 OK / 3 NOK” for production-quality criteria. Vision validation needs representative labeled samples, ground truth, and an agreed false-accept/false-reject rate.
