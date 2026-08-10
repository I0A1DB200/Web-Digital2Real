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
  }
];
