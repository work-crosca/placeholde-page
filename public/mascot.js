const head=document.querySelector('#head'), pupils=document.querySelector('#pupils'), mascot=document.querySelector('#mascot');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let frame=0;
function reset(){cancelAnimationFrame(frame);frame=0;head?.removeAttribute('transform');pupils?.removeAttribute('transform');}
if(head&&pupils&&mascot){
 window.addEventListener('pointermove',event=>{
 if(motion.matches||event.pointerType==='touch')return;
 const x=event.clientX,y=event.clientY;
 cancelAnimationFrame(frame);
 frame=requestAnimationFrame(()=>{
 const b=mascot.getBoundingClientRect();
 const dx=x-(b.left+b.width/2),dy=y-(b.top+b.height*.5);
 const len=Math.max(100,Math.hypot(dx,dy));
 pupils.setAttribute('transform','translate('+dx/len*6+' '+dy/len*7+')');
 head.setAttribute('transform','rotate('+dx/len*5+' 120 110)');
 });
 },{passive:true});
 document.documentElement.addEventListener('pointerleave',reset);
 window.addEventListener('blur',reset);
 motion.addEventListener('change',reset);
}
