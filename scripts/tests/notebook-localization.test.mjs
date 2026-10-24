import assert from "node:assert/strict";
import test from "node:test";
import { cp, mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { packageNotebook } from "../package-notebook.mjs";
import { notebook, getNotebook } from "../../content/notebooks/notebook.js";
import { localizeNotebook } from "../../content/notebooks/localization.js";

test("all eight ES/EN Notes preserve identity, structure and executable code", () => {
  const before = JSON.stringify(notebook);
  const es = getNotebook("es");
  const en = getNotebook("en");
  assert.equal(es.length, 8);
  es.forEach((entry, index) => {
    const original = en[index];
    assert.notEqual(entry.title, original.title);
    assert.notEqual(entry.excerpt, original.excerpt);
    for (const key of ["id", "slug", "coverImage", "readingTime", "related", "author"]) assert.deepEqual(entry[key], original[key]);
    assert.deepEqual(entry.categoryIds, original.categories);
    assert.deepEqual(entry.sections.map(s => [s.id, s.type]), original.sections.map(s => [s.id, s.type]));
    entry.sections.forEach((section, position) => {
      if (section.type === "code" && section.presentation !== "diagram") assert.equal(section.content, original.sections[position].content);
    });
  });
  assert.equal(JSON.stringify(notebook), before);
  assert.deepEqual(getNotebook("it"), en);
  assert.deepEqual(getNotebook("es-ES"), es);
});

test("missing entry, missing section, and executable-code translations fail closed", () => {
  assert.throws(() => localizeNotebook([{ ...notebook[0], id: "future-note" }], "es"), /Missing Spanish/);
  assert.throws(() => localizeNotebook([{ ...notebook[0], sections: [...notebook[0].sections, {id: "new-section", type: "paragraph", content: "New"}] }], "es"), /Missing Spanish/);
  const diagram = notebook[2];
  assert.throws(() => localizeNotebook([{ ...diagram, sections: diagram.sections.map(s => ({...s, presentation: undefined})) }], "es"), /Executable code/);
});

test("generated bilingual Notebook matches canonical publication", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "d2r-notebook-locales-"));
  try {
    await mkdir(path.join(root, "content"));
    await cp(fileURLToPath(new URL("../../content/notebooks", import.meta.url)), path.join(root, "content/notebooks"), { recursive: true });
    await packageNotebook({ repositoryRoot: root });
    const { getNotebook: generated } = await import(pathToFileURL(path.join(root, "Frontend/generated/notebooks/notebook.js")));
    for (const locale of ["es", "en", "it"]) assert.deepEqual(generated(locale), getNotebook(locale));
  } finally { await rm(root, { recursive: true, force: true }); }
});
