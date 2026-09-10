import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const worlds = [
 {name:'Whispering Pines',short:'Pine forest',category:'01 / THE TEMPERATE FOREST',desc:'A quiet cabin. A winding river. A thousand shades of green, and nowhere else to be.',tags:['Woodland','Early morning'],bg:'#e6e9dc',ground:'#6e8650',side:'#807052'},
 {name:'Sands of Solitude',short:'Desert oasis',category:'02 / THE ARID WILDERNESS',desc:'Sun-warmed sandstone shelters a forgotten oasis. Even here, life finds a little room.',tags:['Desert','Golden hour'],bg:'#eee3d4',ground:'#d6af71',side:'#b78153'},
 {name:'Above the Clouds',short:'Alpine peaks',category:'03 / THE ALPINE HIGHLANDS',desc:'A tiny refuge beneath a towering summit. Crisp air, blue shadows, and absolute stillness.',tags:['Alpine','Fresh snowfall'],bg:'#e3e9eb',ground:'#d2dedc',side:'#849a9d'},
 {name:'Tides of Paradise',short:'Tropical coast',category:'04 / THE TROPICAL SHORES',desc:'Palms lean into the sea breeze. A little wooden jetty leads to an endless turquoise afternoon.',tags:['Tropical','High tide'],bg:'#deebe5',ground:'#e1d49b',side:'#ba9e73'},
 {name:'Ember & Ash',short:'Volcanic island',category:'05 / THE VOLCANIC FRONTIER',desc:'An ancient mountain, still wide awake. Rivers of molten gold trace a landscape born of fire.',tags:['Volcanic','After dusk'],bg:'#e6e0dd',ground:'#56504a',side:'#3e3c3b'},
 {name:'A Moment in Bloom',short:'Sakura garden',category:'06 / THE TRANQUIL GARDEN',desc:'Petals drift over a koi pond. Cross the red bridge, and leave the rest of the world behind.',tags:['Japanese garden','Spring'],bg:'#eee4e4',ground:'#8e9c68',side:'#84725b'},
 {name:'Beyond the Blue',short:'Lunar outpost',category:'07 / THE CELESTIAL FRONTIER',desc:'One small station at the edge of everything. A familiar kind of quiet, a very long way from home.',tags:['Lunar','Sea of tranquility'],bg:'#e3e4eb',ground:'#a7a9b6',side:'#787985'},
];
let seed=3;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
const mats=new Map();function mat(c,extra={}){let key=c+JSON.stringify(extra);if(!mats.has(key))mats.set(key,new T.MeshStandardMaterial({color:c,roughness:.86,flatShading:true,...extra}));return mats.get(key)}
function mesh(g,geo,c,x=0,y=0,z=0,extra){const m=new T.Mesh(geo,mat(c,extra));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
function box(g,x,y,z,w,h,d,c){return mesh(g,new T.BoxGeometry(w,h,d),c,x,y,z)}
function cone(g,x,y,z,r,h,c,n=7,rTop=0){return mesh(g,new T.CylinderGeometry(rTop,r,h,n),c,x,y,z)}
function rock(g,x,y,z,s,c){const m=mesh(g,new T.DodecahedronGeometry(s,0),c,x,y,z);m.scale.set(1,.65+rnd()*.5,.75+rnd()*.5);m.rotation.set(rnd(),rnd()*3,rnd());return m}
function beam(g,a,b,r,c){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);const m=mesh(g,new T.CylinderGeometry(r,r,d.length(),6),c,...av.clone().add(bv).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m}
function pine(g,x,z,s=1,snow=false,y=.03){cone(g,x,y+s*.65,z,s*.07,s*1.3,'#715c40',6);for(let k=0;k<4;k++){let r=s*(.59-k*.115);cone(g,x,y+s*(.75+k*.36),z,r,s*.95,snow?'#e2eeea':['#365b46','#426a4a','#517a50','#628258'][k],7)} }
function palm(g,x,z,s=1){
 const ground=.03,top=new T.Vector3(x+.23*s,ground+2.2*s,z);
 const trunkStart=new T.Vector3(x,ground,z);
 beam(g,trunkStart.toArray(),top.toArray(),.07*s,'#a68b59');
 const trunkDirection=top.clone().sub(trunkStart).normalize();
 for(let j=1;j<10;j++){
  const p=trunkStart.clone().lerp(top,j/10);
  const ring=mesh(g,new T.TorusGeometry(.072*s,.012*s,4,8),'#887447',...p.toArray());
  ring.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),trunkDirection);
 }
 for(let i=0;i<7;i++){
  const a=i*Math.PI*2/7;
  const curve=new T.CatmullRomCurve3([top,new T.Vector3(top.x+Math.cos(a)*.7*s,top.y+.18*s,z+Math.sin(a)*.7*s),new T.Vector3(top.x+Math.cos(a)*1.35*s,top.y-.45*s,z+Math.sin(a)*1.35*s)]);
  mesh(g,new T.TubeGeometry(curve,10,.019*s,5,false),'#789452');
  // Tapered leaflets join the curved spine; no separate floating leaf planes.
  for(let j=1;j<10;j++)for(let side of[-1,1]){
   const t=j/10,p0=curve.getPoint(t-.045),p1=curve.getPoint(t+.045),center=curve.getPoint(t);
   const width=Math.sin(t*Math.PI)*.24*s;
   const tip=center.clone().add(new T.Vector3(-Math.sin(a)*width*side,-.035*s,Math.cos(a)*width*side));
   tip.addScaledVector(new T.Vector3(Math.cos(a),0,Math.sin(a)),.11*s);
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([...p0.toArray(),...tip.toArray(),...p1.toArray()],3));geo.computeVertexNormals();
   mesh(g,geo,i%2?'#60884b':'#467557',0,0,0,{side:T.DoubleSide});
  }
 }
 for(let i=0;i<3;i++)rock(g,top.x+(i-1)*.09*s,top.y-.08*s,z,.10*s,'#78613f');
}
function cabin(g,x,z,s=1,snow=false){const c=new T.Group();c.position.set(x,.12,z);c.scale.setScalar(s);g.add(c);box(c,0,.52,0,1.15,1,1.05,'#a88758');for(let i=0;i<7;i++)box(c,0,.1+i*.14,.534,1.18,.065,.04,'#846d49');const roofGeo=new T.BufferGeometry();const v=[-.76,1,-.7,.76,1,-.7,0,1.75,-.7, -.76,1,.7,0,1.75,.7,.76,1,.7, -.76,1,-.7,0,1.75,-.7,0,1.75,.7,-.76,1,-.7,0,1.75,.7,-.76,1,.7, .76,1,-.7,.76,1,.7,0,1.75,.7,.76,1,-.7,0,1.75,.7,0,1.75,-.7];roofGeo.setAttribute('position',new T.Float32BufferAttribute(v,3));roofGeo.computeVertexNormals();mesh(c,roofGeo,snow?'#e8efea':'#475a4b',0,0,0,{side:T.DoubleSide});box(c,0,.43,.56,.26,.7,.04,'#4a4a39');box(c,-.36,.65,.565,.24,.27,.04,'#f6d38a');box(c,.37,.65,.565,.24,.27,.04,'#f6d38a');box(c,.59,.65,0,.035,.28,.3,'#e4bf78');box(c,.38,1.6,-.28,.19,.8,.2,'#827b6b');for(let i=0;i<3;i++)box(c,0,-.065+(2-i)*.025,.72+i*.16,.56,.08+(2-i)*.05,.15,'#a79879');
 box(c,0,-.065,0,1.22,.19,1.12,'#8b8870');
 for(let zSide of[-.714,.714])for(let side of[-1,1])beam(c,[side*.76,1,zSide],[0,1.75,zSide],.035,snow?'#d6e0dc':'#78826a');
 beam(c,[0,1.77,-.74],[0,1.77,.74],.04,snow?'#e7eee7':'#6e7b65');
 for(let xWin of[-.36,.37]){box(c,xWin,.65,.596,.022,.28,.026,'#655941');box(c,xWin,.65,.596,.26,.024,.026,'#655941');box(c,xWin,.496,.59,.30,.035,.09,'#7f7256')}
 for(let side of[-1,1])for(let h=0;h<6;h++)box(c,side*.581,.13+h*.14,0,.035,.045,1.06,'#93744f');
 box(c,.38,2.025,-.28,.26,.06,.27,'#6f7269');return c}
function river(g,points,width,c,y=.065){let verts=[];for(let i=0;i<points.length;i++){let p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);let nx=-dz/l*width/2,nz=dx/l*width/2;verts.push(T.MathUtils.clamp(p[0]+nx,-3,3),y,T.MathUtils.clamp(p[1]+nz,-3,3),T.MathUtils.clamp(p[0]-nx,-3,3),y,T.MathUtils.clamp(p[1]-nz,-3,3))}let idx=[];for(let i=0;i<points.length-1;i++){let k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2)}let geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();return mesh(g,geo,c,0,0,0,{metalness:.15,roughness:.28,side:T.DoubleSide})}
function pool(g,x,z,rx,rz,c,y=.07){let m=mesh(g,new T.CylinderGeometry(1,1,.04,40),c,x,y,z,{roughness:.25,metalness:.1});m.scale.set(rx,1,rz);return m}
// Each stratum has a distinct vertical interval: no coincident exposed side faces.
function base(g,w){
 box(g,0,-.565,0,6,.87,6,w.side);
 box(g,0,-.05,0,6,.16,6,w.ground);
 for(let side=0;side<4;side++)for(let row=0;row<3;row++)for(let col=0;col<9;col++){
  if(rnd()<.32)continue;
  const a=-2.65+col*.65+(row%2)*.08,y=-.28-row*.25;
  const c=new T.Color(w.side).multiplyScalar(.87+rnd()*.24).getStyle();
  const slab=box(g,side<2?a:(side===2?-3.007:3.007),y,side<2?(side===0?-3.007:3.007):a,.23+rnd()*.22,.045+rnd()*.055,.025,c);
  if(side>=2)slab.rotation.y=Math.PI/2;
 }
 box(g,0,-1.025,0,5.83,.05,5.83,'#625e4e');
}
function details(g,w,n=80,biome=0){
 for(let i=0;i<n;i++){
  let x=rnd()*5.7-2.85,z=rnd()*5.7-2.85;
  // Keep aquatic surfaces and architectural footprints free of scattered terrain.
  if(biome===3 || (biome===1&&Math.hypot((x-.4)/1.3,(z-.65)/.95)<1) ||
   (biome===5&&Math.hypot((x-.15)/1.75,(z-.6)/1.3)<1) ||
   (biome===6&&((Math.hypot(x+.4,z+.6)<1.2)||(x>.5&&x<2.25&&z<-.35&&z>-1.9))))continue;
  rock(g,x,.065,z,.035+rnd()*.075,w.ground);
 }
}
// All panel parts live in the same tilted local frame. The mounting points are
// transformed from that frame, so braces terminate at the actual underside.
function solarPanel(g,x,z){
 const assembly=new T.Group();assembly.name='solar-panel';assembly.position.set(x,.8,z);assembly.rotation.x=.3;g.add(assembly);
 box(assembly,0,0,0,.66,.07,1.2,'#aeb7bd');
 box(assembly,0,.041,0,.60,.014,1.14,'#36465f');
 for(let col=0;col<2;col++)for(let row=0;row<6;row++){
  box(assembly,(col-.5)*.29,.054,(row-2.5)*.186,.273,.012,.17,row%2?'#4a648b':'#506e95');
 }
 for(let side of[-1,1])box(assembly,side*.321,.051,0,.018,.034,1.2,'#d0d5d4');
 for(let end of[-1,1])box(assembly,0,.051,end*.592,.624,.034,.016,'#d0d5d4');
 for(let xLocal of[-.21,.21])box(assembly,xLocal,-.054,0,.045,.038,1.08,'#7d8992');
 assembly.updateMatrixWorld(true);
 for(let xLocal of[-.21,.21])for(let zLocal of[-.4,.4]){
  const top=assembly.localToWorld(new T.Vector3(xLocal,-.07,zLocal));
  box(g,top.x,.067,top.z,.18,.074,.2,'#777e86');
  beam(g,[top.x,.08,top.z],top.toArray(),.025,'#a9b2b8');
 }
 for(let xLocal of[-.21,.21]){
  const a=assembly.localToWorld(new T.Vector3(xLocal,-.07,-.4));
  const b=assembly.localToWorld(new T.Vector3(xLocal,-.07,.4));
  beam(g,[a.x,.12,a.z],b.toArray(),.018,'#86959d');
 }
}
function lantern(g,x,z){
 box(g,x,.065,z,.34,.07,.34,'#818573');
 cone(g,x,.3,z,.09,.46,'#a2a48d',8,.08);
 box(g,x,.55,z,.28,.18,.28,'#b8b59b');
 box(g,x,.56,z+.146,.12,.10,.02,'#edca7d');
 cone(g,x,.73,z,.25,.2,'#727e6a',4);
 rock(g,x,.86,z,.05,'#919881');
}
function polishWorld(g,i){
 if(i===0){
  // Bearers and grounded piles support the footbridge.
  for(let z of[-.28,.69])box(g,.22,.155,z,1.2,.10,.10,'#766a4a');
  for(let x of[-.3,.8])for(let z of[-.37,.8])beam(g,[x,.03,z],[x,.2,z],.047,'#756849');
  for(let j=0;j<7;j++){let x=1.2+j*.08,z=.2+j*.22;rock(g,x,.055,z,.12,'#bbaf89')}
  for(let j=0;j<5;j++)beam(g,[-2.2+j*.13,.16,1.9],[-2.2+j*.13,.16,2.55],.075,'#88704d');
  for(let j=0;j<12;j++){let x=-2.6+rnd()*.65,z=-.6+rnd()*2;beam(g,[x,.03,z],[x,.19,z],.014,'#d5cba6');cone(g,x,.21,z,.085,.065,j%2?'#b97d5c':'#c1a271',8)}
 }
 if(i===1){
  for(let x of[-1.6,-.65]){box(g,x,.085,.7,.44,.11,.44,'#c8a36e');for(let h of[.3,.78,1.13]){const band=mesh(g,new T.TorusGeometry(.187,.018,5,8),'#ba965f',x,h,.7);band.rotation.x=Math.PI/2}}
  for(let j=0;j<8;j++){const a=j*2.4;rock(g,.4+Math.cos(a)*1.22,.08,.65+Math.sin(a)*.91,.10,'#ddbe83')}
  for(let j=0;j<4;j++){let x=2.55,z=1.1+j*.35;cone(g,x,.17,z,.08,.28,'#ae9b66',5);for(let k=0;k<3;k++)beam(g,[x,.08,z],[x+(k-1)*.12,.24,z+.07],.012,'#a08b59')}
  box(g,-1.9,.12,2.2,.53,.18,.38,'#d2b27d').rotation.y=.35;
 }
 if(i===2){
  for(let j=0;j<7;j++){let z=1.2+j*.23;beam(g,[-.25,.04,z],[-.25,.54,z],.032,'#8a7962');if(j<6)beam(g,[-.25,.4,z],[-.25,.4,z+.23],.027,'#8a7962')}
  for(let j=0;j<5;j++)rock(g,.7+j*.17,.06,1.7+j*.14,.11,'#a9b5b1');
  const pole=beam(g,[-2.5,.03,2],[-2.5,.95,2],.025,'#8e806c');box(g,-2.5,.8,2,.44,.13,.055,'#a28661');
 }
 if(i===3){
  for(let x of[.42,.88])box(g,x,.226,1.43,.08,.07,2.65,'#8b795a');
  for(let z of[.3,1.3,2.55])for(let x of[.35,.95])cone(g,x,.46,z,.057,.08,'#ad9872',8,.057);
  for(let j=0;j<16;j++){let a=j*.39;let x=-.7+Math.cos(a)*1.85,z=-.5+Math.sin(a)*1.58;rock(g,x,.195,z,.025+rnd()*.04,j%2?'#eae4c6':'#c9b480')}
  for(let z of[1.42,1.8])box(g,1.65,.168,z,.34,.045,.07,'#aa8c61');
 }
 if(i===5){
  for(let x of[-1.05,.99])for(let z of[.26,1.04])beam(g,[x,.03,z],[x,.2,z],.048,'#874f40');
  for(let z of[.27,1.03]){const pts=[];for(let j=0;j<13;j++)pts.push(new T.Vector3(-1.05+j*.17,.12+Math.sin(j/12*Math.PI)*.32,z));mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts),24,.045,6,false),'#8c5142')}
  lantern(g,-1.9,1.05);lantern(g,1.8,2.15);
  for(let j=0;j<5;j++){let x=-.6+j*.29,z=.15+(j%2)*.86;const fish=mesh(g,new T.SphereGeometry(.08,8,5),j%2?'#e4a36d':'#e9ddbe',x,.105,z);fish.scale.set(.5,.25,1.6);fish.rotation.y=j*.9}
  for(let j=0;j<5;j++){let x=-2.65+j*.11;beam(g,[x,.03,-2.3],[x,.55+j%2*.2,-2.3],.023,'#748356')}
 }
 if(i===6){
  // Airlock stairs, instrument mast, rover suspension and equipment cases.
  for(let j=0;j<3;j++)box(g,-.4,.09+(2-j)*.045,.63+j*.14,.46,.12+(2-j)*.09,.13,'#aeb7ba');
  for(let z of[1.33,1.9])beam(g,[.25,.19,z],[1.05,.19,z],.037,'#888f96');
  box(g,.65,.54,1.58,.43,.09,.51,'#788d99');
  for(let x of[.25,1.05])for(let z of[1.33,1.9]){const hub=cone(g,x+(x<.6?-.064:.064),.19,z,.067,.018,'#bbc0bd',10,.067);hub.rotation.z=Math.PI/2;}
  for(let j=0;j<2;j++){box(g,-1.7+j*.42,.18,.8,.33,.29,.46,'#bec5c4');box(g,-1.7+j*.42,.338,.8,.34,.025,.47,'#81929a');box(g,-1.7+j*.42,.2,1.037,.1,.065,.014,'#cfaf76')}
  box(g,2.35,.07,-2.25,.35,.08,.35,'#8e969c');beam(g,[2.35,.1,-2.25],[2.35,1.35,-2.25],.028,'#aeb8bd');
  const dish=mesh(g,new T.SphereGeometry(.3,16,8,0,Math.PI*2,0,.43*Math.PI),'#c8d0d0',2.35,1.1,-2.25,{side:T.DoubleSide});dish.rotation.z=-.5;beam(g,[2.35,1.1,-2.25],[2.5,1.52,-2.25],.013,'#7e8c99');
 }
}
function makeWorld(i){seed=33+i*503;let g=new T.Group();let w=worlds[i];base(g,w);details(g,w,80,i);
if(i===0){river(g,[[-1.3,-3],[-1.1,-2.2],[-.55,-1.5],[-.55,-.7],[0,.05],[.8,.7],[.65,1.45],[.9,2.2],[1.5,3]],.8,'#79ada3');for(let j=0;j<40;j++){let x=rnd()*5.5-2.75,z=rnd()*5.5-2.75;if(Math.abs(x-(z*.45))<.85|| (x> .5&&z<.5&&z> -1.8))continue;pine(g,x,z,.55+rnd()*.6)}cabin(g,1.35,-.7,.9);for(let j=0;j<18;j++){let z=rnd()*5.8-2.9,x=z*.45+(j%2?-.65:.6);rock(g,x,.1,z,.12+rnd()*.14,'#9aab91')}for(let j=0;j<10;j++)box(g,-.25+j*.105,.22,.22,.09,.1,1.28,'#a7956e');beam(g,[-.3,.58,-.37],[.8,.58,-.37],.035,'#827957');beam(g,[-.3,.58,.8],[.8,.58,.8],.035,'#827957');for(let x of[-.3,.8])for(let z of[-.37,.8])beam(g,[x,.15,z],[x,.67,z],.035,'#827957');for(let j=0;j<16;j++){let z=rnd()*4.5-2;box(g,z*.45,.068,z,.12+rnd()*.18,.006,.025,'#c3dbca')}for(let j=0;j<24;j++){let x=rnd()*5.5-2.75,z=rnd()*5.5-2.75;cone(g,x,.125,z,.06,.19,'#9ba964',5);if(j%3===0)rock(g,x,.23,z,.045,'#e7c875')} }
if(i===1){pool(g,.4,.65,1.18,.84,'#799c8f');pool(g,.4,.65,.96,.66,'#599c98',.10);for(let j=0;j<10;j++){let x=rnd()*2.6-2.8,z=-2+rnd()*.6,h=1+rnd()*1.7;cone(g,x,h/2,z,.65,h,j%2?'#c69765':'#d3a775',5,.45)}for(let j=0;j<4;j++)palm(g,1.2+j*.34,-.8+(j%2)*.9,.65+j*.08);for(let j=0;j<7;j++){let x=-1.6+j*.22;box(g,x,.15,1.75,.19,.25,.42,'#e2c28d')}for(let x of[-1.6,-.65]){cone(g,x,.67,.7,.19,1.2,'#dfc293',8,.17);box(g,x,1.32,.7,.45,.15,.42,'#d6b37e')}box(g,-1.12,1.5,.7,1.5,.25,.4,'#ddbc87');for(let j=0;j<8;j++){let x=rnd()*5.5-2.75,z=rnd()*5.5-2.75;if(Math.hypot(x-.4,z-.65)<1.3)continue;cone(g,x,.34,z,.1,.65,'#81916a',6,.09);beam(g,[x,.38,z],[x+.23,.38,z],.07,'#81916a');beam(g,[x+.23,.38,z],[x+.23,.63,z],.07,'#81916a')} }
if(i===2){for(let j=0;j<4;j++){let x=-1.55+j*.96,z=-1.25-j%2*.32,h=2.2+(j%3)*.7;cone(g,x,h/2,z,1.32,h,'#96a6a5',5);cone(g,x,h*.84,z,.52,h*.42,'#edf3ec',5)}river(g,[[-2.5,3],[-2,2],[-1,1.3],[0,.8],[1.2,.65],[3,.9]],.55,'#8fbcc5');cabin(g,1.6,1.5,.85,true);for(let j=0;j<15;j++){let x=rnd()*5.5-2.75,z=.1+rnd()*2.5;if(x> .8&&z>.6)continue;pine(g,x,z,.5+rnd()*.4,true)}for(let j=0;j<8;j++)rock(g,rnd()*5.4-2.7,.1,rnd()*5.4-2.7,.25,'#e9efea')}
if(i===3){box(g,0,.07,0,6,.08,6,'#6db7b5');pool(g,-.7,-.5,2.28,2.1,'#90cbc0',.12);pool(g,-.7,-.5,1.95,1.7,'#e4d5a1',.16);for(let j=0;j<7;j++){let a=j*2.4; palm(g,-.7+Math.cos(a)*1.25,-.6+Math.sin(a)*1.05,.7+rnd()*.3)}cabin(g,-1.2,-.7,.7);for(let j=0;j<15;j++)box(g,.65,.3,.25+j*.17,.65,.09,.14,'#b2986f');for(let z of[.3,1.3,2.55])for(let x of[.35,.95])cone(g,x,.12,z,.045,.6,'#7d7960',6);for(let j=0;j<40;j++){let x=rnd()*5.8-2.9,z=rnd()*5.8-2.9;if(Math.hypot(x+.7,z+.5)<2.1)continue;box(g,x,.113,z,.1+rnd()*.32,.006,.023,'#b7e0d2')}let boat=pool(g,1.65,1.65,.28,.65,'#f1e7c5',.13);boat.rotation.y=.3;beam(g,[1.65,.13,1.65],[1.65,1.2,1.65],.02,'#75664d');let sail=new T.BufferGeometry();sail.setAttribute('position',new T.Float32BufferAttribute([1.65,1.2,1.65,1.65,.48,1.65,2.2,.48,1.65],3));sail.computeVertexNormals();mesh(g,sail,'#fbf1d9',0,0,0,{side:T.DoubleSide})}
if(i===4){
 const mountain=cone(g,0,1.18,-.45,2.1,2.4,'#665c55',12,.65);
 // An open annulus gives the caldera an actual hollow rim.
 const rim=mesh(g,new T.TorusGeometry(.61,.10,6,24),'#453e39',0,2.38,-.45);rim.rotation.x=Math.PI/2;
 pool(g,0,-.45,.55,.55,'#ff9a3c',2.365);
 mountain.updateMatrixWorld(true);
 const ray=new T.Raycaster();
 function lavaRibbon(angle,width){
  const vertices=[],indices=[];
  for(let j=0;j<=50;j++){
   const r=.59+j/50*2.45,theta=angle+Math.sin(j*.13)*.09;
   for(let side of[-1,1]){
    const x=Math.sin(theta)*r+Math.cos(theta)*width*side/2;
    const z=-.45+Math.cos(theta)*r-Math.sin(theta)*width*side/2;
    ray.set(new T.Vector3(x,4,z),new T.Vector3(0,-1,0));
    const hit=ray.intersectObject(mountain,false)[0];
    vertices.push(T.MathUtils.clamp(x,-2.98,2.98),(hit?Math.max(.03,hit.point.y):.03)+.012,T.MathUtils.clamp(z,-2.98,2.98));
   }
   if(j<50){const k=j*2;indices.push(k,k+1,k+2,k+1,k+3,k+2)}
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
  const lava=mesh(g,geo,'#ee7932',0,0,0,{emissive:'#d24c13',emissiveIntensity:.6,side:T.DoubleSide});lava.castShadow=false;
 }
 lavaRibbon(.27,.22);lavaRibbon(-1.3,.11);
 for(let j=0;j<25;j++){let x=rnd()*5.7-2.85,z=rnd()*5.7-2.85;if(Math.hypot(x,z+.45)>1.8)rock(g,x,.1,z,.12+rnd()*.28,'#625953')}for(let j=0;j<5;j++){const m=rock(g,-.08-j*.14,2.8+j*.3,-.45,.18+j*.04,'#a69e91');m.material=mat('#a69e91',{transparent:true,opacity:.20,depthWrite:false});m.castShadow=false;m.receiveShadow=false;m.userData.smoke=j}for(let j=0;j<16;j++){let a=rnd()*6.28;rock(g,Math.cos(a)*(.6+rnd()),2.55+rnd()*.7,-.45+Math.sin(a)*.5,.025,'#f8b84e')}}
if(i===5){pool(g,.15,.6,1.6,1.15,'#76a4a0');for(let j=0;j<13;j++){let x=-1.05+j*.17,y=.19+Math.sin(j/12*Math.PI)*.32;box(g,x,y,.65,.15,.1,.8,'#b85f4e');for(let z of[.19,1.11]){beam(g,[x,y,z],[x,y+.37,z],.025,'#a64d42');if(j<12)beam(g,[x,y+.35,z],[x+.17,.19+Math.sin((j+1)/12*Math.PI)*.32+.35,z],.027,'#a64d42')}}for(let j=0;j<8;j++){let x=j<4?-2.2+j*.55:1.6+(j%2)*.55,z=j<4?-1.6+j%2*.3:-1.1+(j-4)*.85;beam(g,[x,.03,z],[x+.1,1.45,z],.09,'#77604d');for(let k=0;k<7;k++){let a=k*2.4,cy=1.5+rnd()*.45,cx=x+Math.cos(a)*.38,cz=z+Math.sin(a)*.38;beam(g,[x+.1,1.25,z],[cx,cy,cz],.035,'#77604d');rock(g,cx,cy,cz,.43,k%3===0?'#ecc0c1':'#d8a1aa')}}for(let x of[-.6,.6]){box(g,x,1,-1.65,.13,2,.15,'#a95243');box(g,x,.12,-1.65,.26,.2,.28,'#686b5c')}box(g,0,1.7,-1.65,1.65,.14,.19,'#a95243');box(g,0,2.02,-1.65,1.9,.17,.3,'#604e45');for(let j=0;j<10;j++)rock(g,-2+j*.39,.1,2.1+Math.sin(j)*.2,.19,'#b8b7a0');for(let j=0;j<15;j++){let x=rnd()*2.4-1,z=rnd()*1.6;rock(g,x,.105,z,.027,'#e8bac3')}}
if(i===6){for(const [x,z,r] of[[-2.3,-2.15,.31],[-.9,-2.35,.22],[.3,-2.35,.26],[2.4,-.25,.26],[2.35,1.05,.29],[1.8,2.5,.22],[-.7,2.25,.34],[-2.3,1.7,.25],[-2.4,-.4,.27]]){let m=mesh(g,new T.TorusGeometry(r,.055,5,16),'#8d8e9e',x,.08,z);m.rotation.x=Math.PI/2;pool(g,x,z,r*.8,r*.8,'#9395a4',.043)}mesh(g,new T.SphereGeometry(.92,16,8,0,Math.PI*2,0,Math.PI/2),'#e0e4e5',-.4,.26,-.6,{metalness:.25,roughness:.45});cone(g,-.4,.23,-.6,.98,.3,'#c8ccd0',16,.98);box(g,-.4,.43,.25,.5,.55,.52,'#d5dbdc');box(g,-.4,.43,.53,.31,.36,.03,'#657480');for(let panelIndex=0;panelIndex<2;panelIndex++)solarPanel(g,1+panelIndex*.78,-1.15);beam(g,[-1.7,.05,-1.45],[-1.7,1.7,-1.45],.035,'#d8dbd8');let flag=box(g,-1.36,1.5,-1.45,.6,.35,.02,'#c4a56c');for(const [rx,rz] of[[-2.55,2.5],[2.55,1.85],[-2.5,-1.25],[.1,-2.6]])rock(g,rx,.15,rz,.22,'#989aaa');box(g,.65,.32,1.6,.65,.35,.85,'#e1e0d8');for(let x of[.25,1.05])for(let z of[1.33,1.9]){let wh=cone(g,x,.19,z,.17,.12,'#595d68',10,.17);wh.rotation.z=Math.PI/2}beam(g,[.65,.4,1.6],[.65,1,1.6],.02,'#dde0db');rock(g,.65,1,1.6,.12,'#c2cbd0')}
polishWorld(g,i);return g;}

const viewport=document.querySelector('#viewport');const renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.17;viewport.appendChild(renderer.domElement);
const scene=new T.Scene();scene.add(new T.HemisphereLight('#fff8e8','#a2ad92',2.5));const sun=new T.DirectionalLight('#fff3da',4.2);sun.position.set(-3,9,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-7;sun.shadow.camera.right=7;sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;sun.shadow.camera.near=.5;sun.shadow.camera.far=25;sun.shadow.normalBias=.018;sun.shadow.bias=-.00008;scene.add(sun);const fill=new T.DirectionalLight('#deedff',1);fill.position.set(5,3,-4);scene.add(fill);
const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.11}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.09;floor.receiveShadow=true;scene.add(floor);
const camera=new T.OrthographicCamera(-8,8,5,-5,.1,100);camera.position.set(9,8,11);const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.5,0);controls.enableDamping=true;controls.enablePan=false;controls.minPolarAngle=.25;controls.maxPolarAngle=Math.PI/2.12;controls.minZoom=.75;controls.maxZoom=2.1;controls.autoRotateSpeed=.65;controls.update();
const models=worlds.map((_,i)=>makeWorld(i));let active=0;scene.add(models[0]);
const cards=document.querySelector('#worlds');worlds.forEach((w,i)=>{const b=document.createElement('button');b.className='world-card';b.setAttribute('role','tab');b.setAttribute('aria-selected',i===0);b.setAttribute('aria-label',`Explore ${w.short}`);b.style.background=w.bg+'80';b.innerHTML=`<span class="card-dot"></span><img class="thumbnail" alt="${w.short} miniature"/><span class="card-label"><small>0${i+1}</small><strong>${w.short}</strong></span>`;b.onclick=()=>select(i);b.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const n=(i+(e.key==='ArrowRight'?1:6))%7;select(n);cards.children[n].focus()}};cards.appendChild(b)});cards.setAttribute('role','tablist');cards.setAttribute('aria-label','Choose a world');
function thumbnails(){renderer.setSize(300,190);camera.left=-5.3;camera.right=5.3;camera.top=3.36;camera.bottom=-3.36;camera.position.set(9,8,11);camera.lookAt(0,.65,0);camera.updateProjectionMatrix();floor.visible=false;models.forEach((m,i)=>{scene.remove(...models);scene.add(m);renderer.render(scene,camera);cards.children[i].querySelector('img').src=renderer.domElement.toDataURL('image/png')});floor.visible=true;scene.remove(...models);scene.add(models[active]);}
function resize(){let w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h);let size=w<550?6.4:4.6;camera.left=-size*w/h;camera.right=size*w/h;camera.top=size;camera.bottom=-size;camera.setViewOffset(w,h,w<550?0:-w*.085,w<550?-h*.11:0,w,h);camera.updateProjectionMatrix();}
function reset(){camera.position.set(9,8,11);camera.zoom=1;controls.target.set(0,.6,0);controls.update();camera.updateProjectionMatrix()}
function select(i){scene.remove(models[active]);active=i;scene.add(models[i]);const w=worlds[i];document.querySelector('#scene-category').textContent=w.category;document.querySelector('#scene-title').textContent=w.name;document.querySelector('#scene-description').textContent=w.desc;document.querySelector('#tags').innerHTML=w.tags.map(t=>`<span>${t}</span>`).join('');document.querySelector('#world-number').innerHTML=`0${i+1}<span>/ 07</span>`;document.querySelector('.exhibit').style.background=w.bg;[...cards.children].forEach((b,j)=>b.setAttribute('aria-selected',i===j));reset();}
thumbnails();select(0);resize();new ResizeObserver(resize).observe(viewport);
document.querySelector('#rotate').onclick=e=>{controls.autoRotate=!controls.autoRotate;e.currentTarget.setAttribute('aria-pressed',controls.autoRotate)};document.querySelector('#reset').onclick=reset;document.querySelector('#fullscreen').onclick=async()=>{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.exhibit').requestFullscreen()};const dialog=document.querySelector('#about-dialog');document.querySelector('#about').onclick=()=>dialog.showModal();document.querySelector('#close-about').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;renderer.setAnimationLoop(t=>{controls.update();if(active===4&&!reduced)models[4].children.forEach(m=>{if(m.userData.smoke!==undefined)m.position.x=-.08-m.userData.smoke*.14+Math.sin(t*.0005+m.userData.smoke)*.1});renderer.render(scene,camera)});
