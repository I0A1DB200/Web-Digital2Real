# EE-0002 — Asset Requirements

The seven final visual assets are approved and integrated. ENV-001's canonical background remains the Environment view and is not duplicated into the Experience package.

| Proposed asset | Purpose | Appears at | Evidence communicated | Format constraint | Composition relationship | Premature-disclosure risk |
|---|---|---|---|---|---|---|
| `ART-001-cycle-observation.png` | Establish the intermittent symptom without diagnosing it | Incident / catalog cover | Conveyor detection point with normal operation and no permanent alarm; no alignment annotation | PNG, 16:9 preferred | Base composition for ART-002 and ART-003 | Low if the sensor axis is not diagrammed |
| `ART-002-successful-cycle.png` | Record a successful reference cycle | Compare cycles | Box present; sensor output ON; PLC input ON; registration incremented | PNG, same dimensions as ART-003 | Must share camera, crop and state layout with ART-003 | Low |
| `ART-003-failed-cycle.png` | Make the electrical boundary observable | Compare cycles | Box crossing; sensor output OFF; PLC input OFF; no registration | PNG, same dimensions as ART-002 | Must match ART-002 exactly except diagnostic state | Medium; must not show alignment geometry |
| `ART-004-position-correlation.png` | Correlate misses with normal lateral product variation | Correlation stage | Successful and missed trajectories compared without yet naming root cause | PNG, 16:9 preferred | Same conveyor reference as ART-001 | Medium; show correlation, not the alignment conclusion |
| `ART-005-marginal-alignment.png` | Confirm the root cause at the correct stage | Alignment inspection | Detection axis close to the edge of the actual box path; optics clean and mounting intact | PNG, detail/diagram composition | Should derive spatially from ART-004 | High; never expose before inspection stage |
| `ART-006-realignment-secured.png` | Document the intervention | Correction stage | Axis centered over effective path and bracket mechanically secured | PNG, same dimensions as ART-005 | Before/after pair with ART-005 | High; only after root cause confirmation |
| `ART-007-validation-cycles.png` | Support post-repair verification | Solution / completion | Repeated validation sample, including prior edge positions, with sensor ON, PLC ON and registration for every executed cycle | PNG, 16:9 preferred | Reuse state language from ART-002/003 | Low after repair; must avoid universal reliability claims |

All assets materially support a diagnostic boundary or evidence transition. Decorative imagery and placeholders are excluded.
