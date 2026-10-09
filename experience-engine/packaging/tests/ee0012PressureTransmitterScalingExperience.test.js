import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { projectRuntimeToWebArtifact } from "../../projection/runtimeToWebArtifactProjector.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";
import { validateNormalizedExperience } from "../../validation/normalizedExperienceValidator.js";

const root = new URL("../../../content/experiences/instrumentation/EE-0012-pressure-transmitter-scaling-mismatch/", import.meta.url);
const yaml = async file => parseExperienceYaml(await readFile(new URL(file, root), "utf8"));

test("EE-0012 scaling and intervention references resolve to distinct PNG assets", async () => {
  const experience = await yaml("experience.yaml");
  const images = [];
  for (const id of ["ART-004", "ART-006"]) {
    const asset = experience.public.visual.assets.find(item => item.id === id);
    const image = await readFile(new URL(asset.src.replace("assets/EXP-PRESSURE-SCALING-012/", "assets/"), root));
    assert.deepEqual(image.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    assert.ok(image.readUInt32BE(16) > 0);
    assert.ok(image.readUInt32BE(20) > 0);
    images.push(image);
  }
  assert.equal(images[0].equals(images[1]), false);
});

test("EE-0012 validates and projects ES/EN through the existing V2 pipeline", async () => {
  for (const locale of ["es", "en"]) {
    const authored = resolveExperienceLocalization(await yaml("experience.yaml"), await yaml(`locales/${locale}.yaml`));
    assert.equal(validateExperienceDefinition(authored).valid, true);
    const normalized = normalizeExperienceDefinition(authored);
    assert.equal(normalized.ok, true);
    assert.equal(validateNormalizedExperience(normalized.value).valid, true);
    const projected = projectRuntimeToWebArtifact(normalized.value);
    assert.equal(validateGeneratedWebArtifact(projected).valid, true);
    assert.equal(projected.metadata.language, locale);
    assert.equal(projected.public.stages.length, 5);
  }
});

test("EE-0012 preserves diagnosis, intervention and independent verification", async () => {
  const experience = await yaml("experience.yaml");
  const correct = experience.private.decision_logic.filter(item => item.is_correct);
  assert.deepEqual(correct.map(item => item.decision_id), [
    "DEC-01-COMPARE", "DEC-02-MEASURE", "DEC-03-INSPECT", "DEC-04-CORRECT", "DEC-05-VERIFY"
  ]);
  assert.equal(experience.public.evidence[4].content.includes("todavía no está verificada"), true);
  assert.deepEqual(experience.public.evidence[5].revealed_by, ["DEC-05-VERIFY"]);
  assert.deepEqual(experience.public.completion.media_ids, ["ART-005"]);
});

test("EE-0012 media disclosure follows cover, stage, result and completion semantics", async () => {
  const experience = await yaml("experience.yaml");
  assert.equal(experience.public.visual.cover_asset_id, "ART-001");
  assert.deepEqual(experience.public.stages.map(stage => stage.media_ids), [
    ["ART-002"], [], [], ["ART-004"], []
  ]);
  assert.deepEqual(experience.public.evidence.map(item => item.media_ids), [
    [], [], ["ART-003"], ["ART-004"], ["ART-006"], ["ART-005"]
  ]);
  assert.equal(JSON.stringify(experience).includes("raw count"), false);
  assert.deepEqual(experience.public.visual.assets.map(asset => asset.src), [
    "assets/EXP-PRESSURE-SCALING-012/01-cover.png",
    "assets/EXP-PRESSURE-SCALING-012/02-incident.png",
    "assets/EXP-PRESSURE-SCALING-012/03-loop-measurement.png",
    "assets/EXP-PRESSURE-SCALING-012/04-scaling.png",
    "assets/EXP-PRESSURE-SCALING-012/05-verification.png",
    "assets/EXP-PRESSURE-SCALING-012/06-intervention.png"
  ]);
  assert.equal(experience.public.visual.assets.some(asset => asset.src.endsWith(".svg")), false);
  assert.match(experience.public.evidence[3].content, /0–5 bar.*0–10 bar/u);
  assert.deepEqual(experience.public.evidence[4].media_ids, ["ART-006"]);
});
