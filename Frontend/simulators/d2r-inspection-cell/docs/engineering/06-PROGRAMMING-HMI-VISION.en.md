# 06 · Programming, HMI, and vision interface

**Status:** teaching guide v0.3 approved for teaching use · no executable project
**Objective:** explain how to turn the PLC architecture into verifiable logic and a clear operator/diagnostic interface.

## Language choice

- **LAD/KOP:** permissive and discrete-condition networks that maintenance staff can review online.
- **SCL:** structure transformations, recipe/data handling, and calculations that read better as structured text.
- A sequence can combine both languages. Team standards and maintainability matter more than rewriting everything in one style.

Programming should start from approved interfaces and block-level tests. Each sequence transition needs an entry condition, action, exit condition, maximum time where applicable, and fault response. Do not use accelerated simulator timings as machine values.

## Camera interface

The following table is a conceptual exchange, not an implemented handshake. Order, edges, retention, timeout, and recovery must be agreed with the selected camera model.

| Stage | PLC | Camera | Expected evidence |
| --- | --- | --- | --- |
| Preparation | Validates part present, recipe, and process permission. | Reports ready and recipe loaded. | Values coherent for the same part. |
| Trigger | Sends `Trigger` and a cycle ID if the protocol supports it. | Accepts trigger and starts capture. | Observable acknowledgement or transition. |
| Result | Waits for capture complete and a valid result. | Returns OK/NOK, validity, and agreed diagnostics. | Result linked to the correct part ID. |
| Close | Stores/consumes the result once and releases the exchange. | Returns to `Ready` according to its interface. | No stale or duplicated result. |

The simulation presents `DO_VisionTrigger`, `VisionReady`, `InspectionDone`, `InspectionValid`, and `VisionOK`; the result comes from the internal batch. No electronic camera communication exists.

## HMI and Watch

The machine HMI should prioritize mode, state, START, FIN DE PIEZA, permitted RESET, alarm, and production. Confirmations, user permissions, navigation, and alarm detail belong in the specification. Simulator pause freezes the graphics clock; a real machine requires a specifically defined operational stop and risk analysis.

PLC Watch is an observation/commissioning tool, not the production HMI. Keep the prototype's existing names and types as a reference: BOOL, INT, DINT, REAL, and TIME. Before exporting a real table, validate address, unit, range, quality, and retention.

## Software verification

Plan cases for each block, transition, reject path, lost handshake, missing signal, timeout, restart, and recovery. Record preconditions, stimulus, expected result, observed value, and evidence. Faults must come from a verifiable logical condition; injected faults do not prove an alarm.

**Output artifact:** versioned PLC source, HMI/vision tag list, and approved test matrix.<br>
**Traceability:** `REQ-001`…`REQ-010`, `REQ-013`…`REQ-015`; proposed blocks in document 05.

## Code-organization examples

The tables describe networks/concepts for teaching code review; they are not loadable logic and do not change the simulator.

| Proposed LAD/KOP network | Condition | Result | Online review |
| --- | --- | --- | --- |
| N01 · accept START | `StartReq` edge AND `Ready` state AND valid mode. | Internal `StartAccepted` pulse. | Rejected START needs a visible cause; prevent a held bit from restarting. |
| N02 · accept RESET | `ResetReq` AND agreed stopped condition. | Reset process state, not Safety. | RESET does not reset Safety or allow unexpected restart. |
| N03 · finish request | `StopAfterPartReq` edge during RUN. | Retain `StopPending` and block the next part after completion. | Active part completes; do not arbitrarily de-energize outputs. |
| N04 · conveyor command | Sequence requests motion AND standard permissives are valid. | Command to drive/contactor interface. | Feedback, fault, interlocks, and drive mode. |

### Teaching SCL outline (not compiled)

```text
// State outline for discussion; do not copy to TIA without completing interfaces.
CASE Cell.State OF
  READY:
    IF Cmd.StartAccepted THEN
      Cell.State := FEED;
    END_IF;
  FEED:
    IF Feeder.PartPresented THEN
      Cell.State := TRAVEL_TO_VISION;
    END_IF;
  INSPECT:
    IF Vision.ResultAccepted THEN
      Cell.ResultForCurrentPart := Vision.Result;
      Cell.State := TRAVEL_TO_SORT;
    END_IF;
  SORT:
    IF Cell.ResultForCurrentPart = RESULT_OK THEN
      Cell.State := DISCHARGE_A;
    ELSE
      Cell.State := DISCHARGE_B;
    END_IF;
END_CASE;
```

`READY`, `FEED`, and the other identifiers would be constants/ENUMs defined in the project. This fragment omits states, timeouts, outputs, errors, persistence, and mode changes; it must not be compiled or used as a machine program.

## Cognex data cycle

This protocol is a starting point to review against the exact reader manual. No Cognex model is selected, it is unknown whether trigger will be physical input or Ethernet, and no protocol has been chosen.

1. PLC confirms part present and assigns a unique cycle identifier.
2. PLC requests `Trigger` and retains the request until camera acceptance is defined.
3. Camera reports `Busy` while capturing/processing and then `Done`.
4. PLC validates `Valid`, `JobId`, `SequenceId`, diagnostics, and data freshness.
5. PLC copies an accepted result into part state; empty, invalid, or stale data does not classify.
6. PLC/camera clear request and acknowledgement as agreed; both return to a known state.

| Situation | Process response to specify | Minimum record |
| --- | --- | --- |
| `Ready` does not arrive | Hold the part; alarm after the approved limit. | Trigger, elapsed time, state, camera diagnostics. |
| `Done` does not arrive | Do not invent OK/NOK; block sorting and allow authorized recovery. | Part ID, job, handshake state. |
| Invalid or previous-ID result | Do not consume; clear/retry per procedure. | Raw value, validity, received ID. |
| Camera/job error | Move to the state defined by the risk assessment and functional specification. | Cognex code, active job, acknowledgement. |

No timeout, retry count, or automatic alternative route is defined here; those depend on production, quality, and risk assessment.

## Alarms and functional diagnostics

An alarm is activated only by a verifiable logical condition. Proposed structure: code, text, source, active condition, timestamp, acknowledgement, recovery, and linked variable.

| Candidate condition | Evidence for it | Recovery to agree |
| --- | --- | --- |
| Motion timeout | Command active and position/motion feedback absent beyond the validated limit. | Inspection, controlled release, authorized reset. |
| Part missing | Sensor fails to confirm magazine/belt despite expected supply condition. | Check magazine, sensor, and jam. |
| Vision not confirmed | Accepted trigger but `Done` missing or exchange invalid. | Diagnose communication/job; do not invent a result. |
| Contradictory state | Both end sensors active or an impossible combination per design. | Stop per approved sequence and correct cause. |

These are engineering examples requiring agreed limits/responses; they do not add faults to the simulator or claim real sensors exist.

## Proposed HMI screen map

| Screen | Audience | Main information/actions | Excluded from normal screen |
| --- | --- | --- | --- |
| Operation | Operator | State, mode, START, FIN DE PIEZA, permitted RESET, OK/NOK/total, active alarm. | Output forcing and safety parameters. |
| Alarms | Operator/maintenance | Text, cause, timestamp if available, state/ack, recovery guidance. | Acknowledgement must not clear an active condition. |
| I/O diagnostics | Commissioning | Physical state, channel quality, device, and associated tag. | Virtual values presented as physical. |
| Vision | Authorized quality/setup | Job, ready/busy, capture, result, score, and available diagnostics. | Recipe changes without permission/log. |
| Maintenance | Authorized staff | Hours/cycles, actuator tests, sensor replacement. | Manual commands without permissions, safe area, and procedure. |

Pause in the simulator controls the animation clock. A machine HMI must not reuse it without defining process behavior, stop category, and risk requirements.

## Software-validation matrix

| Case | Stimulus | Expected | Evidence |
| --- | --- | --- | --- |
| `TC-201` | Valid START and repeated START during RUN. | First request is accepted; repeat is rejected with a visible cause and is not queued. | Command/state Watch and rejection record. |
| `TC-202` | STOP during each active phase and during `betweenCycles`. | During an active phase, the part completes and the machine stops. During `betweenCycles`, the next part is prevented from starting. | State history and counter. |
| `TC-203` | Camera not ready / no Done / invalid result. | No classification with invalid data; causal alarm. | Exchange packet and alarm. |
| `TC-204` | HMI RESET while RUN and while READY. | In RUN, reject with no state change. In READY, reset process state without restarting or resetting Safety. | Accepted/rejected request record and before/after state. |
| `TC-205` | Sensor/actuator signal loss and recovery in a controlled PLC/hardware test. | Defined recovery, no unexpected movement or duplicate count. | Diagnostics and recorded retest; do not use F01/F02 injection in the simulator. |

This matrix is proposed for future PLC work. HTML tests are not equivalent to PLC-block validation. The SIM behavior in `TC-202` was checked with real clicks in all seven phases and during `betweenCycles`: it completes at most the active part and prevents the next one from starting. The future PLC test remains pending.
