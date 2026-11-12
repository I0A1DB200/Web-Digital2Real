import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { parseExperienceYaml } from '../../experience-engine/adapter/yamlExperienceAdapter.js';
import { validateExperienceDefinition } from '../../experience-engine/validation/experienceDefinitionValidator.js';
import { validateEnvironmentDefinition } from '../../experience-engine/validation/environmentDefinitionValidator.js';
import { resolveExperienceLocalization } from '../../experience-engine/localization/experienceLocalization.js';
import { packageExperience } from '../../experience-engine/packaging/experiencePackagingPipeline.js';
import { validateGeneratedWebArtifact } from '../../experience-engine/validation/generatedWebArtifactValidator.js';
import { ExperiencePlayer } from '../../experience-engine/player/experiencePlayer.js';
import { getNotebook } from '../../content/notebooks/notebook.js';

const root = 'docs/implementation/ENV-004/';
const mapping = JSON.parse(await readFile(`${root}mapping.json`, 'utf8'));
const trace = JSON.parse(await readFile(`${root}decision-trace.json`, 'utf8'));
const source = await readFile(`${root}source-editorial-es.md`, 'utf8');
const envRoot = 'content/environments/ENV-004-industrial-electrical-systems/';
const yaml = async p => parseExperienceYaml(await readFile(p, 'utf8'));
const plain = s => s.replace(/\*\*|`/gu, '').trim();
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

test('ENV-004 preserves the original cover, all ten approved coordinates and real destinations', async () => {
  const env = await yaml(`${envRoot}environment.yaml`);
  const theory = await yaml(`${envRoot}theory.yaml`);
  const en = await yaml(`${envRoot}locales/theory.en.yaml`);
  const validation = validateEnvironmentDefinition(env, {
    experienceEditorialIds: mapping.experiences.map(e => e.canonical_editorial_id),
    theory, theoryLocales: { en }
  });
  assert.equal(validation.valid, true, JSON.stringify(validation.incidents));
  assert.equal(env.environment.lifecycle, 'preview');
  assert.equal(env.hotspots.length, 10);
  assert.equal(new Set(env.hotspots.map(h => h.experience_editorial_id)).size, 10);
  const expected = [[65.2,30.5],[28.3,57.3],[87.7,66.3],[26.8,19.7],[40.4,31],[39,81.7],[55.5,56.4],[93.4,56],[65,80.3],[27.1,81.8]];
  assert.deepEqual(env.hotspots.map(h => [h.x, h.y]), expected);
  assert.deepEqual(env.hotspots.map(h => h.experience_editorial_id), mapping.experiences.map(e => e.canonical_editorial_id));
  const image = await readFile(`${envRoot}${env.visual.background}`);
  assert.equal(hash(image), mapping.cover_sha256);
  assert.deepEqual([image.readUInt32BE(16), image.readUInt32BE(20)], [1672,941]);
  assert.equal(theory.sections.length, 5);
  assert.deepEqual(theory.sections.map(s => s.id), en.sections.map(s => s.id));
  assert.deepEqual(theory.media, []);
  for (const note of mapping.notebooks) {
    assert.ok(theory.sections[note.block-1].body.includes(note.canonical_id));
    assert.ok(en.sections[note.block-1].body.includes(note.canonical_id));
  }
  assert.doesNotMatch(JSON.stringify(env), /Review_Only/);
});

test('Notebook keeps every source paragraph, example, question, answer and five block groupings', () => {
  const es = getNotebook('es'); const en = getNotebook('en');
  assert.equal(mapping.notebooks.length, 25);
  assert.equal(new Set(mapping.notebooks.map(n => n.canonical_id)).size, 25);
  assert.deepEqual(Array.from({length:5}, (_,b) => mapping.notebooks.filter(n => n.block===b+1).length), [5,5,5,5,5]);
  for (const note of mapping.notebooks) {
    const spanish = es.find(n => n.id===note.canonical_id);
    const english = en.find(n => n.id===note.canonical_id);
    assert.equal(spanish.title, note.title_es);
    assert.equal(english.title, note.title_en);
    assert.equal(english.review_status, 'technical_review');
    // Slice by the next heading instead of treating paragraph line endings as section boundaries.
    const start = source.indexOf(`### ${note.editorial_id} · `);
    const tail = source.slice(source.indexOf('\n', start)+1);
    const end = tail.search(/^### NB-EL-|^## BLOQUE|^# PARTE/m);
    const original = tail.slice(0,end<0?undefined:end).trim().split(/\n\s*\n/u).filter(p => p.trim() && p.trim()!=='---').map(plain);
    assert.deepEqual(spanish.sections.filter(s => s.id!=='s-review').map(s => s.content), original, note.editorial_id);
    assert.deepEqual(english.sections.map(s => s.id), spanish.sections.map(s => s.id));
    assert.equal(english.sections.length, original.length+1);
    assert.equal(english.sections[0].id, 's-review');
    assert.match(english.sections[0].content,/human technical review/);
    assert.ok(english.sections.every(s => typeof s.content==='string' && s.content.trim()));
    assert.match(english.sections.map(s => s.content).join(' '), /Self-check:/);
    assert.match(spanish.sections.map(s => s.content).join(' '), /Comprobación:/);
    assert.equal(spanish.categories.length, 1);
    assert.equal(english.categories.length, 1);
  }
  assert.equal(new Set(mapping.notebooks.map(n => en.find(a => a.id===n.canonical_id).categories[0])).size,5);
});

test('source trace accounts for exactly 50 moments and 150 unchanged option meanings', () => {
  assert.equal(trace.length,150);
  assert.equal(new Set(trace.map(t => `${t.source_experience}:${t.source_decision}`)).size,50);
  assert.equal(trace.filter(t => t.correct).length,50);
  for (const row of trace) {
    assert.ok(plain(source).includes(row.action_es), row.action_es);
    assert.ok(['A','B','C'].includes(row.option));
  }
});

for (const entry of mapping.experiences) {
  for (const locale of ['es','en']) {
    test(`${entry.canonical_editorial_id} ${locale}: complete schema, retry, evidence order and verified completion`, async () => {
      const author = await yaml(`${entry.path}/experience.yaml`);
      const document = await yaml(`${entry.path}/locales/${locale}.yaml`);
      const validation = validateExperienceDefinition(author);
      assert.equal(validation.valid,true,JSON.stringify(validation.incidents));
      assert.equal(author.metadata.status,'technical_review');
      assert.equal(author.private.technical_validation.status,'pending');
      assert.equal(author.public.stages.length,5);
      assert.equal(author.public.decisions.length,15);
      assert.equal(author.private.decision_logic.filter(d => d.is_correct).length,5);
      assert.equal(author.public.evidence.length,6);
      assert.deepEqual(author.public.visual.assets,[]);
      assert.equal(author.public.visual.representation,'planned');
      const local = resolveExperienceLocalization(author,document);
      const artifact = packageExperience(local);
      assert.equal(validateGeneratedWebArtifact(artifact).valid,true);
      assert.equal(artifact.public.evidence.length,5); // Initial context stays in Incident Brief.
      assert.equal(artifact.public.interactions.length,15);
      assert.doesNotMatch(JSON.stringify(artifact), /root_cause|decision_logic|is_correct|rationale|"private"/);
      for (const row of trace.filter(t => t.canonical_id===entry.technical_id)) {
        const action = local.public.decisions.find(d => d.id===row.decision_id).action;
        assert.ok(action.startsWith(row[`action_${locale}`]), action);
        assert.equal(author.private.decision_logic.find(d => d.decision_id===row.decision_id).is_correct,row.correct);
      }
      for (const evidence of author.public.evidence.filter(e => e.revealed_by.length)) {
        for (const did of evidence.revealed_by) assert.ok(author.private.decision_logic.find(d => d.decision_id===did).evidence_revealed.includes(evidence.id));
      }
      const player = new ExperiencePlayer({experience:artifact});
      player.start(); player.continue();
      for (const [index, stage] of author.public.stages.entries()) {
        assert.equal(player.getState().currentStage.id,stage.id);
        assert.notEqual(player.getState().completionStatus,'completed');
        for (const did of stage.decision_ids.filter(id => !author.private.decision_logic.find(d => d.decision_id===id).is_correct)) {
          const before = player.getState();
          const retry = player.selectDecision(did);
          assert.equal(retry.currentStage.id,stage.id);
          assert.equal(retry.interaction,'stage');
          assert.deepEqual(retry.unlockedEvidence,before.unlockedEvidence);
          assert.deepEqual(retry.progress,before.progress);
          assert.notEqual(retry.completionStatus,'completed');
          const feedback=document.translations.retry_feedback[did];
          assert.ok(feedback.length>60);
          assert.ok(feedback.includes(document.translations.evidence[`EVID-${String(index).padStart(2,'0')}-RECORD`].content));
        }
        const correct=author.private.decision_logic.find(d => d.stage_id===stage.id && d.is_correct);
        const after=player.selectDecision(correct.decision_id);
        assert.equal(after.unlockedEvidence.length,index+1);
        if(index<4) assert.notEqual(after.completionStatus,'completed');
        else { assert.equal(after.completionStatus,'completed'); assert.equal(after.interaction,'completion'); }
      }
      const cleanPlayer=new ExperiencePlayer({experience:artifact});cleanPlayer.start();cleanPlayer.continue();
      for(const did of author.private.diagnostic_model.critical_path) cleanPlayer.selectDecision(did);
      assert.equal(cleanPlayer.getState().completionStatus,'completed');
      const manifest=await yaml(`${entry.path}/media-source/evidence-manifest.yaml`);
      assert.equal(manifest.families.length,4);assert.equal(manifest.slots.length,7);
      assert.equal(manifest.required_missing_minimum,6);assert.equal(manifest.supplied_evidence_images,0);
      assert.equal((await readdir(`${entry.path}/assets`)).filter(f => f!=='.gitkeep').length,0);
      for(const id of entry.notebooks) assert.ok(getNotebook(locale).some(n => n.id===id));
    });
  }
}

test('technical quantities and terminal numbers remain equivalent across ES/EN', () => {
  const quantities = text => (text.match(/\d+(?:[.,]\d+)?/gu) ?? []).map(value => String(Number(value.replace(',', '.'))));
  const spanish=getNotebook('es'), english=getNotebook('en');
  for(const note of mapping.notebooks) {
    const es=spanish.find(n => n.id===note.canonical_id), en=english.find(n => n.id===note.canonical_id);
    es.sections.forEach((section,index) => assert.deepEqual(quantities(en.sections[index].content),quantities(section.content),`${note.editorial_id}.${section.id}`));
  }
  for(const row of trace) assert.deepEqual(quantities(row.action_en).sort(),quantities(row.action_es).sort(),`${row.canonical_id}.${row.decision_id}`);
});
