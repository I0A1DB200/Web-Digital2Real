# EE-0016 — Temperatura invertida en el termopar

ENV-002 V2 Experience for boundary-based diagnosis of a Type K thermocouple installation. The learner separates the thermal process, independent reference, input-module configuration, extension polarity, PLC and HMI before correcting the connection and verifying a controlled ramp.

## Technical case

The authored root cause is crossed thermocouple polarity in the extension between the field head and the temperature input. The process and independent reference rise while the HMI trend falls. The channel accepts Type K and reports no open circuit, so the case teaches that a healthy-looking input diagnostic does not prove correct polarity or correct representation.

No universal wire colours, manufacturer model, PLC address, temperature range or calibration value is asserted. Those details belong to the installed device documentation and must be reviewed before production use.

## Learner flow

```text
thermal process / independent reference
→ input type and channel diagnostics
→ extension polarity inspection
→ authored diagnosis
→ isolated reconnection
→ controlled thermal ramp
```

The reconnection does not register recovery. Completion requires the independent reference, temperature module, PLC and HMI to follow the same direction at three representative points without forced values or inverted scaling.

## Media

Seven learner-facing PNGs are included. Photographs provide physical context and safe inspection context; the exact trend and polarity relationships are controlled diagrams. Generated visuals are illustrative and do not represent a manufacturer capture or independent proof of a measured value. The authored evidence owns the diagnostic conclusion.

## Status and validation

Status is `technical_review`. The package is preview eligible after source and localization validation. Before production, review the Type K input module, extension cable standard, cold-junction behaviour, isolation procedure and installed thermal process against approved documentation.
