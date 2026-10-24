import { translations } from "./locales/es.js";

const presentationFields = ["title", "kicker", "excerpt", "coverAlt", "categories", "tags", "technologies"];

// Locale overlays contain presentation only; canonical sections own order and type.
export function localizeNotebook(entries, requested = "en") {
  const locale = String(requested).toLowerCase().split("-")[0] === "es" ? "es" : "en";
  return entries.map(entry => {
    const translated = translations[entry.id];
    if (locale === "es" && !translated) throw new Error(`Missing Spanish Notebook entry: ${entry.id}`);
    const result = { ...entry, locale, categoryIds: [...(entry.categories ?? [])] };
    if (locale === "es") {
      for (const field of presentationFields) {
        if (entry[field] === undefined) continue;
        const value = translated[field];
        if (Array.isArray(entry[field])) {
          if (!Array.isArray(value) || value.length !== entry[field].length || value.some(item => typeof item !== "string" || !item.trim())) {
            throw new Error(`Invalid Spanish ${entry.id}.${field}`);
          }
        } else if (typeof value !== "string" || !value.trim()) {
          throw new Error(`Missing Spanish ${entry.id}.${field}`);
        }
        result[field] = value;
      }
    }
    const identifiers = new Set();
    result.sections = entry.sections.map(section => {
      if (!section.id || identifiers.has(section.id)) throw new Error(`Invalid section identity in ${entry.id}`);
      identifiers.add(section.id);
      const overlay = translated?.sections[section.id];
      if (locale === "en") return { ...section, locale };
      if (section.type === "code" && overlay !== undefined && section.presentation !== "diagram") throw new Error(`Executable code cannot be translated: ${entry.id}.${section.id}`);
      if (overlay === undefined) {
        if (section.type !== "code") throw new Error(`Missing Spanish ${entry.id}.${section.id}`);
        return { ...section, locale };
      }
      const fields = typeof overlay === "string"
        ? { [section.type === "heading" ? "title" : "content"]: overlay }
        : Array.isArray(overlay) ? { items: overlay } : overlay;
      for (const [key, value] of Object.entries(fields)) {
        if (!["title", "content", "items"].includes(key) || section[key] === undefined) throw new Error(`Invalid overlay ${entry.id}.${section.id}.${key}`);
        if (key === "items" ? !Array.isArray(value) || value.length !== section.items.length || value.some(item => typeof item !== "string" || !item.trim()) : typeof value !== "string" || !value.trim()) {
          throw new Error(`Invalid Spanish section ${entry.id}.${section.id}`);
        }
      }
      for (const key of ["title", "content", "items"]) {
        if (section[key] !== undefined && fields[key] === undefined) throw new Error(`Incomplete Spanish ${entry.id}.${section.id}.${key}`);
      }
      return { ...section, ...fields, locale };
    });
    for (const key of Object.keys(translated?.sections ?? {})) {
      if (!identifiers.has(key)) throw new Error(`Orphan Spanish section ${entry.id}.${key}`);
    }
    return result;
  });
}
