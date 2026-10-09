# EE-0012 asset specifications

All assets are Experience-local D2R technical diagrams. They use authored scenario values, not manufacturer specifications.

## ART-001 — Cover — REALISTIC_PREFERRED

- **Learning moment:** Incident Brief.
- **Semantic role:** COVER.
- **System/equipment:** Pressure vessel, generic 4–20 mA pressure transmitter, PLC/HMI.
- **Visible state:** Photorealistic industrial pressure vessel and generic stainless pressure transmitter in a process area, without diagnostic values.
- **Must show:** Plausible threaded process connection, cable entry and industrial context.
- **Must not show:** Root cause, correction, successful verification, manufacturer identity or terminal details.
- **Acceptance:** Presentation only; creates no evidence or progress.

## ART-002 — Initial discrepancy — REALISTIC_PHYSICAL_REQUIRED

- **Learning moment:** Initial investigation.
- **Semantic role:** STAGE.
- **Visible state:** Photorealistic installed generic pressure transmitter and independent analog gauge indicating the same stable process condition, with a nearby controlled generic HMI indicating the conflicting value.
- **Must not show:** Loop current, scaling configuration or fault location.
- **Acceptance:** Supports discrepancy recognition only.

## ART-003 — Loop measurement — REALISTIC_PHYSICAL_REQUIRED

- **Learning moment:** Result after measuring the loop under the installation's safe procedure.
- **Semantic role:** EVIDENCE / MEASUREMENT.
- **Visible state:** Photorealistic loop calibrator/multimeter in mA mode connected through a plausible authorized series test arrangement, reading 13.6 mA beside the installed transmitter.
- **Must not show:** PLC scale configuration or recovered state.
- **Acceptance:** Communicates the acquired measurement and valid linear calculation without raw-count assumptions.

## ART-004 — Scaling inspection — DESIGNED TECHNICAL IMAGE

- **Learning moment:** Result after inspecting PLC engineering scaling.
- **Semantic role:** EVIDENCE / DIAGNOSTIC.
- **Visible state:** Input at 60%; configured engineering span 0–5 bar; resulting 3.0 bar; expected span 0–10 bar and expected value 6.0 bar.
- **Must not show:** Intervention already applied or recovery verified.
- **Acceptance:** Finished PNG with no Experience number, player-like card shell, navigation or redundant footer. Localizes the discrepancy while preserving intervention as a later action.

## ART-006 — Scaling intervention — DESIGNED TECHNICAL IMAGE

- **Learning moment:** Result after the learner applies the scaling correction.
- **Semantic role:** EVIDENCE / INTERVENTION.
- **Visible state:** Current configuration 0–5 bar changes to required configuration 0–10 bar; verification remains explicitly pending.
- **Must not show:** Successful current/pressure agreement, healthy multi-point results or completion.
- **Acceptance:** Finished PNG distinct from ART-004, unlocked only by DEC-04-CORRECT.

## ART-005 — Recovery verification — REALISTIC_PREFERRED

- **Learning moment:** Result after independent verification.
- **Semantic role:** EVIDENCE and COMPLETION.
- **Visible state:** Photorealistic verified operating scene showing a stable transmitter reading, a matching loop measurement and a matching generic HMI. The authored evidence, rather than pixels alone, owns the complete three-point record: 2.0 bar/7.2 mA, 6.0 bar/13.6 mA and 8.0 bar/16.8 mA.
- **Must not show:** Unsupported accuracy, calibration tolerance or manufacturer certification.
- **Acceptance:** Appears only after verification and in Debrief.

## Cross-asset constraints

- Same generic transmitter, `PT-201`, analog channel and `Pressure_bar` tag throughout.
- Scenario range is always 0–10 bar.
- No wire colours, terminal numbers, raw PLC counts, diagnostic thresholds, HART behavior or manufacturer branding.
- Resolution: 1672 × 941 landscape; text is bilingual-neutral engineering notation where possible.
- Provenance: original D2R-generated raster for ART-001/002/003/005 and programmatically composed D2R raster for ART-004/006; source context `SRC-000043`, `SRC-000045`, `SRC-000046`. No external manufacturer image is embedded.
