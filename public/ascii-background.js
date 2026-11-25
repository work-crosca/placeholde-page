import {motion} from './motion-preference.js';
// Decorative ASCII field: original procedural waves, no external dependencies.
const canvas=document.querySelector('#ascii-background');
if(canvas){
 const ctx=canvas.getContext('2d');
 if(ctx){
 const glyphs=' .:+*#@';
 let ripples=[];
 window.addEventListener("mascot:ripple",e=>{if(motion.matches||document.hidden)return;const b=canvas.getBoundingClientRect();ripples.push({x:e.detail.x-b.left,y:e.detail.y-b.top,t:performance.now()});ripples=ripples.slice(-4);});
 let width=0,height=0,stepX=17,stepY=22,frame=0,last=-Infinity;
 function resize(){
  const bounds=canvas.getBoundingClientRect();
  width=bounds.width;height=bounds.height;
  const dpr=Math.min(window.devicePixelRatio||1,1.5);
  canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));
  ctx.setTransform(dpr,0,0,dpr,0,0);
  stepX=width<700?23:17;stepY=width<700?28:22;
  ctx.font='12px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  draw(0);
 }
 function draw(time){
  ctx.clearRect(0,0,width,height);
  const t=time*.00035;
  ripples=ripples.filter(r=>time-r.t<1400&&time>=r.t);
  for(let y=stepY/2;y<height;y+=stepY){
   for(let x=stepX/2;x<width;x+=stepX){
    const u=x/Math.max(1,width),v=y/Math.max(1,height);
    const wave=Math.sin(u*14+v*7+t)+.65*Math.cos(v*15-u*9-t*.8)+.45*Math.sin((u+v)*22+t*.6);
    const density=Math.max(0,Math.min(1,(wave+.45)/2.55));
    let ripple=0;
     for(const r of ripples){const age=time-r.t;ripple=Math.max(ripple,Math.max(0,1-Math.abs(Math.hypot(x-r.x,y-r.y)-age*.28)/35)*(1-age/1400));}
    if(density<.17&&ripple<.08)continue;
    const mask=.16+.84*Math.pow(u,1.7);
    const alpha=Math.min(.65,(.045+.17*density)*mask+ripple*.5);
    ctx.fillStyle='rgba(125,183,255,'+alpha.toFixed(3)+')';
    ctx.fillText(glyphs[Math.min(glyphs.length-1,Math.floor(density*glyphs.length))],x,y);
   }
  }
 }
 function tick(now){
  if(document.hidden||motion.matches){frame=0;return;}
  if(now-last>=(width<700?100:66)){draw(now);last=now;}
  frame=requestAnimationFrame(tick);
 }
 function sync(){
  cancelAnimationFrame(frame);frame=0;last=-Infinity;
  if(document.hidden)return;
  if(motion.matches)draw(0);else frame=requestAnimationFrame(tick);
 }
 if(typeof ResizeObserver==='function'){const observer=new ResizeObserver(resize);observer.observe(canvas);}
  else window.addEventListener('resize',resize,{passive:true});
 motion.addEventListener('change',sync);
 document.addEventListener('visibilitychange',sync);
 resize();sync();
 }
}
