import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { parseExperienceYaml } from '../../experience-engine/adapter/yamlExperienceAdapter.js';
import { resolveExperienceLocalization } from '../../experience-engine/localization/experienceLocalization.js';
import { packageExperience } from '../../experience-engine/packaging/experiencePackagingPipeline.js';
import { validateExperienceDefinition } from '../../experience-engine/validation/experienceDefinitionValidator.js';
import { ExperiencePlayer } from '../../experience-engine/player/experiencePlayer.js';
const dir='content/experiences/electrical/EE-0032-contactor-does-not-energize';
const yaml=async path=>parseExperienceYaml(await readFile(path,'utf8'));
const hash=data=>createHash('sha256').update(data).digest('hex');
const semantic=data=>hash(JSON.stringify(data));
const intake=JSON.parse(await readFile(`${dir}/media-source/visual-intake.json`,'utf8'));
const source=await yaml(`${dir}/experience.yaml`);

test('EE-0032 contains five traceable PNGs with the authorized S1 label edit and never invents Asset 06',async()=>{
  assert.equal(intake.assets.length,5);assert.equal(intake.no_asset_06,true);
  assert.deepEqual((await readdir(`${dir}/assets`)).filter(f=>f.endsWith('.png')).sort(),intake.assets.map(a=>a.canonical_file.split('/').at(-1)).sort());
  assert.equal(new Set(source.public.visual.assets.map(a=>a.id)).size,5);
  for(const asset of intake.assets){
    const bytes=await readFile(`${dir}/${asset.canonical_file}`);
    assert.equal(hash(bytes),asset.sha256);
    if(asset.user_edit) assert.equal(asset.user_edit.outside_regions_pixels_identical,true);
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[asset.width,asset.height]);
    assert.equal(source.public.visual.assets.find(a=>a.id===asset.runtime_id).src,asset.src);
  }
});

test('EE-0032 media integration preserves all stages, evidence, options and diagnosis semantics',()=>{
  assert.equal(validateExperienceDefinition(source).valid,true);
  assert.equal(source.metadata.id,'EXP-ELECTRICAL-CONTACTOR-032');
  assert.equal(source.metadata.editorial_id,'EE-0032');
  assert.equal(source.public.stages.length,5);assert.equal(source.public.decisions.length,15);
  assert.equal(semantic(source.public.decisions),intake.semantic_sha256.decisions);
  assert.equal(semantic(source.private.decision_logic),intake.private_decision_logic_sha256);
  assert.equal(semantic(source.private.fault_model),intake.fault_model_sha256);
  assert.equal(semantic(source.public.stages.map(({media_ids,...s})=>({...s,situation:s.situation.replace(' El aislamiento debe eliminar caminos paralelos.','')}))),intake.stages_without_media_sha256);
  assert.equal(semantic(source.public.evidence.map(({media_ids,...e})=>e)),intake.evidence_without_media_sha256);
});

test('EE-0032 binds voltage after D2 and isolated continuity only after the confirming D4 action',()=>{
  assert.equal(source.public.visual.cover_asset_id,'ART-001');
  assert.deepEqual(source.public.stages[0].media_ids,['ART-002']);
  assert.ok(source.public.stages.slice(1).every(s=>!s.media_ids.length));
  assert.deepEqual(source.public.evidence.find(e=>e.id==='EVID-02-RECORD').media_ids,['ART-003']);
  assert.deepEqual(source.public.evidence.find(e=>e.id==='EVID-04-RECORD').media_ids,['ART-004']);
  assert.deepEqual(source.public.evidence.find(e=>e.id==='EVID-04-RECORD').revealed_by,['DEC-04-A']);
  assert.match(source.public.scenario.safety_context.intervention_constraints.join(' '),/caminos paralelos/);
  assert.match(source.public.stages[3].situation,/desenergización, consignación y ausencia de tensión/);
});

test('EE-0032 shows corrected ART-005 only after final verification and retains human review status',()=>{
  assert.equal(intake.publication_allowed,false);
  assert.equal(intake.runtime_registered_assets,5);assert.equal(intake.runtime_presented_assets,5);
  assert.equal(source.private.technical_validation.status,'pending');
  assert.equal(intake.assets[4].technical_status,'S1_LABELS_CORRECTED_DEVICE_VALIDATION_PENDING');
  assert.equal(intake.assets[4].runtime_presented,true);
  assert.equal(source.public.visual.assets.find(a=>a.id==='ART-005').purpose,'completion');
  assert.ok(source.public.stages.every(s=>!s.media_ids.includes('ART-005')));
  assert.ok(source.public.evidence.filter(e=>e.id!=='EVID-05-RECORD').every(e=>!e.media_ids.includes('ART-005')));
  assert.deepEqual(source.public.evidence.find(e=>e.id==='EVID-05-RECORD').media_ids,['ART-005']);
  assert.deepEqual(source.public.completion.media_ids,['ART-005']);
});

for(const locale of ['es','en'])test(`EE-0032 ${locale} retries, acquired-image order, final verification and reset preserve disclosure`,async()=>{
  const doc=await yaml(`${dir}/locales/${locale}.yaml`);
  for(const [field,expected] of Object.entries(intake.localized_semantic_sha256[locale])) assert.equal(semantic(field==='stages'?Object.fromEntries(Object.entries(doc.translations[field]).map(([id,s])=>[id,{...s,situation:s.situation.replace(locale==='es'?' El aislamiento debe eliminar caminos paralelos.':' Isolation must eliminate parallel paths.','')}])):doc.translations[field]),expected,`${locale}.${field}`);
  const artifact=packageExperience(resolveExperienceLocalization(source,doc));
  assert.equal(artifact.public.visual.assets.length,5);
  for(const asset of artifact.public.visual.assets){assert.ok(asset.alt.trim());assert.ok(asset.caption.trim());assert.doesNotMatch(asset.alt,/PLC|TIA/);}
  const p=new ExperiencePlayer({experience:artifact});p.start();p.continue();
  const shown=[];
  for(const [index,stage] of source.public.stages.entries()){
    assert.equal(p.getState().currentStage.id,stage.id);
    assert.notEqual(p.getState().completionStatus,'completed');
    for(const wrong of source.private.decision_logic.filter(d=>d.stage_id===stage.id&&!d.is_correct)){
      const before=p.getState();p.selectDecision(wrong.decision_id);
      assert.deepEqual(p.getState().unlockedEvidence,before.unlockedEvidence);
      assert.equal(p.getState().interaction,'stage');
    }
    const correct=source.private.decision_logic.find(d=>d.stage_id===stage.id&&d.is_correct);
    p.selectDecision(correct.decision_id);
    if([1,3,4].includes(index)){
      assert.equal(p.getState().interaction,'result');
      const media=p.getState().result.evidence.flatMap(e=>e.media);
      assert.deepEqual(media.map(a=>a.id),[index===1?'ART-003':index===3?'ART-004':'ART-005']);shown.push(...media.map(a=>a.id));
      const before=p.getState();p.continue();
      assert.deepEqual(p.getState().unlockedEvidence,before.unlockedEvidence);
    } else assert.notEqual(p.getState().interaction,'result');
  }
  assert.deepEqual(shown,['ART-003','ART-004','ART-005']);
  assert.equal(p.getState().completionStatus,'completed');
  assert.deepEqual(p.getState().media.map(a=>a.id),['ART-005']);
  p.reset();assert.deepEqual(p.getState().unlockedEvidence,[]);
  assert.notEqual(p.getState().completionStatus,'completed');
});
