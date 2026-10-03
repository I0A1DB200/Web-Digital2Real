# EE-0001 — Experience Blueprint

## Sensor ON, PLC Input OFF

**Blueprint version:** 2.0  
**Experience status:** Approved for build validation  
**Experience class:** Practice  
**Difficulty:** Foundation  
**Estimated duration:** 12 minutes  
**Domain:** Sensors / Industrial I/O  
**Primary capability:** ICF-02 — Industrial I/O  
**Canonical competencies:** `COMP-IIO-SIGNAL-TRACEABILITY`, `COMP-IIO-STATE-INTERPRETATION`, `COMP-IIO-CONTROLLED-RECOVERY`

## Purpose

EE-0001 trains an evidence-led method for tracing a digital input from the field device to the PLC. The learner must distinguish local sensor detection from delivery of the electrical signal to the controller.

Core principle:

> Follow the signal. Do not diagnose from the symptom.

## Industrial case

A packaging station waits for box presence. Photoelectric sensor B1 detects the target and its local indication is active, while `PLC I0.3` and `Tag_BoxPresent_B1` remain `FALSE`.

```text
BOX
↓
B1 Photoelectric Sensor
↓
BK output
↓
X1:17
↓
field wiring
↓
PLC DI I0.3
↓
Tag_BoxPresent_B1
↓
machine sequence
```

Electrical reference: `BN → +24 VDC`, `BU → 0 VDC`, `BK → X1:17 → PLC I0.3`.

## Canonical root cause

Open circuit caused by physical damage to the BK signal conductor between terminal X1:17 and PLC digital input I0.3.

The loose-termination variant is excluded. Sensor failure, PLC input failure and PLC program error are hypotheses to reject through evidence, not root causes.

## Investigation graph

The learner starts with Incident Brief and semantic cover `ART-001`, then enters `Incident → Investigation → Solution → Debrief`. The cover is presentation only. Every row below is an explicit decision point; an incorrect option remains in place and unlocks no evidence.

| Phase | Decision point | Available media | Evidence gained after the best action |
|---|---|---|---|
| Incident | `DEC-01-TRACE`: confirm the field/PLC discrepancy and select the documented route | `ART-002` | Result: `EVID-03-SCHEMATIC` + `ART-003` |
| Investigation | `DEC-02-MAP`: correlate `B1 → BK → X1:17 → I0.3 → Tag_BoxPresent_B1` and observe the identified PLC points online | `ART-003` | Result: `EVID-04-PLC` + `ART-004` |
| Investigation | `DEC-03-COMPARE`: compare field/PLC states and measure the signal | `ART-004` | Result: `EVID-05-VOLTAGE` + `ART-005`, 24.1/0.0 VDC comparison |
| Investigation | `DEC-04-LOCALIZE`: apply authorized isolation and absence-of-voltage procedure, then test continuity | `ART-005` | Result: `EVID-06-OPEN` + `ART-006`, OL |
| Investigation | `DEC-05-OPEN`: interpret OL and physically trace BK | `ART-006` | Result: `EVID-07-DAMAGE` + `ART-007` |
| Investigation | `DEC-06-REPAIR`: repair the confirmed damaged section | `ART-007` | No new evidence and no Result; go directly to STAGE-08 with recovery unverified |
| Solution | `DEC-07-VERIFY-CHAIN`: verify the complete field-to-machine chain | None | `COMPLETE` and Result: `EVID-08-RECOVERY` + `ART-008` |

Each Result requires Continue to show the next decision or Debrief. The five investigation results are intentionally reused as context in the following stages. Voltage discrepancy guides continuity testing; it does not by itself prove the exact physical break location.

There are seven diagnostic decisions and six Result presentations. Continue changes no attempts, evidence, scoring or diagnostic progress. Recovery is unlocked only by final verification, never by repair. The Experience is already Completed while its final Result is visible; Continue then shows Debrief with `ART-008` as intentional completion-media reuse. Debrief remains terminal content rather than an executable stage.

## Learning method

```text
OBSERVE → IDENTIFY SIGNAL → TRACE SIGNAL PATH → COMPARE STATES
→ MEASURE → TEST CONTINUITY → LOCALIZE → REPAIR → VERIFY
```

The objective is reusable diagnostic judgement, not merely finding a cut wire.

## Safety and intervention boundaries

- Preserve the observed state before intervention.
- Apply the authorized safe state before electrical access or continuity testing.
- Do not replace B1 or the PLC input without evidence.
- Do not bypass `I0.3` or modify PLC logic.
- Repair or replace damaged wiring according to accepted electrical practice.
- Verify voltage, input state, tag state and machine sequence after repair.

## Media authority

The eight approved PNG masters in [`media/`](media/) are canonical. Browser derivatives are generated or synchronized into `assets/` without altering source bytes.
