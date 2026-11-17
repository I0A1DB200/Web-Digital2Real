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
    navigation: site.navigation.map(item => ({ ...item, label: ({ "engineering-notes": "Notas de ingeniería", "experience-lab": "Experience Lab", about: "Acerca de" })[item.view] ?? item.label })),
    home: { ...site.home, title: "Aprende automatización industrial a través de la ingeniería real.", introduction: "Conocimiento práctico de ingeniería basado en problemas industriales reales, sistemas de automatización fiables y la forma de razonar de los ingenieros en planta." },
    engineeringNotes: { title: "Notas de ingeniería", introduction: "Artículos técnicos concisos sobre retos industriales reales, diagnóstico práctico y decisiones de ingeniería aplicables en planta." },
    simulator: {
      ...site.simulator,
      eyebrow: "D2R-3D-001 · SIMULADOR INDUSTRIAL 3D",
      description: "Explora la célula de inspección en PLC Engineering Mode: máquina 3D, HMI, PLC Watch y documentación bilingüe del proyecto.",
      previewLabel: "Abrir vista previa privada",
      previewNote: "Vista previa privada, accesible con la cuenta propietaria.",
      repositoryLabel: "Ver repositorio",
      imageAlt: "Render conceptual de la célula D2R: alimentador, cinta, cámara de inspección, armario y expulsor lateral.",
      imageNote: "Render ilustrativo; no es una fotografía de una máquina instalada."
    }
  };
}

/** @type {SiteData} */
export const site = {
  name: "Digital2Real",
  subtitle: "Industrial Automation Through Real Engineering",
  description:
    "An editorial and educational platform for Industrial Automation, built around real engineering problems.",
  author: "Alejandro Sánchez",
  version: "2.0.0",

  simulator: {
    eyebrow: "D2R-3D-001 · 3D INDUSTRIAL SIMULATOR",
    title: "D2R Inspection Cell",
    description: "Explore the inspection cell in PLC Engineering Mode: a 3D machine, HMI, PLC Watch, and bilingual project documentation.",
    cover: "assets/images/labs/d2r-inspection-cell-cover.jpg",
    previewUrl: "https://d2r-industrial-cell-preview.hillyclef2.chatgpt.site/",
    repositoryUrl: "https://github.com/I0A1DB200/d2r-industrial-cell/tree/feature/d2r-ui-design-system",
    previewLabel: "Open private preview",
    previewNote: "Private preview, available to the account owner.",
    repositoryLabel: "View repository",
    imageAlt: "Concept render of the D2R inspection cell: feeder, conveyor, inspection camera, control cabinet, and side pusher.",
    imageNote: "Illustrative render; not a photograph of an installed machine."
  },

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
