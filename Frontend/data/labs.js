/**
 * A laboratory record consumed by the card and viewer components.
 * Taxonomy, editorial, and relationship fields are optional future extensions.
 *
 * @typedef {object} Laboratory
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} description
 * @property {string} status
 * @property {string} version
 * @property {string} released
 * @property {string} cover
 * @property {string} video
 * @property {string[]} gallery
 * @property {string[]} technologies
 * @property {string} repository
 * @property {string[]} [categories]
 * @property {string[]} [tags]
 * @property {string} [difficulty]
 * @property {string} [duration]
 * @property {boolean} [featured]
 * @property {boolean} [published]
 * @property {string[]} [relatedLabs]
 */

/** @type {Laboratory[]} */
export const labs = [
  {
    id: "D2R-SCADA",
    slug: "industrial-web-scada",
    title: "Industrial Web SCADA",
    description:
      "Experimental web SCADA developed to explore modern industrial HMI concepts, machine states, alarms and control logic.",

    status: "Prototype",
    version: "v1.0",
    released: "2026",

    cover: "assets/images/scada-screen-2.png",
    video: "assets/videos/scada-demo.mp4",
    gallery: ["assets/images/scada-screen-2.png"],

    technologies: ["SCADA", "JavaScript", "HMI", "HTML", "CSS"],
    repository: ""
  },
  {
    id: "D2R-OPCUA",
    slug: "opcua-node-red-architecture",
    title: "OPC UA & Node-RED Architecture",
    description:
      "IT/OT laboratory focused on connecting industrial data to a web interface using Node-RED and OPC UA.",

    status: "Research",
    version: "v0.1",
    released: "2026",

    cover: "assets/images/itot-laptop.png",
    video: "assets/videos/opcua-node-red.mp4",
    gallery: ["assets/images/itot-laptop.png"],

    technologies: ["OPC UA", "Node-RED", "IT/OT", "Middleware"],
    repository: ""
  },
  {
    id: "D2R-AI",
    slug: "industrial-ai-assistant",
    title: "Industrial AI Assistant",
    description:
      "Concept laboratory for an AI assistant capable of explaining industrial systems, SCADA states and contextual operation.",

    status: "Concept",
    version: "v0.1",
    released: "2026",

    cover: "assets/images/diagnostics.png",
    video: "assets/videos/industrial-ai-assistant.mp4",
    gallery: ["assets/images/diagnostics.png"],

    technologies: ["AI", "Assistant", "SCADA", "UX"],
    repository: ""
  }
];
