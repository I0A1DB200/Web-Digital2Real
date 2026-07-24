# Experience Engine Principles

**Status:** Foundational  
**Owner:** Digital2Real Architect  
**Applies to:** All Experience Engine content and implementations

## 1. Product responsibility

The Experience Engine creates interactive industrial learning experiences.

Its responsibility is not to publish general theory. General theory belongs to Notebook.

An Experience Engine asset must train at least one of the following:

- diagnostic reasoning;
- engineering judgement;
- evidence interpretation;
- decision prioritization;
- troubleshooting;
- safe recovery;
- root-cause analysis;
- recurrence prevention.

## 2. Competency before scenario

Every experience begins with a defined competency.

The scenario, machine, vendor, symptoms, and decisions exist to train that competency.

A scenario without a clear competency is not an experience. It is only a story.

## 3. Root cause before narrative

The root cause must be defined before the learner sees the first symptom.

The author must establish:

- initiating event;
- physical or logical failure;
- propagation mechanism;
- operational effect;
- contributing vulnerabilities;
- recovery condition;
- preventive measures.

The narrative must be derived from the fault model, never the reverse.

## 4. Symptoms are not causes

The engine must explicitly separate:

- **symptom:** what the technician observes;
- **event:** what happened before the failure;
- **mechanism:** how the failure propagated;
- **consequence:** what the failure produced;
- **vulnerability:** what allowed escalation;
- **root cause:** what must be corrected;
- **recovery action:** what safely restores operation;
- **prevention:** what reduces recurrence.

## 5. Evidence must be progressive

The learner must not receive all diagnostic information at the start.

Evidence is revealed through actions such as:

- operator interview;
- HMI inspection;
- PLC online diagnostics;
- diagnostic buffer analysis;
- network inspection;
- field inspection;
- electrical measurement;
- comparison with documentation;
- controlled functional test.

Each action should reduce, preserve, or increase uncertainty in a technically plausible way.

## 6. Decisions must be credible

Incorrect options must remain plausible.

Avoid absurd distractors.

A useful incorrect decision may be:

- premature;
- invasive;
- incomplete;
- symptom-oriented;
- unsupported by evidence;
- technically possible but poorly prioritized;
- operationally risky;
- effective temporarily without correcting the cause.

## 7. Consequences must teach

A wrong decision should not always end the experience.

It may:

- consume time;
- increase risk;
- remove useful evidence;
- create a secondary fault;
- restore operation temporarily;
- force reassessment;
- reveal a weakness in the learner's method.

## 8. Safety before speed

The engine must never reward unsafe intervention.

Required controls may include:

- safe state confirmation;
- lockout/tagout;
- electrical isolation;
- stored-energy control;
- process risk assessment;
- change authorization;
- backup verification;
- controlled restart;
- validation before release to production.

## 9. No invented technical detail

Messages, LED states, diagnostic events, PLC behavior, network behavior, and recovery procedures must be technically plausible.

When exact vendor behavior is uncertain:

- mark the uncertainty;
- use generic wording;
- validate against authoritative documentation before publication.

## 10. Recovery is not completion

An experience does not end when the machine restarts.

Completion requires:

- root-cause confirmation;
- safe recovery;
- functional validation;
- production handover;
- documentation;
- recurrence prevention;
- debrief.

## 11. Notebook integration

Notebook and Experience Engine must share knowledge without duplication.

Example:

- Notebook: PROFINET device identity and name assignment.
- Experience: remote I/O becomes unreachable after loss of device identity.

The experience may reference Notebook knowledge. It must not reproduce an entire Notebook entry.

## 12. Reusability

Every completed experience should produce reusable assets:

- fault pattern;
- diagnostic sequence;
- decision model;
- evidence set;
- common errors;
- recovery logic;
- prevention measures;
- competency mapping.

## 13. Single source of truth

`experience.yaml` is the structured source of truth.

Human-readable files explain and review the experience, but cannot contradict the structured model.

## 14. Quality gate

An experience is publishable only when:

- the fault model is coherent;
- the evidence supports the diagnosis;
- decisions are credible;
- consequences are realistic;
- safe intervention is preserved;
- the root cause is confirmable;
- the debrief extracts reusable engineering judgement.
