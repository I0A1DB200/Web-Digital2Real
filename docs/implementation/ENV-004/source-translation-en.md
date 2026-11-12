# ENV-004 — new EN technical translation; human review pending

Source snapshot for traceability; active Notebook and Experience packages own runtime content. Not previously approved.

### NB-EL-01 · Voltage, current, resistance and a closed circuit
Voltage is the potential difference between two points (V); it is measured between two points. Current is the flow of electric charge (A); it requires a closed path and is measured in series or with a compatible clamp. Resistance represents opposition to current flow (Ω). Ohm's law, for an ohmic element under defined conditions, is `U = R × I`. It does not by itself describe nonlinear loads or motor transient behaviour. A coil, converter and motor must not be treated as fixed resistors.

In a 24 VDC control circuit, having 24 V relative to 0 V at one point does not prove that a load is powered: the reference, return path and voltage between its two terminals must be considered. An interrupted return conductor can leave an apparently correct reading at one terminal while the load does not operate. A high-impedance multimeter can also display ghost voltages due to coupling; an isolated reading does not confirm supply capability.

Worked example: a 240 Ω resistor connected to an ideal 24 VDC supply draws `I=24/240=0.10 A` and dissipates `P=U×I=2.4 W`. Real design checks rated power, tolerances, temperature and protection.

Self-check: what does a voltmeter connected between A1 and A2 of a coil measure? A) Coil current; B) potential difference applied to the coil; C) internal resistance. Correct: B. A confuses quantities; C requires a resistance-test procedure with the circuit isolated.

### NB-EL-02 · AC, DC, frequency and RMS values
In DC, polarity remains constant during normal steady operation; industrial 24 VDC supplies power PLCs, sensors and suitable coils. In AC, polarity alternates periodically; a 50 Hz supply completes 50 cycles per second. Stated mains voltages are usually RMS values, not peak values. For an ideal sinusoidal waveform, `U_peak = U_RMS × √2`; a 230 VAC supply has a peak of approximately 325 V relative to the corresponding reference. Instruments must suit the waveform, frequency, measurement category and environment.

Do not assume that any multimeter in AC mode correctly measures distorted or PWM signals. A drive's motor output requires manufacturer-specific procedures and instruments; do not extrapolate mains measurements.

Self-check: can a coil marked `24 VDC` be connected to `24 VAC` because both numbers are 24? A) Yes; B) No, voltage type and specification matter. Correct: B.

### NB-EL-03 · Power, energy and industrial loads
For ideal DC, `P=U×I` (W). Energy consumption is expressed in Wh or kWh: `E=P×t` when power is constant. For sinusoidal single-phase AC, `P=U×I×cosφ`; for balanced sinusoidal three-phase AC, `P=√3×U_LL×I_L×cosφ`. These expressions do not replace analysis of harmonics or imbalance. A motor draws starting current above its rated current depending on technology and starting method. Nameplate values, efficiency, power factor, load and protection influence diagnosis.

Worked example: a 48 W DC load at 24 V ideally requires 2 A. A supply rated at 2 A could be insufficient if there are starting peaks, derating or additional loads; the calculation does not authorize selection without margins.

Self-check: can two motors with equal mechanical power have different currents? True, because of efficiency, power factor, voltage and design.

### NB-EL-04 · Multimeters, clamps and interpreting measurements
A voltmeter is connected in parallel; a conventional ammeter requires a series configuration and suitable protection, whereas a compatible clamp measures current without opening the circuit. Resistance and continuity are measured with the circuit isolated, de-energized and verified; parallel branches can affect the result. A continuity buzzer only confirms an instrument threshold: it does not guarantee that a connection can carry rated current. Voltage drop under load can reveal contact resistance that is not evident in a continuity test.

Before trusting a reading, check AC/DC mode, range, probes, sockets, CAT category, instrument condition, measurement reference and circuit conditions. Energized measurements may only be performed by authorized professionals using risk assessment and an approved method. In these exercises, the learner interprets supplied readings.

Example: a conductor measures 0.3 Ω with the circuit isolated; without its length, cross-section, contacts and instrument accuracy, that value alone does not prove a defect.

Self-check: can continuity be measured with the supply on? No. An ohmmeter injects its own signal, and external voltage can damage equipment or create a hazard.

### NB-EL-05 · Measurement quality and differential diagnosis
A useful measurement must distinguish hypotheses. Recording which points, in which state, with which reference and when prevents incorrect conclusions. Distinguish no-load and loaded measurements, instantaneous values and trends, voltage between conductors and voltage relative to earth. Diagrams must identify the test point. Resolution and accuracy are not synonyms. A 24.0 V reading can coexist with an uncaptured intermittent dip; correlate events and records.

Self-check: a supply reads 24.1 V without load and 18.7 V during startup. Which observation best distinguishes the fault? The dip under load, always checked against demand, wiring and supply limits.

Block summary: identify quantity, reference, load condition and measurement limits before diagnosing.

### NB-EL-06 · Single-phase and three-phase supplies
A three-phase distribution has three phase conductors; depending on the system, it may include a neutral and a protective conductor PE. In a typical European 400/230 V system, 400 V is the voltage between phases and 230 V between phase and neutral, but the actual values must be read from the schematic and nameplate. PE is not neutral and must not be used as a functional return. PE continuity and configuration are safety matters requiring verification under applicable rules.

A three-phase motor can keep rotating after phase loss in some circumstances, with reduced torque, overcurrent and thermal risk. Do not assume it always stops immediately. Detection requires suitable protection and circuit analysis.

Self-check: does 400 V between L1-L2 mean 400 V between L1-N? No.

### NB-EL-07 · Industrial 24 VDC power supplies
A supply converts an admissible input (for example, 230 VAC) to a regulated DC output. Check rated voltage, maximum current, overload curves, temperature, derating, ripple, selectivity and branch distribution. Terminals `+24V` and `0V` are not automatically equivalent to `PE`. Some systems reference 0 V to earth by design; do not assume this without documentation.

Supplies may limit current, reduce voltage or disconnect during overload. A branch voltage dip may also be caused by a conductor, terminal, electronic fuse or return. Diagnosis compares supply-output and load readings with the current-demand condition.

Self-check: if there are 24 V at the supply output and 18 V at the load, is the supply necessarily defective? No; examine distribution and voltage drop in conductors/terminals.

### NB-EL-08 · Fuses, circuit breakers and overcurrent protection
A fuse interrupts by melting its element; a circuit breaker opens through defined trip mechanisms. Selection depends on voltage, current, breaking capacity, curve, let-through energy, conductor cross-section, short-circuit current and coordination. A tripped protective device is a symptom, not the root cause. Do not replace it with a higher rating to avoid trips. Before resetting, assess why it operated and verify the installation under an authorized procedure.

Distinguish overload (sustained excessive current) from short circuit (a very low-impedance path and high current). Trip timing and records may help but do not always identify the cause unambiguously.

Self-check: increasing a repeatedly tripping fuse from 2 A to 10 A without checking conductors or load is a valid correction. False.

### NB-EL-09 · RCDs, insulation and PE
A residual current device (RCD) compares currents through its active conductors and operates if the imbalance meets its tripping conditions. It does not itself replace overcurrent protection unless it is a combined device. An insulation fault can cause leakage current, but functional leakage and transients also exist; interpretation depends on equipment, RCD type and architecture. PE provides a protective path according to the earthing system; an RCD does not compensate for its absence.

An insulation test requires a de-energized circuit, sensitive electronics disconnected or protected as specified by the manufacturer, suitable test voltage and competent personnel. Experiences provide results of tests already performed by authorized personnel.

Self-check: if an RCD trips, is it safe to conclude there is a phase-to-neutral short circuit? No.

### NB-EL-10 · Selectivity, segregation and distribution
A cabinet must allow identification of the incoming supply, branch protection, power supplies, 24 V distribution, terminals and loads. Selectivity aims to make the appropriate protective device operate for a fault without unnecessarily cutting other circuits; it cannot be assumed without a study and manufacturer data. Segregating power, control, signals and communications reduces interference and facilitates maintenance. Labels, references and current documentation are diagnostic tools, not decoration.

Self-check: a sensor fault cuts all 24 V in the cabinet. Which design aspect should be reviewed? Distribution and protection coordination, without inferring the exact solution without a schematic.

Block summary: locate the energy source, affected branch, function of each protective device and trip condition.

### NB-EL-11 · Control versus power
The power circuit carries energy to the load (motor, heater, etc.). The control circuit processes conditions and operates elements such as contactor coils or control inputs. Voltage present in the power circuit does not prove a run permission exists. In a classic direct-on-line starter, the start command energizes a coil that closes the main contacts; an auxiliary contact can hold the command if the design permits it.

Self-check: a motor has voltage available upstream of its contactor and does not rotate. Is that enough to blame the motor? No; the contactor state and control conditions must be known.

### NB-EL-12 · Contactors, coils and auxiliaries
A contactor includes a coil (`A1/A2`), main contacts and auxiliary contacts. The coil must match its voltage, AC/DC type and duty. An NO contact is open in the device's reference state; an NC contact is closed in that state, which does not necessarily mean when the whole machine is off. Contacts are represented according to the applicable convention and specified reference state. Typical auxiliary designations may include `13-14` (NO) and `21-22` (NC), but verify the schematic and manufacturer.

Self-check: if rated voltage is present between A1-A2 during the command and the contactor does not operate, can you conclude the start pushbutton is open? No. The measured voltage directs investigation towards the coil, specification, connection or mechanism, with subsequent validation.

### NB-EL-13 · Pushbuttons, seal-in and interlocks
A classic start-stop circuit includes STOP NC, START NO and an NO seal-in auxiliary in parallel with START. When START is released, the coil stays energized if permission conditions remain satisfied. Electrical interlocking between reversing contactors prevents simultaneous commands, but applications that require it also use mechanical interlocking and suitable safety design. An emergency stop is not simply a process STOP pushbutton: its function is defined by risk assessment and safety architecture.

Self-check: the motor only runs while START is held. Possible causes include a seal-in auxiliary that does not close, interrupted seal-in wiring or logic that does not latch; replacing START alone is not justified.

### NB-EL-14 · Three-phase motors, nameplates and overload relays
The nameplate provides voltage, connection, rated current, frequency, power and other data. In direct-on-line starting, the contactor switches power and an overload device protects against thermal conditions within its application. Settings must be based on the nameplate, schematic, starting method and manufacturer documentation. High current may arise from mechanical load, electrical fault, abnormal voltage or incorrect connection; a tripped relay alone does not show which one.

Self-check: if current rises when a conveyor jams, which hypothesis takes priority? Increased mechanical load, checked against electrical and mechanical data.

### NB-EL-15 · Relays, timers and PLC outputs
PLC outputs may be transistor or relay types, with different limits; not every output can directly power any coil. Consider consumption, transient suppression, polarity, return, fuses and isolation. An interposing relay may separate a control output from the load but adds failure points. Timers may be electrical or logical; diagnosis must distinguish the software command from the physical element's state.

Self-check: `Q0.0=TRUE` in a Watch Table means KM1 necessarily receives 24 V. False: it indicates the logical output state, not wiring continuity or effective voltage across the coil.

Block summary: follow permission, command, output, wiring, coil, contacts and load as different links.

### NB-EL-16 · Symbols and conventions
Schematics use standardized symbols and reference-state conventions. A real connection cannot be inferred from the graphical proximity of two symbols: connection identifiers, references, potentials and numbering govern. Drawings must include a legend and revision. Switch, coil, fuse, earth, motor and auxiliary-contact symbols must have correct electrical semantics, not be freely generated for appearance.

Self-check: can a KM1 contact drawn on another sheet belong to the same contactor? Yes, through its designation and cross-reference.

### NB-EL-17 · Designations and cross-references
Consistent designations (`-QF1`, `-F1`, `-KM1`, `-X1`, `-M1`) help locate protection, contactors, terminal blocks and motors. Letters and numbers must follow the project's convention; do not assume every prefix is universally applicable. A cross-reference links coil and contacts or continuity between pages. An obsolete revision may lead to searching for a nonexistent terminal.

Self-check: a drawing shows `-KM1:13-14` on sheet 4. What should be located? The identified auxiliary contact of KM1, not another device numbered 13.

### NB-EL-18 · Terminals, potentials and numbering
A terminal block (`-X1`) is a connection point and may permit disconnection for testing depending on its model. `X1:5` identifies a terminal; the wire number may differ. Potentials `+24V`, `0V`, `L1`, `N`, `PE` have different functions. Diagnosis follows source → protection → terminal → cable → load → return. An open return is as relevant as an open supply conductor.

Self-check: there are 24 V at `X1:5` relative to cabinet 0 V, but the sensor does not work. What remains to verify? Voltage and return at the sensor terminals, load conditions and the sensor's own state.

### NB-EL-19 · Reading control schematics
Read from the control supply towards the return, identifying series contacts (simultaneous conditions) and parallel branches (alternative paths). A protective NC contact opens when its device operates; a seal-in branch maintains energy after START is released. Complex drawings separate safety, process permissions, PLC command and power; an absent condition can block the sequence without an electrical failure.

Self-check: if STOP NC is open, can START energize the coil in a classic series circuit? No, unless alternative paths not shown exist, which must be investigated.

### NB-EL-20 · Traceability and revision control
Reproducible diagnosis cites drawing, revision, equipment, terminals, machine state, measurements and conclusion. Never physically change a wire just because the drawing says so without verifying actual identification and procedure. After an authorized repair, update documentation, markings and the intervention record. Use the same nomenclature in Notebook, evidence, Experience and schematics.

Self-check: which matters more when diagnosing a discrepancy: a drawing without a revision, or verified and documented physical identification? Traceable evidence and investigation of the discrepancy; do not improvise modifications.

Block summary: each symbol must correspond to a component, each conductor to a potential and each conclusion to identifiable evidence.

### NB-EL-21 · Diagnostic method
1) Bound the symptom and conditions of occurrence; 2) identify the affected function and current drawing; 3) generate hypotheses that can be distinguished from one another; 4) review alarms, records and existing measurements; 5) choose the next check with greatest diagnostic value; 6) isolate the cause; 7) correct under an authorized procedure; 8) verify function and protection; 9) document. Avoid confirmation bias towards the first hypothesis and replacing components by elimination.

Self-check: three sensors fail simultaneously. What should be investigated before replacing them individually? Common elements: supply, protection, return, module and shared cable.

### NB-EL-22 · Isolation, lockout and proving absence of voltage
Before opening or intervening in a real circuit, apply the corresponding isolation and lockout procedure, identify all sources (including UPS, capacitors and backfeeds), prevent restoration, prove absence of voltage with an appropriate method and instrument, and control residual energy. The specific sequence is defined by the installation procedure and qualified personnel. An HMI in STOP or a PLC in STOP is not electrical isolation.

Self-check: pressing STOP permits measuring coil continuity. False: a process STOP does not guarantee absence of voltage.

### NB-EL-23 · Diagnosis by comparison and under load
Comparing a healthy and faulty branch can identify differences in voltage, current, protection state or signals. Voltage drop is proportional to current and resistance under appropriate conditions (`ΔU≈I×R`); a deteriorated terminal may show normal voltage without load and a substantial drop when current flows. Thermography or a hot spot provides clues but does not replace measurements and analysis.

Self-check: 24 V without load and 17 V with load at the cable end. Which hypothesis gains support? Excessive series resistance or a supply unable to sustain demand, distinguished by measuring source and end in the same state.

### NB-EL-24 · Insulation and leakage
An insulation fault is an unintended current path between conductors or towards conductive parts. Symptoms include RCD trips, insulation alarms or intermittent behaviour due to moisture. Insulation resistance is measured with suitable equipment and test voltages only on an isolated and prepared installation, disconnecting sensitive electronics as specified by the manufacturer. An isolated reading must be interpreted against the applicable standard, voltage, temperature, topology and equipment limits.

Self-check: applying 500 VDC from an insulation tester directly to a PLC output to locate leakage is valid. False.

### NB-EL-25 · Verification, recurrence and documentation
A correction is verified when the function is demonstrated to be restored, the symptom does not recur under representative conditions, protective devices retain their function and records are coherent. A replacement that makes the machine start without explaining the mechanism may leave a latent risk. Document cause, before/after evidence, authorized intervention, tests and verification limits.

Self-check: after tightening a terminal, the motor recovers; is closing the incident enough? No: document and verify connections, operation and causes of loosening according to procedure.

Block summary: safety, evidence and verification are parts of reasoning, not administrative appendices.


## EXP-EL-01 · 24 VDC Supply Voltage Collapse
**ES:** 24 VDC supply voltage collapses at startup. **Dificultad:** foundation. **Notebook:** 01, 04, 07, 21, 23.

**Escenario:** a conveyor stops when two solenoid valves are activated. The PLC stays powered, but a remote I/O module restarts. Supply `-PS1` is rated 24 VDC / 5 A; two branches feed the PLC (1.2 A) and actuators (usual load 2.0 A, documented peak 5.5 A). The supply records current limiting when both valves operate simultaneously. Simulation values: 24.2 V without actuation; 17.8 V during the peak at PS1 terminals; recovery to 24.1 V when the command ends.

**Causa raíz:** simultaneous transient demand exceeds PS1's specified dynamic capability; the supply enters current limiting. Do not confuse this with a defective cable because the voltage also drops at PS1's own terminals.

**D1 · Which data should be requested first?** A) Module restarts correlated with activation and the PS1 voltage trend. **Correcta:** links the symptom to the supply. B) PLC firmware version. **Incorrecta:** does not distinguish a voltage fault. C) Replace the remote module. **Incorrecta:** replaces without evidence.

**D2 · What does 24.2 V at rest mean?** A) The supply is definitely healthy. **Incorrecta:** does not prove loaded response. B) Voltage is correct only for that state; startup still needs observation. **Correcta.** C) A permanent short circuit. **Incorrecta:** no evidence supports it.

**D3 · The supply drops to 17.8 V at its own terminals. Which hypothesis takes priority?** A) Only the cable between supply and module. **Incorrecta:** does not explain the drop at the source. B) Supply current limiting or internal fault; compare demand and specification. **Correcta.** C) Speed sensor failure. **Incorrecta:** does not explain the supply behaviour.

**D4 · The record shows a 5.5 A peak plus 1.2 A for the PLC. What follows?** A) The total exceeds the 5 A rating; review transient capability and simultaneity. **Correcta:** the simulated 6.7 A warrants investigating the limit. B) Every 5 A supply supports 10 A indefinitely. **Incorrecta.** C) The PLC draws zero current during startup. **Incorrecta.**

**D5 · Which verification closes the case?** A) Restart the PLC once. **Incorrecta.** B) Replace the supply with any 24 V unit. **Incorrecta:** sizing, protection and approval are required. C) After an approved engineering solution, record voltage at PS1 during the worst startup and confirm no restarts. **Correcta.**

**Evidencias:** E1 PS1→F1 PLC / F2 actuator schematic; E2 synchronized restart log; E3 PS1 24.2→17.8 V curve and 6.7 A peak; E4 post-correction curve within design limits. **Resolución:** redistribute/limit simultaneous demand or size supply and protection according to the manufacturer; do not select a model without calculation. **Verificación:** repeated worst case, stable record, protection retained. **Seguridad:** simulated records; do not deliberately test overload on a real cabinet.

## EXP-EL-02 · Contactor Does Not Energize
**ES:** Contactor does not energize. **Dificultad:** foundation. **Notebook:** 04, 11–13, 19, 21.

**Escenario:** pressing START does not close `-KM1`. The 24 VDC control circuit is `+24V → -S0 STOP NC → -F2 protective NC contact → -S1 START NO → -KM1:A1 → A2:0V`, with an NO KM1 seal-in auxiliary. Authorized personnel's records: +24 V at S0 input; +24 V at S0 output; +24 V at F2 output; 0 V at S1 output while START is pressed; A2 return verified. S1 has an internal mechanical contact opening.

**Causa raíz:** start contact `-S1` fails to close despite mechanical actuation. Do not confuse it with a defective coil: the coil does not receive rated voltage.

**D1:** A) Examine the permission sequence in the schematic and readings along the path. **Correcta:** localizes the interruption. B) Replace KM1. **Incorrecta:** coil supply has not been tested. C) Replace the motor. **Incorrecta:** does not explain the control fault.

**D2:** A) STOP is open because it is called STOP. **Incorrecta:** NC is closed at rest. B) +24 V before and after S0 indicates functional continuity in that state. **Correcta.** C) The supply is at 0 V. **Incorrecta.**

**D3:** A) F2 must have tripped. **Incorrecta:** +24 V is present downstream. B) The return is the only possible cause. **Incorrecta:** it has already been verified. C) The interruption is between F2 output and S1 output with START pressed. **Correcta.**

**D4:** A) Confirm S1's failure to close using an isolated test and documentation. **Correcta.** B) Bridge S1 to leave production running. **Incorrecta:** not an acceptable repair. C) Change F2's rating. **Incorrecta.**

**D5:** A) Coil noise is sufficient. **Incorrecta.** B) After authorized S1 replacement, verify start, stop, seal-in and protection. **Correcta.** C) Disable STOP to prevent recurrence. **Incorrecta.**

**Evidencias:** E1 complete control schematic; E2 potential table at S0/F2/S1; E3 isolated S1 test record; E4 start/stop and seal-in test. **Resolución:** replace S1 with an approved equivalent and correct documentation. **Seguridad:** do not bypass STOP or protection.

## EXP-EL-03 · Motor Overload Trip
**ES:** Motor overload trip. **Dificultad:** intermediate. **Notebook:** 03, 08, 14, 21, 25.

**Escenario:** conveyor motor `-M1` has a 400 V / 3.2 A nameplate rating, with its overload relay set and documented at 3.2 A. After production increases, recorded line currents are 4.5/4.4/4.6 A and the relay trips with a delay. Phase-to-phase voltages are balanced, with no phase loss. Mechanical record: a return roller has abnormal resistance; after decoupling and checking under the procedure, mechanical resistance exceeds the historical reference.

**Causa raíz:** mechanical overload caused by a deteriorated roller; thermal protection operates correctly.

**D1:** A) Increase the relay setting until it stops tripping. **Incorrecta:** removes margin without justification. B) Correlate currents, nameplate and mechanical load. **Correcta.** C) Replace the PLC. **Incorrecta.**

**D2:** A) 4.5 A versus 3.2 A demonstrates current above the rating. **Correcta.** B) It is normal because the motor rotates. **Incorrecta.** C) It proves a bolted short circuit. **Incorrecta.**

**D3:** A) Phase loss is confirmed. **Incorrecta:** three similar currents and balanced voltages do not support it. B) The supply must be incorrect. **Incorrecta.** C) Prioritize mechanical overload or motor condition; request mechanical evidence. **Correcta.**

**D4:** A) The roller's abnormal resistance explains increased load, subject to post-repair confirmation. **Correcta.** B) The relay is defective because it trips. **Incorrecta.** C) The relay can be bypassed. **Incorrecta.**

**D5:** A) Only clear the alarm. **Incorrecta.** B) After repairing the roller, verify currents within limits and protection operational. **Correcta.** C) Reduce speed without investigating. **Incorrecta:** may hide the problem.

**Evidencias:** E1 M1 nameplate and starter schematic; E2 I_L1/I_L2/I_L3 trend and trip; E3 roller record; E4 post-repair currents and protection test under the procedure. **Resolución:** mechanical repair and confirmation of the correct setting, without increasing protection to compensate for load.

## EXP-EL-04 · Single Phase Loss
**ES:** Motor phase loss. **Dificultad:** intermediate. **Notebook:** 06, 08, 14, 18, 21.

**Escenario:** motor `-M2` does not start reliably; it hums and protection operates. An authorized record with the contactor closed under controlled test conditions gives phase-to-phase voltages upstream of `-KM2`: 400/401/399 V; downstream: L1-L2 400 V, L2-L3 0 V, L1-L3 400 V (idealized teaching data, with defined reference and state). Isolated inspection identifies an open KM2 pole due to contact failure on L3, cross-checked with continuity/mechanical state according to the manufacturer.

**Causa raíz:** KM2's L3 pole does not conduct, causing phase loss in the power circuit. Warning: with connected motors and induced/backfed voltages, actual readings may differ; this case uses an idealized isolated model and relies on pole inspection and comparison under an authorized procedure, not the voltage pattern alone.

**D1:** A) Review three-phase distribution before and after protection and contactor. **Correcta.** B) Change rotation direction. **Incorrecta.** C) Disable the overload relay. **Incorrecta.**

**D2:** A) The upstream three-phase supply is approximately balanced. **Correcta.** B) L1 must be absent. **Incorrecta.** C) There are 230 V between every pair of phases. **Incorrecta.**

**D3:** A) The anomaly is downstream of KM2 or in the measurement/load; investigate each pole. **Correcta.** B) The incoming transformer is proven defective. **Incorrecta.** C) The before/after difference does not matter. **Incorrecta.**

**D4:** A) Replace fuses without inspection. **Incorrecta.** B) The isolated test confirms KM2's L3 pole is open. **Correcta.** C) The PLC has reversed two phases. **Incorrecta.**

**D5:** A) Reset and produce. **Incorrecta.** B) Replace the motor directly. **Incorrecta.** C) Authorized KM2 replacement, review of the damage cause and three-phase/start/protection checks. **Correcta.**

**Evidencias:** E1 L1/L2/L3, KM2 and M2 three-phase schematic; E2 before/after comparison table; E3 isolated L3 pole inspection record; E4 post-repair verification. **Resolución:** use a contactor compliant with the design; investigate wear/terminals and coordination.

## EXP-EL-05 · Auxiliary Circuit Protection Trip
**ES:** Auxiliary circuit protection trips. **Dificultad:** intermediate. **Notebook:** 07–10, 18, 21, 24.

**Escenario:** electronic fuse `-F24.2` on a 24 VDC branch disconnects when solenoid valve `-Y2` is commanded; other branches stay active. PS1 maintains 24.1 V; the F24.2 record shows very high fault current and disconnection. Isolated inspection reveals damaged insulation on Y2's cable, with +24 V–0 V conductor contact inside a cable duct; Y2's coil is separated and checked with no anomaly.

**Causa raíz:** short circuit in Y2's cable downstream of F24.2; protection fulfils its function.

**D1:** A) Identify exactly which protection and branch disconnect. **Correcta.** B) Replace the main supply. **Incorrecta.** C) Increase F24.2's limit. **Incorrecta.**

**D2:** A) All cabinet 24 V supplies have failed. **Incorrecta:** other branches operate. B) The defect is associated with Y2's branch or its load. **Correcta.** C) The PLC is in STOP. **Incorrecta.**

**D3:** A) F24.2 must be defective. **Incorrecta.** B) The valve is mechanically blocked. **Incorrecta:** does not explain short-circuit current. C) Seek an insulation fault or shorted load using an isolated procedure. **Correcta.**

**D4:** A) The cable with +24 V and 0 V in contact confirms the cause; F24.2 must not be bypassed. **Correcta.** B) Reset repeatedly until stable. **Incorrecta.** C) Replace with a higher-rated fuse. **Incorrecta.**

**D5:** A) Only clear the event. **Incorrecta.** B) Repair wiring to specification, inspect its route and verify selective tripping/function. **Correcta.** C) Leave Y2 disconnected without documenting it. **Incorrecta.**

**Evidencias:** E1 24 V distribution with F24.1/F24.2; E2 protection log; E3 isolated cable inspection; E4 branch and function tests after repair. **Resolución:** replace the section and correct mechanical cable protection.

## EXP-EL-06 · Open Return Conductor
**ES:** An open conductor prevents valve activation. **Dificultad:** foundation-intermediate. **Notebook:** 01, 04, 18, 20, 21.

**Escenario:** PLC output `Q0.3` is active, but solenoid valve `-Y3` does not switch. Wiring: `Q0.3 → X2:7 → Y3:A1`; `Y3:A2 → X2:8 → 0V`. Test record: Q0.3 output 24 V relative to cabinet 0 V; A1 24 V relative to cabinet 0 V; A2 24 V relative to cabinet 0 V due to the open return and coupling through the coil; A1-A2 = 0 V under command. With the installation isolated, continuity between X2:8 and the 0 V return is open.

**Causa raíz:** interrupted 0 V return between X2:8 and the 0 V bar. The PLC commands, but there is no closed circuit.

**D1:** A) Check effective voltage across Y3 terminals and the return. **Correcta.** B) Change the PLC program. **Incorrecta.** C) Replace Y3 without measurement. **Incorrecta.**

**D2:** A) Q0.3=TRUE confirms Y3's complete supply. **Incorrecta.** B) Q0.3=TRUE only confirms the logical state; the electrical path must be checked. **Correcta.** C) The position sensor must be the cause. **Incorrecta.**

**D3:** A) A1=24 V and A2=24 V relative to cabinet 0 V, with 0 V across A1-A2, suggests an open return or another reference fault. **Correcta.** B) The coil receives 24 V. **Incorrecta.** C) The supply delivers 48 V. **Incorrecta.**

**D4:** A) Replace the PLC output. **Incorrecta.** B) The isolated open-circuit test between X2:8 and the 0 V bar locates the interrupted return. **Correcta.** C) Bridge to PE as a return. **Incorrecta y peligroso.**

**D5:** A) After authorized conductor repair, verify A1-A2 voltage under command and Y3 actuation. **Correcta.** B) Use PE as the permanent return. **Incorrecta.** C) Close the incident because Q0.3=TRUE. **Incorrecta.**

**Evidencias:** E1 schematic with X2:7/X2:8; E2 Q0.3 Watch; E3 point-to-point voltage table and isolated continuity; E4 correct actuation. **Resolución:** repair and trace the return, without changing logic.

## EXP-EL-07 · Incorrect NO/NC Contact
**ES:** Installed contact does not match the schematic. **Dificultad:** intermediate. **Notebook:** 12, 13, 16–20.

**Escenario:** after maintenance, the run command for `-KM3` is only enabled when STOP pushbutton `-S3` is physically pressed. The approved drawing requires an NC contact in series with control; the installed contact assembly was accidentally wired to NO pair `13-14` instead of NC `21-22`. State record: 13-14 open at rest, closed when pressed; control sees an inverted permission.

**Causa raíz:** connection to an NO contact in a function requiring NC according to the design. Important: do not confuse a process STOP with a safety emergency-stop function; this scenario does not modify a safety circuit.

**D1:** A) Review correspondence between physical state, drawing and terminals. **Correcta.** B) Immediately invert PLC bits. **Incorrecta.** C) Replace the motor. **Incorrecta.**

**D2:** A) `13-14` is NO on the documented component. **Correcta.** B) All 13-14 contacts are NC. **Incorrecta.** C) NO/NC depends on wire colour. **Incorrecta.**

**D3:** A) Permission appearing when S3 is pressed is consistent with accidental NO use. **Correcta.** B) It proves phase loss. **Incorrecta.** C) The contactor is welded. **Incorrecta.**

**D4:** A) Leave the behaviour and change the HMI text. **Incorrecta.** B) Verify under isolation that 13-14 was used instead of 21-22 and restore the approved drawing's arrangement. **Correcta.** C) Bypass S3. **Incorrecta.**

**D5:** A) After authorized correction, check STOP and START at rest/when actuated and seal-in. **Correcta.** B) Start only once. **Incorrecta.** C) Remove the stop contact. **Incorrecta.**

**Evidencias:** E1 S3 NC 21-22 schematic; E2 technical photograph or drawing of the contact block with terminals; E3 state table; E4 validated control sequence. **Resolución:** restore wiring to the drawing and record the maintenance deviation.

## EXP-EL-08 · Incorrect Motor Rotation
**ES:** Motor rotates in the wrong direction. **Dificultad:** intermediate. **Notebook:** 06, 14, 16–18, 25.

**Escenario:** after replacement of three-phase motor `-M4` on a conveyor, rotation is opposite to the intended direction. The motor is direct-on-line with no drive. The approved terminal schematic documents `L1→U1, L2→V1, L3→W1`; isolated wiring inspection finds `L1→V1, L2→U1, L3→W1`. The phase sequence applied to the motor is reversed relative to the validated installation.

**Causa raíz:** two phases were interchanged at the motor terminals during replacement. Actual correction requires lockout, competent personnel and verification of mechanical risks; no energized operation is proposed.

**D1:** A) Confirm drive type and connection documentation. **Correcta.** B) Change PLC rotation direction without verifying the circuit. **Incorrecta.** C) Disable thermal protection. **Incorrecta.**

**D2:** A) With three-phase direct-on-line starting, interchanging two phases can reverse rotation. **Correcta.** B) Neutral always determines rotation. **Incorrecta.** C) Rotation depends only on the PLC. **Incorrecta.**

**D3:** A) The motor must have an internal fault. **Incorrecta.** B) The schematic and actual connection show L1/L2 interchanged. **Correcta.** C) Frequency must be 60 Hz. **Incorrecta.**

**D4:** A) Reconfigure terminals to the drawing under an authorized procedure after isolation. **Correcta.** B) Change phases with the motor energized. **Incorrecta y peligroso.** C) Reverse protective earth PE. **Incorrecta y peligroso.**

**D5:** A) Checking no-load rotation without protection is sufficient. **Incorrecta.** B) Verify direction, load, guards, interlocks and documentation in an authorized test. **Correcta.** C) Keep reverse rotation because the motor operates. **Incorrecta.**

**Evidencias:** E1 U1/V1/W1 terminal schematic; E2 observed direction record; E3 approved versus actual connection table; E4 direction verification after correction. **Resolución:** restore the sequence according to design.

## EXP-EL-09 · Excessive Voltage Drop at Terminal
**ES:** Voltage drop due to a defective connection. **Dificultad:** intermediate. **Notebook:** 01, 04, 07, 18, 23.

**Escenario:** 24 VDC actuator `-Y4` works without load but fails on actuation. PS2 maintains 24.1 V during the command. At Y4, records show 23.9 V without load and 16.9 V under a 1.4 A load. The difference occurs mainly at terminal `-X4:12`; an authorized technical record shows a 6.8 V drop across that connection under load. With the circuit isolated, inspection identifies tightening outside specification and thermal damage at the terminal.

**Causa raíz:** high contact resistance at X4:12; at 1.4 A, a 6.8 V drop corresponds to an approximate equivalent resistance of 4.9 Ω in that state. Constant resistance with temperature is not assumed.

**D1:** A) Compare supply and load voltage in the same operating state. **Correcta.** B) Measure only without load. **Incorrecta.** C) Replace the PLC. **Incorrecta.**

**D2:** A) PS2=24.1 V and Y4=16.9 V under load indicate a distribution voltage drop. **Correcta.** B) The supply drops to 16.9 V. **Incorrecta.** C) Y4 receives 24.1 V. **Incorrecta.**

**D3:** A) 6.8 V across X4:12 under load is abnormal for a connection intended to have low resistance. **Correcta.** B) It is the normal drop of any terminal. **Incorrecta.** C) It proves a program error. **Incorrecta.**

**D4:** A) Remove the fuse to reduce resistance. **Incorrecta.** B) Isolated inspection confirms terminal deterioration; repair to specification. **Correcta.** C) Increase the supply output to 31 V to compensate. **Incorrecta y arriesgado.**

**D5:** A) Verify voltage drop under load after repair and review heating and terminal condition. **Correcta.** B) Close the case when 24 V is seen without load. **Incorrecta.** C) Replace Y4 without evidence. **Incorrecta.**

**Evidencias:** E1 PS2-X4-Y4 schematic; E2 no-load/loaded table; E3 localized X4:12 drop and inspection report; E4 stable-voltage record after repair. **Resolución:** repair the connection and investigate the deterioration cause.

## EXP-EL-10 · Insulation Fault to Protective Earth
**ES:** Insulation fault to exposed conductive parts. **Dificultad:** intermediate. **Notebook:** 09, 22, 24, 25.

**Escenario:** when machine heater `-EH1` is activated, RCD `-RCD1` trips. There is no overcurrent evidence at the associated circuit breaker. Moisture is observed in the terminal box. After lockout, disconnection of electronics and preparation by authorized personnel, an appropriate insulation test records abnormally low resistance between EH1's circuit and its PE-connected enclosure compared with the limits applicable to the assembly. The test is documented without publishing a universal voltage or threshold, as these depend on equipment and standard.

**Causa raíz:** moisture-assisted insulation degradation in EH1, with leakage to PE-connected parts. The RCD operates; it must not be bypassed to maintain production.

**D1:** A) Distinguish an RCD trip from an overcurrent trip. **Correcta.** B) Increase the circuit breaker's rated current. **Incorrecta.** C) Bypass RCD1. **Incorrecta y peligroso.**

**D2:** A) The RCD measures thermal overload only. **Incorrecta.** B) The trip is consistent with residual current; its origin must be located. **Correcta.** C) It proves a PLC fault. **Incorrecta.**

**D3:** A) Correlation with EH1 and moisture prioritizes the heater circuit and insulation. **Correcta.** B) Neutral is definitely disconnected. **Incorrecta.** C) Replace the conveyor motor. **Incorrecta.**

**D4:** A) Measure insulation with EH1 energized. **Incorrecta y peligroso.** B) Interpret the insulation test already performed on an isolated, prepared circuit according to specification. **Correcta.** C) Disconnect PE to prevent leakage. **Incorrecta y peligroso.**

**D5:** A) After authorized repair and appropriate drying/replacement, repeat electrical checks and protection-function verification. **Correcta.** B) Reset the RCD indefinitely. **Incorrecta.** C) Leave PE disconnected. **Incorrecta.**

**Evidencias:** E1 RCD1/EH1/PE schematic; E2 events correlated with EH1 command; E3 inspection and isolated insulation-test report with manufacturer-specific criteria; E4 final verification result and operational protection. **Resolución:** locate and correct the affected component/connection, control moisture ingress and verify under an authorized protocol.
