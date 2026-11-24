// Original parametric SVG animation. One state controller owns all expressions.
const button=document.querySelector('.mascot');
if(button){
const svg=button.querySelector('svg'),head=svg.querySelector('#head'),eyes=svg.querySelector('#eyes'),left=svg.querySelector('#eye-left'),right=svg.querySelector('#eye-right'),mouth=svg.querySelector('#mouth'),hearts=svg.querySelector('#hearts'),sleep=svg.querySelector('#sleep-symbols');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const random=(a,b)=>a+Math.random()*(b-a);
// Eye geometry: horizontal half-span, vertical half-span, curve, stroke, offset.
const E=(w=0,h=10,c=0,s=18,o=0)=>[w,h,c,s,o];
const N=E();
const poses={
 neutral:[N,N,0,0],happy:[E(13,0,-19,8),E(13,0,-19,8),15,0],
 sad:[E(10,0,9,8,-2),E(10,0,9,8,-2),-11,0],
 surprised:[E(0,12,0,23),E(0,12,0,23),0,1],
 sleepy:[E(12,0,5,5),E(12,0,5,5),0,0],
 love:[E(0,8,0,12),E(0,8,0,12),12,0],
 suspicious:[E(11,4,0,7),E(11,-4,0,7),-4,0],
 bored:[E(12,0,0,6),E(12,0,0,6),-3,0],
 confused:[E(9,3,-6,9),E(8,-3,4,9,6),-6,0],
 excited:[E(13,0,-24,10),E(13,0,-24,10),18,0],
 shy:[E(9,0,-12,7,5),E(9,0,-12,7,5),9,0],
 angry:[E(11,6,0,9),E(11,-6,0,9),-8,0],
 curious:[E(0,11,0,17),E(0,7,0,14),5,0],
 blink:[E(10,0,0,3),E(10,0,0,3),0,0]
};
const names=Object.keys(poses).filter(n=>!['neutral','blink','sleepy'].includes(n));
const vector=n=>[...poses[n][0],...poses[n][1],...poses[n].slice(2),n==='love'?1:0];
let current=vector('neutral'),target=current.slice(),state='idle',emotion='neutral',lastEmotion='',until=0,frame=0,previous=0,activity=performance.now(),idleAt=activity+random(4000,8000),blinkAt=activity+random(3000,6000),secondBlink=0,hover=null,pointer=null,gx=0,gy=0,hx=0,hy=0,tilt=0,pulse=0,clicks=0,lastClick=-Infinity,lastPointer=null,lastFast=-Infinity,near=false;
function set(name,next='reaction',duration=1400,now=performance.now()){
 emotion=name;state=next;until=now+duration;target=vector(name);button.dataset.emotion=name;button.dataset.state=next;
 if(motion.matches){current=target.slice();paint(now,0);}
}
function choose(){const a=names.filter(n=>n!==lastEmotion);return lastEmotion=a[Math.floor(Math.random()*a.length)];}
function paint(now,dt){
 const k=motion.matches?1:1-Math.exp(-dt/55);
 current=current.map((v,i)=>v+(target[i]-v)*k);
 for(const [el,x,offset] of [[left,81,0],[right,159,5]]){
  const [w,h,c,s,o]=current.slice(offset,offset+5);
  el.setAttribute('d',`M${x-w} ${79-h+o}Q${x} ${79+c+o} ${x+w} ${79+h+o}`);
  el.setAttribute('stroke-width',s);el.setAttribute('opacity',1-current[12]);
 }
 hearts.setAttribute('opacity',current[12]);
 const smile=current[10],open=current[11];
 mouth.setAttribute('d',`M${112+open*2} ${119-open*4}Q120 ${119+smile+open*13} ${128-open*2} ${119-open*4}Q120 ${119+smile-open*8} ${112+open*2} ${119-open*4}Z`);
 mouth.setAttribute('fill-opacity',open);
 let aim=pointer;
 if(hover){const b=hover.el.getBoundingClientRect();aim={x:b.left+b.width/2,y:b.top+b.height/2};}
 let tx=0,ty=0;
 if(aim&&state!=='sleeping'&&!motion.matches){const b=svg.getBoundingClientRect();tx=clamp((aim.x-b.left-b.width/2)/Math.max(75,b.width*1.25),-1,1);ty=clamp((aim.y-b.top-b.height/2)/Math.max(75,b.width*1.25),-1,1);}
 const ek=1-Math.exp(-dt/65),hk=1-Math.exp(-dt/150);
 gx+=(tx*14-gx)*ek;gy+=(ty*10-gy)*ek;hx+=(tx*3-hx)*hk;hy+=(ty*2-hy)*hk;tilt+=(tx*4-tilt)*hk;
 if(motion.matches)gx=gy=hx=hy=tilt=0;
 eyes.setAttribute('transform',`translate(${gx} ${gy})`);
 hearts.setAttribute('transform',`translate(${gx} ${gy})`);
 const breathe=motion.matches?0:Math.sin(now/1000)*1.8;
 pulse*=Math.exp(-dt/170);
 const squash=motion.matches?0:Math.sin(pulse*Math.PI)*.09;
 head.setAttribute('transform',`translate(${hx} ${hy+breathe}) rotate(${tilt} 120 90) translate(120 90) scale(${1+squash} ${1-squash}) translate(-120 -90)`);
 sleep.setAttribute('opacity',state==='sleeping'?'0.85':'0');
}
function resume(now){activity=now;idleAt=now+random(4000,8000);if(state==='sleeping'){set('happy','reaction',1000,now);}}
function normal(now){set('neutral',pointer?'tracking':'idle',Infinity,now);}
function tick(now){
 frame=0;if(document.hidden||motion.matches)return;
 const dt=Math.min(50,Math.max(1,now-(previous||now-16)));previous=now;
 if(hover){if(emotion!==hover.name)set(hover.name,'context',Infinity,now);}
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
 if(e.pointerType==='touch'||motion.matches)return;
 const now=performance.now();resume(now);pointer={x:e.clientX,y:e.clientY};
 const b=svg.getBoundingClientRect(),close=Math.hypot(e.clientX-b.left-b.width/2,e.clientY-b.top-b.height/2)<b.width*.65;
 if(!hover&&['idle','tracking'].includes(state)){
  if(lastPointer&&now-lastPointer.t>0&&now-lastPointer.t<100&&Math.hypot(e.clientX-lastPointer.x,e.clientY-lastPointer.y)/(now-lastPointer.t)>2.5&&now-lastFast>3500){lastFast=now;set('surprised','reaction',850,now);}
  else if(close&&!near)set('curious','reaction',900,now);
 }
 near=close;lastPointer={...pointer,t:now};
},{passive:true});
function clearPointer(){pointer=null;near=false;lastPointer=null;}
document.documentElement.addEventListener('pointerleave',clearPointer);window.addEventListener('blur',clearPointer);
button.addEventListener('click',()=>{const now=performance.now();resume(now);clicks=now-lastClick<700?clicks+1:1;lastClick=now;pulse=1;set(clicks>=3?(clicks%2?'confused':'angry'):choose(),'reaction',1400,now);ripple();if(motion.matches){clearTimeout(reducedTimer);reducedTimer=setTimeout(()=>normal(performance.now()),1400);}});
let reducedTimer;
const contexts=[['.contact','excited'],['.social','curious'],['.hero h1','curious']];
for(const [selector,name] of contexts){const el=document.querySelector(selector);if(!el)continue;let inside=false,focused=false;
 function update(){const now=performance.now();if(inside||focused){resume(now);hover={el,name};set(name,'context',Infinity,now);}else if(hover?.el===el){hover=null;normal(now);}}
 el.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'){inside=true;update();}});el.addEventListener('pointerleave',()=>{inside=false;update();});
 if(selector!=='.hero h1'){el.addEventListener('focus',()=>{focused=true;update();});el.addEventListener('blur',()=>{focused=false;update();});}
}
function reset(){cancelAnimationFrame(frame);clearTimeout(reducedTimer);hover=null;clearPointer();const now=performance.now();activity=now;idleAt=now+random(4000,8000);blinkAt=now+random(3000,6000);secondBlink=0;normal(now);start();}
document.addEventListener('visibilitychange',reset);motion.addEventListener('change',reset);
set(motion.matches?'neutral':'happy',motion.matches?'idle':'reaction',1200);start();
}
