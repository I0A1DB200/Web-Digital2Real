# EE-0014 — Extended position confirmation remains FALSE

| Field | Value |
|---|---|
| Editorial ID | `EE-0014` |
| Technical ID | `EXP-PNEUMATIC-CYLINDER-014` |
| Domain | Pneumatic systems — cylinder position sensing |
| Status | Technical review — preview eligible with asset warnings |
| Languages | Spanish (`es`) and English (`en`) |
| Capability mapping | `ICF-02` signal traceability, state interpretation, controlled recovery (intentional reuse while ICF-07 has no competencies) |
| Approved source media | [`media/`](media/) |
| Web derivatives | [`assets/`](assets/) |

## Scenario

The pneumatic cylinder reaches its extended mechanical position, but the PLC does not receive the extended-position confirmation. The learner must separate physical movement, magnetic sensor switching, PLC input state, derived feedback, and sequence progression.

The intended cause is a magnetic position sensor mispositioned in the cylinder's longitudinal T-slot. The correct recovery is to secure the station, find the actual detection position, reposition and secure the sensor, then verify the sensor indication and PLC states without forcing signals or changing logic.

## Asset provenance and QA gates

The seven PNGs are byte-identical copies of the uploaded handoff assets. Their SHA-256 hashes are recorded below:

| Asset | SHA-256 |
|---|---|
| `ART-001-cylinder-overview.png` | `8619a4ae904a38450f50ceb8aa12051a9e55c714486984ca023b21ad674a86d9` |
| `ART-002-cylinder-extended.png` | `d990e8d3873b497013742bb4ce89d8a9a2329ec6d94b94604fd63086ca987de5` |
| `ART-003-watch-table-failed.png` | `4186e3addb1cc6e1917962d782a1833ac0101186ca95b5ba20bc55bbab2f4149` |
| `ART-004-magnetic-sensor-off.png` | `aa2b2551798a440f6958f1e2a4f4dbb5f15ee6e71cb429398f3041138b4411d9` |
| `ART-005-magnetic-sensor-detection.png` | `266626884181abaf00c80575b1520062a3f2f4384f6c018beaef0519ecb69431` |
| `ART-006-sensor-correct-position.png` | `ae14839e36631fc8da9cf0f418935ffd679a490b282b39a2282ef4bf2e66dfc9` |
| `ART-007-watch-table-recovered.png` | `d762588409c20b357015c3d9152a7be2adf044df4055f004bdab73bb6e89c17a` |

ART-005 is a cropped image and requires explicit visual approval before publication. ART-007 also remains a QA blocker: the supplied image displays `Step_Extended` at `%MW10` and does not visually match the approved `%M20.2` bit-address correction and recovered-state contract. The image was preserved unchanged; no text or pixels were added.

## Workflow

```text
Physical extension observed
→ PLC watch-table evidence
→ Sensor position and local indication
→ Controlled detection test
→ Sensor repositioning and securing
→ Independent PLC and sequence verification
```

The authoring source is `experience.yaml`. Locale resources follow the repository's existing `locales/es.yaml` and `locales/en.yaml` convention. The package is eligible for Preview and is intentionally not production-approved while the asset gates remain unresolved.
