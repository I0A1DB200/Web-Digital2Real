import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseExperienceYaml as parseYaml } from "../experience-engine/adapter/yamlExperienceAdapter.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(scriptDirectory, "..");
const idPattern = /^SRC-[0-9]{6}$/u;

const readYaml = async file => parseYaml(await readFile(file, "utf8"));
const array = value => Array.isArray(value) ? value : [];
const nonEmpty = value => typeof value === "string" && value.trim().length > 0;
const normalizedUrl = value => {
  if (!nonEmpty(value)) return "";
  const url = new URL(value);
  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  return url.toString().replace(/\/$/u, "");
};

function validateSchema(value, schema, location = "record") {
  const errors = [];
  const add = message => errors.push(`${location}: ${message}`);
  if (schema.const !== undefined && value !== schema.const) add(`must equal ${JSON.stringify(schema.const)}`);
  if (schema.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [`${location}: must be an object`];
    for (const key of array(schema.required)) if (!(key in value)) errors.push(`${location}.${key}: is required`);
    for (const [key, child] of Object.entries(schema.properties ?? {})) {
      if (key in value) errors.push(...validateSchema(value[key], child, `${location}.${key}`));
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) if (!(key in (schema.properties ?? {}))) errors.push(`${location}.${key}: is not allowed`);
    }
  } else if (schema.type === "array") {
    if (!Array.isArray(value)) return [`${location}: must be an array`];
    if (schema.minItems !== undefined && value.length < schema.minItems) add(`must contain at least ${schema.minItems} item(s)`);
    if (schema.uniqueItems && new Set(value.map(item => JSON.stringify(item))).size !== value.length) add("must contain unique items");
    if (schema.items) value.forEach((item, index) => errors.push(...validateSchema(item, schema.items, `${location}[${index}]`)));
  } else if (schema.type === "string") {
    if (typeof value !== "string") return [`${location}: must be a string`];
    if (schema.minLength !== undefined && value.length < schema.minLength) add(`must have length >= ${schema.minLength}`);
    if (schema.pattern && !(new RegExp(schema.pattern, "u")).test(value)) add(`must match ${schema.pattern}`);
  } else if (schema.type === "boolean" && typeof value !== "boolean") add("must be a boolean");
  if (schema.enum && !schema.enum.includes(value)) add("has an invalid value");
  return errors;
}

async function findYamlFiles(directory) {
  try {
    return (await readdir(directory, { withFileTypes: true }))
      .filter(entry => entry.isFile() && entry.name.endsWith(".yaml"))
      .map(entry => path.join(directory, entry.name));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

export async function validateSourceLibrary({ repositoryRoot = defaultRoot } = {}) {
  const root = path.resolve(repositoryRoot);
  const library = path.join(root, "knowledge", "source-library");
  const errors = [];
  const [master, taxonomy, authorities, schema] = await Promise.all([
    readYaml(path.join(library, "D2R_SOURCE_LIBRARY_MASTER.yaml")),
    readYaml(path.join(library, "taxonomies.yaml")),
    readYaml(path.join(library, "authorities", "protocol-authorities.yaml")),
    readYaml(path.join(library, "schema", "source-record.schema.yaml"))
  ]);

  const vocabulary = {
    classification: new Set(array(taxonomy.source_classifications)),
    resourceType: new Set(array(taxonomy.resource_types)),
    reviewState: new Set(array(taxonomy.review_states)),
    authorityLevel: new Set(array(taxonomy.authority_levels)),
    availability: new Set(array(taxonomy.availability_states)),
    domain: new Set(array(taxonomy.domain_ids)),
    protocol: new Set(array(taxonomy.protocol_ids))
  };
  const authorityProtocols = new Set();
  const authorityOrganizations = new Set();
  for (const entry of array(authorities.authorities)) {
    if (!vocabulary.protocol.has(entry.protocol_id)) errors.push(`protocol authority ${entry.protocol_id}: invalid protocol ID`);
    if (authorityProtocols.has(entry.protocol_id)) errors.push(`protocol authority ${entry.protocol_id}: duplicate`);
    authorityProtocols.add(entry.protocol_id);
    if (!nonEmpty(entry.organization_id) || !nonEmpty(entry.organization_name)) errors.push(`protocol authority ${entry.protocol_id}: incomplete authority identity`);
    authorityOrganizations.add(entry.organization_id);
  }

  const recordFiles = await findYamlFiles(path.join(library, "records"));
  const records = new Map();
  const canonicalIdentities = new Map();
  for (const file of recordFiles) {
    const relative = path.relative(root, file).replaceAll("\\", "/");
    const record = await readYaml(file);
    errors.push(...validateSchema(record, schema, relative));
    if (!idPattern.test(record.id ?? "")) errors.push(`${relative}: invalid source ID`);
    if (path.basename(file) !== `${record.id}.yaml`) errors.push(`${relative}: filename must match source ID`);
    if (records.has(record.id)) errors.push(`${relative}: duplicate source ID ${record.id}`);
    records.set(record.id, { record, file, relative });

    const checks = [
      [record.classification, vocabulary.classification, "classification"],
      [record.availability, vocabulary.availability, "availability"],
      [record.authority?.level, vocabulary.authorityLevel, "authority level"],
      [record.review?.state, vocabulary.reviewState, "review state"]
    ];
    for (const [value, allowed, label] of checks) if (!allowed.has(value)) errors.push(`${relative}: invalid ${label} ${value}`);
    for (const value of array(record.resource_types)) if (!vocabulary.resourceType.has(value)) errors.push(`${relative}: invalid resource type ${value}`);
    for (const value of array(record.domain_ids)) if (!vocabulary.domain.has(value)) errors.push(`${relative}: invalid domain ID ${value}`);
    for (const value of array(record.protocols_interfaces)) {
      if (!vocabulary.protocol.has(value)) errors.push(`${relative}: invalid protocol ID ${value}`);
      else if (!authorityProtocols.has(value)) errors.push(`${relative}: protocol ${value} has no neutral authority registry entry`);
    }

    for (const [name, value] of Object.entries(record.locations ?? {})) {
      if (!nonEmpty(value)) continue;
      try { normalizedUrl(value); } catch { errors.push(`${relative}: malformed ${name}`); }
    }
    for (const resource of array(record.resources)) {
      if (!vocabulary.resourceType.has(resource.resource_type)) errors.push(`${relative}: invalid language resource type ${resource.resource_type}`);
      if (!nonEmpty(resource.language)) errors.push(`${relative}: language resource requires a language`);
      try { normalizedUrl(resource.url); } catch { errors.push(`${relative}: malformed resource URL ${resource.id ?? "unknown"}`); }
    }
    try {
      const identity = normalizedUrl(record.locations?.canonical_url);
      if (identity) {
        if (canonicalIdentities.has(identity)) errors.push(`${relative}: duplicate canonical source identity with ${canonicalIdentities.get(identity)}`);
        else canonicalIdentities.set(identity, record.id);
      }
    } catch {}

    for (const local of array(record.local_files)) {
      const localPath = typeof local === "string" ? local : local?.path;
      if (!nonEmpty(localPath)) { errors.push(`${relative}: local file entry requires a path`); continue; }
      const resolved = path.resolve(root, localPath);
      const allowedRoot = path.resolve(library, "files") + path.sep;
      if (!resolved.startsWith(allowedRoot)) errors.push(`${relative}: local file escapes knowledge/source-library/files: ${localPath}`);
      else { try { await access(resolved); } catch { errors.push(`${relative}: missing local file ${localPath}`); } }
    }

    if (record.rights?.repository_storage_permitted === true && !nonEmpty(record.rights.license)) errors.push(`${relative}: local storage permission requires an explicit license`);
    if (record.rights?.production_use_permitted === true && !nonEmpty(record.rights.license)) errors.push(`${relative}: production permission requires an explicit license`);
    if (array(record.local_files).length && record.rights?.repository_storage_permitted !== true) errors.push(`${relative}: local files require repository storage permission`);
    if (record.review?.state === "approved") {
      if (!nonEmpty(record.review.reviewed_by) || !nonEmpty(record.review.reviewed_at)) errors.push(`${relative}: approved source requires explicit reviewer and review date`);
      if (record.authority?.level === "unverified") errors.push(`${relative}: approved source cannot have unverified authority`);
      if (!nonEmpty(record.provenance?.last_verified_at)) errors.push(`${relative}: approved source requires last_verified_at`);
    }
  }

  const indexed = new Set();
  for (const item of array(master.records)) {
    if (!idPattern.test(item.id ?? "")) errors.push(`master: invalid source ID ${item.id}`);
    if (indexed.has(item.id)) errors.push(`master: duplicate source ID ${item.id}`);
    indexed.add(item.id);
    const found = records.get(item.id);
    if (!found) { errors.push(`master: missing record ${item.id}`); continue; }
    const expected = path.relative(library, found.file).replaceAll("\\", "/");
    if (item.path !== expected) errors.push(`master: ${item.id} path must be ${expected}`);
    const record = found.record;
    if (item.classification !== record.classification || item.review_state !== record.review?.state) errors.push(`master: ${item.id} discovery metadata is stale`);
    for (const protocol of array(item.protocol_ids)) if (!vocabulary.protocol.has(protocol)) errors.push(`master: ${item.id} has invalid protocol ${protocol}`);
  }
  for (const id of records.keys()) if (!indexed.has(id)) errors.push(`master: record ${id} is not indexed`);

  for (const { record, relative } of records.values()) {
    for (const related of [...array(record.relationships?.supersedes), ...array(record.relationships?.related_sources)]) {
      if (!records.has(related)) errors.push(`${relative}: unresolved source relationship ${related}`);
    }
  }

  const referenceCatalog = await readYaml(path.join(root, "knowledge", "references", "catalog.yaml"));
  const assetCatalog = await readYaml(path.join(root, "assets", "library", "catalog.yaml"));
  for (const [label, entries] of [["reference", referenceCatalog.references], ["asset", assetCatalog.assets]]) {
    for (const entry of array(entries)) for (const id of array(entry.source_ids)) {
      if (!records.has(id)) errors.push(`${label} ${entry.id ?? "unknown"}: missing source ID ${id}`);
    }
  }

  return { valid: errors.length === 0, errors, recordCount: records.size, protocolAuthorityCount: authorityOrganizations.size };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await validateSourceLibrary();
  if (!result.valid) {
    console.error(`D2R Source Library validation failed (${result.errors.length} error(s)):`);
    result.errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log(`D2R Source Library valid: ${result.recordCount} source record(s), ${result.protocolAuthorityCount} protocol authority organization(s).`);
  }
}
