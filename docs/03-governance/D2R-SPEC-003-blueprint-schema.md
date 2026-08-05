# Experience Blueprint Schema

| Field | Value |
|---|---|
| Document ID | D2R-SPEC-003 |
| Version | 1.0.0 |
| Status | Approved baseline |
| Owner | Digital2Real Architecture |
| Scope | Canonical manual production specification for Experience Factory |

## Purpose

The Experience Blueprint is the single manually approved specification passed into the Experience Factory build process. It converts an approved industrial case into a complete, reviewable production intent without becoming Authoring YAML, Runtime, a media asset, or an implementation contract.

An Experience Brief or Industrial Case may capture upstream knowledge. Architecture review turns that source into one approved Blueprint. Once build begins, the Factory consumes the Blueprint rather than independently interpreting upstream notes. This boundary reconciles upstream knowledge capture with the existing authoring workflow and prevents multiple manual production authorities.

The Blueprint applies the [Experience Information Model](D2R-SPEC-001-experience-information-model.md), requests information through the [Provider Library](D2R-SPEC-002-provider-library.md), and requests representations from the [Engineering Artifact Library](D2R-SPEC-004-engineering-artifact-library.md).

Its review, build authorization, and downstream use follow [D2R-FACTORY-001](D2R-FACTORY-001-experience-production-workflow.md).

## Blueprint Principles

- One Experience has one approved Blueprint version for a production attempt.
- The Blueprint records intent, traceability, constraints, and graphs; it does not contain generated outputs.
- Root Cause and diagnostic authority are defined before learner narrative.
- Public and private information are explicitly separated.
- Every requested fact has one source authority.
- Every decision and Evidence item has a place in a finite investigation graph.
- Missing knowledge, Provider support, media, or validation remains explicit.
- The Blueprint must be implementable through existing contracts before build authorization.

## Industrial Case

The Industrial Case identifies the real or technically verified problem from which the Experience is designed. It includes case identity, source authority, platform and machine context, initiating condition, observed problem, known operational impact, technical uncertainty, and applicable references.

The case must distinguish verified fact from proposed educational construction. Vendor-specific behavior that lacks authoritative confirmation remains a review blocker.

## Learning Objective

The Blueprint identifies one principal Capability, governed Competencies when available, Experience class, intended difficulty, learner role, and the judgement the learner must develop.

The learning objective describes observable reasoning and safe action. It must not be a topic list, interface task, completion count, or certification claim. Missing governed Competencies must remain unresolved rather than receiving local IDs.

## Industrial Context

Industrial Context bounds industry, process, machine, equipment, control environment, production state, business impact, intervention authority, constraints, and safety conditions required to understand the Incident.

Only context that influences reasoning or realism belongs in the Blueprint. General technical explanation remains in Notebook.

## Incident

The Incident section defines the learner-visible opening state, initiating event where known, immediate observations, operational consequence, available role authority, and safe-state requirement.

It must provide a credible reason to investigate while withholding Root Cause and future Evidence.

## Root Cause

The private Root Cause section defines trigger, failure or degradation, causal mechanism, symptoms, contributing vulnerabilities, operational effect, correction, recovery conditions, verification, and prevention.

It is the diagnostic authority used to validate the graphs. It must not appear in public artifacts before the approved reveal or Debrief.

## Investigation Graph

The Investigation Graph defines the finite progression of diagnostic situations. Each node identifies:

- a stable node ID;
- learner-visible context;
- information already available;
- permitted investigations or decisions;
- Provider requests activated at that point;
- Evidence produced or revealed;
- transition destinations;
- safety gates;
- completion, reassessment, or blocked behavior.

Cycles are allowed only for purposeful reassessment with a bounded exit. Required nodes must be reachable, and every non-terminal path must have a valid destination.

## Provider Requests

Every external information need is declared using the governance contract in D2R-SPEC-002. A request identifies Provider, purpose, availability, parameters, artifact template when required, visibility, dependencies, validation source, and production status.

A Blueprint must not invent a new Provider ID. Unsupported requests are recorded as gaps and evaluated before build authorization.

## Decision Graph

The Decision Graph defines the credible actions available at each investigation node and their diagnostic, safety, time, and operational consequences. Each decision identifies:

- stable decision ID;
- owning node;
- learner-facing action;
- evidence prerequisites;
- rationale and classification in private authority;
- consequence;
- Evidence revealed;
- next node or terminal state;
- safety constraint.

The graph must support at least one complete evidence-based path and credible alternatives. It must not use absurd distractors or reward unsafe behavior.

## Evidence Graph

The Evidence Graph traces each Evidence item to its source Observation or Provider request, reveal condition, reliability, hypotheses affected, decisions that use it, and verification role.

Every Evidence item must be reachable and educationally necessary. Evidence unavailable at the current node must remain hidden. The graph must contain no orphan Evidence and no decision that depends on unavailable information.

## Recovery

Recovery defines authorized correction, restoration, controlled restart, functional checks, safety checks, production handover, and recurrence prevention appropriate to the case.

The recovery model must state observable completion conditions. Temporary resumption without diagnosis and verification is not completion.

## Debrief

The Blueprint defines the required Debrief content: causal chain, Evidence hierarchy, strong and weak decisions, safety reasoning, recovery, verification, prevention, transferable method, and Notebook references.

The Debrief must derive from the approved graphs and Root Cause. It must not introduce facts absent from the Blueprint.

## Validation Rules

- Blueprint identity and version must be stable and traceable to one Experience.
- Capability and Competency references must use governed identifiers.
- Industrial Case, Root Cause, and graphs must describe one coherent causal model.
- All Provider and artifact references must use canonical IDs.
- Every graph node, decision, Evidence item, and request must have a unique stable ID.
- All graph references must resolve; required nodes and Evidence must be reachable.
- Signals, values, directions, units, labels, and equipment identities must agree across Providers and artifacts.
- Public information must not expose private diagnostic authority.
- Recovery and Debrief must be supported by previously established information.
- Localization scope must cover all learner-visible content and media meaning.
- Existing Authoring, Runtime, Web Artifact, Player, packaging, and localization boundaries must be sufficient before build begins.
- Any unsupported requirement blocks build or requires an independently approved architecture decision.

## Generated Outputs

An approved Blueprint may drive production of:

- a complete Authoring Definition within the existing contract;
- localized learner-facing content;
- Provider request inventory;
- media briefs and approved Engineering Artifacts;
- Notebook requirements and references;
- review records;
- generated Runtime and Web Artifact through existing pipelines;
- deterministic package and catalog outputs through existing packaging.

Generated outputs do not modify the Blueprint and do not become additional manual authorities. D2R-STD-001 remains the authority for the physical Experience Package.

## Out of Scope

This document does not define a machine-readable Blueprint format, JSON or YAML schema, Provider implementation, media generator, Authoring schema, Runtime, Projection, Player, validation code, packaging, Frontend, persistence, analytics, or autonomous publication.
