import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parseExperienceYaml} from '../../experience-engine/adapter/yamlExperienceAdapter.js';
import {resolveExperienceLocalization} from '../../experience-engine/localization/experienceLocalization.js';
const root='content/experiences/electrical';
const hash=b=>createHash('sha256').update(b).digest('hex');
const digest=o=>hash(JSON.stringify(o));
const logic=o=>o.private.decision_logic.map(({rationale,consequence,retry_feedback,...d})=>d);
for(const n of [34,35,36]){
 const dir=`${root}/${(await readdir(root)).find(p=>p.startsWith(`EE-00${n}-`))}`;
 const author=parseExperienceYaml(await readFile(`${dir}/experience.yaml`,'utf8'));
 const before=parseExperienceYaml(await readFile(`${dir}/media-source/corrections-before-experience.yaml`,'utf8'));
 const intake=JSON.parse(await readFile(`${dir}/media-source/visual-intake.json`,'utf8'));
 test(`EE-00${n}: preserved original, corrected PNG and publication hold are traceable`,async()=>{
  assert.equal(intake.publication_allowed,false);assert.equal(author.metadata.status,'technical_review');
  assert.equal(author.private.technical_validation.status,'pending');
  if(n===34){const approval=intake.two_asset_revision.approval;assert.equal(intake.two_asset_revision.model_conditions_approved,true);assert.equal(approval.model_source_sha256,hash(await readFile(`${dir}/media-source/final-two-assets/model.mjs`)));assert.equal(approval.model_results_sha256,hash(await readFile(`${dir}/media-source/final-two-assets/model-results.json`)));}
  for(const a of intake.assets){
   const b=await readFile(`${dir}/${a.canonical_file}`),original=await readFile(`${dir}/${a.original_file}`);
   if(n===34&&['ART-004','ART-005'].includes(a.runtime_id)){assert.equal(a.visual_approval.status,'APPROVED');assert.equal(a.visual_approval.asset_sha256,hash(b));assert.equal(a.authored_conditions_approval.status,'APPROVED');}
   assert.equal(hash(b),a.sha256);assert.equal(hash(original),a.original_sha256);
   assert.equal(b.subarray(1,4).toString(),'PNG');assert.deepEqual([b.readUInt32BE(16),b.readUInt32BE(20)],[a.width,a.height]);
   assert.equal(a.binary_modified,a.sha256!==a.original_sha256);
  }
 });
 test(`EE-00${n}: options, evaluation, root cause and IDs survive authorized evidence corrections`,()=>{
  assert.deepEqual(author.public.decisions,before.public.decisions);assert.deepEqual(logic(author),logic(before));
  assert.equal(digest(logic(author)),intake.correction_revision.evaluation_invariants_sha256);
  assert.deepEqual(author.private.diagnostic_model,before.private.diagnostic_model);
  assert.deepEqual(author.public.stages.map(s=>s.id),before.public.stages.map(s=>s.id));
  assert.deepEqual(author.public.evidence.map(e=>[e.id,e.revealed_by]),before.public.evidence.map(e=>[e.id,e.revealed_by]));
  for(const e of author.public.evidence){
   const b=before.public.evidence.find(x=>x.id===e.id),authorized=intake.correction_revision.evidence_content_changes?.es?.[e.id];
   assert.equal(e.content,authorized??b.content);
  }
 });
 for(const locale of ['es','en'])test(`EE-00${n} ${locale}: timing, localized media and hidden-resource guards`,async()=>{
  const doc=parseExperienceYaml(await readFile(`${dir}/locales/${locale}.yaml`,'utf8'));
  const local=resolveExperienceLocalization(author,doc);
  const refs=[local.public.visual.cover_asset_id,...local.public.stages.flatMap(s=>s.media_ids),...local.public.evidence.flatMap(e=>e.media_ids),...(local.public.completion?.media_ids??[])];
  for(const a of intake.assets){assert.equal(refs.includes(a.runtime_id),a.runtime_presented);const asset=local.public.visual.assets.find(x=>x.id===a.runtime_id);assert.ok(asset.alt);assert.ok(asset.caption);}
  const stage=local.public.stages.find(s=>s.id==='STAGE-03-DIAGNOSIS');assert.match(stage.situation,locale==='es'?/ausencia de tensión verificada/:/(?:absence of voltage verified|verified absence of voltage)/);
  if(n!==34)assert.match(stage.situation,locale==='es'?/caminos paralelos aislados/:/parallel paths isolated/);
  if(n===34){
   const e=local.public.evidence.find(e=>e.id==='EVID-03-RECORD');assert.doesNotMatch(e.content,/identifica un polo|identifies an open pole/);assert.match(e.content,/OL/);
   assert.deepEqual(local.public.evidence.find(e=>e.id==='EVID-01-RECORD').media_ids,['ART-003']);
   for(const id of ['ART-004','ART-005']){
    const rendered=local.public.visual.assets.find(a=>a.id===id),record=intake.assets.find(a=>a.runtime_id===id);
    assert.equal(rendered.alt,record.localization[locale].alt);assert.equal(rendered.caption,record.localization[locale].caption);
   }
   assert.deepEqual(local.public.evidence.find(e=>e.id==='EVID-02-RECORD').media_ids,['ART-004']);
   assert.deepEqual(local.public.evidence.find(e=>e.id==='EVID-04-RECORD').media_ids,['ART-005']);
   assert.deepEqual(local.public.evidence.find(e=>e.id==='EVID-03-RECORD').media_ids,[]);
   assert.match(e.content,/3RT2916-4MC00/);
   assert.match(local.public.evidence.find(e=>e.id==='EVID-02-RECORD').content,/400 V/);
   assert.match(local.public.evidence.find(e=>e.id==='EVID-02-RECORD').content,/200 V/);
   assert.doesNotMatch(local.public.evidence.find(e=>e.id==='EVID-02-RECORD').content,/400\/0\/400|L2-L3 0 V/);
  }
  if(n===35){
   const e=local.public.evidence.find(e=>e.id==='EVID-03-RECORD');assert.match(e.content,/222/);assert.doesNotMatch(e.content,/aislamiento dañado|damaged insulation|conductores.*contacto|conductors.*contact/);
   assert.deepEqual(e.media_ids,['ART-005']);assert.deepEqual(local.public.stages.find(s=>s.id==='STAGE-04-DIAGNOSIS').media_ids,['ART-006']);
   assert.deepEqual(local.public.evidence.find(e=>e.id==='EVID-04-RECORD').media_ids,[]);
  }
  if(n===36){
   const approved=intake.assets.find(a=>a.runtime_id==='ART-007');
   assert.equal(approved.visual_approval.status,'APPROVED');
   assert.equal(approved.visual_approval.asset_sha256,approved.sha256);
   assert.equal(approved.technical_status,'HUMAN_REVIEW_PENDING');
   assert.deepEqual(local.public.evidence.find(e=>e.id==='EVID-05-RECORD').media_ids,['ART-007']);
   assert.ok(!local.public.stages.some(s=>s.media_ids.includes('ART-007')));
   assert.ok(!local.public.evidence.filter(e=>e.id!=='EVID-05-RECORD').some(e=>e.media_ids.includes('ART-007')));
  }
 });
 if(n!==34)test(`EE-00${n}: final SVG connectivity agrees with terminals and detects a bypass`,async()=>{
  const net=JSON.parse(await readFile(`${dir}/media-source/corrections/ART-002-connections.json`,'utf8'));
  const svg=await readFile(`${dir}/media-source/corrections/ART-002.svg`,'utf8');
  const polylines=[...svg.matchAll(/<polyline points="([^"]+)"[^>]*data-wire="([^"]+)" data-from="([^"]+)" data-to="([^"]+)"/g)].map(m=>({id:m[2],from:m[3],to:m[4],points:m[1].split(' ').map(p=>p.split(',').map(Number))}));
  assert.equal(polylines.length,net.wires.length);
  for(const line of polylines){const wire=net.wires.find(w=>w.id===line.id);assert.deepEqual(line.points,wire.points);assert.deepEqual(line.points[0],net.ports[line.from]);assert.deepEqual(line.points.at(-1),net.ports[line.to]);}
  const key=p=>p.join(',');const points=[...new Map([...Object.values(net.ports),...polylines.flatMap(w=>w.points)].map(p=>[key(p),p])).values()];
  const graph=new Map(points.map(p=>[key(p),new Set()]));
  const add=(a,b)=>{graph.get(key(a)).add(key(b));graph.get(key(b)).add(key(a));};
  for(const line of polylines)for(let j=1;j<line.points.length;j++){
   const a=line.points[j-1],b=line.points[j];assert.ok(a[0]===b[0]||a[1]===b[1]);
   const on=points.filter(p=>(a[0]===b[0]?p[0]===a[0]:p[1]===a[1])&&p[0]>=Math.min(a[0],b[0])&&p[0]<=Math.max(a[0],b[0])&&p[1]>=Math.min(a[1],b[1])&&p[1]<=Math.max(a[1],b[1])).sort((p,q)=>a[0]===b[0]?p[1]-q[1]:p[0]-q[0]);
   for(let k=1;k<on.length;k++)add(on[k-1],on[k]);
  }
  const connected=(from,to,removed=null)=>{const target=key(net.ports[to]),omit=removed?key(net.ports[removed]):null,seen=new Set(),queue=[key(net.ports[from])];while(queue.length){const x=queue.pop();if(x===omit||seen.has(x))continue;if(x===target)return true;seen.add(x);queue.push(...graph.get(x));}return false;};
  for(const [a,b] of net.checks.same_net)assert.ok(connected(a,b),`${a} must connect to ${b}`);
  for(const [a,b] of net.checks.different_net)assert.ok(!connected(a,b),`${a} must not be wired directly to ${b}`);
  if(n===36){assert.ok(!connected('Y3:A2','PS1:0','X2:8'),'removing X2:8 must break the return');add(net.ports['Y3:A2'],net.ports['PS1:0']);assert.ok(connected('Y3:A2','PS1:0','X2:8'),'negative control: the checker sees an injected bypass');}
  if(n===35){assert.ok(connected('Y2:0','PS1:0','F24:0'),'load return must not depend on the F24 electronics reference');}
 });
}

const phaseModel=await import('../../content/experiences/electrical/EE-0034-single-phase-loss/media-source/final-two-assets/model.mjs');
test('EE-0034: explicit floating-star model reproduces the upstream source and calculates 400/200/200',()=>{
 phaseModel.upstreamMagnitudes().forEach((v,i)=>assert.ok(Math.abs(v-[400,401,399][i])<1e-9));
 for(const z of [[0.1,0.2],[1,1],[5,20],[50,50]]){
  const options={impedances:[z,z,z]};
  phaseModel.downstreamMagnitudes(options).forEach((v,i)=>assert.ok(Math.abs(v-[400,200,200][i])<1e-9));
  assert.deepEqual(phaseModel.downstreamMagnitudes({...options,meterOhms:1e6}).map(Math.round),[400,200,200]);
 }
});
test('EE-0034: unbalanced windings and back EMF invalidate a universal 400/200/200 claim',()=>{
 assert.notDeepEqual(phaseModel.downstreamMagnitudes({impedances:[[1,1],[2,2],[1,1]]}).map(Math.round),[400,200,200]);
 assert.notDeepEqual(phaseModel.downstreamMagnitudes({emfs:[[0,0],[0,0],[0,40]]}).map(Math.round),[400,200,200]);
 assert.throws(()=>phaseModel.downstreamMagnitudes({meterOhms:0}));
});
test('EE-0034: pole readings require isolation and established mechanical test closure',()=>{
 const ready={powerIsolated:true,controlIsolated:true,absenceVerified:true,parallelPathsIsolated:true,testKitInstalled:true,testClosed:true};
 for(const key of Object.keys(ready))assert.throws(()=>phaseModel.isolatedPoleRecord({...ready,[key]:false}));
 const record=phaseModel.isolatedPoleRecord(ready);assert.deepEqual(record.illustrativeReadings,['0.2 Ω','0.2 Ω','OL']);assert.equal(record.universalAcceptanceLimit,false);
});
