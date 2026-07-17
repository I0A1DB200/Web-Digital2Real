export function createNavbar(site, currentView, onNavigate) {
  if (!site || !Array.isArray(site.navigation)) {
    throw new TypeError("Navbar requires site navigation data.");
  }

  if (typeof onNavigate !== "function") {
    throw new TypeError("Navbar requires a navigation callback.");
  }

  const header = document.createElement("header");
  header.className = "topbar";

  const inner = document.createElement("div");
  inner.className = "topbar__inner";

  const brand = document.createElement("button");
  brand.type = "button";
  brand.className = "brand";
  brand.dataset.view = "labs";
  brand.setAttribute("aria-label", "Go to Labs");
  brand.append("Digital");

  const brandAccent = document.createElement("span");
  brandAccent.className = "brand__accent";
  brandAccent.textContent = "2";
  brand.append(brandAccent, "Real");

  const navigation = document.createElement("nav");
  navigation.className = "topbar__nav";
  navigation.setAttribute("aria-label", "Main navigation");

  site.navigation.forEach(item => {
    if (!item || typeof item.view !== "string" || typeof item.label !== "string") {
      return;
    }

    const button = document.createElement("button");
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

  inner.append(brand, navigation);
  header.appendChild(inner);

  header.addEventListener("click", event => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const button = event.target.closest("button[data-view]");

    if (button && header.contains(button)) {
      onNavigate(button.dataset.view);
    }
  });

  return header;
}
