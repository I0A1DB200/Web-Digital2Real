import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { ExperiencePlayer } from "../../player/experiencePlayer.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";
import { validateNormalizedExperience } from "../../validation/normalizedExperienceValidator.js";
import { packageExperience } from "../experiencePackagingPipeline.js";

const directory = new URL("../../../content/experiences/communications/EE-0006-profinet-line-topology-link-failure/", import.meta.url);
const sourceAssets = new URL("file:///C:/Users/asanc/Downloads/EE-0006-assets/EE-0006-assets/EE-0006-profinet-line-topology-link-failure/assets/");
const readYaml = async relative => parseExperienceYaml(await readFile(new URL(relative, directory), "utf8"));
const digest = value => createHash("sha256").update(value).digest("hex");

async function artifact(locale = "es") {
  const authoring = await readYaml("experience.yaml");
  return packageExperience(resolveExperienceLocalization(authoring, await readYaml(`locales/${locale}.yaml`)));
}

function diagnosticState(state) {
  return Object.fromEntries(["state", "completionStatus", "progress", "decisionHistory", "attemptsByDecision", "resolvedDecisions", "unlockedEvidence", "evaluationResult"].map(key => [key, state[key]]));
}

function run(webArtifact, retryStages = [], retryAll = false) {
  const player = new ExperiencePlayer({ experience: webArtifact });
  const authority = new Map(webArtifact.public.interactions.map(item => [item.action_token, item]));
  const progression = [], results = [];
  player.start();
  assert.equal(player.getState().visual.cover_asset_id, "ART-001");
  player.continue();
  for (let index = 0; index < 6; index++) {
    const before = player.getState();
    assert.equal(before.interaction, "stage");
    assert.equal(before.unlockedEvidence.includes("EVID-08-RECOVERY"), false);
    assert.equal(before.media.some(item => item.id === "ART-007"), false);
    progression.push({ id: before.currentStage.id, media: before.media.map(item => item.id) });
    const correct = before.currentStage.decisions.find(item => authority.get(item.action_token).outcome === "advance");
    const wrong = before.currentStage.decisions.filter(item => authority.get(item.action_token).outcome === "retry");
    const retries = retryAll ? wrong : retryStages.includes(before.currentStage.id) ? wrong.slice(0, 1) : [];
    for (const [attempt, option] of retries.entries()) {
      const after = player.selectDecision(option.id);
      assert.equal(after.currentStage.id, before.currentStage.id);
      for (const key of ["progress", "unlockedEvidence", "resolvedDecisions", "media", "completionStatus", "evaluationResult"])
        assert.deepEqual(after[key], before[key]);
      assert.equal(after.result, null);
      assert.equal(after.attemptsByDecision[before.currentStage.id], attempt + 1);
      assert.equal(after.decisionHistory.length, before.decisionHistory.length + attempt + 1);
      assert.match(after.feedback.message, /\S/);
    }
    const after = player.selectDecision(correct.id);
    assert.equal(after.attemptsByDecision[before.currentStage.id], retries.length + 1);
    assert.deepEqual(after.unlockedEvidence, [...before.unlockedEvidence, ...authority.get(correct.action_token).unlocks]);
    assert.equal(after.completionStatus, index === 5 ? "completed" : "active");
    if (index === 4) {
      assert.equal(after.interaction, "stage");
      assert.equal(after.currentStage.id, "STAGE-06-VERIFY-RECOVERY");
      assert.equal(after.result, null);
      assert.deepEqual(after.media, []);
    } else {
      assert.equal(after.interaction, "result");
      const acquired = authority.get(correct.action_token).unlocks.map(id => webArtifact.public.evidence.find(e => e.id === id));
      assert.deepEqual(after.result.evidence.map(e => ({ id: e.id, media: e.media.map(m => m.id) })), acquired.map(e => ({ id: e.id, media: e.media_ids ?? [] })));
      results.push(index + 1);
      assert.deepEqual(diagnosticState(player.continue()), diagnosticState(after));
    }
  }
  assert.deepEqual(results, [1, 2, 3, 4, 6]);
  assert.equal(player.getState().interaction, "completion");
  assert.deepEqual(player.getState().media.map(item => item.id), ["ART-007"]);
  return { state: player.getState(), progression };
}

test("EE-0006 validates as V2 with canonical topology truth and mixed correct positions", async () => {
  const authoring = await readYaml("experience.yaml");
  const validation = validateExperienceDefinition(authoring);
  assert.equal(validation.valid, true);
  assert.equal(validation.profile, "authoring_v2");
  assert.equal(authoring.contract_version, "2.0.0");
  assert.equal(authoring.metadata.editorial_id, "EE-0006");
  assert.equal(authoring.public.stages.length, 6);
  assert.equal(authoring.private.decision_logic.filter(item => item.is_correct).length, 6);
  const truth = new Map(authoring.private.decision_logic.map(item => [item.decision_id, item.is_correct]));
  const positions = authoring.public.stages.map(stage => "ABCD"[stage.decision_ids.findIndex(id => truth.get(id))]);
  assert.deepEqual(positions, ["C", "B", "D", "B", "A", "C"]);
  assert.match(authoring.private.fault_model.root_cause, /A2 Turck.*A3 Murr/i);
  assert.match(authoring.private.fault_model.root_cause, /daño físico/i);
  assert.match(JSON.stringify(authoring.public.evidence), /String B.*disponible/i);
});

test("EE-0006 localizes completely and preserves seven frozen assets", async t => {
  const files = (await readdir(new URL("assets/", directory))).filter(name => name.endsWith(".png")).sort();
  assert.deepEqual(files, ["01.png", "02.png", "03.png", "04.png", "05.png", "06.png", "07.png"]);
  for (const name of files) {
    try {
      assert.equal(digest(await readFile(new URL(`assets/${name}`, directory))), digest(await readFile(new URL(name, sourceAssets))), name);
    } catch (error) {
      if (error.code === "ENOENT") t.diagnostic(`Approved external source unavailable for ${name}; canonical asset still validated.`);
      else throw error;
    }
  }
  const spanish = await artifact("es");
  const english = await artifact("en");
  assert.deepEqual(spanish.public.stages.map(item => item.decisions.map(decision => decision.id)), english.public.stages.map(item => item.decisions.map(decision => decision.id)));
  assert.equal(english.metadata.title, "PROFINET Devices Unavailable in One Conveyor Area");
  assert.doesNotMatch(english.public.stages.map(item => item.situation).join(" "), /alcanzable|disponible|daño físico|¿/i);
});

test("EE-0006 projection hides private truth and preserves explicit retry/advance boundaries", async () => {
  const authoring = await readYaml("experience.yaml");
  const normalized = normalizeExperienceDefinition(authoring);
  const webArtifact = await artifact("en");
  assert.equal(normalized.ok, true);
  assert.equal(validateNormalizedExperience(normalized.value).valid, true);
  assert.equal(validateGeneratedWebArtifact(webArtifact).valid, true);
  const serialized = JSON.stringify(webArtifact);
  for (const forbidden of ["private", "is_correct", "decision_logic", "rationale", "root_cause", "fault_model", "diagnostic_model"])
    assert.equal(serialized.includes(`"${forbidden}"`), false, forbidden);

  const stages = webArtifact.public.stages.map(item => item.id);
  const pass = run(webArtifact);
  const guided = run(webArtifact, stages.slice(0, 2)).state;
  const retry = run(webArtifact, stages.slice(0, 4)).state;
  assert.deepEqual(pass.progression.map(item => item.media), [[], ["ART-002"], ["ART-003"], ["ART-004"], ["ART-006"], []]);
  assert.equal(pass.progression.slice(0, 4).flatMap(item => item.media).includes("ART-006"), false);
  assert.equal(pass.state.evaluationResult.outcome, "PASS");
  assert.equal(guided.evaluationResult.outcome, "PASS_WITH_GUIDANCE");
  assert.equal(retry.evaluationResult.outcome, "RETRY_RECOMMENDED");
});

test("EE-0006 keeps TIA, PRONETA, switch and IO-Link roles technically distinct", async () => {
  const authoring = await readYaml("experience.yaml");
  const text = JSON.stringify(authoring.public);
  assert.match(text, /TIA Portal/);
  assert.match(text, /PRONETA Graphical View/);
  assert.match(text, /switch físico no se presenta como IO Device configurado/);
  assert.match(text, /IO-Link/);
  assert.match(JSON.stringify(authoring.private.decision_logic), /PROFINET\/Ethernet/);
  assert.doesNotMatch(authoring.private.fault_model.root_cause, /IO-Link/i);
});

test("EE-0006 exact acquisition maps, hidden topology visual and all retries in ES/EN", async () => {
 const source = await readYaml("experience.yaml");
 assert.equal(source.public.decisions.length, 20);
 assert.equal(source.private.decision_logic.filter(d => !d.is_correct).length, 14);
 assert.equal(source.public.evidence.length, 8);
 assert.deepEqual(source.public.evidence.slice(0, 2).map(e => e.revealed_by), [[], []]);
 const expectedAuthority = [[], [], ["DEC-01-COMPARE-NETWORK-AREAS"], ["DEC-02-USE-TIA-DIAGNOSTICS"], ["DEC-03-FIND-GOOD-BAD-BOUNDARY"], ["DEC-04-INSPECT-A2-A3-LINK"], ["DEC-04-INSPECT-A2-A3-LINK"], ["DEC-06-VERIFY-FULL-CHAIN"]];
 assert.deepEqual(source.public.evidence.map(e => e.revealed_by), expectedAuthority);
 for (const e of source.public.evidence) assert.deepEqual(e.revealed_by, source.private.decision_logic.filter(d => d.evidence_revealed.includes(e.id)).map(d => d.decision_id));
 assert.deepEqual(source.public.stages.at(-1).evidence_ids, []);
 const media = [[], [], ["ART-002"], ["ART-003"], ["ART-004"], [], ["ART-006"], ["ART-007"]];
 assert.deepEqual(source.public.evidence.map(e => e.media_ids ?? []), media);
 const structures = [];
 for (const locale of ["es", "en"]) {
  const web = await artifact(locale);
  assert.deepEqual(web.public.evidence.map(e => [e.id, e.media_ids ?? []]), source.public.evidence.slice(2).map(e => [e.id, e.media_ids ?? []]));
  assert.ok(web.public.visual.assets.some(a => a.id === "ART-005"));
  assert.equal(web.public.visual.assets.length, 7);
  const refs = [...web.public.stages.flatMap(s => s.media_ids ?? []), ...web.public.evidence.flatMap(e => e.media_ids ?? []), ...web.public.completion.media_ids];
  assert.ok(!refs.includes("ART-005"));
  assert.doesNotMatch(web.metadata.title + web.metadata.summary + web.public.scenario.learner_role, /daño|damage|fallo de enlace|link failure|A2.*A3/i);
  assert.match(web.public.scenario.operational_state, /A1.*A2.*A3.*A4.*String B/);
  assert.match(web.public.stages.at(-1).situation, locale === "es" ? /pendientes de verificación/ : /still require verification/);
  const correct = web.public.stages.map(stage => stage.decisions.find(d => web.public.interactions.find(i => i.action_token === d.action_token).outcome === "advance"));
  assert.match(correct[0].action, locale === "es" ? /observar la disposición/ : /observe the installation layout/);
  assert.match(correct[2].action, locale === "es" ? /observar.*alimentación y enlace/ : /observe.*power and link/);
  assert.match(correct[3].action, /PRONETA/);
  for (const d of correct) assert.match(d.action, locale === "es" ? /segura|mantenimiento/ : /safe|maintenance/);
  const { state, progression } = run(web, [], true);
  assert.deepEqual(progression.map(s => s.media), [[], ["ART-002"], ["ART-003"], ["ART-004"], ["ART-006"], []]);
  assert.equal(state.evaluationResult.totalDecisions, 6);
  assert.equal(state.evaluationResult.additionalAttempts, 14);
  assert.equal(state.decisionHistory.length, 20);
  structures.push({ interactions: web.public.interactions.map(({message, ...i}) => i), stages: web.public.stages.map(s => [s.id, s.decisions.map(d => [d.id, d.action_token]), s.media_ids]) });
 }
 assert.deepEqual(structures[0], structures[1]);
});
