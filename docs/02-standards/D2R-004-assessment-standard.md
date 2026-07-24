# Assessment Standard

| Field | Value |
|---|---|
| Document ID | D2R-004 |
| Version | 1.0.0 |
| Status | Approved baseline |
| Owner | Digital2Real Architecture |
| Scope | Conditions under which an Assessment Experience may validate an Industrial Capability |

## Purpose

This standard defines what capability validation means and the minimum integrity, evidence, and traceability requirements for Assessment Experiences. It does not approve a scoring algorithm.

## Normative language

**MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative.

## Definitions

- **Assessment Experience:** a controlled Experience designed to evaluate mapped competencies.
- **Critical criterion:** a requirement whose failure prevents a validated outcome regardless of other performance.
- **Assessment evidence:** immutable, traceable observations of learner decisions and relevant outcomes.
- **Independent performance:** action performed without prohibited guidance or prior disclosure of the assessment solution.

## Meaning of validation

A capability is validated when the learner demonstrates its critical competencies by interpreting evidence, selecting justified actions, respecting safety constraints, establishing the root cause, and verifying recovery in an approved Assessment Experience.

Validation MUST describe the assessed capability, version, evidence, criteria, outcome, and assessment version. It MUST NOT be inferred from completion counts, elapsed participation, or self-reporting.

## Rules

### Assessment rules

#### Independence and scenario

- The assessment scenario MUST be materially unseen by the learner.
- It MAY share underlying principles with Learning and Practice Experiences but MUST NOT reproduce their decision path.
- Required aids and prohibited aids MUST be declared before execution.
- Teaching hints, private fault information, and debrief content MUST NOT be available during assessment.
- Identity assurance requirements are `TBD — Requires architecture decision`.

#### Evidence and criteria

- Competencies and critical criteria MUST be approved before the Assessment Experience.
- Evidence MUST include the decisions necessary to establish the result and the safety-relevant consequences.
- Evidence MUST remain attributable to an assessment ID, version, session, and capability version.
- Critical safety, diagnosis, and functional-validation criteria MUST be explicit.
- A temporary machine restart MUST NOT by itself satisfy capability validation.
- Scoring MAY support feedback only when approved; it MUST NOT override failed critical criteria.

#### Outcome

The normative capability outcome is:

- `validated`: every critical criterion is satisfied;
- `not_validated`: one or more critical criteria are not satisfied;
- `invalid`: assessment integrity or technical validity is compromised.

More detailed grades, levels, thresholds, or weighted algorithms are `TBD — Requires architecture decision`.

#### Retries

Retries MAY be allowed, but every attempt MUST create a distinct evidence record and MUST preserve previous assessment history. Retry timing, limits, scenario equivalence, and remediation requirements are `TBD — Requires architecture decision`.

#### Integrity

- Assessment content MUST be versioned and technically reviewed.
- Changes affecting evidence, decisions, critical criteria, or outcomes MUST require a new assessment version.
- The assessment runtime MUST use the same validated Experience Engine contracts as other Experiences.
- Manual review MAY be required where deterministic evidence is insufficient; its owner and decision MUST be recorded.

## Current limits

Digital2Real has not approved:

- remote proctoring;
- identity verification;
- a weighted scoring model;
- psychometric calibration;
- cross-assessment equivalence;
- validity periods;
- automatic certification issuance;
- appeal or reassessment policy.

Each remains `TBD — Requires architecture decision`.

## Interfaces

- Capability requirements: [D2R-002](D2R-002-capability-definition-standard.md)
- Experience requirements: [D2R-003](D2R-003-experience-design-standard.md)
- Profile record: [D2R-005](D2R-005-professional-profile-standard.md)
- Certification: [D2R-006](D2R-006-certification-standard.md)
- Template: [`assessment-specification-template.md`](../templates/assessment-specification-template.md)

## Open decisions

The unresolved items listed under Current limits require architecture and Product Owner decisions before implementation.

## Version history

| Version | Change |
|---|---|
| 1.0.0 | Established capability-validation, integrity, and evidence requirements without inventing scoring. |
