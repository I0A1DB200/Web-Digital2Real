import json,math,time,os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
W=Path('/workspace/work/env004');Q=W/'qa';M=json.loads(Path('/workspace/Web-Digital2Real/docs/implementation/ENV-004/mapping.json').read_text())
result={'flows':[],'maps':[],'theory':[],'notebook':[],'console_errors':[],'network_errors':[],'screenshots':[]}
if os.environ.get('D2R_QA_RESUME'):
 result=json.loads((Q/'browser-results-progress.json').read_text())
def shot(page,name):
 page.screenshot(path=str(Q/name),full_page=True);result['screenshots'].append(name)
def switch(page,locale):
 page.locator(f'.language-selector__option[lang="{locale}"]').click();expect(page.locator('html')).to_have_attribute('lang',locale)
def open_env(page,locale):
 page.goto('http://127.0.0.1:8765/?qa='+str(time.time_ns())+'#experience-lab');page.wait_for_selector('.environment-card__main');switch(page,locale)
 page.locator('.environment-card__main').filter(has=page.locator('.environment-card__title',has_text='eléctricos' if locale=='es' else 'Electrical')).click()
 page.wait_for_selector('.environment-stage[data-environment-id="ENV-004"]')
def watch(page):
 page.on('pageerror',lambda e:result['console_errors'].append(str(e)))
 page.on('response',lambda r:result['network_errors'].append({'url':r.url,'status':r.status}) if r.status>=400 else None)
 page.on('requestfailed',lambda r:result['network_errors'].append({'url':r.url,'failure':r.failure}))
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width,height in ([(1280,900)] if os.environ.get('D2R_QA_RESUME') else [(1440,1100),(390,844),(1280,900)]):
  ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=width<600,has_touch=width<600,reduced_motion='reduce')
  page=ctx.new_page();watch(page)
  for locale in ['es','en']:
   open_env(page,locale)
   image=page.locator('.environment-stage__image');expect(image).to_be_visible();page.wait_for_function('document.querySelector(".environment-stage__image").naturalWidth===1672')
   bounds=page.locator('.environment-stage').bounding_box();assert abs(bounds['width']/bounds['height']-1672/941)<0.012
   markers=page.locator('.environment-hotspot');assert markers.count()==10
   points=[]
   for i,h in enumerate(M['hotspots']):
    bounds=page.locator('.environment-stage').bounding_box();marker=markers.nth(i);box=marker.bounding_box();cx=box['x']+box['width']/2;cy=box['y']+box['height']/2
    assert abs((cx-bounds['x'])/bounds['width']*100-h['x_percent'])<0.4
    assert abs((cy-bounds['y'])/bounds['height']*100-h['y_percent'])<0.7
    hit=marker.evaluate('(e)=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e}')
    # Scroll into view before checking viewport hit-testing.
    marker.scroll_into_view_if_needed();hit=marker.evaluate('(e)=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e}')
    assert hit,(width,locale,h['id'])
    marker.focus();page.keyboard.press('Enter');expect(marker).to_have_attribute('aria-expanded','true')
    expect(page.locator('.environment-popover')).to_be_visible();page.keyboard.press('Escape');expect(marker).to_be_focused()
    points.append({'id':h['id'],'x':cx-bounds['x'],'y':cy-bounds['y'],'diameter':box['width']})
   overlaps=[]
   for i,a in enumerate(points):
    for b in points[i+1:]:
     if math.hypot(a['x']-b['x'],a['y']-b['y'])<(a['diameter']+b['diameter'])/2:overlaps.append([a['id'],b['id']])
   assert not overlaps,(width,overlaps)
   result['maps'].append({'width':width,'locale':locale,'markers':10,'ratio':bounds['width']/bounds['height'],'circular_overlaps':overlaps,'keyboard':True,'centers_hit_tested':True})
   shot(page,f'map-{width}-{locale}.png')
   # Locale switching keeps an open hotspot.
   markers.first.click();other='en' if locale=='es' else 'es';switch(page,other)
   result.setdefault('locale_popover_observations',[]).append({'width':width,'locale':locale,'preserved':page.locator('.environment-popover').count()>0})
   switch(page,locale);page.keyboard.press('Escape')
   page.locator('.environment-view__header .experience-action--primary').click()
   for j in range(5):
    expect(page.locator('.environment-theory__section')).to_be_visible()
    body=page.locator('.environment-theory__content').inner_text();assert M['notebooks'][j*5]['canonical_id'] in body
    if j==2:
     switch(page,other);expect(page.locator('.environment-theory__content')).to_have_attribute('lang',other)
     assert M['notebooks'][10]['canonical_id'] in page.locator('.environment-theory__content').inner_text();switch(page,locale)
    page.locator('.environment-theory__actions button').click()
   result['theory'].append({'width':width,'locale':locale,'sections':5,'switch_preserves_section':True})
   # Full learner runs at required desktop/mobile widths; intermediate desktop gets map/theory coverage.
   if width==1280:continue
   for i,exp in enumerate(M['experiences']):
    open_env(page,locale);marker=page.locator('.environment-hotspot').nth(i)
    marker.tap() if width<600 else marker.click()
    page.locator('.environment-popover__actions button').first.click()
    expect(page.locator('.experience-introduction')).to_be_visible()
    assert page.locator('.experience-introduction img').count()==0
    page.locator('.experience-introduction .experience-action--primary').click();page.locator('.experience-introduction .experience-action--primary').click()
    for j,letter in enumerate(exp['correct_options']):
     choices=page.locator('.experience-decision');expect(choices).to_have_count(3)
     title=page.locator('.experience-stage-layout h2').first.inner_text();wrong=(ord(letter)-65+1)%3
     choices.nth(wrong).click();expect(page.locator('.experience-decisions + [role="status"]')).to_be_visible()
     assert page.locator('.experience-stage-layout h2').first.inner_text()==title
     if j==2:
      switch(page,other);expect(page.locator('.experience-decision')).to_have_count(3)
      switch(page,locale);assert page.locator('.experience-stage-layout h2').first.inner_text()==title
     choices.nth(ord(letter)-65).click()
    expect(page.get_by_role('heading',name='Debrief técnico' if locale=='es' else 'Technical debrief',exact=True)).to_be_visible()
    assert 'PASS_WITH_GUIDANCE' not in page.locator('body').inner_text() # UI formats underscores as spaces.
    if i in [0,3,9] and locale=='es':shot(page,f'debrief-{width}-{exp["canonical_editorial_id"]}.png')
    result['flows'].append({'width':width,'locale':locale,'id':exp['canonical_editorial_id'],'stages':5,'wrong_retries':5,'completed':True,'language_switch_in_session':True})
    (Q/'browser-results-progress.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print('FLOW',width,locale,exp['canonical_editorial_id'],flush=True)
   # Completion survives reload, while no active session is claimed to survive reload.
   open_env(page,locale);progress=page.locator('.environment-progress').inner_text();assert '10 / 10' in progress
   result.setdefault('persistence',[]).append({'width':width,'locale':locale,'progress':progress})
  ctx.close()
 # Full Notebook content shown through the existing category/carousel/article surfaces.
 for width,height in [(1440,1100),(390,844)]:
  ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=width<600,has_touch=width<600,reduced_motion='reduce')
  page=ctx.new_page();watch(page)
  for locale in ['es','en']:
   page.goto('http://127.0.0.1:8765/?qa='+str(time.time_ns())+'#engineering-notes');page.wait_for_selector('.notebook-carousel');switch(page,locale)
   for b in range(5):
    title=M['notebooks'][b*5]['title_'+locale]
    # Use the category labels from the canonical published module, without introducing routes.
    categories=page.evaluate('async (locale)=>{const m=await import("/generated/notebooks/notebook.js");return m.getNotebook(locale).filter(n=>n.editorial_id?.startsWith("NB-EL-")).map(n=>n.categories[0]);}',locale)
    category=categories[b*5]
    if width<600:
     page.locator('.notebook-carousel__filter-toggle').click();page.locator('.notebook-carousel__filter-menu button',has_text=category).click()
    else:page.locator('.notebook-carousel__filters button',has_text=category).click()
    for k in range(5):
     note=M['notebooks'][b*5+k];card=page.locator('.notebook-carousel__card[aria-current="true"]')
     assert note['title_'+locale] in card.inner_text();card.click()
     dialog=page.locator('.article-viewer');expect(dialog).to_be_visible();expect(dialog).to_have_attribute('lang',locale)
     assert note['title_'+locale] in dialog.inner_text()
     assert ('Comprobación:' if locale=='es' else 'Self-check:') in dialog.inner_text()
     if b==0 and k==0:
      shot(page,f'notebook-{width}-{locale}.png')
      other='en' if locale=='es' else 'es';switch(page,other);expect(dialog).to_have_attribute('lang',other);assert note['title_'+other] in dialog.inner_text();switch(page,locale)
      page.keyboard.press('Tab');assert page.locator('.article-viewer').evaluate('(e)=>e.contains(document.activeElement)')
     page.keyboard.press('Escape');expect(page.locator('.article-viewer')).to_have_count(0)
     expect(page.locator('.notebook-carousel__card[aria-current="true"]')).to_be_focused()
     result['notebook'].append({'width':width,'locale':locale,'id':note['canonical_id'],'full_text':True,'focus_return':True})
     page.locator('.notebook-carousel__control--next').click()
  ctx.close()
 browser.close()
(Q/'browser-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps({'flows':len(result['flows']),'maps':len(result['maps']),'theory':len(result['theory']),'notebook':len(result['notebook']),'console_errors':result['console_errors'],'network_errors':result['network_errors']},ensure_ascii=False),flush=True)
