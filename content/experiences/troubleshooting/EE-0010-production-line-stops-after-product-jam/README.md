# EE-0010 — Production Line Stops After Product Jam

Experience Engine V2 scenario for system-level causal diagnosis across physical process, field signal, PLC logic, sequence state, commands, actuators, and HMI symptoms.

The canonical cause is a small product residue legitimately detected by `B3_TransferSensor`. Recovery removes the obstruction safely and verifies `TransferClear`, T40, S41, actuator commands, and repeated normal cycles without forcing or bypassing.
