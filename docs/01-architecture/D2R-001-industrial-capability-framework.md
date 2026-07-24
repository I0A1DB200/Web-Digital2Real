# Industrial Capability Framework

| Field | Value |
|---|---|
| Document ID | D2R-001 |
| Version | 1.0.0 |
| Status | Approved baseline |
| Owner | Digital2Real Architecture |
| Scope | Capability taxonomy, progression, traceability, and validation relationship |

## Purpose

The Industrial Capability Framework (ICF) defines the professional capability units around which Digital2Real knowledge, experiences, assessments, and credentials are organized.

## Normative language

**MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative.

## Definitions

- **Industrial Capability:** the integrated ability to apply knowledge, interpret evidence, make justified decisions, act safely, and verify outcomes in a professional industrial context.
- **Competency:** a bounded, observable ability that contributes to an Industrial Capability.
- **Learning Experience:** a guided application of knowledge.
- **Practice Experience:** a scenario that develops increasingly independent judgement.
- **Assessment Experience:** a controlled, evidence-producing evaluation of capability.
- **Validated:** supported by an assessment result that satisfies D2R-004; it does not mean permanently certified.

## Framework

ICF v1 contains exactly eleven capabilities:

| ID | Capability | Phase |
|---|---|---:|
| ICF-01 | PLC Diagnostics | 1 |
| ICF-02 | Industrial I/O | 1 |
| ICF-03 | Motion Control | 1 |
| ICF-04 | Industrial Communications | 2 |
| ICF-05 | Functional Safety | 2 |
| ICF-06 | Electrical Troubleshooting | 2 |
| ICF-07 | Pneumatic Systems | 3 |
| ICF-08 | Hydraulic Systems | 3 |
| ICF-09 | HMI & SCADA Diagnostics | 3 |
| ICF-10 | PLC Architecture | 4 |
| ICF-11 | Advanced Industrial Troubleshooting | 4 |

The phase number defines implementation order, not individual learner rank. Capability dependencies MUST be declared in each capability specification rather than inferred solely from phase.

## Rules

### Capability definition

- Every capability MUST have a stable ICF identifier and one canonical specification under [`docs/04-capabilities/`](../04-capabilities/README.md).
- A capability MUST be decomposed into observable competencies before its experience portfolio is approved.
- Vendor-specific experiences MAY contribute evidence, but the capability definition SHOULD remain vendor-neutral.
- Experience, Notebook, profile, and certificate records MUST reference the capability identifier; they MUST NOT redefine the capability.

### Progression

The target portfolio for each capability is:

| Experience class | Planning target |
|---|---:|
| Foundation Learning Experiences | 5 |
| Intermediate Practice Experiences | 5 |
| Advanced Practice Experiences | 4 |
| Assessment Experiences | 1 |
| Total | 15 |

Fifteen Experiences is a planning baseline. It MUST NOT override technical quality, competency coverage, assessment sufficiency, or safety. A capability MAY require fewer or more Experiences when the approved specification provides evidence-based justification.

Progression SHOULD move from guided knowledge application toward independent evidence selection and decision-making. Difficulty labels MUST NOT substitute for explicit competencies, prerequisites, or assessment criteria.

### Traceability

The minimum traceability chain is:

```text
Industrial Capability
→ Competency
→ Required Notebook knowledge
→ Learning and Practice Experiences
→ Assessment criteria
→ Assessment evidence
→ Capability status
→ Certificate reference, when issued
```

Every Assessment Experience MUST trace its critical criteria to competencies in one approved capability. Evidence from an Experience MUST remain traceable to the experience ID and version.

### Validation and certification

- A capability becomes validated only through an Assessment Experience conforming to [D2R-004](../02-standards/D2R-004-assessment-standard.md).
- Completion of Learning or Practice Experiences MUST NOT validate or certify a capability.
- Completion counts MUST NOT be the primary indicator of professional capability.
- A certificate MAY represent a validated capability only under [D2R-006](../02-standards/D2R-006-certification-standard.md).

## Product relationships

- Notebook MUST own reusable knowledge mapped to competencies.
- Experience Lab MUST deliver Learning, Practice, and Assessment Experiences.
- Experience Engine MUST own structured experience logic and runtime behavior.
- Professional Profile MAY summarize capability and evidence history but MUST NOT become an alternative capability authority.

## Capability lifecycle

Capability lifecycle states and required approvals are defined by [D2R-002](../02-standards/D2R-002-capability-definition-standard.md) and governed by [D2R-008](../03-governance/D2R-008-architecture-governance.md). Capability manifests created for this baseline are provisional indexes, not complete specifications.

## Interfaces

- Platform boundary: [D2R-000](../00-blueprint/D2R-000-digital2real-blueprint.md)
- Capability definition: [D2R-002](../02-standards/D2R-002-capability-definition-standard.md)
- Experience design: [D2R-003](../02-standards/D2R-003-experience-design-standard.md)
- Assessment: [D2R-004](../02-standards/D2R-004-assessment-standard.md)
- Capability catalog: [`docs/04-capabilities/`](../04-capabilities/README.md)

## Open decisions

- Formal capability proficiency levels: `TBD — Requires architecture decision`.
- Cross-capability credit and expiry rules: `TBD — Requires architecture decision`.

## Version history

| Version | Change |
|---|---|
| 1.0.0 | Established ICF v1, its eleven capabilities, phases, and planning baseline. |
