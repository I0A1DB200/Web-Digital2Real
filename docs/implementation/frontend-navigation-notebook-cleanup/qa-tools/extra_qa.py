from pathlib import Path
from playwright.sync_api import sync_playwright,expect
import json
W=Path('/workspace/work/frontend-cleanup');B='http://127.0.0.1:8879/Web-Digital2Real/Frontend/';out={}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);ctx=b.new_context(viewport={'width':1440,'height':1100},reduced_motion='no-preference');page=ctx.new_page();page.add_init_script('window.qaCalls=[];const s=window.scrollTo.bind(window);window.scrollTo=(...v)=>{qaCalls.push(v);return s(...v);};');page.goto(B+'#engineering-notes',wait_until='domcontentloaded');page.locator('.editorial-hero__arrow').click();assert page.evaluate('qaCalls.at(-1)[0].behavior')=='smooth';out['normal_motion_arrow_smooth']=True
 page.goto(B+'#experience-lab/env/ENV-004/theory/2',wait_until='domcontentloaded');page.wait_for_selector('.environment-theory__section');assert '2 / 5' in page.locator('.environment-theory__section').inner_text();page.locator('.environment-theory__actions button').click();page.wait_for_function('location.hash.endsWith("/theory/3")');page.go_back();page.wait_for_function('location.hash.endsWith("/theory/2")');page.wait_for_function('document.querySelector(".environment-theory__section")?.textContent.includes("2 / 5")');page.reload(wait_until='domcontentloaded');page.wait_for_function('document.querySelector(".environment-theory__section")?.textContent.includes("2 / 5")');out['theory_deep_link_progress_back_reload']=True
 # A delayed failed artifact request presents the Workspace error without an unhandled rejection.
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.route('**/EXP-ELECTRICAL-CONTACT-037*.json',lambda route:route.fulfill(status=503,content_type='application/json',body='{}'))
 page.goto(B+'#experience-lab/env/ENV-004/experience/EXP-ELECTRICAL-CONTACT-037',wait_until='domcontentloaded');page.wait_for_selector('.experience-workspace [role="alert"]');assert not errors,errors;out['artifact_failure_accessible_no_unhandled_error']=True
 ctx.close();b.close()
(W/'extra-results.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
