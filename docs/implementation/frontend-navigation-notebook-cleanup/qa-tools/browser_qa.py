from pathlib import Path
import json
from playwright.sync_api import sync_playwright,expect
W=Path('/workspace/work/frontend-cleanup');Q=W/'qa';BASE='http://127.0.0.1:8879/Web-Digital2Real/Frontend/';ENV='#experience-lab/env/ENV-004';ID='EXP-ELECTRICAL-CONTACT-037';PRE=ENV+'/preview/'+ID;EXP=ENV+'/experience/'+ID
result={'flows':[],'errors':[],'http_errors':[],'screenshots':[]}
def shot(page,name):page.screenshot(path=str(Q/name));result['screenshots'].append(name)
def ready(page,hash,selector):
 page.wait_for_function('(h)=>location.hash===h',arg=hash);page.wait_for_selector(selector);page.evaluate('()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')
def nav(page,view,width):
 if width<700:page.locator('.topbar__menu-toggle').click()
 page.locator(f'.topbar__link[data-view="{view}"]').click()
def pos(page):return page.evaluate('scrollY')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width,height in [(390,844),(1280,900),(1440,1100)]:
  for locale in ['es','en']:
   print('flow',width,locale,flush=True);ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');page=ctx.new_page()
   page.on('pageerror',lambda e:result['errors'].append(str(e)));page.on('response',lambda r:result['http_errors'].append({'url':r.url,'status':r.status}) if r.status>=400 else None)
   page.add_init_script('''window.qaScrollCalls=[];const nativeScroll=window.scrollTo.bind(window);window.scrollTo=(...args)=>{window.qaScrollCalls.push(args);return nativeScroll(...args);};''')
   page.goto(BASE+'#engineering-notes',wait_until='domcontentloaded');page.wait_for_selector('.editorial-hero__arrow');page.locator(f'.language-selector__option[lang="{locale}"]').click();expect(page.locator('html')).to_have_attribute('lang',locale)
   assert page.locator('.editorial-hero p,.editorial-hero__support,.section-introduction p').count()==0
   assert page.locator('.editorial-hero h1').evaluate('(e)=>(e.querySelector(".hero-text-reveal__accessible")??e).textContent')==('Aprende automatización industrial a través de la ingeniería real.' if locale=='es' else 'Learn Industrial Automation Through Real Engineering.')
   assert page.locator('.brand__image').get_attribute('src').endswith('d2r-logo-editorial-dark.png');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   shot(page,f'after-home-{width}-{locale}.png');length=page.evaluate('history.length');page.locator('.editorial-hero__arrow').focus();page.keyboard.press('Enter');assert page.evaluate('history.length')==length;assert page.evaluate('location.hash')=='#engineering-notes'
   assert page.evaluate('window.qaScrollCalls.at(-1)[0].behavior')=='auto';assert page.locator('#notes-title').evaluate('(e)=>e===document.activeElement');assert page.locator('#notes-title').bounding_box()['y']>=page.locator('.topbar').bounding_box()['height']-1
   assert page.locator('.notebook-card[aria-current="true"]').get_attribute('aria-setsize')=='8';shot(page,f'after-notebook-{width}-{locale}.png')
   card=page.locator('.notebook-card[aria-current="true"]');card.click();page.wait_for_selector('.article-viewer');assert page.locator('.article-viewer__identity,.article-viewer__masthead').count()==0;assert page.locator('.article-viewer__header').locator(':scope > :first-child').get_attribute('class')=='article-viewer__title-block';shot(page,f'after-article-{width}-{locale}.png');page.keyboard.press('Escape');expect(page.locator('.article-viewer')).to_have_count(0);assert page.locator('.notebook-card[aria-current="true"]').evaluate('(e)=>e===document.activeElement')
   nav(page,'experience-lab',width);ready(page,'#experience-lab','.environment-card__main');catalog_length=page.evaluate('history.length');page.locator('.environment-card__main').last.click();ready(page,ENV,'.environment-hotspot');assert page.locator('.environment-hotspot').count()==10
   page.locator('.environment-hotspot').nth(6).scroll_into_view_if_needed();before=pos(page);calls=page.evaluate('window.qaScrollCalls.length');page.locator('.environment-hotspot').nth(6).click();ready(page,PRE,'.environment-popover');assert abs(pos(page)-before)<2,(width,locale,'preview moved',before,pos(page));assert page.evaluate('window.qaScrollCalls.length')==calls
   shot(page,f'after-preview-{width}-{locale}.png');preview_position=pos(page);page.locator('.environment-popover__actions button').first.click();ready(page,EXP,'.experience-introduction');heading=page.locator('.experience-workspace h1').bounding_box();assert heading['y']>=page.locator('.topbar').bounding_box()['height']-1
   page.locator('.experience-introduction .experience-action--primary').click();page.locator('.experience-introduction .experience-action--primary').click();page.wait_for_selector('.experience-decision');initial_history=page.evaluate('history.length');stage_title=page.locator('.experience-stage-layout h2').first.inner_text()
   page.locator('.experience-decision').nth(1).click();expect(page.locator('.experience-decisions + [role="status"]')).to_be_visible();assert page.evaluate('history.length')==initial_history
   page.locator('.experience-decision').first.click();page.wait_for_selector('.experience-result');result_text=page.locator('.experience-result').inner_text();result_position=pos(page);assert page.evaluate('history.length')==initial_history
   page.go_back();ready(page,PRE,'.environment-popover');assert abs(pos(page)-preview_position)<2,(width,'preview restoration',pos(page),preview_position)
   page.go_back();ready(page,ENV,'.environment-hotspot');assert abs(pos(page)-before)<2;assert page.locator('.environment-hotspot').nth(6).evaluate('(e)=>e===document.activeElement')
   page.go_back();ready(page,'#experience-lab','.environment-card__main');page.go_back();ready(page,'#engineering-notes','.notebook-card[aria-current="true"]');page.go_forward();ready(page,'#experience-lab','.environment-card__main');page.go_forward();ready(page,ENV,'.environment-hotspot');page.go_forward();ready(page,PRE,'.environment-popover');page.go_forward();ready(page,EXP,'.experience-result');assert page.locator('.experience-result').inner_text()==result_text;assert abs(pos(page)-result_position)<2
   # Global ES/EN guard replays the same accepted commands, without changing route/history.
   other='en' if locale=='es' else 'es';page.locator(f'.language-selector__option[lang="{other}"]').click();expect(page.locator('html')).to_have_attribute('lang',other);expect(page.locator('.experience-result')).to_be_visible();page.locator(f'.language-selector__option[lang="{locale}"]').click();expect(page.locator('html')).to_have_attribute('lang',locale);assert page.evaluate('location.hash')==EXP
   # Correct remaining path; decisions/results must not create route entries.
   for index,correct in [(1,0),(2,0),(3,1),(4,0)]:
    page.locator('.experience-result .experience-action--primary').click();page.wait_for_selector('.experience-decision');page.locator('.experience-decision').nth(correct).click();page.wait_for_selector('.experience-result')
   page.locator('.experience-result .experience-action--primary').click();expect(page.get_by_role('heading',name='Debrief técnico' if locale=='es' else 'Technical debrief',exact=True)).to_be_visible();assert page.evaluate('history.length')==initial_history;shot(page,f'after-completion-{width}-{locale}.png')
   page.locator('.experience-header .experience-action').click();ready(page,PRE,'.environment-popover');page.locator('.environment-popover__actions button').last.click();ready(page,ENV,'.environment-hotspot');page.locator('.experience-workspace .experience-action--quiet').first.click();ready(page,'#experience-lab','.environment-card__main')
   # Standalone simulator remains independent and opens at the repository subpath.
   page.locator('.simulator-card').first.scroll_into_view_if_needed();page.locator('.simulator-card__main').first.click();page.wait_for_selector('.simulator-viewer iframe');assert 'simulators/' in page.locator('.simulator-viewer iframe').get_attribute('src');page.keyboard.press('Escape');expect(page.locator('.simulator-viewer')).to_have_count(0)
   # Deep routes / reload resolve navigation; in-memory pedagogical session deliberately restarts on reload.
   page.goto(BASE+PRE,wait_until='domcontentloaded');ready(page,PRE,'.environment-popover');page.reload(wait_until='domcontentloaded');ready(page,PRE,'.environment-popover')
   page.goto(BASE+EXP,wait_until='domcontentloaded');ready(page,EXP,'.experience-introduction');page.reload(wait_until='domcontentloaded');ready(page,EXP,'.experience-introduction');assert page.locator('.experience-result').count()==0
   page.goto(BASE+ENV+'/experience/UNKNOWN',wait_until='domcontentloaded');ready(page,ENV,'.environment-hotspot');page.goto(BASE+'#experience-lab/env/UNKNOWN',wait_until='domcontentloaded');ready(page,'#experience-lab','.environment-card__main');page.goto(BASE+'#%ZZ',wait_until='domcontentloaded');ready(page,'#engineering-notes','.editorial-hero__arrow');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   result['flows'].append({'width':width,'height':height,'locale':locale,'hero_arrow_keyboard_no_history':True,'notebook_eight_notes_and_article_cleanup':True,'preview_scroll_preserved':True,'back_forward_full_hierarchy_session_preserved':True,'scroll_and_focus_restored':True,'decisions_do_not_push_history':True,'full_completion':True,'internal_parent_buttons':True,'deep_link_and_reload':True,'unknown_routes_controlled':True,'locale_preserves_route_session':True,'simulator':True});ctx.close()
 browser.close()
(W/'browser-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');assert not result['errors'] and not result['http_errors'];print(json.dumps({'flows':len(result['flows']),'screenshots':len(result['screenshots']),'errors':result['errors'],'http_errors':result['http_errors']}))
