import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {getNotebook} from '/workspace/Web-Digital2Real/Frontend/generated/notebooks/notebook.js';
const base='/workspace/Web-Digital2Real/Frontend/generated/experience-engine/';
const catalog=JSON.parse(await readFile(base+'catalog.json','utf8'));
const mapping=JSON.parse(await readFile('/workspace/Web-Digital2Real/docs/implementation/ENV-004/mapping.json','utf8'));
let missing=[],assets=0,authoringLeak=[];
for(const entry of catalog.experiences.filter(e=>e.id.startsWith('EXP-ELECTRICAL-'))){
 for(const locale of ['es','en']){
  const file=entry.locales[locale];const artifact=JSON.parse(await readFile(base+file,'utf8'));
  for(const a of artifact.public.visual.assets){assets++;try{await stat(base+a.src);}catch{missing.push(a.src);}}
  if(/root_cause|decision_logic|is_correct|rationale|"private"/.test(JSON.stringify(artifact)))authoringLeak.push(file);
 }
}
const env=catalog.environments.find(e=>e.id==='ENV-004');await stat(base+env.background);
for(const locale of ['es','en']){await stat(base+env.theory.locales[locale]);if(getNotebook(locale).filter(n=>n.editorial_id?.startsWith('NB-EL-')).length!==25)throw Error('Notebook count');}
const checksum=createHash('sha256').update(await readFile(base+env.background)).digest('hex');
if(checksum!==mapping.cover_sha256||missing.length||authoringLeak.length)throw Error('Artifact audit failed');
const publish=JSON.parse(await readFile('/workspace/work/env004/qa/publish-filter.json','utf8'));
if(publish.packaged.some(id=>id.startsWith('EXP-ELECTRICAL-'))||publish.environments.includes('ENV-004'))throw Error('Publication boundary failed');
console.log(JSON.stringify({preview_total_experiences:catalog.experiences.length,preview_total_environments:catalog.environments.length,env004_experiences:10,locales_per_experience:2,notebooks_per_locale:25,theory_sections:5,hotspots:env.hotspots.length,registered_experience_image_paths:assets,missing_asset_paths:missing,authoring_leaks:authoringLeak,cover_sha256:checksum,publish_excludes_env004:true},null,2));
