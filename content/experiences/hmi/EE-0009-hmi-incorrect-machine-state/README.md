# EE-0009 — HMI Incorrect Machine State

Canonical Contract 2.0.0 Experience for distinguishing a correct physical and PLC state from an incorrect HMI representation. The TP700 Comfort remains connected; `BoxAtStop_HMI` initially points to `DB_HMI.BoxAtStop_2` at `%DB10.DBX1.1` instead of `DB_HMI.BoxAtStop` at `%DB10.DBX0.0`.

`experience.yaml` owns the authoring and private diagnostic truth. `locales/` owns ES/EN learner text. `assets/` contains the six approved frozen PNGs. `media-source/` records provenance and is not packaged.

## Learning and media remap

Preserve six decisions and nineteen options (B/C/A/D/B/A). D1/D2/D5 are direct; Results D3/D4/D6. EVID-01 is initial context; EVID-02 through EVID-07 are interactive. D6 exclusively acquires EVID-07 after combined correction and verification, earning completion before Continue.

Stage media: [ART-002], [], [], [ART-004], [ART-005], []. Evidence media EVID-01..07: [], [], [], [ART-004], [ART-005], [], [ART-006]. Cover ART-001; completion ART-006. ART-003 remains registered but hidden: pixels show ConveyorTags [DB1], conflicting with canonical DB_HMI [DB10]. ART-002 illustrates the initial contradiction, not verified sensor/PLC health. ART-004 illustrates connection; updating values require observation. ART-005 is inspected mapping, reused in S5. ART-006 is final verification/debrief context, not proof of repeated operation. Existing movement-control prerequisites are visible before physical observation and final verification. Engine and PNG unchanged; Browser QA pending.
