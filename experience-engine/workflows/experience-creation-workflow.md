# Experience Creation Workflow

**Status:** Official  
**Owner:** Digital2Real Architect

## Purpose

This workflow converts an industrial problem into a reusable diagnostic learning experience.

## Workflow

```text
Competency
  ↓
Scenario
  ↓
Fault model
  ↓
Causal chain
  ↓
Evidence model
  ↓
Decision tree
  ↓
Recovery
  ↓
Debrief
  ↓
Technical validation
  ↓
Publication
```

## 1. Define the competency

State what engineering capability the learner must demonstrate.

Good examples:

- interpret a Siemens diagnostic buffer;
- distinguish a communication fault from failed hardware;
- prioritize non-invasive PROFINET checks;
- identify escalation caused by a missing diagnostic OB;
- validate recovery before production release.

Avoid broad objectives such as “learn Siemens PLCs”.

## 2. Define the industrial context

Document only the context required for reasoning:

- industry;
- process;
- machine or line;
- controller;
- network;
- distributed I/O;
- drives;
- HMI or SCADA;
- production state;
- business impact;
- intervention constraints.

## 3. Build the fault model

Define privately:

- initiating event;
- root cause;
- propagation;
- symptoms;
- contributing vulnerability;
- safe recovery action;
- validation criteria;
- preventive action.

Do not write learner-facing content before this is coherent.

## 4. Build the causal chain

Express the fault as a sequence:

```text
Trigger
→ technical failure
→ loss of function
→ controller response
→ operational consequence
```

Check that each transition is physically or logically plausible.

## 5. Define initial observations

Show only information available without intervention:

- machine state;
- visible LEDs;
- operator report;
- HMI alarms;
- process symptoms;
- recent events.

Do not reveal the root cause.

## 6. Define diagnostic stages

Typical stages:

1. situation assessment;
2. PLC diagnostics;
3. network diagnostics;
4. field inspection;
5. corrective action;
6. restart;
7. validation;
8. prevention.

Each stage must have a purpose.

## 7. Design evidence

For every available action, define:

- evidence revealed;
- reliability of the evidence;
- diagnostic value;
- hypotheses strengthened;
- hypotheses weakened;
- time cost;
- operational risk.

## 8. Design decisions

Each decision must include:

- action;
- rationale;
- consequence;
- next stage;
- feedback;
- score effect;
- safety effect.

At least one option should be the strongest engineering action.

Other options should remain credible.

## 9. Design recovery

Recovery must distinguish:

- correcting the immediate failure;
- restoring controller state;
- validating I/O;
- validating safety;
- performing controlled restart;
- confirming process function;
- handing back to production.

## 10. Write the debrief

The debrief must contain:

- root cause;
- causal chain;
- strongest decisions;
- weak decisions;
- evidence hierarchy;
- reusable troubleshooting pattern;
- prevention;
- Notebook references.

## 11. Validate technically

Review:

- PLC behavior;
- I/O behavior;
- network behavior;
- LED states;
- diagnostic messages;
- timing;
- recovery procedure;
- safety implications;
- terminology.

Do not publish unverified vendor-specific claims.

## 12. Validate pedagogically

Confirm that the experience:

- trains reasoning rather than recall;
- does not reveal the solution too early;
- uses credible alternatives;
- rewards evidence-based decisions;
- explains why decisions are strong or weak;
- extracts a transferable method.

## 13. Publication gate

An experience can be published only when:

- `experience.yaml` validates against the schema;
- all Markdown files agree with the YAML;
- the complete correct path is playable;
- at least one incorrect path has been reviewed;
- the debrief is complete;
- technical uncertainty is documented.
