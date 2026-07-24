# Certification Standard

| Field | Value |
|---|---|
| Document ID | D2R-006 |
| Version | 1.0.0 |
| Status | Approved baseline |
| Owner | Digital2Real Architecture |
| Scope | Claims and traceability required for a Digital2Real capability certificate |

## Purpose

This standard defines what a Digital2Real certificate may represent. It does not implement credential issuance, storage, verification, revocation, or public display.

## Normative language

**MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative.

## Definitions

- **Certificate:** a versioned assertion that a named subject demonstrated an Industrial Capability through an approved assessment.
- **Verification ID:** a unique identifier used to resolve and verify the certificate record.
- **Evidence reference:** an immutable reference to the assessment result supporting the claim.
- **Supersession:** replacement of a certificate or claim by a newer identified record without erasing history.

## What is certified

A certificate MUST represent one identified, versioned Industrial Capability demonstrated through a validated Assessment Experience. The claim MUST be limited to the capability and conditions supported by the assessment evidence.

## What is not certified

A certificate MUST NOT represent:

- completion of a Learning or Practice Experience;
- a count of Experiences;
- attendance, participation, or time spent;
- general employability;
- capabilities not mapped to the supporting assessment;
- permanent competence when no validity policy exists;
- vendor authorization or a third-party qualification.

## Minimum certificate fields

A certificate MUST contain or resolve:

- certificate title;
- Verification ID;
- subject reference;
- capability ID, title, and version;
- certificate format version;
- issuance timestamp;
- issuer identity;
- assessment ID and version;
- assessment outcome reference;
- evidence reference;
- verification status;
- superseded-by reference when applicable.

Privacy-preserving subject representation and the format of public evidence are `TBD — Requires architecture decision`.

## Rules

- A certificate MUST NOT be issued without a `validated` assessment outcome.
- Certificate data MUST be immutable after issuance. Corrections MUST create a replacement record with traceable supersession.
- Verification MUST confirm identity of the credential, capability and assessment versions, evidence reference, and current credential status.
- Certificate presentation MUST remain separate from the Professional Profile.
- A profile MAY reference certificates; it MUST NOT become the certificate authority.
- The Experience Engine MUST NOT issue certificates.
- Revocation, expiry, renewal, and supersession policy MUST NOT be implemented until approved.

## Current unresolved lifecycle

The revocation or supersession model, verification service, signing mechanism, validity period, renewal policy, and issuer authority are:

`TBD — Requires architecture decision`

Until resolved, this document defines the claim contract only and does not authorize issuance.

## Interfaces

- Capability authority: [D2R-001](../01-architecture/D2R-001-industrial-capability-framework.md)
- Assessment evidence: [D2R-004](D2R-004-assessment-standard.md)
- Profile separation: [D2R-005](D2R-005-professional-profile-standard.md)
- Governance and versioning: [D2R-008](../03-governance/D2R-008-architecture-governance.md)

## Open decisions

All items under Current unresolved lifecycle require an architecture decision and Product Owner approval.

## Version history

| Version | Change |
|---|---|
| 1.0.0 | Defined the permitted capability claim and minimum certificate traceability. |
