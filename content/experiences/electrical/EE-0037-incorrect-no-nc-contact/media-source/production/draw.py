from pathlib import Path
import json,shutil,subprocess,html
R=Path('/workspace/Web-Digital2Real');W=Path('/workspace/work/ee0037-production');P=R/'content/experiences/electrical/EE-0037-incorrect-no-nc-contact';D=P/'media-source/production';A=P/'assets';A.mkdir(exist_ok=True);(D/'originals').mkdir(exist_ok=True)
photos={1:'0943d020-3e18-4197-9783-2e1d4dd80d8a',3:'d2811d27-225c-4a00-a003-c193bfdbf211',5:'f0458f19-2863-446e-9dfc-0d1c6282a3a4',6:'c9517b34-e8e8-499c-9ca1-4d51d5d02be2'}
for i,u in photos.items():shutil.copy2(Path('/workspace/generated_images')/f'exec-{u}.png',A/f'EE-0037_ART-{i:03}.png')
shutil.copy2('/workspace/generated_images/exec-ba09a205-5893-450f-a405-42f9aabd08d9.png',D/'originals/ART003-rejected-missing-screws.png')
net={'nodes':{'N1':['Uc','S3:21'],'N2':['S3:22','START:13','KM3aux:13'],'N3':['START:14','KM3aux:14','KM3:A1'],'N4':['KM3:A2','return_Uc']},'contacts':[{'id':'S3','kind':'NC','a':'N1','b':'N2'},{'id':'START','kind':'NO','a':'N2','b':'N3'},{'id':'KM3aux','kind':'NO','a':'N2','b':'N3'}],'coil':{'a':'N3','b':'N4'},'limits':'Functional illustrative extract; Uc unspecified; protection and power upstream omitted; no PE return.'}
(D/'connections.json').write_text(json.dumps(net,indent=2))
class SVG:
 def __init__(self):self.x=['<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><rect width="1600" height="1000" fill="white"/><style>text{font-family:DejaVu Sans,sans-serif;fill:#18374a} .wire{fill:none;stroke:#24638b;stroke-width:3;stroke-linejoin:round;stroke-linecap:round}</style>']
 def text(self,x,y,s,size=27,anchor='start',color=None):self.x.append(f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}"'+(f' style="fill:{color}"' if color else '')+'>'+html.escape(s)+'</text>')
 def line(self,pts,id=''):self.x.append(f'<polyline class="wire" '+(f'id="{id}" ' if id else '')+'points="'+' '.join(f'{x},{y}' for x,y in pts)+'"/>')
 def rect(self,x,y,w,h):self.x.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="none" stroke="#24638b" stroke-width="3"/>')
 def dot(self,x,y):self.x.append(f'<circle cx="{x}" cy="{y}" r="6" fill="#24638b"/>')
 def contact(self,x,y,nc=False,name=""):
  self.x.append(f'<g data-contact="{name}" data-kind="{"NC" if nc else "NO"}">')
  self.line([(x,y-60),(x,y-15)]);self.line([(x,y+15),(x,y+60)])
  self.line([(x,y+15),(x+(0 if nc else 32),y-15)])
  for yy in [y-15,y+15]:self.x.append(f'<circle cx="{x}" cy="{yy}" r="4" fill="white" stroke="#24638b" stroke-width="3"/>')
  self.x.append("</g>")
 def save(self,i):
  f=D/f'EE-0037_ART-{i:03}.svg';f.write_text(''.join(self.x)+'</svg>');subprocess.run(['inkscape',str(f),'--export-type=png',f'--export-filename={A/f"EE-0037_ART-{i:03}.png"}'],check=True,capture_output=True)
s=SVG();s.text(85,80,'S3 / KM3',36);s.text(85,123,'Extracto funcional previsto · Intended control extract',24);s.text(85,162,'Uc sin valor asignado / Uc unspecified · Potencia y protección fuera del extracto / Power and protection omitted',19)
s.line([(370,225),(370,280)],'N1');s.text(300,242,'Uc',25);s.contact(370,340,True,"S3");s.text(270,324,'21',23);s.text(270,380,'22',23);s.text(440,345,'S3 · STOP · NC',29)
s.line([(370,400),(370,455),(650,455)],'N2');s.line([(370,455),(370,500)]);s.line([(650,455),(650,500)]);s.dot(370,455)
s.contact(370,560,name="START");s.contact(650,560,name="KM3aux");s.text(155,565,'START · NO',26);s.text(705,565,'KM3 · NO',26)
for x in [370,650]:s.text(x-55,520,'13',21);s.text(x-55,610,'14',21)
s.line([(370,620),(370,675),(650,675),(650,620)],'N3');s.dot(370,675);s.line([(370,675),(370,730)]);s.rect(330,730,80,75);s.text(440,777,'KM3',29);s.text(275,739,'A1',23);s.text(275,810,'A2',23);s.line([(370,805),(370,860),(820,860)],'N4');s.text(850,870,'Retorno Uc / Uc return',24)
s.text(90,940,'Reposo representado / Contacts shown at rest · START y KM3 en paralelo; S3 en serie con ambos.',22);s.save(2)
s=SVG();s.text(90,90,'S3 · NO 13–14',38);s.text(90,137,'Registro de estados simulado / Simulated state record',26)
for x,down in [(110,False),(850,True)]:
 s.text(x,240,'PULSADO / PRESSED' if down else 'REPOSO / RELEASED',30);s.rect(x,275,620,460)
 s.text(x+310,340,'13–14',30,'middle');s.line([(x+130,490),(x+265,490)]);s.line([(x+355,490),(x+490,490)]);s.line([(x+265,490),(x+355,490 if down else 425)])
 for xx in [x+265,x+355]:s.dot(xx,490)
 s.text(x+310,580,'CERRADO / CLOSED' if down else 'ABIERTO / OPEN',26,'middle');s.text(x+310,675,'Permiso / Permission = '+str(int(down)),25,'middle')
s.text(90,825,'El permiso no es una orden START / Permission is not a START command',28);s.text(90,890,'Estado funcional del caso; conexión instalada todavía pendiente de confirmar.',24);s.text(90,930,'Authored functional state; installed connection still requires confirmation.',24);s.save(4)
s=SVG();s.text(85,85,'START / STOP / KM3',38);s.text(85,133,'Verificación funcional simulada / Simulated functional verification',26)
headers=[('Paso / Step',95),('START',710),('S3 STOP',995),('KM3',1335)]
for t,x in headers:s.text(x,230,t,26)
rows=[('1 · Reposo / Released',0,0,0),('2 · Pulsar START / Press START',1,0,1),('3 · Soltar START / Release START',0,0,1),('4 · Pulsar STOP / Press STOP',0,1,0),('5 · Soltar STOP / Release STOP',0,0,0)]
record=[]
for i,(t,start,stop,km) in enumerate(rows):
 y=320+i*105;s.line([(85,y+38),(1500,y+38)]);s.text(95,y,t,25)
 for x,v in [(750,start),(1040,stop),(1360,km)]:s.text(x,y,str(v),32)
 record.append({'step':i+1,'START_pressed':bool(start),'STOP_pressed':bool(stop),'KM3_on':bool(km)})
s.text(85,875,'0 = no pulsado / released; 1 = pulsado / pressed · KM3: 0 OFF, 1 ON',22);s.text(85,925,'STOP prevalece; soltar STOP no rearranca / STOP overrides; releasing STOP does not restart',24);s.save(7)
(D/'functional-record.json').write_text(json.dumps({'type':'authored_simulation_not_measurement','initial_KM3':False,'rows':record},indent=2))
print('7 final assets; 3 SVG sources; connections and functional record saved')
