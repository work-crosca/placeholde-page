// Original parametric SVG animation. One state controller owns all expressions.
const button=document.querySelector('.mascot');
if(button){
const svg=button.querySelector('svg'),head=svg.querySelector('#head'),eyes=svg.querySelector('#eyes'),left=svg.querySelector('#eye-left'),right=svg.querySelector('#eye-right'),mouth=svg.querySelector('#mouth'),face=svg.querySelector('#face'),blush=svg.querySelector('#blush'),shine=svg.querySelector('#screen-shine'),glow=svg.querySelector('#face-glow-alpha'),hearts=svg.querySelector('#hearts'),tears=svg.querySelector('#tears'),spirals=svg.querySelector('#spiral-eyes'),scaredEyes=svg.querySelector('#scared-eyes'),wavyMouth=svg.querySelector('#wavy-mouth'),sleep=svg.querySelector('#sleep-symbols');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 700px), (pointer: coarse)');
let browserExit=null,edgeMouse=null,lastInput='mouse',touchUntil=0,press=null,pressTimer=0,suppressClick=false,lastTouchTap=-Infinity,lastScroll=window.scrollY,scrollAt=-Infinity;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const random=(a,b)=>a+Math.random()*(b-a);
// Eye geometry: horizontal half-span, vertical half-span, curve, stroke, offset.
const E=(w=0,h=10,c=0,s=20,o=0)=>[w,h,c,s,o];
const N=E();
const poses={
 neutral:[N,N,7,0],happy:[E(13,0,-23,8),E(13,0,-23,8),11,.65],
 sad:[E(11,-5,11,8),E(11,5,11,8),-13,0],
 surprised:[E(0,12,0,25),E(0,12,0,25),0,1],
 sleepy:[E(12,0,7,4),E(12,0,7,4),0,.45],
 love:[E(0,8,0,12),E(0,8,0,12),12,0],
 suspicious:[E(11,4,0,7),E(11,-4,0,7),-4,0],
 bored:[E(12,0,0,6),E(12,0,0,6),-3,0],
 confused:[E(9,3,-6,9),E(8,-3,4,9,6),-6,0],
 excited:[E(14,0,-26,10),E(14,0,-26,10),15,.85],
 shy:[E(9,0,-12,7,5),E(9,0,-12,7,5),9,0],
 angry:[E(13,7,1,10),E(13,-7,1,10),-12,0],
 curious:[E(0,12,0,20),E(0,7,0,15,2),5,0],
 wink:[E(0,10,0,18),E(11,0,-5,6),9,0],
 blink:[E(10,0,0,3),E(10,0,0,3),0,0],
 laughing:[E(14,0,-29,8),E(14,0,-29,8),15,1],
 scared:[E(0,12,0,23),E(0,12,0,23),0,1],
 crying:[E(12,-7,-2,8),E(12,7,-2,8),-15,0],
 dizzy:[E(0,10,0,18),E(0,10,0,18),0,0],
 proud:[E(12,0,10,6),E(12,0,10,6),10,0]
};
const names=Object.keys(poses).filter(n=>!['neutral','blink','sleepy','wink'].includes(n));
// Additional interpolated channels: blush, glow strength and screen-face brightness.
const accents={love:[.48,.38,1],shy:[.65,.25,1],excited:[.12,.58,1],happy:[.12,.35,1],sleepy:[0,.08,.55],surprised:[0,.42,1],angry:[0,.40,1],laughing:[.28,.48,1],scared:[0,.34,1],crying:[0,.2,.9],dizzy:[0,.24,1],proud:[.16,.32,1]};
const colors={angry:'#ff777e',love:'#f9a1cb',sad:'#81aef3',sleepy:'#759fc4',scared:'#d0eaff',crying:'#81b8ff',dizzy:'#c3b7ff'};
// Extra channels: tears, spiral eyes, hollow eyes, mouth width, wavy mouth, proud tilt, laugh bounce.
const vector=n=>[...poses[n][0],...poses[n][1],...poses[n].slice(2),n==='love'?1:0,...(accents[n]||[0,.22,1]),n==='crying'?1:0,n==='dizzy'?1:0,n==='scared'?1:0,n==='laughing'?10:n==='proud'?3:0,n==='dizzy'?1:0,n==='proud'?-5:0,n==='laughing'?1:0];
let current=vector('neutral'),target=current.slice(),state='idle',emotion='neutral',lastEmotion='',until=0,frame=0,previous=0,activity=performance.now(),idleAt=activity+random(4000,8000),blinkAt=activity+random(3000,6000),secondBlink=0,hover=null,pointer=null,gx=0,gy=0,hx=0,hy=0,tilt=0,pulse=0,clicks=0,lastClick=-Infinity,lastPointer=null,lastFast=-Infinity,near=false;
function set(name,next='reaction',duration=1400,now=performance.now()){
 emotion=name;state=next;until=now+duration;target=vector(name);button.dataset.emotion=name;button.dataset.state=next;
 if(motion.matches){current=target.slice();paint(now,0);}
}
function choose(){const a=names.filter(n=>n!==lastEmotion);return lastEmotion=a[Math.floor(Math.random()*a.length)];}
function paint(now,dt){
 const k=motion.matches?1:1-Math.exp(-dt/55);
 current=current.map((v,i)=>v+(target[i]-v)*k);
 for(const [el,x,offset] of [[left,85,0],[right,155,5]]){
  const [w,h,c,s,o]=current.slice(offset,offset+5);
  el.setAttribute('d',`M${x-w} ${79-h+o}Q${x} ${79+c+o} ${x+w} ${79+h+o}`);
  el.setAttribute('stroke-width',s);el.setAttribute('opacity',clamp(1-current[12]-current[17]-current[18],0,1));
 }
 hearts.setAttribute('opacity',current[12]);
 tears.setAttribute('opacity',current[16]);spirals.setAttribute('opacity',current[17]);scaredEyes.setAttribute('opacity',current[18]);wavyMouth.setAttribute('opacity',current[20]);mouth.setAttribute('opacity',1-current[20]);
 const smile=current[10],open=current[11];
 const mw=10-open*4+current[19];
 mouth.setAttribute('d',`M${120-mw} 116Q120 ${116+smile+open*14} ${120+mw} 116Q120 ${116+smile-open*22} ${120-mw} 116Z`);
 mouth.setAttribute('fill-opacity',open);
 const faceColor=browserExit?'#ff777e':colors[emotion]||'#9fd8ff';
 face.setAttribute('stroke',faceColor);face.setAttribute('fill',faceColor);
 face.setAttribute('opacity',current[15]);blush.setAttribute('opacity',current[13]);glow.setAttribute('slope',current[14]);
 let aim=browserExit?{x:browserExit.x,y:-100}:pointer;
 if(!browserExit&&hover){const b=hover.el.getBoundingClientRect();aim={x:b.left+b.width/2,y:b.top+b.height/2};}
 let tx=0,ty=0;
 if(aim&&state!=='sleeping'&&!motion.matches){const b=svg.getBoundingClientRect();tx=clamp((aim.x-b.left-b.width/2)/Math.max(75,b.width*1.25),-1,1);ty=clamp((aim.y-b.top-b.height/2)/Math.max(75,b.width*1.25),-1,1);}
 const ek=1-Math.exp(-dt/65),hk=1-Math.exp(-dt/150);
 gx+=(tx*14-gx)*ek;gy+=(ty*10-gy)*ek;hx+=(tx*3-hx)*hk;hy+=(ty*2-hy)*hk;tilt+=(tx*4-tilt)*hk;
 if(motion.matches)gx=gy=hx=hy=tilt=0;
 eyes.setAttribute('transform',`translate(${gx} ${gy})`);
 hearts.setAttribute('transform',`translate(${gx} ${gy})`);
 const tearDrift=motion.matches?0:Math.sin(now/180)*2*current[16];
 tears.setAttribute('transform',`translate(${gx*.5} ${gy*.5+tearDrift})`);
 const spin=motion.matches?0:Math.sin(now/220)*15*current[17];
 spirals.setAttribute('transform',`translate(${gx} ${gy}) rotate(${spin} 120 79)`);
 scaredEyes.setAttribute('transform',`translate(${gx} ${gy})`);
 blush.setAttribute('transform',`translate(${gx*.35} ${gy*.35})`);
 shine.setAttribute('transform',`translate(${gx*.48} ${gy*.35})`);
 const breathe=motion.matches?0:Math.sin(now/1000)*1.8+Math.sin(now/85)*2.5*current[22];
 pulse*=Math.exp(-dt/170);
 const squash=motion.matches?0:Math.sin(pulse*Math.PI)*.09;
 const elapsed=browserExit?now-browserExit.at:Infinity;
 const shake=motion.matches||elapsed>=420?0:Math.sin(elapsed/25)*3*(1-elapsed/420);
 head.setAttribute('transform',`translate(${hx+shake} ${hy+breathe}) rotate(${tilt+current[21]} 120 90) translate(120 90) scale(${1+squash} ${1-squash}) translate(-120 -90)`);
 sleep.setAttribute('opacity',state==='sleeping'?'0.85':'0');
}
function resume(now){activity=now;idleAt=now+random(4000,8000);if(state==='sleeping'){set('happy','reaction',1000,now);}}
function normal(now){set('neutral',pointer?'tracking':'idle',Infinity,now);}
function tick(now){
 frame=0;if(document.hidden||motion.matches)return;
 if(mobile.matches&&previous&&now-previous<1000/30-1){frame=requestAnimationFrame(tick);return;}
 if(touchUntil&&now>=touchUntil){pointer=null;touchUntil=0;}
 const dt=Math.min(50,Math.max(1,now-(previous||now-16)));previous=now;
 if(browserExit){if(emotion!=='angry'||state!=='context')set('angry','context',Infinity,now);}
 else if(hover){if(emotion!==hover.name)set(hover.name,'context',Infinity,now);}
 else if(state==='context')normal(now);
 else if(now-activity>=30000&&state!=='sleeping')set('sleepy','sleeping',Infinity,now);
 else if(state==='reaction'&&now>=until)normal(now);
 else if(['idle','tracking'].includes(state)){
  if(now>=idleAt&&now-activity>=4000){set(choose(),'reaction',random(1000,2000),now);idleAt=now+random(4000,8000);}
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
 if(e.pointerType!=='touch'||!e.isPrimary)return;
 lastInput='touch';edgeMouse=null;endBrowserExit();
 const now=performance.now();resume(now);
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
 if(!mobile.matches||motion.matches||Math.abs(delta)<2)return;
 const now=performance.now();resume(now);
 if(now-scrollAt<70)return;scrollAt=now;
 const b=svg.getBoundingClientRect();pointer={x:b.left+b.width/2,y:b.top+b.height/2+Math.sign(delta)*b.width};touchUntil=now+900;
},{passive:true});
const contexts=[['.contact','excited'],['.social','curious'],['.hero h1','curious']];
for(const [selector,name] of contexts){const el=document.querySelector(selector);if(!el)continue;let inside=false,focused=false;
 function update(){if(browserExit)return;const now=performance.now();if(inside||focused){resume(now);hover={el,name};set(name,'context',Infinity,now);}else if(hover?.el===el){hover=null;normal(now);}}
 el.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'){inside=true;update();}});el.addEventListener('pointerleave',()=>{inside=false;update();});
 if(selector!=='.hero h1'){
  let touchAt=-Infinity;
  el.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){touchAt=performance.now();inside=false;focused=false;explicit(selector==='.social'?'wink':'excited',touchAt,1200);}},{passive:true});
  el.addEventListener('focus',()=>{if(performance.now()-touchAt>1000){focused=true;update();}});el.addEventListener('blur',()=>{focused=false;update();});
 }
}
function reset(){cancelAnimationFrame(frame);clearTimeout(reducedTimer);clearTimeout(pressTimer);press=null;suppressClick=false;browserExit=null;edgeMouse=null;hover=null;clearPointer();const now=performance.now();activity=now;idleAt=now+random(4000,8000);blinkAt=now+random(3000,6000);secondBlink=0;normal(now);start();}
document.addEventListener('visibilitychange',reset);motion.addEventListener('change',reset);mobile.addEventListener('change',reset);
set(motion.matches?'neutral':'happy',motion.matches?'idle':'reaction',1200);start();
}
