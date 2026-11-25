// Pure placement solver: testable without a browser. Keep the preferred size and position where possible.
const overlaps=(a,b,gap)=>a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;
export function choosePlacement({preferred,viewport,obstacles,gap=8,minWidth=80}){
 const {width:vw,height:vh,left:vx=0,top:vy=0}=viewport;
 if(!vw||!vh||!preferred.width)return null;
 const aspect=preferred.height/preferred.width;
 const sizes=[preferred.width,preferred.width*.85,preferred.width*.7,Math.min(minWidth,preferred.width)].filter((w,i,a)=>w>=Math.min(minWidth,preferred.width)&&a.indexOf(w)===i);
 for(const width of sizes){
  const height=width*aspect;
  const xs=[preferred.right-width,vx+vw-width-gap,vx+gap,vx+(vw-width)/2,...obstacles.flatMap(b=>[b.left-width-gap,b.right+gap])];
  const ys=[preferred.bottom-height,vy+vh-height-gap,vy+gap,...obstacles.flatMap(b=>[b.top-height-gap,b.bottom+gap])];
  const candidates=[];
  for(const left of xs)for(const top of ys){
   const box={left,top,right:left+width,bottom:top+height,width,height};
   if(left<vx+gap||top<vy+gap||box.right>vx+vw-gap||box.bottom>vy+vh-gap||obstacles.some(b=>overlaps(box,b,gap)))continue;
   candidates.push(box);
  }
  candidates.sort((a,b)=>Math.hypot(a.right-preferred.right,a.bottom-preferred.bottom)-Math.hypot(b.right-preferred.right,b.bottom-preferred.bottom));
  if(candidates.length)return candidates[0];
 }
 return null;
}
// VisualViewport offsets share the layout coordinate system of getBoundingClientRect.
export function getVisibleViewport(doc,win){
 const v=win.visualViewport;
 const viewport=v?{left:v.offsetLeft,top:v.offsetTop,width:v.width,height:v.height}:{left:0,top:0,width:doc.documentElement.clientWidth,height:doc.documentElement.clientHeight};
 // CSS exposes physical safe-area insets via a non-rendered measuring element.
 const style=win.getComputedStyle?.(doc.documentElement);
 const inset=side=>Math.max(0,parseFloat(style?.getPropertyValue('--safe-'+side))||0);
 const left=inset('left'),right=inset('right'),top=inset('top'),bottom=inset('bottom');
 return {left:viewport.left+left,top:viewport.top+top,width:Math.max(0,viewport.width-left-right),height:Math.max(0,viewport.height-top-bottom)};
}
export function attachPlacement({button,document:doc,window:win,onChange=()=>{}}){
 if(!button.style||typeof doc.querySelectorAll!=='function')return;
 const targets=[...doc.querySelectorAll('.hero .description,.hero h1,.hero .contact,header > *,footer > *')];
 let pending=0,previous='';
 function update(){
  pending=0;
  // Measure the CSS-defined preferred position, not the previously moved box.
  button.style.width='';button.style.transform='';button.dataset.placement='';
  const preferred=button.getBoundingClientRect();
  const obstacles=targets.filter(el=>!el.hidden).map(el=>el.getBoundingClientRect()).filter(b=>b.width&&b.height);
  const viewport=getVisibleViewport(doc,win);
  const result=choosePlacement({preferred,viewport,obstacles});
  if(result){
   button.style.width=result.width+'px';
   const rect=button.getBoundingClientRect();
   button.style.transform='translate('+ (result.left-rect.left)+'px,'+(result.top-rect.top)+'px)';
   button.dataset.placement='placed';
  }else{
   // Never hide a focused control; give keyboard users a chance to leave it.
   button.dataset.placement=doc.activeElement===button?'placed':'hidden';
  }
  const next=button.dataset.placement+button.style.width+button.style.transform;
  if(next!==previous){previous=next;onChange();}
 }
 function schedule(){if(!pending)pending=win.requestAnimationFrame(update);}
 win.addEventListener('resize',schedule,{passive:true});
 win.addEventListener('scroll',schedule,{passive:true});
 win.visualViewport?.addEventListener('resize',schedule,{passive:true});
 win.visualViewport?.addEventListener('scroll',schedule,{passive:true});
 button.addEventListener('blur',schedule);
 if(typeof ResizeObserver==='function'){const observer=new ResizeObserver(schedule);for(const target of targets)observer.observe(target);}
 doc.fonts?.ready.then(schedule);
 schedule();
}
