export class ExperienceYamlError extends Error {
  constructor(code, message, context = {}) {
    super(message);
    this.name = "ExperienceYamlError";
    this.code = code;
    this.context = Object.freeze({ ...context });
  }
}

export function parseExperienceYaml(source) {
  if (typeof source !== "string" || !source.trim()) {
    throw new ExperienceYamlError("INVALID_YAML_SOURCE", "YAML source must be a non-empty string.");
  }

  const lines = tokenize(source);
  if (!lines.length) {
    throw new ExperienceYamlError("INVALID_YAML_SOURCE", "YAML source contains no data.");
  }
  if (lines[0].indent !== 0) {
    syntaxError(lines[0], "Root content must start at indentation zero.");
  }

  const parsed = parseBlock(lines, 0, 0);
  if (parsed.nextIndex !== lines.length) {
    syntaxError(lines[parsed.nextIndex], "Unexpected trailing YAML content.");
  }
  if (!isPlainObject(parsed.value)) {
    throw new ExperienceYamlError("INVALID_EXPERIENCE_DOCUMENT", "Experience YAML root must be a mapping.");
  }

  return immutableCopy(parsed.value);
}

export function createExperienceYamlAdapter({ loadText } = {}) {
  if (typeof loadText !== "function") {
    throw new ExperienceYamlError("INVALID_YAML_LOADER", "loadText must be a function.");
  }

  return Object.freeze({
    async load(location) {
      if (typeof location !== "string" || !location.trim()) {
        throw new ExperienceYamlError("INVALID_YAML_LOCATION", "Experience location must be a non-empty string.");
      }
      const source = await loadText(location);
      return parseExperienceYaml(source);
    }
  });
}

function tokenize(source) {
  const normalized = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const rawLines = normalized.split("\n");
  const lines = [];

  rawLines.forEach((raw, index) => {
    if (raw.includes("\t")) {
      throw new ExperienceYamlError(
        "YAML_TAB_INDENTATION",
        "YAML indentation must use spaces.",
        { line: index + 1 }
      );
    }
    const withoutTrailing = raw.replace(/[ \t]+$/u, "");
    const trimmed = withoutTrailing.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed === "---" || trimmed === "...") return;
    const indent = withoutTrailing.length - withoutTrailing.trimStart().length;
    lines.push({
      indent,
      content: stripInlineComment(withoutTrailing.slice(indent)),
      line: index + 1,
      raw: withoutTrailing
    });
  });

  return lines;
}

function parseBlock(lines, startIndex, indent) {
  const line = lines[startIndex];
  if (!line || line.indent !== indent) {
    syntaxError(line, `Expected indentation ${indent}.`);
  }
  return line.content === "-" || line.content.startsWith("- ")
    ? parseSequence(lines, startIndex, indent)
    : parseMapping(lines, startIndex, indent);
}

function parseMapping(lines, startIndex, indent) {
  const result = {};
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];
    if (line.indent < indent) break;
    if (line.indent > indent) syntaxError(line, "Unexpected mapping indentation.");
    if (line.content === "-" || line.content.startsWith("- ")) break;

    const pair = splitPair(line);
    if (Object.hasOwn(result, pair.key)) {
      syntaxError(line, `Duplicate mapping key: ${pair.key}.`);
    }

    if (isBlockScalarMarker(pair.value)) {
      const scalar = parseBlockScalar(lines, index + 1, indent, pair.value);
      result[pair.key] = scalar.value;
      index = scalar.nextIndex;
      continue;
    }

    if (pair.value !== "") {
      result[pair.key] = parseScalar(pair.value, line);
      index += 1;
      continue;
    }

    const next = lines[index + 1];
    if (!next || next.indent <= indent) {
      result[pair.key] = null;
      index += 1;
      continue;
    }
    const nested = parseBlock(lines, index + 1, next.indent);
    result[pair.key] = nested.value;
    index = nested.nextIndex;
  }

  return { value: result, nextIndex: index };
}

function parseSequence(lines, startIndex, indent) {
  const result = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];
    if (line.indent < indent) break;
    if (line.indent > indent) syntaxError(line, "Unexpected sequence indentation.");
    if (line.content !== "-" && !line.content.startsWith("- ")) break;

    const item = line.content.slice(1).trimStart();
    if (!item) {
      const next = lines[index + 1];
      if (!next || next.indent <= indent) {
        result.push(null);
        index += 1;
      } else {
        const nested = parseBlock(lines, index + 1, next.indent);
        result.push(nested.value);
        index = nested.nextIndex;
      }
      continue;
    }

    if (!looksLikePair(item)) {
      result.push(parseScalar(item, line));
      index += 1;
      continue;
    }

    const object = {};
    const firstPair = splitPair({ ...line, content: item });
    if (isBlockScalarMarker(firstPair.value)) {
      const scalar = parseBlockScalar(lines, index + 1, indent, firstPair.value);
      object[firstPair.key] = scalar.value;
      index = scalar.nextIndex;
    } else if (firstPair.value !== "") {
      object[firstPair.key] = parseScalar(firstPair.value, line);
      index += 1;
    } else {
      const next = lines[index + 1];
      if (!next || next.indent <= indent) {
        object[firstPair.key] = null;
        index += 1;
      } else {
        const nested = parseBlock(lines, index + 1, next.indent);
        object[firstPair.key] = nested.value;
        index = nested.nextIndex;
      }
    }

    while (index < lines.length && lines[index].indent > indent) {
      const continuationIndent = lines[index].indent;
      if (lines[index].content === "-" || lines[index].content.startsWith("- ")) {
        syntaxError(lines[index], "Sequence object continuation must be a mapping.");
      }
      const continuation = parseMapping(lines, index, continuationIndent);
      Object.entries(continuation.value).forEach(([key, value]) => {
        if (Object.hasOwn(object, key)) syntaxError(lines[index], `Duplicate mapping key: ${key}.`);
        object[key] = value;
      });
      index = continuation.nextIndex;
    }
    result.push(object);
  }

  return { value: result, nextIndex: index };
}

function parseBlockScalar(lines, startIndex, parentIndent, marker) {
  const contentLines = [];
  let index = startIndex;
  let contentIndent = null;

  while (index < lines.length && lines[index].indent > parentIndent) {
    if (contentIndent === null) contentIndent = lines[index].indent;
    if (lines[index].indent < contentIndent) break;
    contentLines.push(lines[index].raw.slice(contentIndent));
    index += 1;
  }

  const folded = marker.startsWith(">");
  const keepFinalNewline = !marker.endsWith("-");
  const body = folded ? contentLines.join(" ") : contentLines.join("\n");
  return {
    value: keepFinalNewline && contentLines.length ? `${body}\n` : body,
    nextIndex: index
  };
}

function splitPair(line) {
  const separator = findMappingSeparator(line.content);
  if (separator < 1) syntaxError(line, "Expected a mapping key followed by a colon.");
  const key = line.content.slice(0, separator).trim();
  if (!/^[A-Za-z_][A-Za-z0-9_-]*$/u.test(key)) {
    syntaxError(line, `Unsupported mapping key: ${key}.`);
  }
  return { key, value: line.content.slice(separator + 1).trim() };
}

function looksLikePair(value) {
  return findMappingSeparator(value) > 0;
}

function findMappingSeparator(value) {
  let quote = null;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quote) {
      if (character === quote && value[index - 1] !== "\\") quote = null;
      continue;
    }
    if (character === "\"" || character === "'") {
      quote = character;
      continue;
    }
    if (character === ":" && (index === value.length - 1 || /\s/u.test(value[index + 1]))) return index;
  }
  return -1;
}

function parseScalar(value, line) {
  if (value === "null" || value === "~") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?(?:0|[1-9]\d*)$/u.test(value)) return Number.parseInt(value, 10);
  if (/^-?(?:0|[1-9]\d*)\.\d+$/u.test(value)) return Number.parseFloat(value);
  if (value === "[]") return [];
  if (value === "{}") return {};
  if (value.startsWith("\"")) {
    try {
      return JSON.parse(value);
    } catch {
      syntaxError(line, "Invalid double-quoted scalar.");
    }
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'")) syntaxError(line, "Invalid single-quoted scalar.");
    return value.slice(1, -1).replace(/''/gu, "'");
  }
  if (/^[\[{]/u.test(value)) {
    try {
      return JSON.parse(value);
    } catch {
      syntaxError(line, "Unsupported inline collection.");
    }
  }
  return value;
}

function stripInlineComment(value) {
  let quote = null;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quote) {
      if (character === quote && value[index - 1] !== "\\") quote = null;
      continue;
    }
    if (character === "\"" || character === "'") quote = character;
    if (character === "#" && index > 0 && /\s/u.test(value[index - 1])) {
      return value.slice(0, index).trimEnd();
    }
  }
  return value;
}

function isBlockScalarMarker(value) {
  return ["|", "|-", ">", ">-"].includes(value);
}

function syntaxError(line, message) {
  throw new ExperienceYamlError(
    "INVALID_YAML_SYNTAX",
    message,
    { line: line?.line ?? null, content: line?.content ?? null }
  );
}

function immutableCopy(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(immutableCopy));
  if (isPlainObject(value)) {
    return Object.freeze(Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, immutableCopy(item)])
    ));
  }
  return value;
}

function isPlainObject(value) {
  return value !== null
    && typeof value === "object"
    && Object.getPrototypeOf(value) === Object.prototype;
}
