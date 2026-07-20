const values = list => Object.freeze(Object.fromEntries(list.map(value => [value, value])));

export const SignalDataType = values(["Boolean", "Integer", "Float", "String", "Enum"]);
export const SignalCategory = values(["Digital Input", "Digital Output", "Analog Input", "Analog Output", "Internal", "Derived", "Diagnostic", "Simulation", "Validation", "System"]);
export const SignalAccessMode = values(["Read Only", "Write Only", "Read Write", "Calculated"]);
export const SignalQuality = values(["Good", "Bad", "Unknown", "Simulated", "Disconnected", "Fault", "Invalid"]);
export const SignalOwner = values(["Machine", "PLC", "Simulation", "Validation", "System", "Academy", "User"]);
export const SignalPersistenceMode = values(["Transient", "Session", "Attempt", "Persistent"]);
export const SignalNamespaceRoot = values(["Machine", "PLC", "Simulation", "Validation", "System", "Academy", "User"]);
export const SignalEventType = values(["Signal Registered", "Signal Updated", "Signal Changed", "Signal Quality Changed", "Signal Reset", "Registry Reset"]);
