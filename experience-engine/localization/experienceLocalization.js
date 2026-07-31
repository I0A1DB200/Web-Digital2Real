const plainObject = value => value !== null
  && typeof value === "object"
  && !Array.isArray(value);

export class ExperienceLocalizationError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ExperienceLocalizationError";
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

export function resolveExperienceLocalization(authoring, localeDocument) {
  if (!plainObject(authoring) || !plainObject(authoring.public)) {
    throw new ExperienceLocalizationError("INVALID_AUTHORING", "Localization requires Authoring v1 content.");
  }
  if (!plainObject(localeDocument) || typeof localeDocument.locale !== "string"
    || !plainObject(localeDocument.translations)) {
    throw new ExperienceLocalizationError("INVALID_LOCALE", "Locale document is invalid.");
  }

  const localized = structuredClone(authoring);
  const translations = localeDocument.translations;
  localized.metadata.language = localeDocument.locale;
  applyRequired(localized.public, translations, ["title", "summary"]);
  applyRequired(localized.public.scenario, translations.scenario, [
    "initial_context",
    "operational_state",
    "initiating_event",
    "learner_role"
  ]);
  applyRequired(
    localized.public.scenario.safety_context,
    translations.scenario?.safety_context,
    ["safe_state", "intervention_constraints"]
  );
  applyById(localized.public.learning_objectives, translations.learning_objectives, ["description"]);
  applyById(localized.public.stages, translations.stages, ["title", "situation"]);
  applyById(localized.public.evidence, translations.evidence, ["source", "content"]);
  applyById(localized.public.decisions, translations.decisions, ["action"]);
  applyRequired(localized.public.visual, translations.visual, ["educational_purpose"]);
  applyById(localized.public.visual.assets ?? [], translations.assets, ["alt", "caption"]);
  if (plainObject(localized.public.completion)) {
    applyRequired(localized.public.completion, translations.completion, [
      "title",
      "summary",
      "process",
      "lesson",
      "avoided_errors",
      "industrial_value"
    ]);
  }
  return deepFreeze(localized);
}

export function selectLocaleDocument(locale, documents, defaultLocale) {
  if (!plainObject(documents)) {
    throw new ExperienceLocalizationError("INVALID_LOCALE_SET", "Locale documents must be keyed by locale.");
  }
  const selected = documents[locale] ?? documents[defaultLocale];
  if (!selected) {
    throw new ExperienceLocalizationError(
      "LOCALE_UNAVAILABLE",
      `Neither locale ${locale} nor fallback ${defaultLocale} is available.`,
      { locale, defaultLocale }
    );
  }
  return selected;
}

function applyRequired(target, translations, fields) {
  if (!plainObject(target) || !plainObject(translations)) missing(fields.join(", "));
  fields.forEach(field => {
    if (!Object.hasOwn(translations, field) || !validTranslation(translations[field])) missing(field);
    target[field] = structuredClone(translations[field]);
  });
}

function applyById(targets, translations, fields) {
  if (!Array.isArray(targets) || !plainObject(translations)) missing("id-indexed translations");
  targets.forEach(target => {
    const translation = translations[target.id];
    if (!plainObject(translation)) missing(target.id);
    fields.forEach(field => {
      if (!Object.hasOwn(translation, field) || !validTranslation(translation[field])) {
        missing(`${target.id}.${field}`);
      }
      target[field] = structuredClone(translation[field]);
    });
  });
}

function validTranslation(value) {
  if (typeof value === "string") return Boolean(value.trim());
  return Array.isArray(value) && value.length > 0
    && value.every(item => typeof item === "string" && item.trim());
}

function missing(field) {
  throw new ExperienceLocalizationError(
    "MISSING_TRANSLATION",
    `Required translation is missing: ${field}.`,
    { field }
  );
}

function deepFreeze(value) {
  if (Array.isArray(value)) {
    value.forEach(deepFreeze);
    return Object.freeze(value);
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  }
  return value;
}
