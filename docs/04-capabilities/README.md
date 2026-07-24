# Industrial Capabilities

This directory owns the concrete capability indexes governed by the [Industrial Capability Framework](../01-architecture/D2R-001-industrial-capability-framework.md).

## Capability domains

| ID | Domain | Phase | Status |
|---|---|---:|---|
| ICF-01 | [PLC Diagnostics](ICF-01-plc-diagnostics/README.md) | 1 | planned |
| ICF-02 | [Industrial I/O](ICF-02-industrial-io/README.md) | 1 | planned |
| ICF-03 | [Motion Control](ICF-03-motion-control/README.md) | 1 | planned |
| ICF-04 | [Industrial Communications](ICF-04-industrial-communications/README.md) | 2 | planned |
| ICF-05 | [Functional Safety](ICF-05-functional-safety/README.md) | 2 | planned |
| ICF-06 | [Electrical Troubleshooting](ICF-06-electrical-troubleshooting/README.md) | 2 | planned |
| ICF-07 | [Pneumatic Systems](ICF-07-pneumatic-systems/README.md) | 3 | planned |
| ICF-08 | [Hydraulic Systems](ICF-08-hydraulic-systems/README.md) | 3 | planned |
| ICF-09 | [HMI & SCADA Diagnostics](ICF-09-hmi-scada-diagnostics/README.md) | 3 | planned |
| ICF-10 | [PLC Architecture](ICF-10-plc-architecture/README.md) | 4 | planned |
| ICF-11 | [Advanced Industrial Troubleshooting](ICF-11-advanced-industrial-troubleshooting/README.md) | 4 | planned |

Each subdirectory contains only a README and a provisional `capability.yaml`. These files establish identity, phase, preliminary purpose, and planning references; they are not complete Capability Specifications.

The YAML shape has no approved schema and MUST NOT be treated as a stable runtime contract. Full specifications MUST follow [D2R-002](../02-standards/D2R-002-capability-definition-standard.md).

Notebook articles and Experience Engine experiences MAY reference capability identifiers, but they MUST NOT redefine a capability locally.
