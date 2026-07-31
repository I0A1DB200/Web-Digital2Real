# Digital2Real Experience Design Guide

# 1. Purpose

A Digital2Real Experience is a structured industrial situation in which a learner interprets evidence, forms and tests hypotheses, makes engineering decisions, acts within safe boundaries, and verifies the result. It connects governed competencies from the [Industrial Capability Framework](../01-architecture/D2R-001-industrial-capability-framework.md) with applied professional reasoning.

An Experience is not a theory lesson, a sequence of software instructions, a product demonstration, a quiz, or a simulation whose purpose is entertainment. Reusable technical explanation belongs to Notebook; the Experience gives that knowledge an industrial context in which judgement matters.

The educational objective is to develop transferable reasoning rather than recall. The engineering objective is to represent credible technical states, evidence, constraints, interventions, and consequences without inventing certainty. This guide supports the approved requirements in the [Experience Design Standard](../02-standards/D2R-003-experience-design-standard.md); it does not replace them.

# 2. Engineering Philosophy

Experiences teach learners how to think about industrial systems. They do not teach button sequences or recipes that work only for one screen, device, or vendor version.

The learner should have to distinguish observation from interpretation, symptoms from causes, command from physical result, recovery from verification, and urgency from unsafe haste. A strong Experience develops technical judgement by making evidence quality, uncertainty, risk, and intervention order visible in the work.

The scenario must begin with a governed competency and a coherent fault or operational model. Equipment, vendor context, media, and narrative serve that learning purpose; they are not the purpose themselves. Technical quality and credible reasoning take priority over content volume.

# 3. Learning Flow

```text
Incident
↓
Observation
↓
Evidence
↓
Hypothesis
↓
Decision
↓
Action
↓
Verification
↓
Debrief
```

- **Incident:** establishes the industrial disruption, operating context, impact, and safe intervention boundary.
- **Observation:** presents what can be perceived before the learner changes the system.
- **Evidence:** provides attributable information that reduces, preserves, or increases diagnostic uncertainty.
- **Hypothesis:** gives the learner a technically plausible explanation to test rather than an answer to accept.
- **Decision:** requires selection of the most justified next engineering step from credible alternatives.
- **Action:** applies the selected intervention and exposes its realistic consequence.
- **Verification:** confirms whether diagnosis, recovery, safety, and process function agree; restart alone is insufficient.
- **Debrief:** reconstructs the reasoning, identifies transferable lessons, and connects the work to reusable knowledge.

The flow is conceptual rather than a fixed screen sequence. An Experience may revisit evidence, hypotheses, or decisions when realistic diagnosis requires iteration.

# 4. Experience Structure

## Introduction

Give the learner only the context needed to assume the professional role: industrial situation, observable symptom, operational impact, known constraints, and safety boundary. Do not reveal the diagnosis.

## Stages

Divide the work into meaningful changes in diagnostic context. Each stage should have a clear purpose, expose only currently available information, and create a reason to make the next decision. The number of stages follows the problem; it is not a quality target.

## Decisions

Offer credible engineering actions whose differences reveal prioritization, evidence use, invasiveness, risk, or completeness. Avoid using the number of decisions as a difficulty mechanism.

## Evidence

Make evidence progressive, attributable, technically plausible, and relevant to one or more active hypotheses. Evidence availability must follow the actions and state of the scenario.

## Closure

End the operational sequence only after the learner has addressed the cause, restored the system safely, verified expected function, and considered production handover or recurrence prevention where relevant.

## Debrief

Close the learning sequence by explaining the reasoning and evidence hierarchy. The debrief is part of the Experience, not an optional summary.

# 5. Evidence Design

Good evidence is observable, attributable, timely, technically credible, and capable of changing the diagnostic picture. It should help discriminate between hypotheses without directly stating the root cause.

Evidence may be:

- **Visual:** machine state, device indication, physical condition, movement, or absence of movement.
- **HMI:** alarms, commands, permissions, trends, operating states, or operator-facing diagnostics.
- **PLC:** process images, program states, diagnostics, events, or controller status.
- **SCADA:** historical context, correlated events, process values, or supervisory state.
- **Electrical:** voltage, continuity, current, protection state, wiring condition, or power quality.
- **Process:** pressure, flow, position, temperature, timing, product condition, or sequence behavior.
- **Operator:** reported symptoms, recent actions, production context, or observed chronology.
- **Historical:** maintenance records, previous failures, trends, change history, or verified documentation.

Evidence must never give the answer. A diagnostic message, image, or measurement should still require interpretation and correlation. Unreliable or incomplete evidence may be used when its limitations are explicit and educationally relevant.

# 6. Decision Design

A decision should answer: given the evidence currently available, what is the most justified engineering action now?

Strong decision sets:

- distinguish safe, proportionate investigation from premature intervention;
- use alternatives that a competent practitioner could realistically consider;
- expose trade-offs involving evidence quality, time, risk, invasiveness, and reversibility;
- preserve credible consequences instead of treating every weak choice as immediate failure;
- maintain consistency with the learner's authority and the machine state.

Avoid absurd distractors, wording tricks, duplicate choices, vendor-menu trivia, actions outside the learner's role, and options that differ only stylistically. Do not make the correct choice obvious through length, tone, or excessive precision.

Feedback should explain why the decision was strong, weak, incomplete, premature, or unsafe in relation to available evidence. It should describe the consequence and the reasoning gap without revealing private diagnostic information prematurely. Feedback must not shame the learner or substitute a score for explanation.

Reusable decision patterns may capture general engineering behaviours such as preserving evidence, confirming a safe state, comparing commanded and actual state, or verifying recovery. Their wording, consequence, and applicability must still be adapted to the specific industrial context; reusable patterns must not become copied recipes.

# 7. Debrief

The debrief should contain:

- the causal chain from initiating event to operational consequence;
- the evidence that most effectively separated competing hypotheses;
- the reasoning behind strong, weak, and unsafe decisions;
- the distinction between correction, recovery, verification, and production release;
- the safety principles that governed intervention;
- the transferable diagnostic method;
- recurrence-prevention considerations;
- references to relevant Notebook knowledge.

It must not introduce evidence that was absent from the Experience, invent vendor behaviour, disclose unexplained scoring, reduce the lesson to a button sequence, or claim capability validation from completion alone.

Its didactic purpose is to help the learner reconstruct a repeatable reasoning method and understand how that method transfers to another machine, vendor, or incident.

# 8. Difficulty

Difficulty describes the reasoning demand of one Experience. It is not a professional rank, a substitute for competency mapping, or proof of capability.

- **Foundation:** guided application with a clear context, limited ambiguity, focused evidence, and explicit support for connecting observations to a justified action.
- **Intermediate:** reduced guidance, multiple plausible hypotheses, evidence that must be correlated, and decisions requiring prioritization rather than recall.
- **Advanced:** significant ambiguity, interacting technical domains, incomplete or conflicting evidence, operational constraints, and independent verification planning.
- **Expert:** high-consequence, cross-domain reasoning with substantial uncertainty, competing risks, non-obvious causal chains, and responsibility for a defensible recovery and validation strategy.

Difficulty should increase through independence, uncertainty, evidence interpretation, and consequence—not through unnecessary length or obscure vendor detail.

# 9. Industrial Realism

- **Realism:** states, timings, dependencies, measurements, failure propagation, safety constraints, and recovery behaviour must be technically plausible.
- **Credibility:** symptoms, evidence, alternatives, and consequences should reflect decisions encountered in industrial work.
- **Reusability:** the lesson should remain useful beyond one device or vendor even when the scenario uses a specific platform.
- **Consistency:** narrative, media, evidence, decisions, technical model, and debrief must describe the same incident.

Do not gamify risk, safety, failure, or production impact. Points, artificial urgency, badges, and theatrical failure effects must not replace engineering consequence or evidence-based feedback.

# 10. Multimedia

Multimedia exists to make an industrial state observable, provide evidence, establish spatial or temporal context, and support comparison or verification. Every asset should have a specific learning function and appear only when that function is relevant.

Multimedia must not decorate uncertainty away, reveal future evidence, contradict the technical model, or carry essential meaning only through untranslated embedded text. Its governing specification is **EXP-SPEC-001**. This guide does not duplicate its requirements or define media generation.

# 11. Relationship with Notebook

Notebook owns reusable technical knowledge; an Experience applies that knowledge under industrial conditions. Authors should identify the concepts, methods, and reference material a learner may need, then link to the canonical Notebook material instead of reproducing it inside the scenario.

Experience design may also reveal a genuine Notebook gap. That gap should become a separately owned knowledge requirement. It must not be silently filled with duplicate theory in the Experience.

After review, a completed Experience may contribute reusable knowledge back to Notebook: a diagnostic pattern, evidence interpretation method, verified failure mechanism, safe recovery principle, or prevention lesson. Notebook content must remain understandable independently from the original scenario.

# 12. Experience Factory

```text
Idea
↓
Blueprint
↓
Experience Design
↓
Notebook
↓
Media Brief
↓
Masters
↓
Codex Build
↓
Review
↓
Publish
```

- **Idea:** identifies a real industrial problem and its potential learning value.
- **Blueprint:** establishes competency, learner role, context, fault or operational model, safety boundary, and intended outcome.
- **Experience Design:** defines the learning flow, stages, evidence, decisions, consequences, verification, and debrief.
- **Notebook:** reuses or commissions the canonical knowledge required by the Experience.
- **Media Brief:** states what learners must observe and why, without prescribing unsupported decoration.
- **Masters:** provide the authoritative source material from which publication derivatives may be produced.
- **Codex Build:** translates approved design inputs into the governed Digital2Real structures without inventing technical facts.
- **Review:** verifies engineering, pedagogy, safety, consistency, internationalization, and publication readiness.
- **Publish:** releases only the reviewed and approved Experience through the established publication boundary.

# 13. Experience Checklist

## Technical coherence

- [ ] The initiating event, mechanism, symptoms, root cause, recovery, and verification form one credible causal chain.
- [ ] Vendor-specific claims are verified or uncertainty is recorded.
- [ ] Restart is not treated as proof of diagnosis or completion.

## Competencies

- [ ] The Experience maps to the smallest coherent set of governed competencies.
- [ ] Every learning objective contributes to observable engineering judgement.
- [ ] Completion is not presented as capability validation or certification.

## Didactic quality

- [ ] The Experience trains reasoning rather than recall or interface navigation.
- [ ] Evidence is progressive and does not reveal the answer.
- [ ] Decisions are credible, distinct, and supported by meaningful feedback.
- [ ] The debrief extracts a transferable method.

## Multimedia quality

- [ ] Every asset has a defined learning purpose.
- [ ] Media agrees with the evidence and current scenario state.
- [ ] Essential meaning does not depend on inaccessible or untranslated embedded text.
- [ ] Sources and derivatives follow the approved multimedia authority.

## Safety

- [ ] Safe-state, authorization, intervention, restart, and handover constraints are credible.
- [ ] Unsafe actions are never rewarded.
- [ ] The verification sequence includes relevant safety behaviour.

## Consistency

- [ ] Introduction, stages, evidence, decisions, consequences, closure, and debrief describe the same model.
- [ ] Notebook references reuse knowledge without duplicating it.
- [ ] No Experience-specific rule has been introduced into shared systems.

## Internationalization

- [ ] Required learner-facing content is available in every declared locale.
- [ ] Fallback behaviour is deliberate and reviewed.
- [ ] Media and terminology remain understandable across declared locales.

## Packaging

- [ ] The Experience follows [D2R-STD-001](../02-standards/D2R-STD-001-experience-package.md) when that standard applies.
- [ ] Canonical authoring and generated artifacts retain separate ownership.
- [ ] Preview and production publication states are correct.

## Tests

- [ ] Authoring, normalization, Runtime, projection, Web Artifact, packaging, localization, Player, and security checks pass where applicable.
- [ ] The complete intended path and reviewed alternative paths behave coherently.
- [ ] Repository regression tests pass before publication.

# 14. Out of Scope

This guide does not define or modify:

- schemas;
- contracts;
- Runtime;
- Player;
- packaging;
- Frontend;
- media generation;
- validation.

Those responsibilities remain with their existing approved authorities. This guide governs the design process only and must not be used as an alternative implementation specification.
