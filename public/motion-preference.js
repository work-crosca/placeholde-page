// The effective preference is manual pause OR the operating system's reduced-motion setting.
export function createMotionPreference({media,storage,root,eventTarget}){
 const key='mirco:animations-paused';
 let paused=false;
 try{paused=storage?.getItem(key)==='true';}catch{}
 const listeners=new Set();
 function notify(){
  if(root?.dataset)root.dataset.motionPaused=String(api.matches);
  for(const listener of listeners)listener({matches:api.matches});
 }
 const api={
  get matches(){return paused||media.matches;},
  get manualPaused(){return paused;},
  get systemReduced(){return media.matches;},
  addEventListener(type,listener){if(type==='change')listeners.add(listener);},
  removeEventListener(type,listener){if(type==='change')listeners.delete(listener);},
  setPaused(value){paused=Boolean(value);try{storage?.setItem(key,String(paused));}catch{}notify();},
  toggle(){api.setPaused(!paused);}
 };
 media.addEventListener('change',notify);
 eventTarget?.addEventListener('storage',event=>{if(event.key===key||event.key===null){try{paused=storage?.getItem(key)==='true';}catch{}notify();}});
 notify();
 return api;
}
let storage;
try{if(typeof window!=='undefined')storage=window.localStorage;}catch{}
export const motion=typeof window==='undefined'?null:createMotionPreference({media:window.matchMedia('(prefers-reduced-motion: reduce)'),storage,root:document.documentElement,eventTarget:window});
