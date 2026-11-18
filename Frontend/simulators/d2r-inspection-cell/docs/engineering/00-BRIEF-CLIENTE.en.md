# 00 · Client brief and initial requirements

**Version:** 0.2 · teaching baseline approved by D2R
**Case:** D2R Inspection Cell · fictional client
**Source used to describe the simulator:** [functional prototype](../../D2R-3D-001_Prototipo_Funcional_v11.html)

> **Important:** no real client or signed brief exists. D2R approved this fictional case and its decisions for teaching use. Items marked as a **teaching assumption** are still not measured data, an approved purchase, or a specification for a real installation; replace them if genuine customer or site data becomes available.

## 1. Teaching assignment

A fictional machine shop wants to automate visual inspection of a small plate and sort each part automatically. An operator loads parts into a magazine, starts the cell from the HMI, collects good and rejected parts in two bins, and reviews each part in an electronic record.

The learning cell is standalone: initial loading and bin removal are manual. No upstream or downstream line, or MES/ERP communication, is assumed. Maintenance and engineering personnel can observe signals and diagnose the cycle.

The exercise follows the full project lifecycle: requirements, mechanical and electrical concept, hardware selection, PLC architecture and program, Safety Engineering, HMI/vision, and commissioning. The current HTML is for study and demonstration; it does not operate physical machinery.

## 2. Part and inspection scope

### 2.1 Proposed definition

| Item | Proposed teaching baseline | Status |
| --- | --- | --- |
| Product | Machined aluminum mounting plate | Teaching assumption; alloy and drawing not defined |
| Nominal dimensions | 52 × 38 × 13.5 mm | Teaching assumption; not measured on a real part |
| Holes | Four peripheral Ø5.0 mm through-holes and one central Ø8.8 mm through-hole | Teaching assumption; drawing positions and tolerances remain open |
| Variants | One product reference | Teaching assumption for the first commissioning exercise |
| Initial inspection | Confirm that all five holes are present and visually open, with no obvious obstruction | Proposed scope; not dimensional measurement |
| Included defects | Missing or visibly obstructed hole | Teaching assumption for preparing NOK samples |
| Excluded defects | Diameter, position, thread, fine burr, finish, cracks, material, and any defect not visible to the camera | Outside first scope; review with real samples |

The dimensions give the exercise a scale and are approximately compatible with the simulator's graphical part. They are not inferred as real measurements from the 3D model. A drawing, tolerances, presentation orientation, and boundary samples must be approved before selecting optics or lighting.

### 2.2 Inspection decision

For the first case, the camera shall return `OK` when all five holes are identified and `NOK` if any hole is missing or visibly obstructed. The cell does not promise diameter measurement or replace a gauge. The criteria are limited to this rule so results can be explained and tested with known samples.

## 3. Operation and production targets

### 3.1 Operating assumptions

- One 8-hour shift per day, 5 days per week.
- Capacity target: **5 parts per minute** at steady state, equivalent to an average 12-second interval between parts.
- This target excludes manual magazine loading, bin emptying, planned breaks, and jam recovery. Actual cycle time and availability must be measured on a built machine; simulator timing cannot demonstrate this target.
- The operator loads up to **7 parts** in the magazine and places empty bins at A and B. The seven-part stack is also the simulator's graphical batch, not an approved production limitation.
- Proposed capacity of each bin: **25 parts**. The operator empties or changes bins; no full-bin sensor is assumed at this stage.
- One product reference, manual batch loading and unloading, and no control link to other machines.
- The operator HMI is in Spanish. Project documentation is delivered in Spanish and English.

The 5 parts/minute target is an initial goal for cycle-budget analysis, not a demonstrated performance. If vision, mechanics, or handling cannot sustain it, revise the requirement using pilot results.

### 3.2 Expected flow

1. The operator confirms the area is clear, loads parts, and places the A/B bins.
2. The operator selects `AUTO` for continuous processing while product is available, or `PIEZA` to request one unit with `START`.
3. The feeder presents one part on the conveyor and it travels to inspection.
4. The conveyor stops for image acquisition. The PLC triggers the camera and waits for a valid response.
5. An `OK` part is sent to A; an `NOK` part is sent to B.
6. The system confirms the output, increments the matching counter, and creates one record per part.
7. `FIN DE PIEZA` requests a stop after the active part is completed. Reset/rearm takes place with the machine stopped, according to the interface eventually approved.

**Controls for the teaching case:** `START` requests a start when start conditions are satisfied; `FIN DE PIEZA` finishes the active part and prevents another from starting; HMI `RESET` is only available while the machine is stopped. Pause and SIM RESET belong to the graphical teaching environment and are not treated as PLC commands for the real machine. The scope and meaning of a physical pause must be decided in the functional design.

This flow describes the case to be designed. The sequence and controls currently represented by the HTML are listed separately in section 8 to avoid confusing simulated behavior with a physically validated requirement.

## 4. Preliminary requirements and proposed acceptance

The following criteria are a **teaching review baseline**, not signed acceptance. “Pilot” means a controlled test with identified samples; it does not imply certification or statistical production capability.

| ID | Proposed requirement | Initial acceptance criterion | Status / evidence needed |
| --- | --- | --- | --- |
| REQ-001 | Process one plate per cycle in a repeatable orientation. | 100 consecutive cycles without double feeding or part loss; visually check orientation. | Teaching assumption; test with a physical feeder and real samples. |
| REQ-002 | Detect missing or visibly obstructed holes within the defined scope. | Of 100 prepared and labelled NOK samples (50 with a missing hole and 50 with an obstructed hole), reject all 100; of 100 good samples, accept at least 98. | Teaching pilot target; validate representativeness, false rejects, and false accepts. Not a statistical production guarantee. |
| REQ-003 | Automatically route each result. | All confirmed OK results reach A; all NOK results reach B, without crossover during acceptance test. | Matches simulator routing; physical transfer test pending. |
| REQ-004 | Meet the proposed production target. | Average at least 5 parts/min over 30 min of steady operation, excluding replenishment and planned stops; record stops and parts. | Teaching assumption; measure in FAT/SAT, do not infer from animation. |
| REQ-005 | Provide AUTO and PIEZA modes. | AUTO continues while demand exists and no valid finish request is pending; PIEZA completes one unit per START. | Teaching requirement; validate with operator. |
| REQ-006 | FIN DE PIEZA finishes the active cycle and prevents a new one. | If requested during a cycle, the current unit reaches a recorded output and the next cycle does not start. | SIM: real clicks in all seven phases and the inter-cycle interval prevent another part from starting; the 0.9 s interval is unchanged. Physical test pending. |
| REQ-007 | Show status, mode, result, and counters to the operator. | HMI shows READY/RUN/FAULT, mode, cycle state, OK, NOK, and total; alarms are readable. | Base content from simulator; final text to review. |
| REQ-008 | Record every part in an external traceability system. | One row per part with batch ID, part number, date/time, product reference, camera recipe/job, result, result code, and destination; minimum 30-day retention. | Teaching assumption. No DB/gateway is connected; fields, synchronization, and write method remain for design. |
| REQ-009 | Exchange trigger and result with a vision camera. | Conceptual sequence distinguishes `Trigger`, `Ready`, `Busy`, `Complete`, `ResultValid`, `ResultOK`, `ResultCode`, and acknowledgement (`Ack`); timeout or invalid result inhibits normal classification and raises a diagnostic defined during design. | Proposed need; model, protocol, handshake, and failure response will be defined with selected hardware. |
| REQ-010 | Use a common PLC platform for the exercise. | Document the program and tests for Siemens TIA Portal and the S7-1200 family; separate HMI, vision, and data interfaces. | Teaching platform assumption; CPU, firmware, HMI, and licenses will be selected in document 03. |
| REQ-011 | Design for 24 VDC control power and compressed air. | Inventory loads and verify voltage, current, pressure, and air quality during design and FAT. | Provisional baseline: 24 VDC control and dry filtered air at 6 bar; power supply and consumption not calculated. |
| REQ-012 | Operate indoors, without pressure washing. | Pilot within 10–35 °C, without condensation or direct weather exposure. | Teaching assumption; IP rating, humidity, dust, and final temperature require site confirmation. |
| REQ-013 | Allow operation to recover after an alarm. | Alarm identifies condition and state; operator corrects the cause and rearms using the approved procedure without losing confirmed records. | Proposed need; process causes and recovery strategy will be specified later. |
| REQ-014 | Define Safety before design freeze. | Document a risk assessment for access, trapping, pusher, pneumatic energy, jams, and maintenance; competent people define and validate measures. | Required future work. No PLr/SIL is set, and `SafetyReady` is not evidence. |
| REQ-015 | Provide reproducible documentation and commissioning. | FAT records configuration, samples, results, alarms, recovery, and traceability; SAT repeats integration tests at the site. | Proposed outline; owners and forms will be defined in document 07. |

## 5. Vision and traceability interfaces

### 5.1 Camera exchange

The case proposes a **Cognex** smart camera, without yet selecting model, lens, lighting, or protocol. The PLC shall request an acquisition after confirming part presence and position. At a conceptual level, the interface must distinguish at least:

- PLC → camera: recipe/job selection, trigger, and batch/part number if supported by the device.
- Camera → PLC: ready, busy, complete, valid result, OK/NOK result, and result code.
- PLC ↔ camera: acknowledgement or clearing of the previous result to avoid reusing stale data.
- Diagnostics: timeout, communication loss, unavailable recipe, or invalid response; recovery behavior must be designed and tested before acceptance.

“Trigger” is not fixed as a dedicated electrical input: it may use discrete I/O or a network command depending on the selected model. The names above describe interface content, not assigned tags or physical addresses. The final map and types will be documented in the hardware and PLC architecture documents.

### 5.2 External electronic record

The case requires an electronic record per part with a **proposed minimum retention of 30 days**. The database may be an external SQL service accessed through a plant gateway/service; the PLC is not treated as a direct SQL client. Transport, server, format, time synchronization, disconnection policy, and database administrator remain open for integration design. The initial proposal does not store images.

The proposed minimum record is: `batch_id`, `piece_index`, `timestamp`, `product_id`, `vision_job`, `inspection_result`, `result_code`, `destination`, and `machine_state`. Each ID must relate the camera response, PLC counter, and physical output. A failed write must create a verifiable state/diagnostic and an agreed policy; a record must not be marked saved unless persistence is confirmed.

## 6. Assumed platform, utilities, and environment

| Area | Case baseline decision | What this does not mean yet |
| --- | --- | --- |
| PLC | Siemens S7-1200, programmed in TIA Portal | No CPU, version, modules, or real project selected. |
| HMI | Siemens operator panel for local operation, Spanish interface | No size/model, screen count, or approved purchase. |
| Vision | Cognex smart camera, one initial plate recipe | No camera/lens/light selected and no inspection implemented. |
| Electrical control | 24 VDC control circuits | No schematic, load calculation, protection, or terminal assignment. |
| Pneumatics | Dry filtered air; 6 bar as a teaching nominal pressure | No flow, cylinder, valve, or sizing calculation. |
| Power supply | Industrial site supply to be confirmed | No input voltage/phase/power fixed before motors and local regulations are known. |
| Data | External database service with an integration gateway | No vendor, database engine, network, API, or server selected. |
| Environment | Indoor, 10–35 °C, no pressure washing | No IP class or industrial environmental suitability declared. |

These decisions establish a shared starting point. Selection and sizing follow from the part drawing, cycle analysis, load calculation, and Safety review.

## 7. Safety and responsibility limits

At minimum, the project must assess access to the conveyor and feeder, pusher movement, possible trapping points, stored pneumatic energy, jam recovery, and cleaning/maintenance tasks. The assessment will determine measures, distances, architecture, required performance level, and validation under the regulations applicable to the site.

This brief does not select a PLr/SIL, declare conformity, turn graphical guards into certified guards, or approve a Safety solution. `SafetyReady` in the simulator is a fixed conceptual signal; it does not represent a safety circuit. No value in this teaching case replaces an assessment by competent people.

## 8. Simulator facts and evidence limits

The current HTML is a graphical model with simulated logic. Specifically:

- The demonstration has a fixed batch of seven results: `OK, NOK, OK, NOK, OK, OK, NOK` (four OK and three NOK). It is a route test sequence, not an expected defect rate.
- Represented routing is `OK → A` via the side pusher and `NOK → B` at the end of the conveyor.
- `AUTO` runs the batch; `PIEZA` requests one unit with START; `FIN DE PIEZA` finishes the active part before stopping. HMI RESET is restricted to a stopped state. Pause and RESET SIM control the teaching environment, not machine PLC logic.
- The camera does not capture or analyze images. Results come from the programmed teaching sequence.
- HTML geometry, dimensions, paths, and times are visualization/model timing. They are not physical tolerances, capacity, force, response, or measured performance.
- PLC Watch contains conceptual signals; there are no I/Q addresses, CPU, physical DBs, or PLC connection.
- No Cognex camera, external data service, persistent DB, real recipe, or active traceability is connected.
- The interface includes operating states, diagnostics, and a conceptual Safety permission; none is machine validation.

When this document says “simulator criterion,” it only means that visible behavior can be observed in the demonstration. It does not demonstrate compliance with a physical test.

## 9. Out of scope for this initial brief

- Building a machine or releasing construction drawings.
- Setting final tolerances without a product drawing and quality agreement.
- Claiming that 5 parts/min, inspection rate, or availability have already been achieved.
- Selecting PLC, HMI, camera, lens, lighting, motor, valves, or protective-device models.
- Assigning I/O addresses, declaring existing TIA tags, or connecting a database.
- Writing/validating PLC software, implementing communications, or developing traceability software.
- Defining, certifying, or validating Safety functions based on the simulator.

## 10. Decisions approved for the teaching case

D2R approved the following eleven decisions as the shared baseline for the exercise. This closes the teaching review of the brief; it does not turn assumptions into real-client requirements or manufacturing data. If genuine data becomes available, review it before physical design:

| Ref. | Approved teaching baseline | Status / limit |
| --- | --- | --- |
| D-00-01 | 52 × 38 × 13.5 mm aluminum plate; five holes as described in §2. | Approved as teaching geometry; real drawing pending if supplied. |
| D-00-02 | First vision version detects missing/obstructed holes only; no metrology. | Approved as scope; validate with real samples before production. |
| D-00-03 | Initial target 5 parts/minute and one 8-hour shift, 5 days/week. | Approved as an exercise target; real performance pending FAT/SAT. |
| D-00-04 | Manual magazine up to 7; A/B bins of 25. | Approved handling assumption; sensors and procedures pending. |
| D-00-05 | Vision test: 100 good with ≥98 accepted and 100 NOK with all 100 rejected. | Approved as pilot criterion; it does not prove statistical production capability. |
| D-00-06 | Cognex as a camera-family hypothesis; model/protocol pending. | Approved as a teaching hypothesis; model not selected. |
| D-00-07 | One record per part, 30-day retention, no image storage. | Approved as a teaching requirement; service and data policy pending. |
| D-00-08 | Gateway to external DB; service not specified. | Approved as conceptual separation; integration technology pending. |
| D-00-09 | Siemens S7-1200/TIA Portal as teaching platform. | Approved for the exercise; CPU and versions pending document 03. |
| D-00-10 | 24 VDC control, 6 bar air; indoor 10–35 °C, no washdown. | Approved as provisional teaching conditions; real site pending. |
| D-00-11 | Risk assessment before design close; no preset PLr/SIL. | Approved as a mandatory gate; it assigns no PLr/SIL and certifies no solution. |

## 11. Review gate

**Brief status:** teaching baseline approved by D2R; it is not a contractual or physical specification.
**Real-client approval:** not applicable; the client is fictional.
**D2R teaching review:** approved for developing the exercise; validation with a real client/site is not applicable yet.
**Next document:** [02 · Mechanical, electrical, and pneumatic design](reader.html?doc=02&embedded=1&lang=en). Document 01 was approved as a teaching specification; its pending simulator criteria are listed there.
