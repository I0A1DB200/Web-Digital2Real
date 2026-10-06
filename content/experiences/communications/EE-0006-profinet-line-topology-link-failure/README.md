# EE-0006 — PROFINET Line Topology / Link Failure

Canonical Experience Engine V2 package for the sixth ENV-001 Experience.

- Runtime ID: `EXP-PROFINET-LINK-006`
- Contract: `2.0.0`
- Status: `technical_review`
- Canonical cause: physical damage in the PROFINET link between A2 Turck and A3 Murr.


## Learning-moment remap

Six decisions; twenty options (six correct, fourteen Retry); eight authored evidence items, including two initial/context items and six interactive items. EVID-01/02 remain outside interactive projection; Incident Brief supplies the reported availability pattern.

| Decision | Acquired evidence / media | Transition |
|---|---|---|
| D1 compare areas and observe installation | EVID-03 / ART-002 | Result, then Stage 2 context |
| D2 consult TIA | EVID-04 / ART-003 | Result, then Stage 3 context |
| D3 locate boundary and observe power/link | EVID-05 / ART-004 | Result, then Stage 4 context |
| D4 consult topology and inspect segment | EVID-06 textual, EVID-07 / ART-006 | One Result, then Stage 5 context |
| D5 restore segment | No recovery evidence | Direct; verification pending |
| D6 verify link, A3/A4, cyclic data, I/O and function | EVID-08 / ART-007 | Completion earned, Result, Continue, Debrief |

Exactly five Results: D1/D2/D3/D4/D6. ART-001 presents Incident Brief only; ART-005 remains registered without presentation. ART-007 is reused in Debrief. Continue changes presentation, not attempts, evidence, evaluation or completion registration.

D1/D3/D4 explicitly acquire the observations already described in their evidence. Existing safe diagnostic conditions and authorized maintenance remain prerequisites; no isolation sequence, measurements, addressing or timing values are added. D5 applies repair; only D6 establishes recovery.

Automated closure requires focused tests, git diff --check, canonical preview regeneration and inspection of generated ES/EN artifacts. Browser QA remains globally pending due to infrastructure instability.
