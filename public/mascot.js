import {motion} from './motion-preference.js';
import {names,idleNames,colors,baseColor,rgb,hexColor,DROWSY_IDLE,YAWN_IDLE,ASLEEP_IDLE,WAKE_OPEN,WAKE_SMILE,vector} from './mascot/expressions.js';
import {attachPlacement} from './mascot/placement.js';
import {createMood} from './mascot/mood.js';
// Original parametric SVG animation. One state controller owns all expressions.
const button=document.querySelector('.mascot');
if(button){
const svg=button.querySelector('svg'),head=svg.querySelector('#head'),eyes=svg.querySelector('#eyes'),left=svg.querySelector('#eye-left'),right=svg.querySelector('#eye-right'),mouth=svg.querySelector('#mouth'),face=svg.querySelector('#face'),blush=svg.querySelector('#blush'),shine=svg.querySelector('#screen-shine'),glow=svg.querySelector('#face-glow-alpha'),hearts=svg.querySelector('#hearts'),tears=svg.querySelector('#tears'),spirals=svg.querySelector('#spiral-eyes'),scaredEyes=svg.querySelector('#scared-eyes'),wavyMouth=svg.querySelector('#wavy-mouth'),sleep=svg.querySelector('#sleep-symbols');
const spiralLeft=svg.querySelector('#spiral-left'),spiralRight=svg.querySelector('#spiral-right');
const sleepGlyphs=['#sleep-z1','#sleep-z2','#sleep-z3'].map(id=>svg.querySelector(id));
// The shared motion preference is provided by the ES module import.
const mobile=matchMedia('(max-width: 700px), (pointer: coarse)');
const coarse=matchMedia('(pointer: coarse)');
let browserExit=null,edgeMouse=null,lastInput='mouse',touchUntil=0,press=null,pressTimer=0,suppressClick=false,lastTouchTap=-Infinity,lastScroll=window.scrollY,scrollAt=-Infinity;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const random=(a,b)=>a+Math.random()*(b-a);
let mascotBounds=null;
function invalidateBounds(){mascotBounds=null;}
function bounds(){return mascotBounds??=svg.getBoundingClientRect();}
window.addEventListener('resize',invalidateBounds,{passive:true});
window.visualViewport?.addEventListener('resize',invalidateBounds,{passive:true});
window.visualViewport?.addEventListener('scroll',invalidateBounds,{passive:true});
if(typeof ResizeObserver==='function')new ResizeObserver(invalidateBounds).observe(svg);
// Skip identical SVG writes, including inactive expression layers.
const attributes=new WeakMap();
function attr(el,key,value){
 const v=typeof value==='number'?String(Math.round(value*1000)/1000):(key==='d'||key==='transform')?String(value).replace(/-?(?:\d+\.\d+(?:e[+-]?\d+)?|\d+e[+-]?\d+)/gi,n=>String(Math.round(Number(n)*1000)/1000)):String(value);
 let last=attributes.get(el);if(!last){last=new Map();attributes.set(el,last);}
 if(last.get(key)!==v){last.set(key,v);el.setAttribute(key,v);}
}
let faceRgb=rgb(baseColor),poseAt=0;
let current=vector('neutral'),target=current.slice(),state='idle',emotion='neutral',lastEmotion='',until=0,frame=0,previous=0,activity=performance.now(),idleAt=activity+random(4000,8000),blinkAt=activity+random(3000,6000),secondBlink=0,hover=null,pointer=null,gx=0,gy=0,hx=0,hy=0,tilt=0,pulse=0,clicks=0,lastClick=-Infinity,lastPointer=null,lastFast=-Infinity,near=false;
const mood=createMood(activity);
function set(name,next='reaction',duration=1400,now=performance.now()){
 clearTimeout(reducedTimer);reducedTimer=undefined;
 emotion=name;state=next;poseAt=now;until=now+duration;target=vector(name);button.dataset.emotion=name;button.dataset.state=next;
 if(motion.matches){current=target.slice();paint(now,0);}
}
function choose(pool=names){return lastEmotion=mood.choose(pool,lastEmotion,performance.now());}
function paint(now,dt){
 const slow=['drowsy','yawning','sleeping','waking'].includes(state);
 const k=motion.matches?1:1-Math.exp(-dt/(slow?180:65));
 const elapsedPose=Math.max(0,now-poseAt);
 const wakeBlink=state==='waking'&&!motion.matches?Math.max(0,1-Math.abs(elapsedPose-100)/65,1-Math.abs(elapsedPose-300)/65):0;
 current=current.map((v,i)=>v+(target[i]-v)*k);
 for(const [el,x,offset] of [[left,82,0],[right,158,5]]){
  let [w,h,c,s,o]=current.slice(offset,offset+5);
  w+=(13-w)*wakeBlink;h*=1-wakeBlink;c*=1-wakeBlink;s+=(3-s)*wakeBlink;
  attr(el,'d',`M${x-w} ${77-h+o}Q${x} ${77+c+o} ${x+w} ${77+h+o}`);
  attr(el,'stroke-width',s);attr(el,'opacity',clamp(1-current[12]-current[17]-current[18],0,1));
 }
 attr(hearts,'opacity',current[12]);
 attr(tears,'opacity',current[16]);attr(spirals,'opacity',current[17]);attr(scaredEyes,'opacity',current[18]);attr(wavyMouth,'opacity',current[20]);attr(mouth,'opacity',1-current[20]);
 const smile=current[10],sleepAmount=current[23];
 const breathing=motion.matches?0:Math.sin(now/1750);
 // Gradual yawn: opens, peaks at one second and closes before sleep.
 const yawnProgress=state==='yawning'?clamp((now-activity-YAWN_IDLE)/(ASLEEP_IDLE-YAWN_IDLE),0,1):0;
 const open=state==='yawning'?current[11]*Math.sin(Math.PI*yawnProgress):clamp(current[11]+breathing*.08*sleepAmount,0,1);
 const mw=(12-open*5+current[19])*(1-.65*sleepAmount);
 // A closed smile is a single curve, not two overlapping strokes.
 const bottom=115+smile+open*17,top=115+smile-open*21;
 attr(mouth,'d',open>.025?`M${120-mw} 115Q120 ${bottom} ${120+mw} 115Q120 ${top} ${120-mw} 115Z`:`M${120-mw} 115Q120 ${115+smile} ${120+mw} 115`);
 attr(mouth,'fill-opacity',open>.025?open:0);
 const colorTarget=rgb(browserExit?'#ff777e':colors[emotion]||baseColor);
 const ck=motion.matches||browserExit?1:1-Math.exp(-dt/110);
 faceRgb=faceRgb.map((v,i)=>v+(colorTarget[i]-v)*ck);
 const faceColor=hexColor(faceRgb);
 attr(face,'stroke',faceColor);attr(face,'fill',faceColor);
 attr(face,'opacity',current[15]);attr(blush,'opacity',current[13]);attr(glow,'slope',current[14]);
 let aim=browserExit?{x:browserExit.x,y:-100}:pointer;
 if(!browserExit&&hover){const b=hover.el.getBoundingClientRect();aim={x:b.left+b.width/2,y:b.top+b.height/2};}
 let tx=0,ty=0;
 if(aim&&!['sleeping','yawning'].includes(state)&&!motion.matches){const b=bounds();tx=clamp((aim.x-b.left-b.width/2)/Math.max(75,b.width*1.25),-1,1);ty=clamp((aim.y-b.top-b.height/2)/Math.max(75,b.width*1.25),-1,1);}
 const fatigue=state==='drowsy'?1-.85*clamp((now-activity-DROWSY_IDLE)/(YAWN_IDLE-DROWSY_IDLE),0,1):1;
 tx*=fatigue;ty*=fatigue;
 const ek=1-Math.exp(-dt/65),hk=1-Math.exp(-dt/150);
 gx+=(tx*14-gx)*ek;gy+=(ty*10-gy)*ek;hx+=(tx*3-hx)*hk;hy+=(ty*2-hy)*hk;tilt+=(tx*4-tilt)*hk;
 if(motion.matches)gx=gy=hx=hy=tilt=0;
 const shyOffset=emotion==='shy'&&!motion.matches?Math.sin(Math.min(elapsedPose,1200)/1200*Math.PI)*5:0;
 const eyeX=gx+shyOffset;
 attr(eyes,'transform',`translate(${eyeX} ${gy})`);
 attr(mouth,'transform',`translate(${eyeX*.42} ${gy*.42})`);
 attr(wavyMouth,'transform',`translate(${eyeX*.42} ${gy*.42})`);
 const heartScale=motion.matches?1:1+Math.sin(now/260)*.045*current[12];
 if(current[12]>.001)attr(hearts,'transform',`translate(${eyeX} ${gy}) translate(120 77) scale(${heartScale}) translate(-120 -77)`);
 const tearDrift=motion.matches?0:Math.sin(now/180)*2*current[16];
 if(current[16]>.001)attr(tears,'transform',`translate(${gx*.5} ${gy*.5+tearDrift})`);
 const spin=motion.matches?0:Math.sin(now/220)*15*current[17];
 if(current[17]>.001){attr(spirals,'transform',`translate(${gx} ${gy})`);attr(spiralLeft,'transform',`rotate(${spin} 82 77)`);attr(spiralRight,'transform',`rotate(${-spin} 158 77)`);}
 if(current[18]>.001)attr(scaredEyes,'transform',`translate(${gx} ${gy})`);
 attr(blush,'transform',`translate(${gx*.35} ${gy*.35})`);
 attr(shine,'transform',`translate(${gx*.48} ${gy*.35})`);
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
 attr(head,'transform',`translate(${hx+shake} ${hy+breathe+jump+nod+(motion.matches?0:fatigueDrop)}) rotate(${tilt+current[21]+poseTilt+(motion.matches?0:(5+breathing*.65)*sleepAmount)} 120 90) translate(120 90) scale(${1+squash} ${1-squash}) translate(-120 -90)`);
 // Staggered rising Zs: each glyph fades in, drifts upward/right, and fades out.
 attr(sleep,'opacity',.9*sleepAmount);
 if(sleepAmount>.001){
  for(const [i,glyph] of sleepGlyphs.entries()){
   const phase=motion.matches?.45:((now/2600+i/3)%1);
   attr(glyph,'opacity',Math.sin(Math.PI*phase));
   attr(glyph,'transform',`translate(${192+phase*36} ${48-phase*42}) scale(${.75+phase*.45})`);
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
 frame=0;if(document.hidden||motion.matches||button.dataset.placement==='hidden')return;
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
 else if(state==='reaction'&&now>=until){if(!restoreContext(now))normal(now);}
 else if(['idle','tracking'].includes(state)){
  if(now>=idleAt&&now-activity>=4000){set(choose(idleNames),'reaction',random(1000,2000),now);idleAt=now+random(4000,8000);}
  else if(now>=blinkAt||secondBlink&&now>=secondBlink){const second=!!secondBlink;secondBlink=0;set('blink','reaction',110,now);blinkAt=now+random(3000,6000);if(!second&&Math.random()<.25)secondBlink=now+310;}
 }
 paint(now,dt);frame=requestAnimationFrame(tick);
}
function start(){cancelAnimationFrame(frame);frame=0;previous=0;if(!document.hidden&&!motion.matches&&button.dataset.placement!=='hidden')frame=requestAnimationFrame(tick);}
function ripple(){if(motion.matches)return;const b=bounds();window.dispatchEvent(new CustomEvent('mascot:ripple',{detail:{x:b.left+b.width/2,y:b.top+b.height/2}}));}
window.addEventListener('pointermove',e=>{
 const now=performance.now();
 lastInput=e.pointerType||'mouse';
 if(lastInput==='touch'){edgeMouse=null;endBrowserExit();return;}
 if(lastInput==='mouse'&&trackTopEdge(e,now))return;
 if(lastInput!=='mouse'){edgeMouse=null;endBrowserExit();}
 if(motion.matches)return;
 resume(now);touchUntil=0;pointer={x:e.clientX,y:e.clientY};
 const b=bounds(),close=Math.hypot(e.clientX-b.left-b.width/2,e.clientY-b.top-b.height/2)<b.width*.65;
 if(!hover&&['idle','tracking'].includes(state)){
  if(lastPointer&&now-lastPointer.t>0&&now-lastPointer.t<100&&Math.hypot(e.clientX-lastPointer.x,e.clientY-lastPointer.y)/(now-lastPointer.t)>2.5&&now-lastFast>3500){lastFast=now;set('dizzy','reaction',1000,now);}
  else if(close&&!near)set('curious','reaction',900,now);
 }
 near=close;lastPointer={...pointer,t:now};
},{passive:true});
function clearPointer(){pointer=null;touchUntil=0;near=false;lastPointer=null;}
let reducedTimer,edgeTimer;
const activeContexts=[];
function clearEdge(){clearTimeout(edgeTimer);edgeTimer=undefined;browserExit=null;}
function restoreContext(now){
 const next=activeContexts.find(c=>c.inside)||activeContexts.find(c=>c.focused);
 hover=next||null;
 if(hover){resume(now);if(state!=='context'||emotion!==hover.name)set(hover.name,'context',Infinity,now);return true;}
 return false;
}
// Browser chrome is inaccessible. Preview on an upward approach to the top edge,
// then confirm on any supported viewport-exit event. No actual tab hover is observable.
const EDGE_PREVIEW=14,EDGE_RELEASE=26,EDGE_EXIT=48,EDGE_TIMEOUT=1800;
function endBrowserExit(){if(!browserExit)return;clearEdge();const now=performance.now();resume(now);blinkAt=now+random(3000,6000);secondBlink=0;if(!restoreContext(now))normal(now);}
function beginBrowserExit(x,confirmed,now=performance.now()){
 if(browserExit){browserExit.x=x;browserExit.confirmed||=confirmed;if(browserExit.confirmed){clearTimeout(edgeTimer);edgeTimer=undefined;}return;}
 clearTimeout(reducedTimer);clearPointer();hover=null;resume(now);
 browserExit={x,at:now,confirmed};set('angry','context',Infinity,now);
 if(!confirmed)edgeTimer=setTimeout(()=>{if(browserExit&&!browserExit.confirmed)endBrowserExit();},EDGE_TIMEOUT);
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
 clearEdge();hover=null;resume(now);mood.react(name,now);set(name,'reaction',duration,now);
 if(motion.matches)reducedTimer=setTimeout(()=>{if(state==='reaction'&&emotion===name){const at=performance.now();if(!restoreContext(at))normal(at);}},duration);
}
window.addEventListener('pointerdown',e=>{
 if(e.isPrimary===false)return;
 const now=performance.now();
 if(e.pointerType!=='touch'){lastInput=e.pointerType||'mouse';resume(now);return;}
 lastInput='touch';edgeMouse=null;endBrowserExit();
 resume(now);
 if(!motion.matches){pointer={x:e.clientX,y:e.clientY};touchUntil=now+1500;}
},{passive:true});
button.addEventListener('pointerdown',e=>{
 if(e.pointerType!=='touch'||!e.isPrimary)return;
 suppressClick=false;clearTimeout(pressTimer);
 press={id:e.pointerId,x:e.clientX,y:e.clientY};
 pressTimer=setTimeout(()=>{if(!press)return;suppressClick=true;explicit('happy');pulse=1;feedback(25);ripple();},550);
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
 const now=performance.now(),touch=e.pointerType?e.pointerType==='touch':e.detail>0&&lastInput==='touch'&&coarse.matches;
 clicks=now-lastClick<700?clicks+1:1;lastClick=now;
 const double=touch&&now-lastTouchTap<350;
 if(touch)lastTouchTap=double?-Infinity:now;
 pulse=1;explicit(double?'love':clicks>=3?(clicks%2?'confused':'angry'):choose(),now);
 feedback(double?25:18);ripple();
});
window.addEventListener('scroll',()=>{
 invalidateBounds();
 const y=window.scrollY,delta=y-lastScroll;lastScroll=y;
 if(Math.abs(delta)<2)return;
 const now=performance.now();resume(now);
 if(!mobile.matches||motion.matches)return;
 if(now-scrollAt<70)return;scrollAt=now;
 const b=bounds();pointer={x:b.left+b.width/2,y:b.top+b.height/2+Math.sign(delta)*b.width};touchUntil=now+900;
},{passive:true});
window.addEventListener('keydown',()=>resume(performance.now()));
const contexts=[['.contact','excited'],['.social','curious'],['.hero h1','curious']];
for(const [selector,name] of contexts){
 const el=document.querySelector(selector);if(!el)continue;
 const context={el,name,inside:false,focused:false,touchAt:-Infinity};
 activeContexts.push(context);
 function update(){
  if(browserExit||document.hidden)return;
  const now=performance.now();
  if(!restoreContext(now)&&hover===null&&state==='context')endContext(now);
 }
 el.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'){context.inside=true;update();}});
 el.addEventListener('pointerleave',()=>{context.inside=false;update();});
 if(selector!=='.hero h1'){
  el.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){context.touchAt=performance.now();context.inside=false;context.focused=false;explicit(selector==='.social'?'wink':'excited',context.touchAt,1200);}},{passive:true});
  el.addEventListener('focus',()=>{if(performance.now()-context.touchAt>1000){context.focused=true;update();}});
  el.addEventListener('blur',()=>{context.focused=false;update();});
 }
}
function reset(){
 faceRgb=rgb(baseColor);cancelAnimationFrame(frame);clearTimeout(reducedTimer);clearTimeout(pressTimer);clearEdge();
 press=null;suppressClick=false;edgeMouse=null;hover=null;clearPointer();invalidateBounds();
 const now=performance.now();activity=now;idleAt=now+random(4000,8000);blinkAt=now+random(3000,6000);secondBlink=0;
 for(const context of activeContexts){
  context.inside=!document.hidden&&lastInput!=='touch'&&Boolean(context.el.matches?.(':hover'));
  context.focused=context.el===document.activeElement&&now-context.touchAt>1000;
 }
 if(document.hidden||!restoreContext(now))normal(now);
 start();
}
let hiddenAt=0;
document.addEventListener('visibilitychange',()=>{
 const now=performance.now();
 if(document.hidden){hiddenAt=now;reset();return;}
 const wasAway=hiddenAt&&now-hiddenAt>=1000;hiddenAt=0;reset();
 if(wasAway&&!motion.matches&&!hover)set('happy','reaction',1400,now);
});
function ambient(name){
 if(document.hidden||motion.matches||browserExit||hover||button.dataset.placement==='hidden')return;
 const now=performance.now();resume(now);mood.react(name,now);set(name,'reaction',1600,now);
}
window.addEventListener('offline',()=>ambient('confused'));
window.addEventListener('online',()=>ambient('excited'));
window.addEventListener('mirco:celebrate',()=>explicit('love',performance.now(),2200));
motion.addEventListener('change',reset);mobile.addEventListener('change',reset);
set(motion.matches?'neutral':'happy',motion.matches?'idle':'reaction',1200);start();
attachPlacement({button,document,window,onChange(){invalidateBounds();start();}});
}
