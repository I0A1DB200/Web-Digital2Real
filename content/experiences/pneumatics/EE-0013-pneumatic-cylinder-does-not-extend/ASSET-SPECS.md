# EE-0013 asset specifications

| Asset | Pixels / information | Proves | Does not prove | Earliest moment | Provenance |
|---|---|---|---|---|---|
| ART-001 | Packaging station and retracted cylinder | Station identity | Root cause or recovery | Incident Brief | EE-0013 generated |
| ART-002 | Waiting box and retracted cylinder | No extension is visible | Why motion is absent | Initial stage | EE-0013 generated |
| ART-003 | Realistic TIA Portal-style table: `ExtendCmd TRUE`, `ExtendOutput TRUE`, `ExtendedLS FALSE` | Illustrates authored command/output/feedback states | Logic correctness by itself, hardware identity, air at cylinder or physical cause | After DEC-01 | EE-0013 generated |
| ART-004 | Air preparation and connected valve assembly, gauge without a defensible numeric reading | Illustrates the supply-inspection location | Numerical pressure, actual air availability, flow or local tube continuity by itself | After DEC-03 | EE-0013 generated |
| ART-005 | Loose blue tube and empty local fitting | Physical local disconnection | Safe authorization or recovery | After DEC-04 | EE-0013 generated |
| ART-006 | Gloved reconnection action with cylinder retracted | Corrective action being performed | Successful extension or feedback | After DEC-05 | EE-0013 generated from ART-005 composition |
| ART-007 | Extended cylinder rod and displaced pusher/box | Illustrates the recovered physical position | Feedback, cycle count or repeatability by itself | After DEC-06 / Debrief | EE-0013 generated from ART-002 |

The authored functional test establishes extension and correct extended feedback. The supply check is authored qualitative evidence; no pressure value is inferred from imagery. Static imagery is synthetic illustration, not a field measurement record. The control-side check at DEC-02 is text-only and advances directly under the existing Engine contract.

## Cross-asset review

ART-001/002/004/007 share the packaging station reference. ART-005/006 are matched close-ups of the same disconnected/reseated local tube and fitting, derived from the repository's pneumatic installation treatment. They are detail illustrations, not a dimensional reconstruction or a port-numbered pneumatic circuit. No flow-control adjustment is authored or implied as the remedy.

All seven images were visually inspected. None burns in Experience IDs, player titles, navigation, footer or outer card shell. PLC states appear in realistic software, not abstract tiles. Root-cause detail is restricted to ART-005; intervention to ART-006; extension to ART-007.
