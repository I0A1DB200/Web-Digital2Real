# Architecture Governance

| Field | Value |
|---|---|
| Document ID | D2R-008 |
| Version | 1.0.0 |
| Status | Approved baseline |
| Owner | Digital2Real Architecture |
| Scope | Evolution, versioning, approval, deprecation, supersession, and decision records |

## Purpose

This document defines how Digital2Real architecture and normative documentation may change. It complements the permanent [Constitution](../Constitution.md) and the operational [Development Workflow](../DEVELOPMENT_WORKFLOW.md).

## Normative language

**MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative.

## Definitions

- **Frozen:** approved for its declared version; changes require governed versioning and review.
- **Patch change:** clarification or correction that does not change normative meaning or compatibility.
- **Minor change:** backward-compatible addition or extension of normative meaning.
- **Major change:** incompatible change to responsibility, meaning, contract, identifiers, or dependency direction.
- **Deprecation:** notice that an authority remains supported temporarily but SHOULD NOT be used for new work.
- **Supersession:** replacement by an identified authoritative document or version.
- **ADR:** a permanent record of one significant architectural decision within an approved governance boundary.

## Rules

### Frozen status

A Frozen document:

- MUST have an owner, version, status, and reviewable history;
- MUST NOT be modified through incidental implementation;
- MAY receive patch corrections without reopening its approved decision;
- MUST use minor or major versioning when normative behavior changes;
- MUST retain traceable prior versions or history.

“Approved baseline” documents are governed as Frozen for version 1.0.0.

## Versioning rules

- Patch: spelling, broken links, factual corrections, or clarifications with unchanged requirements.
- Minor: additive fields, optional interfaces, or compatible rules within the same responsibility.
- Major: removed or changed requirements, new product boundaries, changed SSOT, incompatible identifiers, or changed dependency direction.

A new document version is required when normative meaning changes. A new RFC MAY be required when the change is cross-cutting or changes architecture. An ADR MUST NOT be used to bypass required RFC or Product Owner approval.

## Capability approval

A new capability MUST:

1. have a unique proposed ICF identifier and professional purpose;
2. demonstrate that it is not already owned by another capability;
3. define dependencies and competency boundaries;
4. use D2R-002;
5. receive technical and architecture review;
6. update D2R-001 through the appropriate version change;
7. be approved before Experiences claim it as an active authority.

An implementation or isolated Experience MUST NOT create a capability implicitly.

## Architecture Decision Records

An ADR MUST be created when a significant, durable implementation choice has credible alternatives, affects compatibility or ownership, or is delegated by an RFC. ADRs MUST follow the process in [`decisions/README.md`](decisions/README.md) and use the canonical template.

Historical ADRs MUST NOT be invented. Accepted decisions already recorded in RFCs or approved standards SHOULD remain linked to those sources unless a new decision is actually required.

## Deprecation and supersession

- Deprecated material MUST identify its replacement, migration condition, and support boundary where known.
- Superseded material MUST retain its history and prominently link to the replacing authority.
- A replacement MUST integrate current authoritative information before the former source is marked superseded.
- Two active documents MUST NOT own the same responsibility.
- Historical files MUST NOT be deleted without explicit authorization.

## Compatibility

Changes MUST identify affected producers, consumers, stored artifacts, links, and versions. Compatibility layers MUST have one owner and an exit condition. Derived artifacts MUST remain traceable to their canonical source.

## Single source of truth

- Every governed concept MUST have one active authority.
- Indexes and summaries MAY repeat identifiers and short descriptions but MUST link to the authority.
- Implementation documentation MUST NOT redefine platform or domain standards.
- Generated and packaged artifacts MUST NOT become editable authorities.
- Conflicts MUST be resolved explicitly through migration, deprecation, or supersession.

## Review process

1. Identify the requirement and affected authority.
2. Classify the change as patch, minor, or major.
3. Determine whether an RFC, ADR, User Story, or bounded documentation update is required.
4. List exact files and dependencies.
5. Obtain the required approval.
6. Implement the smallest coherent packages.
7. Validate links, contracts, tests, compatibility, and SSOT ownership.
8. Record status, version, migration, and remaining decisions.
9. Review before merge.

Architecture MUST NOT be changed by an isolated implementation package. Code that requires an unapproved architectural change MUST stop pending a decision.

## Interfaces

- Permanent principles: [Constitution](../Constitution.md)
- Engineering workflow: [Development Workflow](../DEVELOPMENT_WORKFLOW.md)
- Platform blueprint: [D2R-000](../00-blueprint/D2R-000-digital2real-blueprint.md)
- Capability framework: [D2R-001](../01-architecture/D2R-001-industrial-capability-framework.md)
- ADR process: [`decisions/README.md`](decisions/README.md)
- ADR template: [`architecture-decision-record-template.md`](../templates/architecture-decision-record-template.md)

## Open decisions

- Formal approval roles and scheduled review cadence for domain standards: `TBD — Requires architecture decision`.

## Version history

| Version | Change |
|---|---|
| 1.0.0 | Established versioning, capability approval, ADR, compatibility, and supersession governance. |
