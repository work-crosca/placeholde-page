// Every page target samples the same screen-space map; terminal targets sample
// the terminal window instead. Pixel units avoid stretching a short text box.
export function filterGeometry(box,frame,terminal=false){
 const scale=Math.min(terminal?10:32,Math.min(frame.width,frame.height)*(terminal?.025:.035));
 const pad=Math.ceil(scale/2)+4;
 return {scale,region:{x:-pad,y:-pad,width:box.width+2*pad,height:box.height+2*pad},map:{x:frame.left-box.left,y:frame.top-box.top,width:frame.width,height:frame.height}};
}
const targets=[['#ascii-background','mirco-crt-warp'],['.hero h1','mirco-crt-title'],['.hero .description','mirco-crt-description'],['.terminal-output','mirco-crt-terminal',true]];
if(typeof document!=='undefined'){
 const root=document.documentElement;
 let frame=0;
 const attrs=(node,values)=>{for(const [key,value] of Object.entries(values))node.setAttribute(key,String(value));};
 function sync(){
  frame=0;
  if(!root.classList.contains('mirco-retro')){delete root.dataset.crtReady;return;}
  const screen={left:0,top:0,width:root.clientWidth,height:root.clientHeight};
  for(const [selector,id,isTerminal] of targets){
   const target=document.querySelector(selector),filter=document.getElementById(id);
   if(!target||!filter)continue;
   const box=target.getBoundingClientRect();
   const reference=isTerminal?target.closest('dialog').getBoundingClientRect():screen;
   if(!box.width||!box.height||!reference.width||!reference.height)continue;
   const geometry=filterGeometry(box,reference,isTerminal);
   attrs(filter,geometry.region);
   attrs(filter.querySelector('feImage'),geometry.map);
   attrs(filter.querySelector('feDisplacementMap'),{...geometry.region,scale:geometry.scale});
  }
  root.dataset.crtReady='true';
 }
 function schedule(){if(!root.classList.contains('mirco-retro')||frame)return;frame=requestAnimationFrame(sync);}
 window.addEventListener('mirco:visual-mode',()=>{if(frame)cancelAnimationFrame(frame);sync();});
 window.addEventListener('mirco:crt-layout',schedule);
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('scroll',schedule,{passive:true});
 if(typeof ResizeObserver==='function'){
  const observer=new ResizeObserver(schedule);
  for(const selector of ['.shell','.hero h1','.hero .description','.mirco-terminal','.terminal-output']){
   const target=document.querySelector(selector);if(target)observer.observe(target);
  }
 }
 // The experience module creates the dialog after static imports run.
 // Its layout event handles opening, resizing and restoring the window.
}
