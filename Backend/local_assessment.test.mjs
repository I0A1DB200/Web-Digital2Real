import assert from "node:assert/strict";
import test from "node:test";
import { evidenceMediaArtifact } from "../experience-engine/player/tests/fixtures/evidenceMediaArtifact.js";
import { replayAssessment } from "./local_assessment.mjs";

test("reuses the canonical Player and excludes practice or incomplete assessment", () => {
  const practice = evidenceMediaArtifact();
  assert.throws(() => replayAssessment(practice, []), /trusted assessment/);
  const assessment = { ...practice, identity: { ...practice.identity, class: "assessment" } };
  const commands = [
    "start", "continue", { decisionId: "DEC-1-YES" }, "continue",
    { decisionId: "DEC-2-YES" }, { decisionId: "DEC-3-YES" }
  ];
  assert.equal(replayAssessment(assessment, commands.slice(0, -1)), null);
  const result = replayAssessment(assessment, commands);
  assert.equal(result.experience, assessment.identity.id);
  assert.equal(result.contentVersion, assessment.identity.content_version);
  assert.equal(result.evaluation.mastered, true);
  assert.throws(() => replayAssessment(assessment, [{ passed: true }]), /invalid assessment command/i);
});
