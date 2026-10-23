# EE-0007 — Sequence stuck waiting for condition

Experience Engine V2 scenario for diagnosing a Siemens GRAPH sequence blocked at S40 because T40 references `PartAtStop_2` instead of the verified physical tag `PartAtStop_Sensor` at `%I0.5`.

The canonical diagnostic path preserves the physical process and PLC input, corrects the transition reference, and verifies progression to S41 over repeated cycles without forcing.

## Canonical files

- `experience.yaml`: authoring SSOT and private diagnostic truth.
- `locales/es.yaml` and `locales/en.yaml`: learner-facing localization.
- `assets/`: seven approved frozen raster assets.
- `media-source/`: source provenance only; never packaged for the browser.


## Learning moments and media contract

Seven decisions and 23 options remain (correct positions C/D/B/A/C/B/D).
D1 locates S40/T40 and D2 reads the condition: both acquire textual evidence and transition directly.
D3 inspects the physical state (EVID-04 / ART-004); D4 monitors the input/tag (EVID-05 / ART-005); D5 compares references (EVID-06 / ART-006). Each opens one Result.
D6 diagnoses from acquired evidence and transitions directly without recovery evidence.
D7 combines authorized correction and functional verification, exclusively unlocking EVID-07 / ART-007 and earning completion before the final Result Continue. Continue only changes presentation.
EVID-01 is initial context, with no interaction authority; it is intentionally absent from the projected interactive collection.

Stage media in order: [ART-002], [], [], [ART-004], [ART-005], [ART-006], [].
Evidence media EVID-01 through EVID-07: [], [], [], [ART-004], [ART-005], [ART-006], [ART-007].
Cover: ART-001. Completion: ART-007. Exactly four Results: D3/D4/D5/D7.
ART-003 remains registered but is not presented: its next step S50 conflicts with canonical S41. D1/D2 remain fully supported by authored textual observations.

Existing authorized-procedure and controlled-movement prerequisites are visible before inspection and logic changes. Do not force transitions or replace the process condition with TRUE. Recovery requires the authored functional test and representative cycles without forcing; static pictures and sensor light colours do not establish movement, electrical state, repeatability or overall PLC/network health.
ES/EN share the same relations and media maps. Browser QA remains pending; automated preview inspection does not replace it.
