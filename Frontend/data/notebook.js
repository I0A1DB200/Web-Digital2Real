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
 * @property {{labs: string[], notebook: string[], academy: string[]}} [related]
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
      notebook: [],
      academy: []
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
      notebook: [],
      academy: []
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
    slug: "g120-profinet-communication",

    kicker: "Problem → Solution",
    title: "Lost Communication with a SINAMICS G120? Start Here.",
    excerpt:
      "A structured troubleshooting workflow to diagnose communication faults between a PLC and a SINAMICS G120 over PROFINET before replacing hardware.",

    coverImage: "assets/images/notebook/article-003-g120-profinet-communication.png",

    readingTime: 1,

    categories: ["Drives & Motion"],
    tags: [
      "Siemens",
      "SINAMICS G120",
      "PROFINET",
      "PLC",
      "Troubleshooting",
      "Industrial Automation"
    ],
    technologies: ["Siemens TIA Portal", "PROFINET", "SINAMICS G120"],

    sections: [
      {
        type: "introduction",
        content:
          "A PROFINET communication fault between a PLC and a SINAMICS G120 is one of the most common issues encountered in industrial automation. While the drive may appear to have failed, the root cause is often much simpler. A structured troubleshooting routine can significantly reduce downtime and prevent unnecessary component replacement."
      },
      {
        type: "heading",
        title: "Challenge"
      },
      {
        type: "paragraph",
        content:
          "When the PLC reports a communication loss, the instinct is often to focus on software diagnostics or replace the drive immediately. In reality, the failure may originate anywhere along the communication chain:"
      },
      {
        type: "list",
        items: [
          "Damaged Ethernet cable",
          "Faulty network switch",
          "Incorrect device name",
          "IP address conflict",
          "Power loss",
          "Hardware alarm on the drive",
          "PROFINET configuration mismatch"
        ]
      },
      {
        type: "paragraph",
        content:
          "Without a logical diagnostic sequence, valuable production time can be lost chasing the wrong cause."
      },
      {
        type: "heading",
        title: "Solution"
      },
      {
        type: "paragraph",
        content: "Start every diagnosis from the physical layer before opening TIA Portal."
      },
      {
        type: "list",
        title: "A simple workflow can quickly isolate most communication faults.",
        items: [
          "1. Verify Power.\n\nEnsure the G120 is powered and free of active hardware faults.",
          "2. Check PROFINET LEDs.\n\nInspect the status LEDs on the PLC, network switch and drive.",
          "3. Confirm Device Identification.\n\nVerify that the PROFINET device name and IP address match the project configuration.",
          "4. Validate Cyclic Data Exchange.\n\nConfirm that the PLC is still exchanging cyclic I/O data with the drive.",
          "5. Inspect the Physical Network.\n\nCheck Ethernet connectors, cables and switch ports.",
          "6. Restart Communication.\n\nIf every previous check is correct, restart communication before replacing hardware."
        ]
      },
      {
        type: "heading",
        title: "Engineering Note"
      },
      {
        type: "engineering-note",
        content:
          "A communication alarm rarely identifies the real root cause.\n\nTreat the communication path as one complete system.\n\nPLC → Switch → Network → G120."
      },
      {
        type: "heading",
        title: "Field Tip"
      },
      {
        type: "callout",
        content:
          "If the BF LED is active but the LINK LEDs are off, don't start with TIA Portal.\n\nCheck the Ethernet cable and the switch first.\n\nMany \"drive failures\" are simply physical communication issues."
      },
      {
        type: "heading",
        title: "Key Takeaways"
      },
      {
        type: "list",
        items: [
          "Check the physical layer first.",
          "Verify LEDs before engineering software.",
          "Confirm device name and IP address.",
          "Follow the same diagnostic sequence every time.",
          "Replace hardware only after configuration and network verification."
        ]
      },
      {
        type: "heading",
        title: "Conclusion"
      },
      {
        type: "paragraph",
        content:
          "Structured troubleshooting is one of the most valuable habits for an automation engineer. A repeatable workflow reduces downtime, avoids unnecessary component replacement and builds confidence during fault diagnosis."
      }
    ]
  }
];
