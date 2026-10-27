# EE-0018 — Nivel inestable por referencia común 0–10 V

ENV-002 Experience for diagnosing an oscillating level representation while the process and local transmitter remain stable.

## Engineering case

The authored root cause is an installation-specific common-reference or screen termination that allows a nearby switching load to disturb a 0–10 V analog input. The level, local transmitter indication and engineering scaling remain correct. The case does not prescribe a universal grounding or shielding rule; the installed architecture and procedure remain authoritative.

The case extends ENV-002 beyond EE-0012 and EE-0017: EE-0012 covers stable 4–20 mA current with wrong scaling, and EE-0017 covers physical continuity in a 4–20 mA loop. EE-0018 teaches reference-dependent 0–10 V diagnosis and noise localization.

## Learner flow

preserve symptom -> compare independent reference -> measure voltage and reference boundaries -> inspect common reference / screen and nearby load -> restore according to the installation method -> verify multipoint level with representative switching

## Media and governance

Seven learner-facing RGB PNGs are included. Photographs show the level station, incident, authorized measurement and correction; diagrams show boundary comparison, reference/noise coupling and multipoint verification. Assets are illustrative, contain no EE/ENV identifier or manufacturer claim, and do not replace authored evidence.

Status is technical_review; preview packaging is eligible with warnings. Before production, review the installed 0 V and screen architecture, test points and process-safety procedure.
