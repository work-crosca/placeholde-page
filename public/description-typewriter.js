import {motion as sharedMotion} from './motion-preference.js';
// Rotate complete phrases without announcing individual keystrokes to assistive technology.
export function createTypewriter({node,phrases,motion,document:doc,setTimer,clearTimer,random=Math.random,onActiveChange=()=>{}}){
 const pool=[...new Set(phrases.filter(p=>typeof p==='string'&&p.length))];
 if(pool.length<2)return {dispose(){}};
 let first=true,current=0,shown=Array.from(pool[0]),timer=null,remaining=pool.map((_,i)=>i).slice(1);
 const active=()=>!doc.hidden&&!motion.matches;
 const delay=(min,max)=>Math.round(min+random()*(max-min));
 function cancel(){if(timer!==null)clearTimer(timer);timer=null;}
 function show(){node.textContent=shown.join('');}
 function later(fn,ms){timer=setTimer(()=>{timer=null;if(active())fn();},ms);}
 function next(){
  if(!remaining.length)remaining=pool.map((_,i)=>i).filter(i=>i!==current);
  const i=Math.min(remaining.length-1,Math.floor(random()*remaining.length));
  return remaining.splice(i,1)[0];
 }
 function hold(){const wait=first?delay(1800,3000):delay(5000,11000);first=false;later(erase,wait);}
 function erase(){
  if(shown.length){shown.pop();show();later(erase,delay(22,40));return;}
  current=next();later(()=>type(Array.from(pool[current])),delay(150,260));
 }
 function type(chars){
  if(shown.length<chars.length){shown.push(chars[shown.length]);show();later(()=>type(chars),delay(42,85));return;}
  hold();
 }
 function reset(){
  cancel();shown=Array.from(pool[current]);show();
  const running=active();onActiveChange(running);
  if(running)hold();
 }
 motion.addEventListener('change',reset);doc.addEventListener('visibilitychange',reset);reset();
 return {dispose(){cancel();motion.removeEventListener('change',reset);doc.removeEventListener('visibilitychange',reset);shown=Array.from(pool[current]);show();onActiveChange(false);}};
}
if(typeof document!=='undefined'){
 const wrapper=document.querySelector('[data-typewriter]');
 if(wrapper&&window.getComputedStyle(wrapper).getPropertyValue('--typewriter-ready').trim()==='1'){
  let phrases=[];
  try{phrases=JSON.parse(wrapper.dataset.typewriter);}catch{}
  const node=wrapper.querySelector('.typewriter-text');
  const measure=wrapper.querySelector('.typewriter-measure');
  const display=wrapper.querySelector('.typewriter-display');
  if(node&&measure&&display&&Array.isArray(phrases)&&new Set(phrases.filter(p=>typeof p==='string'&&p.length)).size>1){
   const motion=sharedMotion;
   wrapper.classList.add('is-typewriter');
   measure.hidden=false;display.hidden=false;
   createTypewriter({node,phrases,motion,document,setTimer:(fn,ms)=>window.setTimeout(fn,ms),clearTimer:id=>window.clearTimeout(id),onActiveChange:running=>wrapper.classList.toggle('is-typewriter-paused',!running)});
  }
 }
}
