import { scrollToContent } from '../../../components/scrollToContent.js';

// Presentation-only policy: target the current workspace content, never the document origin.
export function scrollWorkspaceToTop(windowRef = globalThis.window, element = windowRef?.document?.querySelector?.('.experience-workspace'), options = {}) {
  const target = element?.querySelector?.('.experience-result h2') ?? element?.querySelector?.('.experience-stage-layout h2') ?? element?.querySelector?.('h1, h2') ?? element;
  scrollToContent(target, { windowRef, ifNeeded: true, ...options });
}
