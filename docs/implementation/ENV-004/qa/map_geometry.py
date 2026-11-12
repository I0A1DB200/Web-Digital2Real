import json,math,time
from playwright.sync_api import sync_playwright
out=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width,height in [(1440,1100),(1280,900),(390,844),(320,844)]:
  page=b.new_page(viewport={'width':width,'height':height},reduced_motion='reduce');page.goto('http://127.0.0.1:8765/#experience-lab');page.wait_for_selector('.environment-card__main');page.locator('.environment-card__main').last.click();stage=page.locator('.environment-stage');stage.scroll_into_view_if_needed();pts=[]
  for m in page.locator('.environment-hotspot').all():
   r=m.bounding_box();s=stage.bounding_box();pts.append([r['x']+r['width']/2-s['x'],r['y']+r['height']/2-s['y'],r['width']])
  pairs=[]
  for i,a in enumerate(pts):
   for j,bp in enumerate(pts[i+1:],i+1):
    dist=math.hypot(a[0]-bp[0],a[1]-bp[1]);margin=dist-(a[2]+bp[2])/2
    if margin<0:pairs.append({'points':[i+1,j+1],'overlap_px':-margin})
  out.append({'width':width,'diameter_px':pts[0][2],'circular_collisions':pairs})
  if width==320:page.screenshot(path='/workspace/work/env004/qa/map-320.png',full_page=True)
  page.close()
 b.close()
open('/workspace/work/env004/qa/map-geometry.json','w').write(json.dumps(out,indent=2));print(json.dumps(out))
