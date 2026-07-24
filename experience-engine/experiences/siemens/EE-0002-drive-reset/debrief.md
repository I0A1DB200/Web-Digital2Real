# Debrief — Drive reset after emergency stop

## What happened

The emergency stop removed the conditions required for conveyor operation. Releasing the emergency-stop actuator did not complete the full functional recovery sequence. The PLC run command remained active, but the drive was still operationally inhibited, so the motor did not move.

The root cause was not the visible lack of movement and not the run command itself. It was the incomplete recovery and reset sequence that left the drive unable to act on the command.

## Why a run command does not guarantee movement

A run command expresses control intent. Movement occurs only when the complete chain permits it:

```text
run command
→ safety permission
→ functional drive enable
→ drive readiness
→ torque and motor response
→ machine movement
```

Each state must be observed independently. Treating them as one condition makes a plausible symptom look like a diagnosis.

## Separating control, safety, and drive state

The strongest reasoning sequence was:

1. preserve a controlled safe state;
2. confirm the command without assuming it is executed;
3. observe that the motor remains stationary;
4. establish that communication is still present;
5. inspect generic drive permission and readiness;
6. compare the observed state with the approved recovery procedure;
7. apply an authorized reset only after prerequisites are satisfied;
8. validate movement, repeatability, and safety behavior.

This sequence reduced uncertainty without requiring proprietary messages, codes, parameters, bits, or telegrams.

## Decisive evidence

The most important evidence was the combination of:

- an active run command;
- confirmed stationary motor and conveyor;
- no indicated communication loss;
- a drive that was not confirmed operationally ready;
- an incomplete recovery sequence;
- restored readiness after the authorized reset;
- expected movement during the controlled test.

No single observation carried the whole diagnosis. The causal agreement between control, drive, safety, and field evidence confirmed it.

## Likely reasoning errors

- Assuming the released emergency stop means the entire safety and recovery chain is complete.
- Assuming an active run command means the drive must produce movement.
- Prioritizing communication diagnosis despite evidence that communication is present.
- Treating lack of movement as proof of a mechanical blockage.
- Repeating start commands rather than testing the leading hypothesis.
- Declaring recovery complete after the first successful movement.

## Why indiscriminate resets degrade diagnosis

A reset changes system state. Applied without a hypothesis, prerequisites, authorization, and evidence capture, it can:

- remove useful diagnostic information;
- hide whether the original condition was understood;
- create an uncontrolled restart risk;
- restore operation temporarily without proving root cause;
- prevent a repeatable recovery procedure from being established.

Reset is therefore a controlled intervention, not a generic troubleshooting shortcut.

## Validating recovery

The machine is not ready for production merely because the drive reports ready or the conveyor moves once.

Complete recovery requires:

1. confirmed safety conditions;
2. authorized and correctly sequenced reset;
3. confirmed operational drive readiness;
4. controlled start;
5. expected motor and conveyor behavior;
6. controlled stop and restart validation;
7. applicable safety-function validation;
8. documented production handover.

## Prevention

Recurrence is reduced by making the recovery sequence explicit and showing these states independently:

- run command;
- safety state;
- drive enable;
- drive readiness;
- motor movement.

Operators and maintainers should be trained to collect evidence before resetting and to distinguish restored motion from validated recovery.

## Related Notebook areas

The following thematic areas would support this experience without duplicating their theory:

- PROFINET drive diagnostics;
- SINAMICS operating states;
- machine restart philosophy;
- functional safety reset principles;
- PLC–drive command and status separation.

These are proposed editorial topics. No Notebook link is asserted until an existing entry is verified.

## Technical-review note

The exact recovery sequence, drive-state terminology, and difficulty classification remain subject to human review. This experience must stay in `technical_review` and must not be published until the applicable authoritative sources and machine procedure have been confirmed.
