# Fault Model — EXP-SIE-PN-001

## Purpose

This document defines the internal technical truth of the experience.

Learner-facing content must remain consistent with this model.

## Trigger

A short interruption affects the 24 VDC supply and causes the distributed I/O station to restart.

## Root cause

The remote station does not present the PROFINET device name expected by the controller configuration.

The controller can detect the physical interface at Ethernet level, but cannot associate it with the configured IO device.

## Propagation

```text
Power interruption
→ ET 200SP interface restarts
→ expected PROFINET identity unavailable
→ controller cannot assign configured station
→ station becomes not reachable
→ diagnostic event is raised
→ fault-handling strategy does not contain the escalation
→ production remains stopped
```

## Symptoms

### Process

- complete production stop;
- actuators unavailable;
- automatic cycle cannot start.

### Controller

- CPU not in normal operating state;
- active diagnostic indication;
- remote station shown as not reachable.

### Network

- other PROFINET devices remain available;
- affected interface is detectable by MAC;
- expected device name is missing or incorrect.

### Field

- interface has power;
- local status indicates a configuration or communication problem;
- no evidence yet of complete hardware failure.

## Vulnerability

The application does not implement or validate the required diagnostic handling to tolerate the station failure without escalation.

The precise role of OB86 must be verified for the target CPU, firmware, event, and hardware configuration.

## Cause versus vulnerability

- **Cause:** expected PROFINET identity is unavailable.
- **Vulnerability:** the controller program does not handle the diagnostic event robustly.
- **Consequence:** CPU and production remain stopped.

Adding a diagnostic OB without restoring identity does not repair the station.

Restoring identity without improving diagnostic handling may recover production but leave the system vulnerable to recurrence.

## Recovery conditions

Recovery is complete only when:

1. the station has the correct PROFINET name;
2. the controller assigns its configured parameters;
3. the station is accessible online;
4. the CPU has no critical active diagnostics;
5. the CPU is recovered in a controlled manner;
6. I/O and safety signals are validated;
7. drives and process sequence are functionally tested;
8. the event is documented.

## Prevention

- investigate why identity was lost;
- assess interface module health and remanence;
- verify 24 VDC quality;
- document device replacement and name-assignment procedures;
- review diagnostic OB strategy;
- create a tested controlled-restart procedure;
- maintain a verified project backup.

## Technical validation required

Before publication, verify against authoritative Siemens documentation:

- exact diagnostic buffer wording;
- exact CPU transition behavior;
- OB86 applicability;
- LED patterns of the selected ET 200SP interface;
- behavior of automatic device replacement, if configured;
- firmware-specific differences.
