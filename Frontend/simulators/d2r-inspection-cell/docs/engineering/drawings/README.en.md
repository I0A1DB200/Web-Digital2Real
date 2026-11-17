# 02 · Engineering drawings · Revision B approved

D2R approved Revision B for conceptual teaching use. The sheets relate the mechanical route, simulator sequence, Watch tags, and utilities. Open physical decisions are identified as pending definition, selection, or calculation; addresses, component models, and sizing values have not been invented. This review does not release the designs for manufacturing, wiring, or installation.

| Drawing | Useful content | Coordinated document |
| --- | --- | --- |
| [M-02-001 · Layout and sequence](M-02-001-layout-conceptual.svg) | Cell layout, part route, A/B destinations, model references, and current feed, inspection, and sorting phases/timings. | 01 · Functional specification |
| [E-02-001 · Power and I/O interfaces](E-02-001-arquitectura-electrica-conceptual.svg) | Power branches, the seven DI and four DO with their functions, PLC, vision, HMI, gateway/database, and Safety boundary. | 03 · Components, hardware, and I/O map |
| [P-02-001 · Pneumatics and actuators](P-02-001-circuito-neumatico-conceptual.svg) | Supply → filter/regulator → service isolation → manifold; signals and phases for both actuators. | 02 · Mechanical, electrical, and pneumatic design |

## Interface decision still open

In the simulator, `DO_PusherValve` stays at 1 during both `DISCHARGE` (push) and `PUSH_RETRACT` (return), although the graphical actuator reverses direction. This tag alone does not define the command for a real valve. Before selecting a valve or mapping outputs, decide how extend and retract are commanded and which physical confirmations are required. The sheets record this discrepancy; simulator logic and timings were not changed.

## Basis and open work

- **Teaching assumptions:** 24 VDC control and dry filtered air at a nominal 6 bar. Pressure has not been measured; loads and consumption have not been calculated.
- **Graphical references:** HTML coordinates and travel. They are not workshop dimensions or verified measurements.
- **Hardware pending:** site AC supply, CPU/modules, field devices, drive, camera, actuators, valves, terminals, protection, and addresses.
- **Calculation/validation pending:** loads, forces, strokes, flow, stability, tolerances, wiring, and physical tests.
- **Safety:** architecture and response to loss of power/air remain subject to risk assessment; `SafetyReady` is still a simulated signal.

## Drawing checks

The sheets were rendered with Inkscape and visually checked for text fit. All three SVG files pass XML parsing, and their links from documents 02 ES/EN resolve. No CAD work, calculations, hardware testing, or Safety validation was performed.
