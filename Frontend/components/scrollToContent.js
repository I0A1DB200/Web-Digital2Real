export function scrollToContent(target, {
  windowRef = globalThis.window,
  ifNeeded = false,
  behavior,
  focus = false
} = {}) {
  if (!windowRef?.scrollTo || !target) return;
  const rect = target.getBoundingClientRect?.();
  const documentRef = target.ownerDocument ?? windowRef.document;
  const navbar = documentRef?.querySelector?.('.topbar')?.getBoundingClientRect?.();
  const offset = navbar?.height ?? 0;
  if (focus) {
    target.setAttribute?.('tabindex', '-1');
    target.focus?.({ preventScroll: true });
  }
  if (ifNeeded && rect && rect.top >= offset && rect.bottom <= windowRef.innerHeight) return;
  const reduced = windowRef.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  windowRef.scrollTo({
    top: Math.max(0, (windowRef.scrollY ?? 0) + (rect?.top ?? 0) - offset),
    left: 0,
    behavior: behavior ?? (reduced ? 'auto' : 'smooth')
  });
}
