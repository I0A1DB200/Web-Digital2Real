# EE-0011 — Inductive Sensor Not Detecting

ENV-002 V2 troubleshooting Experience for the Turck BI6U-MT12-IOL6X2-H1141. The learner distinguishes physical presence, power, switching, healthy IO-Link communication and PLC/HMI representation.

Six investigation decisions establish the installation diagnosis before a safe correction decision and an independent full-chain verification decision. Correct positions: B, C, A, B, A, C, C, B. Only private `is_correct` controls V2 advance/retry; legacy numeric fields remain neutral and the established V2 evaluation policy is unchanged.

Measured gap: 7.8 mm. Sn: 6 mm. Documented secured condition: ≤ 4.86 mm (0.81 × Sn). Sn is not an exact switching threshold. No exact corrected gap is invented. Verification must establish the documented condition and physical detection → IO-Link → PLC → HMI propagation.

Frozen asset 01 is an editorial cover only, not unresolved-state evidence. Asset 02 has no measurement annotations. Asset 07 retains the original ≤ 6 mm label; localized verification text explicitly distinguishes this label from proof of the secured condition. Images are never modified or substituted.

Theory remains owned by ENV-002: reuse TH-01 and TH-06, with reusable TH-07–TH-09 additions. No dedicated Experience Theory registry.

Manufacturer identification and rated distance: https://www.turck.us/en/product/1644874 . Secured-distance reference: user-validated asset 05 and approved specification.

Validation: `node --test experience-engine/packaging/tests/ee0011InductiveSensorNotDetectingExperience.test.js`.

## Learning and media remap

Eight decisions and 24 options are preserved. D1–D6 diagnose; D7 corrects and secures mounting only; D8 independently verifies the documented secured condition and the full sensor → IO-Link → PLC → HMI chain. EVID-08 remains the D7 intervention record, without successful detection claims. New EVID-09 is unlocked only by D8 and earns completion before the final presentation-only Continue. Existing evaluation policy, neutral legacy scoring and Retry authority are unchanged.

Cover ART-001. Ordered stage media: [ART-002], [], [ART-004], [ART-005], [ART-006], [ART-005, ART-006], [], []. EVID-01 is initial/context with []; acquired EVID-02 through EVID-09 map to [], [ART-004], [ART-005], [ART-006], [], [], [], [ART-007]. Results: D2, D3, D4, D8 (four). Direct: D1, D5, D6, D7. No multi-evidence Results. Completion [ART-007].

Actual-pixel audit: ART-001 is editorial illustration with both LEDs lit, never incident proof. ART-002 contains the initial HMI zero and available sensor power, without a measured gap. ART-003 remains registered but hidden: its CM 4x IO-Link/channel 1 architecture differs from the TBEN/port 6 interface in ART-006/007. System health is valid authored textual evidence; no topology reconciliation is invented. ART-004 illustrates target and indicator inspection. ART-005 is the measurement/reference acquisition (7.8 mm, Sn 6 mm, secured ≤ 4.86 mm), without turning Sn into an exact threshold. ART-006 follows the IO-Link read in D4. ART-005/006 are intentionally reused for diagnosis review. ART-007 appears only after D8 and in Debrief; its ≤ 6 mm label does not prove secured-distance acceptance or repeatability. The authored final check establishes acceptance and signal propagation; no exact corrected gap, cycle count or new measurement is fabricated.

Safety prerequisites are visible before inspection, measurement, adjustment and final verification. The post-adjustment stage contains no stale pre-adjustment zero image and no premature recovery image. No Engine or image changes. Browser QA pending globally.
