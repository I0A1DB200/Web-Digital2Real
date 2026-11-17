# 02 · Mechanical, electrical, and pneumatic design

**Version:** 0.3 · teaching design concept; physical validation pending
**Status:** technical concept open for closure · M/E/P Revision B sheets accepted by D2R for conceptual teaching use
**Objective:** translate the functional sequence into a coordinated layout, mechanisms, electrical interfaces, pneumatics, and design checks.

> This document defines an engineering baseline for the exercise, not a released design for manufacture. HTML geometry is a visual representation, not verified-scale CAD, structural calculation, electrical/pneumatic schematic, or Safety validation.

## 1. Design basis and limits

| Approved case input | Teaching baseline | What is still needed for physical design |
| --- | --- | --- |
| Product | Aluminum plate, 52 × 38 × 13.5 mm, four peripheral Ø5.0 mm through-holes and one central Ø8.8 mm hole. | Real drawing, mass, alloy, hole positions/tolerances, and boundary samples. These dimensions were not measured from the 3D model. |
| Inspection | Detect missing or visibly obstructed holes; no metrology. | Camera, optics, lighting, field of view, and validation on representative parts. |
| Handling | Manual magazine up to 7 parts; A/B bins of 25 parts. | Access, replenishment, empty-magazine detection, full-bin detection/handling. |
| Production | 5 parts/minute steady-state target; one 8-hour shift, 5 days/week. | Belt speed, part spacing, camera time, and equipment capacity tests. |
| Utilities | 24 VDC control and dry filtered air at 6 bar as exercise values. | Site AC supply, loads, current, pressure/flow at point of use, and calculations. |
| Environment | Indoor, 10–35 °C, no pressure washing. | Dust, humidity, IP, vibration, and actual site conditions. |
| Operation | `OK → A` via side pusher; `NOK → B` at belt end. STOP finishes the active part. | Physical exit confirmation and jam/recovery policy. |

These choices are teaching assumptions approved to organize the project; they are not customer data or manufacturing conditions. Keep HTML visuals, validated functional requirements, and pending physical engineering distinct.

### Document scope

- Defines conceptual layout, mechanical interfaces, and the inputs/loads needed to size each assembly.
- Defines high-level electrical and pneumatic architecture; it does not select models, part numbers, PLC addresses, or final protection devices.
- Keeps signal names from specification 01 as the reference interface; I/O inventory and selection are detailed in document 03.
- Leaves Safety as an independent discipline subject to competent risk assessment and validation in document 04.
- Does not change sequence, timings, signals, counters, classification, HTML, or the conceptual Safety model.

## 2. Functional cell layout

| Area | Function | Mechanical concept | Interfaces to coordinate |
| --- | --- | --- | --- |
| Feeder | Separate and present one part at a time. | Open single-stack magazine; bottom pusher; manual replenishment. | Part envelope/tolerances, part-available detection, guidance, and reload access. |
| Infeed conveyor | Carry the part to the camera and then to sorting. | Guided belt with continuous support plane and repeatable stop zones. | Drive, sensor mounts, inspection position, and trigger timing. |
| Inspection | Acquire an image with the part stationary. | Overhead camera bracket/gantry with controlled lighting. | Working distance, field of view, repeatability, vibration, cables, and camera network. |
| Output A | Remove OK result by side contact. | Moving plate, cylinder/pusher axis, and bridge to a downward ramp. | Clearance, force, stroke, A confirmation, bin, and maintenance access. |
| Output B | Discharge NOK at the end of the conveyor. | Terminal section transferring to bin B. | Exit detection, capacity, accumulation, bin change, and spill prevention. |
| Cabinet | House selected PLC, power supply, and distribution components. | Visual reference beside feeder; final position to be decided. | Access, heat dissipation, bend radii, EMC, safe maintenance, and field routing. |

No connection to another line is assumed. The operator manually loads parts and collects bins. Replenishment timing/conditions, overflow prevention, and whether a bin may be changed while the cell runs remain detailed-design decisions; no empty/full sensors are defined.

### Validated concept sheets

The revised sheets connect layout and sequence, Watch tags, power distribution, and actuator interfaces: [M-02-001 · layout and sequence](drawings/M-02-001-layout-conceptual.svg), [E-02-001 · power and I/O interfaces](drawings/E-02-001-arquitectura-electrica-conceptual.svg), and [P-02-001 · functional pneumatic circuit and actuator signals](drawings/P-02-001-circuito-neumatico-conceptual.svg). The [drawing register](drawings/README.md) lists unresolved design inputs. Review exposed an interface gap: `DO_PusherValve` is active during both `DISCHARGE` and `PUSH_RETRACT`, so the current tag alone does not define physical extend and retract commands. The sequence and Safety were not changed.

## 3. Mechanical concept

### 3.1 Assemblies and design criteria

| Assembly | Design function | Physical criteria to calculate or confirm |
| --- | --- | --- |
| Gravity magazine | Retain up to seven parts and expose the bottom part. | Guide clearance, tolerances/variation, total mass, stability, stack retention, manual load, jams, and empty detection. |
| Feed pusher | Extract only the bottom part and place it at the belt start. | Linear guidance, rear support, stiffness, force, stroke, speed, stops, wear, and prevention of double feeding. |
| Conveyor | Transport and stop each part at repeatable positions. | Length/width, speed/acceleration, tension, tracking, drive, support, friction, noise, and 5 parts/min capacity. |
| Vision station | Present the inspected face in a stable pose. | Rigid mount, field of view for the plate, focal distance, depth of field, lighting, glare control, and adjustment access. |
| A pusher | Contact the edge of an OK part, move it outside the belt plane, and return without dragging it. | Clear path, contact surface, stiffness, force, guidance, stroke, stops, cushioning, jam handling, and controlled drop. |
| Ramp/bin A | Receive and accumulate OK parts without rebound or blockage. | Angle/material to test, drop, friction, guides, height, and stability of 25-part bin. |
| Output B | Carry and collect NOK at the belt end. | Terminal transfer, drop height, retention, stopping distance, accumulation, and bin change. |
| Supports/cabinet | Maintain geometry and access across the assembly. | Stiffness, leveling, anchoring, vibration, wiring access, door opening, and maintenance. |

Cylinder force, profile sections, motor, belt, bearings, valves, and cushions are not selected here; they depend on mass, friction, rate, final geometry, and risk assessment inputs that are not yet available.

### 3.2 Visual-model references

These references describe the HTML for reading its animation. Do not directly convert them into shop dimensions: the model has no validated CAD scale, tolerances, or load calculations.

| Visual reference | Value in HTML | Meaning and limitation |
| --- | --- | --- |
| Feeder group and axis | Group `x=-2.98`; local axis `x=-1.02` (approximately world `x=-4`). | Visual location relative to the belt. |
| Graphical part | `0.52 × 0.135 × 0.38`; five simulated holes. | Approximately matches the teaching plate proportion; not measured or tolerance-defined. |
| Magazine | Four open guides; vertical pitch `0.135`; one bottom part and up to six above. | Kinematic stack drop after extraction; no physical gravity simulation. |
| Feed-pusher travel | Graphical `1.0`, part moves from `x=-4` to `x=-3`. | Not a selected cylinder stroke. |
| Belt level | Top face `y=1.2925`; bed center `y=1.13`, height `0.215`; belt center `y=1.265`, height `0.055`. | Visual alignment of part underside and belt. |
| Rollers and guides | End rollers center `y=1.13`, radius `0.16`; guides around `y=1.31`. | No physical shafts, tension, containment, or tolerances. |
| Output-A cylinder body | Local center `(0,1.385,2.20)`, length `1.80`, radius `0.13`; Z axis. | Body and end caps fixed in `sort` group; mouth about `z=1.30`, rear about `z=3.10`. |
| Output-A pusher plate | Center `(0,1.385,0.80)`, size `0.59 × 0.16 × 0.075`. | Contact face at rest `z=0.7625`, outside belt edge `z=0.55`; bottom edge `y=1.305`. |
| Output-A travel | `1.48` in the model. | Rod follows carriage; not pneumatic sizing. |
| Output-A bridge/ramp | Bridge top `y=1.2925` to local `z≈-0.7175`; ramp width `0.88`, end `z≈-2.25`, drop `0.54`. | Visual path; drop, friction, rebound, and accumulation need design/test. |

### 3.3 Represented kinematics, not sizing

- **Feeding:** within simulator `FEED` (0.8 s), the carriage advances during normalized time 0–0.45, returns 0.45–0.75, waits to 0.78, then animates the stack drop to the end. The tongue supports the stack during advance and withdraws before the drop. One bottom part travels to the belt; upper parts do not travel with the pusher.
- **OK pusher:** sort group is at `x=1.25`. In `SORT_STOP` the part is centered; in `DISCHARGE` the plate approaches and moves it by contact; in `PUSH_RETRACT` it tips and follows the ramp while the rod retracts. NOK follows the belt to B with the pusher retracted.
- These paths do not calculate force, air, gravity, friction, stopping time, deformation, or risk. They are retained to explain sequence, not as physical-engineering results.

## 4. Electrical and control concept

### 4.1 Functional architecture

```text
Site AC supply (voltage and phases to be confirmed)
   ├─> protection and power distribution (to size)
   └─> 24 VDC supply (loads and margin to calculate)
         ├─> proposed Siemens S7-1200 PLC / local HMI
         ├─> discrete sensors and valves through selected interfaces
         └─> Cognex camera (Trigger/handshake via I/O or Ethernet, interface to be defined)

PLC ──> conveyor drive interface (type/model to be selected)
PLC ──> feeder valve and pusher valve (selection pending)
Camera ──> result/diagnostics ──> PLC ──> external DB gateway/service
Safety ──> independent functions defined by risk assessment
```

The architecture reflects REQ-008/009/010 boundaries; it does not claim equipment is connected. The PLC application is not proposed as a direct SQL client: traceability connects through an external gateway/service to be defined. Camera and data protocols are not fixed before model selection in document 03.

### 4.2 Electrical design rules

- The control assumption is 24 VDC. AC input voltage/phases, available current, and drive power must be confirmed at the site and by load calculations.
- Identify and segregate field signals, motor power, communications, and Safety circuits according to selected equipment and applicable regulations.
- Calculate power supply, protection, short-circuit withstand, voltage drop, wiring, terminals, grounding, EMC, cabinet heat dissipation, and thermal margin; do not assign ratings without nameplate data.
- Design disconnect, isolation, identification, and service access; Safety circuits and boundaries are defined in document 04, not by Watch or `SafetyReady`.
- Maintain one master tag list. `DI_*`, `DO_*`, `Vision*`, and `DB_*` in documents 01/03 are conceptual names, not physical addresses or an approved schematic.
- Decide whether `DO_VisionTrigger` is a discrete output or a network command. The minimum handshake is in 00/01; types, diagnostics, network, terminals, and memory are closed with the selected camera model.

### 4.3 Cabinet and wiring

The cabinet's graphical location beside the feeder is retained as a visual reference. The physical layout must check door opening, heat dissipation, vibration/dust exposure, spare space, cable entries, bend radii, cable lengths to camera/motor/valves, and maintenance access. Power, control, network, terminal, and cable drawings follow confirmation of equipment and layout.

## 5. Pneumatic concept

The exercise baseline is dry filtered air at nominal 6 bar; no supply point has been measured. Graphical consumers are the feeder actuator and side pusher A. Pressure under demand, air quality, flow, cycle, pressure drop, and consumption must be checked against component data.

| Functional circuit | Function | Sizing inputs required | Current status |
| --- | --- | --- | --- |
| Feeder | Extend/retract bottom-part pusher and release one part. | Forward/return force, stroke, speed, stacked mass, friction, stiffness, cycles, and confirmation. | Graphical kinematics only; model not selected. |
| Pusher A | Push OK part off belt and return. | Contact force, stroke, side load, guidance, speed, cushioning, cycles/minute, and end detection. | Graphical stroke `1.48`; not a physical selection. |
| Preparation/isolation | Filter/regulate and isolate supply for maintenance as designed. | Simultaneous flow, minimum pressure, required quality, and energy-dump strategy. | Components and final state to be defined with hardware and risk assessment. |

The air schematic must show supply, preparation, isolation, valves, exhaust, actuators, ports, sensors, and references. The state on loss of power or air is not decided here: it depends on risk assessment, load gravity, and Safety validation. No valve position or safe state is inferred from the graphics.

## 6. Cross-discipline interfaces

| Interface | Information to agree | Verifiable handoff |
| --- | --- | --- |
| Part ↔ feeder | Part drawing/variation, mass, orientation, friction, and tolerances. | Envelope and feed conditions reviewed by process/mechanical engineering. |
| Belt ↔ camera station | Pose, repeatable stop, vibration, image window, and light clearance. | Station drawing and mechanical/optical requirements coordinated. |
| PLC ↔ drive | Command type, status, speed, diagnostics, and fault response. | Control interface and data sheets confirmed; no direct PLC output to motor power. |
| PLC ↔ Cognex | Trigger, ready/busy/done/valid/result/ack, job, and timeout. | Versioned interface table with owner and selected protocol. |
| PLC ↔ gateway/DB | Part identity, result/output record, persistence, and disconnection. | Data contract and fault policy approved before integration. |
| Standard PLC ↔ Safety | Control boundaries and status signals needed. | Interface matrix derived from Safety review; no duplicated Safety logic in standard PLC. |
| Electrical ↔ pneumatic | Coils, voltage, current, connectors, pressure, exhaust, and sensors. | Terminals, cables, valves, and pneumatic schematic coordinated. |
| Mechanical ↔ maintenance | Sensor/camera adjustment, replenishment, bin change, and jam removal. | Access/task review documented before layout release. |

## 7. Design package to produce

1. General 2D/3D layout with envelopes, operating zones, cabinet, camera, magazine, and bins.
2. Assembly/detail drawings, mechanical bill of materials, tolerances, finish, and assembly criteria.
3. Feeder, cylinders, conveyor drive, supports, stability, and ramp-transfer calculations with traceable inputs and assumptions.
4. Power/control drawings, 24 VDC distribution, load/protection calculations, wiring, terminals, and cable list.
5. Pneumatic diagram, component list, consumption calculation, and states reviewed with Safety.
6. Vision-support drawing with field of view/optics/lighting once the camera is known, and adjustment access.
7. Interface matrix, signal list synchronized with document 03, decision log, and design-review record.

These are future deliverables; this document contains no calculations, released drawings, or purchasing BOM.

## 8. Design review and verification criteria

| ID / traceability | Review / criterion | Evidence required | Status |
| --- | --- | --- | --- |
| `DVT-02-01` · REQ-001 | Freeze part and tolerances before designing guides, pushers, and vision recipe. | Approved drawing and identified boundary samples. | Pending; current dimensions are didactic. |
| `DVT-02-02` · REQ-001 | Feeder retains the stack and releases one bottom part without double feed or jam. | Tolerance review plus feed test with part variation. | Pending; no physical assembly. |
| `DVT-02-03` · REQ-002 | Conveyor repeats capture position and holds part stable for imaging. | Pose/vibration/lighting test with selected product and camera. | Pending; HTML only stops animation during INSPECT. |
| `DVT-02-04` · REQ-003 | A/B transfers avoid collision, out-of-bin drop, or jam. | Path analysis, prototype, and test of both results. | Pending; ramp is a graphical path. |
| `DVT-02-05` · REQ-004 | Assembly can sustain 5 parts/minute under REQ-004 conditions. | Cycle calculation with real data and 30-minute steady test. | Pending; cannot be inferred from model duration. |
| `DVT-02-06` · REQ-011 | Electrical supply, current, protection, and cables meet load and environment. | Electrical calculation, reviewed drawings, and installation verification. | Pending; equipment/load plates missing. |
| `DVT-02-07` · REQ-011 | Pneumatic supply meets nominal 6 bar during use and calculated flow/cycle. | Point-of-use measurement and consumption calculation/test. | Pending; 6 bar is assumed, not measured. |
| `DVT-02-08` · REQ-002 / REQ-009 | Optical mount enables field of view/repeatability for REQ-002 defects. | Optics/light study and test with acceptance samples. | Pending; camera and optics not selected. |
| `DVT-02-09` · REQ-012 / REQ-014 | Layout, maintainability, and access tasks are reviewed. | Multidisciplinary review and closed actions. | Pending; does not replace Safety assessment. |
| `DVT-02-10` · REQ-008 / REQ-009 / REQ-010 / REQ-014 | Boundaries/signals between standard control, camera, data, and Safety align with 01/03/04/05. | Controlled interface matrix review. | Pending; engineering is distributed across later documents. |

No physical tests or mechanical, electrical, or pneumatic calculations were performed while drafting this package. Simulator captures only evidence visual presentation and modeled paths.

## 9. Decisions still open

| ID | Decision | Dependency |
| --- | --- | --- |
| `D-02-01` | Final drawing, plate mass, and dimensional variation; confirm whether teaching geometry matches any real product. | Customer/process/quality. |
| `D-02-02` | Magazine loading, empty sensor, reload permissive, and jam behavior. | Process, mechanical, I/O, and Safety. |
| `D-02-03` | Detect full A/B bin and permit replacement without overflow. | Operation, layout, and hardware. |
| `D-02-04` | Conveyor speed, width, length, and drive for 5 parts/minute and camera stop. | Product, cycle, and motor/drive selection. |
| `D-02-05` | Physical force, stroke, and cushioning for both cylinders. | Load data, guidance, pressure/flow, and risk. |
| `D-02-06` | Camera model, optics, working distance, lighting, and support. | Tests on real samples and document 03. |
| `D-02-07` | Cabinet AC supply, power/current, environment, EMC, and IP. | Site, equipment nameplates, and applicable regulations. |
| `D-02-08` | Network/gateway architecture to DB, protocol, and offline behavior. | IT/OT, integration, and document 03. |
| `D-02-09` | Safety requirements/boundaries and state on loss of power/air. | Risk assessment and document 04. |

## 10. Status and next gate

**Outcome:** mechanical, electrical, and pneumatic concept documented; M/E/P Revision B sheets accepted by D2R for teaching use. No physical design is released.
**Evidence produced in this edit:** document review of HTML and documents 00/01; no tests or physical calculations were run.
**Manufacturing approval:** not applicable; the case remains educational.
**Next document after review:** [03 · Components, hardware, and I/O map](03-COMPONENTS-HARDWARE-IO.en.md), which will turn the interfaces into equipment candidates and an I/O list without real addresses until CPU/modules are selected.
