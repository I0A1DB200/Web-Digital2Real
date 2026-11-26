from pathlib import Path
from playwright.sync_api import sync_playwright
import json
W=Path('/workspace/work/navigation-scroll-followup')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce');page.goto('http://127.0.0.1:8879/Web-Digital2Real/Frontend/#engineering-notes',wait_until='domcontentloaded');page.wait_for_selector('.editorial-hero__arrow');page.locator('.language-selector__option[lang="es"]').click();page.wait_for_function('document.documentElement.lang==="es"');h=page.locator('.editorial-hero h1');h.evaluate('(e)=>{e.tabIndex=-1;e.focus({preventScroll:true});}');assert h.evaluate('(e)=>getComputedStyle(e).outlineStyle')=='none';page.screenshot(path=str(W/'qa/reduced-390-es-hero.png'));page.locator('.editorial-hero__arrow').click();page.locator('.topbar__menu-toggle').click();page.locator('.topbar__link[data-view="experience-lab"]').click();page.wait_for_selector('.environment-card__main');page.wait_for_function('Math.abs(scrollY)<2');page.screenshot(path=str(W/'qa/reduced-390-es-lab-top.png'));out={'reduced_motion':True,'heading_outline':'none','lab_scroll':page.evaluate('scrollY')};b.close()
(W/'reduced-results.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
