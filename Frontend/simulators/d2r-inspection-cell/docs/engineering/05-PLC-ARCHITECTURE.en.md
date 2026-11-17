# 05 · PLC architecture: OB, FC, FB, DB, UDT, and tags

**Status:** teaching proposal v0.3 approved for teaching use · TIA Portal to be confirmed
**Objective:** organize responsibilities and data ownership so the program is readable, testable, and extensible.

## Data layers

1. **Hardware I/O:** process image and channel diagnostics tied to the approved physical configuration.
2. **Raw data:** sensor readings, drive/valve states, and camera data, preserving source quality.
3. **Commands:** operator and external-interface requests, validated before entering the sequence.
4. **States and alarms:** PLC-owned, with causes, active/acknowledged state, and defined recovery.
5. **HMI/vision interface:** stable DB with agreed types, units, permissions, and version.

The PLC should own cycle state and production counters. The camera owns a capture result until the PLC validates it and associates it with a part. HMI and Watch observe/write only authorized fields. This architecture is a proposal; no PLC project exists for this cell.

## Proposed block allocation

| Proposed block | Responsibility | Associated data |
| --- | --- | --- |
| `OB1 (Main)` | Call equipment blocks and coordinate the cyclic sequence. | No long station logic. |
| `FB10_CellSequence` | Modes, transitions, commands, and global status. | `DB_CellSequence` as instance DB. |
| `FB20_Feeder` | Feeding and part confirmation. | `DB_Feeder` instance. |
| `FB30_Conveyor` | Transport command and diagnostics. | `DB_Conveyor` instance. |
| `FB40_VisionInterface` | Camera trigger, handshake, result, and diagnostics. | `DB_VisionInterface` instance and exchange structure pending protocol selection. |
| `FB50_Sorter` | Classification, pusher, and outputs. | `DB_Sorter` instance. |
| `FC10_ValidateCommands` | Stateless validations where useful. | Explicit input/output parameters. |
| `DB_HMI_Interface` | Stable interface for commands, status, counters, and visible alarms. | Shared interface types. |

These names are teaching IDs, not blocks that already exist. `OB1` is the block identifier; `Main` is the proposed symbolic name. In TIA Portal, an FB retains static data in its instance DB; an FC has no instance DB of its own. A global DB contains shared data. A UDT defines a reusable structure; it does not execute logic.

## UDTs and traceability

Review `UDT_CellCommand`, `UDT_CellStatus`, `UDT_AlarmEntry`, and `UDT_VisionExchange` as candidates. Separate commands, status, configuration, raw data, and alarms when they have different consumers. Every field needs an owner, type, unit, range, update cycle, and validity rule. The camera's internal job/database and the PLC exchange DB are separate objects; confirm whether the Cognex model needs a recipe, job number, or result storage.

Safety must be designed and validated in its appropriate architecture; it is not replaced by a standard FB or the simulator's `SafetyReady` field.

**Verification:** review calls, instance DBs, interfaces, HMI access, and absence of duplicate writes to the same data.<br>
**Pending:** CPU/firmware, naming standards, communication requirements, number of instances, and software-team boundaries.

## Proposed project tree

```text
PLC
├── PLC tags
│   └── DI_* / DO_*               (symbolic tags; I/Q mapping follows hardware selection)
├── PLC data types
│   ├── UDT_CellCommand
│   ├── UDT_CellStatus
│   ├── UDT_VisionExchange
│   └── UDT_AlarmEntry
└── Program blocks
    ├── OB1 (Main)
    ├── FB10_CellSequence         + DB_CellSequence
    ├── FB20_Feeder               + DB_Feeder
    ├── FB30_Conveyor              + DB_Conveyor
    ├── FB40_VisionInterface       + DB_VisionInterface
    ├── FB50_Sorter                + DB_Sorter
    ├── FC10_ValidateCommands
    └── DB_HMI_Interface           (global operator/diagnostic DB)
```

In TIA Portal, `PLC tags` contains symbolic names linked to addresses or signals; global and instance DBs are organized with the program blocks. `DB_HMI_Interface` is global; DBs associated with FBs are instance DBs. This teaching tree must be adapted to the TIA version, project standards, diagnostics needs, and actual size. No blocks have been created in TIA Portal.

## What each TIA element does

| Element | What it contains/executes | Fit for this case | Design decision |
| --- | --- | --- | --- |
| OB | CPU entry point per cycle or event. | `OB1 (Main)` coordinates cyclic work. Startup/diagnostic OBs only if hardware/requirements need them. | Avoid placing the whole sequence in OB1. |
| FC | Callable logic without its own instance DB. | Range checks, unit conversions, structure preparation. | Prefer explicit inputs/outputs and avoid hidden global dependencies. |
| FB | Logic with per-instance static memory. | Cell sequence, feeder, conveyor, vision, and sorter. | Each instance retains its own state, timers, and diagnostics. |
| Instance DB | Data private to an FB instance. | `DB_Feeder`, `DB_Conveyor`, `DB_Sorter`, etc. | Do not expose all private state to HMI without a need. |
| Global DB | Shared data with an agreed interface. | HMI, camera exchange, authorized configuration. | Define an owner and write permissions per field. |
| UDT | Reusable composite type. | Command, status, alarm, and vision data structures. | Version interface changes and review compatibility. |

A module-diagnostic organization block (for example, a module-fault event) depends on the CPU, modules, and configuration. No specific OB is prescribed without a hardware inventory.

## Candidate data schemas

The fields below are a proposal for review. Validate them with software, HMI, vision, maintenance, and network owners before freezing.

| Structure/field | Candidate type | Owner | Proposed rule |
| --- | --- | --- | --- |
| `UDT_CellCommand.StartReq` | BOOL | HMI | Momentary request; PLC detects edge and validates. |
| `UDT_CellCommand.StopAfterPartReq` | BOOL | HMI | Requests completion of the active part. |
| `UDT_CellCommand.ResetReq` | BOOL | HMI | Accepted only with agreed preconditions; does not reset Safety. |
| `UDT_CellCommand.AlarmAckReq` | BOOL | HMI | Requests alarm acknowledgement; define whether it identifies one alarm or a group. PLC publishes the acknowledged state. |
| `UDT_CellCommand.ModeRequest` | Named ENUM if supported; otherwise USINT with a versioned value table | HMI | Validate the value; mode change depends on machine state and TIA version. |
| `UDT_CellStatus.State` | Named ENUM if supported; otherwise UINT with a versioned value table | PLC | One state value; select representation for the target platform. |
| `UDT_VisionExchange.TriggerReq` | BOOL | PLC | Trigger linked to an identifiable part/cycle. |
| `UDT_VisionExchange.RequestedJobId` | Type defined by camera protocol | PLC → camera | Recipe/job request, if supported by the selected interface. |
| `UDT_VisionExchange.ActiveJobId` | Type defined by camera protocol | Camera → PLC | Active recipe/job confirmation, if reported by the selected interface. |
| `UDT_VisionExchange.Ready/Busy/Done/Valid` | BOOL | Camera | Check quality/validity before accepting a result. |
| `UDT_VisionExchange.Result` | Result type defined by the protocol | Camera → PLC | Agree a result table; OK/NOK may be insufficient if there are more classes. |
| `UDT_VisionExchange.SequenceId` | DINT | PLC | Prevents a delayed response being tied to another part, if supported. |
| `UDT_AlarmEntry.Code/Active/Acknowledged` | Code type pending / BOOL / BOOL | PLC | PLC publishes cause, active state, and acknowledgement; HMI sends `AlarmAckReq` through a separate interface. |

### Mapping to current numeric Watch values

These nine tags and types are the simulator's current reference. UDT member names are candidates; retain the units and limits described in document 03. `DB_PieceX`, `DB_PusherPos`, `DB_BeltSpeed`, and `DB_StageElapsed` are derived from the scene/browser clock, not physical measurements or PLC timings.

| Watch tag | Candidate `UDT_CellStatus` member | Watch type/unit | Current scope or limitation |
| --- | --- | --- | --- |
| `DB_SequenceStep` | `SequenceStep` | INT | Teaching phase code; not a defined PLC enum. |
| `DB_PieceIndex` | `PieceIndex` | INT | Logical batch index; during the inter-part interval it may indicate the next part. |
| `DB_CountOK` | `CountOK` | DINT, virtual parts | Completed OK routes in the simulated batch. |
| `DB_CountNOK` | `CountNOK` | DINT, virtual parts | Completed NOK routes in the simulated batch. |
| `DB_CountTotal` | `CountTotal` | DINT, virtual parts | Sum of the simulator counters. |
| `DB_BeltSpeed` | `BeltSpeed` | REAL, m/s | Fixed teaching value derived from the belt command; not measured. |
| `DB_PieceX` | `PieceX` | REAL, displayed mm | Uncalibrated graphical conversion; not a physical dimension. |
| `DB_PusherPos` | `PusherPos` | REAL, displayed mm | Normalized graphical scale; not a calibrated physical stroke. |
| `DB_StageElapsed` | `StageElapsed` | TIME, displayed ms | Browser clock; not PLC-measured time. |

`UDT_CellStatus.State` is the proposed internal control state; `SequenceStep` preserves the Watch's didactic numeric code. Do not assume they use the same values; define an explicit conversion if both are needed. Do not use these simulator representations as physical signals. Decide whether to keep them as HMI diagnostics and how they will be measured or calculated on the machine. This mapping preserves the teaching reference and does not claim that a TIA DB or UDT exists.

The camera interface may live in a global DB or a protocol-accessible structure. Cognex's internal job is separate; do not duplicate result ownership.

## Cyclic execution flow

One possible `OB1 (Main)` order, pending review against cycle time and modules:

1. Read the process image and channel diagnostics.
2. Convert hardware bits to typed input structures and retain quality/error state.
3. Validate HMI commands and external data; reject invalid values with diagnostics.
4. Run the sequence to consume feedback and produce equipment commands.
5. Run equipment blocks to calculate outputs and timers from those commands.
6. Apply standard interlocks and process limits before writing standard outputs.
7. Publish status, counters, values, and alarms to HMI/diagnostics.

Document whether equipment blocks consume commands from this scan or the previous scan, and measure the actual cycle. Safety functions follow a separate design and validation path.

## Interface rules

- One source of truth per value: raw input, derived logic, accepted command, or calculated state.
- HMI commands are requests; the PLC publishes whether they were accepted and the actual state.
- The PLC retains an accepted vision result until routing completes or a defined recovery invalidates it.
- Analog variables carry unit, resolution, valid range, substitute value, and quality.
- Alarms record cause, timestamp where hardware permits, active, acknowledged, and return condition.
- HMI does not write physical outputs directly, and no standard DB represents Safety functions.

## TIA review exercise

In a future session, create types and PLC tags without assigning hardware; review interfaces; then add the selected CPU/modules, link I/Q tags, and compile. Import Watch only after the tag/address table is approved. This document does not claim that session has taken place.
