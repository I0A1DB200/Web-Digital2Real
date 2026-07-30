# Debrief — EXP-SIE-PN-001

## Root cause

The remote ET 200SP station did not present the PROFINET device name expected by the Siemens controller configuration.

The device was physically present at Ethernet level, but the controller could not associate it with the configured IO device.

## Causal chain

```text
Microcorte
→ reinicio de la estación
→ identidad PROFINET esperada no disponible
→ estación no asignada por la CPU
→ fallo de periferia
→ estrategia diagnóstica insuficiente
→ CPU y producción detenidas
```

## Cause, consequence, and vulnerability

### Cause

Missing or incorrect PROFINET device identity.

### Consequence

The remote station is unavailable to the controller and the process cannot operate.

### Vulnerability

The program's diagnostic handling does not prevent the event from escalating into a complete production stop.

This distinction is central.

A diagnostic OB can improve resilience, but it does not restore a missing device identity.

## Strongest diagnostic decisions

### 1. Read the diagnostic buffer first

This preserved evidence and identified the relevant failure domain.

### 2. Identify the exact unreachable station

This avoided unnecessary plant-wide troubleshooting.

### 3. Compare MAC, IP, and PROFINET name

This distinguished:

- device physically absent;
- device powered but not configured;
- incorrect IP;
- incorrect identity;
- complete hardware failure.

### 4. Restore identity before modifying the program

This corrected the immediate technical cause.

### 5. Validate after RUN

A CPU in RUN is not sufficient evidence that the plant is safe or functional.

## Weak decisions

### Repeated restart

Repeating the initiating event does not reduce uncertainty.

### Full download

Downloading software without evidence introduces configuration risk and may obscure the original failure.

### Immediate hardware replacement

A replacement interface can require the same commissioning steps and does not prove the removed module was defective.

### Assigning only the IP address

This may appear logical, but it does not necessarily satisfy the configured PROFINET identity.

### Adding OB86 as the immediate repair

This addresses fault tolerance, not the station identity.

## Reusable troubleshooting pattern

```text
Preserve evidence
→ identify fault domain
→ locate affected device
→ determine physical presence
→ verify logical identity
→ correct the immediate cause
→ recover in a controlled way
→ validate function and safety
→ prevent recurrence
```

This pattern applies beyond Siemens and PROFINET.

It can be reused for:

- EtherNet/IP adapter identity;
- distributed I/O configuration;
- drive node replacement;
- fieldbus address conflicts;
- SCADA communication endpoints;
- safety-device replacement.

## Prevention

- verify the condition and remanence of the interface module;
- investigate 24 VDC quality;
- review PROFINET replacement procedures;
- document device names and topology;
- verify diagnostic OB coverage;
- test degraded modes;
- define controlled restart acceptance criteria;
- retain verified project backups.

## Notebook knowledge to create or reference

- PROFINET device identity
- Siemens diagnostic buffer methodology
- Siemens diagnostic organization blocks
- ET 200SP commissioning and replacement
- Controlled restart after automation faults

## Technical review note

Before this experience is marked `approved`, validate the CPU STOP behavior and exact OB86 relationship against the selected S7-1500 CPU, firmware, hardware configuration, and Siemens documentation.
