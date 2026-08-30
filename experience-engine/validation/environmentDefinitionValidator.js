import { EnvironmentDefinitionV1Schema } from "../schemas/environmentDefinitionV1Schema.js";
import { EnvironmentDefinitionV2Schema } from "../schemas/environmentDefinitionV2Schema.js";

const plainObject = value => value !== null
  && typeof value === "object"
  && !Array.isArray(value);

const immutableCopy = value => {
  if (Array.isArray(value)) return Object.freeze(value.map(immutableCopy));
  if (plainObject(value)) {
    return Object.freeze(Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, immutableCopy(item)])
    ));
  }
  return value;
};

const patterns = Object.freeze(Object.fromEntries(
  Object.entries(EnvironmentDefinitionV1Schema.identifierPatterns)
    .map(([name, pattern]) => [name, new RegExp(pattern, "u")])
));
const v2Patterns = Object.freeze(Object.fromEntries(Object.entries(EnvironmentDefinitionV2Schema.patterns)
  .map(([name, pattern]) => [name, new RegExp(pattern, "u")])));

export function validateEnvironmentDefinition(candidate, {
  experienceEditorialIds = [], theory = null, theoryLocales = {}
} = {}) {
  const incidents = [];
  const add = (severity, code, path, message) => {
    incidents.push({ severity, code, path, message });
  };

  if (!plainObject(candidate)) {
    add("error", "ENVIRONMENT_DEFINITION_NOT_OBJECT", "$", "Environment Definition must be a plain object.");
    return createResult("invalid", incidents);
  }

  const contractVersion = candidate.contract_version ?? EnvironmentDefinitionV1Schema.contractVersion;
  if (![EnvironmentDefinitionV1Schema.contractVersion, EnvironmentDefinitionV2Schema.contractVersion].includes(contractVersion)) {
    add("error", "ENVIRONMENT_CONTRACT_VERSION_UNSUPPORTED", "$.contract_version", `Unsupported Environment contract version: ${String(contractVersion)}.`);
    return createResult("environment_unsupported", incidents);
  }
  requireFields(candidate, contractVersion === EnvironmentDefinitionV2Schema.contractVersion
    ? EnvironmentDefinitionV2Schema.required.environmentRoot
    : EnvironmentDefinitionV1Schema.required.root, "$", add);
  validateIdentity(candidate.environment, add);
  validateVisual(candidate.visual, add);
  validateHotspots(
    candidate.hotspots,
    candidate.environment?.lifecycle,
    candidate.environment?.capacity,
    experienceEditorialIds,
    add
  );
  if (contractVersion === EnvironmentDefinitionV2Schema.contractVersion) {
    requirePattern(candidate.theory, v2Patterns.theorySource, "$.theory", "ENVIRONMENT_THEORY_REFERENCE_INVALID", add);
    validateTheory(theory, theoryLocales, add);
  }

  return createResult(contractVersion === EnvironmentDefinitionV2Schema.contractVersion ? "environment_v2" : "environment_v1", incidents);
}

function validateTheory(theory, locales, add) {
  if (!requireObject(theory, "$.theory_document", add)) return;
  requireFields(theory, EnvironmentDefinitionV2Schema.required.theory, "$.theory_document", add);
  if (theory.version !== EnvironmentDefinitionV2Schema.theoryVersion) add("error", "THEORY_VERSION_UNSUPPORTED", "$.theory_document.version", "Unsupported Theory contract version.");
  if (theory.default_locale !== "es") add("error", "THEORY_DEFAULT_LOCALE_INVALID", "$.theory_document.default_locale", "Pilot Theory default locale must be es.");
  if (!Array.isArray(theory.supported_locales)
    || theory.supported_locales.length !== EnvironmentDefinitionV2Schema.supportedLocales.length
    || theory.supported_locales.some((locale, index) => locale !== EnvironmentDefinitionV2Schema.supportedLocales[index])) {
    add("error", "THEORY_SUPPORTED_LOCALES_INVALID", "$.theory_document.supported_locales", "Theory must support es and en in canonical order.");
  }
  const mediaIds = new Set();
  if (!Array.isArray(theory.media)) add("error", "THEORY_MEDIA_INVALID", "$.theory_document.media", "Theory media must be an array.");
  else theory.media.forEach((item, index) => {
    const path = `$.theory_document.media[${index}]`;
    if (!requireObject(item, path, add)) return;
    requireFields(item, EnvironmentDefinitionV2Schema.required.media, path, add);
    requirePattern(item.id, v2Patterns.mediaId, `${path}.id`, "THEORY_MEDIA_ID_INVALID", add);
    requireEnum(item.type, EnvironmentDefinitionV2Schema.mediaTypes, `${path}.type`, "THEORY_MEDIA_TYPE_INVALID", add);
    requirePattern(item.src, v2Patterns.mediaSource, `${path}.src`, "THEORY_MEDIA_SOURCE_INVALID", add);
    requireText(item.alt, `${path}.alt`, add);
    if (mediaIds.has(item.id)) add("error", "THEORY_MEDIA_ID_DUPLICATE", `${path}.id`, `Duplicate Theory media ID ${item.id}.`);
    mediaIds.add(item.id);
  });
  const sectionIds = validateSections(theory.sections, mediaIds, "$.theory_document.sections", add);
  for (const locale of theory.supported_locales ?? []) {
    if (locale === theory.default_locale) continue;
    const document = locales[locale];
    const path = `$.theory_locales.${locale}`;
    if (!requireObject(document, path, add)) continue;
    requireFields(document, EnvironmentDefinitionV2Schema.required.locale, path, add);
    if (document.locale !== locale) add("error", "THEORY_LOCALE_IDENTITY_INVALID", `${path}.locale`, `Theory locale must be ${locale}.`);
    const localizedIds = validateSections(document.sections, mediaIds, `${path}.sections`, add);
    if (localizedIds.join("|") !== sectionIds.join("|")) add("error", "THEORY_LOCALE_SECTIONS_MISMATCH", `${path}.sections`, "Localized Theory sections must preserve canonical IDs and order.");
    if (!Array.isArray(document.media)) add("error", "THEORY_LOCALE_MEDIA_INVALID", `${path}.media`, "Localized Theory media must be an array.");
    else document.media.forEach((item, index) => {
      if (!requireObject(item, `${path}.media[${index}]`, add)) return;
      requireText(item.id, `${path}.media[${index}].id`, add); requireText(item.alt, `${path}.media[${index}].alt`, add);
      if (!mediaIds.has(item.id)) add("error", "THEORY_LOCALE_MEDIA_UNKNOWN", `${path}.media[${index}].id`, `Unknown localized Theory media ${item.id}.`);
    });
  }
}

function validateSections(sections, mediaIds, path, add) {
  if (!Array.isArray(sections) || !sections.length) { add("error", "THEORY_SECTIONS_REQUIRED", path, "Theory requires at least one section."); return []; }
  const ids = new Set();
  return sections.map((section, index) => {
    const itemPath = `${path}[${index}]`;
    if (!requireObject(section, itemPath, add)) return null;
    requireFields(section, EnvironmentDefinitionV2Schema.required.section, itemPath, add);
    requirePattern(section.id, v2Patterns.sectionId, `${itemPath}.id`, "THEORY_SECTION_ID_INVALID", add);
    requireText(section.title, `${itemPath}.title`, add); requireText(section.body, `${itemPath}.body`, add);
    if (ids.has(section.id)) add("error", "THEORY_SECTION_ID_DUPLICATE", `${itemPath}.id`, `Duplicate Theory section ID ${section.id}.`);
    ids.add(section.id);
    if (!Array.isArray(section.media_ids)) add("error", "THEORY_SECTION_MEDIA_INVALID", `${itemPath}.media_ids`, "Section media_ids must be an array.");
    else section.media_ids.forEach(id => { if (!mediaIds.has(id)) add("error", "THEORY_SECTION_MEDIA_UNKNOWN", `${itemPath}.media_ids`, `Unknown Theory media ${id}.`); });
    return section.id;
  }).filter(Boolean);
}

function validateIdentity(environment, add) {
  if (!requireObject(environment, "$.environment", add)) return;
  requireFields(environment, EnvironmentDefinitionV1Schema.required.environment, "$.environment", add);
  requirePattern(environment.id, patterns.environment, "$.environment.id", "ENVIRONMENT_ID_INVALID", add);
  requirePattern(environment.slug, patterns.slug, "$.environment.slug", "ENVIRONMENT_SLUG_INVALID", add);
  requireText(environment.title, "$.environment.title", add);
  requireEnum(environment.lifecycle, EnvironmentDefinitionV1Schema.enums.lifecycle, "$.environment.lifecycle", "ENVIRONMENT_LIFECYCLE_INVALID", add);
  requireText(environment.version, "$.environment.version", add);
  requirePositiveInteger(environment.capacity, "$.environment.capacity", "ENVIRONMENT_CAPACITY_INVALID", add);
}

function validateVisual(visual, add) {
  if (!requireObject(visual, "$.visual", add)) return;
  requireFields(visual, EnvironmentDefinitionV1Schema.required.visual, "$.visual", add);
  requirePattern(visual.background, patterns.background, "$.visual.background", "ENVIRONMENT_BACKGROUND_INVALID", add);
  requirePositiveInteger(visual.width, "$.visual.width", "ENVIRONMENT_WIDTH_INVALID", add);
  requirePositiveInteger(visual.height, "$.visual.height", "ENVIRONMENT_HEIGHT_INVALID", add);
}

function validateHotspots(hotspots, lifecycle, capacity, experienceEditorialIds, add) {
  if (!Array.isArray(hotspots)) {
    add("error", "ENVIRONMENT_HOTSPOTS_INVALID_TYPE", "$.hotspots", "hotspots must be an array.");
    return;
  }

  const rule = EnvironmentDefinitionV1Schema.lifecycleRules[lifecycle];
  if (rule && (hotspots.length < rule.minimumHotspots || hotspots.length > rule.maximumHotspots)) {
    add(
      "error",
      "ENVIRONMENT_HOTSPOT_COUNT_INVALID",
      "$.hotspots",
      `${lifecycle} Environment requires ${rule.minimumHotspots === rule.maximumHotspots ? `exactly ${rule.minimumHotspots}` : `${rule.minimumHotspots}-${rule.maximumHotspots}`} hotspots.`
    );
  }
  if (Number.isInteger(capacity) && capacity > 0) {
    if (hotspots.length > capacity || (lifecycle === "published" && hotspots.length !== capacity)) {
      add(
        "error",
        "ENVIRONMENT_CAPACITY_MISMATCH",
        "$.hotspots",
        lifecycle === "published"
          ? `Published Environment requires exactly its capacity of ${capacity} hotspots.`
          : `Environment hotspots cannot exceed its capacity of ${capacity}.`
      );
    }
  }

  const references = new Set();
  const resolvable = new Set(experienceEditorialIds);
  hotspots.forEach((hotspot, position) => {
    const path = `$.hotspots[${position}]`;
    if (!requireObject(hotspot, path, add)) return;
    requireFields(hotspot, EnvironmentDefinitionV1Schema.required.hotspot, path, add);
    Object.keys(hotspot).forEach(field => {
      if (!EnvironmentDefinitionV1Schema.hotspotFields.includes(field)) {
        add("error", "ENVIRONMENT_HOTSPOT_FIELD_UNKNOWN", `${path}.${field}`, `Hotspot field ${field} is not permitted.`);
      }
    });
    requirePattern(hotspot.experience_editorial_id, patterns.experienceEditorial, `${path}.experience_editorial_id`, "EXPERIENCE_EDITORIAL_ID_INVALID", add);
    requirePercentage(hotspot.x, `${path}.x`, add);
    requirePercentage(hotspot.y, `${path}.y`, add);

    if (typeof hotspot.experience_editorial_id === "string") {
      if (references.has(hotspot.experience_editorial_id)) {
        add("error", "ENVIRONMENT_EXPERIENCE_DUPLICATE", `${path}.experience_editorial_id`, `Duplicate Experience reference: ${hotspot.experience_editorial_id}.`);
      }
      references.add(hotspot.experience_editorial_id);
      if (rule?.requiresResolution && !resolvable.has(hotspot.experience_editorial_id)) {
        add("error", "ENVIRONMENT_EXPERIENCE_UNRESOLVED", `${path}.experience_editorial_id`, `Environment reference does not resolve: ${hotspot.experience_editorial_id}.`);
      }
    }
  });
}

function requireObject(value, path, add) {
  if (plainObject(value)) return true;
  add("error", "ENVIRONMENT_OBJECT_REQUIRED", path, `${path} must be a plain object.`);
  return false;
}

function requireFields(value, fields, path, add) {
  if (!plainObject(value)) return;
  fields.forEach(field => {
    if (!Object.hasOwn(value, field)) add("error", "ENVIRONMENT_FIELD_REQUIRED", `${path}.${field}`, `Required field ${field} is missing.`);
  });
}

function requirePattern(value, pattern, path, code, add) {
  if (typeof value !== "string" || !pattern.test(value)) add("error", code, path, `${path} has an invalid format.`);
}

function requireText(value, path, add) {
  if (typeof value !== "string" || !value.trim()) add("error", "ENVIRONMENT_TEXT_REQUIRED", path, `${path} must be a non-empty string.`);
}

function requireEnum(value, values, path, code, add) {
  if (!values.includes(value)) add("error", code, path, `${path} must be one of: ${values.join(", ")}.`);
}

function requirePositiveInteger(value, path, code, add) {
  if (!Number.isInteger(value) || value <= 0) add("error", code, path, `${path} must be a positive integer.`);
}

function requirePercentage(value, path, add) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) {
    add("error", "ENVIRONMENT_COORDINATE_INVALID", path, `${path} must be a finite number between 0 and 100.`);
  }
}

function createResult(profile, incidents) {
  const ordered = [...incidents].sort((left, right) => (
    left.path.localeCompare(right.path)
    || left.code.localeCompare(right.code)
    || left.message.localeCompare(right.message)
  ));
  return immutableCopy({
    valid: !ordered.some(incident => incident.severity === "error"),
    profile,
    incidents: ordered
  });
}
