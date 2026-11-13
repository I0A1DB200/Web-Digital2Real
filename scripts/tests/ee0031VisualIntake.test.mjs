import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { parseExperienceYaml } from '../../experience-engine/adapter/yamlExperienceAdapter.js';
import { resolveExperienceLocalization } from '../../experience-engine/localization/experienceLocalization.js';
import { packageExperience } from '../../experience-engine/packaging/experiencePackagingPipeline.js';
import { ExperiencePlayer } from '../../experience-engine/player/experiencePlayer.js';

const dir='content/experiences/electrical/EE-0031-24vdc-supply-voltage-collapse';
const yaml=async path=>parseExperienceYaml(await readFile(path,'utf8'));
const hash=data=>createHash('sha256').update(data).digest('hex');
const intake=JSON.parse(await readFile(`${dir}/media-source/visual-intake.json`,'utf8'));
const correction=JSON.parse(await readFile(`${dir}/media-source/visual-binding.json`,'utf8'));
const incoming=JSON.parse(await readFile(`${dir}/media-source/EE0031_Codex/ASSET_MANIFEST.json`,'utf8'));

test('EE-0031 holds six exact original PNGs, without resizing or recompression', async()=>{
  assert.equal(incoming.assets.length,6);assert.equal(intake.assets.length,6);
  const actual=(await readdir(`${dir}/assets`)).filter(f=>f.endsWith('.png')).sort();
  assert.deepEqual(actual,intake.assets.map(a=>a.canonical_file.split('/').at(-1)).sort());
  assert.equal(new Set(intake.assets.map(a=>a.proposed_runtime_id)).size,6);
  for(const asset of intake.assets){
    const source=incoming.assets.find(a=>a.id===asset.source_id);assert.ok(source);
    const bytes=await readFile(`${dir}/${asset.canonical_file}`);
    assert.equal(hash(bytes),source.sha256);assert.equal(asset.sha256,source.sha256);
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[asset.width,asset.height]);
    assert.equal(asset.visual_approval,'user_visual_only');
    assert.equal(asset.runtime_registered,true);assert.equal(asset.runtime_presented,true);
    assert.ok(asset.proposed_runtime_src.startsWith('assets/EXP-ELECTRICAL-SUPPLY-031/'));
  }
});

test('EE-0031 original binding preserves decisions and checks ZIP binary provenance',async()=>{
  const source=await yaml(`${dir}/experience.yaml`);
  assert.equal(hash(JSON.stringify(source.public.decisions)),correction.preserved_decisions_sha256);
  assert.equal(hash(JSON.stringify(source.private.decision_logic)),correction.preserved_decision_logic_sha256);
  assert.equal(source.public.stages.length,5);assert.equal(source.public.decisions.length,15);
  assert.equal(source.private.technical_validation.status,'pending');
  for(const asset of correction.assets){
    const bytes=await readFile(`${dir}/${asset.file}`);
    assert.equal(hash(bytes),asset.sha256);
    assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[asset.width,asset.height]);
  }
});

test('EE-0031 received counts distinguish presence from blocked technical acceptance',async()=>{
  const manifest=await yaml(`${dir}/media-source/evidence-manifest.yaml`);
  assert.equal(manifest.supplied_evidence_images,6);assert.equal(manifest.required_missing_minimum,0);
  assert.equal(manifest.runtime_registered_images,6);
  assert.equal(correction.publishable,false);
  assert.equal(intake.status,'ORIGINALS_BOUND_USER_REQUEST_TECHNICAL_REVIEW_PENDING');
  assert.equal(intake.new_visual_publication_allowed,false);
  assert.deepEqual(intake.issues.filter(x=>x.status==='BLOCKING').map(x=>x.id),['B01','B02','B03','B04']);
});

test('EE-0031 original recovery media can only follow final verification',async()=>{
  const source=await yaml(`${dir}/experience.yaml`);
  const recovery=intake.assets.find(a=>a.source_id==='ASSET-06');
  assert.equal(recovery.proposed_binding.decision,'DEC-05-C');
  const logic=source.private.decision_logic.find(x=>x.decision_id===recovery.proposed_binding.decision);
  assert.equal(logic.is_correct,true);assert.equal(logic.next_stage,'COMPLETE');
  assert.ok(logic.evidence_revealed.includes(recovery.proposed_binding.evidence));
  assert.equal(source.public.visual.assets.length,6);
  assert.equal(source.public.visual.cover_asset_id,'ART-001');
  assert.deepEqual(source.public.stages[0].media_ids,['ART-002']);
  assert.ok(source.public.stages.slice(1).every(s=>s.media_ids.length===0));
  assert.deepEqual(source.public.evidence.find(e=>e.id==='EVID-05-RECORD').media_ids,['ART-006']);
  assert.ok(source.public.evidence.filter(e=>e.id!=='EVID-05-RECORD').every(e=>!e.media_ids.includes('ART-006')));
  assert.deepEqual(source.public.completion.media_ids,['ART-006']);
});

for(const locale of ['es','en'])test(`EE-0031 ${locale} uses only original ZIP media and gates each result after its decision`,async()=>{
  const source=await yaml(`${dir}/experience.yaml`);
  const localeDoc=await yaml(`${dir}/locales/${locale}.yaml`);
  const artifact=packageExperience(resolveExperienceLocalization(source,localeDoc));
  assert.equal(artifact.public.visual.assets.length,6);
  assert.ok(artifact.public.visual.assets.every(a=>!a.src.includes("-r2")));
  for(const asset of intake.assets){
    assert.ok(artifact.public.visual.assets.some(a=>a.src===asset.proposed_runtime_src));
    assert.ok(asset.proposed_localization[locale].alt.trim());
    assert.ok(asset.proposed_localization[locale].caption.trim());
  }
  const player=new ExperiencePlayer({experience:artifact});player.start();player.continue();
  for(const stage of source.public.stages){
    const correct=source.private.decision_logic.find(d=>d.stage_id===stage.id&&d.is_correct);
    assert.equal(player.getState().currentStage.id,stage.id);
    assert.notEqual(player.getState().completionStatus,'completed');
    const wrong=source.private.decision_logic.find(d=>d.stage_id===stage.id&&!d.is_correct);
    const before=player.getState();player.selectDecision(wrong.decision_id);
    assert.deepEqual(player.getState().unlockedEvidence,before.unlockedEvidence);
    player.selectDecision(correct.decision_id);
    if(player.getState().interaction==='result') {
      assert.equal(player.getState().result.evidence.flatMap(e=>e.media).length,stage.id==='STAGE-04-DIAGNOSIS'?0:1);
      player.continue();
    }
  }
  assert.equal(player.getState().completionStatus,'completed');
});
