// Original parametric SVG animation. One state controller owns all expressions.
const button=document.querySelector('.mascot');
if(button){
const svg=button.querySelector('svg'),head=svg.querySelector('#head'),eyes=svg.querySelector('#eyes'),left=svg.querySelector('#eye-left'),right=svg.querySelector('#eye-right'),mouth=svg.querySelector('#mouth'),face=svg.querySelector('#face'),blush=svg.querySelector('#blush'),shine=svg.querySelector('#screen-shine'),glow=svg.querySelector('#face-glow-alpha'),hearts=svg.querySelector('#hearts'),tears=svg.querySelector('#tears'),spirals=svg.querySelector('#spiral-eyes'),scaredEyes=svg.querySelector('#scared-eyes'),wavyMouth=svg.querySelector('#wavy-mouth'),sleep=svg.querySelector('#sleep-symbols');
const spiralLeft=svg.querySelector('#spiral-left'),spiralRight=svg.querySelector('#spiral-right');
const sleepGlyphs=['#sleep-z1','#sleep-z2','#sleep-z3'].map(id=>svg.querySelector(id));
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 700px), (pointer: coarse)');
let browserExit=null,edgeMouse=null,lastInput='mouse',touchUntil=0,press=null,pressTimer=0,suppressClick=false,lastTouchTap=-Infinity,lastScroll=window.scrollY,scrollAt=-Infinity;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const random=(a,b)=>a+Math.random()*(b-a);
// Eye geometry: horizontal half-span, vertical half-span, curve, stroke, offset.
const E=(w=0,h=11,c=0,s=26,o=0)=>[w,h,c,s,o];
const N=E();
const poses={
 neutral:[N,N,12,0],happy:[E(15,0,-25,9),E(15,0,-25,9),14,0],
 sad:[E(12,-6,7,9,2),E(12,6,7,9,2),-13,0],
 surprised:[E(0,13,0,29),E(0,13,0,29),0,1],
 sleepy:[E(14,0,8,4,3),E(14,0,8,4,3),0,.12],
 love:[E(0,10,0,24),E(0,10,0,24),16,0],
 suspicious:[E(13,3,0,7),E(12,-2,0,6,3),-3,0],
 bored:[E(14,0,0,7,3),E(14,0,0,7,3),0,0],
 confused:[E(12,3,-10,9),E(10,-4,5,8,5),-6,0],
 excited:[E(16,0,-28,10),E(16,0,-28,10),14,.85],
 shy:[E(11,0,-14,8,6),E(11,0,-14,8,6),10,0],
 angry:[E(15,8,0,11),E(15,-8,0,11),-14,0],
 curious:[E(0,13,0,26),E(0,6,0,17,3),7,0],
 wink:[E(0,11,0,24),E(13,0,-7,6),12,0],
 blink:[E(13,0,0,3),E(13,0,0,3),8,0],
 laughing:[E(16,0,-30,9),E(16,0,-30,9),16,1],
 scared:[E(0,12,0,24),E(0,12,0,24),-4,.9],
 crying:[E(13,-8,-3,8),E(13,8,-3,8),-16,0],
 dizzy:[E(0,10,0,22),E(0,10,0,22),0,0],
 proud:[E(14,0,10,7),E(14,0,10,7),13,0],
 drowsy:[E(10,1,4,11,3),E(10,1,4,11,3),-1,0],
 'slow-blink':[E(13,0,5,3,4),E(13,0,5,3,4),-1,0],
 yawning:[E(14,0,8,5,3),E(14,0,8,5,3),0,1]
};
const names=Object.keys(poses).filter(n=>!['neutral','blink','sleepy','wink','drowsy','slow-blink','yawning'].includes(n));
const idleNames=names.filter(n=>!['angry','crying','scared'].includes(n));
// Additional interpolated channels: blush, glow strength and screen-face brightness.
const accents={love:[.48,.38,1],shy:[.65,.25,1],excited:[.12,.58,1],happy:[.12,.35,1],sleepy:[0,.08,.55],surprised:[0,.42,1],angry:[0,.40,1],laughing:[.28,.48,1],scared:[0,.34,1],crying:[0,.2,.9],dizzy:[0,.24,1],proud:[.16,.32,1],drowsy:[0,.15,.82],'slow-blink':[0,.12,.78],yawning:[0,.12,.76]};
const colors={angry:'#ff777e',love:'#f9a1cb',sad:'#81aef3',sleepy:'#759fc4',scared:'#d0eaff',crying:'#81b8ff',dizzy:'#c3b7ff'};
// Extra channels: tears, spiral eyes, hollow eyes, mouth width, wavy mouth, proud tilt, laugh bounce.
const baseColor='#b9e7ff';
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const hexColor=channels=>'#'+channels.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
let faceRgb=rgb(baseColor),poseAt=0;
const DROWSY_IDLE=20000,YAWN_IDLE=30000,ASLEEP_IDLE=32000,WAKE_OPEN=450,WAKE_SMILE=1000;
const vector=n=>[...poses[n][0],...poses[n][1],...poses[n].slice(2),n==='love'?1:0,...(accents[n]||[0,.22,1]),n==='crying'?1:0,n==='dizzy'?1:0,n==='scared'?1:0,n==='laughing'?10:n==='proud'?3:0,n==='dizzy'?1:0,n==='proud'?-5:0,n==='laughing'?1:0,n==='sleepy'?1:0];
let current=vector('neutral'),target=current.slice(),state='idle',emotion='neutral',lastEmotion='',until=0,frame=0,previous=0,activity=performance.now(),idleAt=activity+random(4000,8000),blinkAt=activity+random(3000,6000),secondBlink=0,hover=null,pointer=null,gx=0,gy=0,hx=0,hy=0,tilt=0,pulse=0,clicks=0,lastClick=-Infinity,lastPointer=null,lastFast=-Infinity,near=false;
function set(name,next='reaction',duration=1400,now=performance.now()){
 emotion=name;state=next;poseAt=now;until=now+duration;target=vector(name);button.dataset.emotion=name;button.dataset.state=next;
 if(motion.matches){current=target.slice();paint(now,0);}
}
function choose(pool=names){const a=pool.filter(n=>n!==lastEmotion);return lastEmotion=a[Math.floor(Math.random()*a.length)];}
function paint(now,dt){
 const slow=['drowsy','yawning','sleeping','waking'].includes(state);
 const k=motion.matches?1:1-Math.exp(-dt/(slow?180:65));
 const elapsedPose=Math.max(0,now-poseAt);
 const wakeBlink=state==='waking'&&!motion.matches?Math.max(0,1-Math.abs(elapsedPose-100)/65,1-Math.abs(elapsedPose-300)/65):0;
 current=current.map((v,i)=>v+(target[i]-v)*k);
 for(const [el,x,offset] of [[left,82,0],[right,158,5]]){
  let [w,h,c,s,o]=current.slice(offset,offset+5);
  w+=(13-w)*wakeBlink;h*=1-wakeBlink;c*=1-wakeBlink;s+=(3-s)*wakeBlink;
  el.setAttribute('d',`M${x-w} ${77-h+o}Q${x} ${77+c+o} ${x+w} ${77+h+o}`);
  el.setAttribute('stroke-width',s);el.setAttribute('opacity',clamp(1-current[12]-current[17]-current[18],0,1));
 }
 hearts.setAttribute('opacity',current[12]);
 tears.setAttribute('opacity',current[16]);spirals.setAttribute('opacity',current[17]);scaredEyes.setAttribute('opacity',current[18]);wavyMouth.setAttribute('opacity',current[20]);mouth.setAttribute('opacity',1-current[20]);
 const smile=current[10],sleepAmount=current[23];
 const breathing=motion.matches?0:Math.sin(now/1750);
 // Gradual yawn: opens, peaks at one second and closes before sleep.
 const yawnProgress=state==='yawning'?clamp((now-activity-YAWN_IDLE)/(ASLEEP_IDLE-YAWN_IDLE),0,1):0;
 const open=state==='yawning'?current[11]*Math.sin(Math.PI*yawnProgress):clamp(current[11]+breathing*.08*sleepAmount,0,1);
 const mw=(12-open*5+current[19])*(1-.65*sleepAmount);
 // A closed smile is a single curve, not two overlapping strokes.
 const bottom=115+smile+open*17,top=115+smile-open*21;
 mouth.setAttribute('d',open>.025?`M${120-mw} 115Q120 ${bottom} ${120+mw} 115Q120 ${top} ${120-mw} 115Z`:`M${120-mw} 115Q120 ${115+smile} ${120+mw} 115`);
 mouth.setAttribute('fill-opacity',open>.025?open:0);
 const colorTarget=rgb(browserExit?'#ff777e':colors[emotion]||baseColor);
 const ck=motion.matches||browserExit?1:1-Math.exp(-dt/110);
 faceRgb=faceRgb.map((v,i)=>v+(colorTarget[i]-v)*ck);
 const faceColor=hexColor(faceRgb);
 face.setAttribute('stroke',faceColor);face.setAttribute('fill',faceColor);
 face.setAttribute('opacity',current[15]);blush.setAttribute('opacity',current[13]);glow.setAttribute('slope',current[14]);
 let aim=browserExit?{x:browserExit.x,y:-100}:pointer;
 if(!browserExit&&hover){const b=hover.el.getBoundingClientRect();aim={x:b.left+b.width/2,y:b.top+b.height/2};}
 let tx=0,ty=0;
 if(aim&&!['sleeping','yawning'].includes(state)&&!motion.matches){const b=svg.getBoundingClientRect();tx=clamp((aim.x-b.left-b.width/2)/Math.max(75,b.width*1.25),-1,1);ty=clamp((aim.y-b.top-b.height/2)/Math.max(75,b.width*1.25),-1,1);}
 const fatigue=state==='drowsy'?1-.85*clamp((now-activity-DROWSY_IDLE)/(YAWN_IDLE-DROWSY_IDLE),0,1):1;
 tx*=fatigue;ty*=fatigue;
 const ek=1-Math.exp(-dt/65),hk=1-Math.exp(-dt/150);
 gx+=(tx*14-gx)*ek;gy+=(ty*10-gy)*ek;hx+=(tx*3-hx)*hk;hy+=(ty*2-hy)*hk;tilt+=(tx*4-tilt)*hk;
 if(motion.matches)gx=gy=hx=hy=tilt=0;
 const shyOffset=emotion==='shy'?Math.sin(Math.min(elapsedPose,1200)/1200*Math.PI)*5:0;
 const eyeX=gx+shyOffset;
 eyes.setAttribute('transform',`translate(${eyeX} ${gy})`);
 mouth.setAttribute('transform',`translate(${eyeX*.42} ${gy*.42})`);
 wavyMouth.setAttribute('transform',`translate(${eyeX*.42} ${gy*.42})`);
 const heartScale=motion.matches?1:1+Math.sin(now/260)*.045*current[12];
 hearts.setAttribute('transform',`translate(${eyeX} ${gy}) translate(120 77) scale(${heartScale}) translate(-120 -77)`);
 const tearDrift=motion.matches?0:Math.sin(now/180)*2*current[16];
 tears.setAttribute('transform',`translate(${gx*.5} ${gy*.5+tearDrift})`);
 const spin=motion.matches?0:Math.sin(now/220)*15*current[17];
 spirals.setAttribute('transform',`translate(${gx} ${gy})`);
 spiralLeft.setAttribute('transform',`rotate(${spin} 82 77)`);spiralRight.setAttribute('transform',`rotate(${-spin} 158 77)`);
 scaredEyes.setAttribute('transform',`translate(${gx} ${gy})`);
 blush.setAttribute('transform',`translate(${gx*.35} ${gy*.35})`);
 shine.setAttribute('transform',`translate(${gx*.48} ${gy*.35})`);
 const breathe=motion.matches?0:Math.sin(now/1000)*1.2*(1-sleepAmount)+(3+breathing*2.2)*sleepAmount+Math.sin(now/85)*2.5*current[22];
 const fatigueDrop=state==='drowsy'||state==='yawning'?4*clamp((now-activity-DROWSY_IDLE)/(ASLEEP_IDLE-DROWSY_IDLE),0,1):0;
 const intro=motion.matches?0:Math.sin(Math.PI*clamp(elapsedPose/650,0,1));
 const jump=emotion==='excited'&&!motion.matches&&elapsedPose<1000?-5*Math.abs(Math.sin(elapsedPose/1000*Math.PI*2)):0;
 const nod=emotion==='happy'?-2.5*intro:emotion==='sad'?4*intro:emotion==='scared'?3*intro:emotion==='proud'?-3*intro:0;
 const poseTilt=emotion==='curious'?-5*intro:emotion==='confused'?5*Math.sin(elapsedPose/130)*intro:emotion==='shy'?3*intro:0;
 pulse*=Math.exp(-dt/170);
 const squash=motion.matches?0:Math.sin(pulse*Math.PI)*.09+breathing*.012*sleepAmount;
 const elapsed=browserExit?now-browserExit.at:emotion==='angry'?elapsedPose:Infinity;
 const shake=motion.matches||elapsed>=420?0:Math.sin(elapsed/25)*3*(1-elapsed/420);
 head.setAttribute('transform',`translate(${hx+shake} ${hy+breathe+jump+nod+(motion.matches?0:fatigueDrop)}) rotate(${tilt+current[21]+poseTilt+(motion.matches?0:(5+breathing*.65)*sleepAmount)} 120 90) translate(120 90) scale(${1+squash} ${1-squash}) translate(-120 -90)`);
 // Staggered rising Zs: each glyph fades in, drifts upward/right, and fades out.
 sleep.setAttribute('opacity',.9*sleepAmount);
 if(sleepAmount>.001){
  for(const [i,glyph] of sleepGlyphs.entries()){
   const phase=motion.matches?.45:((now/2600+i/3)%1);
   glyph.setAttribute('opacity',Math.sin(Math.PI*phase));
   glyph.setAttribute('transform',`translate(${192+phase*36} ${48-phase*42}) scale(${.75+phase*.45})`);
  }
 }
}
function resume(now){
 activity=now;idleAt=now+random(4000,8000);
 if(['sleeping','yawning','drowsy'].includes(state)){
  blinkAt=now+random(3000,6000);secondBlink=0;
  set('neutral','waking',WAKE_OPEN,now);
 }
}
function endContext(now){resume(now);blinkAt=now+random(3000,6000);secondBlink=0;normal(now);}
function normal(now){set('neutral',pointer?'tracking':'idle',Infinity,now);}
function tick(now){
 frame=0;if(document.hidden||motion.matches)return;
 if((mobile.matches||state==='sleeping')&&previous&&now-previous<1000/30-1){frame=requestAnimationFrame(tick);return;}
 if(touchUntil&&now>=touchUntil){pointer=null;touchUntil=0;}
 const dt=Math.min(50,Math.max(1,now-(previous||now-16)));previous=now;
 if(browserExit){if(emotion!=='angry'||state!=='context')set('angry','context',Infinity,now);}
 else if(hover){if(emotion!==hover.name)set(hover.name,'context',Infinity,now);}
 else if(state==='context')endContext(now);
 else if(state==='waking'){if(now>=until)set('happy','reaction',WAKE_SMILE,now);}
 else if(now-activity>=ASLEEP_IDLE){if(state!=='sleeping')set('sleepy','sleeping',Infinity,now);}
 else if(now-activity>=YAWN_IDLE){if(state!=='yawning')set('yawning','yawning',Infinity,now);}
 else if(now-activity>=DROWSY_IDLE){
  const phase=(now-activity-DROWSY_IDLE)%4000;
  const pose=phase>=2000&&phase<2650?'slow-blink':'drowsy';
  if(state!=='drowsy'||emotion!==pose)set(pose,'drowsy',Infinity,now);
 }
 else if(state==='reaction'&&now>=until)normal(now);
 else if(['idle','tracking'].includes(state)){
  if(now>=idleAt&&now-activity>=4000){set(choose(idleNames),'reaction',random(1000,2000),now);idleAt=now+random(4000,8000);}
  else if(now>=blinkAt||secondBlink&&now>=secondBlink){const second=!!secondBlink;secondBlink=0;set('blink','reaction',110,now);blinkAt=now+random(3000,6000);if(!second&&Math.random()<.25)secondBlink=now+310;}
 }
 paint(now,dt);frame=requestAnimationFrame(tick);
}
function start(){cancelAnimationFrame(frame);frame=0;previous=0;if(!document.hidden&&!motion.matches)frame=requestAnimationFrame(tick);}
function ripple(){if(motion.matches)return;const b=svg.getBoundingClientRect();window.dispatchEvent(new CustomEvent('mascot:ripple',{detail:{x:b.left+b.width/2,y:b.top+b.height/2}}));}
window.addEventListener('pointermove',e=>{
 const now=performance.now();
 lastInput=e.pointerType||'mouse';
 if(lastInput==='touch'){edgeMouse=null;endBrowserExit();return;}
 if(lastInput==='mouse'&&trackTopEdge(e,now))return;
 if(lastInput!=='mouse'){edgeMouse=null;endBrowserExit();}
 if(motion.matches)return;
 resume(now);touchUntil=0;pointer={x:e.clientX,y:e.clientY};
 const b=svg.getBoundingClientRect(),close=Math.hypot(e.clientX-b.left-b.width/2,e.clientY-b.top-b.height/2)<b.width*.65;
 if(!hover&&['idle','tracking'].includes(state)){
  if(lastPointer&&now-lastPointer.t>0&&now-lastPointer.t<100&&Math.hypot(e.clientX-lastPointer.x,e.clientY-lastPointer.y)/(now-lastPointer.t)>2.5&&now-lastFast>3500){lastFast=now;set('surprised','reaction',850,now);}
  else if(close&&!near)set('curious','reaction',900,now);
 }
 near=close;lastPointer={...pointer,t:now};
},{passive:true});
function clearPointer(){pointer=null;touchUntil=0;near=false;lastPointer=null;}
let reducedTimer;
// Browser chrome is inaccessible. Preview on an upward approach to the top edge,
// then confirm on any supported viewport-exit event. No actual tab hover is observable.
const EDGE_PREVIEW=14,EDGE_RELEASE=26,EDGE_EXIT=48;
function endBrowserExit(){if(!browserExit)return;browserExit=null;const now=performance.now();resume(now);blinkAt=now+random(3000,6000);secondBlink=0;if(hover)set(hover.name,'context',Infinity,now);else normal(now);}
function beginBrowserExit(x,confirmed,now=performance.now()){
 if(browserExit){browserExit.x=x;browserExit.confirmed||=confirmed;return;}
 clearTimeout(reducedTimer);clearPointer();hover=null;resume(now);
 browserExit={x,at:now,confirmed};set('angry','context',Infinity,now);
 // Render the angry face immediately, even if the browser delays the next animation frame.
 if(!motion.matches){current=target.slice();paint(now,100);}
}
function trackTopEdge(e,now){
 const previousMouse=edgeMouse;
 const upward=!!previousMouse&&now-previousMouse.at<=500&&e.clientY<previousMouse.y-1||e.movementY<0;
 edgeMouse={x:e.clientX,y:e.clientY,at:now,upward};
 if(browserExit?.confirmed){endBrowserExit();return false;}
 if(browserExit){
  if(e.clientY<=EDGE_RELEASE){browserExit.x=e.clientX;return true;}
  endBrowserExit();
 }
 if(e.clientY>=0&&e.clientY<=EDGE_PREVIEW&&upward){beginBrowserExit(e.clientX,false,now);return true;}
 return false;
}
function handleViewportExit(e){
 if((e.pointerType&&e.pointerType!=='mouse')||lastInput!=='mouse'||e.sourceCapabilities?.firesTouchEvents||e.relatedTarget)return;
 const now=performance.now(),y=e.clientY,x=e.clientX;
 if(!Number.isFinite(x)||!Number.isFinite(y))return;
 const recent=edgeMouse&&now-edgeMouse.at<=500;
 const side=(x<=0||x>=window.innerWidth)&&y>EDGE_PREVIEW;
 const top=!side&&(y<=EDGE_PREVIEW||y<=EDGE_EXIT&&recent&&edgeMouse.upward&&edgeMouse.y<=EDGE_EXIT);
 clearPointer();
 if(top){beginBrowserExit(x,true,now);}
 else{endBrowserExit();edgeMouse=null;}
}
const root=document.documentElement;
root.addEventListener('pointerleave',handleViewportExit);
root.addEventListener('mouseleave',handleViewportExit);
window.addEventListener('mouseout',handleViewportExit);
function returnFromBrowser(e){if((!e.pointerType||e.pointerType==='mouse')&&lastInput==='mouse'&&browserExit?.confirmed){edgeMouse=null;endBrowserExit();}}
root.addEventListener('pointerenter',returnFromBrowser);
root.addEventListener('mouseenter',returnFromBrowser);
window.addEventListener('blur',()=>{clearPointer();if(!browserExit)edgeMouse=null;});
function feedback(ms=18){try{if(typeof navigator.vibrate==='function')navigator.vibrate(ms);}catch{}}
function explicit(name,now=performance.now(),duration=1400){
 browserExit=null;hover=null;resume(now);set(name,'reaction',duration,now);
 if(motion.matches){clearTimeout(reducedTimer);reducedTimer=setTimeout(()=>normal(performance.now()),duration);}
}
window.addEventListener('pointerdown',e=>{
 if(e.isPrimary===false)return;
 const now=performance.now();
 if(e.pointerType!=='touch'){resume(now);return;}
 lastInput='touch';edgeMouse=null;endBrowserExit();
 resume(now);
 if(!motion.matches){pointer={x:e.clientX,y:e.clientY};touchUntil=now+1500;}
},{passive:true});
button.addEventListener('pointerdown',e=>{
 if(e.pointerType!=='touch'||!e.isPrimary)return;
 suppressClick=false;clearTimeout(pressTimer);
 press={id:e.pointerId,x:e.clientX,y:e.clientY};
 pressTimer=setTimeout(()=>{if(!press)return;suppressClick=true;explicit('confused');pulse=1;feedback(25);ripple();},550);
},{passive:true});
window.addEventListener('pointermove',e=>{
 if(press&&e.pointerId===press.id&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>12){clearTimeout(pressTimer);press=null;}
},{passive:true});
function release(e){if(press&&e.pointerId===press.id){clearTimeout(pressTimer);press=null;}if(e.type==='pointercancel')suppressClick=false;}
window.addEventListener('pointerup',release,{passive:true});
window.addEventListener('pointercancel',release,{passive:true});
button.addEventListener('contextmenu',e=>{if(press||suppressClick)e.preventDefault();});
button.addEventListener('click',e=>{
 if(suppressClick&&e.detail!==0){suppressClick=false;return;}
 suppressClick=false;
 const now=performance.now(),touch=e.pointerType==='touch'||(mobile.matches&&e.detail>0);
 clicks=now-lastClick<700?clicks+1:1;lastClick=now;
 const double=touch&&now-lastTouchTap<350;
 if(touch)lastTouchTap=double?-Infinity:now;
 pulse=1;explicit(double?'love':clicks>=3?(clicks%2?'confused':'angry'):choose(),now);
 feedback(double?25:18);ripple();
});
window.addEventListener('scroll',()=>{
 const y=window.scrollY,delta=y-lastScroll;lastScroll=y;
 if(Math.abs(delta)<2)return;
 const now=performance.now();resume(now);
 if(!mobile.matches||motion.matches)return;
 if(now-scrollAt<70)return;scrollAt=now;
 const b=svg.getBoundingClientRect();pointer={x:b.left+b.width/2,y:b.top+b.height/2+Math.sign(delta)*b.width};touchUntil=now+900;
},{passive:true});
window.addEventListener('keydown',()=>resume(performance.now()));
const contexts=[['.contact','excited'],['.social','curious'],['.hero h1','curious']];
for(const [selector,name] of contexts){const el=document.querySelector(selector);if(!el)continue;let inside=false,focused=false;
 function update(){if(browserExit)return;const now=performance.now();if(inside||focused){resume(now);hover={el,name};set(name,'context',Infinity,now);}else if(hover?.el===el){hover=null;endContext(now);}}
 el.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'){inside=true;update();}});el.addEventListener('pointerleave',()=>{inside=false;update();});
 if(selector!=='.hero h1'){
  let touchAt=-Infinity;
  el.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){touchAt=performance.now();inside=false;focused=false;explicit(selector==='.social'?'wink':'excited',touchAt,1200);}},{passive:true});
  el.addEventListener('focus',()=>{if(performance.now()-touchAt>1000){focused=true;update();}});el.addEventListener('blur',()=>{focused=false;update();});
 }
}
function reset(){faceRgb=rgb(baseColor);cancelAnimationFrame(frame);clearTimeout(reducedTimer);clearTimeout(pressTimer);press=null;suppressClick=false;browserExit=null;edgeMouse=null;hover=null;clearPointer();const now=performance.now();activity=now;idleAt=now+random(4000,8000);blinkAt=now+random(3000,6000);secondBlink=0;normal(now);start();}
document.addEventListener('visibilitychange',reset);motion.addEventListener('change',reset);mobile.addEventListener('change',reset);
set(motion.matches?'neutral':'happy',motion.matches?'idle':'reaction',1200);start();
}
