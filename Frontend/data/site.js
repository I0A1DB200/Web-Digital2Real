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

export function getSite(locale) {
  if (locale !== "es") return site;
  return {
    ...site,
    footer: { ...site.footer, contactLabel: "Contacto" },
    navigation: site.navigation.map(item => ({ ...item, label: ({ "engineering-notes": "Notas de ingeniería", "experience-lab": "Experience Lab", about: "Acerca de" })[item.view] ?? item.label })),
    home: { ...site.home, title: "Aprende automatización industrial a través de la ingeniería real.", introduction: "Conocimiento práctico de ingeniería basado en problemas industriales reales, sistemas de automatización fiables y la forma de razonar de los ingenieros en planta." },
    engineeringNotes: { title: "Notas de ingeniería", introduction: "Artículos técnicos concisos sobre retos industriales reales, diagnóstico práctico y decisiones de ingeniería aplicables en planta." },
    simulators: localizeSimulators("es")
  };
}

const simulatorDefinitions = [
  {
    id: "d2r-inspection-cell",
    cover: "assets/images/labs/d2r-inspection-cell-cover.jpg",
    htmlUrl: "simulators/d2r-inspection-cell/index.html",
    en: {
      eyebrow: "3D SIMULATOR · D2R-3D-001",
      title: "D2R Inspection Cell",
      description: "Requirements, mechanical, electrical and pneumatic design, hardware selection, PLC architecture, programming, HMI, Safety and commissioning.",
      projectNote: "Teaching simulation; it does not represent a physical machine or real commissioning.",
      imageAlt: "Concept render of the D2R inspection cell: feeder, conveyor, inspection camera, control cabinet, and side pusher."
    },
    es: {
      eyebrow: "SIMULADOR 3D · D2R-3D-001",
      title: "Célula de inspección D2R",
      description: "Requisitos, diseño mecánico, eléctrico y neumático, selección de hardware, arquitectura PLC, programación, HMI, Safety y puesta en marcha.",
      projectNote: "Simulación didáctica; no representa una máquina física ni una puesta en marcha real.",
      imageAlt: "Render conceptual de la célula D2R: alimentador, cinta, cámara de inspección, armario y expulsor lateral."
    }
  },
  {
    id: "cobot-palletizing",
    cover: "assets/images/d2r-cobot-palletizing-card.webp",
    htmlUrl: "simulators/cobot/index.html",
    en: {
      eyebrow: "3D SIMULATOR · COBOT V3.6",
      title: "Cobot Programming / Palletizing",
      description: "Explore the nominal palletizing cycle, sequence and PLC Watch. DI_BoxSensor has no confirmed value in the V1.9 trace; its neutral representation does not mean OFF.",
      projectNote: "Didactic prototype; it is not a physical robot or a compiled TIA project. Motion is illustrative.",
      imageAlt: "Conceptual rendering of a cobot palletizing cell with conveyor and pallet; it does not prove a physical installation."
    },
    es: {
      eyebrow: "SIMULADOR 3D · COBOT V3.6",
      title: "Programación de cobot / Paletizado",
      description: "Explora el ciclo nominal de paletizado, la secuencia y la PLC Watch. DI_BoxSensor no tiene un valor confirmado en la traza V1.9; su representación neutra no significa OFF.",
      projectNote: "Prototipo didáctico; no representa un robot físico ni un proyecto TIA compilado. El movimiento es ilustrativo.",
      imageAlt: "Render conceptual de una célula de paletizado con cobot, cinta y palé; no demuestra una instalación física."
    }
  }
];

function localizeSimulators(locale) {
  return simulatorDefinitions.map(({ id, cover, htmlUrl, en, es }) => ({
    id,
    cover,
    htmlUrl,
    catalogEyebrow: locale === "es" ? "SIMULADORES INDEPENDIENTES" : "STANDALONE SIMULATORS",
    catalogTitle: locale === "es" ? "Simuladores 3D de ingeniería" : "3D Engineering Simulators",
    catalogDescription: locale === "es"
      ? "Explora células simuladas y las decisiones de ingeniería que hay detrás de ellas."
      : "Explore simulated cells and the engineering decisions behind them.",
    openLabel: locale === "es" ? "Abrir simulador" : "Open simulator",
    closeLabel: locale === "es" ? "Volver al catálogo" : "Back to catalog",
    frameTitle: locale === "es" ? `${(es ?? en).title} · Simulador 3D` : `${en.title} · 3D Simulator`,
    ...(locale === "es" ? es : en)
  }));
}

/** @type {SiteData} */
export const site = {
  name: "Digital2Real",
  footer: { contactLabel: "Contact", contactEmail: "hello@d2rautomation.com" },
  subtitle: "Industrial Automation Through Real Engineering",
  description:
    "An editorial and educational platform for Industrial Automation, built around real engineering problems.",
  author: "Alejandro Sánchez",
  version: "2.0.0",

  simulators: localizeSimulators("en"),

  navigation: [
    {
      label: "Engineering Notes",
      view: "engineering-notes"
    },
    {
      label: "Experience Lab",
      view: "experience-lab"
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
          "Every Engineering Note is built around an industrial situation.",
          "A stopped conveyor.\nA drive that has lost communication.\nA sequence that does not behave as expected.\nA machine that needs to become safer, clearer or easier to maintain.",
          "The objective is not only to show a solution. It is to explain the engineering reasoning behind it: what should be inspected, which assumptions should be questioned and how a robust automation solution can be structured."
        ]
      },
      {
        title: "What Digital2Real Is Building",
        paragraphs: [
          "Digital2Real is evolving as an editorial publication for Industrial Automation.",
          "Engineering Notes provide concise technical knowledge based on practical challenges.",
          "Each publication connects practical problems with the engineering reasoning used to understand and solve them.",
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
