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

## Root-cause disclosure boundary

The initial incident contains only the intermittent symptom. Marginal alignment is not disclosed until successful and failed cycles have been compared, both sensor output and PLC input are observed OFF during the miss, and product position is correlated with the omission.

## Recovery claim

Completion means only that every cycle executed in the Experience validation sample was detected and registered correctly, including the positions previously associated with the miss. It does not claim universal future reliability.
