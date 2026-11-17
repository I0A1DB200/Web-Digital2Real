# EE-0041 — Cobot Programming / Palletizing

Status: TECHNICAL REVIEW. Technical ID: `EXP-UR-COBOT-001`. Contract: 2.0.0.

## Ownership

- `brief.yaml`: source engineering brief; references the canonical Experience definition.
- `experience.yaml`: canonical structured learning model, access policy and public.catalog_card image metadata.
- `locales/en.yaml`, `locales/es.yaml`: ID-keyed learner copy, same technical model.
- `Frontend/assets/images/d2r-cobot-palletizing-card.webp`: single approved image binary, retained at the website's existing static image root.

The new robotics directory owns authored content only. No runtime, emulator, SCL, generated artifacts or duplicated design tokens belong here.

## Confirmed scope

The supplied V3.6 README states that the nominal V1.9 trace has no confirmed DI_BoxSensor value, that N/D does not mean OFF, and that the green LED is an illustration of power rather than an electrical measurement. The initial learning case tests those evidence boundaries in three moments with six options (one accepted and one retry per moment). Completion validates interpretation, never physical equipment recovery. These are authored learning choices based on the provided documentation, not recorded lab results.

The proposed broader programming/palletizing simulation remains a prototype reference. This package does not claim certified UR10e kinematics, a compiled TIA Portal project, physical validation or a complete robot programming curriculum. Technical and editorial review remain pending.

## Access card and publication

The Experience definition records the approved image as a navigation illustration, never diagnostic evidence. Dimensions: 1672 × 941. SHA256: 37f3226f4904fd7a819893832338f0090c9470e805192b96a9feb69da737528e.

The access card now opens the exact supplied HTML prototype at Frontend/simulators/cobot/index.html via a native link. It does not enter the textual diagnostic case. The user's explicit correction authorizes publishing this HTML; it is preserved byte-for-byte, including its original built-in controls and downloads. Separate source ZIPs and QA files are not copied to public output.

experience.yaml public.catalog_card.target owns the destination; packaging validates it as a local simulators/<name>/index.html file. The navigator renders a native anchor for this optional destination, while cards without a target retain Workspace navigation. Title/summary/alt remain localized through existing catalog metadata. The supplied HTML itself stays in its original language and depends on the original Three.js CDN. Publishing the original does not imply a compiled TIA project or validated robot kinematics.

HTML SHA256: e8abcef8e8197da333d1b90e944fb7337c9887c9fc5b00c28a258477d4b5e6d2 .

The reference ZIP and PNG master remain in the supplied handoff package. PLC nominal V1.9, simulator motion and Watch Table are unchanged. No commit, push or deployment is part of this change.
