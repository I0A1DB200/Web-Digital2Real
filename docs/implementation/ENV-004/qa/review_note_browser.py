import json,time
from playwright.sync_api import sync_playwright,expect
W='/workspace/work/env004/qa/';out=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width,height in [(1440,1100),(390,844)]:
  page=b.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
  for locale in ['es','en']:
   page.goto('http://127.0.0.1:8765/?qa='+str(time.time_ns())+'#engineering-notes');page.wait_for_selector('.notebook-carousel');page.locator('.language-selector__option[lang="'+locale+'"]').click()
   category='Fundamentos eléctricos y medición' if locale=='es' else 'Electrical fundamentals and measurement'
   if width<600:page.locator('.notebook-carousel__filter-toggle').click();page.locator('.notebook-carousel__filter-menu button',has_text=category).click()
   else:page.locator('.notebook-carousel__filters button',has_text=category).click()
   page.locator('.notebook-card[aria-current="true"]').click();text='Preview textual · revisión técnica pendiente' if locale=='es' else 'Text preview · technical review pending'
   expect(page.locator('.article-viewer')).to_contain_text(text)
   page.locator('.article-section--engineering-note').first.scroll_into_view_if_needed();page.screenshot(path=W+f'notebook-{width}-{locale}.png',full_page=True)
   out.append({'width':width,'locale':locale,'visible_review_note':True})
  page.close()
 b.close()
open(W+'review-note-browser.json','w').write(json.dumps(out,indent=2));print(json.dumps(out))
