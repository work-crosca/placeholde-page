// A single physical CRT screen: document, terminal, and glass are composited
// together. The map is anchored to the visible viewport, even when scrolling.
export function filterGeometry(box,frame){
 const longest=Math.max(frame.width,frame.height,1),shortest=Math.min(frame.width,frame.height);
 const scale=Math.min(180,longest*.13,shortest*.24);
 const gains={x:frame.width/longest,y:frame.height/longest};
 const pad=Math.ceil(scale/2)+4;
 return {scale,gains,region:{x:-pad,y:-pad,width:box.width+2*pad,height:box.height+2*pad},
  map:{x:frame.left-box.left,y:frame.top-box.top,width:frame.width,height:frame.height}};
}
if(typeof document!=='undefined'){
 const root=document.documentElement,filter=document.getElementById('mirco-crt-screen');
 let frame=0;
 const attrs=(node,values)=>{for(const [key,value] of Object.entries(values))node.setAttribute(key,String(value));};
 function sync(){
  frame=0;
  if(!root.classList.contains('mirco-retro')||!filter){delete root.dataset.crtReady;return;}
  const box=root.getBoundingClientRect();
  const screen={left:0,top:0,width:root.clientWidth,height:root.clientHeight};
  if(!box.width||!box.height||!screen.width||!screen.height)return;
  const geometry=filterGeometry(box,screen);
  attrs(filter,geometry.region);
  attrs(filter.querySelector('feImage'),geometry.map);
  for(const [channel,gain] of [['R',geometry.gains.x],['G',geometry.gains.y]]){
   attrs(filter.querySelector('feFunc'+channel),{slope:gain,intercept:(1-gain)/2});
  }
  attrs(filter.querySelector('feDisplacementMap'),{...geometry.region,scale:geometry.scale});
  root.dataset.crtReady='true';
 }
 function schedule(){if(!root.classList.contains('mirco-retro')||frame)return;frame=requestAnimationFrame(sync);}
 window.addEventListener('mirco:visual-mode',()=>{if(frame)cancelAnimationFrame(frame);sync();});
 window.addEventListener('mirco:crt-layout',schedule);
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('scroll',schedule,{passive:true});
 window.visualViewport?.addEventListener('resize',schedule,{passive:true});
 document.fonts?.ready.then(schedule);
 if(typeof ResizeObserver==='function'){
  const observer=new ResizeObserver(schedule);observer.observe(root);observer.observe(document.body);
 }
}
