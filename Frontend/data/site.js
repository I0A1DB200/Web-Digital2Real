/**
 * Global site metadata and navigation configuration.
 * Optional extensions may include socialLinks, contact, seo, footer, and copyright.
 *
 * @typedef {object} SiteData
 * @property {string} name
 * @property {string} subtitle
 * @property {string} description
 * @property {string} author
 * @property {string} version
 * @property {Array<{label: string, view: string}>} navigation
 * @property {{github: string, linkedin: string, email: string}} links
 * @property {Record<string, string>} [socialLinks]
 * @property {Record<string, string>} [contact]
 * @property {Record<string, string>} [seo]
 * @property {Record<string, string>} [footer]
 * @property {string} [copyright]
 */

/** @type {SiteData} */
export const site = {
  name: "Digital2Real",
  subtitle: "Industrial Automation Through Real Engineering",
  description:
    "An editorial and educational platform for Industrial Automation, built around real engineering problems.",
  author: "Alejandro Sánchez",
  version: "2.0.0",

  navigation: [
    {
      label: "Engineering Notes",
      view: "engineering-notes"
    },
    {
      label: "Academy",
      view: "academy"
    },
    {
      label: "About",
      view: "about"
    }
  ],

  home: {
    eyebrow: "Digital2Real",
    title: "Learn Industrial Automation Through Real Engineering.",
    introduction:
      "Practical engineering knowledge built around real industrial problems, reliable automation systems and the way engineers think in the field."
  },

  engineeringNotes: {
    title: "Engineering Notes",
    introduction:
      "Concise technical articles built around real industrial challenges, practical diagnostics and engineering decisions that can be applied in the field."
  },

  academy: {
    eyebrow: "Digital2Real Academy",
    title: "Learn Industrial Automation Through Real Missions.",
    introduction:
      "Academy is being designed as a practical learning journey through a fictional industrial plant. Instead of following software menus or isolated exercises, each mission begins with a machine, a fault or a production requirement that must be understood and solved.",
    objective:
      "The objective is not simply to memorize PLC instructions. It is to understand machines, signals, sequences, diagnostics and reusable automation architectures.",
    principles: [
      "Real industrial scenarios",
      "Problem-driven learning",
      "Progressive engineering challenges",
      "Concepts before platforms"
    ],
    status: "Academy is currently in development."
  },

  about: {
    eyebrow: "About Digital2Real",
    title: "Engineering knowledge should begin with real problems.",
    introduction: [
      "Digital2Real was created from a simple observation: industrial automation is often taught through software manuals, isolated instructions and long theoretical courses.",
      "Real factories do not work that way.",
      "Automation engineers deal with machines, sensors, PLCs, drives, HMIs, networks and production systems that interact continuously. Understanding those relationships is more valuable than memorizing a sequence of software menus.",
      "Digital2Real exists to bridge that gap."
    ],
    blocks: [
      {
        title: "Our Approach",
        paragraphs: [
          "Every Engineering Note and every future Academy mission is built around an industrial situation.",
          "A stopped conveyor.\nA drive that has lost communication.\nA sequence that does not behave as expected.\nA machine that needs to become safer, clearer or easier to maintain.",
          "The objective is not only to show a solution. It is to explain the engineering reasoning behind it: what should be inspected, which assumptions should be questioned and how a robust automation solution can be structured."
        ]
      },
      {
        title: "What Digital2Real Is Building",
        paragraphs: [
          "Digital2Real is evolving as an editorial and educational platform for Industrial Automation.",
          "Engineering Notes provide concise technical knowledge based on practical challenges.",
          "Academy will transform those principles into interactive missions where users learn by diagnosing, designing and solving industrial systems.",
          "Different formats, one objective:\nHelp engineers think clearly about automation."
        ]
      },
      {
        title: "Behind Digital2Real",
        paragraphs: [
          "Digital2Real is created by an Automation Engineer with hands-on experience in industrial maintenance, PLC programming, SCADA systems, industrial communications and production environments.",
          "The project is shaped by real troubleshooting, practical engineering decisions and the conviction that technical knowledge should be shared with clarity, accuracy and respect for the reader’s time."
        ]
      }
    ]
  },

  seo: {
    title: "Digital2Real — Industrial Automation Through Real Engineering",
    description:
      "Engineering Notes and practical learning experiences built around real industrial automation problems, diagnostics and reliable control systems."
  },

  links: {
    github: "",
    linkedin: "",
    email: ""
  }
};
