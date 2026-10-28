export function scrollWorkspaceToTop(windowRef = globalThis.window) {
  if (!windowRef || typeof windowRef.scrollTo !== "function") return;
  const prefersReducedMotion = typeof windowRef.matchMedia === "function"
    && windowRef.matchMedia("(prefers-reduced-motion: reduce)")?.matches === true;
  windowRef.scrollTo({
    top: 0,
    left: 0,
    behavior: prefersReducedMotion ? "auto" : "smooth"
  });
}
