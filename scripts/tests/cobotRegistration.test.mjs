import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { parseExperienceYaml } from '../../experience-engine/adapter/yamlExperienceAdapter.js';
import { resolveExperienceLocalization } from '../../experience-engine/localization/experienceLocalization.js';
import { validateExperienceDefinition } from '../../experience-engine/validation/experienceDefinitionValidator.js';
import { packageExperience } from '../../experience-engine/packaging/experiencePackagingPipeline.js';
const root = new URL('../../content/experiences/robotics/EE-0041-cobot-palletizing/', import.meta.url);
const load = async file => parseExperienceYaml(await readFile(new URL(file, root), 'utf8'));

test('Cobot bilingual review preserves identity, valid V2 content and evidence boundaries', async () => {
  const model = await load('experience.yaml');
  assert.equal(model.metadata.status, 'technical_review');
  assert.equal(model.metadata.editorial_id, 'EE-0041');
  for (const lang of ['es', 'en']) {
    const localized = resolveExperienceLocalization(model, await load(`locales/${lang}.yaml`));
    const report = validateExperienceDefinition(localized);
    assert.equal(report.compatible, true, JSON.stringify(report.errors));
    assert.equal(packageExperience(localized).identity.id, 'EXP-UR-COBOT-001');
    assert.equal(localized.public.stages.length, 3);
    assert.equal(localized.public.decisions.length, 6);
    assert.equal(localized.private.decision_logic.filter(x => !x.is_correct).length, 3);
    assert.equal(localized.public.visual.cover_asset_id, undefined);
  }
  const card = model.public.catalog_card;
  const image = await readFile(new URL(`../../Frontend/${card.image}`, import.meta.url));
  assert.equal(createHash('sha256').update(image).digest('hex'), '37f3226f4904fd7a819893832338f0090c9470e805192b96a9feb69da737528e');
  assert.ok(card.alt.es);
  assert.ok(card.alt.en);
});
