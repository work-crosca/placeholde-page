// Brief, low-amplitude digital distortion, with no continuous animation loop.
export function createGlitchController({title,motion,document:doc,setTimer,clearTimer,random=Math.random}){
 let timer=null;
 const active=()=>!doc.hidden&&!motion.matches;
 function stop(){if(timer!==null)clearTimer(timer);timer=null;title.classList.remove('is-glitching');}
 function schedule(){
  stop();
  if(!active())return;
  timer=setTimer(()=>{
   timer=null;
   if(!active())return;
   title.classList.add('is-glitching');
   timer=setTimer(schedule,320);
  },Math.round(6500+random()*7500));
 }
 motion.addEventListener('change',schedule);
 doc.addEventListener('visibilitychange',schedule);
 schedule();
 return {dispose(){stop();motion.removeEventListener('change',schedule);doc.removeEventListener('visibilitychange',schedule);}};
}
if(typeof document!=='undefined'){
 const title=document.querySelector('.hero h1');
 if(title)createGlitchController({title,motion:matchMedia('(prefers-reduced-motion: reduce)'),document,setTimer:(fn,ms)=>window.setTimeout(fn,ms),clearTimer:id=>window.clearTimeout(id)});
}
