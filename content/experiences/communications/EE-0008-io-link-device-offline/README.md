# EE-0008 — IO-Link Device Offline

Experience Engine V2 scenario for hierarchical diagnosis from a Siemens S7-1500 through PROFINET and a Turck TBEN-L5-8IOL master to the individual C3 device path.

The canonical root cause is a partially loose M12 connection associated with the BI6U-M12-IOL6X2-H1141. The recovery restores that connection and verifies communication, process data, and machine function without forcing.

