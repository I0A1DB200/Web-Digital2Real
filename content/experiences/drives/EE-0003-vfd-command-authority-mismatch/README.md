# EE-0003 — VFD Command Authority Mismatch

| Field | Value |
|---|---|
| Editorial ID | `EE-0003` |
| Technical ID | `EXP-VFD-AUTHORITY-003` |
| Domain | Motor / VFD / PLC command chain |
| Status | Technical review — Preview eligible |
| Environment | `ENV-001` |
| Languages | Spanish and English; Spanish fallback |
| Visual state | Seven registered PNGs; ART-005 intentionally not presented pending semantic clarification |

EE-0003 teaches evidence-led diagnosis of a valid PLC run request that is not executed because the SINAMICS G120 is under HAND/BOP authority while production requires AUTO control through S7-1500 and PROFINET.

`experience.yaml` is the canonical Authoring V2 source. Browser artifacts and asset copies are generated only through the existing packaging pipeline.

## Approved learning moments

Incident Brief presents ART-001 and the reported HMI request without movement. No stage repeats the cover. The six diagnostic decisions retain eighteen options and seven evidence items.

| Decision | Stage media before action | Earned evidence and presentation |
|---|---|---|
| D1: inspect drive state and indicated frequency from a safe position | None | EVID-02 + ART-002 Result, then Continue |
| D2: check CPU operating state; RunCmd remains unverified | ART-002 | EVID-03 + ART-003 Result, then Continue |
| D3: inspect active command authority | ART-003 | EVID-04 + ART-004 Result, then Continue |
| D4: consult the required architecture | ART-004 | EVID-05 textual; direct transition |
| D5: verify FB_CONVEYOR online from a safe position | None | EVID-06 + ART-006 Result, then Continue |
| D6: apply the authorized procedure, restore authority and verify the complete chain | ART-006 | Completed plus EVID-07 + ART-007 Result; Continue opens Debrief |

There are five Results, only after D1/D2/D3/D5/D6. Continue changes presentation without adding attempts, decisions, evidence or evaluation. D6 deliberately combines intervention and functional verification; seeing AUTO alone remains an incorrect closing criterion. ART-007 is intentionally reused in Debrief.

## Visual limitations and safety

ART-005 remains registered but intentionally unpresented: its composition mixes intended PLC/PROFINET architecture with a physical panel appearing to show AUTO already active, before correction. Its additional parameters, address and indicators are not new technical authority for this case. No binary was edited, renamed or removed.

ART-001 illustrates the incident; stopped movement comes from the report. ART-002 shows drive state and indicated frequency. ART-003 shows CPU RUN, not full PLC or network health. ART-004 shows current HAND/BOP authority; suitability is established only by D4. ART-006 shows the acquired application states, not proof of command acceptance. ART-007 illustrates recovery feedback; actual movement comes from the functional test described in EVID-07.

SafetyOK TRUE does not replace the authored safe-position and authorized-intervention requirements. No electrical measurement, new parameter-setting procedure or additional safety procedure is introduced. Source remap validation is separate from browser QA, which remains deferred. No preview is regenerated as part of this implementation.
