import assert from "node:assert/strict";
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateSourceLibrary } from "../validate-source-library.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "d2r-source-library-"));
  await mkdir(path.join(root, "knowledge"), { recursive: true });
  await mkdir(path.join(root, "assets"), { recursive: true });
  await cp(path.join(repositoryRoot, "knowledge", "source-library"), path.join(root, "knowledge", "source-library"), { recursive: true });
  await cp(path.join(repositoryRoot, "knowledge", "references"), path.join(root, "knowledge", "references"), { recursive: true });
  await cp(path.join(repositoryRoot, "assets", "library"), path.join(root, "assets", "library"), { recursive: true });
  return root;
}

async function withFixture(run) {
  const root = await fixture();
  try { await run(root); } finally { await rm(root, { recursive: true, force: true }); }
}

const recordPath = root => path.join(root, "knowledge", "source-library", "records", "SRC-000001.yaml");

test("the repository Source Library foundation is valid", async () => {
  const result = await validateSourceLibrary({ repositoryRoot });
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.equal(result.recordCount, 23);
});

test("rejects malformed source IDs and stale master references", () => withFixture(async root => {
  const file = recordPath(root);
  await writeFile(file, (await readFile(file, "utf8")).replace("SRC-000001", "SOURCE-1"));
  const result = await validateSourceLibrary({ repositoryRoot: root });
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /invalid source ID|filename must match|missing record/u);
}));

test("rejects malformed URLs", () => withFixture(async root => {
  const file = recordPath(root);
  await writeFile(file, (await readFile(file, "utf8")).replace("https://www.turck.us/en/product/1644874", "not a url"));
  const result = await validateSourceLibrary({ repositoryRoot: root });
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /malformed canonical_url/u);
}));

test("rejects vocabulary values outside the governed taxonomy", () => withFixture(async root => {
  const file = recordPath(root);
  await writeFile(file, (await readFile(file, "utf8")).replace("classification: PRIMARY_TECHNICAL", "classification: UNKNOWN_CLASS"));
  const result = await validateSourceLibrary({ repositoryRoot: root });
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /invalid classification UNKNOWN_CLASS/u);
}));

test("rejects local or production permission without an explicit license", () => withFixture(async root => {
  const file = recordPath(root);
  await writeFile(file, (await readFile(file, "utf8")).replace("repository_storage_permitted: false", "repository_storage_permitted: true"));
  const result = await validateSourceLibrary({ repositoryRoot: root });
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /local storage permission requires an explicit license/u);
}));

test("rejects unresolved source relationships", () => withFixture(async root => {
  const file = recordPath(root);
  await writeFile(file, (await readFile(file, "utf8")).replace("related_sources: []", "related_sources: [\"SRC-999999\"]"));
  const result = await validateSourceLibrary({ repositoryRoot: root });
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /unresolved source relationship SRC-999999/u);
}));

test("rejects approved records without explicit review evidence", () => withFixture(async root => {
  const file = recordPath(root);
  await writeFile(file, (await readFile(file, "utf8")).replace("state: discovered", "state: approved"));
  const master = path.join(root, "knowledge", "source-library", "D2R_SOURCE_LIBRARY_MASTER.yaml");
  await writeFile(master, (await readFile(master, "utf8")).replace("review_state: discovered", "review_state: approved"));
  const result = await validateSourceLibrary({ repositoryRoot: root });
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /approved source requires explicit reviewer/u);
}));

test("rejects local files outside the governed storage boundary", () => withFixture(async root => {
  const file = recordPath(root);
  await writeFile(file, (await readFile(file, "utf8")).replace("local_files: []", "local_files: [\"README.md\"]"));
  const result = await validateSourceLibrary({ repositoryRoot: root });
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /local file escapes/u);
}));

test("rejects asset records that reference missing source IDs", () => withFixture(async root => {
  const catalog = path.join(root, "assets", "library", "catalog.yaml");
  await writeFile(catalog, "version: \"1.0.0\"\nassets:\n  - id: AST-000001\n    source_ids: [\"SRC-999999\"]\n");
  const result = await validateSourceLibrary({ repositoryRoot: root });
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /asset AST-000001: missing source ID SRC-999999/u);
}));

test("rejects duplicate canonical source identities", () => withFixture(async root => {
  const original = await readFile(recordPath(root), "utf8");
  const duplicate = original.replaceAll("SRC-000001", "SRC-000002");
  await writeFile(path.join(root, "knowledge", "source-library", "records", "SRC-000002.yaml"), duplicate);
  const master = path.join(root, "knowledge", "source-library", "D2R_SOURCE_LIBRARY_MASTER.yaml");
  await writeFile(master, `${await readFile(master, "utf8")}  - id: SRC-000002\n    path: records/SRC-000002.yaml\n    classification: PRIMARY_TECHNICAL\n    resource_types: [\"DATASHEET\"]\n    review_state: discovered\n    domain_ids: [\"sensors\"]\n    manufacturer_id: MFR-TURCK\n    protocol_ids: [\"IO_LINK_IODD\"]\n`);
  const result = await validateSourceLibrary({ repositoryRoot: root });
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /duplicate canonical source identity/u);
}));
