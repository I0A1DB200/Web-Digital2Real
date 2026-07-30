import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import {
  createExperienceYamlAdapter,
  parseExperienceYaml
} from "../yamlExperienceAdapter.js";

const realExperiencePath = new URL(
  "../../../content/experiences/siemens/EE-0002-drive-reset/experience.yaml",
  import.meta.url
);

test("parses the canonical drive-reset Authoring Definition v1", async () => {
  const source = await readFile(realExperiencePath, "utf8");
  const authoring = parseExperienceYaml(source);
  const validation = validateExperienceDefinition(authoring);

  assert.equal(validation.compatible, true);
  assert.equal(authoring.metadata.id, "EXP-SIEMENS-DRIVE-002");
  assert.equal(authoring.public.stages.length, 7);
  assert.equal(authoring.public.decisions.length, 14);
  assert.equal(Object.isFrozen(authoring), true);
  assert.equal(Object.isFrozen(authoring.public.stages), true);
});

test("supports mappings, sequences, quoted values and block scalars", () => {
  const parsed = parseExperienceYaml(`
root:
  title: "Quoted: value"
  enabled: true
  count: 2
  empty: []
  items:
    - id: ITEM-01
      description: >-
        first line
        second line
    - id: ITEM-02
      description: |-
        line one
        line two
`);

  assert.deepEqual(parsed, {
    root: {
      title: "Quoted: value",
      enabled: true,
      count: 2,
      empty: [],
      items: [
        { id: "ITEM-01", description: "first line second line" },
        { id: "ITEM-02", description: "line one\nline two" }
      ]
    }
  });
});

test("loads through an injected text boundary", async () => {
  const calls = [];
  const adapter = createExperienceYamlAdapter({
    loadText: async location => {
      calls.push(location);
      return "experience:\n  id: EXP-TEST-LOAD-001\n";
    }
  });

  const parsed = await adapter.load("memory://experience.yaml");

  assert.deepEqual(calls, ["memory://experience.yaml"]);
  assert.equal(parsed.experience.id, "EXP-TEST-LOAD-001");
});

test("rejects empty sources, tabs, duplicate keys and malformed indentation", () => {
  assert.throws(() => parseExperienceYaml(""), error => error.code === "INVALID_YAML_SOURCE");
  assert.throws(() => parseExperienceYaml("root:\n\tvalue: 1"), error => error.code === "YAML_TAB_INDENTATION");
  assert.throws(
    () => parseExperienceYaml("root:\n  value: 1\n  value: 2"),
    error => error.code === "INVALID_YAML_SYNTAX"
  );
  assert.throws(
    () => parseExperienceYaml("root:\n  value: 1\n   broken: 2"),
    error => error.code === "INVALID_YAML_SYNTAX"
  );
});

test("rejects invalid adapter contracts and locations", async () => {
  assert.throws(() => createExperienceYamlAdapter(), error => error.code === "INVALID_YAML_LOADER");
  const adapter = createExperienceYamlAdapter({ loadText: async () => "root: true" });
  await assert.rejects(() => adapter.load(""), error => error.code === "INVALID_YAML_LOCATION");
});
