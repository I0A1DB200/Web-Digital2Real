from pathlib import Path
import json,time,yaml
from playwright.sync_api import sync_playwright,expect
R=Path('/workspace/Web-Digital2Real');W=Path('/workspace/work/ee0037-production');Q=W/'qa';Q.mkdir(exist_ok=True)
config={37:{'correct':[0,0,0,1,0],'results':{0:[3],1:[4],2:[5],3:[6],4:[7]}}}
res={'flows':[],'originals_load':[],'errors':[],'http_errors':[],'screenshots':[],'publication':'BLOCKED_PENDING_HUMAN_TECHNICAL_QA'}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for n,c in config.items():
  case=next((R/'content/experiences/electrical').glob(f'EE-00{n}-*'));intake=json.loads((case/'media-source/visual-intake.json').read_text());names={i+1:a['canonical_file'].split('/')[-1] for i,a in enumerate(intake['assets'])};hidden=[names[i+1] for i,a in enumerate(intake['assets']) if not a['runtime_presented']];author=yaml.safe_load((case/'experience.yaml').read_text())
  for width in [1440,390]:
   for locale in ['es','en']:
    print('flow',n,width,locale,flush=True)
    ctx=browser.new_context(viewport={'width':width,'height':1000 if width==1440 else 844},is_mobile=width==390,has_touch=width==390,reduced_motion='reduce');page=ctx.new_page();requested=[]
    page.on('console',lambda msg:res['errors'].append(msg.text) if msg.type=='error' else None);page.on('pageerror',lambda e:res['errors'].append(str(e)));page.on('response',lambda r:res['http_errors'].append({'url':r.url,'status':r.status}) if r.status>=400 else None);page.on('request',lambda r:requested.append(r.url))
    page.goto('http://127.0.0.1:8878/?qa='+str(time.time_ns())+'#experience-lab');page.wait_for_selector('.environment-card__main');page.locator(f'.language-selector__option[lang="{locale}"]').click();page.locator('.environment-card__main').last.click();assert page.locator('.environment-hotspot').count()==10
    page.locator('.environment-hotspot').nth(n-31).click();page.locator('.environment-popover__actions button').first.click();page.wait_for_selector('.experience-introduction');page.locator('.experience-introduction .experience-action--primary').click()
    expect(page.locator('.experience-introduction img')).to_have_count(1);assert names[1] in page.locator('.experience-introduction img').get_attribute('src');page.wait_for_function('Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)')
    page.screenshot(path=str(Q/f'EE0037-{width}-{locale}-brief.png'),full_page=True);page.locator('.experience-introduction .experience-action--primary').click();page.wait_for_selector('.experience-decision');page.screenshot(path=str(Q/f'EE0037-{width}-{locale}-stage1.png'),full_page=True)
    if n in [34,35,36,37]:assert page.locator('img[src*="'+names[2]+'"]').count()==1
    for index,correct in enumerate(c['correct']):
     if n==35 and index<=2:assert not any(names[6] in url for url in requested)
     if n==35 and index==3:
      expect(page.locator('img[src*="'+names[6]+'"]')).to_have_count(1)
      page.screenshot(path=str(Q/f'EE0035-{width}-{locale}-stage4-cable.png'),full_page=True)
     # No measurement, root-cause or repair image is requested before its earned acquisition.
     for future,ids in c['results'].items():
      if future>=index:
       for number in ids:assert not any(names[number] in url for url in requested),(n,index,names[number])
     options=page.locator('.experience-decision');expect(options).to_have_count(3);title=page.locator('.experience-stage-layout h2').first.inner_text()
     if n in [35,36,37] and index==2:
      body=page.locator('.experience-stage-layout').inner_text()
      for term in (['ausencia de tensión verificada'] if locale=='es' else ['absence of voltage verified']):assert term in body
     for bad in [x for x in range(3) if x!=correct]:
      options.nth(bad).click();expect(page.locator('.experience-decisions + [role="status"]')).to_be_visible();assert page.locator('.experience-result').count()==0;assert page.locator('.experience-stage-layout h2').first.inner_text()==title
     if index==2:
      other='en' if locale=='es' else 'es';page.locator(f'.language-selector__option[lang="{other}"]').click();expect(page.locator('html')).to_have_attribute('lang',other);page.locator(f'.language-selector__option[lang="{locale}"]').click();expect(page.locator('.experience-stage-layout h2').first).to_have_text(title)
     options.nth(correct).click()
     if index in c['results']:
      panel=page.locator('.experience-result');expect(panel).to_be_visible();imgs=panel.locator('img');expect(imgs).to_have_count(len(c['results'][index]));page.wait_for_function('Array.from(document.querySelectorAll(".experience-result img")).every(i=>i.complete&&i.naturalWidth>0)')
      for k,number in enumerate(c['results'][index]):
       img=imgs.nth(k);assert names[number] in img.get_attribute('src');assert img.get_attribute('alt');button=panel.locator('.experience-media__zoom').nth(k);button.click();expect(button).to_have_attribute('aria-expanded','true');assert img.evaluate('(i)=>i.getBoundingClientRect().right<=innerWidth+1');button.click();expect(button).to_have_attribute('aria-expanded','false')
      if n==35 and index==2:assert not any(names[6] in url for url in requested)
      name=f'EE00{n}-{width}-{locale}-D{index+1}.png';page.screenshot(path=str(Q/name),full_page=True);res['screenshots'].append(name);panel.locator('.experience-action--primary').click()
     else:assert page.locator('.experience-result').count()==0
    expect(page.get_by_role('heading',name='Debrief técnico' if locale=='es' else 'Technical debrief',exact=True)).to_be_visible();assert not any(name in url for name in hidden for url in requested)
    refs=sorted(set(__import__('re').findall(r'article-\d+',json.dumps(author['public']['scenario']))));assert refs
    assert page.evaluate('''async(args)=>{const {getNotebook}=await import('/generated/notebooks/notebook.js');return args.refs.every(id=>getNotebook(args.locale).some(n=>n.id===id));}''',{'locale':locale,'refs':refs})
    page.get_by_role('button',name='Reiniciar Experience' if locale=='es' else 'Restart experience',exact=True).click();expect(page.locator('.experience-introduction')).to_be_visible();assert page.locator('.experience-result').count()==0
    res['flows'].append({'experience':n,'width':width,'locale':locale,'five_stages_complete':True,'wrong_retries':10,'result_images':c['results'],'hidden_assets_never_requested':True,'no_early_requests':True,'reset':True,'locale_switch':True,'zoom':True,'ten_hotspots':True,'notebook_refs_resolve':refs});ctx.close()
  # Explicit internal QA checks all registered originals, including hidden ones, outside learner navigation.
  ctx=browser.new_context();page=ctx.new_page()
  for a in intake['assets']:
   response=page.goto('http://127.0.0.1:8878/generated/experience-engine/'+a['src']);assert response.status==200
   dims=page.locator('img').evaluate('(i)=>[i.naturalWidth,i.naturalHeight]');assert dims==[a['width'],a['height']];res['originals_load'].append({'experience':n,'asset':a['runtime_id'],'dimensions':dims})
  ctx.close()
 browser.close()
(Q/'results.json').write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n');assert not res['errors'] and not res['http_errors'];print(json.dumps({'flows':len(res['flows']),'wrong_retries':sum(f['wrong_retries'] for f in res['flows']),'originals_load':len(res['originals_load']),'errors':res['errors'],'http_errors':res['http_errors']}))
