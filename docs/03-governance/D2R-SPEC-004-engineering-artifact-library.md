# Engineering Artifact Library

| Field | Value |
|---|---|
| Document ID | D2R-SPEC-004 |
| Version | 1.0.0 |
| Status | Approved baseline |
| Owner | Digital2Real Architecture |
| Scope | Governed representation categories requested by Experience Blueprints |

## Purpose

The Engineering Artifact Library defines canonical ways to represent industrial information for learning. It governs representation categories and template intent, not concrete content, media-generation technology, visual assets, or Frontend components.

Blueprints request artifacts through [D2R-SPEC-003](D2R-SPEC-003-blueprint-schema.md). Each artifact obtains its information from Providers defined by [D2R-SPEC-002](D2R-SPEC-002-provider-library.md) and serves a role in the [Experience Information Model](D2R-SPEC-001-experience-information-model.md).

Artifact production, review, and publication handoff follow [D2R-FACTORY-001](D2R-FACTORY-001-experience-production-workflow.md).

## Artifact Philosophy

- An artifact exists because the learner must observe, compare, or verify something.
- Representation must preserve the meaning and uncertainty of its Provider information.
- Artifacts never invent facts, diagnose on the learner's behalf, or expose private authority.
- Reusable templates separate visual consistency from Experience-specific content.
- Masters and web derivatives retain the ownership defined by D2R-STD-001.
- Accessibility and localization are design inputs, not post-production corrections.

## Relationship between Providers and Artifacts

A Provider answers “where does this information come from?” An artifact template answers “how is this approved information represented?”

```text
Blueprint question
→ Provider request
→ Verified information
→ Artifact template
→ Approved master
→ Web derivative
→ Learner-visible Evidence
```

One artifact may contain facts from multiple Providers only when each fact retains one declared authority. The artifact must not become a second source of truth.

## Artifact Categories

| Template ID | Category | Typical Provider authorities |
|---|---|---|
| `ART-TPL-MACHINE-OVERVIEW` | Machine Overview | Field, HMI |
| `ART-TPL-EQUIPMENT-CLOSEUP` | Equipment Close-up | Field |
| `ART-TPL-MECHANICAL-DETAIL` | Mechanical Detail | Field, Manual |
| `ART-TPL-ELECTRICAL-DRAWING` | Electrical Drawing | Electrical, Manual |
| `ART-TPL-WATCH-TABLE` | Watch Table | PLC |
| `ART-TPL-PLC-TAGS` | PLC Tags | PLC |
| `ART-TPL-DB-MONITORING` | DB Monitoring | Data Block, PLC |
| `ART-TPL-HMI-SCREEN` | HMI Screen | HMI |
| `ART-TPL-ALARM-SCREEN` | Alarm Screen | Alarm, HMI, SCADA |
| `ART-TPL-TREND` | Trend | Trend, SCADA |
| `ART-TPL-IOLINK-DIAGNOSTICS` | IO-Link Diagnostics | IO-Link |
| `ART-TPL-NETWORK-TOPOLOGY` | Network Topology | Network, Manual |
| `ART-TPL-RECOVERY-PHOTO` | Recovery Photo | Field |

## Machine Overview

`ART-TPL-MACHINE-OVERVIEW` establishes spatial and operational context. It shows only equipment relationships, process direction, relevant state, and safety boundary needed for the current learning purpose.

## Equipment Close-up

`ART-TPL-EQUIPMENT-CLOSEUP` presents an identifiable component and its observable state at sufficient scale for inspection. Framing must preserve orientation and relevant connections without visually declaring the diagnosis.

## Mechanical Detail

`ART-TPL-MECHANICAL-DETAIL` represents alignment, mounting, wear, obstruction, movement, geometry, or another mechanically relevant condition. Scale, direction, and reference points must be explicit where interpretation depends on them.

## Electrical Drawing

`ART-TPL-ELECTRICAL-DRAWING` presents the bounded electrical path needed for an investigation. Symbols, identifiers, terminal references, supply direction, and measurement points must be internally consistent and technically reviewed.

## Watch Table

`ART-TPL-WATCH-TABLE` represents a defined set of observed PLC values at a stated operating moment. Signal names, types, values, and interpretation boundaries must be legible and must agree with other representations.

## PLC Tags

`ART-TPL-PLC-TAGS` represents the identity, type, direction, and current state of relevant controller tags. It must not imply that a software command proves field action.

## DB Monitoring

`ART-TPL-DB-MONITORING` represents approved structured data and its current values. Grouping and hierarchy must preserve the source Data Block meaning and distinguish command, state, calculation, and diagnostic data where relevant.

## HMI Screen

`ART-TPL-HMI-SCREEN` represents the bounded operator view required by the investigation. It must identify relevant state without adding controls, alarms, or values absent from the approved case.

## Alarm Screen

`ART-TPL-ALARM-SCREEN` represents alarm identity, source, status, time, and approved contextual fields. Alarm text must be verified or explicitly generic and must not directly reveal Root Cause unless disclosure is approved.

## Trend

`ART-TPL-TREND` represents time-correlated values or events. Axes, units, time range, signal identity, scale, and relevant event markers must be explicit and non-misleading.

## IO-Link Diagnostics

`ART-TPL-IOLINK-DIAGNOSTICS` represents master, port, device, communication, process-data, or event state within an approved IO-Link context. It must distinguish those states and avoid invented vendor-specific codes.

## Network Topology

`ART-TPL-NETWORK-TOPOLOGY` represents relevant nodes, links, identities, boundaries, and communication state. It must distinguish physical connection from configured and application-level communication.

## Recovery Photo

`ART-TPL-RECOVERY-PHOTO` represents the verified physical condition after approved correction. It must make the relevant change observable without implying that the image alone proves complete functional or safety validation.

## Artifact Templates

An Artifact Template defines a reusable representation responsibility, required parameter classes, information hierarchy, accessibility expectations, and validation criteria. It does not contain an Experience title, equipment value, fault, answer, decision, or media file.

A Blueprint may request one of the canonical template IDs. A new template category requires evidence that no existing category can represent the information without ambiguity; it must not be created inside an Experience package.

## Template Parameters

Every artifact request identifies:

- artifact ID and template ID;
- Provider request IDs supplying its information;
- educational purpose and reveal point;
- subject, state, viewpoint, scope, and time where applicable;
- labels, values, units, directions, and equipment identities;
- public or private visibility;
- required locales and text strategy;
- master format and intended web derivative;
- accessibility description;
- technical validation source;
- production and review status.

Missing parameters remain production blockers. Template generation must not infer technical values or Root Cause.

## Visual Consistency Rules

- Artifacts within one Experience must use consistent equipment identities, signals, directions, states, and terminology.
- Visual hierarchy must prioritize Evidence, not decoration.
- Color must not be the sole carrier of state or safety meaning.
- Text must be legible at the intended presentation size and localizable where learner-facing.
- Perspective and spatial direction must remain consistent across related views.
- Simulated interfaces must be clearly controlled representations and must not invent vendor branding or diagnostics.
- Recovery representations must visibly agree with the approved corrected condition.
- Premium quality must not reduce technical fidelity.

## Naming Convention

Artifact instances use:

```text
ART-<EXPERIENCE-NUMBER>-<SEQUENCE>
```

Example shape: `ART-EE0009-001`.

Names are stable Blueprint identities, not filenames. Filenames are declared separately in the artifact request, remain package-relative, and follow D2R-STD-001. Template IDs use the `ART-TPL-<CATEGORY>` identifiers defined in this document.

## Validation Rules

- Every artifact instance must reference one canonical template ID and at least one Provider request.
- Every displayed fact must trace to exactly one Provider authority.
- Artifact purpose and reveal point must align with the Blueprint graphs.
- Public artifacts must not contain private Root Cause, rationale, scoring, or future Evidence.
- Signals, directions, values, units, equipment names, and states must agree across all artifacts.
- Required accessibility and localization information must be complete.
- Masters must be genuine approved sources and must not be reconstructed from derivatives.
- Web assets must be derived, referenced, and packaged under D2R-STD-001.
- Unverified vendor details, unreadable labels, orphan files, and unused artifacts fail review.
- Template support gaps must remain explicit and must not trigger Experience-specific architecture.
