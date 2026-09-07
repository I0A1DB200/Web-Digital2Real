# EE-0003 — VFD Command Authority Mismatch

| Field | Value |
|---|---|
| Editorial ID | `EE-0003` |
| Technical ID | `EXP-VFD-AUTHORITY-003` |
| Domain | Motor / VFD / PLC command chain |
| Status | Technical review — Preview eligible |
| Environment | `ENV-001` |
| Languages | Spanish and English; Spanish fallback |
| Visual state | Seven reviewed PNG evidence assets available |

EE-0003 teaches evidence-led diagnosis of a valid PLC run request that is not executed because the SINAMICS G120 is under HAND/BOP authority while production requires AUTO control through S7-1500 and PROFINET.

`experience.yaml` is the canonical Authoring V2 source. Browser artifacts and asset copies are generated only through the existing packaging pipeline.
