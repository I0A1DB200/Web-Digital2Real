const MOBILE_NAVIGATION_QUERY = "(max-width: 700px)";

export function createNavbar(site, currentView, onNavigate, {
  documentRef = globalThis.document,
  windowRef = globalThis.window
} = {}) {
  if (!site || !Array.isArray(site.navigation)) {
    throw new TypeError("Navbar requires site navigation data.");
  }

  if (typeof onNavigate !== "function") {
    throw new TypeError("Navbar requires a navigation callback.");
  }

  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new TypeError("Navbar requires a document.");
  }

  const header = documentRef.createElement("header");
  header.className = "topbar";

  const inner = documentRef.createElement("div");
  inner.className = "topbar__inner";

  const brand = documentRef.createElement("button");
  brand.type = "button";
  brand.className = "brand";
  brand.dataset.view = site.navigation[0]?.view ?? "engineering-notes";
  brand.setAttribute("aria-label", "Go to Engineering Notes");
  brand.append("Digital");

  const brandAccent = documentRef.createElement("span");
  brandAccent.className = "brand__accent";
  brandAccent.textContent = "2";
  brand.append(brandAccent, "Real");

  const menuButton = documentRef.createElement("button");
  menuButton.type = "button";
  menuButton.className = "topbar__menu-toggle";
  menuButton.setAttribute("aria-label", "Toggle main navigation");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-controls", "main-navigation");
  menuButton.textContent = "☰";

  const navigation = documentRef.createElement("nav");
  navigation.className = "topbar__nav";
  navigation.id = "main-navigation";
  navigation.setAttribute("aria-label", "Main navigation");

  site.navigation.forEach(item => {
    if (!item || typeof item.view !== "string" || typeof item.label !== "string") {
      return;
    }

    const button = documentRef.createElement("button");
    button.type = "button";
    button.className = "topbar__link";
    button.dataset.view = item.view;
    button.textContent = item.label;

    if (item.view === currentView) {
      button.classList.add("is-active");
      button.setAttribute("aria-current", "page");
    }

    navigation.appendChild(button);
  });

  inner.append(brand, menuButton, navigation);
  header.appendChild(inner);

  let isMenuOpen = false;
  const mediaQuery = typeof windowRef?.matchMedia === "function"
    ? windowRef.matchMedia(MOBILE_NAVIGATION_QUERY)
    : null;

  function setMenuOpen(nextState, { restoreFocus = false } = {}) {
    isMenuOpen = Boolean(nextState);
    header.classList.toggle("is-menu-open", isMenuOpen);
    menuButton.setAttribute("aria-expanded", String(isMenuOpen));
    if (restoreFocus) menuButton.focus();
  }

  function handleHeaderClick(event) {
    const target = event.target;
    if (!target || typeof target.closest !== "function") return;

    if (target.closest(".topbar__menu-toggle")) {
      setMenuOpen(!isMenuOpen);
      return;
    }

    const button = target.closest("button[data-view]");

    if (button && header.contains(button)) {
      setMenuOpen(false);
      onNavigate(button.dataset.view);
    }
  }

  function handleOutsidePointer(event) {
    if (isMenuOpen && !header.contains(event.target)) setMenuOpen(false);
  }

  function handleKeydown(event) {
    if (event.key !== "Escape" || !isMenuOpen) return;
    event.preventDefault();
    setMenuOpen(false, { restoreFocus: true });
  }

  function handleViewportChange(event) {
    if (!event.matches) setMenuOpen(false);
  }

  function destroy() {
    documentRef.removeEventListener("pointerdown", handleOutsidePointer);
    mediaQuery?.removeEventListener?.("change", handleViewportChange);
  }

  header.addEventListener("click", handleHeaderClick);
  header.addEventListener("keydown", handleKeydown);
  documentRef.addEventListener("pointerdown", handleOutsidePointer);
  mediaQuery?.addEventListener?.("change", handleViewportChange);
  header.destroy = destroy;

  return header;
}
