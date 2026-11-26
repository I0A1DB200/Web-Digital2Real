from pathlib import Path
import subprocess,re,json,hashlib
R=Path('/workspace/Web-Digital2Real');W=Path('/workspace/work/frontend-cleanup');issues=[];imports=0;files=list((R/'Frontend').rglob('*.js'))
for f in files:
 run=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
 if run.returncode:issues.append({'file':str(f.relative_to(R)),'syntax':run.stderr})
 for spec in re.findall(r'^\s*(?:import\s+(?:[^\n;]+?\s+from\s+)?|export\s+[^\n;]+?\s+from\s+)[\'"]([^\'"]+)',f.read_text(),re.M):
  if not spec.startswith('.'):continue
  imports+=1;target=f.parent/spec
  if not target.is_file():issues.append({'file':str(f.relative_to(R)),'missing_import':spec})
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();base=json.loads((W/'baseline.json').read_text());protected=[];changed=[]
for f,h in base['files'].items():
 if f.startswith(('content/experiences/','content/environments/','experience-engine/','Frontend/assets/','Frontend/simulators/')) or f.startswith('docs/standards/') or f in base['status']:
  protected.append(f)
  if not (R/f).is_file() or sha(R/f)!=h:changed.append(f)
assert not changed,changed
result={'syntax_files':len(files),'relative_imports':imports,'issues':issues,'protected_files':len(protected),'changed_protected':changed,'all_experiences_environments_player_brand_assets_simulators_unchanged':True};(W/'validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');assert not issues,issues;print(json.dumps(result))
