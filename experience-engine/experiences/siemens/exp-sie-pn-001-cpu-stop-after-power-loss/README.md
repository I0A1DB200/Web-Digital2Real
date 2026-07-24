# EXP-SIE-PN-001 — CPU STOP after power loss

## Summary

A Siemens S7-1500-controlled production line remains stopped after a short power interruption.

The learner must diagnose the relationship between:

- a missing PROFINET remote I/O station;
- the controller diagnostic response;
- a missing fault-handling organization block;
- the difference between cause, consequence, and vulnerability.

## Learning objective

Train the learner to prioritize evidence-based, non-invasive diagnosis before restarting, downloading, or replacing hardware.

## Scope

- Siemens S7-1500
- ET 200SP
- PROFINET
- TIA Portal online diagnostics
- diagnostic buffer
- device identity
- OB86 fault handling
- controlled recovery

## Difficulty

Intermediate.

## Intended learner

Automation technicians, maintenance engineers, and PLC programmers with basic TIA Portal and PROFINET knowledge.

## Experience flow

```text
CPU in STOP
  ↓
Diagnostic buffer
  ↓
Identify unreachable station
  ↓
Inspect PROFINET identity
  ↓
Restore device name
  ↓
Recover controller
  ↓
Validate I/O and process
  ↓
Prevent recurrence
```

## Files

- `experience.yaml` — structured source of truth
- `fault-model.md` — internal technical model
- `decision-tree.md` — decisions, branches, and consequences
- `debrief.md` — technical and pedagogical closure

## Important technical note

The exact behavior of a Siemens CPU when a diagnostic OB is absent depends on the event type, CPU family, configuration, firmware, and program.

This reference experience therefore treats the missing OB86 as an escalation vulnerability that must be validated against the target hardware and Siemens documentation before production publication.
