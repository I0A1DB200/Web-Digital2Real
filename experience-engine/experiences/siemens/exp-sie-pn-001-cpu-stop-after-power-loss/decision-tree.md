# Decision Tree — EXP-SIE-PN-001

## Main path

```text
S1 Initial assessment
├── Read diagnostic buffer ───────────────→ S2
├── Force RUN ────────────────────────────→ S1
├── Full download ────────────────────────→ S1 with increased risk
└── Power cycle ──────────────────────────→ S1

S2 Identify affected station
├── Accessible devices + identity check ─→ S3
├── Replace interface ────────────────────→ S2
└── Assign IP only ───────────────────────→ S3 with incomplete result

S3 Restore identity
├── Assign expected PROFINET name ───────→ S4
└── Download OB86 only ───────────────────→ S3

S4 Controlled recovery
└── Review diagnostics and recover RUN ──→ S5

S5 Validation
└── Validate safety, I/O and process ─────→ COMPLETE
```

## Decision design

### S1 — Initial assessment

#### Strong decision: read diagnostic buffer

Why it is strong:

- preserves evidence;
- does not change plant state;
- identifies the transition trigger;
- narrows the fault domain.

#### Weak decision: force RUN

Why it is weak:

- acts on state rather than cause;
- may temporarily mask the event;
- may reproduce the fault;
- does not demonstrate recovery.

#### Unsafe decision: full project download

Why it is unsafe:

- invasive;
- unsupported by evidence;
- may change validated software;
- may destroy diagnostic context;
- increases commissioning risk.

### S2 — Identify the station

#### Strong decision: inspect accessible devices

Diagnostic value:

- separates missing power from missing configuration;
- confirms Ethernet presence;
- reveals MAC, IP, and name;
- weakens the hardware-failure hypothesis.

#### Plausible incomplete decision: assign IP only

This option is deliberately credible.

The learner may know the expected IP but fail to recognize that PROFINET controller assignment depends on device identity.

Consequence:

- network reachability may change;
- configured station still does not integrate as expected;
- the learner must revise the hypothesis.

#### Weak decision: replace hardware

The replacement may create the same requirement:

- the new module still requires correct identity and commissioning.

### S3 — Restore identity

#### Strong decision: assign the expected PROFINET name

This action directly corrects the immediate cause.

The learner must still confirm:

- station assignment;
- module status;
- active diagnostics;
- safe recovery.

#### Weak decision: add OB86 first

This addresses robustness, not the missing station identity.

It may be a valid later engineering improvement, but it is not the immediate repair.

### S4 — Controlled recovery

Strong sequence:

1. confirm station reachable;
2. inspect active diagnostics;
3. confirm safe plant state;
4. recover CPU;
5. observe for recurring events;
6. proceed to functional validation.

### S5 — Validation

Required checks:

- safety circuit status;
- distributed input plausibility;
- output inhibition and control;
- drive availability;
- HMI alarms;
- manual mode;
- controlled automatic cycle;
- production handover.

## Scoring principle

The score should reward:

- evidence preservation;
- uncertainty reduction;
- low-risk actions;
- causal reasoning;
- validation.

The score should penalize:

- invasive action without evidence;
- replacing parts without diagnosis;
- confusing symptom and cause;
- skipping safety;
- declaring success at RUN without functional checks.
