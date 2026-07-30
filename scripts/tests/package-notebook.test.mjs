import assert from "node:assert/strict";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { packageNotebook } from "../package-notebook.mjs";

const validNotebook = `export const notebook = [
  {
    id: "article-001",
    slug: "deterministic-notebook",
    title: "Deterministic Notebook",
    sections: []
  }
];
`;

async function fixture(source = validNotebook) {
  const root = await mkdtemp(path.join(os.tmpdir(), "d2r-notebook-package-"));
  await mkdir(path.join(root, "content", "notebooks"), { recursive: true });
  await mkdir(path.join(root, "Frontend"), { recursive: true });
  await writeFile(
    path.join(root, "content", "notebooks", "notebook.js"),
    source,
    "utf8"
  );
  return root;
}

test("packages Notebook content deterministically", async t => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));

  const first = await packageNotebook({ repositoryRoot: root });
  const output = path.join(root, "Frontend", "generated", "notebooks", "notebook.js");
  const firstContent = await readFile(output, "utf8");
  const second = await packageNotebook({ repositoryRoot: root });

  assert.deepEqual(first, {
    source: "content/notebooks/notebook.js",
    output: "Frontend/generated/notebooks/notebook.js"
  });
  assert.deepEqual(second, first);
  assert.equal(await readFile(output, "utf8"), firstContent);
  assert.equal(firstContent, validNotebook);
});

test("removes obsolete generated Notebook artifacts", async t => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));

  const obsolete = path.join(
    root,
    "Frontend",
    "generated",
    "notebooks",
    "obsolete.js"
  );
  await mkdir(path.dirname(obsolete), { recursive: true });
  await writeFile(obsolete, "obsolete", "utf8");

  await packageNotebook({ repositoryRoot: root });

  await assert.rejects(() => access(obsolete));
  await access(path.join(
    root,
    "Frontend",
    "generated",
    "notebooks",
    "notebook.js"
  ));
});

test("validation failure preserves the previous generated package", async t => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));

  await packageNotebook({ repositoryRoot: root });
  const target = path.join(root, "Frontend", "generated", "notebooks");
  const sentinel = path.join(target, "preserved.txt");
  await writeFile(sentinel, "preserved", "utf8");
  await writeFile(
    path.join(root, "content", "notebooks", "notebook.js"),
    "export const notebook = {};",
    "utf8"
  );

  await assert.rejects(
    () => packageNotebook({ repositoryRoot: root }),
    /must export a notebook array/u
  );
  assert.equal(await readFile(sentinel, "utf8"), "preserved");
});

test("rejects duplicate Notebook identifiers and slugs", async t => {
  const root = await fixture(`export const notebook = [
    { id: "article-001", slug: "duplicate", title: "One", sections: [] },
    { id: "article-001", slug: "duplicate", title: "Two", sections: [] }
  ];
  `);
  t.after(() => rm(root, { recursive: true, force: true }));

  await assert.rejects(
    () => packageNotebook({ repositoryRoot: root }),
    /Duplicate Notebook identifier/u
  );
});

