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

Technical-review status includes this package in preview only. Publish mode continues to require published status and a passed technical validation. The generic catalog navigator displays Experiences with an authored public.catalog_card alongside existing ENV cards; no fake ENV or membership change is required.

The card opens the existing openExperience("EXP-UR-COBOT-001") boundary, which loads localized generated artifacts. Keyboard activation and focus use the existing native button and shared card CSS. The image uses centered object-fit cover in the existing 16:9 media container with intrinsic width/height. No simulator or source archive is exposed.

Image metadata lives only in experience.yaml public.catalog_card; the title and summary use existing localized Experience fields. Packaging validates the image location, dimensions and ES/EN alt text, then creates a derived cards/EXP-UR-COBOT-001.webp. Existing Experiences without this optional field are unchanged. The shared extension is authorized by the user's request to implement the standalone card.

The reference ZIP and PNG master remain in the supplied handoff package. PLC nominal V1.9, simulator motion and Watch Table are unchanged. No commit, push or deployment is part of this change.
