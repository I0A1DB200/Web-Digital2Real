// One frontend language preference; the existing storage key is retained for compatibility.
export const activeLocales = Object.freeze(["es", "en"]);
export const localeStorageKey = "digital2real.experience-locale.v1";
export function normalizeLocale(value) {
  return typeof value === "string" ? value.toLowerCase().split("-")[0] : "";
}
export function supportedLocale(value) {
  const locale = normalizeLocale(value);
  return activeLocales.includes(locale) ? locale : "en";
}
export function localeStorage() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}
export function readLocale(storage, initialLocale) {
  try {
    const saved = storage?.getItem(localeStorageKey);
    if (activeLocales.includes(saved)) return saved;
  } catch { /* A blocked preference store does not prevent learning. */ }
  return supportedLocale(initialLocale);
}
export function saveLocale(storage, locale) {
  try { storage?.setItem(localeStorageKey, locale); } catch { /* Session preference remains usable. */ }
}

export function createLocalePreference({ storage = localeStorage(), initialLocale = globalThis.document?.documentElement?.lang } = {}) {
  let locale = readLocale(storage, initialLocale);
  let pending = false;
  const listeners = new Set();
  const guards = new Set();
  const notify = () => listeners.forEach(listener => listener(locale, pending));
  return Object.freeze({
    getLocale: () => locale,
    isPending: () => pending,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    beforeChange(guard) { guards.add(guard); return () => guards.delete(guard); },
    async setLocale(requested) {
      const next = supportedLocale(requested);
      if (pending) return false;
      if (next === locale) return true;
      pending = true; notify();
      try {
        for (const guard of guards) if (await guard(next) === false) return false;
        locale = next;
        saveLocale(storage, locale);
        return true;
      } finally { pending = false; notify(); }
    }
  });
}
