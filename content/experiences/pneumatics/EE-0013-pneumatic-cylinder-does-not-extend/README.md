# EE-0013 — Pneumatic cylinder does not extend

Technical-review Experience for `ENV-002`. The case teaches boundary-based diagnosis from PLC command through valve control and pneumatic availability to the local cylinder connection.

The case is intentionally distinct from EE-0004: the cylinder does not begin moving, and the root cause is a disconnected local pneumatic line rather than restricted exhaust flow.

## Learner flow

```text
incident
→ PLC observation
→ output / valve-control observation
→ pneumatic supply inspection
→ isolated local connection inspection
→ reconnection
→ independent controlled verification
```

Reconnection does not register completion. Completion requires observed extension and `ExtendedLS = TRUE` during the independent controlled functional test. No cycle count, travel time or pressure limit is inferred.

## Assets

All seven learner-facing assets are generated PNGs specific to EE-0013. EE-0011 supplies the realistic software treatment, EE-0012 the independent correction/verification pattern, and EE-0004 the industrial photographic references. Existing EE-0004 binaries were rejected for final reuse because their numerical pressure, PLC details or recovery composition introduced unsupported case details.

`ExtendOutput` and `ExtendedLS` are illustrative symbolic names for the commanded output and extended feedback. They do not establish real PLC addresses, hardware models or manufacturer configuration. No numerical air pressure is specified.

The ENV-002 hotspot is an editorial entry on the existing gallery background, not a physical location of a cylinder in that photograph. No ENV layout or background was redesigned.

Status: technical review. Browser QA remains infrastructure-blocked; automated validation is not production certification.
