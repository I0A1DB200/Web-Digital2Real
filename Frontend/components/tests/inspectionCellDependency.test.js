import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("inspection cell uses the audited Three.js module and preserves its license", async () => {
  const root = new URL("../../simulators/d2r-inspection-cell/", import.meta.url);
  const path = "vendor/three-0.164.1/three.module.min.js";
  const html = await readFile(new URL("index.html", root), "utf8");
  assert.ok(html.includes(`import * as THREE from './${path}'`));
  const bytes = await readFile(new URL(path, root));
  assert.equal(createHash("sha256").update(bytes).digest("hex"),
    "6c2bfdf07626404916f34aef8cf57992926d849526bc6eb4556da96a3ba4e78c");
  assert.match(await readFile(new URL("vendor/three-0.164.1/LICENSE.md", root), "utf8"), /MIT License/);
});
