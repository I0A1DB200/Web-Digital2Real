import { SignalAccessMode, SignalCategory, SignalDataType, SignalNamespaceRoot, SignalOwner, SignalPersistenceMode, SignalQuality } from "./signalConstants.js";

const plain = value => value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;

export function immutableCopy(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(immutableCopy));
  if (plain(value)) return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, immutableCopy(item)])));
  return value;
}

export class SignalDomainError extends Error {
  constructor(code, message, context = {}) {
    super(message);
    this.name = "SignalDomainError";
    this.code = code;
    this.context = immutableCopy(context);
  }
}

export function validateTimestamp(timestamp) {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp) || timestamp < 0) throw new SignalDomainError("INVALID_TIMESTAMP", "Timestamp must be a caller-supplied finite non-negative number.", { timestamp });
}

export function validateSignalValue(dataType, value, metadata = {}) {
  const validators = {
    Boolean: () => typeof value === "boolean",
    Integer: () => Number.isFinite(value) && Number.isInteger(value),
    Float: () => typeof value === "number" && Number.isFinite(value),
    String: () => typeof value === "string",
    Enum: () => Array.isArray(metadata.enumValues) && metadata.enumValues.includes(value)
  };
  if (!validators[dataType]?.()) throw new SignalDomainError(dataType === "Enum" ? "INVALID_ENUM_VALUE" : "INVALID_VALUE_TYPE", `Value does not conform to ${dataType}.`, { dataType, value });
}

const text = (value, field) => {
  if (typeof value !== "string" || !value.trim()) throw new SignalDomainError("INVALID_SIGNAL_DEFINITION", `${field} must be a non-empty string.`, { field });
  return value.trim();
};
const enumValue = (value, enumeration, field) => {
  if (!Object.hasOwn(enumeration, value)) throw new SignalDomainError("INVALID_SIGNAL_DEFINITION", `${field} is unsupported.`, { field, value });
  return value;
};

export function createSignalDefinition(candidate) {
  if (!plain(candidate)) throw new SignalDomainError("INVALID_SIGNAL_DEFINITION", "Signal definition must be a plain object.");
  const namespace = text(candidate.namespace, "namespace");
  const segments = namespace.split("/");
  if (segments.length < 2 || !Object.hasOwn(SignalNamespaceRoot, segments[0]) || segments.some(part => !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(part))) throw new SignalDomainError("INVALID_NAMESPACE", "Namespace must use an approved root and valid path segments.", { namespace });
  const consumers = candidate.consumers ?? candidate.destination;
  if (!Array.isArray(consumers) || consumers.some(item => typeof item !== "string" || !item.trim())) throw new SignalDomainError("INVALID_SIGNAL_DEFINITION", "consumers must be an array of non-empty strings.");
  if (!plain(candidate.metadata)) throw new SignalDomainError("INVALID_SIGNAL_DEFINITION", "metadata must be a plain object.");
  if (candidate.metadata.enumValues !== undefined && (!Array.isArray(candidate.metadata.enumValues) || !candidate.metadata.enumValues.length || candidate.metadata.enumValues.some(item => !["string", "number"].includes(typeof item)))) throw new SignalDomainError("INVALID_SIGNAL_DEFINITION", "enumValues must be a non-empty array of strings or numbers.");
  const definition = {
    id: text(candidate.id, "id"), displayName: text(candidate.displayName, "displayName"), description: text(candidate.description, "description"), namespace,
    category: enumValue(candidate.category, SignalCategory, "category"), dataType: enumValue(candidate.dataType, SignalDataType, "dataType"), owner: enumValue(candidate.owner, SignalOwner, "owner"),
    source: text(candidate.source, "source"), consumers: [...new Set(consumers.map(item => item.trim()))], accessMode: enumValue(candidate.accessMode, SignalAccessMode, "accessMode"), scope: text(candidate.scope, "scope"),
    persistenceMode: enumValue(candidate.persistenceMode, SignalPersistenceMode, "persistenceMode"), engineeringUnit: candidate.engineeringUnit === null ? null : text(candidate.engineeringUnit, "engineeringUnit"),
    defaultValue: candidate.defaultValue, metadata: candidate.metadata, initialQuality: enumValue(candidate.initialQuality, SignalQuality, "initialQuality")
  };
  if (!/^sig\.[a-z0-9]+(?:[._-][a-z0-9]+)+$/.test(definition.id)) throw new SignalDomainError("INVALID_SIGNAL_DEFINITION", "id must use sig.<domain>.<stable-local-id>.", { id: definition.id });
  validateSignalValue(definition.dataType, definition.defaultValue, definition.metadata);
  return immutableCopy(definition);
}
