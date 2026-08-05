# EE-0009 — Photoelectric Sensor Misalignment

| Field | Value |
|---|---|
| Editorial ID | `EE-0009` |
| Technical ID | `EXP-SENSOR-PHOTOELECTRIC-009` |
| Domain | Industrial I/O — photoelectric sensing |
| Preliminary objective | Develop evidence-led reasoning about photoelectric sensor alignment |
| Status | Draft — non-buildable |
| Principal Capability | `ICF-02` — Industrial I/O |
| Competencies | Pending governed ICF-02 competency definitions |
| Languages | Spanish (`es`) and English (`en`), both draft |
| Masters | [`media-source/`](media-source/) |
| Web derivatives | [`assets/`](assets/) |

## Workflow

```text
Approved Blueprint
→ Complete ES/EN authoring
→ Approved masters
→ Web derivatives
→ Authoring validation
→ Technical review
→ Packaging
→ Publication
```

`experience.yaml` is currently an intentionally incomplete Authoring v1 scaffold. Its `draft` lifecycle state excludes it from preview and production packaging without an Experience-specific list or Frontend rule.

## Expected masters

- `cover-master.png`
- `intro-master.mp4`
- `sensor-led-master.mp4`
- `beam-alignment-master.mp4`
- `plc-input-master.mp4`
- `support-alignment-master.png`
- `top-view-master.png`
- `hmi-diagnostics-master.png`
- `outro-master.mp4`

Do not create placeholders or reconstruct masters from derivatives.

## Build gate

Build may begin only when all of the following exist and are approved:

- the Experience Blueprint;
- complete Spanish and English learner-facing content;
- every required master listed above;
- the complete Authoring Definition v1, including governed competency references;
- technical validation evidence.

Until then, do not generate Runtime, Web Artifact, catalog entries, Experience Lab integration, or public assets.
