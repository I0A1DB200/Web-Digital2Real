# Learning Analytics Model

| Field | Value |
|---|---|
| Document ID | D2R-007 |
| Version | 1.0.0 |
| Status | Approved conceptual baseline |
| Owner | Digital2Real Architecture |
| Scope | Privacy-aware events and signals that may support learning recommendations |

## Purpose

This document defines a conceptual analytics boundary for understanding learning and competency development. It does not authorize collection, persistence, profiling algorithms, tracking infrastructure, or social comparison.

## Normative language

**MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative.

## Definitions

- **Learning event:** a versioned record of a meaningful learner interaction or outcome.
- **Competency signal:** an interpretation of relevant evidence that may inform learning support; it is not capability validation.
- **Recommendation:** an explainable suggestion for knowledge, practice, or assessment preparation.
- **Evidence inspected:** evidence explicitly made available and reviewed through a supported interaction.
- **Evidence ignored:** available evidence not inspected before a decision, only where that distinction can be measured reliably.

## Rules

Analytics MUST remain traceable, purpose-limited, and subordinate to the authoritative Experience, assessment, profile, and capability records. It MUST NOT create capability or certification claims.

## Relevant events

An approved implementation MAY record:

- Experience started, continued, completed, blocked, or reset;
- stage entered;
- decision selected;
- evidence revealed;
- evidence inspected;
- consequence received;
- debrief reached;
- assessment started, completed, invalidated, or retried;
- Notebook reference followed.

Events MUST identify their type, timestamp or deterministic session time, Experience ID and version, session reference, capability and competency references where applicable, and consent context.

## Decision and evidence signals

Analytics MAY derive explainable signals from:

- decisions and their declared classification;
- evidence inspected before a decision;
- available evidence ignored before a decision;
- consequences reached;
- repeated hypothesis or action patterns;
- safety-critical behavior;
- assessment criteria and outcomes.

Signals MUST retain traceability to source events. They MUST NOT overwrite Player state, assessment evidence, or capability status. Absence of an interaction MUST NOT be interpreted as lack of knowledge without an approved rule and adequate context.

## Competency and recommendations

- Competency signals MAY identify areas for additional Notebook study or Practice Experiences.
- A signal MUST NOT validate a capability.
- Recommendations SHOULD state the supporting signal and the intended learning purpose.
- Recommendations MUST NOT expose private fault models or assessment solutions.
- Advanced inference, personalization, prediction, AI models, and weighting algorithms are `TBD — Requires architecture decision`.

## Privacy and integrity

- Collection MUST be purpose-limited and data-minimized.
- Private event histories MUST NOT be public by default.
- Analytics MUST NOT be used to create a public or social ranking.
- Analytics MUST NOT rank employability or compare learners without an independently approved purpose, consent model, and fairness review.
- Retention, deletion, export, consent, pseudonymization, and access control are `TBD — Requires architecture decision`.
- Raw analytics MUST NOT become an alternative source for assessment outcomes or certificates.

## Conceptual event flow

```text
Headless Player public/session events
→ governed event capture
→ privacy controls
→ traceable competency signals
→ explainable recommendations
```

No component in this flow is approved for implementation by this document.

## Interfaces

- Player boundary: [`experience-engine/player/README.md`](../../experience-engine/player/README.md)
- Assessment authority: [D2R-004](D2R-004-assessment-standard.md)
- Professional Profile: [D2R-005](D2R-005-professional-profile-standard.md)
- Governance: [D2R-008](../03-governance/D2R-008-architecture-governance.md)

## Open decisions

- Event schema and transport: `TBD — Requires architecture decision`.
- Consent, retention, identity, storage, algorithms, and review process: `TBD — Requires architecture decision`.

## Version history

| Version | Change |
|---|---|
| 1.0.0 | Established a conceptual, traceable, privacy-aware analytics boundary. |
