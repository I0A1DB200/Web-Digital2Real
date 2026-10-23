import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { ExperiencePlayer } from "../../player/experiencePlayer.js";
import { packageExperience } from "../experiencePackagingPipeline.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";

const root = new URL("../../../content/experiences/instrumentation/EE-0015-sick-distance-window-misclassification/", import.meta.url);
const yaml = async file => parseExperienceYaml(await readFile(new URL(file, root), "utf8"));
const correctIds = [
  "DEC-01-TRACE-ACCEPTANCE", "DEC-02-TRACE-REJECTION", "DEC-03-SWITCHING-WINDOW",
  "DEC-04-CORRELATE-Q1", "DEC-05-RESTORE-WINDOW", "DEC-06-VERIFY-RUN"
];
const assetNames = [
  "ART-001-hmi-reject-count.png", "ART-002-pneumatic-diverter-rejection.png",
  "ART-004-sopas-window-fault.png", "ART-005-tia-plc-q1-false.png",
  "ART-006-sopas-window-corrected.png", "ART-007-recovery-hmi-zero.png"
];
const hashes = [
  "c114205013049a5e71981740ec643332b3270b8651d1d22a6ef2195008a96c97",
  "80a1fe8550f81a96affec077c7072ed61a22a403967ed858aa248edbae5729f9",
  "0f4843e257d9f37e2844815474a02269ebd639000c313f130d76180de783efc7",
  "cc7cb00bf17afab6056f2aada204cc0769bd5115482907f9ec50da9ac893b147",
  "d5f3a3ec81023576495aba26c0cabc65089304bfa9e285ef746387885b0bb60e",
  "d9d874a25f66ceb84e5346ae6d6f83fd6ccd94c38006869883be9aeae24bf47b"
];

async function localized(locale) {
  return resolveExperienceLocalization(await yaml("experience.yaml"), await yaml(`locales/${locale}.yaml`));
}

test("EE-0015 validates and packages equivalent ES and EN artifacts", async () => {
  const artifacts = [];
  for (const locale of ["es", "en"]) {
    const authored = await localized(locale);
    const validation = validateExperienceDefinition(authored);
    assert.equal(validation.valid, true, JSON.stringify(validation.incidents));
    artifacts.push(packageExperience(authored));
  }
  assert.deepEqual(artifacts[0].public.stages.map(stage => stage.id), artifacts[1].public.stages.map(stage => stage.id));
  assert.equal(artifacts[1].metadata.title, "Rejects caused by an incorrect distance window");
  assert.equal(artifacts[0].public.stages.length, 6);
  assert.equal(artifacts[0].public.stages.reduce((total, stage) => total + stage.decisions.length, 0), 24);
  assert.equal(artifacts[0].public.interactions.length, 24);
});

test("EE-0015 has six staged decisions, one correct option each and reciprocal evidence authority", async () => {
  const authored = await yaml("experience.yaml");
  const truth = authored.private.decision_logic.filter(item => item.is_correct);
  assert.deepEqual(truth.map(item => item.decision_id), correctIds);
  assert.equal(authored.private.decision_logic.filter(item => !item.is_correct).length, 18);
  assert.deepEqual(authored.public.stages.map(stage => stage.decision_ids.findIndex(id => truth.some(item => item.decision_id === id))), [1, 2, 3, 1, 2, 3]);
  for (const evidence of authored.public.evidence) {
    assert.deepEqual(evidence.revealed_by, authored.private.decision_logic
      .filter(item => item.evidence_revealed.includes(evidence.id)).map(item => item.decision_id));
  }
  assert.deepEqual(authored.public.stages.map(stage => stage.media_ids), [
    ["ART-001"], ["ART-002"], ["ART-004"], ["ART-005"], [], ["ART-006"]
  ]);
  assert.deepEqual(authored.public.evidence.map(item => item.media_ids ?? []), [
    [], [], ["ART-004"], ["ART-005"], ["ART-006"], ["ART-007"]
  ]);
  assert.doesNotMatch(JSON.stringify(authored.public.stages.slice(0, 2)), /280|320|180|250|Q1 OFF|switching window/iu);
  assert.match(authored.public.stages[2].situation, /214.*280.*320.*Q1 OFF/u);
  assert.doesNotMatch(JSON.stringify(authored.public), /ART-003/u);
});

test("EE-0015 preserves the six approved PNGs byte-for-byte", async () => {
  const names = (await readdir(new URL("assets/", root))).sort();
  assert.deepEqual(names, [...assetNames].sort());
  for (const [index, name] of assetNames.entries()) {
    const bytes = await readFile(new URL(`assets/${name}`, root));
    const digest = createHash("sha256").update(bytes).digest("hex");
    assert.equal(digest, hashes[index]);
    assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    assert.deepEqual(await readFile(new URL(`media/${name}`, root)), bytes);
  }
});

for (const locale of ["es", "en"]) for (const retryAll of [false, true]) {
  test(`EE-0015 ${locale} ${retryAll ? "all wrong options" : "clean path"} preserves retries and verification`, async () => {
    const artifact = packageExperience(await localized(locale));
    const authority = new Map(artifact.public.interactions.map(item => [item.action_token, item]));
    const player = new ExperiencePlayer({ experience: artifact });
    player.start();
    player.continue();
    for (let index = 0; index < 6; index += 1) {
      const before = player.getState();
      assert.equal(before.interaction, "stage");
      assert.equal(before.completionStatus, "active");
      assert.equal(before.unlockedEvidence.includes("EVID-06-RECOVERY"), false);
      const correct = before.currentStage.decisions.find(item => authority.get(item.action_token).outcome === "advance");
      const wrong = before.currentStage.decisions.filter(item => authority.get(item.action_token).outcome === "retry");
      if (retryAll) for (const option of wrong) {
        const retry = player.selectDecision(option.id);
        assert.equal(retry.currentStage.id, before.currentStage.id);
        assert.deepEqual(retry.unlockedEvidence, before.unlockedEvidence);
        assert.equal(retry.result, null);
        assert.match(retry.feedback.message, /\S/u);
      }
      const after = player.selectDecision(correct.id);
      assert.equal(after.completionStatus, index === 5 ? "completed" : "active");
      const expectedEvidence = [null, "EVID-03-SOPAS", "EVID-04-PLC", null, "EVID-05-CRITERIA", "EVID-06-RECOVERY"][index];
      if (expectedEvidence) {
        assert.equal(after.interaction, "result");
        assert.deepEqual(after.result.evidence.map(item => item.id), [expectedEvidence]);
      } else {
        assert.equal(after.interaction, "stage");
        assert.equal(after.currentStage.id, `STAGE-0${index + 2}-${["REJECTION", "SWITCHING-WINDOW", "PLC-CORRELATION", "CORRECTION", "VERIFICATION"][index]}`);
      }
      if (after.interaction === "result") player.continue();
    }
    const completed = player.getState();
    assert.equal(completed.interaction, "completion");
    assert.deepEqual(completed.media.map(item => item.id), ["ART-007"]);
    assert.equal(completed.decisionHistory.length, retryAll ? 24 : 6);
  });
}
