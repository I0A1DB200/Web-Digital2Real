# Experience Design Standard

| Field | Value |
|---|---|
| Document ID | D2R-003 |
| Version | 1.0.0 |
| Status | Approved baseline |
| Owner | Digital2Real Architecture |
| Scope | Educational and architectural requirements for Digital2Real Experiences |

## Purpose

This standard defines the types and design obligations of Experiences. Experience Engine retains authority over the detailed structured schema, validation rules, authoring workflow, integration contract, and Player behavior.

## Normative language

**MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative.

## Definitions

- **Learning Experience:** a guided industrial scenario that connects reusable knowledge to applied reasoning.
- **Practice Experience:** a scenario that develops independent evidence interpretation and decision-making.
- **Assessment Experience:** an independently governed scenario that produces evidence for capability validation.
- **Experience Brief:** the minimum manually authored description of the technical problem; it is not an Experience.
- **Stage:** a bounded situation in the diagnostic progression.
- **Evidence:** information available to support or challenge a diagnosis.
- **Decision:** a learner action selected within a stage.
- **Consequence:** the declared result of a selected decision.
- **Debrief:** terminal explanation of reasoning, evidence, outcomes, and transferable lessons.

## Rules

### Rules common to every Experience

- Every Experience MUST map to at least one competency in an approved or explicitly provisional capability.
- The fault model MUST be defined before the learner narrative.
- Evidence MUST be revealed through declared rules; future evidence MUST NOT be exposed early.
- Decisions MUST represent credible engineering actions and MUST declare consequences.
- Unsafe actions MUST NOT receive positive safety outcomes.
- Completion MUST distinguish temporary restart from diagnosis, recovery, and functional validation.
- The debrief MUST explain reasoning and MUST NOT introduce facts absent from the structured model.
- Technical uncertainty MUST be recorded and MUST NOT be replaced by invented vendor facts.
- Notebook knowledge MUST be referenced rather than duplicated.

## Experience classes

### Learning Experience

A Learning Experience SHOULD provide guidance, constrained choices, and explicit feedback. It MUST still require the learner to connect evidence with an engineering decision.

### Practice Experience

A Practice Experience SHOULD reduce guidance and increase ambiguity appropriate to the mapped competencies. It MUST preserve technically credible alternatives and consequences.

### Assessment Experience

An Assessment Experience MUST satisfy [D2R-004](D2R-004-assessment-standard.md). It MUST NOT expose teaching guidance, the known practice path, hidden scoring, or private diagnostic information during evaluation.

## Required design elements

- **Brief:** problem, root cause, resolution, learning goals, constraints, and references only.
- **Stages:** stable identifiers, context, available evidence, allowed decisions, transitions, and terminal behavior.
- **Evidence:** source, content, reliability where applicable, and reveal conditions.
- **Decisions:** stable identifiers, actions, rationale, consequences, safety effects, and transitions.
- **Debrief:** causal chain, evidence hierarchy, decision review, safe recovery, verification, prevention, and Notebook references.
- **Difficulty:** a declared design property supported by scenario complexity and independence; not a substitute for competency mapping.
- **Industrial realism:** plausible equipment behavior, operational constraints, safety context, and consequences.

## Functional images

Images MAY provide observable evidence, machine context, schematics, or diagnostic records. Functional images MUST be accurate, legible, traceable, and available only when the related evidence is revealed. Decorative assets MUST NOT imply evidence or state that is absent from the model.

## Experience Engine interface

The following dependency direction is mandatory:

```text
experience.yaml
→ YAML Adapter
→ Normalized Experience Model
→ Headless Player
→ Public Player State
→ Experience Workspace UI
```

- `experience.yaml` MUST remain the structured Experience source of truth.
- UI code MUST NOT parse YAML, infer transitions, calculate reveal order, or duplicate scoring, safety, completion, or debrief logic.
- The Headless Player MUST remain presentation-independent.
- The Workspace MUST render the Player's immutable public state and submit supported actions back to the Player.
- Browser-consumable assets MUST be produced through deterministic packaging from canonical Experience Engine sources.
- Preview MAY include validated `technical_review` content. Publish MUST include only validated `published` content.

Detailed contracts remain authoritative in:

- [`experience-schema.yaml`](../../experience-engine/schemas/experience-schema.yaml)
- [`experience-validation-rules.md`](../../experience-engine/validation/experience-validation-rules.md)
- [`web-integration-contract.md`](../../experience-engine/integration/web-integration-contract.md)
- [`Experience Player`](../../experience-engine/player/README.md)

## Interfaces

- Capability mapping: [D2R-002](D2R-002-capability-definition-standard.md)
- Assessment rules: [D2R-004](D2R-004-assessment-standard.md)
- Experience Brief template: [`experience-brief-template.md`](../templates/experience-brief-template.md)
- Experience Engine principles: [`experience-engine-principles.md`](../../experience-engine/architecture/experience-engine-principles.md)

## Open decisions

- Cross-experience persistence and learner identity: `TBD — Requires architecture decision`.
- Formal difficulty calibration: `TBD — Requires architecture decision`.

## Version history

| Version | Change |
|---|---|
| 1.0.0 | Defined Experience classes, design requirements, and the mandatory engine-to-UI boundary. |
