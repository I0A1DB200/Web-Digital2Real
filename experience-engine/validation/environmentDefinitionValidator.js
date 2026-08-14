import { EnvironmentDefinitionV1Schema } from "../schemas/environmentDefinitionV1Schema.js";

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

export function validateEnvironmentDefinition(candidate, {
  experienceEditorialIds = []
} = {}) {
  const incidents = [];
  const add = (severity, code, path, message) => {
    incidents.push({ severity, code, path, message });
  };

  if (!plainObject(candidate)) {
    add("error", "ENVIRONMENT_DEFINITION_NOT_OBJECT", "$", "Environment Definition must be a plain object.");
    return createResult("invalid", incidents);
  }

  requireFields(candidate, EnvironmentDefinitionV1Schema.required.root, "$", add);
  validateIdentity(candidate.environment, add);
  validateVisual(candidate.visual, add);
  validateHotspots(candidate.hotspots, candidate.environment?.lifecycle, experienceEditorialIds, add);

  return createResult("environment_v1", incidents);
}

function validateIdentity(environment, add) {
  if (!requireObject(environment, "$.environment", add)) return;
  requireFields(environment, EnvironmentDefinitionV1Schema.required.environment, "$.environment", add);
  requirePattern(environment.id, patterns.environment, "$.environment.id", "ENVIRONMENT_ID_INVALID", add);
  requirePattern(environment.slug, patterns.slug, "$.environment.slug", "ENVIRONMENT_SLUG_INVALID", add);
  requireEnum(environment.lifecycle, EnvironmentDefinitionV1Schema.enums.lifecycle, "$.environment.lifecycle", "ENVIRONMENT_LIFECYCLE_INVALID", add);
  requireText(environment.version, "$.environment.version", add);
}

function validateVisual(visual, add) {
  if (!requireObject(visual, "$.visual", add)) return;
  requireFields(visual, EnvironmentDefinitionV1Schema.required.visual, "$.visual", add);
  requirePattern(visual.background, patterns.background, "$.visual.background", "ENVIRONMENT_BACKGROUND_INVALID", add);
  requirePositiveInteger(visual.width, "$.visual.width", "ENVIRONMENT_WIDTH_INVALID", add);
  requirePositiveInteger(visual.height, "$.visual.height", "ENVIRONMENT_HEIGHT_INVALID", add);
}

function validateHotspots(hotspots, lifecycle, experienceEditorialIds, add) {
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
        add("error", "ENVIRONMENT_EXPERIENCE_UNRESOLVED", `${path}.experience_editorial_id`, `Published Environment reference does not resolve: ${hotspot.experience_editorial_id}.`);
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
