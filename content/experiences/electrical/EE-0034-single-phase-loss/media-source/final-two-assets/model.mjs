// Analytical teaching model. These results are calculated, never field measurements.
const c = value => Array.isArray(value) ? value : [value, 0];
const add = (a,b) => [a[0]+b[0],a[1]+b[1]];
const sub = (a,b) => [a[0]-b[0],a[1]-b[1]];
const mul = (a,b) => [a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
const div = (a,b) => { const d=b[0]**2+b[1]**2; if(!d)throw new Error('Zero impedance or singular model');return [(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d]; };
const abs = a => Math.hypot(...a);
export const conditions = Object.freeze({
  kind:'calculated teaching simulation; not a real motor parameter identification',
  connection:'star; floating neutral; three equal finite impedances',
  rotor:'stationary; no rotational back EMF in this linear model',
  instrument:'ideal high impedance; finite impedance sensitivity checked separately',
  contacts:'test-state main paths commanded closed; one non-conducting third pole',
  outside_scope:'unequal windings, rotation/back EMF, other returns, real input impedance and dynamic recovery'
});
// Choose a reference origin/rotation so the supplied phase-to-phase magnitudes are 400,401,399 V.
const thirdX=(401**2-399**2+400**2)/(2*400);
export const supply = Object.freeze([[400,0],[0,0],[thirdX,Math.sqrt(401**2-thirdX**2)]]);
export function upstreamMagnitudes(){return [abs(sub(supply[0],supply[1])),abs(sub(supply[1],supply[2])),abs(sub(supply[0],supply[2]))];}
export function solveFloatingTerminal({impedances=[[1,1],[1,1],[1,1]],emfs=[[0,0],[0,0],[0,0]],meterOhms=Infinity,meterReference=1}={}){
  if(impedances.length!==3||emfs.length!==3)throw new Error('Three winding branches required');
  if(!(meterOhms>0)||![0,1].includes(meterReference))throw new Error('Positive meter impedance and a powered reference terminal required');
  const y=impedances.map(z=>div([1,0],c(z))),e=emfs.map(c);
  const rhs=add(mul(y[0],sub(supply[0],e[0])),mul(y[1],sub(supply[1],e[1])));
  if(meterOhms===Infinity)return add(div(rhs,add(y[0],y[1])),e[2]);
  const ym=[1/meterOhms,0],a=add(add(y[0],y[1]),y[2]),b=sub([0,0],y[2]),d=add(y[2],ym);
  const p=sub(rhs,mul(y[2],e[2])),q=add(mul(y[2],e[2]),mul(ym,supply[meterReference]));
  return div(sub(mul(a,q),mul(b,p)),sub(mul(a,d),mul(b,b)));
}
export function downstreamMagnitudes(options={}){
  const t3ToL2=solveFloatingTerminal({...options,meterReference:1}),t3ToL1=solveFloatingTerminal({...options,meterReference:0});
  return [abs(sub(supply[0],supply[1])),abs(sub(supply[1],t3ToL2)),abs(sub(supply[0],t3ToL1))];
}
// The authored resistance values are illustrative supplied records, not manufacturer limits.
export function isolatedPoleRecord({powerIsolated,controlIsolated,absenceVerified,parallelPathsIsolated,testKitInstalled,testClosed}){
  if(!powerIsolated||!controlIsolated||!absenceVerified||!parallelPathsIsolated||!testKitInstalled||!testClosed)throw new Error('Isolated, verified and test-closed state must be established before interpreting this record');
  return {pairs:['1L1–2T1','3L2–4T2','5L3–6T3'],illustrativeReadings:['0.2 Ω','0.2 Ω','OL'],universalAcceptanceLimit:false};
}
