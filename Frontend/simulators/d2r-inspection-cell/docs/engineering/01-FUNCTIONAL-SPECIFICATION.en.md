# 01 · Functional specification

**Version:** 0.3 · teaching specification approved by D2R
**Status:** document approval for the teaching case · several SIM criteria remain pending as listed in §10 and §11; not real-machine approval
**Objective:** define how the cell case should operate, which interfaces it exchanges, and how acceptance will be demonstrated without confusing the simulator with physical machinery.

> The teaching case uses fictional assumptions approved by D2R so the exercise can be designed. There is no real client, contractual specification, executable PLC, or accepted physical hardware. Durations and signals labelled “simulator” are evidence from the Three.js model, not results from a machine.

## 1. Basis and traceability

This specification inherits the part, vision scope, 5 parts/minute target, magazine up to 7 parts, A/B bins of 25 parts, Siemens S7-1200/TIA Portal learning platform, Cognex as a camera hypothesis, and 30-day external record from [document 00](00-BRIEF-CLIENTE.en.md). These values are **teaching-case assumptions**, not data from a real customer.

Requirements retain IDs `REQ-001` through `REQ-015` from the brief. This document adds reviewable criteria `TC-001` through `TC-019`. “SIM” means observable in the HTML; “FAT” means a controlled test of the built equipment; “SAT” means site integration validation. An animation equivalent does not approve a criterion.

### Functional scope

- Includes: single-part feeding, transport, inspection capture and decision, automatic classification `OK → A` / `NOK → B`, operator commands, diagnostics, counters, and traceability requirements.
- Excludes at this stage: component selection and physical addresses, schematics, compilable TIA program, Cognex setup, database service, mechanical/pneumatic sizing, and Safety validation.
- Artificial F01/F02 injection is not reintroduced. The Alarm panel remains an interface; future alarms must represent identifiable logical conditions.
- This revision corrects FIN DE PIEZA during the inter-cycle interval. It does not alter phases, durations, signals, counters, classification, or the conceptual Safety model.

## 2. Functional context

| Actor or system | Function in the case | Current limit |
| --- | --- | --- |
| Operator | Loads the magazine, prepares A/B bins, selects mode, starts/stops, and monitors the HMI. | The simulator only represents controls; physical procedure and ergonomics are pending. |
| Maintenance / commissioning | Observes states, I/O, variables, and alarms; recovers using an approved procedure. | PLC Watch shows virtual values, not an online CPU connection. |
| Machine PLC (future) | Coordinates feeding, conveyor, camera, sorting, counters, and per-part records. | S7-1200/TIA is proposed; no project or CPU is selected. |
| Cognex camera (future) | Receives trigger and job; returns validity, classification, and diagnostics. | Brand proposed; model, optics, protocol, and handshake are pending. |
| Traceability gateway/service | Stores one record per part in an external database with 30-day retention. | No gateway, DB, server, or data link is active. |
| Safety functions | Reduce risk according to an independent assessment. | Outside standard logic in this specification; requires competent assessment and validation. |

The cell is considered standalone, with manual loading/unloading and one product reference. The proposal is to run AUTO while parts and receiving capacity are available; behavior when the magazine empties or a bin fills remains a functional decision because sensors and access permissions have not been defined.

## 3. Modes, commands, and priority

| Command | Required behavior for the physical case | Behavior observed in simulator | Limit / decision |
| --- | --- | --- | --- |
| `START` | Starts only from ready state with start permissives satisfied. AUTO continues; PIEZA requests one unit. | Disabled while `running`; after the seven-part batch completes, a new command resets the simulator batch and starts it again. | Physical start permissives and their evaluation are for design. |
| `AUTO` | Processes successive units while product and output capacity are available. | Processes the predefined teaching batch of seven results. | Does not represent an infinite magazine or replenishment during operation. |
| `PIEZA` | Each START requests one part; another part needs a new command. | Starts one part and stops the sequence when that part is complete. | Physical case needs a policy for repeated commands and pending parts. |
| `FIN DE PIEZA` / STOP | Requests completion of the active part and prevents another from starting. It is not an immediate stop. | During a phase, completes the part; during the interval, waits the original 0.9 s and stops before feeding the next part. | SIM behavior verified in §9/§11; this is not an emergency stop. |
| `HMI RESET` | Only available while the machine is stopped; clears operating state according to procedure without restart. | Disabled while `running`; while stopped resets the model batch and counters and closes the open panel. | Counter retention and real alarm handling need definition. Does not reset Safety. |
| Simulator `PAUSA` | Not transferred as a machine function without defining behavior and assessing risk. | Freezes logical clock and movement while `paused`; rendering continues. Resume continues from the same state. | Teaching-environment control, not a Safety function or physical stop. |
| `RESET SIM` | No machine-command equivalent. | Resets scene, batch, counters, and state from any phase. | Laboratory control only. |
| AUTO/PIEZA change | Allowed only in stopped/ready state. | Button is disabled while `running`. | Define how the real HMI treats a mode change requested during a cycle. |

Conceptual standard-control order: acquire inputs, validate communications/permissives, accept commands, update sequence, calculate outputs, and publish diagnostics. This order does not implement or replace Safety functions.

## 4. Normal cycle sequence

### 4.1 Prototype phases

The table records values present in the HTML. Durations are seconds of the simulation clock and are not setpoints for physical design.

| Step | Simulated duration | Observed action | Relevant virtual I/O | Phase output |
| --- | ---: | --- | --- | --- |
| Ready | — | Waits for START; initial part visible and batch prepared. | Motion outputs 0. | READY. |
| `FEED` | 0.8 s | Pushes the bottom part from the magazine; stack animation moves visually. | `DO_FeederValve` active during the first part; `DI_MagazinePart` is phase-derived. | One part on the conveyor. |
| `TRAVEL_VISION` | 2.2 s | Conveyor transports the part to the camera. | `DO_ConveyorRun=1`. | Inspection position. |
| `INSPECT` | 1.5 s | Conveyor stopped; logical camera trigger remains active for the phase. | `DO_ConveyorRun=0`, `DO_VisionTrigger=1`, `DI_InspectionPresent=1`, `VisionReady=1`. | At phase end, result is assigned from the batch sequence. |
| `TRAVEL_SORT` | 1.9 s | Conveyor transports the part to sorting. | `DO_ConveyorRun=1`; simulated `InspectionDone` and `InspectionValid`. | Arrival at sorting. |
| `SORT_STOP` | 0.5 s | Part and conveyor stop before diversion. | `DI_RejectPosition=1`; conveyor stopped. | Stable transfer position. |
| `DISCHARGE` | 2.2 s | If OK, pusher moves part toward A. If NOK, conveyor carries it to B. | OK: `DO_PusherValve=1`, conveyor 0. NOK: `DO_ConveyorRun=1`, pusher 0. | Part leaves sorting position. |
| `PUSH_RETRACT` | 1.1 s | OK: pusher returns and part descends A. NOK: conveyor discharge to B completes. | OK: `DO_PusherValve=1`, `DI_ExitA=1` during the output phase. NOK: `DI_ExitB=1` during output phase. | Index and result counter increment. |
| Between parts | 0.9 s | Visual wait before preparing the next part. | Code uses inactive phase; `DB_SequenceStep=0`. | Next FEED or requested stop. |

The seven phase durations total 10.2 seconds of simulation-clock time; the 0.9-second interval is added between non-terminal units. This calculation describes only the model. It does not demonstrate 5 parts/minute because animation, browser clock, and physical equipment are not equivalent.

### 4.2 Physical-machine transitions to design

The real machine must confirm feeding, arrival at inspection, valid capture, exit from each route, and pusher position with selected signals. Transitions must not be copied as fixed scene timers. For each movement, define timeout, confirmation, discrepancy response, and recovery in detailed functional, hardware, and Safety design.

## 5. Inspection, classification, and counters

### Inspection

The approved case defines an aluminum plate with five holes and initial inspection limited to detecting missing or visibly obstructed holes. Cognex is a product hypothesis, not a selected camera. The target rule is:

- `OK`: all five defined holes are identified as present and open.
- `NOK`: any of the five is missing or visibly obstructed.
- No measurement of diameter, position, thread, finish, or defects outside brief 00.

The HTML does not analyze an image: `workpieceBatch` contains `OK, NOK, OK, NOK, OK, OK, NOK`, and the result is assigned at the end of `INSPECT`. This deterministic sequence checks two routes; it is not a machine-vision result.

### Classification and production

- `OK → A`: conveyor stays stopped during `DISCHARGE`; the pusher moves the part by contact and returns during `PUSH_RETRACT`.
- `NOK → B`: the pusher stays retracted; the conveyor carries the part to output B.
- `OK`, `NOK`, and `TOTAL` counters update after the model's terminal output phase. On physical equipment, counting must be linked to a confirmed output and part ID.
- The approved target of 5 parts/minute is checked by a 30-minute steady test excluding replenishment and planned stops (REQ-004); it cannot be inferred from HTML timing.
- The pilot vision test is 100 prepared NOK parts (50 with a missing hole and 50 obstructed), all rejected, and 100 good parts with at least 98 accepted (REQ-002). It is a teaching pilot criterion, not a statistical production-capability guarantee.

## 6. Signals and PLC Watch values

The following names are the current conceptual HTML interface. `DI`, `DO`, and logic signals are calculated from phase, result, and visual transforms; they do not come from connected sensors, valves, a motor, or a camera. No physical addresses are assigned.

### Boolean signals

| Group | Tag | Display meaning | Simulator value source |
| --- | --- | --- | --- |
| DI | `DI_MagazinePart` | Part available at magazine outlet. | 1 during `FEED`; phase-derived. |
| DI | `DI_InspectionPresent` | Part at inspection station. | 1 during `INSPECT`. |
| DI | `DI_RejectPosition` | Part at sorting position. | 1 in `SORT_STOP` and OK `DISCHARGE`. |
| DI | `DI_PusherRetracted` | Pusher retracted. | 0 while pushing or returning; phase-calculated. |
| DI | `DI_PusherExtended` | Pusher extended. | End window of OK `DISCHARGE` and early window of return; not a connected limit switch. |
| DI | `DI_ExitA` | Output A confirmed. | 1 during terminal OK phase. |
| DI | `DI_ExitB` | Output B confirmed. | 1 during terminal NOK phase. |
| DO | `DO_ConveyorRun` | Virtual conveyor command. | 1 in `TRAVEL_VISION`, `TRAVEL_SORT`, and NOK travel to B. |
| DO | `DO_FeederValve` | Virtual feeder command. | 1 during initial `FEED` window (until q < 0.85). |
| DO | `DO_PusherValve` | Virtual pusher valve command. | 1 during OK push and OK return. |
| DO | `DO_VisionTrigger` | Logical capture command. | 1 throughout `INSPECT`, not a real camera pulse. |
| DB logic | `VisionReady` | Camera ready. | Constant 1 in the model. |
| DB logic | `InspectionDone` | Capture complete. | 1 from `TRAVEL_SORT` until part completion. |
| DB logic | `InspectionValid` | Usable result. | Same as `InspectionDone` in the model; does not validate communications quality. |
| DB logic | `VisionOK` | Inspection result OK. | Batch result retained after capture; no pixel analysis. |
| DB logic | `SafetyReady` | Conceptual Safety permission. | Constant 1; does not represent a safety system. |

### Numeric types

| Tag | Type | Display unit | Current calculation or meaning | Limitation |
| --- | --- | --- | --- | --- |
| `DB_SequenceStep` | INT | phase code | 0 with no active phase; FEED=10, TRAVEL_VISION=20 … PUSH_RETRACT=70. | Teaching code, not an approved PLC state enum. |
| `DB_PieceIndex` | INT | part index | `partIndex + (running ? 1 : 0)`. | During the interval it may show the next part before FEED starts. |
| `DB_CountOK` | DINT | parts | Accumulated OK batch counter. | Reset by HMI/SIM RESET. |
| `DB_CountNOK` | DINT | parts | Accumulated NOK batch counter. | Reset by HMI/SIM RESET. |
| `DB_CountTotal` | DINT | parts | `DB_CountOK + DB_CountNOK`. | Model's confirmed total, not persistent traceability. |
| `DB_BeltSpeed` | REAL | m/s | 0 or 0.10 according to `DO_ConveyorRun`. | Representative value, not measured speed. |
| `DB_PieceX` | REAL | mm | Illustrative visual-coordinate scale to 0…800 mm, clamped to the route. | Not calibrated and not a real linear encoder value. |
| `DB_PusherPos` | REAL | mm | `abs(arm.position.z)/1.48 × 200`, clamped to 0…200. | Nominal Watch scale, not measured travel; preserve without reinterpretation. |
| `DB_StageElapsed` | TIME | ms | Virtual phase time multiplied by 1000. | Browser/model clock, not CPU time. |

Current names, types, units, and scales are preserved as the simulator interface. For a real PLC, semantics and numeric representation will be confirmed in documents 03 and 05 before assigning addresses.

## 7. Camera and external database interface

### Camera

REQ-009 requires trigger, ready, busy, complete, valid result, result, and acknowledgement. The protocol may use discrete I/O or Ethernet depending on the selected camera/model; job, timeout, retry count, and recovery remain pending selection with the real Cognex camera.

For timeout, lost communications, wrong job, or invalid result, the proposed functional response is to hold the part at inspection, prevent it from using a normal route, and inhibit the next feed until an approved recovery action. This is an **engineering proposal pending approval**; it is not implemented or tested in the simulator and does not define a Safety reaction.

### Electronic record

REQ-008 requires one row per part with `batch_id`, `piece_index`, `timestamp`, `product_id`, `vision_job`, `inspection_result`, `result_code`, `destination`, and `machine_state`, retained at least 30 days. Each record must correlate the result, counter, and physical output. The initial database proposal does not store images.

The gateway and external DB are future components; the PLC is not considered a direct SQL client. Define write protocol, persistence acknowledgement, time synchronization, local queue, network-loss policy, duplicates, retries, and behavior when the service is unavailable. This version does not invent a specific buffering/stopping policy.

## 8. Alarms, recovery, and Safety limits

The HMI shall expose alarms with an ID, cause, associated state, timestamp, required action, and reset condition. For real design, specify unmet start conditions, missing confirmation, motion timeout, camera communication/result, invalid state, and record-write failure when applicable. These are design categories; this specification does not add them to the current program or claim that they have occurred.

In the HTML, the Alarm panel shows the current event/text; it is not a persistent alarm history or physical equipment diagnosis. Virtual signals are determined by the cycle. There is no F01/F02 injection and no connected camera/gateway to generate real faults. A physical reset/rearm sequence has not been verified.

`SafetyReady` remains a conceptual simulator signal. The physical case requires risk assessment and functions independent from standard logic; this document does not select PLr/SIL, architecture, stop category, guard, or validation. Ordinary STOP, HMI RESET, browser pause, and RESET SIM must not be interpreted as Safety functions.

## 9. Acceptance criteria and traceability

The criteria below record the available evidence. SIM cases test only HTML presentation and logic; they do not validate a PLC or physical machine. FAT/SAT will be conducted after design, hardware, and procedures are approved.

| Case | Requirement(s) | Acceptance criterion | Evidence level | Current status |
| --- | --- | --- | --- | --- |
| `TC-001` Feeding | REQ-001 | 100 consecutive physical cycles with one correctly oriented part per cycle and no loss/duplicate. | FAT / SIM for animation only | Pending; no physical test. |
| `TC-002` Vision pilot | REQ-002 | 100 NOK (50 missing, 50 obstructed) rejected; ≥98 of 100 good accepted. | FAT with identified samples | Pending; no real camera. |
| `TC-003` Sorting | REQ-003 | Every confirmed OK reaches A; every confirmed NOK reaches B; no crossover. | SIM / FAT / SAT | SIM PASS: AUTO recorded 4 routes to A and 3 to B, with no crossover. Physical transfer FAT/SAT pending. |
| `TC-004` Capacity | REQ-004 | Average ≥5 parts/minute over 30 minutes steady operation, excluding replenishment and planned stops. | FAT / SAT with count record | Pending; simulation timing does not prove it. |
| `TC-005` AUTO and PIEZA | REQ-005 | AUTO processes successive units while supply/output capacity is available; one PIEZA START processes exactly one and another command is required to continue. | SIM for batch; FAT for real cycle | SIM PASS: AUTO 7/7, 4 OK/3 NOK, with correct A/B routes. PIEZA completed one part on the first START, remained stopped, and advanced exactly one part on the second START. FAT pending. |
| `TC-006` FIN DE PIEZA | REQ-006 | Requesting in each phase completes the active part and starts no next part; a request in the interval also prevents the next start. | SIM / FAT | SIM PASS: HMI FIN DE PIEZA was clicked in all seven phases and during `betweenCycles`; each case completed exactly one part. Physical FAT pending. |
| `TC-007` HMI | REQ-007 | HMI shows readable state, mode, cycle, counters, and alarms; STOP identifies end-of-part behavior. | SIM / FAT with operator | Pending final content review. |
| `TC-008` Traceability | REQ-008 | One unique persistent row per part with all fields; 30-day retention verified. | FAT / data-system test | Pending; external service absent. |
| `TC-009` Camera handshake | REQ-009 | Trigger, Ready/Busy/Complete/Valid/Result/Ack relate to correct part; timeout/invalid result is not normally routed. | FAT | Pending; no Cognex connected. |
| `TC-010` PLC platform | REQ-010 | TIA project for approved CPU compiles; I/O/diagnostics are checked online. | Project review / FAT | Pending; CPU not selected. |
| `TC-011` Utilities | REQ-011 | 24 VDC and dry filtered air at nominal 6 bar verified under load. | Design / FAT | Pending; not dimensioned. |
| `TC-012` Environment | REQ-012 | Pilot operates indoors at 10–35 °C without condensation or pressure washing. | SAT / environmental record | Pending; site undefined. |
| `TC-013` Alarms and recovery | REQ-013 | For each approved cause, alarm identifies cause; recovery preserves confirmed records and does not restart without authorization. | FAT / SAT | Pending; causes/procedures not implemented. |
| `TC-014` Safety | REQ-014 | Risk assessment, measures, and validation documented by competent personnel before design release. | Independent Safety review | Pending; `SafetyReady` is not evidence. |
| `TC-015` FAT/SAT | REQ-015 | Protocols record version, conditions, samples, results, issues, owners, and acceptance. | Document review and tests | Pending; templates are for document 07. |
| `TC-016` HMI RESET | REQ-007 / REQ-013 | During RUN HMI RESET is disabled; while stopped it restores the specified state, does not start, and does not open diagnostics. | SIM / FAT | UI subtest PASS: disabled during RUN and closes the panel while stopped. Reset from a non-initial stopped state remains to be checked. |
| `TC-017` Simulator PAUSE | QA criterion | Phase, time, and parts freeze while paused; resume continues from the same point. | SIM only | UI subtest PASS: time and part index freeze during pause and resume is accepted. Post-resume progression from the same point remains to be measured. |
| `TC-018` RESET SIM | QA criterion | From any phase, resets scene/batch/counters to initial state; laboratory control only. | SIM only | UI subtest PASS: reset during a run stops the sequence. Reset after processed parts and during other phases/actuators remains to be checked. |
| `TC-019` PLC Watch | REQ-007 / model interface | Names, BOOL/INT/DINT/REAL/TIME, units, scales, and derived sources match §6 inventory. | Source/SIM inspection; future online check | UI subtest PASS: visible registry, counts/types, REAL formatting, filters, and sensor selection/focus. Full name/unit/scale comparison and any online test remain pending; no physical addresses. |

## 10. Functional decisions still open

| ID | Decision required before function freeze | Proposal / owner |
| --- | --- | --- |
| `D-01-01` | Exact start and rearm permissives. | List with process, maintenance, and Safety; do not infer them from `SafetyReady`. |
| `D-01-02` | Response to empty magazine and manual replenishment. | Define sensor/indication, machine state, and access permission; do not assume loading during operation. |
| `D-01-03` | Full A/B bin, bin change, and overflow prevention. | Define sensor or operator confirmation, capacity, and stop behavior. |
| `D-01-04` | STOP meaning if pressed between parts. | SIM closed: no next part starts; the 0.9 s wait is preserved. Confirm this meaning when designing PLC logic. |
| `D-01-05` | Cognex handshake, timeout, and recovery. | Close with model/protocol, samples, recipe owner, and invalid-result response. |
| `D-01-06` | Gateway/DB unavailable or lost acknowledgement. | Decide queue, retry, blocking, continuity, and duplicate removal without losing traceability. |
| `D-01-07` | Counter reset meaning and retention between batches. | Separate HMI counters, persistent traceability, and resettable counters. |
| `D-01-08` | Alarm classes, priority, history, and acknowledgement. | Define a real-alarm matrix with verifiable causes and conditions. |
| `D-01-09` | Physical sensors and transition criteria for each phase. | Select sensors/confirmations and timeouts; HTML timings are not a specification. |
| `D-01-10` | Pilot cycle budget and availability. | Verify 5 parts/minute using real camera, mechanics, discharge, replenishment, and bin-change times. |

## 11. Simulator discrepancies and observed risks

- **STOP during `betweenCycles` — corrected in SIM:** previously, another part could start when the 0.9-second wait ended despite a stop request. The existing interval is now preserved and, at its end, the sequence stops before feeding another part. Playwright checked the case with a real click; no phases or durations changed.
- **Index during interval:** `DB_PieceIndex` is calculated as `partIndex + 1` while `running` remains true; during the wait it may show the next part before FEED starts. Confirm whether the tag means “active part” or “next part.”
- **Alarms:** the panel displays the prototype's latest event/text, not a timestamped, acknowledged, persistent industrial alarm record.
- **Timing and sensors:** phases advance on the model clock; I/O and confirmations derive from phase. Physical timeout, bounce, wiring, and actuator response are not verified.
- **Result:** the fixed batch does not depend on an image, recipe, optical quality, or Cognex transfer.

The simulator STOP issue is closed for the tested HTML behavior: `TC-006` passes in all seven phases and during the interval. This does not replace FAT, PLC validation, or a Safety assessment.

## 12. Document status and next gate

**Stage output:** traceable teaching functional specification validated by D2R; real-machine approval is not applicable.
**Tests executed:** the integrated run completed 76 checks through AUTO and was interrupted before PIEZA finished. A subsequent UI run completed 55 checks, including all three viewports and the final JavaScript-error check; a separate PIEZA run completed two START commands with no JavaScript errors. AUTO, routes, and FIN DE PIEZA in all seven phases and the inter-cycle interval passed in the integrated run. This closes SIM checks TC-005 and TC-006, while the integrated run remains recorded as interrupted.
**Selected evidence:** [per-run and criteria summary](../../tests/evidence/functional-acceptance/controls-01.json).
**Real-machine approval:** not applicable; there is no real client or built equipment.
**Next gate:** close residual coverage for `TC-016` through `TC-019` and the final HMI review in `TC-007`. Physical acceptance remains pending.
