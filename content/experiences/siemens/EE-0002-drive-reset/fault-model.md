# Fault model — Drive reset after emergency stop

**Experience:** `EXP-SIEMENS-DRIVE-002`

**Source Brief:** `EE-0002`

**Review state:** Technical review

## Initial event

An emergency stop interrupts the packaging infeed conveyor and removes the conditions required for drive operation.

## Failure

After physical release of the emergency stop, the drive remains operationally inhibited because the required recovery and reset sequence has not been completed correctly.

This statement is functional. It does not assert an undocumented Siemens state, message, parameter, bit, or reset implementation.

## Causal propagation

```text
Emergency stop
→ torque removal or operational drive inhibition
→ physical emergency-stop release
→ incomplete recovery prerequisites
→ PLC start command remains active
→ drive is not operationally enabled and ready
→ motor and conveyor do not move
```

## State separation

The diagnosis depends on keeping five observations distinct:

| State | Meaning | What it does not prove |
|---|---|---|
| Start command | The controller requests conveyor operation. | It does not prove permission, readiness, or movement. |
| Safety state | Applicable safety conditions permit the next authorized action. | Physical release alone does not prove complete recovery. |
| Drive enable | Functional permission for the drive to act is present. | It does not by itself prove readiness or motion. |
| Drive readiness | The drive is operationally prepared for a controlled start. | It does not prove that the motor has moved correctly. |
| Motor movement | The commanded physical result occurs. | One movement does not prove repeatability or complete safety validation. |

## Symptoms

- The conveyor does not restart after emergency-stop release.
- The run command is active.
- The motor remains stationary.
- No communication loss is known.

These are observations. None is the root cause by itself.

## Consequences

- Packaging infeed remains unavailable.
- Repeated start commands do not correct an incomplete recovery sequence.
- Indiscriminate resets may remove useful evidence or create uncontrolled movement risk.

## Root cause

The drive remains inhibited because the post-emergency-stop recovery and reset sequence has not been completed correctly.

The decisive evidence is the combination of:

1. active run command;
2. confirmed lack of movement;
3. communication still present;
4. drive not confirmed operationally ready;
5. procedure comparison showing incomplete recovery;
6. readiness restored after the authorized reset.

## Recovery

Recovery must preserve this order:

1. establish the controlled safe state;
2. confirm physical emergency-stop release and applicable safety-chain conditions;
3. confirm functional drive permission and readiness prerequisites;
4. obtain authorization for the reset and controlled test;
5. execute the reset defined by the validated machine procedure;
6. confirm the drive becomes operationally ready;
7. perform a controlled start with the hazardous area clear;
8. validate stop, recovery, restart, and safety behavior before handover.

Restart is evidence of partial recovery, not completion.

## Prevention

- Document the approved recovery sequence.
- Present command, safety, enable, readiness, and movement separately.
- Use functional operational messages that do not promote symptoms to causes.
- Train personnel to preserve evidence before resetting.
- Include controlled restart and safety checks in recovery procedures.

## Uncertainties requiring review

### `UNC-DIFFICULTY`

The Brief provides `unknown` difficulty. `intermediate` is a generated editorial classification and requires pedagogical confirmation.

### `UNC-RESET-SEQUENCE`

The exact reset and recovery sequence for the installed configuration is absent. Technical review must use approved machine documentation and authoritative manufacturer documentation.

### `UNC-DRIVE-STATE`

Exact state names, indications, timing, and diagnostics are not asserted. They require verification for the installed drive configuration before publication.
