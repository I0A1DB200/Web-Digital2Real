/**
 * An editorial notebook entry consumed by the notebook card component.
 * Discovery, publication, and relationship fields are optional future extensions.
 *
 * @typedef {object} NotebookEntry
 * @property {string} id
 * @property {string} title
 * @property {string} date
 * @property {string} summary
 * @property {string} content
 * @property {string[]} tags
 * @property {string[]} [categories]
 * @property {string} [readingTime]
 * @property {boolean} [featured]
 * @property {boolean} [published]
 * @property {string[]} [relatedLabs]
 */

/** @type {NotebookEntry[]} */
export const notebook = [
  {
    id: "note-001",
    title: "Why Digital2Real became a laboratory archive",
    date: "2026-06-30",
    summary:
      "A short note about transforming Digital2Real from a traditional website into an editorial engineering portfolio.",
    content:
      "Digital2Real is no longer designed as a corporate landing page. The new direction is based on laboratories, documentation and continuous engineering evolution.",
    tags: ["Vision", "Product", "Automation"]
  },
  {
    id: "note-002",
    title: "Designing a modern industrial HMI",
    date: "2026-06-30",
    summary:
      "Notes about hierarchy, states, alarms and visual clarity in industrial interfaces.",
    content:
      "An industrial HMI should not be treated as decoration. Its purpose is to help operators understand the process, detect abnormal states and act safely.",
    tags: ["SCADA", "HMI", "UX"]
  }
];
