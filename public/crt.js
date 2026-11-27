// A single viewport-sized compositing surface, not the browser's root element.
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
 const surface=document.querySelector('.crt-screen'),scroller=document.querySelector('.crt-scroll');
 let frame=0;
 const attrs=(node,values)=>{for(const [key,value] of Object.entries(values))node.setAttribute(key,String(value));};
 function sync(){
  frame=0;
  if(!filter||!surface||!scroller)return;
  if(!root.classList.contains('mirco-retro')){
   if(root.dataset.crtReady==='true'){
    const y=scroller.scrollTop;
    delete root.dataset.crtReady;
    window.scrollTo(0,y);
   }
   return;
  }
  if(root.dataset.crtReady!=='true'){
   const y=window.scrollY;
   root.dataset.crtReady='true';
   scroller.scrollTop=y;
  }
  const box=surface.getBoundingClientRect();
  const screen={left:box.left,top:box.top,width:box.width,height:box.height};
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
 scroller?.addEventListener('scroll',()=>{if(root.dataset.crtReady==='true')window.dispatchEvent(new Event('scroll'));},{passive:true});
 window.visualViewport?.addEventListener('resize',schedule,{passive:true});
 document.fonts?.ready.then(schedule);
 if(typeof ResizeObserver==='function'){
  const observer=new ResizeObserver(schedule);observer.observe(root);if(surface)observer.observe(surface);
 }
}
