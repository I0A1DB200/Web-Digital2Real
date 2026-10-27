# EE-0021 — Secuencia perdida tras un reinicio

ENV-003 Experience for diagnosing a guarded assembly cell whose HMI appears available after a controlled restart while the physical workpiece and PLC sequence state no longer agree.

## Engineering case

The authored root cause is a startup path that reinitializes non-retained sequence context without an explicit transition to a known safe state. The workpiece remains in the transfer zone, the PLC active-step context returns to its initial value and the HMI availability representation is insufficient to authorize motion.

The case is vendor-neutral. It does not claim a particular CPU, memory address, retentive setting, safety controller, HMI runtime or restart standard. Those details must be checked against the installed architecture before production use.

## Learner flow

preserve safe hold -> verify permissives -> compare HMI / PLC / startup event / physical position -> confirm retention policy -> recover known state -> dry-cycle and controlled-restart verification

Completion requires a dry cycle and a subsequent controlled restart that remains inhibited until a known state is confirmed. Restart alone is never treated as proof of diagnosis or recovery.

## Media and governance

Seven learner-facing PNGs are included. Photographs show the cell, incident and authorized recovery; controlled diagrams show the safe hold, state ownership, startup retention and verification relationship. Assets are illustrative, contain no EE/ENV identifier or manufacturer claim, and do not replace the authored evidence.

Status is technical_review; preview packaging is eligible with warnings. Before production, review the installed PLC startup routine, retention policy, safety architecture, workpiece recovery procedure and handover requirements.
