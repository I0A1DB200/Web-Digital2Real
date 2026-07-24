# Experience Validation Rules

**Status:** Official  
**Owner:** Digital2Real Architect  
**Applies to:** Every generated or manually authored Experience Engine package

## Purpose

This document defines the single quality gate between experience authoring and publication.

It converts Experience Engine principles into verifiable checks. It does not replace the principles, the schema, or technical review.

The validator reads `experience.yaml` as the structured source of truth and compares all auxiliary files against it.

## Validation states

Only these results are valid:

- `PASS` — every required check passes and no unresolved warning can affect technical accuracy, safety, consistency, or publication.
- `PASS_WITH_WARNINGS` — all blocking checks pass, but documented non-blocking actions remain.
- `BLOCKED` — one or more required checks fail, required evidence is absent, or technical uncertainty prevents approval.

An experience may be published only when the global result is `PASS`.

Any section result of `BLOCKED` makes the global result `BLOCKED`. `PASS_WITH_WARNINGS` cannot be promoted to `PASS` without resolving or explicitly revalidating every warning.

## 1. Structural validation

Verify:

- the package contains `README.md`, `experience.yaml`, `fault-model.md`, `decision-tree.md`, and `debrief.md`;
- no generated `metadata.json` exists;
- `experience.yaml` parses as valid YAML;
- the experience follows the current schema or a declared compatibility profile;
- experiences using the legacy profile are not approved or published;
- all required schema fields are present;
- experience, competency, objective, stage, evidence, decision, and hypothesis identifiers are unique;
- every referenced competency, stage, evidence, decision, and hypothesis exists;
- every decision belongs to its declared stage;
- every decision leads to an existing stage or a declared terminal state;
- the critical path resolves from the initial stage to completion;
- there are no broken routes;
- there are no unintended unreachable states;
- reassessment cycles have a bounded exit;
- every terminal state has a valid completion, blocked, or debrief outcome.

Result is `BLOCKED` when YAML is invalid, a required file or field is absent, a reference is broken, or no complete critical path exists.

## 2. Fault-model validation

Verify:

- the initiating event is identified;
- the technical failure is defined;
- the propagation mechanism is coherent;
- symptoms, consequences, vulnerabilities, and root cause are distinct;
- the root cause can be confirmed through available evidence;
- the causal chain explains the operational state;
- recovery conditions correct the failure rather than only masking a symptom;
- recovery includes controller, machine, I/O, safety, or process checks when applicable;
- preventive actions act on the root cause or a contributing vulnerability;
- technical uncertainties are declared structurally;
- every uncertainty identifies the required review or source;
- unresolved manufacturer-specific behavior does not appear as confirmed fact.

Result is `BLOCKED` when the root cause is ambiguous, unconfirmable, contradicted by evidence, or not corrected by the recovery.

## 3. Diagnostic validation

Verify:

- initial observations do not reveal the root cause;
- evidence appears progressively;
- every diagnostic action has a defined purpose;
- every evidence item has a source, interpretation, and reliability;
- evidence strengthens or weakens hypotheses coherently;
- the correct path follows available evidence and does not depend on guessing;
- incorrect decisions are technically plausible;
- consequences are realistic and consistent with the fault model;
- recoverable errors return to a coherent state;
- invasive actions require sufficient evidence and authorization;
- no evidence contradicts the fault model;
- confirmed and rejected hypotheses are supported by evidence;
- the critical path reaches root-cause confirmation, safe recovery, and functional validation.

Result is `BLOCKED` when the correct answer is exposed prematurely, evidence is contradictory, or a path requires information unavailable to the learner.

## 4. Safety validation

Verify:

- the scenario defines a safety context;
- the required safe state is identified;
- intervention constraints are explicit;
- dangerous actions are never rewarded;
- electrical isolation, lockout/tagout, stored energy, process hazards, and authorization are considered when applicable;
- safety checks occur before intervention and restart;
- invasive actions cannot bypass safety gates;
- restart is controlled;
- recovery includes functional validation;
- safety functions are validated before release;
- production handover is controlled when applicable;
- completion conditions cannot be satisfied while safety requirements fail.

Result is `BLOCKED` when a plausible learner path rewards unsafe action, bypasses a required control, or releases equipment without validation.

## 5. Content validation

Verify:

- alarms, messages, LED states, timing, and device behavior are not invented;
- manufacturer-specific claims are supported by authoritative documentation or marked as uncertain;
- terminology is accurate and consistent;
- Notebook is referenced without reproducing complete theory;
- Notebook content is not created or modified by generation;
- every Markdown asset agrees with `experience.yaml`;
- no Markdown file defines an independent structured truth;
- README status and review notes agree with the structured model;
- the fault model and decision tree use the same identifiers and causal chain as the YAML;
- the debrief explains reasoning, evidence hierarchy, common errors, recovery, and prevention;
- the debrief does not reveal facts absent from the structured model;
- internal review notes are not exposed as learner-facing content.

Result is `BLOCKED` when files contradict one another or an unverified technical claim is presented as confirmed.

## 6. Web readiness

Verify:

- title exists;
- summary exists;
- difficulty exists;
- estimated duration exists;
- classification exists;
- slug exists and follows lowercase kebab-case;
- route exists;
- cover-image disposition exists;
- publication status exists;
- publication status is consistent in all structured locations;
- discovery tags are safe for public display;
- no internal notes or private root-cause content appear in initial learner data;
- the web can distinguish static experience data from session state;
- only fields defined by the schema are required by the web;
- incomplete experiences cannot be marked `published`;
- only `published` is eligible for production listing.

Result is `BLOCKED` when required public metadata is absent, private content would leak, or publication state is invalid.

## Validation report

Record every check using:

```text
Check:
Result:
Evidence:
Required action:
```

The report must:

- identify the experience ID and schema profile;
- record one result for every required check;
- include file paths or field identifiers as evidence;
- state a concrete required action for every warning or block;
- state the global result;
- identify the technical reviewer when technical validation is complete;
- remain separate from `experience.yaml` so that validation history does not become experience content.

## Publication decision

Publication is permitted only when:

- the global validation result is `PASS`;
- `metadata.technical_validation.status` is `pass`;
- the experience and web publication states are `published`;
- all cross-file consistency checks pass;
- no required technical uncertainty remains unresolved.

`PASS_WITH_WARNINGS` permits continued review, preview, or correction. It does not permit production publication.
