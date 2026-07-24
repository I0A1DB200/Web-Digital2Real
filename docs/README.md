# Digital2Real Documentation

This directory contains current project documentation and the governed architecture, standards, and capability catalog.

## Governed structure

| Directory | Responsibility |
|---|---|
| [`00-blueprint/`](00-blueprint/README.md) | Platform vision, products, identity, and operating model |
| [`01-architecture/`](01-architecture/README.md) | Stable cross-product architecture and the ICF source of truth |
| [`02-standards/`](02-standards/README.md) | Mandatory definition and assessment standards |
| [`03-governance/`](03-governance/README.md) | Evolution, approval, versioning, and architecture decisions |
| [`04-capabilities/`](04-capabilities/README.md) | Concrete Industrial Capability specifications |
| [`templates/`](templates/README.md) | Canonical document templates |

## Foundational baseline

| ID | Document | Authority |
|---|---|---|
| D2R-000 | [Digital2Real Blueprint](00-blueprint/D2R-000-digital2real-blueprint.md) | Platform identity and two-product boundary |
| D2R-001 | [Industrial Capability Framework](01-architecture/D2R-001-industrial-capability-framework.md) | Capability taxonomy and progression |
| D2R-002 | [Capability Definition Standard](02-standards/D2R-002-capability-definition-standard.md) | Capability specification |
| D2R-003 | [Experience Design Standard](02-standards/D2R-003-experience-design-standard.md) | Experience classes and design boundary |
| D2R-004 | [Assessment Standard](02-standards/D2R-004-assessment-standard.md) | Capability validation |
| D2R-005 | [Professional Profile Standard](02-standards/D2R-005-professional-profile-standard.md) | Capability and evidence representation |
| D2R-006 | [Certification Standard](02-standards/D2R-006-certification-standard.md) | Certificate claims |
| D2R-007 | [Learning Analytics Model](02-standards/D2R-007-learning-analytics-model.md) | Analytics boundary |
| D2R-008 | [Architecture Governance](03-governance/D2R-008-architecture-governance.md) | Evolution and decision control |

## Permanent and operational authorities

- [Constitution](Constitution.md) — immutable principles.
- [Development Workflow](DEVELOPMENT_WORKFLOW.md) — official engineering lifecycle.
- [Project Status](PROJECT_STATUS.md) — concise live status.
- [Repository Architecture RFC](RFC-001_RepositoryArchitecture.md) — approved repository audit and migration decision.
- [Architecture Review MVP](ARCHITECTURE_REVIEW_MVP.md) — runtime implementation review.
- [Specifications](specifications/) — approved technical runtime models.
- [Validation baseline](VALIDATION_BASELINE.md) — repository validation commands and current quality limits.
- [Workflows](workflows/README.md) — operational authoring and publishing processes.

## Product and engine sources

- Notebook content is owned by `Frontend/data/notebook.js` under the current repository architecture.
- Experience Engine documentation and canonical Experiences are owned by [`experience-engine/`](../experience-engine/README.md).
- The Headless Player contract is owned by [`experience-engine/player/`](../experience-engine/player/README.md).
- Generated frontend artifacts are derived outputs and are not documentation authorities.

## Legacy and historical documents

Earlier numbered documents, RFCs, specifications, implementation reports, and changelogs remain available for history and their bounded responsibilities. A `Superseded by` header identifies documents whose active responsibility moved into this baseline. Historical statements MUST NOT override a current canonical document.
