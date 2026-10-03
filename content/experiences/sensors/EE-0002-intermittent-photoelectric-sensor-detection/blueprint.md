# EE-0002 — Experience Blueprint

## Intermittent Photoelectric Sensor Detection

**Experience class:** Practice  
**Difficulty:** Foundation  
**Estimated duration:** 14 minutes  
**Environment:** ENV-001  
**Core principle:** Correlate the failure before replacing components.

## Canonical scenario

A conveyor detects most boxes normally. Occasionally a box crosses the photoelectric point without activating the sensor output or PLC input and is not registered. The root cause is marginal sensor alignment near the edge of the actual product path. Normal lateral variation therefore produces intermittent misses.

## Investigation graph

```text
CHARACTERIZE → COMPARE CYCLES → SET SENSOR/PLC BOUNDARY
→ CORRELATE POSITION → INSPECT ALIGNMENT → REALIGN AND SECURE
→ VALIDATE REPEATED CYCLES → DEBRIEF
```

Incorrect decisions remain at the current stage, increment attempts, reveal no evidence and provide learner-safe retry feedback. The final transition requires a repeated validation sample; one successful cycle is insufficient.

## Learning moments and media

Incident Brief uses ART-001 as presentation only. Stage media is information already acquired; evidence media accompanies the action that earns it.

| Decision | Available stage media | Evidence earned | Presentation |
|---|---|---|---|
| D1: observe cycles safely | None | EVID-02 | Direct to Stage 02 with the reproduced sample described in context |
| D2: observe sensor output, monitor PLC input and check the production record in retained examples | None | EVID-03 + EVID-04 | One Result: EVID-03 with ART-002 and EVID-04 textual; Continue to Stage 03 |
| D3: interpret the diagnostic boundary | ART-002 | EVID-05 | Direct to Stage 04 with the acquired conclusion |
| D4: correlate position and omissions | None | EVID-06 | Direct to Stage 05 with the acquired correlation |
| D5: inspect geometry | None | EVID-07 | Result with ART-005; Continue to Stage 06 |
| D6: apply authorized stop/isolation, realign and secure | ART-005 | EVID-08-REPAIR | Direct to Stage 07; validation remains pending and no recovery media is shown |
| D7: validate a post-intervention sample under relevant conditions | None | EVID-09-VALIDATION | Completed plus Result with ART-007; Continue to Debrief |

There remain seven diagnostic decisions, twenty-one options and nine evidence items. Only D2, D5 and D7 produce Results. Continue adds no diagnostic decision, attempt, evidence or evaluation. Completion is earned at correct D7 before Continue, which only opens Debrief. ART-007 is intentionally reused there.

## Visual limitations

ART-003, ART-004 and ART-006 remain registered but are intentionally not presented pending technical/media clarification. Their measurement acquisition is undocumented; ART-003 also contradicts its failed-cycle filename and ART-004 does not demonstrate position correlation. ART-006 mixes intervention with active SOPAS diagnostics and does not demonstrate multicycle validation.

ART-002 and ART-007 illustrate observed states, not production counters or complete samples. ART-005 illustrates geometry without tolerances. The geometry inspection does not establish that the sensor is universally functional, clean or correctly configured. See ASSET-REQUIREMENTS.md for the effective-image limitations, including ART-007's PLC platform inconsistency.

## Root-cause disclosure boundary

The initial incident contains only the intermittent symptom. Marginal alignment is not disclosed until successful and failed cycles have been compared, both sensor output and PLC input are observed OFF during the miss, and product position is correlated with the omission.

## Recovery claim

Completion means only that every cycle executed in the Experience validation sample was detected and registered correctly, including the positions previously associated with the miss. It does not claim universal future reliability.
