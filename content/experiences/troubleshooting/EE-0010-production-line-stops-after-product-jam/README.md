# EE-0010 — Production Line Stops After Product Jam

Experience Engine V2 scenario for system-level causal diagnosis across physical process, field signal, PLC logic, sequence state, commands, actuators, and HMI symptoms.

The canonical cause is a small product residue legitimately detected by `B3_TransferSensor`. Recovery removes the obstruction safely and verifies `TransferClear`, T40, S41, actuator commands, and repeated normal cycles without forcing or bypassing.

## Learning and media remap

Eight diagnostic/action moments replace the former seven: D7 safely inspects B3 before D8 removes the confirmed residue and verifies recovery. Existing recovery stage/decision IDs are retained (STAGE-07-PHYSICAL-RECOVERY / DEC-07-SAFE-REMOVE-VERIFY); D7 inspection has a separate authority. The original final reward is split 4 + 6, preserving total correct-path score; scoring policy is unchanged.

Cover ART-001. Ordered stage media: [ART-002], [ART-003], [], [ART-004], [ART-005], [], [ART-007], [ART-008]. EVID-01 is initial/context with []; EVID-02 through EVID-09 are acquired: [ART-003], [], [ART-004], [ART-005], [], [ART-007], [ART-008], [ART-009]. Completion [ART-009]. Six Results: D1, D3, D4, D6, D7, D8; D2/D5 direct. No multi-evidence Results. Recovery and completion occur only after D8 verification, before presentation-only Continue.

Actual pixels: ART-001 editorial cover; ART-002 incident HMI symptoms; ART-003 network topology does not independently prove PLC RUN, SafetyReady or communication health (authored diagnostic observations do); ART-004 shows both conveyor and pusher commands, so it follows D3, not D2. ART-005 shows S40/T40; ART-006 remains registered but hidden: its TransferClear address conflicts with ART-007 and its tag comment anticipates the logical relationship before D6. No address is promoted into canonical engineering facts. ART-007 illustrates the traced LAD relationship; ART-008 shows the observed residue; ART-009 shows S41 active, while repeated recovery is established by the authored functional test.

Initial common-system health and physical-cause hints are removed. Safety prerequisites are visible before physical inspection and removal; SafetyReady is not authorization to intervene. No new procedure or measurement is invented. No Engine or image changes. Browser QA pending globally.
