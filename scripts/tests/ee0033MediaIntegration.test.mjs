import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { parseExperienceYaml } from '../../experience-engine/adapter/yamlExperienceAdapter.js';
import { resolveExperienceLocalization } from '../../experience-engine/localization/experienceLocalization.js';
import { packageExperience } from '../../experience-engine/packaging/experiencePackagingPipeline.js';
import { validateExperienceDefinition } from '../../experience-engine/validation/experienceDefinitionValidator.js';
import { ExperiencePlayer } from '../../experience-engine/player/experiencePlayer.js';
const dir='content/experiences/electrical/EE-0033-motor-overload-trip';
const yaml=async p=>parseExperienceYaml(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const source=await yaml(`${dir}/experience.yaml`);
const intake=JSON.parse(await readFile(`${dir}/media-source/visual-intake.json`,'utf8'));

test('EE-0033 preserves six original PNGs with valid paths, dimensions and unique IDs',async()=>{
  assert.equal(intake.assets.length,6);
  assert.deepEqual((await readdir(`${dir}/assets`)).filter(n=>n.endsWith('.png')).sort(),intake.assets.map(a=>a.canonical_file.split('/').at(-1)).sort());
  assert.equal(new Set(source.public.visual.assets.map(a=>a.id)).size,6);
  for(const asset of intake.assets){
    const b=await readFile(`${dir}/${asset.canonical_file}`);
    assert.equal(hash(b),asset.sha256);assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.deepEqual([b.readUInt32BE(16),b.readUInt32BE(20)],[asset.width,asset.height]);
    assert.equal(source.public.visual.assets.find(a=>a.id===asset.runtime_id).src,asset.src);
  }
});

test('EE-0033 keeps decision IDs, scoring and root-cause progression while revising the case data',()=>{
  assert.equal(validateExperienceDefinition(source).valid,true);
  assert.equal(source.metadata.id,'EXP-ELECTRICAL-OVERLOAD-033');
  assert.equal(source.public.stages.length,5);assert.equal(source.public.decisions.length,15);assert.equal(source.public.evidence.length,6);
  const logic=source.private.decision_logic.map(({rationale,consequence,retry_feedback,...d})=>d);
  assert.equal(hash(JSON.stringify(logic)),intake.preserved_decision_structure_sha256);
  assert.deepEqual(source.private.decision_logic.filter(d=>d.is_correct).map(d=>d.decision_id),['DEC-01-B','DEC-02-A','DEC-03-C','DEC-04-A','DEC-05-B']);
  const wrong=source.private.decision_logic.find(d=>d.decision_id==='DEC-01-A');
  assert.equal(wrong.is_correct,false);assert.ok(wrong.score_effect<0);
  assert.match(source.public.decisions.find(d=>d.id==='DEC-01-A').action,/Rearmar reiteradamente/);
  assert.match(source.private.fault_model.root_cause,/rodillo/);
});

test('EE-0033 declares human publication block without changing the Engine or certifying device ranges',()=>{
  assert.equal(intake.publication_allowed,false);assert.equal(intake.no_engine_changes,true);
  assert.equal(intake.status,'DRAFT_INTEGRATED_PUBLICATION_BLOCKED_HUMAN_QA');
  assert.equal(source.metadata.status,'technical_review');assert.equal(source.private.technical_validation.status,'pending');
  assert.equal(intake.issues.filter(i=>i.status==='BLOCKING_HUMAN_REVIEW').length,2);
  assert.deepEqual(source.public.completion.media_ids,[]);
  assert.ok(source.public.stages.slice(1).every(s=>s.media_ids.length===0));
});

for(const locale of ['es','en'])test(`EE-0033 ${locale} gates continuity and roller evidence, retries and verified recovery`,async()=>{
  const doc=await yaml(`${dir}/locales/${locale}.yaml`);const local=resolveExperienceLocalization(source,doc);const artifact=packageExperience(local);
  const text=JSON.stringify(local);
  assert.doesNotMatch(text,/3[.,]2 A|4[.,]5\/4[.,]4\/4[.,]6|tres corrientes similares|three similar currents/);
  assert.match(local.public.evidence.find(e=>e.id==='EVID-01-RECORD').content,locale==='es'?/5,6 A/:/5.6 A/);
  assert.match(local.public.evidence.find(e=>e.id==='EVID-05-RECORD').content,locale==='es'?/3,5 A/:/3.5 A/);
  assert.match(local.public.scenario.initial_context,locale==='es'?/3,8 A/:/3.8 A/);
  const safe=local.public.stages[1].situation;
  for(const term of locale==='es'?['circuito aislado','ausencia de tensión verificada','eliminar caminos paralelos']:['isolated circuit','verified absence of voltage','eliminate parallel paths']) assert.ok(safe.includes(term));
  assert.equal(artifact.public.visual.assets.length,6);
  for(const a of artifact.public.visual.assets){assert.ok(a.alt.trim());assert.ok(a.caption.trim());}
  const p=new ExperiencePlayer({experience:artifact});p.start();p.continue();const acquired=[];
  for(const [index,stage] of source.public.stages.entries()){
    assert.equal(p.getState().currentStage.id,stage.id);assert.notEqual(p.getState().completionStatus,'completed');
    for(const wrong of source.private.decision_logic.filter(d=>d.stage_id===stage.id&&!d.is_correct)){
      const before=p.getState();p.selectDecision(wrong.decision_id);assert.deepEqual(p.getState().unlockedEvidence,before.unlockedEvidence);assert.equal(p.getState().interaction,'stage');
    }
    p.selectDecision(source.private.decision_logic.find(d=>d.stage_id===stage.id&&d.is_correct).decision_id);
    if(index<3){
      assert.equal(p.getState().interaction,'result');const ids=p.getState().result.evidence.flatMap(e=>e.media.map(a=>a.id));
      assert.deepEqual(ids,[['ART-003'],['ART-004','ART-005'],['ART-006']][index]);acquired.push(...ids);
      const before=p.getState();p.continue();assert.deepEqual(p.getState().unlockedEvidence,before.unlockedEvidence);
    }else assert.notEqual(p.getState().interaction,'result');
    if(index<4)assert.notEqual(p.getState().completionStatus,'completed');
  }
  assert.deepEqual(acquired,['ART-003','ART-004','ART-005','ART-006']);
  assert.equal(p.getState().completionStatus,'completed');assert.deepEqual(p.getState().media,[]);
  p.reset();assert.deepEqual(p.getState().unlockedEvidence,[]);assert.notEqual(p.getState().completionStatus,'completed');
});
