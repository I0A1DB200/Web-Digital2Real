import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { resolveExperienceLocalization } from "../../localization/experienceLocalization.js";

const experiencesRoot = new URL("../../../content/experiences/", import.meta.url);
const activeStatuses = new Set(["published", "technical_review"]);
const locales = ["es", "en"];
const maximumCorrectToWrongRatio = 1.35;

async function activeExperiences() {
  const entries = [];
  for (const category of await readdir(experiencesRoot, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const categoryUrl = new URL(`${category.name}/`, experiencesRoot);
    for (const experience of await readdir(categoryUrl, { withFileTypes: true })) {
      if (!experience.isDirectory()) continue;
      const root = new URL(`${experience.name}/`, categoryUrl);
      try {
        const authoring = parseExperienceYaml(await readFile(new URL("experience.yaml", root), "utf8"));
        if (activeStatuses.has(authoring.metadata?.status)) entries.push({ root, authoring });
      } catch (error) {
        if (error.code === "ENOENT") continue;
        throw error;
      }
    }
  }
  return entries;
}

function correctFor(authoring, decisionId) {
  const item = authoring.private?.decision_logic?.find(entry => entry.decision_id === decisionId);
  if (!item) throw new Error(`Decision logic is missing for ${decisionId}.`);
  return typeof item.is_correct === "boolean" ? item.is_correct : item.classification === "strong";
}

test("active experience options keep correctness from being signalled by length", async () => {
  const entries = await activeExperiences();
  let points = 0;
  let correctWasLongest = 0;
  const localeTotals = new Map(locales.map(locale => [locale, { points: 0, longest: 0 }]));
  const incidents = [];

  for (const { root, authoring } of entries) {
    for (const locale of locales) {
      const localized = resolveExperienceLocalization(
        authoring,
        parseExperienceYaml(await readFile(new URL(`locales/${locale}.yaml`, root), "utf8"))
      );
      const decisions = new Map(localized.public.decisions.map(decision => [decision.id, decision]));
      for (const stage of localized.public.stages) {
        if (!stage.decision_ids?.length) continue;
        const options = stage.decision_ids.map(id => decisions.get(id));
        const correct = options.filter(option => correctFor(authoring, option.id));
        const wrong = options.filter(option => !correctFor(authoring, option.id));
        assert.equal(correct.length, 1, `${authoring.metadata.editorial_id} ${locale} ${stage.id}`);
        assert.ok(wrong.length > 0, `${authoring.metadata.editorial_id} ${locale} ${stage.id} has no wrong option`);

        const correctLength = correct[0].action.trim().length;
        const longestWrong = Math.max(...wrong.map(option => option.action.trim().length));
        points += 1;
        const localeTotal = localeTotals.get(locale);
        localeTotal.points += 1;
        if (correctLength > longestWrong) {
          correctWasLongest += 1;
          localeTotal.longest += 1;
        }
        if (correctLength > longestWrong * maximumCorrectToWrongRatio) {
          incidents.push(`${authoring.metadata.editorial_id} ${locale} ${stage.id}: ${correctLength} > ${longestWrong} × ${maximumCorrectToWrongRatio}`);
        }
      }
    }
  }

  assert.ok(entries.length > 0, "No active experiences were found.");
  assert.ok(points > 0, "No decision points were found.");
  assert.deepEqual(incidents, [], incidents.join("\n"));
  assert.ok(correctWasLongest / points < 0.3, `${correctWasLongest}/${points} correct options are still the longest`);
  for (const [locale, total] of localeTotals) {
    assert.ok(total.longest / total.points < 0.3, `${locale}: ${total.longest}/${total.points} correct options are still the longest`);
  }
});
