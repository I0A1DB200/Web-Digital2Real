# EE-0011 — Inductive Sensor Not Detecting

ENV-002 V2 troubleshooting Experience for the Turck BI6U-MT12-IOL6X2-H1141. The learner distinguishes physical presence, power, switching, healthy IO-Link communication and PLC/HMI representation.

Six investigation decisions establish the installation diagnosis before a safe correction decision and an independent full-chain verification decision. Correct positions: B, C, A, B, A, C, C, B. Only private `is_correct` controls V2 advance/retry; legacy numeric fields remain neutral and the established V2 evaluation policy is unchanged.

Measured gap: 7.8 mm. Sn: 6 mm. Documented secured condition: ≤ 4.86 mm (0.81 × Sn). Sn is not an exact switching threshold. No exact corrected gap is invented. Verification must establish the documented condition and physical detection → IO-Link → PLC → HMI propagation.

Frozen asset 01 is an editorial cover only, not unresolved-state evidence. Asset 02 has no measurement annotations. Asset 07 retains the original ≤ 6 mm label; localized verification text explicitly distinguishes this label from proof of the secured condition. Images are never modified or substituted.

Theory remains owned by ENV-002: reuse TH-01 and TH-06, with reusable TH-07–TH-09 additions. No dedicated Experience Theory registry.

Manufacturer identification and rated distance: https://www.turck.us/en/product/1644874 . Secured-distance reference: user-validated asset 05 and approved specification.

Validation: `node --test experience-engine/packaging/tests/ee0011InductiveSensorNotDetectingExperience.test.js`.
