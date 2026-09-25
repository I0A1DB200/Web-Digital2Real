import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { ExperiencePlayer } from "../../player/experiencePlayer.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { packageExperience } from "../experiencePackagingPipeline.js";

const experiences = [
  {
    id: "EE-0001",
    path: "../../../content/experiences/sensors/EE-0001-sensor-on-plc-input-off/",
    correctIds: ["DEC-01-TRACE", "DEC-02-MAP", "DEC-03-COMPARE", "DEC-04-LOCALIZE", "DEC-05-OPEN", "DEC-06-REPAIR", "DEC-07-VERIFY-CHAIN"]
  },
  {
    id: "EE-0002",
    path: "../../../content/experiences/sensors/EE-0002-intermittent-photoelectric-sensor-detection/",
    correctIds: ["DEC-01-OBSERVE-CYCLES", "DEC-02-COMPARE-STATES", "DEC-03-MOVE-UPSTREAM", "DEC-04-CORRELATE-POSITION", "DEC-05-INSPECT-ALIGNMENT", "DEC-06-REALIGN-SECURE", "DEC-07-VALIDATE-SAMPLE"]
  },
  {
    id: "EE-0003",
    path: "../../../content/experiences/drives/EE-0003-vfd-command-authority-mismatch/",
    correctIds: ["DEC-01-INSPECT-DRIVE", "DEC-02-TRACE-PLC", "DEC-03-CHECK-AUTHORITY", "DEC-04-VERIFY-ARCHITECTURE", "DEC-05-VERIFY-ONLINE", "DEC-06-RESTORE-VERIFY"]
  },
  {
    id: "EE-0004",
    path: "../../../content/experiences/pneumatics/EE-0004-pneumatic-cylinder-extension-timeout/",
    correctIds: ["DEC-01-TRACE-ACTUATION", "DEC-02-CONTINUE-DOWNSTREAM", "DEC-03-INVESTIGATE-LOCAL-FLOW", "DEC-04-INSPECT-FLOW-LOAD", "DEC-05-RESTORE-SETTING", "DEC-06-REPEAT-CYCLES"]
  },
  {
    id: "EE-0005",
    path: "../../../content/experiences/safety/EE-0005-safety-gate-channel-discrepancy/",
    correctIds: ["DEC-01-IDENTIFY-SAFETY-FUNCTION", "DEC-02-INSPECT-GUARD-FINPUTS", "DEC-03-OPEN-ONLINE-DIAGNOSTICS", "DEC-04-INSPECT-PHYSICAL-RELATION", "DEC-05-RESTORE-ALIGNMENT", "DEC-06-FUNCTIONAL-TEST"]
  },
  {
    id: "EE-0006",
    path: "../../../content/experiences/communications/EE-0006-profinet-line-topology-link-failure/",
    correctIds: ["DEC-01-COMPARE-NETWORK-AREAS", "DEC-02-USE-TIA-DIAGNOSTICS", "DEC-03-FIND-GOOD-BAD-BOUNDARY", "DEC-04-INSPECT-A2-A3-LINK", "DEC-05-RESTORE-SEGMENT", "DEC-06-VERIFY-FULL-CHAIN"]
  },
  {
    id: "EE-0007",
    path: "../../../content/experiences/siemens/EE-0007-sequence-stuck-waiting-for-condition/",
    correctIds: ["DEC-01-INSPECT-ACTIVE-STEP", "DEC-02-INSPECT-T40-CONDITION", "DEC-03-VERIFY-BOX-SENSOR", "DEC-04-MONITOR-I05-TAG", "DEC-05-COMPARE-T40-REFERENCE", "DEC-06-WRONG-VARIABLE-REFERENCE", "DEC-07-CORRECT-T40-VERIFY"]
  },
  {
    id: "EE-0008",
    path: "../../../content/experiences/communications/EE-0008-io-link-device-offline/",
    correctIds: ["DEC-01-ESTABLISH-SCOPE", "DEC-02-VERIFY-PLC-PN-MASTER", "DEC-03-COMPARE-PORTS", "DEC-04-DOWNSTREAM-C3", "DEC-05-INSPECT-M12", "DEC-06-RESTORE-COMPLETE-CHAIN"]
  },
  {
    id: "EE-0009",
    path: "../../../content/experiences/hmi/EE-0009-hmi-incorrect-machine-state/",
    correctIds: ["DEC-01-VERIFY-BOX-SENSOR", "DEC-02-MONITOR-PLC", "DEC-03-CHECK-HMI-CONNECTION", "DEC-04-INSPECT-TAG", "DEC-05-COMPARE-PLC-HMI", "DEC-06-MAP-AND-VERIFY"]
  }
];

async function load(entry) {
  const root = new URL(entry.path, import.meta.url);
  const yaml = async relative => parseExperienceYaml(await readFile(new URL(relative, root), "utf8"));
  const authoring = await yaml("experience.yaml");
  return { authoring, yaml };
}

test("canonical Experiences keep one correct action independent of presentation position", async () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const aggregate = [];
  for (const entry of experiences) {
    const { authoring } = await load(entry);
    assert.equal(validateExperienceDefinition(authoring).valid, true, entry.id);
    const truth = new Map(authoring.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
    const actualIds = [];
    const actualPositions = [];
    for (const stage of authoring.public.stages) {
      const correct = stage.decision_ids.filter(id => truth.get(id) === true);
      assert.equal(correct.length, 1, `${entry.id} ${stage.id}`);
      actualIds.push(correct[0]);
      actualPositions.push(letters[stage.decision_ids.indexOf(correct[0])]);
    }
    assert.deepEqual(actualIds, entry.correctIds, `${entry.id} engineering actions`);
    assert.equal(new Set(actualPositions).size > 1, true, `${entry.id} must not encode correctness in one position`);
    aggregate.push(...actualPositions);
  }
  assert.equal(aggregate.some(position => position !== "A"), true);
  assert.equal(new Set(aggregate).size >= 3, true);
});

test("Spanish and English preserve identical option identity and ordering", async () => {
  for (const entry of experiences) {
    const { authoring, yaml } = await load(entry);
    const spanish = resolveExperienceLocalization(authoring, await yaml("locales/es.yaml"));
    const english = resolveExperienceLocalization(authoring, await yaml("locales/en.yaml"));
    assert.deepEqual(
      spanish.public.stages.map(stage => stage.decision_ids),
      english.public.stages.map(stage => stage.decision_ids),
      entry.id
    );
  }
});

test("projected advance and retry behavior follows identity while correctness stays private", async () => {
  for (const entry of experiences) {
    const { authoring } = await load(entry);
    const artifact = packageExperience(authoring);
    const serialized = JSON.stringify(artifact);
    for (const forbidden of ["private", "is_correct", "decision_logic", "rationale", "root_cause"])
      assert.equal(serialized.includes(`"${forbidden}"`), false, `${entry.id} ${forbidden}`);

    const player = new ExperiencePlayer({ experience: artifact });
    const authority = new Map(artifact.public.interactions.map(item => [item.action_token, item]));
    player.start();
    player.continue();
    let stageNumber = 0;
    while (player.getState().interaction !== "completion") {
      const before = player.getState();
      const expectedId = entry.correctIds[stageNumber];
      const correct = before.currentStage.decisions.find(item => item.id === expectedId);
      const retry = before.currentStage.decisions.find(item => authority.get(item.action_token).outcome === "retry");
      assert.equal(authority.get(correct.action_token).outcome, "advance", `${entry.id} ${expectedId}`);
      assert.equal(player.selectDecision(retry.id).currentStage.id, before.currentStage.id, `${entry.id} retry`);
      player.selectDecision(correct.id);
      stageNumber += 1;
    }
    assert.equal(stageNumber, entry.correctIds.length, entry.id);
  }
});
