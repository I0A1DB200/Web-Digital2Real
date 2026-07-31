# EE-0008 — IO-Link Device Offline

| Field | Value |
|---|---|
| Technical ID | `EXP-IOLINK-DEVICE-008` |
| Domain | IO-Link field-device diagnostics |
| Learning objective | Diagnose an offline device through observable evidence before replacement or restart |
| Primary symptom | Station 3 stops after losing communication with its presence sensor |
| Root cause | Partially unscrewed M12 connector causing loss of power and communication |
| Languages | Spanish (`es`) and English (`en`) |
| Default locale | Spanish (`es`); Experience Lab selects its document language when available |
| Status | Technical review |

The executable source is [experience.yaml](experience.yaml). Localized visible copy is held in `locales/`; both locale documents resolve against the same IDs and decision structure.

Original high-quality media belongs in `media-source/`. That directory currently has no masters: the nine existing web assets were generated directly and no genuine source masters were retained. Do not synthesize masters from compressed derivatives and never modify future masters automatically.

`assets/` contains regenerable web derivatives only. Current files include fixed English technical labels inherited from the approved pilot media; localization uses translated captions and alternative text without regenerating those valid assets.

Validate with:

```text
node --test experience-engine/packaging/tests/ee0008IoLinkExperience.test.js
node scripts/package-experience-engine.mjs --mode=preview
```

