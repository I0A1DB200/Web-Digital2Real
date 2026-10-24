import { activeLocales } from "../data/locale.js";

export function createLanguageSelector(preference, { documentRef = globalThis.document } = {}) {
  const element = documentRef.createElement("div");
  element.className = "language-selector";
  element.setAttribute("role", "group");
  const buttons = activeLocales.map(locale => {
    const button = documentRef.createElement("button");
    button.type = "button";
    button.className = "language-selector__option";
    button.textContent = locale.toUpperCase();
    button.setAttribute("lang", locale);
    button.addEventListener("click", async () => {
      const changed = await preference.setLocale(locale);
      status.textContent = changed ? "" : preference.getLocale() === "es"
        ? "No se pudo cambiar el idioma. Inténtalo de nuevo."
        : "Could not change language. Please try again.";
      button.focus();
    });
    element.appendChild(button);
    return button;
  });
  const status = documentRef.createElement("span");
  status.className = "language-selector__status";
  status.setAttribute("role", "status");
  element.appendChild(status);
  function update() {
    element.setAttribute("aria-label", preference.getLocale() === "es" ? "Idioma" : "Language");
    buttons.forEach((button, index) => {
      button.setAttribute("aria-pressed", String(activeLocales[index] === preference.getLocale()));
      button.disabled = preference.isPending();
    });
  }
  const unsubscribe = preference.subscribe(update);
  update();
  return { element, destroy: unsubscribe };
}
