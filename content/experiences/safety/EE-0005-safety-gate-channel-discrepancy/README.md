# EE-0005 — Safety Gate Channel Discrepancy

Canonical Experience Engine V2 authoring package for the fifth ENV-001 experience.

- Runtime ID: `EXP-SAFETY-GATE-005`
- Contract: `2.0.0`
- Status: `technical_review`
- Canonical cause: mechanical misalignment between the safety-gate actuator and interlock.

The seven evidence images are approved frozen inputs. Learner-facing text is localized through `locales/es.yaml` and `locales/en.yaml`.


## Approved learning-moment remap

Six decisions; 21 options (6 correct, 15 Retry); 7 authored evidence items, including 2 initial/context items and 5 interactive items. Initial EVID-01/02 remain outside interactive projection; Incident Brief carries their context.

| Decision | Evidence / media | Transition |
|---|---|---|
| D1 identify function | EVID-03 textual | Direct |
| D2 inspect indication | EVID-04 / ART-003 | Result, then Stage 3 context |
| D3 read online detail | EVID-05 / ART-004 | Result, then Stage 4 context |
| D4 inspect physical relation | EVID-06 / ART-005 | Result, then Stage 5 context |
| D5 restore mounting | No recovery unlock | Direct; verification pending |
| D6 functional verification | EVID-07 / ART-006, ART-007 | Completion earned, Result, Continue, Debrief |

Exactly four Results: D2/D3/D4/D6. ART-001 is Incident Brief only. ART-002 stays registered without presentation. ART-007 accompanies Debrief. EVID-07 authority moves from D5 to D6: physical restoration does not establish channel, reset or protective-function recovery.

Continue changes presentation only. Existing authorized safe diagnostic, isolation/maintenance and functional-test conditions are visible before relevant actions; reset and Start remain distinct. No new procedures or measurements are introduced.

Implementation validation includes focused tests and mandatory canonical preview inspection in ES/EN. Browser QA remains pending globally because of infrastructure failures.
