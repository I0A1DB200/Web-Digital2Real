import assert from 'node:assert/strict';
import test from 'node:test';
import {parseRoute,formatRoute,parentRoute,preserveLabViewport} from '../labRoutes.js';
import {scrollToContent} from '../../components/scrollToContent.js';

test('navigation routes round-trip without exposing pedagogical state',()=>{
 for(const route of [
  {view:'engineering-notes'},{view:'about'},{view:'experience-lab'},
  {view:'experience-lab',environmentId:'ENV-004'},
  {view:'experience-lab',environmentId:'ENV-004',previewId:'EXP-ELECTRICAL-CONTACT-037'},
  {view:'experience-lab',environmentId:'ENV-004',experienceId:'EXP-ELECTRICAL-CONTACT-037'},
  {view:'experience-lab',environmentId:'ENV-004',theorySectionIndex:2}
 ]) assert.deepEqual(parseRoute(formatRoute(route)),route);
 const exp={view:'experience-lab',environmentId:'ENV-004',experienceId:'EXP-TEST'};
 assert.deepEqual(parentRoute(parentRoute(parentRoute(exp))),{view:'experience-lab'});
 assert.equal(formatRoute({...exp,decision:'DEC-01-A',evidence:'SECRET'}),formatRoute(exp));
});

test('malformed and unsupported routes fail to a known parent',()=>{
 for(const hash of ['#%ZZ','#unknown','#experience-lab/env/ENV-004/preview/%2F','#experience-lab/env/ENV-004/theory/0','#experience-lab/env/ENV-004/preview/EXP/extra'])
  assert.ok(['#engineering-notes','#experience-lab'].includes(formatRoute(parseRoute(hash))),hash);
 assert.deepEqual(parseRoute('#experience-lab/env/ENV-UNKNOWN'),{view:'experience-lab',environmentId:'ENV-UNKNOWN'});
});

test('content scrolling accounts for current position/navbar and respects visibility and reduced motion',()=>{
 const scrolls=[],focus=[];
 const windowRef={scrollY:340,innerHeight:900,matchMedia:()=>({matches:false}),scrollTo:v=>scrolls.push(v)};
 const target={ownerDocument:{querySelector:()=>({getBoundingClientRect:()=>({height:72})})},getBoundingClientRect:()=>({top:640,bottom:680}),setAttribute(){},focus:v=>focus.push(v)};
 scrollToContent(target,{windowRef,ifNeeded:true,focus:true});assert.equal(scrolls.length,0);assert.deepEqual(focus,[{preventScroll:true}]);
 target.getBoundingClientRect=()=>({top:-40,bottom:0});scrollToContent(target,{windowRef,ifNeeded:true});assert.deepEqual(scrolls.pop(),{top:228,left:0,behavior:'smooth'});
 windowRef.matchMedia=()=>({matches:true});scrollToContent(target,{windowRef});assert.equal(scrolls.pop().behavior,'auto');
});


test('Lab entry starts at page top; only related ENV and preview transitions preserve position',()=>{
 const lab={view:'experience-lab'}, env={...lab,environmentId:'ENV-004'}, preview={...env,previewId:'EXP-TEST'}, experience={...env,experienceId:'EXP-TEST'};
 assert.equal(preserveLabViewport({view:'engineering-notes'},lab),false);
 assert.equal(preserveLabViewport(lab,env),false);
 assert.equal(preserveLabViewport(env,preview),true);
 assert.equal(preserveLabViewport(preview,experience),true);
 assert.equal(preserveLabViewport(preview,{...env,experienceId:'OTHER'}),false);
 assert.equal(preserveLabViewport(preview,{...experience,environmentId:'OTHER'}),false);
 assert.equal(preserveLabViewport(experience,preview),false); // Browser history owns restoration on return.
});
