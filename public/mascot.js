import {motion} from './motion-preference.js';
import {names,idleNames,baseColor,rgb,DROWSY_IDLE,YAWN_IDLE,ASLEEP_IDLE,WAKE_OPEN,WAKE_SMILE,vector} from './mascot/expressions.js';
import {attachPlacement} from './mascot/placement.js';
import {createAttributeWriter,renderPose} from './mascot/renderer.js';
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
const random=(a,b)=>a+Math.random()*(b-a);
let mascotBounds=null;
function invalidateBounds(){mascotBounds=null;}
function bounds(){return mascotBounds??=svg.getBoundingClientRect();}
window.addEventListener('resize',invalidateBounds,{passive:true});
window.visualViewport?.addEventListener('resize',invalidateBounds,{passive:true});
window.visualViewport?.addEventListener('scroll',invalidateBounds,{passive:true});
if(typeof ResizeObserver==='function')new ResizeObserver(invalidateBounds).observe(svg);
const attr=createAttributeWriter();
let faceRgb=rgb(baseColor),poseAt=0;
let current=vector('neutral'),target=current.slice(),state='idle',emotion='neutral',lastEmotion='',until=0,frame=0,previous=0,activity=performance.now(),idleAt=activity+random(4000,8000),blinkAt=activity+random(3000,6000),secondBlink=0,hover=null,pointer=null,gx=0,gy=0,hx=0,hy=0,tilt=0,pulse=0,clicks=0,lastClick=-Infinity,lastPointer=null,lastFast=-Infinity,near=false;
function set(name,next='reaction',duration=1400,now=performance.now()){
 clearTimeout(reducedTimer);reducedTimer=undefined;
 emotion=name;state=next;poseAt=now;until=now+duration;target=vector(name);button.dataset.emotion=name;button.dataset.state=next;
 if(motion.matches){current=target.slice();paint(now,0);}
}
function choose(pool=names){const a=pool.filter(n=>n!==lastEmotion);return lastEmotion=a[Math.floor(Math.random()*a.length)];}
function paint(now,dt){
 ({current,faceRgb,gx,gy,hx,hy,tilt,pulse}=renderPose({state,emotion,poseAt,target,motion,activity,browserExit,pointer,hover,bounds,attr,left,right,hearts,tears,spirals,scaredEyes,wavyMouth,mouth,face,blush,glow,eyes,spiralLeft,spiralRight,shine,head,sleep,sleepGlyphs,current,faceRgb,gx,gy,hx,hy,tilt,pulse},now,dt));
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
  if(lastPointer&&now-lastPointer.t>0&&now-lastPointer.t<100&&Math.hypot(e.clientX-lastPointer.x,e.clientY-lastPointer.y)/(now-lastPointer.t)>2.5&&now-lastFast>3500){lastFast=now;set('surprised','reaction',850,now);}
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
 clearEdge();hover=null;resume(now);set(name,'reaction',duration,now);
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
document.addEventListener('visibilitychange',reset);motion.addEventListener('change',reset);mobile.addEventListener('change',reset);
set(motion.matches?'neutral':'happy',motion.matches?'idle':'reaction',1200);start();
attachPlacement({button,document,window,onChange(){invalidateBounds();start();}});
}
