# EE-0008 — IO-Link Device Offline

Experience Engine V2 scenario for hierarchical diagnosis from a Siemens S7-1500 through PROFINET and a Turck TBEN-L5-8IOL master to the individual C3 device path.

The canonical root cause is a partially loose M12 connection associated with the BI6U-M12-IOL6X2-H1141. The recovery restores that connection and verifies communication, process data, and machine function without forcing.


## Learning and media contract

Preserve six decisions, twenty options and correct positions D/B/C/A/D/B.
D1 plans checks (EVID-02); D2 checks upstream availability (EVID-03); both transition directly.
D3 queries the C3 diagnostic and compares ports (EVID-04 / ART-004), opening one Result.
D4 interprets the individual path from existing observations (EVID-05), without acquiring a new data measurement; direct transition.
D5 inspects the physical path under existing maintenance prerequisites (EVID-06 / ART-005), opening one Result.
D6 combines restoration and functional verification, exclusively acquiring EVID-07-RECOVERY / ART-006 and earning completion before the final Result Continue.
EVID-01 remains initial context with no unlock; six interactive evidence items are projected. Seven authored evidence items total.

Stage media: [], [], [], [ART-004], [], [ART-005].
Evidence media EVID-01 through EVID-07: [], [], [], [ART-004], [], [ART-005], [ART-006].
Cover ART-001; completion ART-006. Exactly three Results: D3/D5/D6. Continue changes presentation only.
ART-002 (PLC STOP) and ART-003 (insufficient availability evidence and inconsistent physical representation) remain registered but hidden.
The cover is illustrative, not diagnostic authority. Port diagnostics do not establish internal device damage; a local path includes the port, cable and device. Availability checks do not certify overall PLC/network health. Static images do not prove electrical continuity, functional recovery or repeated operation.
Existing maintenance and controlled-movement prerequisites precede D5/D6. Recovery verifies connection, C3 communication, expected data, preserved PROFINET/neighbor availability and repeated machine function without forcing.
ES/EN share authority and timing. Browser QA remains pending; automated preview validation does not replace it.
