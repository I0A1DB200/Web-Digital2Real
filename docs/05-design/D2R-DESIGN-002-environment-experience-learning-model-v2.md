# D2R-DESIGN-002 — Environment & Experience Learning Model V2

| Field | Value |
|---|---|
| Document ID | D2R-DESIGN-002 |
| Version | 1.0.0 |
| Status | IMPLEMENTED — V2 PILOT VALIDATED |
| Scope | Environment and Experience learning model V2 |
| Product area | Experience Lab |
| Design authority | Digital2Real Product Design |
| Implementation status | PHASE 7 EE-0001 V2 CANONICAL PILOT COMPLETE |

## 1. Purpose and authority

This document records the approved product and learning design for Environment & Experience Learning Model V2. It defines intended behavior; it does not define a technical schema, runtime protocol, persistence model, generated artifact, or Player implementation.

[D2R-003 Experience Design Standard](../02-standards/D2R-003-experience-design-standard.md) remains the general normative authority for Experience design. [EXP-MODEL-001](../03-governance/decisions/EXP-MODEL-001-experience-model-contract-decisions.md) remains authoritative for separation of Authoring, Runtime, public artifacts, Player state, and presentation. [D2R-DESIGN-001](D2R-DESIGN-001-experience-card-specification.md) continues to govern Experience card presentation.

D2R-DESIGN-002 complements those authorities with the implemented V2 learning model. It does not override the versioned contracts or duplicate their technical authority.

### Ratified relationship

D2R-003 contains the explicit, narrowly governed exception for **ENV Theory**: Notebook remains independent, ENV Theory owns its preparation content, and conceptual duplication is permitted when the ENV needs its own preparation content. D2R-003 remains the normative authority; this document records the product model that implements that rule.

## 2. Status boundary

Phase 5 implemented the versioned ENV V2 Theory contract, localized packaging and Frontend presentation for ENV-001.

Phase 6 added versioned local progress for explicit Theory section completion and monotonic Experience completion/mastery. Environment completion requires complete Theory and every current Experience completed; Environment mastery requires complete Theory and every current Experience mastered. The dimensions remain separate and no combined score, run history or analytics is defined.

Phase 7 validated the complete V2 path with EE-0001 as the single canonical pilot: Authoring, Runtime, projection, Player, evaluator, localized learner feedback, ENV Progress and deterministic packaging.

V2 identity remains explicit at every contract boundary. No Experience, Environment, Runtime, artifact or progress record may be treated as V2 merely because its shape resembles V2.

## 3. Product model

Each Environment MUST combine learning preparation and applied diagnostic practice:

```text
ENV
├── Theory
└── 10 Experiences
```

An ENV MUST contain its own Theory, exactly ten Experiences, progress, and a completion state. The ten Experiences form the applied learning path of that ENV.

Notebook is outside this architecture and remains an independent Digital2Real product. ENV Theory MUST NOT depend on Notebook, reuse Notebook as its technical source of truth, or introduce shared content ownership. Conceptual duplication is acceptable when both products independently need to explain the same concept.

## 4. ENV Theory

Theory belongs exclusively to its ENV and prepares the learner for that Environment's Experiences. It MUST be:

- technical and industrially contextual;
- structured and sequential;
- visual when a visual materially improves understanding;
- focused on knowledge required for application in the ENV.

Theory teaches; it MUST NOT become an examination by default. This design does not define a Theory schema or technical dependency from Theory to Experience.

## 5. Experience contract V2

A V2 Experience has exactly four principal learning phases:

```text
Experience
├── Incident
├── Investigation
├── Solution
└── Debrief
```

### 5.1 Incident

Incident presents the industrial situation, symptom, initial context, and initially available evidence. It MUST NOT reveal the root cause.

### 5.2 Investigation

Investigation is the core of the Experience and teaches troubleshooting through diagnostic decisions:

```text
Evidence
↓
Decision
↓
Evaluation
↓
Progress / Retry
↓
Next Evidence
```

The learner MUST reason from available evidence. Experiences MUST use diagnostic decisions rather than academic recall questions.

### 5.3 Solution

Solution encompasses identification of the cause, corrective action, and verification of recovery. These elements SHOULD remain one principal phase unless a later demonstrated requirement justifies a different architecture.

### 5.4 Debrief

Debrief occurs after the Experience is resolved. It MUST reconstruct:

```text
Symptom → Evidence → Diagnosis → Root Cause → Solution → Verification
```

It MUST extract the reusable engineering principle learned and MUST NOT introduce facts that the Experience did not establish.

## 6. Decision model

Every decision MUST:

1. present multiple options;
2. use only technically plausible alternatives in the current industrial context;
3. avoid absurd, filler, or giveaway alternatives;
4. identify exactly one correct option;
5. define the correct option as the best diagnostic action supported by evidence available at that moment.

An incorrect option MUST NOT advance the investigation. It MUST produce technical feedback and permit another attempt. Attempts MUST be unlimited; V2 MUST NOT use lives or artificial attempt limits.

Only the correct diagnostic decision unlocks the next stage or evidence.

**Normative principle:** Progression requires the correct diagnostic decision.

## 7. Feedback

Incorrect-answer feedback MUST:

- be technical and grounded in currently available evidence;
- explain why the selected action is not appropriate at that moment;
- help the learner reconsider the diagnosis;
- avoid directly revealing the correct option whenever possible.

Feedback MUST preserve diagnostic reasoning and MUST NOT use academic formulations such as “Incorrect. The correct answer is B.”

## 8. Attempt tracking

V2 requires the session model to record conceptually, for each decision:

- total attempt count;
- whether the decision was correct on the first attempt;
- additional attempts.

Attempt counts need not be displayed during Investigation. Ownership, persistence, artifact representation, and analytics are not decided here and require later technical design.

## 9. Experience evaluation

Global evaluation occurs after completion, not visibly after every decision. The initial metric is **first-attempt success**:

```text
6 decisions
5 correct on the first attempt
= 83% first-attempt success
```

The proposed outcomes and thresholds are **PROVISIONAL**:

| First-attempt success | Outcome |
|---:|---|
| ≥ 80% | PASS |
| 50–79% | PASS WITH GUIDANCE |
| < 50% | RETRY RECOMMENDED |

These thresholds MUST be validated with real Experiences before becoming a stable contract. This document does not define rounding, denominator exceptions, persistence, remediation, or assessment/certification consequences.

## 10. Completion and mastery

- **Completed:** the learner has traversed and resolved the entire Experience.
- **Mastered:** the final evaluation meets the approved mastery criterion.

Completion MUST NOT automatically imply mastery. The technical persistence and lifecycle of either state remain undecided.

## 11. ENV progress and completion

ENV progress conceptually combines:

```text
Theory progress + Experience progress
```

The ENV MUST represent both learning and application. This draft does not approve a global percentage algorithm, weighting, persistence mechanism, or mastery rule for ENV completion.

## 12. Normative design principles

- Experiences evaluate engineering judgement, not memorization.
- Theory teaches. Experiences require application.
- Progression requires the correct diagnostic decision.
- All decision alternatives must be technically plausible.
- The learner reasons from evidence rather than guessing the expected answer.
- Completion does not automatically imply mastery.
- Feedback should improve reasoning without giving away the investigation.
- Industrial realism takes precedence over quiz mechanics.

## 13. Not decided / future

The following are outside this version and MUST NOT be introduced into current contracts by inference:

- branching investigations;
- multiple correct answers;
- multiple valid diagnostic paths;
- complex scoring;
- lives or timers;
- leaderboards or gamification;
- specific safety penalties;
- technical Theory-to-Experience dependencies;
- a mandatory number of decisions per Experience;
- adaptive difficulty;
- AI-generated hints;
- comparison between users.

## 14. V2 implementation impact

This classification reflects the audited implementation and is planning input only.

### Already supported

- canonical Experience authoring separated from generated public artifacts;
- multiple technically plausible public decision options;
- ordered stages, media, completion content, localization, and capability references;
- canonical ENV entities with capacity, Experiences, hotspots, and local completion progress;
- strict public/private projection boundary.

### Requires content change

- explicit Incident, Investigation, Solution, and Debrief composition;
- exactly one approved correct diagnostic option per decision;
- retry-oriented technical feedback for every incorrect option;
- V2-quality debrief and first-attempt evaluation readiness;
- ENV-specific Theory content.

### Requires contract evolution

- explicit correct-option representation;
- learner-safe feedback representation and reveal policy;
- attempt and first-attempt-success state;
- evaluation outcomes and Completed/Mastered distinction;
- ENV Theory, Theory progress, and ENV completion semantics.

### Requires Runtime evolution

- evaluate the selected option;
- block progression after an incorrect option;
- permit retry and record attempts;
- unlock the next evidence only after correctness;
- calculate final first-attempt success and outcome;
- distinguish completion from mastery.

### Requires Player evolution

- render technical feedback without exposing hidden answers;
- retain the learner in the current decision after an incorrect attempt;
- support retry interaction and final evaluation/debrief presentation;
- consume only an approved public contract without inferring evaluation rules.

### Requires ENV architecture

- own and present ENV Theory independently from Notebook;
- enforce exactly ten Experiences in the appropriate lifecycle;
- represent Theory progress, Experience progress, and ENV completion without an unapproved aggregate algorithm.

## 15. Pilot and rollout boundary

**EE-0001 — Sensor ON, PLC Input OFF** is the sole canonical V2 pilot. Its separately approved Phase 7 migration validates:

- plausible decisions and one correct option;
- blocked progression and unlimited retry;
- technical feedback;
- attempt tracking and first-attempt success;
- final evaluation outcomes;
- Debrief V2.

EE-0001 now has one Authoring V2 source, explicit progression, sequential evidence, all three provisional outcomes and ENV Progress V2 integration. This pilot does not authorize migration of EE-0002 or later Experiences, nor does it promote the provisional thresholds to a final policy.

## 16. Implementation guardrail

Further implementation still requires a separate technical plan and explicit approval. Phase 7 migrated only EE-0001 using the existing schemas, Runtime, Player, evaluator, projection and ENV Progress contracts; EE-0009 remains unchanged as the archived V1 regression.

## 17. Engine freeze after pilot

New Experiences MUST adapt to the ratified contracts and MUST NOT introduce Experience-specific Engine behavior for editorial convenience. An Engine change requires a repeatable limitation affecting multiple Experiences, production evidence, explicit architecture review and a system-wide benefit.

The pilot validates readiness to author EE-0002 through EE-0010 within the current model; it does not create or migrate those Experiences. Evaluation thresholds remain provisional, and backend-authoritative evaluation, cross-tab progress synchronization, analytics, run history, prerequisites and adaptive learning remain deferred.
