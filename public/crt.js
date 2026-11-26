// One optical coordinate system per physical screen. All filters use CSS pixels;
// channel gains preserve the same normalized curvature on both screen axes.
export function filterGeometry(box,frame,terminal=false){
 const longest=Math.max(frame.width,frame.height,1),shortest=Math.min(frame.width,frame.height);
 const scale=Math.min(terminal?100:180,longest*(terminal?.12:.13),shortest*(terminal?.25:.24));
 const gains={x:frame.width/longest,y:frame.height/longest};
 const pad=Math.ceil(scale/2)+4;
 return {scale,gains,region:{x:-pad,y:-pad,width:box.width+2*pad,height:box.height+2*pad},
  map:{x:frame.left-box.left,y:frame.top-box.top,width:frame.width,height:frame.height}};
}
const targets=[
 ['#ascii-background','mirco-crt-warp'],['.hero h1','mirco-crt-title'],
 ['.hero .description','mirco-crt-description'],['header .brand','mirco-crt-brand'],
 ['header .status','mirco-crt-status'],['footer > span:first-child','mirco-crt-copyright'],
 ['.page-crt-scanlines','mirco-crt-scanlines'],
 ['.terminal-output','mirco-crt-terminal',true],['.terminal-prompt','mirco-crt-prompt',true],
 ['.terminal-crt-scanlines','mirco-crt-terminal-scanlines',true]
];
if(typeof document!=='undefined'){
 const root=document.documentElement;
 const shell=document.querySelector('.shell');
 if(shell){
  const lines=document.createElement('div');lines.className='page-crt-scanlines';lines.setAttribute('aria-hidden','true');shell.append(lines);
 }
 let frame=0;
 const observed=new WeakSet();
 const attrs=(node,values)=>{for(const [key,value] of Object.entries(values))node.setAttribute(key,String(value));};
 const observer=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;
 function observe(node){if(node&&observer&&!observed.has(node)){observed.add(node);observer.observe(node);}}
 function sync(){
  frame=0;
  if(!root.classList.contains('mirco-retro')){delete root.dataset.crtReady;return;}
  const screen={left:0,top:0,width:root.clientWidth,height:root.clientHeight};
  observe(shell);
  for(const [selector,id,isTerminal] of targets){
   const target=document.querySelector(selector),filter=document.getElementById(id);
   if(!target||!filter)continue;
   const glass=isTerminal?target.closest('.terminal-content'):null;
   observe(target);observe(glass);
   const box=target.getBoundingClientRect(),reference=glass?glass.getBoundingClientRect():screen;
   if(!box.width||!box.height||!reference.width||!reference.height)continue;
   const geometry=filterGeometry(box,reference,isTerminal);
   attrs(filter,geometry.region);
   attrs(filter.querySelector('feImage'),geometry.map);
   for(const [channel,gain] of [['R',geometry.gains.x],['G',geometry.gains.y]]){
    attrs(filter.querySelector('feFunc'+channel),{slope:gain,intercept:(1-gain)/2});
   }
   attrs(filter.querySelector('feDisplacementMap'),{...geometry.region,scale:geometry.scale});
  }
  root.dataset.crtReady='true';
 }
 function schedule(){if(!root.classList.contains('mirco-retro')||frame)return;frame=requestAnimationFrame(sync);}
 window.addEventListener('mirco:visual-mode',()=>{if(frame)cancelAnimationFrame(frame);sync();});
 window.addEventListener('mirco:crt-layout',schedule);
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('scroll',schedule,{passive:true});
 window.visualViewport?.addEventListener('resize',schedule,{passive:true});
 document.fonts?.ready.then(schedule);
 observe(shell);
}
