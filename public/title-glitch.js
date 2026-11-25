import {motion as sharedMotion} from './motion-preference.js';
// Brief, low-amplitude digital distortion. Decorative copies are hidden unless active.
export function createGlitchController({title,layers=[],motion,document:doc,setTimer,clearTimer,random=Math.random}){
 let timer=null, first=true;
 const active=()=>!doc.hidden&&!motion.matches;
 function stop(){
  if(timer!==null)clearTimer(timer);
  timer=null;title.classList.remove('is-glitching');
  for(const layer of layers)layer.hidden=true;
 }
 function schedule(){
  stop();
  if(!active())return;
  const wait=first?Math.round(1800+random()*1400):Math.round(6500+random()*7500);
  first=false;
  timer=setTimer(()=>{
   timer=null;
   if(!active())return;
   for(const layer of layers)layer.hidden=false;
   title.classList.add('is-glitching');
   timer=setTimer(schedule,460);
  },wait);
 }
 motion.addEventListener('change',schedule);
 doc.addEventListener('visibilitychange',schedule);
 schedule();
 return {dispose(){stop();motion.removeEventListener('change',schedule);doc.removeEventListener('visibilitychange',schedule);}};
}
if(typeof document!=='undefined'){
 const title=document.querySelector('.hero h1');
 if(title&&window.getComputedStyle(title).getPropertyValue('--title-glitch-ready').trim()==='1'){
  const layers=[...title.querySelectorAll('.title-glitch-layer')];
  if(layers.length===2)createGlitchController({title,layers,motion:sharedMotion,document,setTimer:(fn,ms)=>window.setTimeout(fn,ms),clearTimer:id=>window.clearTimeout(id)});
 }
}
