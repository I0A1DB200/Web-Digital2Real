# Capability Definition Standard

| Field | Value |
|---|---|
| Document ID | D2R-002 |
| Version | 1.0.0 |
| Status | Approved baseline |
| Owner | Digital2Real Architecture |
| Scope | Required content and lifecycle of an Industrial Capability specification |

## Purpose

This standard defines the minimum structure required before an Industrial Capability can govern knowledge, experiences, assessment, and certification.

## Normative language

**MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative.

## Definitions

The definitions of **Industrial Capability**, **Competency**, and **Validated** are owned by [D2R-001](../01-architecture/D2R-001-industrial-capability-framework.md). A **Capability Specification** is the canonical governed definition of one ICF capability.

## Required structure

Every Capability Specification MUST contain:

1. **Metadata:** ID, slug, title, version, status, owner, phase, and review date.
2. **Professional purpose:** the outcome the capability enables in industrial work.
3. **Professional context:** systems, responsibilities, operating conditions, and boundaries in which it applies.
4. **Competencies:** observable abilities, each with a stable identifier and unambiguous outcome.
5. **Prerequisites:** capabilities or knowledge genuinely required before assessment.
6. **Required knowledge:** references to Notebook topics or explicit documented gaps; complete theory MUST NOT be copied.
7. **Learning Experiences:** mapped experiences that introduce applied competency.
8. **Practice Experiences:** mapped experiences that develop independent judgement.
9. **Assessment:** the approved Assessment Experience and assessment specification.
10. **Validation criteria:** required evidence, critical criteria, outcome rules, and traceability.
11. **Certificate:** the claim permitted after validation and its required references.
12. **Lifecycle:** status, approval, version, deprecation, and supersession history.

## Rules

- One capability MUST have one canonical specification directory.
- Competencies MUST be assessable and MUST NOT be lists of topics, tools, or experience completions.
- Professional purpose MUST describe demonstrated industrial ability, not course consumption.
- Required knowledge SHOULD be vendor-neutral. Vendor-specific knowledge MAY be referenced when essential to a bounded competency.
- Each mapped Experience MUST declare its class: Learning, Practice, or Assessment.
- Each Experience SHOULD map to the smallest coherent set of competencies.
- An Assessment MUST cover all critical competencies claimed by the capability.
- Missing Notebook content MAY be recorded as a requirement but MUST NOT be silently invented in a capability specification.
- A capability MUST NOT move beyond `planned` until its complete specification and owner are approved.

## Provisional manifest

The `capability.yaml` files in `docs/04-capabilities/` are provisional machine-readable indexes. They have no approved schema in this version. Consumers MUST NOT treat their shape as a stable runtime API.

The provisional fields are limited to identity, planning status, phase, portfolio target, assessment requirement, prerequisites, competencies, Notebook entries, and Experience references. A future schema requires a separate architecture decision.

## Lifecycle

Recommended lifecycle labels are:

- `planned`: identity and planning boundary exist;
- `draft`: full specification is being authored;
- `technical_review`: domain and assessment review are active;
- `approved`: specification governs new work;
- `deprecated`: retained for compatibility but not for new work;
- `superseded`: replaced by an identified version or capability.

Only `planned` is assigned by this baseline. Moving to another state MUST follow D2R-008.

## Interfaces

- Capability taxonomy: [D2R-001](../01-architecture/D2R-001-industrial-capability-framework.md)
- Experience design: [D2R-003](D2R-003-experience-design-standard.md)
- Assessment: [D2R-004](D2R-004-assessment-standard.md)
- Certification: [D2R-006](D2R-006-certification-standard.md)
- Canonical template: [`capability-specification-template.md`](../templates/capability-specification-template.md)

## Open decisions

- Stable schema and validation process for `capability.yaml`: `TBD — Requires architecture decision`.
- Capability review cadence and expiry: `TBD — Requires architecture decision`.

## Version history

| Version | Change |
|---|---|
| 1.0.0 | Defined the minimum canonical Capability Specification. |
