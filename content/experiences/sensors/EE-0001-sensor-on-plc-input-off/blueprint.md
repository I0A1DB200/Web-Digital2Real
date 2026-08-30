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

The executable structure is `Incident → Investigation → Solution → Debrief`. Every row below is an explicit decision point; an incorrect option remains in place and unlocks no evidence.

| Phase | Decision point | Available media | Evidence gained after the best action |
|---|---|---|---|
| Incident | Confirm the field/PLC discrepancy and select the documented route | `ART-001`, `ART-002` | Electrical schematic, `ART-003` |
| Investigation | Identify `B1 → BK → X1:17 → I0.3` | `ART-003` | Live PLC state, `ART-004` |
| Investigation | Compare the PLC observation with the field state | `ART-004` | 24.1/0.0 VDC comparison, `ART-005` |
| Investigation | Isolate and test the intervening conductor safely | `ART-005` | Open-circuit result, `ART-006` |
| Investigation | Interpret OL and trace the cable route | `ART-006` | Physical BK damage, `ART-007` |
| Investigation | Repair the confirmed damaged conductor | `ART-007` | Recovery evidence, `ART-008` |
| Solution | Verify the complete field-to-machine chain | `ART-008` | Explicit `COMPLETE` transition |

Debrief remains terminal content rather than an executable stage.

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
