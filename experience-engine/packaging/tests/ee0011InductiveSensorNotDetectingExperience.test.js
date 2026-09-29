import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { projectRuntimeToWebArtifact } from "../../projection/runtimeToWebArtifactProjector.js";
import { ExperiencePlayer } from "../../player/experiencePlayer.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateNormalizedExperience } from "../../validation/normalizedExperienceValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";
import { validateEnvironmentDefinition } from "../../validation/environmentDefinitionValidator.js";
import { ExperienceV2Contracts } from "../../schemas/experienceV2Contracts.js";
import { packageExperience } from "../experiencePackagingPipeline.js";

const root = new URL("../../../content/experiences/sensors/EE-0011-inductive-sensor-not-detecting/", import.meta.url);
const env = new URL("../../../content/environments/ENV-002-field-instrumentation/", import.meta.url);
const yaml = async (file, base = root) => parseExperienceYaml(await readFile(new URL(file, base), "utf8"));
const correctIds = ["DEC-01-CHECK-HEALTH","DEC-02-INSPECT-SENSOR","DEC-03-MEASURE-GEOMETRY","DEC-04-COMPARE-SECURED","DEC-05-CORRELATE-STATE","DEC-06-INSTALLATION-DISTANCE","DEC-07-CORRECT-GEOMETRY","DEC-08-VERIFY-FULL-CHAIN"];
const hashes = ["476126be467ccc22c8f900812b7702f7942623d173e2b9665e4a6b5c6bb4c38f","acb144f65133dba0511bb9dcce1715b344ee117503e7dfd2367d811e794357ac","e7ef1b3ead364705ff82c1e8fa6e0f16130dd1d368bfa226e7de09f87b4a3437","2effa1caedcbd4d43161e08c5eff3ec75558d7fafb5096bc593c00ac3b8c5d3d","6f565598438b30608c9c9655e708d87642f6454252feb0a51a90242bfcaeabeb","af8d172bd790096ee48da90039927b567269ce81d426cc859b96c3e682701200","acc8ee38186c297e12ecc50196bbcbd97b478958d68d1bde101057bac34f6f57"];
const theoryIds = ["TH-07-INDUCTIVE-SENSING-CONDITIONS","TH-08-RATED-AND-SECURED-DISTANCE","TH-09-POWER-SWITCHING-AND-PROCESS-DATA"];

async function localized(locale) {
  return resolveExperienceLocalization(await yaml("experience.yaml"), await yaml(`locales/${locale}.yaml`));
}

test("EE-0011 validates, normalizes and projects both languages using the unchanged V2 pipeline", async () => {
  for (const locale of ["es", "en"]) {
    const author = await localized(locale);
    const validation = validateExperienceDefinition(author);
    assert.equal(validation.valid, true, JSON.stringify(validation.incidents));
    const normalized = normalizeExperienceDefinition(author);
    assert.equal(normalized.ok, true);
    assert.equal(validateNormalizedExperience(normalized.value).valid, true);
    const projected = projectRuntimeToWebArtifact(normalized.value);
    assert.equal(validateGeneratedWebArtifact(projected).valid, true);
    assert.deepEqual(packageExperience(author), projected);
    assert.equal(projected.metadata.language, locale);
    assert.equal(projected.metadata.title, locale === "en" ? "Inductive Sensor Not Detecting" : "Sensor inductivo sin detección");
    const serialized = JSON.stringify(projected);
    for (const key of ExperienceV2Contracts.webArtifactForbidden) {
      assert.equal(serialized.includes(`"${key}":`), false, key);
    }
    // V2 intentionally exposes tokenized advance/retry transitions; no private truth fields.
    assert.equal(projected.public.interactions.length, 24);
    assert.equal(author.private.decision_logic.every(item => item.score_effect === 0 && item.safety_effect === 0), true);
  }
});

test("EE-0011 has one correct option per decision and a non-cyclic mixed distribution", async () => {
  const author = await yaml("experience.yaml");
  const truth = new Map(author.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  assert.equal(author.public.stages.length, 8);
  assert.deepEqual(author.public.stages.map(stage => {
    const correct = stage.decision_ids.filter(id => truth.get(id));
    assert.equal(correct.length, 1);
    return correct[0];
  }), correctIds);
  assert.deepEqual(author.public.stages.map(stage => "ABC"[stage.decision_ids.findIndex(id => truth.get(id))]), ["B","C","A","B","A","C","C","B"]);
  assert.deepEqual(author.public.stages.map(stage => stage.phase), ["incident","investigation","investigation","investigation","investigation","investigation","solution","solution"]);
  const en = await localized("en");
  assert.deepEqual(en.public.stages.map(stage => stage.decision_ids), author.public.stages.map(stage => stage.decision_ids));
  // Changing legacy classification/score metadata must not change V2 correctness.
  const changed = structuredClone(author);
  changed.private.decision_logic.forEach(item => { item.classification = "weak"; item.score_effect = 0; item.safety_effect = 0; });
  const web = packageExperience(changed);
  const transitions = new Map(web.public.interactions.map(item => [item.action_token, item]));
  web.public.stages.forEach((stage, i) => stage.decisions.forEach(option => {
    assert.equal(transitions.get(option.action_token).outcome, option.id === correctIds[i] ? "advance" : "retry");
  }));
});

test("EE-0011 retries do not progress or unlock evidence; completion requires diagnosis, correction and verification", async () => {
  for (const locale of ["es", "en"]) {
    const author = await localized(locale);
    const artifact = packageExperience(author);
    const transitions = new Map(artifact.public.interactions.map(item => [item.action_token, item]));
    const player = new ExperiencePlayer({ experience: artifact });
    player.start(); player.continue();
    for (let i = 0; i < 8; i++) {
      const before = player.getState();
      assert.equal(before.currentStage.id, author.public.stages[i].id);
      assert.notEqual(before.interaction, "completion");
      for (const option of before.currentStage.decisions.filter(item => item.id !== correctIds[i])) {
        const transition = transitions.get(option.action_token);
        assert.equal(transition.outcome, "retry");
        assert.ok(transition.message);
        assert.equal(Object.hasOwn(transition, "unlocks"), false);
        for (let retry = 0; retry < 12; retry++) {
          const afterRetry = player.selectDecision(option.id);
          assert.equal(afterRetry.currentStage.id, before.currentStage.id);
          assert.deepEqual(afterRetry.unlockedEvidence, before.unlockedEvidence);
          assert.deepEqual(afterRetry.media, before.media);
        }
      }
      const correct = before.currentStage.decisions.find(item => item.id === correctIds[i]);
      assert.equal(transitions.get(correct.action_token).outcome, "advance");
      const next = player.selectDecision(correct.id);
      assert.deepEqual(transitions.get(correct.action_token).unlocks, i < 7 ? [author.public.evidence[i + 1].id] : []);
      if (i < 7) assert.equal(next.currentStage.id, author.public.stages[i + 1].id);
      else assert.equal(next.interaction, "completion");
    }
  }
});

test("EE-0011 preserves staged evidence and never claims Sn is an exact threshold", async () => {
  const es = await localized("es");
  const en = await localized("en");
  for (const author of [es, en]) {
    const initial = JSON.stringify([author.public.scenario, author.public.stages.slice(0, 3), author.public.evidence.slice(0, 3)]);
    assert.doesNotMatch(initial, /7\.8|4\.86|Sn = 6/);
    assert.deepEqual(author.public.stages.map(stage => stage.media_ids), [
      ["ART-002"], ["ART-003"], ["ART-004"], ["ART-005"], ["ART-006"], ["ART-006"], ["ART-006"], ["ART-007"]
    ]);
    assert.equal(author.public.visual.cover_asset_id, "ART-001");
    assert.match(author.public.evidence[3].content, /7\.8.*Sn = 6.*4\.86.*0\.81/);
    assert.match(author.public.evidence[4].content, /Active switchpoint = 0/);
    assert.match(author.public.evidence[7].content, /Active switchpoint = 1.*PartInPosition = 1/);
    assert.match(author.public.evidence[7].content, /6 mm.*4\.86 mm/);
    author.public.evidence.forEach((item, i) => assert.deepEqual(item.revealed_by, i ? [correctIds[i - 1]] : []));
    for (const entry of author.private.decision_logic.filter(item => !item.is_correct)) {
      assert.deepEqual(entry.evidence_revealed, []);
      assert.ok(entry.retry_feedback);
    }
  }
  assert.match(en.public.evidence[3].content, /not an exact digital threshold/);
  assert.match(en.private.fault_model.root_cause, /7\.8.*4\.86/);
});

test("EE-0011 keeps seven frozen PNGs byte-identical to the approved ZIP", async () => {
  const names = (await readdir(new URL("assets/", root))).sort();
  assert.deepEqual(names, ["01.png","02.png","03.png","04.png","05.png","06.png","07.png"]);
  for (const [i, name] of names.entries()) {
    const bytes = await readFile(new URL(`assets/${name}`, root));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), hashes[i]);
    assert.equal(bytes.readUInt32BE(16), 1672);
    assert.equal(bytes.readUInt32BE(20), 941);
  }
});

test("ENV-002 registers EE-0011 once and adds reusable Theory with matching ES/EN IDs", async () => {
  const environment = await yaml("environment.yaml", env);
  const theory = await yaml("theory.yaml", env);
  const english = await yaml("locales/theory.en.yaml", env);
  assert.deepEqual(environment.hotspots, [{ experience_editorial_id: "EE-0011", x: 75, y: 61 }]);
  const validation = validateEnvironmentDefinition(environment, { experienceEditorialIds: ["EE-0011"], theory, theoryLocales: { en: english } });
  assert.equal(validation.valid, true, JSON.stringify(validation.incidents));
  assert.equal(theory.sections.length, 9);
  assert.deepEqual(theory.sections.map(item => item.id), english.sections.map(item => item.id));
  assert.deepEqual(theory.sections.slice(-3).map(item => item.id), theoryIds);
  for (const document of [theory, english]) {
    assert.doesNotMatch(JSON.stringify(document.sections.slice(-3)), /EE-0011|7\.8|Station 1/);
  }
});
