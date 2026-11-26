from pathlib import Path
import json,html,subprocess
R=Path(__file__).resolve().parents[4]
class Sheet:
 def __init__(self,n,blue=False):
  self.n=n;self.p=next((R/'content/experiences/electrical').glob(f'EE-00{n}-*'));self.dir=self.p/'media-source/corrections';self.dir.mkdir(exist_ok=True);self.c='#1419a2' if blue else '#202020';self.items=['<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1500 1000"><rect width="1500" height="1000" fill="white"/>'];self.ports={};self.wires=[]
 def line(self,pts,color=None,dash=None,extra=''):
  self.items.append('<polyline points="'+' '.join(f'{x},{y}' for x,y in pts)+'" fill="none" stroke="'+(color or self.c)+'" stroke-width="2"'+(f' stroke-dasharray="{dash}"' if dash else '')+' '+extra+'/>')
 def text(self,x,y,s,size=21,color=None,anchor='start'):
  self.items.append(f'<text x="{x}" y="{y}" fill="{color or self.c}" font-family="Arial, sans-serif" font-size="{size}" text-anchor="{anchor}">{html.escape(s)}</text>')
 def box(self,x,y,w,h,dash=None):
  self.items.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" stroke="{self.c}" stroke-width="2"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>')
 def port(self,name,x,y,label=None,dx=8,dy=-10):
  assert name not in self.ports;self.ports[name]=[x,y];self.items.append(f'<circle data-port="{name}" cx="{x}" cy="{y}" r="5" fill="white" stroke="{self.c}" stroke-width="2"/>');
  if label:self.text(x+dx,y+dy,label,18)
 def wire(self,a,b,via=[],color=None):
  pts=[self.ports[a],*via,self.ports[b]];key=f'W{len(self.wires)+1:02}';self.wires.append({'id':key,'from':a,'to':b,'points':pts,'color':color or self.c});self.line(pts,color,extra=f'data-wire="{key}" data-from="{a}" data-to="{b}"')
 def ground(self,x,y):
  self.line([(x,y),(x,y+15)]);self.line([(x-16,y+15),(x+16,y+15)]);self.line([(x-11,y+21),(x+11,y+21)]);self.line([(x-5,y+27),(x+5,y+27)])
 def save(self,filename,checks):
  if self.n==36:
   for x,y,color in [(565,520,'#d51e2a'),(705,930,self.c),(590,930,self.c)]:self.items.append(f'<circle cx="{x}" cy="{y}" r="3.5" fill="{color}"/>')
  if self.n==35:
   for x in [490,740,990,1240]:self.items.append(f'<circle cx="{x}" cy="945" r="3.5" fill="{self.c}"/>')
  self.items.append('</svg>');svg=self.dir/'ART-002.svg';svg.write_text('\n'.join(self.items)+'\n');net={'experience':f'EE-00{self.n}','artifact':'ART-002','ports':self.ports,'wires':self.wires,'checks':checks,'scope':'Functional circuit extract; external K1 control and unused IO are not invented. Component internals are not wire shorts.'};(self.dir/'ART-002-connections.json').write_text(json.dumps(net,indent=2)+'\n');subprocess.run(['inkscape',str(svg),'--export-type=png','--export-filename='+str(self.p/'assets'/filename)],check=True,stdout=subprocess.DEVNULL)
# Existing EE-0035 layout: upper supply, selection block, four protected branches.
s=Sheet(35);s.text(70,75,'230 VAC');s.box(260,100,115,160);s.text(280,85,'Q1',25);s.box(480,80,390,215);s.text(620,115,'PS1',26);s.text(535,150,'SITOP PSU100S',22);s.text(535,180,'24 VDC / 10 A',21);s.line([(620,210),(720,210),(720,260),(620,260),(620,210)]);s.line([(620,260),(720,210)]);s.text(632,233,'~');s.text(683,253,'=')
for y,k in [(130,'L'),(200,'N'),(270,'PE')]:
 s.port('AC:'+k,90,y,k,dx=-35);s.port('PS1:'+k,480,y,k)
 if k!='PE':
  s.port('Q1:'+k+'in',260,y);s.port('Q1:'+k+'out',375,y);s.wire('AC:'+k,'Q1:'+k+'in');s.line([(275,y),(305,y-25)]);s.line([(320,y),(360,y)]);s.line([(260,y),(275,y)]);s.wire('Q1:'+k+'out','PS1:'+k)
 else:s.wire('AC:PE','PS1:PE');s.ground(150,y)
s.port('PS1:+',870,180,'+24 V');s.port('PS1:0',870,260,'0 V');s.box(390,400,990,210);s.text(700,445,'F24 — SITOP PSE200U',25);s.text(740,478,'6EP1961-2BA11',21);s.text(995,505,'4 × 0.5…3 A',19)
s.port('F24:+',550,400,'+24 V',-65,-15);s.port('F24:0',720,400,'0 V',10,-15);s.wire('PS1:+','F24:+',[[960,180],[960,340],[550,340]]);s.wire('PS1:0','F24:0',[[1470,260],[1470,360],[720,360]])
# Separate 0 V trunk goes directly back to PS1, never through F24.
s.port('ZERO',1000,945);s.wire('PS1:0','ZERO',[[1470,260],[1470,945]])
for x,k in [(1030,'RST'),(1130,'11'),(1220,'12'),(1310,'14')]:s.port('F24:'+k,x,400,k,5,-15)
# Floating changeover signal, normal/deenergized contact 11–12; external wiring intentionally absent.
s.line([(1130,405),(1130,455),(1190,455),(1220,425)]);s.line([(1220,400),(1220,425)]);s.line([(1310,400),(1310,455),(1250,455)])
for i,(x,setting,label) in enumerate([(490,'2.0 A','PLC S7-1200'),(740,'0.5 A','Y2'),(990,'1.0 A','SENSORES'),(1240,'1.0 A','RELÉS AUX.')],1):
 s.text(x,540,f'F24.{i}',23,anchor='middle');s.text(x,575,setting,20,anchor='middle');s.port(f'F24:OUT{i}',x,610,str(i),-25,23);s.box(x-90,800,180,105);s.text(x,840,label,21,anchor='middle');s.port(label+':+',x,800);s.port(label+':0',x,905);s.wire(label+':0','ZERO',[[x,945]])
 if i!=2:s.wire(f'F24:OUT{i}',label+':+')
 else:
  s.port('K1:13',x,680,'13');s.port('K1:14',x,745,'14');s.wire('F24:OUT2','K1:13');s.line([(x,680),(x+30,705)]);s.line([(x,745),(x,725)]);s.text(x+45,722,'K1');s.wire('K1:14','Y2:+');s.box(x-25,850,50,30);s.line([(x-25,880),(x+25,850)])
# Reference text describes scope, no claims of physical layout or real commissioning.
s.text(400,985,'K1: contacto de mando; circuito de bobina fuera de este extracto.',17)
s.save('EE-0035_ART-002_esquema.png',{'same_net':[['PS1:+','F24:+'],['PS1:0','F24:0'],['PS1:0','Y2:0'],['F24:OUT2','K1:13'],['K1:14','Y2:+']],'different_net':[['PS1:+','PS1:0'],['F24:OUT1','F24:OUT2'],['F24:OUT2','Y2:+'],['F24:OUT3','F24:OUT4']],'series_switch':['K1:13','K1:14'],'fault_segment':'K1:14 → Y2:+ / Y2:0; no fault drawn in initial-context schematic'})
# EE-0036: EPLAN-style thin lines, blue designations, separated potentials.
s=Sheet(36,True);s.box(15,15,1470,970);s.line([(15,50),(1485,50)],'#156b20');
for i in range(1,11):s.text(80+i*130,40,str(i),18,'#156b20')
s.text(70,115,'~230 VAC');s.text(70,140,'50 Hz',19);s.text(260,85,'L');s.text(320,85,'N');s.text(380,85,'PE')
for x,k in [(260,'L'),(320,'N'),(380,'PE')]:s.port('AC:'+k,x,100)
s.box(225,190,130,120);s.text(110,220,'QF1',24);s.text(110,248,'2P',19)
for x,k in [(260,'L'),(320,'N')]:
 s.port('QF1:'+k+'in',x,190);s.port('QF1:'+k+'out',x,310);s.wire('AC:'+k,'QF1:'+k+'in',color='#d51e2a');s.line([(x,190),(x,225),(x+22,252)]);s.line([(x,270),(x,310)])
s.box(110,400,300,270,'8 5');s.text(140,445,'PS1',25);s.text(140,480,'SITOP PSU100S',22);s.text(140,512,'24 VDC / 10 A',21)
for x,k in [(260,'L'),(320,'N'),(380,'PE')]:s.port('PS1:'+k,x,400,k);s.wire(('AC:' if k=='PE' else 'QF1:')+k+('' if k=='PE' else 'out'),'PS1:'+k,color='#188224' if k=='PE' else '#d51e2a')
s.port('PS1:+',225,670,'+24 V',-55,30);s.port('PS1:0',335,670,'0 V',-10,30);s.port('F24:in',470,715);s.port('F24:out',535,715);s.box(470,704,65,22);s.text(475,675,'F24',23);s.text(478,696,'2 A',17);s.wire('PS1:+','F24:in',[[225,715]],'#d51e2a')
s.box(600,180,800,300,'8 5');s.text(625,215,'PLC1 — S7-1200',27);s.text(625,245,'CPU 1214C DC/DC/DC',23);s.text(625,270,'DQ PNP',19)
s.port('PLC:L+',640,330,'L+',-13,-15);s.port('PLC:M',705,330,'M',-12,-15);s.port('PLC:FE',770,330,'FE',-15,-15);s.wire('F24:out','PLC:L+',[[565,715],[565,330]],'#d51e2a');s.wire('PS1:0','PLC:M',[[335,930],[705,930]])
s.wire('AC:PE','PLC:FE',[[445,100],[445,350],[770,350]],'#188224')
s.port('PLC:3L+',850,330,'3L+',-20,-15);s.port('PLC:3M',920,330,'3M',-16,-15);s.wire('F24:out','PLC:3L+',[[565,715],[565,520],[850,520]],'#d51e2a');s.wire('PS1:0','PLC:3M',[[335,930],[590,930],[590,550],[920,550]])
for x,idx in [(1020,1),(1140,2),(1260,3)]:s.port(f'PLC:Q0.{idx}',x,420,f'Q0.{idx}',-28,-22)
s.box(620,625,620,85,'7 4');s.text(620,605,'X2',25)
for i in range(1,13):s.port(f'X2:{i}',640+(i-1)*50,675,str(i),-7,-22)
for i,x in [(1,1020),(2,1140),(3,1260)]:
 target=640+(i+3)*50;s.wire(f'PLC:Q0.{i}',f'X2:{i+4}',[[x,570+(i-1)*15],[target,570+(i-1)*15]],'#d51e2a')
s.box(1280,690,160,220,'7 4');s.text(1310,725,'Y3',25);s.text(1297,754,'24 VDC',20);s.text(1300,780,'2.6 W',19);s.port('Y3:A1',1300,810,'A1',-34,-10);s.port('Y3:A2',1300,880,'A2',-34,23)
s.box(1355,825,32,38);s.line([(1355,863),(1387,825)]);s.line([(1300,810),(1370,810),(1370,825)]);s.line([(1370,863),(1370,880),(1300,880)])
# Antiparallel diode: cathode at A1, anode at A2, matching existing suppression symbol.
s.line([(1370,810),(1410,810),(1410,832)]);s.line([(1398,832),(1422,832)]);s.line([(1410,832),(1398,855),(1422,855),(1410,832)]);s.line([(1410,855),(1410,880),(1370,880)])
s.wire('X2:7','Y3:A1',[[940,810]],'#d51e2a');s.wire('Y3:A2','X2:8',[[1170,880],[1170,740],[1010,740],[1010,675]]);s.wire('X2:8','PS1:0',[[970,675],[970,930],[335,930]])
s.text(630,967,'Bornas auxiliares sin cargas añadidas. Extracto funcional; verificar referencia exacta de CPU.',16)
s.save('EE-0036_02_esquema_electrico.png',{'same_net':[['PS1:+','F24:in'],['F24:out','PLC:L+'],['F24:out','PLC:3L+'],['PS1:0','PLC:M'],['PS1:0','PLC:3M'],['PLC:Q0.1','X2:5'],['PLC:Q0.2','X2:6'],['PLC:Q0.3','X2:7'],['X2:7','Y3:A1'],['Y3:A2','X2:8'],['X2:8','PS1:0']],'different_net':[['PS1:+','PS1:0'],['PLC:3L+','PLC:Q0.3'],['PLC:Q0.1','PLC:Q0.2'],['PLC:Q0.2','PLC:Q0.3'],['Y3:A1','Y3:A2']],'required_return_vertex':'X2:8','diode':{'cathode':'Y3:A1','anode':'Y3:A2'},'CPU_family_document':'Siemens S7-1200 V20 11/2024 CPU1214C wiring table6; 3L+/3M, exact pictured order number unreadable'})
print('Two deterministic diagrams rendered; connection inventories saved.')
