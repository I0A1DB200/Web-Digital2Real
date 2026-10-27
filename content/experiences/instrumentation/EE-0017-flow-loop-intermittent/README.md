# EE-0017 — Señal de caudal intermitente en el lazo 4–20 mA

ENV-002 Experience for locating an intermittent field-loop fault while process flow and the transmitter remain stable.

## Engineering case

The authored root cause is an intermittent high-resistance field-terminal contact in a generic 4–20 mA loop. The process reference, local transmitter indication, transmitter output and engineering scaling remain correct; the signal becomes unstable between the transmitter boundary and the analog-input boundary.

The case is intentionally distinct from EE-0012: EE-0012 teaches a stable current with incorrect PLC scaling, while EE-0017 teaches boundary measurement and physical loop integrity. It is vendor-neutral and does not assert a particular transmitter, input module, terminal family, supply arrangement or plant procedure.

## Learner flow

preserve symptom -> compare independent reference -> measure both loop boundaries -> inspect terminal -> reterminate under procedure -> verify representative multipoint flow

## Media and governance

Seven learner-facing RGB PNGs are included. Photographs show the flow station, incident, authorized measurement and retermination; diagrams show boundary comparison, intermittent terminal behavior and multipoint verification. Assets are illustrative, contain no EE/ENV identifier or manufacturer claim, and do not replace the authored evidence.

Status is technical_review; preview packaging is eligible with warnings. Before production, review the installed loop isolation method, test points, terminal requirements and process-safety procedure.
