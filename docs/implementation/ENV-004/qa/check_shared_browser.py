import json,time
from playwright.sync_api import sync_playwright
out=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1100})
 for index in [0,2,3]:
  page.goto('http://127.0.0.1:8765/?qa='+str(time.time_ns())+'#experience-lab');page.wait_for_selector('.environment-card__main');page.locator('.environment-card__main').nth(index).click()
  page.locator('.environment-hotspot').first.click();assert page.locator('.environment-popover').count()==1
  locale=page.locator('html').get_attribute('lang');other='es' if locale=='en' else 'en'
  page.locator('.language-selector__option[lang="'+other+'"]').click()
  page.wait_for_function('(lang)=>document.documentElement.lang===lang',arg=other)
  out.append({'environment':['ENV-001','ENV-002','ENV-003','ENV-004'][index],'popover_after_global_locale_click':page.locator('.environment-popover').count(),'environment_retained':page.locator('.environment-stage').get_attribute('data-environment-id')})
 b.close()
open('/workspace/work/env004/qa/shared-browser-observation.json','w').write(json.dumps(out,indent=2))
print(json.dumps(out))
