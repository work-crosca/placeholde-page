// Original vector expressions; no external mascot runtime or artwork.
const button=document.querySelector('.mascot');
const svg=document.querySelector('#mascot');
const face=document.querySelector('#face');
const eyes=document.querySelector('#eyes');
const left=document.querySelector('#eye-left');
const right=document.querySelector('#eye-right');
const mouth=document.querySelector('#mouth');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(any-pointer: fine)');
const random=(min,max)=>min+Math.random()*(max-min);
const names=['happy','surprised','curious','confused','love','bored','sleepy'];
const normal=x=>`M${x-9} 69Q${x-9} 60 ${x} 60Q${x+9} 60 ${x+9} 69V88Q${x+9} 97 ${x} 97Q${x-9} 97 ${x-9} 88Z`;
const arc=x=>`M${x-13} 86Q${x} 65 ${x+13} 86`;
const closed=x=>`M${x-12} 79Q${x} 86 ${x+12} 79`;
const heart=x=>`M${x} 94C${x-37} 68 ${x-9} 57 ${x} 72C${x+9} 57 ${x+37} 68 ${x} 94Z`;
const big=x=>`M${x-12} 67Q${x-12} 55 ${x} 55Q${x+12} 55 ${x+12} 67V90Q${x+12} 102 ${x} 102Q${x-12} 102 ${x-12} 90Z`;
let state='neutral',last='',lastActivity=Date.now(),idleTimer,blinkTimer,returnTimer,frame=0,dx=0,dy=0,near=false;
function expression(name){
 state=name;button.dataset.emotion=name;
 for(const [el,x] of [[left,81],[right,159]]){
 let d=normal(x),stroke=0,fill='#9fd8ff',offset=0;
 if(name==='happy'){d=arc(x);stroke=8;fill='none';}
 if(['sleepy','blink','bored'].includes(name)){d=name==='bored'?`M${x-12} 79H${x+12}`:closed(x);stroke=6;fill='none';}
 if(name==='love')d=heart(x);
 if(name==='surprised')d=big(x);
 if(name==='curious')offset=5;
 if(name==='confused'&&x===159)offset=8;
 el.setAttribute('d',d);el.setAttribute('fill',fill);el.setAttribute('stroke-width',stroke);el.setAttribute('transform',`translate(0 ${offset})`);
 }
 mouth.setAttribute('d',name==='surprised'?'M120 110a7 9 0 1 0 0 18a7 9 0 1 0 0 -18': ['happy','love'].includes(name)?'M109 113Q120 128 131 113':name==='confused'?'M111 120Q116 113 121 119T131 116':'M115 119H125');
 mouth.setAttribute('fill',name==='surprised'?'#9fd8ff':'none');
}
function gaze(){face.setAttribute('transform',`translate(${dx*8} ${dy*6})`);}
function neutral(){clearTimeout(returnTimer);expression('neutral');}
function react(name,duration=1400){clearTimeout(returnTimer);expression(name);returnTimer=setTimeout(neutral,duration);}
function choose(){const choices=names.filter(n=>n!==last);last=choices[Math.floor(Math.random()*choices.length)];return last;}
function scheduleIdle(){clearTimeout(idleTimer);if(document.hidden||motion.matches)return;idleTimer=setTimeout(()=>{
 if(Date.now()-lastActivity>=30000){clearTimeout(returnTimer);expression('sleepy');}
 else if(state==='neutral'&&!near&&Date.now()-lastActivity>=4000)react(choose(),random(1000,2000));
 scheduleIdle();
 },random(4000,8000));}
function scheduleBlink(){clearTimeout(blinkTimer);if(document.hidden||motion.matches)return;blinkTimer=setTimeout(()=>{if(state==='neutral')react('blink',140);scheduleBlink();},random(3000,6000));}
function resetGaze(){cancelAnimationFrame(frame);dx=0;dy=0;near=false;gaze();}
function activity(){lastActivity=Date.now();if(state==='sleepy')neutral();}
function lifecycle(){clearTimeout(idleTimer);clearTimeout(blinkTimer);clearTimeout(returnTimer);resetGaze();neutral();lastActivity=Date.now();scheduleIdle();scheduleBlink();}
if(button&&svg&&face&&eyes&&left&&right&&mouth){
 window.addEventListener('pointermove',event=>{
 activity();if(motion.matches||!fine.matches||event.pointerType==='touch')return;
 const x=event.clientX,y=event.clientY;cancelAnimationFrame(frame);
 frame=requestAnimationFrame(()=>{
 const b=svg.getBoundingClientRect(),vx=x-b.left-b.width/2,vy=y-b.top-b.height/2;
 const distance=Math.hypot(vx,vy),wasNear=near;near=distance<b.width*.75;
 dx=distance<18?0:Math.abs(vx/distance)<.38?0:Math.sign(vx);
 dy=distance<18?0:Math.abs(vy/distance)<.38?0:Math.sign(vy);
 gaze();if(near&&!wasNear&&state==='neutral')react('curious');
 });
 },{passive:true});
 button.addEventListener('click',()=>{activity();react(choose(),1500);});
 document.documentElement.addEventListener('pointerleave',resetGaze);
 window.addEventListener('blur',resetGaze);
 document.addEventListener('visibilitychange',lifecycle);
 motion.addEventListener('change',lifecycle);
 fine.addEventListener('change',resetGaze);
 lifecycle();
}
