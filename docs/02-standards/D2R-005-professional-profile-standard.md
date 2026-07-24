# Professional Profile Standard

| Field | Value |
|---|---|
| Document ID | D2R-005 |
| Version | 1.0.0 |
| Status | Approved baseline |
| Owner | Digital2Real Architecture |
| Scope | Representation of professional capability and assessment history |

## Purpose

This standard defines the conceptual Professional Profile. It does not authorize persistence, identity management, public profiles, or a user interface.

## Normative language

**MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative.

## Definitions

- **Professional Profile:** a learner-controlled representation of capability status and its traceable evidence.
- **Capability record:** the status of one versioned ICF capability for one learner.
- **Evidence history:** references to relevant learning, practice, and assessment records.
- **Assessment history:** immutable records of assessment attempts and outcomes.
- **Recommendation:** a non-certifying suggestion derived from declared evidence and competency gaps.

## Capability statuses

A profile MAY represent:

- `not_started`: no recorded activity;
- `developing`: relevant learning or practice evidence exists;
- `assessment_ready`: readiness has been established by an approved rule;
- `validated`: an approved assessment produced a validated outcome;
- `expired`: reserved for a future approved validity policy;
- `superseded`: the referenced capability version has been replaced.

Only `validated` represents demonstrated capability. `assessment_ready`, expiry, and automatic status transitions require approved implementation rules before use.

Formal proficiency levels are not approved. They MUST be recorded as `TBD — Requires architecture decision` and MUST NOT be inferred from Experience difficulty or counts.

## Rules

- Every capability record MUST reference a capability ID and version.
- A validated record MUST reference the assessment result that supports it.
- Evidence and assessment histories MUST be append-only from the profile consumer's perspective; corrections MUST remain auditable.
- Learning and Practice Experience completion MAY appear as supporting history but MUST NOT be the primary capability indicator.
- The number of completed Experiences MUST NOT be presented as professional capability.
- Recommendations MUST distinguish missing knowledge, missing practice, and unmet assessment criteria.
- A recommendation MUST NOT change capability status or certify a learner.
- The profile MUST NOT reinterpret Experience Engine decisions, evidence, or results.

## Public and private data

Private by default:

- decision and evidence history;
- failed and invalid assessment attempts;
- detailed feedback;
- learning recommendations;
- session timing and behavior;
- identity and account data.

A public representation MAY expose a learner-approved subset of validated capabilities and certificate references. Public disclosure, consent, retention, deletion, and access control are `TBD — Requires architecture decision`.

## Minimum conceptual record

A capability record SHOULD include:

- learner reference;
- capability ID and version;
- status;
- status timestamp;
- supporting assessment references;
- supporting evidence references;
- certificate references, when issued;
- supersession information;
- visibility preference.

This is a conceptual model, not an approved data schema.

## Interfaces

- Capability authority: [D2R-001](../01-architecture/D2R-001-industrial-capability-framework.md)
- Assessment outcomes: [D2R-004](D2R-004-assessment-standard.md)
- Certificates: [D2R-006](D2R-006-certification-standard.md)
- Analytics and recommendations: [D2R-007](D2R-007-learning-analytics-model.md)

## Open decisions

- Identity, storage, privacy controls, retention, and portability: `TBD — Requires architecture decision`.
- Proficiency levels and readiness rules: `TBD — Requires architecture decision`.

## Version history

| Version | Change |
|---|---|
| 1.0.0 | Defined the conceptual profile boundary and evidence-based capability status rules. |
