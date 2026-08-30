/**
 * A structured content block rendered by the generic article viewer.
 * Supported types are introduction, heading, paragraph, engineering-note,
 * callout, list, code, and quote.
 *
 * @typedef {object} ArticleSection
 * @property {string} type
 * @property {string} [title]
 * @property {string} [content]
 * @property {string} [language]
 * @property {string[]} [items]
 */

/**
 * A complete Notebook publication.
 * Only id, slug, title, and sections are required; all other metadata is optional.
 * Legacy date, summary, and content properties remain supported by the components.
 *
 * @typedef {object} NotebookArticle
 * @property {string} id
 * @property {string} slug
 * @property {string} [kicker]
 * @property {string} title
 * @property {string} [excerpt]
 * @property {string} [coverImage]
 * @property {string} [coverAlt]
 * @property {string} [author]
 * @property {string} [published]
 * @property {number} [readingTime]
 * @property {string[]} [categories]
 * @property {string[]} [tags]
 * @property {string[]} [technologies]
 * @property {boolean} [featured]
 * @property {{labs: string[], notebook: string[]}} [related]
 * @property {ArticleSection[]} sections
 * @property {string} [date]
 * @property {string} [summary]
 * @property {string} [content]
 */

/** @type {NotebookArticle[]} */
export const notebook = [
  {
    id: "article-001",
    slug: "display-conveyor-speed-without-an-encoder",

    kicker: "Problem — Solution",
    title: "Display Conveyor Speed Without an Encoder",
    excerpt:
      "Estimate conveyor speed using an existing photoelectric sensor and PLC logic, without adding an encoder.",

    coverImage: "./assets/images/notebook/article-001-conveyor-speed.png",
    coverAlt:
      "Conveyor system using a photoelectric sensor and PLC logic to estimate package speed without an encoder.",

    author: "Digital2Real",
    published: "2026-07-18",
    readingTime: 1,

    categories: ["Industrial Automation"],
    tags: ["Conveyor", "Speed Estimation", "Photoelectric Sensor"],
    technologies: ["PLC", "Photoelectric Sensor"],

    featured: true,

    related: {
      labs: [],
      notebook: []
    },

    sections: [
      {
        type: "introduction",
        content:
          "An encoder is the right instrument when a conveyor needs accurate motion feedback, positioning or closed-loop control. But many machines only need an estimated speed for monitoring, diagnostics or throughput calculations. In that narrower case, a photoelectric sensor already detecting packages can provide enough information."
      },
      {
        type: "heading",
        title: "The Challenge"
      },
      {
        type: "paragraph",
        content:
          "Adding an encoder affects more than the bill of materials. It can require mechanical adaptation, wiring, a suitable PLC input, updated drawings and commissioning time. It also adds another device to maintain. That work is difficult to justify when the required value is an approximate process indication rather than precise motion feedback."
      },
      {
        type: "heading",
        title: "The Solution"
      },
      {
        type: "paragraph",
        content:
          "Use the known package length as the measured distance. Start a PLC timer when the leading edge reaches the sensor and stop it when the trailing edge leaves. Dividing package length by passage time produces an estimated conveyor speed. The logic needs clear edge detection and protection against zero or invalid measurement times."
      },
      {
        type: "list",
        title: "Measurement sequence",
        items: [
          "Detect the package leading edge and start timing.",
          "Detect the trailing edge and stop timing.",
          "Validate the measured interval.",
          "Divide known package length by passage time.",
          "Expose the result for monitoring or diagnostics."
        ]
      },
      {
        type: "code",
        language: "text",
        content:
          "IF TrailingEdgeDetected THEN\n    PassageTime := StopMeasurement();\n\n    IF PassageTime > 0 THEN\n        EstimatedSpeed := PackageLength / PassageTime;\n    END_IF;\nEND_IF;"
      },
      {
        type: "heading",
        title: "Engineering Note"
      },
      {
        type: "engineering-note",
        title: "Know the measurement limits",
        content:
          "This method measures average speed while one package crosses the sensor. Accuracy depends on consistent package length and orientation, reliable edge detection, sensor response time and PLC scan time. Products must also remain separated. If the conveyor accelerates during the measurement, the result is an interval average—not an instantaneous value."
      },
      {
        type: "callout",
        title: "Use an encoder when accuracy controls the process",
        content:
          "Positioning, synchronisation, safety-related measurement and dependable closed-loop feedback still require a suitable encoder or motion sensor."
      },
      {
        type: "heading",
        title: "Key Takeaways"
      },
      {
        type: "list",
        items: [
          "Reuse an existing signal when the process only needs an estimate.",
          "Validate package geometry and timing conditions.",
          "State clearly that the result is estimated speed.",
          "Choose an encoder when precision is part of control."
        ]
      },
      {
        type: "heading",
        title: "Conclusion"
      },
      {
        type: "paragraph",
        content:
          "The best measurement architecture is not automatically the most sophisticated one. When approximate speed satisfies the real requirement, a known package length, one photoelectric sensor and compact PLC logic can produce useful information without unnecessary hardware. Precision should follow process need—not habit."
      }
    ]
  },
  {
    id: "article-002",
    slug: "from-500-networks-to-one-reusable-function-block",

    kicker: "Problem — Solution",
    title: "From 500 Networks to One Reusable Function Block",
    excerpt:
      "Replace duplicated PLC networks with structured data and reusable control logic that scales by configuration.",

    coverImage: "./assets/images/notebook/article-002-scalable-plc-architecture.png",
    coverAlt:
      "Comparison between hundreds of duplicated PLC networks and one reusable motor-control function block applied to an array of devices.",

    author: "Digital2Real",
    published: "2026-07-18",
    readingTime: 1,

    categories: ["PLC Software Architecture"],
    tags: ["Reusable Logic", "Function Blocks", "Arrays", "Scalability"],
    technologies: ["PLC", "Structured Data", "Function Blocks"],

    featured: true,

    related: {
      labs: [],
      notebook: []
    },

    sections: [
      {
        type: "introduction",
        content:
          "A PLC project becomes fragile when similar logic is copied for every motor, valve or conveyor. One duplicated network feels harmless. Hundreds create independent versions of the same behaviour, turning each correction into a project-wide search and every commissioning change into a consistency risk."
      },
      {
        type: "heading",
        title: "The Challenge"
      },
      {
        type: "paragraph",
        content:
          "Copied networks drift over time. One motor receives a corrected alarm delay while another keeps the old value. Interlocks, diagnostics and naming become inconsistent. Testing must be repeated because equivalent-looking networks may no longer behave identically. The program grows by duplication instead of by a controlled architecture."
      },
      {
        type: "heading",
        title: "The Solution"
      },
      {
        type: "paragraph",
        content:
          "Separate device data from device behaviour. Store each motor's commands, feedback, state, alarms and parameters in a structured instance. Then apply one reusable function block through a consistent interface. That interface becomes a contract: every instance receives the same commands, exposes the same states and reports faults through the same diagnostic structure. An array or collection holds the device instances; configuration defines their differences."
      },
      {
        type: "code",
        language: "text",
        content: "FOR i := 1 TO DeviceCount DO\n    FB_MotorControl(Motors[i]);\nEND_FOR;"
      },
      {
        type: "paragraph",
        content:
          "The syntax is illustrative. The architectural point is that every motor retains independent data and state while sharing tested control behaviour. Adding a device means adding and configuring an instance—not cloning another network."
      },
      {
        type: "heading",
        title: "Engineering Note"
      },
      {
        type: "engineering-note",
        title: "Reuse requires visible behaviour",
        content:
          "A reusable block should not become a black box. Use readable names, explicit interfaces, version control, simulation and diagnostic outputs. Validate scan-time impact when processing large arrays. Keep genuinely unique equipment and safety functions outside a generic model when their behaviour does not fit cleanly."
      },
      {
        type: "callout",
        title: "Scale by configuration",
        content:
          "A correction made in one validated component can be deployed consistently across its instances. Commissioning then focuses on parameters and field conditions instead of reviewing hundreds of near-identical networks."
      },
      {
        type: "heading",
        title: "Key Takeaways"
      },
      {
        type: "list",
        items: [
          "Encapsulate repeated behaviour in reusable components.",
          "Keep device state in structured instances.",
          "Configure differences instead of copying logic.",
          "Expose consistent commands, feedback and diagnostics.",
          "Preserve explicit logic for genuinely unique equipment."
        ]
      },
      {
        type: "heading",
        title: "Conclusion"
      },
      {
        type: "paragraph",
        content:
          "A scalable PLC program grows by adding well-defined device instances, not by multiplying networks. Structured data and reusable behaviour make corrections consistent, testing repeatable and diagnostics predictable. Complexity belongs inside carefully designed components—not across hundreds of copies."
      }
    ]
  },
  {
    id: "article-003",
    slug: "what-is-io-link",

    kicker: "Industrial Communication",
    title: "What is IO-Link?",
    excerpt:
      "Modern sensors can provide much more than a simple ON/OFF signal.",

    coverImage: "./assets/images/notebook/article-003-io-link.png",
    coverAlt:
      "IO-Link master connected to intelligent industrial sensors and actuators.",

    readingTime: 1,

    categories: ["Industrial Communication"],

    sections: [
      {
        type: "introduction",
        content:
          "Modern sensors can provide much more than a simple ON/OFF signal."
      },
      {
        type: "paragraph",
        content:
          "IO-Link is a standardized point-to-point communication protocol defined by IEC 61131-9. It enables intelligent sensors and actuators to exchange process data, diagnostics and parameters with a PLC through an IO-Link Master."
      },
      {
        type: "paragraph",
        content:
          "Unlike a fieldbus, IO-Link can use standard three-wire sensor cabling. Installation remains similar to a conventional digital sensor while providing additional information such as device status, signal quality and configuration data."
      },
      {
        type: "heading",
        title: "Why use IO-Link?"
      },
      {
        type: "list",
        items: [
          "Faster device replacement through automatic parameter restoration.",
          "Remote diagnostics and improved maintenance visibility.",
          "Standard sensor wiring without additional network complexity.",
          "Reduced commissioning and troubleshooting time."
        ]
      },
      {
        type: "heading",
        title: "Architecture"
      },
      {
        type: "code",
        language: "text",
        content:
          "PLC\n  |\nPROFINET\n  |\nIO-Link Master\n  |-- Photoelectric sensor\n  |-- Pressure sensor\n  |-- RFID reader\n  `-- Valve island"
      },
      {
        type: "engineering-note",
        title: "IO-Link is not a fieldbus",
        content:
          "The PLC communicates with the IO-Link Master through an industrial network such as PROFINET, EtherNet/IP or EtherCAT. The Master manages an independent point-to-point connection with each IO-Link device."
      }
    ]
  },
  {
    id: "article-004",
    slug: "udt-driven-plc-design",

    kicker: "Engineering Note #004",
    title: "UDT-Driven PLC Design",
    excerpt:
      "User-Defined Types provide a structured data model for machine elements, making PLC software easier to understand, reuse, maintain and scale.",

    coverImage: "./assets/images/notebook/article-004-udt-driven-plc-design.png",
    coverAlt:
      "UDT-driven PLC software architecture showing structured machine data, function blocks and physical machine elements.",

    readingTime: 3,

    categories: ["PLC Software Architecture"],

    sections: [
      {
        type: "introduction",
        content:
          "As PLC applications grow, managing hundreds of individual variables becomes increasingly difficult."
      },
      {
        type: "paragraph",
        content:
          "User-Defined Types (UDTs) solve this problem by defining consistent data structures for the physical elements of a machine."
      },
      {
        type: "paragraph",
        content:
          "Instead of treating every signal as an isolated variable, related commands, status information and parameters can be represented as one engineering object."
      },
      {
        type: "heading",
        title: "From Signals to Objects"
      },
      {
        type: "paragraph",
        content:
          "Consider a conveyor. A flat implementation might contain independent variables such as Conveyor_Start, Conveyor_Stop, Conveyor_Running, Conveyor_Fault, Conveyor_SpeedSetpoint and Conveyor_ActualSpeed."
      },
      {
        type: "paragraph",
        content:
          "These variables describe the same physical object but the relationship exists only through naming. A UDT makes that relationship explicit."
      },
      {
        type: "code",
        language: "text",
        content:
          "UDT_Conveyor\n|\n+-- Cmd\n|   +-- Start\n|   +-- Stop\n|   +-- Reset\n|\n+-- Sts\n|   +-- Running\n|   +-- AtSpeed\n|   +-- HasFault\n|\n+-- Par\n    +-- SpeedSet\n    +-- Accel\n    +-- Decel"
      },
      {
        type: "heading",
        title: "Data Model"
      },
      {
        type: "paragraph",
        content:
          "A machine can then be represented using structured objects:"
      },
      {
        type: "code",
        language: "text",
        content:
          "UDT_System\n|\n+-- EntryConveyors[]\n+-- Pushers[]\n+-- Weighing\n+-- Sorters[]\n+-- Alarms"
      },
      {
        type: "paragraph",
        content:
          "The PLC data model now reflects the physical architecture of the machine."
      },
      {
        type: "paragraph",
        content:
          "This makes the software easier to navigate because engineers can reason about machine elements instead of searching through unrelated variables."
      },
      {
        type: "heading",
        title: "UDTs and Function Blocks"
      },
      {
        type: "paragraph",
        content:
          "UDTs define data structure. Function Blocks define behavior. Keeping these responsibilities distinct creates a powerful architecture."
      },
      {
        type: "paragraph",
        content: "UDT → What data represents the equipment."
      },
      {
        type: "paragraph",
        content: "FB → How the equipment behaves."
      },
      {
        type: "paragraph",
        content:
          "For example, FB_Conveyor can operate on a UDT_Conveyor interface while the same structure is reused for multiple conveyors."
      },
      {
        type: "paragraph",
        content:
          "The objective is not to create abstraction for its own sake. The objective is to establish a predictable software contract for every machine element. This is a scalable engineering pattern, not the only valid PLC architecture."
      },
      {
        type: "heading",
        title: "System Architecture"
      },
      {
        type: "code",
        language: "text",
        content:
          "                 OB1\n                  |\n       +----------+----------+\n       |          |          |\n     FC_IO    FB_Conveyor  FB_Pusher\n                  |\n              UDT_System\n                  |\n           Physical Machine"
      },
      {
        type: "list",
        items: [
          "OB1 coordinates execution.",
          "FC_IO isolates physical I/O mapping.",
          "Function Blocks encapsulate equipment behavior.",
          "UDTs provide the structured data model connecting the software architecture to the machine."
        ]
      },
      {
        type: "heading",
        title: "Why It Scales"
      },
      {
        type: "paragraph",
        content:
          "Structured data provides several engineering benefits:"
      },
      {
        type: "list",
        items: [
          "Consistent interfaces",
          "Easier navigation",
          "Reduced naming ambiguity",
          "Reusable Function Blocks",
          "Predictable diagnostics",
          "Easier expansion of machine modules",
          "Clearer ownership of process data"
        ]
      },
      {
        type: "paragraph",
        content:
          "When another conveyor or pusher is added, the architecture can reuse the existing type and behavior instead of creating another collection of unrelated variables."
      },
      {
        type: "heading",
        title: "Engineering Note"
      },
      {
        type: "engineering-note",
        title: "Structure today creates scalability tomorrow",
        content:
          "A UDT is not simply a convenient way to group PLC tags. It is part of the software architecture. A good data model describes the machine in a way that both the PLC and the engineer can understand. When the data model reflects the physical system, software becomes easier to diagnose, extend and maintain."
      }
    ]
  },
  {
    id: "article-005",
    slug: "4-20ma-industrial-current-loop",

    kicker: "Engineering Note #005",
    title: "Understanding the 4–20 mA Industrial Current Loop",
    excerpt:
      "The 4–20 mA current loop provides a reliable interface between field instrumentation and the control system. Understanding the complete measurement chain is essential for commissioning and troubleshooting analog signals.",

    coverImage: "./assets/images/notebook/article-005-4-20ma-current-loop.png",
    coverAlt:
      "4–20 mA industrial current loop showing a two-wire pressure transmitter connected to an analog input module in an S7-1500 station and an HMI displaying the engineering value.",

    readingTime: 2,

    categories: ["Industrial Automation"],

    sections: [
      {
        type: "introduction",
        content:
          "The 4–20 mA current loop is one of the most established methods for transmitting analog process measurements in industrial automation."
      },
      {
        type: "paragraph",
        content:
          "Pressure, temperature, flow and level transmitters commonly use it to communicate a measured process variable to a PLC or DCS. The signal itself is simple. The engineering challenge is understanding the complete measurement chain."
      },
      {
        type: "heading",
        title: "The Measurement Chain"
      },
      {
        type: "paragraph",
        content:
          "A process value passes through several representations before reaching the operator."
      },
      {
        type: "code",
        language: "text",
        content:
          "PHYSICAL PROCESS\n      ↓\nTRANSMITTER\n      ↓\n4–20 mA\n      ↓\nANALOG INPUT\n      ↓\nRAW PLC VALUE\n      ↓\nSCALING\n      ↓\nENGINEERING VALUE"
      },
      {
        type: "paragraph",
        content:
          "These values are related, but they are not the same thing. A pressure value in bar is not transmitted directly through the cable."
      },
      {
        type: "paragraph",
        content:
          "The transmitter converts the physical measurement into current. The analog input converts that current into a numerical value available to the PLC. The PLC can then scale that value into engineering units."
      },
      {
        type: "heading",
        title: "Why 4–20 mA?"
      },
      {
        type: "list",
        items: [
          "4 mA represents the minimum calibrated value.",
          "20 mA represents the maximum calibrated value.",
          "12 mA corresponds approximately to the midpoint of a linear span."
        ]
      },
      {
        type: "paragraph",
        content:
          "Using 4 mA instead of 0 mA provides a live zero. A valid minimum measurement therefore remains electrically distinguishable from an abnormal condition where loop current disappears. A reading near 0 mA is an abnormal loop condition requiring diagnosis; it does not uniquely identify one specific fault."
      },
      {
        type: "heading",
        title: "Pressure Transmitter Example"
      },
      {
        type: "paragraph",
        content:
          "Consider a pressure transmitter configured for a calibrated range of 0–20 bar."
      },
      {
        type: "code",
        language: "text",
        content:
          "4 mA  → 0 bar\n12 mA → 10 bar\n20 mA → 20 bar"
      },
      {
        type: "paragraph",
        content:
          "The transmitter measures pressure. The loop transports current. The analog input measures that electrical signal. The PLC converts the resulting raw value into the engineering value used by the application."
      },
      {
        type: "heading",
        title: "Electrical Loop"
      },
      {
        type: "paragraph",
        content:
          "A common two-wire transmitter loop can be represented conceptually as follows:"
      },
      {
        type: "code",
        language: "text",
        content:
          "+24 VDC\n   │\n   ▼\n2-WIRE TRANSMITTER\n   │\n   │ 4–20 mA\n   ▼\nANALOG INPUT CHANNEL\n   │\n   ▼\n0 VDC"
      },
      {
        type: "paragraph",
        content:
          "The 4–20 mA signal terminates at the analog input module, not directly at the PLC CPU. In a local S7-1500 station, the module may be installed alongside the CPU as part of the same station."
      },
      {
        type: "paragraph",
        content:
          "The analog module performs the input conversion and makes the resulting process value available to the controller. Exact terminal arrangements depend on the selected module, transmitter and loop configuration."
      },
      {
        type: "heading",
        title: "Troubleshooting the Measurement Chain"
      },
      {
        type: "paragraph",
        content:
          "When an analog measurement is incorrect, diagnose the chain from the physical signal toward the software."
      },
      {
        type: "list",
        items: [
          "Verify transmitter supply.",
          "Verify loop continuity.",
          "Measure actual loop current.",
          "Check transmitter configuration and measuring range.",
          "Verify analog input configuration.",
          "Inspect the raw PLC value.",
          "Verify scaling.",
          "Compare the final engineering value with the real process."
        ]
      },
      {
        type: "code",
        language: "text",
        content:
          "Wrong loop current\n→ Investigate transmitter, wiring, supply or process measurement.\n\nCorrect loop current + wrong raw PLC value\n→ Investigate analog input hardware or configuration.\n\nCorrect raw PLC value + wrong engineering value\n→ Investigate PLC scaling or software."
      },
      {
        type: "heading",
        title: "Engineering Note"
      },
      {
        type: "engineering-note",
        title: "Measure the loop before changing the software",
        content:
          "A 4–20 mA loop is not just a signal. It is a measurement chain connecting the physical process to the automation system. When troubleshooting, identify the first point where the measurement stops representing reality correctly."
      }
    ]
  },
  {
    id: "article-006",
    slug: "building-scalable-plc-architectures",

    kicker: "Engineering Note #006",
    title: "Building Scalable PLC Architectures",
    excerpt:
      "A maintainable PLC project is organized by responsibility rather than by execution order. Separate I/O, coordination, equipment behavior and data models to create software that can grow without becoming harder to maintain.",

    coverImage: "./assets/images/notebook/article-006-building-scalable-plc-architectures.png",
    coverAlt:
      "Technical TIA Portal representation of a scalable PLC software architecture organized into I/O mapping, process coordination, equipment Function Blocks, instance DBs and structured UDT data.",

    readingTime: 3,

    categories: ["PLC Software Architecture"],

    sections: [
      {
        type: "introduction",
        content:
          "A PLC program can work correctly and still be badly designed. The difference often becomes visible during commissioning, troubleshooting, modification or project growth."
      },
      {
        type: "paragraph",
        content:
          "A scalable PLC architecture gives each part of the project a clear responsibility. The objective is not to create more blocks, but to make the system easier to understand, diagnose, reuse and extend."
      },
      {
        type: "heading",
        title: "The Problem with Execution-Order Design"
      },
      {
        type: "paragraph",
        content:
          "PLC programs execute in a defined order. That does not mean the software architecture should be designed only around that order."
      },
      {
        type: "code",
        language: "text",
        content:
          "OB1\n |\n +-- Network 1\n +-- Network 2\n +-- Network 3\n +-- Network 4\n ...\n +-- Network 500"
      },
      {
        type: "paragraph",
        content:
          "This may execute correctly, but execution order does not explain responsibility. As complexity grows, engineers need predictable answers about I/O mapping, sequencing, equipment state, alarms and data ownership."
      },
      {
        type: "heading",
        title: "Organize by Responsibility"
      },
      {
        type: "code",
        language: "text",
        content:
          "OB1\n │\n ├── 01_IO\n │     └── FC_IO_Map\n │\n ├── 02_COORDINATION\n │     └── FB_MachineCtrl\n │\n ├── 03_EQUIPMENT\n │     ├── FB_Conveyor\n │     ├── FB_Pusher\n │     └── FB_Weighing\n │\n ├── 04_TYPES\n │     ├── UDT_Conveyor\n │     ├── UDT_Pusher\n │     └── UDT_Weighing\n │\n └── 05_UTILITIES\n       ├── FC_Alarms\n       └── FC_Scaling"
      },
      {
        type: "paragraph",
        content:
          "These names are examples, not mandatory Siemens conventions. The architectural principle is the separation of responsibility."
      },
      {
        type: "heading",
        title: "OB1 — Execution Coordination"
      },
      {
        type: "paragraph",
        content:
          "OB1 is the cyclic entry point for the PLC application. In a maintainable architecture, it can make the execution structure visible without becoming the location where the complete machine behavior is implemented."
      },
      {
        type: "paragraph",
        content:
          "Keeping OB1 lean is a useful pattern, not an absolute rule that prohibits all logic. A technician opening it should quickly understand the major software layers and their call order."
      },
      {
        type: "heading",
        title: "I/O Mapping"
      },
      {
        type: "paragraph",
        content:
          "Physical I/O represents hardware, while machine logic represents behavior. Separating them reduces coupling between application logic and physical addresses."
      },
      {
        type: "code",
        language: "text",
        content:
          "Physical input\n%I0.0\n\nApplication representation\nConveyor_1.Sts.SensorPE"
      },
      {
        type: "paragraph",
        content:
          "Equipment logic can reason about SensorPE rather than repeatedly depending on %I0.0. The mapping layer becomes an explicit boundary, making navigation clearer and hardware changes easier to localize."
      },
      {
        type: "heading",
        title: "Coordination Layer"
      },
      {
        type: "paragraph",
        content:
          "Individual equipment blocks know how their equipment behaves, but they do not necessarily own the complete production sequence. A coordination layer can manage machine modes, sequence state, production flow, high-level permissives and interactions between equipment."
      },
      {
        type: "paragraph",
        content:
          "For example, FB_MachineCtrl may coordinate FB_Conveyor, FB_Pusher and FB_Weighing without implementing the internal behavior of each device. This prevents one large block from accumulating every responsibility."
      },
      {
        type: "heading",
        title: "Equipment Modules"
      },
      {
        type: "paragraph",
        content:
          "Physical equipment often provides a useful software boundary. A reusable Function Block can encapsulate the behavior associated with a conveyor, pusher, valve, pump, weighing station or robot interface."
      },
      {
        type: "code",
        language: "text",
        content:
          "FB_Conveyor\n     │\n     ├── Commands\n     ├── Status\n     ├── Interlocks\n     ├── Internal state\n     └── Diagnostics"
      },
      {
        type: "paragraph",
        content:
          "Multiple conveyors can reuse the same behavior while maintaining independent instance data. This is a scalable pattern, not a requirement that every physical object must have its own FB."
      },
      {
        type: "heading",
        title: "Data Ownership"
      },
      {
        type: "paragraph",
        content:
          "Architecture is not only about program blocks. Data also needs clear ownership. Instance DBs hold instance data associated with FBs. UDTs define consistent data types and structured interfaces; they do not contain behavior."
      },
      {
        type: "paragraph",
        content:
          "Global DBs remain appropriate for information that is genuinely shared across the application. The engineering question is not whether one storage form is universally better, but who owns the data and which responsibility requires it."
      },
      {
        type: "heading",
        title: "Software Should Reflect the Machine"
      },
      {
        type: "code",
        language: "text",
        content:
          "MACHINE                         SOFTWARE\n │                               │\n ├── Conveyor_1                  ├── FB_Conveyor / DB_Conveyor_1\n ├── Conveyor_2                  ├── FB_Conveyor / DB_Conveyor_2\n ├── Pusher_1                    ├── FB_Pusher   / DB_Pusher_1\n └── Weighing_1                  └── FB_Weighing / DB_Weighing_1"
      },
      {
        type: "paragraph",
        content:
          "This correspondence reduces the mental translation required during troubleshooting. When Conveyor_2 fails, the engineer has a predictable place to investigate its behavior and data."
      },
      {
        type: "heading",
        title: "Scalability"
      },
      {
        type: "paragraph",
        content:
          "Scalability means that adding functionality does not cause software complexity to grow uncontrollably. A scalable architecture makes common changes local."
      },
      {
        type: "list",
        items: [
          "Adding another conveyor primarily adds another conveyor instance.",
          "Changing conveyor behavior primarily affects its equipment implementation.",
          "Changing an I/O address primarily affects the mapping layer.",
          "Changing sequence behavior primarily affects coordination logic."
        ]
      },
      {
        type: "paragraph",
        content:
          "These boundaries reduce unintended side effects while connecting the reusable behavior introduced in Engineering Note #002 with the structured data model introduced in Engineering Note #004."
      },
      {
        type: "heading",
        title: "Engineering Note"
      },
      {
        type: "engineering-note",
        title: "Clear responsibilities create maintainable systems",
        content:
          "A good PLC architecture is not about creating more blocks. When I/O mapping, coordination, equipment behavior and data ownership have predictable boundaries, the project becomes easier to understand, diagnose and extend. The architecture has succeeded when a future engineer can quickly determine where a change belongs."
      }
    ]
  },
  {
    id: "article-007",
    slug: "function-blocks-vs-functions",

    kicker: "Engineering Note #007",
    title: "Function Blocks vs Functions",
    excerpt:
      "FCs and FBs can both execute PLC logic, but they solve different architectural problems. The key distinction is whether the responsibility requires instance-specific state that must persist between PLC cycles.",

    coverImage: "./assets/images/notebook/article-007-function-blocks-vs-functions.png",
    coverAlt:
      "Technical PLC software architecture comparison showing a stateless Function and a Function Block with persistent instance data.",

    readingTime: 3,

    categories: ["PLC Software Architecture"],

    sections: [
      {
        type: "introduction",
        content:
          "Functions and Function Blocks can both execute PLC logic. The architectural difference is not simply whether the logic is simple or complex. The essential question is whether the responsibility needs instance-specific state that persists between PLC cycles."
      },
      {
        type: "paragraph",
        content:
          "Choosing between an FC and an FB according to responsibility makes software ownership clearer and helps repeated equipment behave independently without duplicating its implementation."
      },
      {
        type: "heading",
        title: "Function — Operation Without FB Instance State"
      },
      {
        type: "paragraph",
        content:
          "A Function is a natural fit for an operation that does not require its own FB instance state. It receives information, performs a defined responsibility and returns or writes a result without an associated instance data block."
      },
      {
        type: "list",
        items: [
          "Scaling and unit conversion.",
          "Mathematical calculations.",
          "I/O mapping.",
          "Data transformations and comparisons.",
          "Reusable utility operations."
        ]
      },
      {
        type: "code",
        language: "text",
        content: "INPUTS\n   │\n   ▼\n  FC\n   │\n   ▼\nOUTPUTS"
      },
      {
        type: "paragraph",
        content:
          "The same FC can be called repeatedly with different data. It may read or modify persistent information supplied through its interface or stored elsewhere, but that persistence is not owned as FB instance state by the Function itself."
      },
      {
        type: "heading",
        title: "Function Block — Behavior with Instance State"
      },
      {
        type: "paragraph",
        content:
          "A Function Block is a natural fit when a responsibility represents behavior that must remember its own condition between cycles. Conveyors, pumps, valves, axes and other equipment modules often need independent state, timers, interlocks and diagnostics."
      },
      {
        type: "code",
        language: "text",
        content:
          "                 FB_Conveyor\n        ┌─────────────────────────┐\nCmd ───►│                         │───► Status\nI/O ───►│   Equipment behavior    │───► Outputs\n        │                         │\n        │   Internal state        │\n        │   Timers                │\n        │   Interlocks            │\n        │   Diagnostics           │\n        └────────────┬────────────┘\n                     │\n                     ▼\n              DB_Conveyor_1\n               Instance DB"
      },
      {
        type: "paragraph",
        content:
          "The instance DB stores the data belonging to that FB instance across PLC cycles. This allows one shared implementation to represent multiple pieces of equipment while each instance retains independent operating state."
      },
      {
        type: "heading",
        title: "Same Behavior, Different Instances"
      },
      {
        type: "code",
        language: "text",
        content:
          "FB_Conveyor\n   │\n   ├── DB_Conveyor_1 → Running\n   ├── DB_Conveyor_2 → Stopped\n   └── DB_Conveyor_3 → Faulted"
      },
      {
        type: "paragraph",
        content:
          "All three conveyors reuse the same behavior, but their commands, status, timers and diagnostic conditions remain independent. Reuse applies to the implementation; state belongs to each instance."
      },
      {
        type: "heading",
        title: "Instance State"
      },
      {
        type: "paragraph",
        content:
          "Instance state is information owned by one occurrence of a Function Block and preserved between calls. It describes where that instance is now or what it remembers from previous cycles."
      },
      {
        type: "list",
        items: [
          "Current operating state and mode.",
          "Latched commands and previous signal conditions.",
          "Timer and sequence progress.",
          "Interlock, fault and diagnostic state.",
          "Instance-specific configuration when ownership belongs to the equipment."
        ]
      },
      {
        type: "paragraph",
        content:
          "Static variables form part of FB instance data and can preserve this information across calls. Not every persistent value belongs in an instance DB, however; genuinely shared or externally owned data should remain with its proper architectural owner."
      },
      {
        type: "heading",
        title: "Decision Guide"
      },
      {
        type: "code",
        language: "text",
        content:
          "Does the responsibility need\ninstance-specific state?\n        │\n   ┌────┴────┐\n   │         │\n  NO        YES\n   │         │\n   ▼         ▼\n  FC         FB"
      },
      {
        type: "paragraph",
        content:
          "This is a practical heuristic rather than an absolute rule. An operation without owned instance state generally points toward an FC. Reusable behavior that must retain state for each instance generally points toward an FB. Block size alone is not a sound selection criterion."
      },
      {
        type: "heading",
        title: "Bad Decision Rules"
      },
      {
        type: "list",
        items: [
          "Use an FC because the logic is short.",
          "Use an FB because the logic is complex.",
          "Use an FB for every physical device.",
          "Use an FC whenever outputs can be calculated."
        ]
      },
      {
        type: "paragraph",
        content:
          "These shortcuts confuse implementation size with architectural responsibility. The better decision considers data ownership, lifecycle, persistence, reuse and whether multiple independent instances must coexist."
      },
      {
        type: "heading",
        title: "Example — Scaling"
      },
      {
        type: "code",
        language: "text",
        content: "Raw value\n    │\n    ▼\n FC_Scale\n    │\n    ▼\nEngineering value"
      },
      {
        type: "paragraph",
        content:
          "Scaling transforms an input value into engineering units according to supplied limits. When the operation does not need to retain its own instance-specific history, an FC is a natural candidate."
      },
      {
        type: "heading",
        title: "Example — Conveyor"
      },
      {
        type: "list",
        items: [
          "Remember whether the conveyor is starting, running, stopping or faulted.",
          "Maintain independent timing and edge history.",
          "Evaluate instance-specific interlocks and diagnostics.",
          "Expose commands and status through a consistent equipment interface."
        ]
      },
      {
        type: "paragraph",
        content:
          "A conveyor behavior with these responsibilities is a natural FB candidate. Multiple conveyors can use the same block while their instance DBs preserve separate state."
      },
      {
        type: "heading",
        title: "Engineering Note"
      },
      {
        type: "engineering-note",
        title: "Choose blocks according to responsibility, not size",
        content:
          "Use an FC when the responsibility is an operation that does not own FB instance state. Use an FB when the responsibility is reusable behavior that must remember independent state for each instance. This distinction keeps persistence, ownership and reuse explicit as the PLC application grows."
      }
    ]
  },
  {
    id: "article-008",
    slug: "global-db-vs-instance-db",

    kicker: "PLC SOFTWARE ARCHITECTURE",
    title: "Global DB vs Instance DB",
    excerpt:
      "Choosing data ownership based on responsibility, not convenience.",

    coverImage: "./assets/images/notebook/article-008-global-db-vs-instance-db.png",
    coverAlt:
      "Dark industrial engineering workstation showing a Siemens PLC architecture with shared global data and multiple Function Block instances with independent instance data.",

    readingTime: 3,

    categories: ["PLC Software Architecture"],

    sections: [
      {
        type: "introduction",
        content:
          "In a Siemens PLC project, both Global DBs and Instance DBs store data. But they represent two very different architectural decisions."
      },
      {
        type: "paragraph",
        content: "The important question is not:"
      },
      {
        type: "paragraph",
        content: "“Where can I store this variable?”"
      },
      {
        type: "paragraph",
        content: "It is:"
      },
      {
        type: "paragraph",
        content: "“Who owns this data?”"
      },
      {
        type: "paragraph",
        content:
          "That distinction becomes increasingly important as a PLC project grows."
      },
      {
        type: "heading",
        title: "Global DB"
      },
      {
        type: "paragraph",
        content:
          "A Global Data Block exists independently from a specific Function Block instance. It is appropriate for data that genuinely belongs to a wider system context, such as production information, recipes, line status or system configuration."
      },
      {
        type: "code",
        language: "text",
        content:
          "DB_System\n├── Production\n├── Recipe\n├── LineStatus\n└── Configuration"
      },
      {
        type: "paragraph",
        content:
          "Multiple parts of the program may legitimately need access to this information. The DB represents shared system data."
      },
      {
        type: "heading",
        title: "Instance DB"
      },
      {
        type: "paragraph",
        content:
          "An Instance DB belongs to a specific FB instance. The same Function Block can therefore be reused for multiple equipment instances while each instance maintains its own state."
      },
      {
        type: "code",
        language: "text",
        content:
          "FB_Conveyor\n      │\n      ├── Conveyor_01 → DB_Conveyor_01\n      ├── Conveyor_02 → DB_Conveyor_02\n      └── Conveyor_03 → DB_Conveyor_03"
      },
      {
        type: "paragraph",
        content:
          "Each conveyor executes the same behavior, but each instance maintains its own data."
      },
      {
        type: "paragraph",
        content: "Typical instance data may include:"
      },
      {
        type: "list",
        items: [
          "Running",
          "Fault",
          "SpeedFeedback",
          "Timers",
          "InternalState",
          "Diagnostics"
        ]
      },
      {
        type: "paragraph",
        content:
          "Those values belong to the conveyor object, not to the entire PLC application."
      },
      {
        type: "heading",
        title: "The architectural difference"
      },
      {
        type: "code",
        language: "text",
        content:
          "GLOBAL DB\n     │\n     └── Shared system information\n              │\n      ┌───────┼───────┐\n      ▼       ▼       ▼\n     FB_A    FB_B    FB_C\n\n\nINSTANCE DATA\n\n FB_Conveyor\n      │\n ┌────┼────┐\n ▼    ▼    ▼\nC01  C02  C03\n │    │    │\nDB01 DB02 DB03"
      },
      {
        type: "paragraph",
        content:
          "A Global DB creates shared ownership. Instance data creates local ownership associated with an FB instance. That distinction affects coupling, reuse, diagnostics and maintainability."
      },
      {
        type: "heading",
        title: "A common mistake"
      },
      {
        type: "paragraph",
        content:
          "A project may initially place equipment state inside large Global DBs because the data is easy to access."
      },
      {
        type: "code",
        language: "text",
        content:
          "DB_Machine.Conveyor01.Running\nDB_Machine.Conveyor01.Fault\nDB_Machine.Conveyor01.Timer"
      },
      {
        type: "paragraph",
        content: "Technically, this can work."
      },
      {
        type: "paragraph",
        content:
          "Architecturally, however, it can expose internal equipment state to the rest of the application and make unrelated logic dependent on implementation details. As the machine grows, those dependencies become harder to understand and modify safely."
      },
      {
        type: "heading",
        title: "Better decision rule"
      },
      {
        type: "paragraph",
        content:
          "Use Instance DB / FB instance data when the information belongs to the internal state or behavior of one equipment instance."
      },
      {
        type: "paragraph",
        content:
          "Use a Global DB when the information genuinely belongs to the wider application and needs shared ownership."
      },
      {
        type: "paragraph",
        content:
          "The objective is not to eliminate Global DBs. It is to give every piece of data a clear owner."
      },
      {
        type: "engineering-note",
        title: "Data ownership is part of PLC architecture.",
        content:
          "Store data according to the responsibility that owns it—not according to whichever DB is easiest to access."
      }
    ]
  }
];
