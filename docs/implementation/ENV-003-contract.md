D2R — Prompt maestro para Codex | ENV-003
Vamos a trabajar con un contrato de implementación por fases, manteniendo el sistema que ya utilizas: Codex desarrolla, tú compruebas el resultado en la web y decides cuándo hacer commit y push.

El prompt contendrá toda la especificación técnica de ENV-003, pero Codex solo podrá ejecutar una fase cada vez. No avanzará por su cuenta.
Plan de implementación
1. Fase 01 — Preparación y portada
   
   Inspeccionar el repositorio, sustituir el ENV-003 anterior, integrar la portada aprobada y actualizar título, objetivo y descripción. Parar para validar.
2. Fase 02 — Theory
   
   Implementar los cinco bloques técnicos reales, bilingües, con sus imágenes y el formato existente. Parar para validar.
3. Fase 03 — Hotspots
   
   Posicionar diez hotspots en la imagen aprobada, asociarlos a las Experiences previstas y verificar la navegación. Parar para validar.
4. Fases 04–13 — Experiences
   
   Implementar EXP-0021 a EXP-0030, una por fase, con escenario, diagnóstico, decisiones, imágenes, feedback y validación individual.
5. Fase 14 — QA final
   
   Comprobar ENV-003 completo, las diez Experiences, la navegación, ES/EN, los assets y las regresiones.

Total: 14 fases de trabajo y 14 puntos de aprobación. La inspección inicial está incluida en la primera fase.

Importante: la portada aprobada es la última imagen oscura del armario industrial, con Siemens S7-1500/S7-1200, SCALANCE, EtherCAT, Beckhoff I/O, sensores y gateway RS-485. Codex deberá utilizar el archivo real que le proporciones; no recrearla ni modificar sus conexiones.
Prompt completo para Codex
Copia el siguiente contrato en Codex. Está preparado para que ejecute la Fase 01 y se detenga. Cuando la valides, utilizarás la orden de continuación que aparece al final.
DIGITAL2REAL — ENV-003 IMPLEMENTATION CONTRACT
Industrial Communications & Networks
Master Contract V1 — Phased Implementation
0. ROLE AND AUTHORITY
You are the implementation engineer for Digital2Real (D2R), an industrial automation engineering platform.

D2R has two content products:
- Notebook: permanent, reusable engineering knowledge and technical single source of truth.
- Experiences: interactive industrial diagnosis, engineering decisions and troubleshooting.
The Experience Engine is the existing implementation system.

Your responsibility is to implement ENV-003 according to this contract, following existing repository conventions.

You are NOT authorized to redesign the product or independently expand the approved scope.

Priorities, in order:
1. Engineering accuracy.
2. Preservation of existing architecture.
3. Correct learner experience.
4. Reuse of established components and patterns.
5. Minimal, reviewable changes.
6. Efficient execution and validation.
Do not invent technical facts, manufacturer specifications, screenshots, error codes or device behavior.

1. PROJECT DEFINITION
Environment ID: ENV-003

English title:
Industrial Communications & Networks

Spanish title:
Comunicaciones y Redes Industriales

English objective:
Understand, analyze and troubleshoot industrial communication networks, from physical connectivity to data exchange between controllers, field devices and supervisory systems.

Spanish objective:
Comprender, analizar y diagnosticar redes de comunicación industrial, desde la conectividad física hasta el intercambio de datos entre controladores, dispositivos de campo y sistemas de supervisión.

Environment scope:
- One approved cover image.
- Five real Theory blocks.
- Five principal Theory illustrations.
- Ten Experience hotspots.
- Ten Engineering Experiences.
- Spanish and English.
- Existing Experience Engine.
- Existing UI, routing and progression.
Explicitly excluded:
- 3D environments.
- New interactive simulators.
- New Experience Engine.
- New Theory renderer unless an actual Engine defect is demonstrated.
- Redesign of the website.
- New product categories.
- Changes to ENV-001 or ENV-002.
ENV-003 must teach industrial engineering diagnosis, not merely describe protocol definitions.

2. EXISTING CONTENT REPLACEMENT AUTHORIZATION
The user has approved replacing the previous ENV-003 concept and the previous EXP-0021.

You MAY:
- Replace the old ENV-003 title, description and objective.
- Replace the previous ENV-003 cover image reference.
- Remove obsolete ENV-003 hotspot definitions.
- Replace the previous EXP-0021 content.
- Remove assets exclusively associated with discarded content when their ownership is verified.
You MUST:
- Preserve ENV-003 and EXP-0021 identifiers.
- Inspect all references before removing content.
- Preserve shared assets.
- Preserve unrelated Experiences.
- Preserve existing data contracts, navigation and progression behavior.
- Report unexpected dependencies before proceeding.
This authorization does not permit deletion of arbitrary repository files.

If an existing EXP-0022 through EXP-0030 conflicts with the approved plan, stop and report it. Do not overwrite those Experiences without additional authorization.

3. MANDATORY EXECUTION PROTOCOL
ONE PHASE PER EXECUTION
This document defines the complete project, but you must implement only ONE phase in each execution.

At the beginning of each execution:
1. Read the applicable AGENTS.md and repository instructions.
2. Determine the current phase from repository state and approved checkpoints.
3. Inspect only the files relevant to that phase.
4. Identify existing patterns to reuse.
5. Implement the current phase.
6. Run appropriate validation.
7. Produce the required report.
8. STOP.
Never continue automatically to another phase.

The user performs visual validation and Git operations manually.

DO NOT:
- Commit.
- Push.
- Merge.
- Rebase.
- Reset.
- Force-push.
- Delete unrelated user work.
- Automatically implement the next Experience.
A user message containing CONTINUAR authorizes exactly the next pending phase, provided the previous phase has been approved.

A request for corrections means stay in the current phase.
CHECKPOINT PERSISTENCE
Maintain one concise implementation checkpoint in an appropriate existing repository documentation location.

Suggested filename only if no equivalent exists:

docs/implementation/ENV-003-checkpoint.md

Use repository conventions if the suggested path does not fit.

Record:
- Contract version.
- Phase completed.
- Validation result.
- User approval status.
- Next phase.
- Known blockers.
Never mark a phase approved merely because implementation or tests passed.

User approval is required.

Do not use this checkpoint as a second source of truth for engineering content.

4. APPROVED IMPLEMENTATION SEQUENCE
PHASE 01 — Repository inspection, ENV-003 replacement and approved cover.

PHASE 02 — Five Theory blocks and principal illustrations.

PHASE 03 — Ten hotspots and Experience navigation.

PHASE 04 — EXP-0021 PROFINET Device Not Reachable.

PHASE 05 — EXP-0022 PROFINET Device Name Mismatch.

PHASE 06 — EXP-0023 PROFIBUS Station Failure.

PHASE 07 — EXP-0024 PROFIBUS Bus Termination Fault.

PHASE 08 — EXP-0025 Modbus RTU Communication Timeout.

PHASE 09 — EXP-0026 Modbus TCP Wrong Register Data.

PHASE 10 — EXP-0027 EtherCAT Slave Not Operational.

PHASE 11 — EXP-0028 CANopen Node Communication Lost.

PHASE 12 — EXP-0029 BACnet Device Not Discovered.

PHASE 13 — EXP-0030 OPC UA Data Not Updating.

PHASE 14 — Complete ENV-003 integration QA.

No phase may be skipped or combined without explicit user approval.

5. PHASE 01 — INSPECTION AND COVER
5.1 Inspect the repository
Locate and inspect:
- ENV-001 implementation.
- ENV-002 implementation.
- Current ENV-003 implementation.
- Environment metadata.
- Environment cover image conventions.
- Experience registration.
- Existing hotspot definitions.
- Theory schema.
- Localization architecture.
- Existing EXP-0021.
- References to EXP-0021.
- Asset ownership and usage.
- Relevant build and validation scripts.
Inspect representative examples rather than reading the entire repository.

Classify planned changes as:
- CONTENT
- ENGINE
- INTENTIONAL REUSE
- UNUSED
- TECHNICAL DEBT
The expected work is CONTENT, using existing architecture.

Do not introduce ENGINE changes without identifying a reproducible Engine defect.
5.2 Replace ENV-003 metadata
Implement the approved title and objective in ES/EN.

Write a concise, engineering-focused description consistent with ENV-001 and ENV-002.

Do not use marketing language.

Preserve existing card layout, typography, progress indicator and navigation.

The Environment will ultimately contain ten Experiences.
5.3 Integrate the approved cover
The user has approved a specific cover image.

Visual identity:
- Front-facing industrial automation cabinet.
- Siemens S7-1500 and S7-1200.
- Siemens SCALANCE industrial Ethernet switch.
- Beckhoff EtherCAT equipment.
- Beckhoff industrial I/O module.
- AS-i Safety equipment.
- SICK and TURCK sensors.
- EASTRON serial/Ethernet gateway.
- Organized DIN rails and cable ducts.
- Distinct industrial cable types.
- Dark, clean, softly blurred background.
- Legible foreground equipment.
- No titles overlaid onto the image.
IMPORTANT:

The approved image must be supplied as a real repository-accessible image file.

Search the designated asset location for the approved file.

Do not assume that an image visible in ChatGPT is automatically accessible from Codex.

If the approved image is not available, report the missing file and STOP.

Do not replace it with a generated approximation, placeholder or unrelated stock image.

Do not alter the equipment, cable routing or composition.

Use existing image optimization and responsive presentation conventions.

Preserve the original approved image when generating any optimized derivative.
5.4 Phase 01 validation
Verify:
- ENV-003 metadata is correct.
- ES/EN titles and descriptions work.
- Approved image loads.
- Image cropping is appropriate in the Environment card.
- Existing ENV-001 and ENV-002 cards remain unchanged.
- No broken asset references.
- No unintended deletion.
- Relevant build/tests pass.
Report and STOP.

Do not implement Theory or hotspots.

6. PHASE 02 — THEORY
Implement exactly FIVE visible Theory blocks.

Follow the existing ENV-002 Theory implementation, particularly the approved structure of real content blocks.

Do not implement thirteen sections disguised as five editorial groups.

Each block must contain:
- Bilingual title.
- Explanatory engineering text.
- Relevant technical concepts.
- Practical engineering interpretation.
- One principal technical illustration.
- Correct existing Theory navigation behavior.
Content must be substantive enough to teach engineering reasoning, not just a bullet list of terminology.
BLOCK 01 — INDUSTRIAL COMMUNICATION FUNDAMENTALS
ES:
Fundamentos de comunicaciones industriales

Explain:
- Purpose of industrial communication.
- Ethernet over copper and fiber.
- RS-485.
- CAN physical layer.
- Industrial connectors and interfaces.
- Bus, line, star and ring topologies.
- MAC and IP addressing.
- Subnets, gateways and routing.
- Switches and industrial network infrastructure.
- Cyclic and acyclic communication.
- Latency, jitter and determinism.
- Cable shielding and electromagnetic interference.
- Grounding and termination principles.
- Difference between physical connectivity and valid application communication.
Engineering emphasis:

A working Ethernet link does not prove that the PLC is exchanging valid process data.

Learning outcome:

The learner can identify physical and logical network components and select an initial diagnostic approach.

Illustration:

Industrial physical media and topology comparison.

BLOCK 02 — INDUSTRIAL CONTROL NETWORKS
ES:
Redes de control industrial

Explain:
PROFINET
- Controller and IO Device.
- Device names.
- IP configuration.
- PROFINET DCP.
- Cyclic IO communication.
- Device diagnostics.
PROFIBUS DP
- DP master and slave.
- RS-485 physical bus.
- Station addressing.
- Segment termination.
- Diagnostic information.
EtherCAT
- Master and slave architecture.
- Topology.
- EtherCAT state machine.
- Process data.
- PDO mapping.
EtherNet/IP
- CIP.
- Scanner/adapter terminology where applicable.
- Explicit and implicit messaging.
- Connection diagnostics.
CAN, CANopen and DeviceNet
- CAN arbitration.
- Node identification.
- CANopen NMT.
- Heartbeat.
- DeviceNet as a CAN-based industrial network.
Engineering emphasis:

Do not treat these protocols as interchangeable implementations of ordinary Ethernet.

Learning outcome:

The learner recognizes the main control-network architectures and their diagnostic differences.

Illustration:

Separate, physically plausible network architectures.

BLOCK 03 — DEVICE COMMUNICATION AND DATA EXCHANGE
ES:
Comunicación de dispositivos e intercambio de datos

Explain:
Modbus RTU and TCP
- Client/server model.
- Historical master/slave terminology.
- Serial parameters.
- Device addressing.
- Coils and registers.
- Function codes.
- Exception responses.
- Register offsets.
- 16-bit and 32-bit values.
- Byte order and word order.
IO-Link
- Master/device.
- Point-to-point communication.
- Process data.
- Parameters and diagnostics.
HART
- Instrument communication.
- Digital information.
- Relationship with analog current-loop instrumentation.
OPC UA
- Information model.
- Nodes and attributes.
- Sessions.
- Subscriptions.
- Monitored items.
- Data quality.
- Timestamps.
- Security configuration.
Gateways
- Protocol conversion.
- Data mapping.
- Limitations of interoperability.
Engineering emphasis:

Correct communication does not guarantee correct interpretation of process data.

Learning outcome:

The learner distinguishes communication errors from data-format, mapping and application errors.

Illustration:

Field device, controller, gateway and SCADA with clearly identified protocol boundaries.

BLOCK 04 — BUILDING AND INFRASTRUCTURE COMMUNICATIONS
ES:
Comunicaciones de edificios e infraestructuras

Explain:
BACnet
- BACnet/IP.
- BACnet MS/TP.
- Device instances.
- Objects and properties.
- Who-Is and I-Am.
- Discovery across subnets.
- BMS integration.
DNP3
- Remote monitoring and control.
- Data points.
- Events.
- Time-related information.
IEC 60870-5-104
- Telecontrol architecture.
- Supervisory communication.
- Events and remote stations.
Explain differences between:
- Machine automation.
- Building automation.
- Infrastructure telecontrol.
Learning outcome:

The learner understands why different industrial sectors use different communication models.

Illustration:

Separate BMS and utility telecontrol architectures.

BLOCK 05 — NETWORK TROUBLESHOOTING AND OT SECURITY
ES:
Diagnóstico de redes y seguridad OT

Explain a structured diagnostic process:
1. Confirm the reported symptom.
2. Identify the affected equipment.
3. Check power and physical connectivity.
4. Inspect network topology.
5. Check addressing and device identification.
6. Examine controller diagnostics.
7. Inspect protocol states and communication errors.
8. Check data quality and application behavior.
9. Form and test a hypothesis safely.
10. Verify recovery.
Cover:
- Link LEDs.
- Switch port diagnostics.
- Error counters.
- PLC diagnostic buffers.
- Wireshark.
- Port mirroring where supported.
- PROFINET diagnostic tools.
- PROFIBUS diagnostic tools.
- Timeouts.
- Lost stations.
- Incorrect register interpretation.
- Network segmentation.
- IEC 62443 zones and conduits.
- Authorized access and safe recovery.
Engineering emphasis:

Do not confuse a ping response with proof of correct industrial communication.

Learning outcome:

The learner can follow a safe, evidence-based troubleshooting method.

Illustration:

Layered diagnostic workflow.

THEORY ASSET REQUIREMENTS
- Reuse verified repository assets where suitable.
- Otherwise create technically appropriate images using available project capabilities.
- Do not invent image paths.
- Do not publish broken references.
- Do not use unrelated stock images.
- Do not reproduce reference images as if they were original assets.
- Avoid misleading equipment labels, ports or cable colors.
- Keep visual consistency with ENV-001 and ENV-002.
- Ensure images are legible in the actual Theory layout.
- If asset creation is unavailable, report the missing assets and stop rather than silently substituting placeholders.
THEORY QA
Verify:
- Exactly five real visible blocks.
- Complete ES/EN content.
- Technical terminology.
- Five valid principal images.
- No broken media.
- Correct mobile and desktop rendering.
- No regressions in ENV-002 Theory.
- Relevant build/tests pass.
Report and STOP.

7. PHASE 03 — HOTSPOTS
Implement ten hotspots using the existing Experience hotspot architecture.

Mapping:
1. EXP-0021 — PROFINET Device Not Reachable
2. EXP-0022 — PROFINET Device Name Mismatch
3. EXP-0023 — PROFIBUS Station Failure
4. EXP-0024 — PROFIBUS Bus Termination Fault
5. EXP-0025 — Modbus RTU Communication Timeout
6. EXP-0026 — Modbus TCP Wrong Register Data
7. EXP-0027 — EtherCAT Slave Not Operational
8. EXP-0028 — CANopen Node Communication Lost
9. EXP-0029 — BACnet Device Not Discovered
10. EXP-0030 — OPC UA Data Not Updating
Placement requirements
Use the approved ENV-003 cover.

Inspect:
- Actual image dimensions.
- Existing coordinate format.
- Existing responsive hotspot behavior.
- Existing locked/unpublished Experience behavior.
- Existing tooltip and labeling conventions.
Place hotspots to support clear interaction.

Prefer semantically relevant positions where possible, but do not falsely imply that every protocol is physically represented by a specific device in the image.

The image is an Environment cover, not a technically complete diagram of every protocol.

Requirements:
- Ten distinct hotspots.
- No severe overlap.
- Accessible on desktop and mobile.
- Existing styling.
- Correct ES/EN labels.
- Correct Experience IDs.
- No links to nonexistent published routes.
- Unimplemented Experiences must use supported locked or unavailable behavior.
If ten hotspots cannot be positioned legibly using existing UX, report the constraint instead of creating arbitrary overlapping coordinates.

Do not modify the approved image to solve hotspot placement.
Phase 03 QA
Verify:
- All ten hotspots render.
- Positions remain usable at supported viewport sizes.
- Labels correspond to the correct Experience.
- Unpublished Experiences behave correctly.
- No console or runtime errors.
- Existing Environment navigation is unaffected.
Report and STOP.

8. ENGINEERING EXPERIENCE CONTENT CONTRACT
Every Experience must use the existing D2R Experience Engine and established content conventions.

Do not create new Engine components unless a genuine shared Engine defect is demonstrated.

Each Experience must contain:
1. Industrial scenario.
2. Clear initial symptom.
3. Expected operating condition.
4. Defined faulty condition.
5. Technically valid root cause.
6. Plausible alternative hypotheses.
7. Progressive diagnostic evidence.
8. Engineering decisions.
9. Technically useful feedback.
10. Authorized corrective action.
11. Objective recovery verification.
12. ES/EN localization.
13. Appropriate technical assets.
14. Correct registration and completion behavior.
Use the existing schema for stages, decisions, evidence and outcomes.

Do not invent an alternative schema.
Learning design rules
- Do not disclose the root cause in the initial learner-facing scenario.
- Do not make the correct answer obvious through wording.
- Do not rely on a single red LED as the entire diagnosis.
- Require interpretation of evidence.
- Incorrect decisions must explain engineering consequences.
- Keep the scenario technically coherent.
- Use one primary root cause per Experience.
- Avoid unnecessary branching complexity.
- Do not invent manufacturer-specific diagnostics.
- Do not encourage unsafe intervention on operating equipment.
- Validate recovery rather than ending immediately after selecting a corrective action.
The root causes below are internal implementation specifications, not text to reveal to the learner.

9. EXPERIENCE SPECIFICATIONS
PHASE 04 — EXP-0021
PROFINET Device Not Reachable
Difficulty: Intermediate.

Scenario:
A remote IO station has stopped exchanging process data with the PLC.

Learning objective:
Differentiate physical link failure, power failure and PROFINET communication failure.

Root cause:
Defective Ethernet connector at the remote IO device, causing loss of physical link.

Evidence:
- PLC diagnostic information.
- Remote IO power status.
- Link/Act status.
- Switch port diagnostics.
- Physical connector inspection.
Competing hypotheses:
- Missing 24 V supply.
- Incorrect device name.
- Network configuration issue.
- Physical cable or connector fault.
Corrective action:
Repair or replace the defective connection using an authorized procedure.

Recovery:
Physical link restored and valid cyclic PROFINET IO communication confirmed.

PHASE 05 — EXP-0022
PROFINET Device Name Mismatch
Difficulty: Intermediate.

Scenario:
A replacement remote IO device is physically connected but fails to enter normal communication with the controller.

Learning objective:
Understand the distinction between device name, IP address and controller configuration.

Root cause:
The replacement device has a PROFINET name different from the expected name.

Evidence:
- Controller configuration.
- Expected device name.
- Discovered device identity.
- PLC diagnostic information.
- Physical link status.
Competing hypotheses:
- Faulty cable.
- Wrong IP configuration.
- Missing device power.
- Incorrect PROFINET device name.
Corrective action:
Assign the expected device name through the approved engineering procedure.

Recovery:
The controller establishes valid IO communication with the intended device.

PHASE 06 — EXP-0023
PROFIBUS Station Failure
Difficulty: Intermediate.

Scenario:
A PROFIBUS DP slave is missing from cyclic communication while other stations remain operational.

Learning objective:
Differentiate an individual station configuration fault from a segment-wide communication fault.

Root cause:
The station address differs from the address configured in the DP master.

Evidence:
- Master diagnostics.
- Expected station address.
- Actual station address.
- Neighboring station status.
- Physical bus observations.
Competing hypotheses:
- Failed station.
- Incorrect address.
- Termination problem.
- Connector fault.
Corrective action:
Correct the station address following the device-specific procedure.

Recovery:
The intended station returns to cyclic data exchange.

PHASE 07 — EXP-0024
PROFIBUS Bus Termination Fault
Difficulty: Advanced.

Scenario:
A PROFIBUS segment exhibits intermittent communication faults affecting multiple stations.

Learning objective:
Understand the effect of incorrect RS-485 segment termination.

Root cause:
Required termination at one physical segment end is disabled.

Evidence:
- Actual segment topology.
- Terminator positions.
- Master diagnostics.
- Error counters.
- Appropriate physical-layer observations.
Competing hypotheses:
- Individual slave failure.
- Address conflict.
- Electromagnetic interference.
- Incorrect segment termination.
Corrective action:
Restore correct termination under safe operating conditions.

Recovery:
Communication remains stable during a defined observation period.

Important:
Do not treat one resistance reading as universal proof of correct or incorrect termination.

PHASE 08 — EXP-0025
Modbus RTU Communication Timeout
Difficulty: Intermediate.

Scenario:
A PLC cannot obtain valid responses from a Modbus RTU field device.

Learning objective:
Diagnose incompatibility in serial communication settings.

Root cause:
Parity mismatch between Modbus client and server.

Evidence:
- Baud rate.
- Parity settings.
- Stop bits.
- Device address.
- Timeout diagnostics.
- Device configuration documentation.
Competing hypotheses:
- Incorrect slave/server address.
- Reversed differential pair.
- Wrong baud rate.
- Parity mismatch.
Corrective action:
Align compatible serial parameters.

Recovery:
Valid Modbus responses are received for known requests.

PHASE 09 — EXP-0026
Modbus TCP Wrong Register Data
Difficulty: Intermediate.

Scenario:
A PLC receives Modbus TCP responses but displays an incorrect engineering value.

Learning objective:
Distinguish successful communication from correct interpretation of transmitted data.

Root cause:
Incorrect word order when reconstructing a 32-bit value.

Evidence:
- Register map.
- Raw Modbus response.
- Two 16-bit register values.
- PLC data conversion.
- Known reference value.
Competing hypotheses:
- Incorrect scaling.
- Wrong register offset.
- Wrong word order.
- Sensor measurement fault.
Corrective action:
Correct the word-order interpretation according to verified device documentation.

Recovery:
Decoded value matches the known reference.

PHASE 10 — EXP-0027
EtherCAT Slave Not Operational
Difficulty: Advanced.

Scenario:
An EtherCAT slave is detected but does not achieve normal operational data exchange.

Learning objective:
Interpret EtherCAT states and configuration diagnostics.

Root cause:
PDO mapping mismatch between expected and configured process data.

Evidence:
- EtherCAT AL state.
- Verified diagnostic information.
- Expected PDO configuration.
- Actual PDO configuration.
- Master diagnostics.
Competing hypotheses:
- Physical communication fault.
- Incorrect PDO configuration.
- Slave configuration mismatch.
- Synchronization-related issue.
Corrective action:
Restore a compatible configuration.

Recovery:
Slave reaches OP and valid process data exchange is confirmed.

PHASE 11 — EXP-0028
CANopen Node Communication Lost
Difficulty: Advanced.

Scenario:
A controller reports a CANopen node supervision fault.

Learning objective:
Differentiate missing heartbeat supervision from complete CAN communication loss.

Root cause:
Heartbeat production is disabled on the node while consumer monitoring remains enabled.

Evidence:
- Producer heartbeat configuration.
- Consumer heartbeat configuration.
- Observed CAN frames.
- NMT state.
- Controller diagnostics.
Competing hypotheses:
- Disconnected CAN cable.
- Incorrect termination.
- Node communication failure.
- Heartbeat configuration mismatch.
Corrective action:
Restore the required heartbeat configuration.

Recovery:
Heartbeat monitoring becomes stable.

Important:
Missing heartbeat must not automatically be presented as proof that all CAN communication is unavailable.

PHASE 12 — EXP-0029
BACnet Device Not Discovered
Difficulty: Intermediate.

Scenario:
A BMS cannot discover a BACnet/IP controller located on another IP subnet.

Learning objective:
Understand BACnet discovery and the effect of subnet boundaries.

Root cause:
The required BACnet broadcast distribution mechanism is not configured.

Evidence:
- IP addressing.
- Subnet information.
- Routing.
- Who-Is requests.
- I-Am responses.
- BBMD configuration where applicable.
Competing hypotheses:
- Controller offline.
- Wrong IP settings.
- Incorrect device instance assumptions.
- Missing cross-subnet discovery configuration.
Corrective action:
Restore the supported BACnet discovery mechanism.

Recovery:
The controller is discovered and a known property can be read successfully.

PHASE 13 — EXP-0030
OPC UA Data Not Updating
Difficulty: Advanced.

Scenario:
An OPC UA client maintains a connection but a monitored process variable is not updating as expected.

Learning objective:
Differentiate session connectivity, subscription behavior and data quality.

Root cause:
Incorrect monitored-item or subscription configuration preventing the expected data-change notifications.

Evidence:
- Session status.
- Subscription status.
- Monitored-item configuration.
- Sampling and publishing settings.
- Data quality.
- Source timestamps.
- Server-side source value.
Competing hypotheses:
- Source variable not changing.
- Invalid data quality.
- Subscription configuration problem.
- Disconnected session.
Corrective action:
Correct the verified monitoring configuration.

Recovery:
The client receives actual value changes with coherent timestamps and appropriate quality.

10. EXPERIENCE ASSET REQUIREMENTS
Each Experience should include only the assets necessary to support its diagnostic reasoning.

Possible asset types:
- Industrial network topology.
- Equipment close-up.
- PLC diagnostic view.
- Switch port status.
- Configuration comparison.
- Register table.
- Communication trace.
- Protocol state diagram.
- Measurement or diagnostic evidence.
Rules:
- Use the existing asset organization.
- Reuse verified assets.
- Do not duplicate identical technical diagrams.
- Do not invent real-device screenshots.
- Synthetic diagnostic views must be clearly represented as simulations.
- Do not invent manufacturer-specific codes.
- Use correct protocol terminology.
- Ensure text and values are legible.
- Preserve consistent visual style.
- No unrelated decorative media.
For every Experience, verify that its evidence is consistent with its root cause.

11. EXPERIENCE IMPLEMENTATION PROCEDURE
For each phase from 04 through 13:
1. Confirm the previous phase has user approval.
2. Inspect one or two relevant existing Experiences.
3. Inspect the target Experience identifier.
4. Verify the target identifier is available or explicitly authorized for replacement.
5. Create the content using the existing schema.
6. Implement ES/EN.
7. Add or reuse required assets.
8. Register the Experience.
9. Activate its existing hotspot/navigation behavior.
10. Validate all decisions and branches.
11. Verify that the correct diagnosis is supported by evidence.
12. Verify recovery logic.
13. Run targeted validation.
14. Run relevant build checks.
15. Report.
16. STOP.
Do not create another Experience in the same execution.

12. PHASE 14 — FINAL QA
After all ten Experiences are approved, perform complete ENV-003 integration validation.

Verify:
Environment
- Correct metadata.
- Approved cover.
- Correct card display.
- Correct ES/EN localization.
- Ten Experiences registered.
Theory
- Exactly five visible blocks.
- Correct technical content.
- Five valid principal illustrations.
- Correct language switching.
Hotspots
- Ten hotspots.
- Correct Experience mapping.
- Desktop usability.
- Mobile usability.
- Correct progression behavior.
Experiences
- EXP-0021 through EXP-0030 load.
- All required stages are reachable.
- Decisions behave correctly.
- Feedback is technically consistent.
- Assets load.
- Recovery and completion work.
- Progress is recorded correctly.
- ES/EN content is complete.
Regression
- ENV-001 remains operational.
- ENV-002 remains operational.
- Existing Notebook functionality remains unaffected.
- No unrelated routes or components have changed.
Run the repository's relevant validation tools.

Do not claim that a test passed unless it was actually executed.

Report unresolved limitations explicitly.

STOP.

13. RESOURCE EFFICIENCY RULES
Optimize implementation effort without compromising engineering quality.
Repository inspection
- Read project instructions once per execution.
- Use targeted searches.
- Inspect representative examples.
- Do not repeatedly scan unrelated directories.
- Reuse the checkpoint to recover phase status.
- Reuse existing architecture knowledge when still valid.
Implementation
- Prefer minimal diffs.
- Avoid unnecessary refactoring.
- Avoid adding dependencies.
- Do not create alternative implementations.
- Do not rewrite unchanged content.
- Do not regenerate approved assets.
- Do not redesign approved UX.
- Do not implement future phases early.
Validation
- Run targeted tests first.
- Run broader checks when changes affect shared behavior.
- Avoid redundant repeated builds.
- Never skip essential validation merely to save time.
Technical research
- Prefer verified existing repository documentation.
- Use official manufacturer documentation when a device-specific fact must be checked.
- Do not invent values or error codes.
- If verification is unavailable, report the limitation.
Decision policy
Use existing repository conventions for implementation details.

Do not ask the user to decide routine filenames, component naming or formatting already established by the repository.

Stop and request a decision only when:
- Existing content may be destroyed beyond the approved replacement.
- A required approved asset is missing.
- A technical claim cannot be verified and is essential.
- An architectural change would be necessary.
- The current Experience ID conflicts with protected content.
- Existing UX cannot support the approved requirement safely.

14. REQUIRED REPORT AFTER EVERY PHASE
Respond in Spanish.

Use this exact report structure:
ENV-003 — FASE XX
Estado:
IMPLEMENTADA / BLOQUEADA
Cambios
- Archivos creados.
- Archivos modificados.
- Contenido implementado.
- Assets añadidos o reutilizados.
Validación
- Tests ejecutados.
- Build ejecutado.
- Resultado.
- Comprobaciones pendientes de revisión visual.
Incidencias
- Problemas detectados.
- Limitaciones técnicas.
- Riesgos o dependencias.
Revisión del usuario
Describe brevemente qué debe comprobar el usuario en la web antes de aprobar.
Siguiente fase
Indica la siguiente fase, pero NO la ejecutes.

Final line:

ESPERANDO VALIDACIÓN DEL USUARIO. SIN COMMIT NI PUSH.

15. START EXECUTION
Start with PHASE 01 only.

Inspect the repository, identify the previous ENV-003 and EXP-0021 content, verify dependencies, replace ENV-003 metadata and integrate the approved cover image.

Do not implement Theory, hotspots or Experiences yet.

If the approved cover file is missing, stop and request it.

Execute relevant validation, report results and wait for user approval.

DO NOT COMMIT OR PUSH.




Cómo validarás cada fase
Cuando Codex termine, revisas el resultado y utilizas una de estas órdenes. Son cortas porque el contrato completo ya define el trabajo.
Aprobar y continuar
 Copiar
Cuando has revisado la web y terminado tu commit/push.

FASE APROBADA. He validado los cambios y realizado el commit/push. CONTINUAR: ejecuta únicamente la siguiente fase pendiente del contrato ENV-003. Valida, informa y detente. No hagas commit ni push.


Solicitar correcciones
 Copiar
Cuando algo no funciona o visualmente no te convence.

NO APRUEBO LA FASE ACTUAL. Corrige únicamente los problemas que te indicaré, manteniendo el alcance de esta fase. No avances a la siguiente, no hagas commit ni push.


Consultar estado
 Copiar
Cuando abras otra sesión de Codex.

Lee el contrato y el checkpoint de ENV-003. Indica la última fase implementada, su estado de aprobación, los bloqueos y la siguiente fase pendiente. No modifiques archivos.


Dos detalles antes de comenzar
1. Portada aprobada. Debes colocar el archivo de la última imagen en el repositorio o proporcionárselo a Codex. El prompt le prohíbe sustituirla por otra imagen.

2. Persistencia del contrato. Para evitar que Codex pierda instrucciones al cambiar de sesión, recomiendo guardar el prompt maestro como docs/implementation/ENV-003-contract.md, siempre que esa ubicación encaje con la estructura real del repositorio. El checkpoint será un archivo distinto, mucho más pequeño, que registre las fases y aprobaciones.

Así mantenemos el flujo: implementación → QA de Codex → validación tuya → push → siguiente fase. Y si una Experience necesita correcciones, nos quedamos en ella hasta que esté aprobada.