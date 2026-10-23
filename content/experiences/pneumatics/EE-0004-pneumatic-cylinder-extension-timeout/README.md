# EE-0004 — Pneumatic Cylinder Extension Timeout

Canonical Experience Engine V2 authoring package for ENV-001.

- Canonical definition: experience.yaml
- Learner localizations: locales/es.yaml and locales/en.yaml
- Approved media: assets/01.png through assets/07.png
- Publication state: technical review

The diagnostic root cause is excessive exhaust-flow restriction during cylinder extension. Correctness authority remains private.

## Learning moments

Six diagnostic decisions, twenty options (six correct, fourteen Retry), seven authored evidence items and five interactive evidence items.

| Action | Acquired evidence | Presentation |
|---|---|---|
| D1 observe local Y1 indication | EVID-03 / ART-003 | Result, then Stage 2 context |
| D2 inspect supply | EVID-04 / ART-004 | Result, then Stage 3 context |
| D3 observe extension | EVID-05 / ART-005 | Result, then Stage 4 context |
| D4 inspect regulation/load | EVID-06 / ART-006 | Result, then Stage 5 context |
| D5 restore intended setting | None; verification pending | Direct to Stage 6, no media |
| D6 verify representative cycles | EVID-07 / ART-007 | Completion earned, final Result, then Debrief |

ART-001 presents the Incident Brief. ART-002 is supplied PLC context in Stage 1. EVID-01 and EVID-02 have no unlock authority and are intentionally absent from projected interactive evidence. Continue changes presentation only, never diagnostic progress, attempts, scoring or completion registration.

Safety wording reuses authored safe-position, authorized energy-isolation and motion-control constraints before relevant actions. SafetyOK is not an authorization to intervene. No new values, procedures or cycle counts are introduced.

Validation is automated and content-specific. Browser QA remains pending because of infrastructure failures; this remap does not regenerate preview.
