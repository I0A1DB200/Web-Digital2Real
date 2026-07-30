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
  }
];
