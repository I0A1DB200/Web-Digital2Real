# ENV-003 implementation checkpoint

- Contract: Master Contract V1 (`docs/implementation/ENV-003-contract.md`)
- Phase: 12 — EE-0029 BACnet Device Not Discovered
- Status: questions, answers, six assets and ENV-003 hotspot implemented; user approval pending
- Scope: EE-0029 BACnet Device Not Discovered, bilingual five-stage diagnostic flow, 19 questions/options and six evidence items; cross-subnet BACnet discovery is separated from controller availability, addressing and IP routing
- Validation: EE-0029 focused test, authoring V2, ES/EN localization, runtime normalization, exact asset copies, global package test, preview package and balanced decision lengths passed; browser QA pending
- User approval: pending
- Next unit: EE-0030 with its ENV-003 hotspot
- Blockers: original Phase 03 hotspot-first order superseded by the approved unit-by-unit Experience + hotspot workflow

ENV-003 currently exposes the EE-0021, EE-0022, EE-0023, EE-0024, EE-0025, EE-0026, EE-0027, EE-0028 and EE-0029 hotspots. EE-0027 is user validated; EE-0028 and EE-0029 are authored in technical review with six illustrative assets integrated in each. Remaining hotspots will be added with their corresponding Experiences. The PRONETA/TIA topology-assignment pill remains reserved for the final ENV-003 debrief.
