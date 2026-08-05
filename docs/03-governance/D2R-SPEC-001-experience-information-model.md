# Experience Information Model

| Field | Value |
|---|---|
| Document ID | D2R-SPEC-001 |
| Version | 1.0.0 |
| Status | Approved baseline |
| Owner | Digital2Real Architecture |
| Scope | Learning-information model for Experience Factory production |

## Purpose

The Experience Information Model (EIM) defines the kinds of information a learner encounters while reasoning through a Digital2Real Experience and the educational relationship between them. It describes how understanding develops; it does not define files, schemas, rendering, runtime state, or software behavior.

The EIM is subordinate to the [Experience Design Guide](D2R-GUIDE-001-experience-design-guide.md), the approved [Experience Model decisions](decisions/EXP-MODEL-001-experience-model-contract-decisions.md), and existing Experience Engine contracts. The [Blueprint Schema](D2R-SPEC-003-blueprint-schema.md) applies this information model during production. Providers and artifacts are governed separately by [D2R-SPEC-002](D2R-SPEC-002-provider-library.md) and [D2R-SPEC-004](D2R-SPEC-004-engineering-artifact-library.md).

## Design Principles

- Information exists to develop engineering judgement, not to reproduce interface navigation.
- Observation precedes interpretation; evidence precedes justified action.
- Symptoms, hypotheses, root cause, recovery, and verification remain distinct.
- Information is progressive and available only when the learner can credibly obtain it.
- Technical uncertainty remains visible and is never replaced by invented certainty.
- Safety constrains every investigation and recovery decision.
- Reusable explanation belongs to Notebook; the Experience owns applied reasoning.
- Learner-visible information and private diagnostic authority remain separated.

## Information Types

The EIM contains nine primary Experience information types:

| Type | Responsibility |
|---|---|
| Incident | Establish why investigation is necessary |
| Observation | Record what is directly perceived |
| Assessment | Bound the immediate situation, risk, and priorities |
| Investigation | Define purposeful information-seeking activity |
| Evidence | Support or challenge a hypothesis |
| Root Cause | Explain the confirmed causal mechanism |
| Recovery | Restore the system through controlled action |
| Debrief | Reconstruct reasoning and transferable learning |
| Notebook | Supply separately owned reusable knowledge |

These types are conceptual. Their representation in Authoring v1 remains governed by the existing contract.

## Incident

An Incident establishes the industrial disruption or abnormal condition. It identifies the operational context, initiating event where known, observable impact, learner role, and immediate safety boundary.

An Incident must provide enough context to begin assessment without disclosing the diagnosis. It must not equate the first visible symptom with the root cause or imply technical facts that have not been established.

## Observation

An Observation is information available without analytical inference. It may describe physical state, equipment indications, process behavior, operator reports, chronology, or an initial system status.

Observations must identify their source and limitations. They may be incomplete or unreliable when that is realistic, but the Experience must not present interpretation as if it were direct observation.

## Assessment

Assessment is the learner's initial engineering framing of the Incident: safe state, production impact, intervention authority, evidence preservation, and the most important uncertainty to address first.

This term means situation assessment inside an Experience. It does not redefine an Assessment Experience, capability validation, scoring, or certification.

## Investigation

An Investigation is a deliberate action used to obtain, compare, or validate information. It may include inspection, measurement, diagnostic review, interview, documentation review, or controlled testing.

Each Investigation must have a purpose, prerequisites, safety constraints, expected information source, and credible consequence. Investigation order should reward proportionate and evidence-preserving work rather than arbitrary sequence memorization.

## Evidence

Evidence is attributable information produced or exposed through Observation or Investigation and used to change confidence in one or more hypotheses.

Evidence must be technically plausible, relevant, and revealed only when available. It should discriminate between explanations without directly announcing the answer. Reliability, ambiguity, and conflicts must be represented when educationally material.

## Root Cause

Root Cause is the confirmed physical, logical, procedural, or systemic condition whose correction is necessary to resolve the Incident. It is distinct from trigger, symptom, consequence, and contributing vulnerability.

Root Cause is private diagnostic authority until the learning flow has justified its disclosure. The learner-facing Experience may progressively support the conclusion, but must not expose it through filenames, artifact labels, media, metadata, or premature feedback.

## Recovery

Recovery defines the controlled path from confirmed diagnosis to an acceptable operational state. It distinguishes correction of the immediate condition from equipment reset, controlled restart, functional verification, safety verification, production handover, and recurrence prevention.

Recovery is not complete because movement or production resumes temporarily. Its success must be observable and verifiable through evidence defined by the Blueprint.

## Debrief

Debrief reconstructs the causal chain, evidence hierarchy, decisions, recovery, verification, safety reasoning, and transferable method after completion.

It must use only information established by the Experience. It must not introduce new facts, expose unexplained internal scoring, or imply that completion validates a professional Capability.

## Notebook

Notebook owns reusable technical concepts, methods, and explanations needed across Experiences. An Experience references Notebook knowledge instead of reproducing it.

The production process may identify a missing Notebook requirement, but that requirement remains separately owned and independently reviewed. Notebook must never become a hidden source of Experience-specific decisions or root-cause logic.

## Canonical Information Flow

```text
Incident
→ Observation
→ Situation Assessment
→ Investigation
→ Evidence
→ Hypothesis refinement
→ Decision and Action
→ Root-cause confirmation
→ Recovery
→ Verification
→ Debrief
```

The flow may iterate between Investigation, Evidence, hypothesis refinement, and Decision. Iteration must remain finite, purposeful, and consistent with the approved Blueprint. Notebook knowledge may support reasoning throughout but does not replace evidence from the Incident.

## Validation Rules

- Every learner-visible fact must trace to an Incident input, Observation, Evidence item, or approved Notebook reference.
- Every Evidence item must have an identifiable source and a valid reveal condition.
- Every Investigation must produce, preserve, compare, or intentionally fail to produce defined information.
- Every decision must be justifiable against information available at that point.
- Root Cause must remain private until its approved reveal or Debrief.
- Recovery must correct the confirmed condition and include relevant verification.
- Public and private information must remain structurally separable.
- The information graph must contain no orphan evidence, unreachable required information, or contradictory terminal outcomes.
- Technical uncertainty and safety constraints must remain explicit through review.

## Scope

D2R-SPEC-001 defines learning information and its conceptual flow only. It does not define Authoring fields, Runtime objects, Player transitions, Provider implementation, artifact rendering, localization files, packaging, Frontend behavior, scoring, persistence, analytics, or assessment contracts.

Physical package ownership remains with [D2R-STD-001](../02-standards/D2R-STD-001-experience-package.md). Production governance remains with [D2R-FACTORY-001](D2R-FACTORY-001-experience-production-workflow.md).
