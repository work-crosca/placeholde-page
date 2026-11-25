// Rotate complete phrases without announcing individual keystrokes to assistive technology.
export function createTypewriter({node,phrases,motion,document:doc,setTimer,clearTimer,random=Math.random}){
 const pool=[...new Set(phrases.filter(p=>typeof p==='string'&&p.length))];
 if(pool.length<2)return {dispose(){}};
 let current=0,shown=Array.from(pool[0]),timer=null,remaining=pool.map((_,i)=>i).slice(1);
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
 function hold(){later(()=>{const target=next();erase(target);},delay(5000,11000));}
 function erase(target){
  if(shown.length){shown.pop();show();later(()=>erase(target),delay(22,40));return;}
  current=target;later(()=>type(Array.from(pool[target])),delay(150,260));
 }
 function type(chars){
  if(shown.length<chars.length){shown.push(chars[shown.length]);show();later(()=>type(chars),delay(42,85));return;}
  hold();
 }
 function reset(){
  cancel();shown=Array.from(pool[current]);show();
  if(active())hold();
 }
 motion.addEventListener('change',reset);doc.addEventListener('visibilitychange',reset);reset();
 return {dispose(){cancel();motion.removeEventListener('change',reset);doc.removeEventListener('visibilitychange',reset);shown=Array.from(pool[current]);show();}};
}
if(typeof document!=='undefined'){
 const wrapper=document.querySelector('[data-typewriter]');
 if(wrapper){
  const phrases=JSON.parse(wrapper.dataset.typewriter);
  const node=wrapper.querySelector('.typewriter-text');
  if(node)createTypewriter({node,phrases,motion:matchMedia('(prefers-reduced-motion: reduce)'),document,setTimer:(fn,ms)=>window.setTimeout(fn,ms),clearTimer:id=>window.clearTimeout(id)});
 }
}
