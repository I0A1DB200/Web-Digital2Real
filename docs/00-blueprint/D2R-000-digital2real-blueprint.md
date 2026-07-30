# Digital2Real Blueprint

| Field | Value |
|---|---|
| Document ID | D2R-000 |
| Version | 1.0.0 |
| Status | Approved baseline |
| Owner | Digital2Real Architecture |
| Scope | Platform identity, products, operating model, and authoritative boundaries |

## Purpose

This document defines what Digital2Real is and establishes the platform-level context for its architecture and standards. It does not define implementation details, experience runtime behavior, or individual capabilities.

## Normative language

The terms **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative.

## Identity and mission

Digital2Real is an engineering-first educational platform for developing demonstrable industrial automation capabilities. It converts reusable technical knowledge and realistic industrial problems into structured learning, practice, assessment, and evidence of professional capability.

Digital2Real addresses the gap between knowing technical facts and applying them safely under realistic diagnostic conditions. It MUST prioritize engineering correctness, evidence-based reasoning, and maintainable knowledge over content volume or promotional claims.

## Definitions

- **Platform:** the governed system that connects Digital2Real products, standards, capability definitions, and shared technical contracts.
- **Notebook:** the product that owns structured, reusable technical knowledge.
- **Experience Lab:** the product that owns learner access to industrial learning, practice, and assessment experiences.
- **Industrial Capability:** an integrated professional ability demonstrated through knowledge, evidence interpretation, decisions, and safe action.
- **Experience Engine:** the source of truth for experience authoring contracts, validation, normalization, and execution logic.

## Product model

Digital2Real has exactly two products:

1. **Notebook** teaches reusable concepts, methods, and technical foundations.
2. **Experience Lab** trains and validates professional reasoning through industrial scenarios.

Platform is not a third product. It is the shared governance and technical environment in which both products operate. Experience Engine is not a public product; it is the owned engine behind Experience Lab.

```text
Digital2Real Platform
├── Notebook
└── Experience Lab
    └── Experience Engine
```

Future public products MUST require an approved architecture decision that revises this blueprint. Internal engines, adapters, packaging tools, or services MUST NOT be presented as products.

## Operating model

The approved learner progression is:

```text
Notebook
→ Learning Experience
→ Practice Experience
→ Assessment Experience
→ Industrial Capability Validated
```

- Notebook knowledge SHOULD prepare the learner to reason about an industrial domain.
- Learning Experiences MUST introduce applied reasoning with appropriate guidance.
- Practice Experiences MUST strengthen independent diagnostic judgement.
- Assessment Experiences MUST evaluate capability under the conditions defined by [D2R-004](../02-standards/D2R-004-assessment-standard.md).
- Completing an Experience MUST NOT, by itself, certify a capability.

## Knowledge and experience creation

Reusable technical explanation MUST be authored once in Notebook. Applied scenarios MUST reference that knowledge without reproducing it. Experience creation MUST follow the contracts owned by Experience Engine:

```text
Industrial knowledge
→ Experience Brief
→ Experience generation or authoring
→ Validation
→ Technical review
→ Deterministic packaging
→ Experience Lab
```

`preview` MAY package validated content in `technical_review`. Production `publish` MUST accept only content whose publication state and validation state satisfy the approved publication contract.

## Documentation architecture

| Authority | Responsibility |
|---|---|
| [Constitution](../Constitution.md) | Permanent project principles |
| D2R-000 | Platform identity and product boundaries |
| [D2R-001](../01-architecture/D2R-001-industrial-capability-framework.md) | Industrial Capability Framework |
| D2R-002–D2R-007 | Definition, experience, assessment, profile, certification, and analytics standards |
| [D2R-008](../03-governance/D2R-008-architecture-governance.md) | Architecture evolution and decision control |
| `experience-engine/` | Experience authoring, validation, integration, and runtime contracts |
| Approved RFCs and ADRs | Bounded architectural decisions and their history |

A lower-level document MUST NOT redefine a concept owned by a higher-level authority. It SHOULD link to the authoritative definition.

## Rules

### Non-negotiable rules

- Engineering evidence MUST precede claims of capability.
- Each responsibility MUST have one authoritative owner.
- Architecture MUST evolve from demonstrated requirements.
- Core models SHOULD remain vendor-neutral; vendor context MAY exist at explicit integration and experience boundaries.
- The UI MUST consume the Headless Player public state and MUST NOT parse authoring YAML or reproduce experience business logic.
- Published browser artifacts MUST be derived deterministically from Experience Engine sources and MUST NOT become editable authorities.
- Technical uncertainty MUST be visible and MUST NOT be converted into invented facts.

## Single sources of truth

| Information | Authority |
|---|---|
| Permanent principles | `docs/Constitution.md` |
| Platform and product boundaries | This document |
| Capability taxonomy and progression | D2R-001 |
| Capability definition requirements | D2R-002 |
| Experience design requirements | D2R-003 plus Experience Engine contracts |
| Assessment requirements | D2R-004 |
| Profile, certification, and analytics models | D2R-005–D2R-007 |
| Experience structured content | Canonical `experience.yaml` under `content/experiences/` |
| Experience runtime behavior | `experience-engine/player/` |
| Public presentation | Frontend presentation components |

## Product limits

Digital2Real does not currently define:

- an additional Academy or Assistant product;
- a universal professional qualification;
- an employment ranking;
- a social leaderboard;
- automatic certification from completion counts;
- autonomous publication without technical review;
- an approved persistence, identity, credential-revocation, or advanced analytics platform.

Undefined areas MUST be recorded as `TBD — Requires architecture decision`.

## Interfaces

- Capability architecture: [D2R-001](../01-architecture/D2R-001-industrial-capability-framework.md)
- Experience design: [D2R-003](../02-standards/D2R-003-experience-design-standard.md)
- Experience Engine: [`experience-engine/README.md`](../../experience-engine/README.md)
- Web integration: [`web-integration-contract.md`](../../experience-engine/integration/web-integration-contract.md)
- Architecture governance: [D2R-008](../03-governance/D2R-008-architecture-governance.md)

## Open decisions

- Identity, authentication, persistence, and public profile delivery: `TBD — Requires architecture decision`.
- Credential verification and revocation infrastructure: `TBD — Requires architecture decision`.

## Version history

| Version | Change |
|---|---|
| 1.0.0 | Established the two-product platform baseline and operating model. |
