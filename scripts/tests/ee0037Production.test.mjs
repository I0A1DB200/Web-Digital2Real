import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parseExperienceYaml} from '../../experience-engine/adapter/yamlExperienceAdapter.js';
const p='content/experiences/electrical/EE-0037-incorrect-no-nc-contact/';
const json=async f=>JSON.parse(await readFile(p+f,'utf8'));
const y=async f=>parseExperienceYaml(await readFile(p+f,'utf8'));
const a=await y('experience.yaml'),m=await json('media-source/visual-intake.json');
test('EE37 final binaries, localized alt/caption and disclosure agree with manifest',async()=>{
 assert.equal(m.assets.length,7);
 assert.equal(a.public.visual.cover_asset_id,'ART-001');
 assert.deepEqual(a.public.stages.map(s=>s.media_ids),[['ART-002'],[],[],[],[]]);
 assert.deepEqual(a.public.evidence.map(e=>e.media_ids),[[],['ART-003'],['ART-004'],['ART-005'],['ART-006'],['ART-007']]);
 for(const loc of ['es','en']){
  const l=await y('locales/'+loc+'.yaml');
  for(const asset of m.assets){
   const b=await readFile(p+asset.canonical_file);
   assert.equal(createHash('sha256').update(b).digest('hex'),asset.sha256);
   assert.equal(b.readUInt32BE(16),asset.width);assert.equal(b.readUInt32BE(20),asset.height);
   assert.deepEqual(l.translations.assets[asset.runtime_id],asset.localization[loc]);
   if(loc==='es'){
    const r=a.public.visual.assets.find(x=>x.id===asset.runtime_id);
    assert.equal(r.alt,asset.localization.es.alt);assert.equal(r.caption,asset.localization.es.caption);
   }
  }
  const text=l.translations.stages['STAGE-03-DIAGNOSIS'].situation;
  assert.match(text,loc==='es'?/ausencia de tensión verificada/:/absence of voltage verified/);
 }
 assert.equal(a.metadata.status,'technical_review');assert.equal(a.private.technical_validation.status,'pending');assert.equal(m.publication_allowed,false);
});

// Reconstruct conductive paths from actual SVG segments, excluding each contact's mechanical drawing.
// This checks rendered wiring, rather than trusting only a separately authored netlist.
const svg=await readFile(p+'media-source/production/EE-0037_ART-002.svg','utf8');
const wires=svg.replace(/<g data-contact="[\s\S]*?<\/g>/gu,'');
const segments=[];
for(const match of wires.matchAll(/<polyline[^>]*points="([^"]+)"/gu)){
 const pts=match[1].split(' ').map(x=>x.split(',').map(Number));
 for(let i=1;i<pts.length;i++)segments.push([pts[i-1],pts[i]]);
}
const contacts={S3:[[370,280],[370,400]],START:[[370,500],[370,620]],KM3aux:[[650,500],[650,620]]};
const key=p=>p.join(',');
const on=([x,y],[[ax,ay],[bx,by]])=> x>=Math.min(ax,bx)&&x<=Math.max(ax,bx)&&y>=Math.min(ay,by)&&y<=Math.max(ay,by)&&(x-ax)*(by-ay)===(y-ay)*(bx-ax);
function reaches(startPressed,stopPressed,holding){
 const edges=[...segments,...Object.entries(contacts).filter(([name])=>name==='S3'?!stopPressed:name==='START'?startPressed:holding).map(([,edge])=>edge)];
 const vertices=[...edges.flat(),[370,225],[370,730]];const graph=new Map(vertices.map(p=>[key(p),new Set()]));
 for(const e of edges){const v=vertices.filter(p=>on(p,e));for(const p of v)for(const q of v)graph.get(key(p)).add(key(q));}
 const seen=new Set(),queue=['370,225'];
 while(queue.length){const x=queue.pop();if(seen.has(x))continue;seen.add(x);queue.push(...graph.get(x));}
 return seen.has('370,730');
}
test('EE37 actual drawn circuit: STOP cuts both START and holding paths under all eight states',()=>{
 for(const start of [false,true])for(const stop of [false,true])for(const hold of [false,true])
  assert.equal(reaches(start,stop,hold),!stop&&(start||hold),JSON.stringify({start,stop,hold}));
 assert.match(svg,/Uc unspecified/);assert.doesNotMatch(svg,/230|24 V|PE/);
});
test('EE37 final record follows drawn circuit: holds, stops, no restart after STOP release',async()=>{
 const record=await json('media-source/production/functional-record.json');let prior=record.initial_KM3;
 assert.equal(record.type,'authored_simulation_not_measurement');
 for(const row of record.rows){const next=reaches(row.START_pressed,row.STOP_pressed,prior);assert.equal(row.KM3_on,next);prior=next;}
 assert.deepEqual(record.rows.map(r=>r.KM3_on),[false,true,true,false,false]);
});
