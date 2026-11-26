from pathlib import Path
import json
from playwright.sync_api import sync_playwright,expect
W=Path('/workspace/work/navigation-scroll-followup');Q=W/'qa';Q.mkdir(exist_ok=True);B='http://127.0.0.1:8879/Web-Digital2Real/Frontend/';out={'flows':[],'errors':[],'http_errors':[],'engines':[]}
def settle(page):page.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
def nav(page,width):
 if width<700:page.locator('.topbar__menu-toggle').click()
 page.locator('.topbar__link[data-view="experience-lab"]').click()
with sync_playwright() as p:
 engines=[('chromium',p.chromium)]
 if Path(p.webkit.executable_path).is_file():engines.append(('webkit',p.webkit))
 for engine,factory in engines:
  browser=factory.launch(**({'executable_path':'/usr/bin/chromium','args':['--no-sandbox']} if engine=='chromium' else {}),headless=True);out['engines'].append(engine)
  for width,height in [(390,844),(1280,900),(1440,1100)]:
   for locale in ['es','en']:
    print('flow',engine,width,locale,flush=True);ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='no-preference');page=ctx.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)));page.on('response',lambda r:out['http_errors'].append({'url':r.url,'status':r.status}) if r.status>=400 else None)
    page.add_init_script('window.qaScroll=[];const s=window.scrollTo.bind(window);window.scrollTo=(...a)=>{qaScroll.push(a);return s(...a);};');page.goto(B+'#engineering-notes',wait_until='domcontentloaded');page.wait_for_selector('.editorial-hero__arrow');settle(page)
    assert page.locator('.editorial-hero h1').evaluate('(e)=>e!==document.activeElement');page.locator(f'.language-selector__option[lang="{locale}"]').click();expect(page.locator('html')).to_have_attribute('lang',locale)
    heading=page.locator('.editorial-hero h1');heading.evaluate('(e)=>{e.tabIndex=-1;e.focus({preventScroll:true});}');assert heading.evaluate('(e)=>getComputedStyle(e).outlineStyle')=='none'
    page.screenshot(path=str(Q/f'{engine}-{width}-{locale}-hero.png'))
    arrow=page.locator('.editorial-hero__arrow');arrow.focus();page.keyboard.press('Tab');page.keyboard.press('Shift+Tab');assert arrow.evaluate('(e)=>e===document.activeElement');assert arrow.evaluate('(e)=>getComputedStyle(e).outlineStyle')=='solid'
    page.keyboard.press('Enter');page.wait_for_function('document.querySelector("#notes-title")===document.activeElement');assert page.locator('#notes-title').evaluate('(e)=>getComputedStyle(e).outlineStyle')=='none'
    nav(page,width);page.wait_for_selector('.environment-card__main');page.wait_for_function('Math.abs(scrollY)<2');settle(page);assert not page.locator('.simulator-catalog-section').evaluate('(e)=>e.hidden');assert page.evaluate('qaScroll.at(-1)[0].top')==0
    page.screenshot(path=str(Q/f'{engine}-{width}-{locale}-lab-top.png'))
    page.locator('.environment-card__main').last.click();page.wait_for_selector('.environment-hotspot');page.wait_for_function('location.hash.endsWith("/env/ENV-004")');settle(page);assert page.locator('.simulator-catalog-section').evaluate('(e)=>e.hidden')
    page.locator('.environment-hotspot').nth(6).scroll_into_view_if_needed();prior=page.evaluate('scrollY');page.locator('.environment-hotspot').nth(6).click();page.wait_for_selector('.environment-popover');settle(page);preview=page.evaluate('scrollY');assert abs(preview-prior)<2
    page.screenshot(path=str(Q/f'{engine}-{width}-{locale}-preview.png'));calls=page.evaluate('qaScroll.length');page.locator('.environment-popover__actions button').first.click();page.wait_for_selector('.experience-introduction');page.wait_for_function('location.hash.includes("/experience/")');settle(page);after=page.evaluate('scrollY');print('positions',preview,after,flush=True)
    assert abs(after-preview)<2,('EE viewport moved',width,locale,preview,after);assert page.evaluate('qaScroll.length')==calls;assert page.locator('.simulator-catalog-section').evaluate('(e)=>e.hidden')
    page.screenshot(path=str(Q/f'{engine}-{width}-{locale}-ee-entry.png'))
    length=page.evaluate('history.length');page.locator('.experience-introduction .experience-action--primary').click();page.locator('.experience-introduction .experience-action--primary').click();page.wait_for_selector('.experience-decision');page.locator('.experience-decision').nth(1).click();expect(page.locator('.experience-decisions + [role="status"]')).to_be_visible();page.locator('.experience-decision').first.click();page.wait_for_selector('.experience-result');body=page.locator('.experience-result').inner_text();assert page.evaluate('history.length')==length
    page.go_back();page.wait_for_selector('.environment-popover');settle(page);print('BACK',preview,page.evaluate('({y:scrollY,state:history.state,calls:qaScroll.slice(-5)})'),flush=True);assert abs(page.evaluate('scrollY')-preview)<2;page.go_forward();page.wait_for_selector('.experience-result');assert page.locator('.experience-result').inner_text()==body
    nav(page,width);page.wait_for_selector('.environment-card__main');page.wait_for_function('Math.abs(scrollY)<2');nav(page,width);page.wait_for_function('Math.abs(scrollY)<2');settle(page);assert not page.locator('.simulator-catalog-section').evaluate('(e)=>e.hidden')
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');out['flows'].append({'engine':engine,'width':width,'locale':locale,'no_heading_outline':True,'keyboard_button_focus_visible':True,'lab_starts_at_top':True,'preview_scroll':preview,'ee_scroll':after,'ee_does_not_scroll':True,'back_forward_preserves_session':True,'no_overflow':True});ctx.close()
  browser.close()
(W/'browser-results.json').write_text(json.dumps(out,indent=2)+'\n');assert not out['errors'] and not out['http_errors'];print(json.dumps({'flows':len(out['flows']),'engines':out['engines'],'errors':out['errors'],'http_errors':out['http_errors']}))
