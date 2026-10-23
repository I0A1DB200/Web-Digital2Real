# EE-0002 — Intermittent Photoelectric Sensor Detection

| Field | Value |
|---|---|
| Editorial ID | `EE-0002` |
| Technical ID | `EXP-SENSOR-INTERMITTENT-002` |
| Domain | Industrial I/O — intermittent photoelectric detection |
| Status | Published — available through ENV-001 Preview |
| Principal Capability | `ICF-02` — Industrial I/O |
| Languages | Spanish (`es`) and English (`en`); Spanish fallback |
| Visual state | Seven registered assets; ART-001/002/005/007 presented with bounded semantics; ART-003/004/006 withheld |

EE-0002 teaches evidence-led diagnosis of an intermittent missed detection. The learner reproduces the symptom, compares successful and failed cycles, establishes the diagnostic boundary from sensor output and PLC input, correlates misses with box position, confirms marginal alignment, and validates the secured realignment with repeated cycles.

`experience.yaml` is the single canonical Authoring Definition V2. The Experience uses the existing Player, evaluator, localization, security projection and ENV Progress contracts without extension.

The approved remap uses seven decisions and three Results, after D2, D5 and D7. D2 combines illustrated successful-state evidence with textual failed-cycle evidence in one Result. D6 earns intervention evidence only; D7 earns validation and completion before Continue to Debrief.

ART-003, ART-004 and ART-006 remain registered but are intentionally not presented pending technical/media clarification. They have contradictory or undocumented acquisition semantics. The remaining images are illustrations, not proof of a production counter, a ten-cycle sample or universal reliability. The asset limitations and roles are recorded in [`ASSET-REQUIREMENTS.md`](ASSET-REQUIREMENTS.md). Browser QA of this remap remains pending.
