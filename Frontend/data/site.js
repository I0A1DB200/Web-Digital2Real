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
  subtitle: "Industrial Automation Labs",
  description:
    "A personal collection of industrial automation laboratories, software experiments and engineering notes.",
  author: "Alejandro Sánchez",
  version: "2.0.0",

  navigation: [
    {
      label: "Labs",
      view: "labs"
    },
    {
      label: "Notebook",
      view: "notebook"
    },
    {
      label: "About",
      view: "about"
    }
  ],

  links: {
    github: "",
    linkedin: "",
    email: ""
  }
};
