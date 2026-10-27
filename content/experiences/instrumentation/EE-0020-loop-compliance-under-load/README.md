# EE-0020 — Caída del lazo 4–20 mA bajo carga

ENV-002 Experience for locating a load-dependent electrical margin fault in a generic two-wire 4–20 mA instrumentation loop.

## Engineering case

The authored root cause is an excessive total loop burden or added resistance that reduces the voltage margin available to a two-wire transmitter when the normal load is connected. The process reference, local indication, transmitter electronics and engineering scaling remain correct.

The case is intentionally distinct from EE-0012 (stable current with incorrect scaling), EE-0017 (intermittent 4–20 mA continuity), EE-0018 (0–10 V common-reference noise) and EE-0019 (dynamic pressure-path restriction). EE-0020 teaches source, path, load and transmitter boundary measurements under load.

## Learner flow

preserve symptom -> compare process reference and local indication -> measure current and transmitter voltage under load -> compare source/path/load voltage budget -> inspect burden, wiring and polarity -> restore the loop under procedure -> verify low, mid and high points through the complete chain

## Visual and graph coherence

Seven learner-facing RGB PNGs use one generic installation: the same stainless vessel, blue two-wire transmitter, 24 VDC cabinet, terminal enclosure, analog input and test bench. No people or hands appear. Two digital multimeters provide the measurement context; an illustrative external commissioning-tool screen shows device state and voltage margin; controlled graphs show the load-dependent drop and multipoint recovery.

The graphs use didactic values and are evidence for the authored case, not production measurements, manufacturer limits or universal acceptance criteria. The software panel is an illustrative diagnostic view; installed device documentation remains authoritative.

## Media and governance

Assets are Experience-local, finished at 1672x941 RGB PNG. Photographs show the installation, authorized measurement context and corrected wiring without human subjects; diagrams show electrical boundaries, voltage budget and recovery. The installed loop isolation, test-point, polarity and modification procedures remain authoritative at the real site.

Status is `technical_review`; preview packaging is eligible with warnings. Before production, review the actual supply, burden, cable route, input module, test points and process-safety procedure.
