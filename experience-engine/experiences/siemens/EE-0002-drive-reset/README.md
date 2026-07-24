# Drive reset after emergency stop

**Experience ID:** `EXP-SIEMENS-DRIVE-002`

**Source Brief:** `EE-0002`

**Model:** Experience Engine 2.0

**Status:** Technical review

**Validation:** Pass with warnings

## Purpose

This experience trains evidence-based diagnosis when an infeed conveyor does not restart after an emergency-stop release even though its run command is active.

It focuses on the distinction between control intent and physical execution. The learner must correlate the safety state, functional drive permission, drive readiness, and motor movement before applying a controlled recovery.

## Scenario

An emergency stop interrupted a packaging infeed conveyor. The device has been physically released, no communication loss is known, and the PLC run command remains active. The motor does not move.

The learner acts as the automation engineer responsible for safe diagnosis, controlled recovery, validation, and handover.

## Platform

- Siemens S7-1500
- SINAMICS G120
- WinCC Unified
- Packaging infeed conveyor

These products define the scenario context. The experience deliberately avoids unverified proprietary states, alarms, parameters, bits, fault codes, telegrams, and reset details.

## Competencies

- Drive diagnostics
- PLC–drive state interpretation
- Basic functional safety awareness
- Restart and reset reasoning
- Evidence-based troubleshooting
- Controlled recovery

## Learning objectives

The learner must:

1. distinguish a run command from safety permission, drive enablement, drive readiness, and movement;
2. isolate an incomplete recovery sequence through progressive evidence;
3. perform an authorized reset and validate a controlled return to operation.

## Scope

The experience contains seven stages covering incident stabilization, command correlation, drive-state inspection, hypothesis testing, authorized reset, controlled start, and recovery validation.

The package does not define an exact manufacturer-specific reset sequence. It requires the approved machine procedure and authoritative documentation to supply those details during technical review.

## Package structure

- [`experience.yaml`](experience.yaml) — canonical structured source of truth.
- [`fault-model.md`](fault-model.md) — human review of the causal model and uncertainty.
- [`decision-tree.md`](decision-tree.md) — diagnostic paths, safety gates, and completion logic.
- [`debrief.md`](debrief.md) — reasoning-centered learner closure.

## Validation status

The generated package is structurally intended for Experience Engine 2.0 and remains in `technical_review`.

The expected result is `PASS_WITH_WARNINGS` because:

- the Brief declares difficulty as unknown;
- the installed reset sequence has not been verified;
- exact manufacturer-specific operating-state terminology has not been confirmed.

Publication is not permitted until technical review resolves the applicable warnings and the official publication gate is satisfied.

## Technical limitations

- No vendor-specific alarm or fault code is asserted.
- No parameter, control bit, telegram, or proprietary sequence is defined.
- Notebook references are proposed thematic areas, not invented links.
- Recovery wording remains functional until authoritative machine and drive documentation is reviewed.
