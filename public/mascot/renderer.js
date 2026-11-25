import {rgb,hexColor,colors,baseColor,DROWSY_IDLE,YAWN_IDLE,ASLEEP_IDLE} from './expressions.js';
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
// Skip identical SVG writes, including inactive expression layers.
export function createAttributeWriter(){
 const attributes=new WeakMap();
 return function attr(el,key,value){
 const v=typeof value==='number'?String(Math.round(value*1000)/1000):(key==='d'||key==='transform')?String(value).replace(/-?(?:\d+\.\d+(?:e[+-]?\d+)?|\d+e[+-]?\d+)/gi,n=>String(Math.round(Number(n)*1000)/1000)):String(value);
 let last=attributes.get(el);if(!last){last=new Map();attributes.set(el,last);}
 if(last.get(key)!==v){last.set(key,v);el.setAttribute(key,v);}
};
}

export function renderPose(input,now,dt){
 const {state,emotion,poseAt,target,motion,activity,browserExit,pointer,hover,bounds,attr,left,right,hearts,tears,spirals,scaredEyes,wavyMouth,mouth,face,blush,glow,eyes,spiralLeft,spiralRight,shine,head,sleep,sleepGlyphs}=input;
 let {current,faceRgb,gx,gy,hx,hy,tilt,pulse}=input;
 const slow=['drowsy','yawning','sleeping','waking'].includes(state);
 const k=motion.matches?1:1-Math.exp(-dt/(slow?180:65));
 const elapsedPose=Math.max(0,now-poseAt);
 const wakeBlink=state==='waking'&&!motion.matches?Math.max(0,1-Math.abs(elapsedPose-100)/65,1-Math.abs(elapsedPose-300)/65):0;
 current=current.map((v,i)=>v+(target[i]-v)*k);
 for(const [el,x,offset] of [[left,82,0],[right,158,5]]){
  let [w,h,c,s,o]=current.slice(offset,offset+5);
  w+=(13-w)*wakeBlink;h*=1-wakeBlink;c*=1-wakeBlink;s+=(3-s)*wakeBlink;
  attr(el,'d',`M${x-w} ${77-h+o}Q${x} ${77+c+o} ${x+w} ${77+h+o}`);
  attr(el,'stroke-width',s);attr(el,'opacity',clamp(1-current[12]-current[17]-current[18],0,1));
 }
 attr(hearts,'opacity',current[12]);
 attr(tears,'opacity',current[16]);attr(spirals,'opacity',current[17]);attr(scaredEyes,'opacity',current[18]);attr(wavyMouth,'opacity',current[20]);attr(mouth,'opacity',1-current[20]);
 const smile=current[10],sleepAmount=current[23];
 const breathing=motion.matches?0:Math.sin(now/1750);
 // Gradual yawn: opens, peaks at one second and closes before sleep.
 const yawnProgress=state==='yawning'?clamp((now-activity-YAWN_IDLE)/(ASLEEP_IDLE-YAWN_IDLE),0,1):0;
 const open=state==='yawning'?current[11]*Math.sin(Math.PI*yawnProgress):clamp(current[11]+breathing*.08*sleepAmount,0,1);
 const mw=(12-open*5+current[19])*(1-.65*sleepAmount);
 // A closed smile is a single curve, not two overlapping strokes.
 const bottom=115+smile+open*17,top=115+smile-open*21;
 attr(mouth,'d',open>.025?`M${120-mw} 115Q120 ${bottom} ${120+mw} 115Q120 ${top} ${120-mw} 115Z`:`M${120-mw} 115Q120 ${115+smile} ${120+mw} 115`);
 attr(mouth,'fill-opacity',open>.025?open:0);
 const colorTarget=rgb(browserExit?'#ff777e':colors[emotion]||baseColor);
 const ck=motion.matches||browserExit?1:1-Math.exp(-dt/110);
 faceRgb=faceRgb.map((v,i)=>v+(colorTarget[i]-v)*ck);
 const faceColor=hexColor(faceRgb);
 attr(face,'stroke',faceColor);attr(face,'fill',faceColor);
 attr(face,'opacity',current[15]);attr(blush,'opacity',current[13]);attr(glow,'slope',current[14]);
 let aim=browserExit?{x:browserExit.x,y:-100}:pointer;
 if(!browserExit&&hover){const b=hover.el.getBoundingClientRect();aim={x:b.left+b.width/2,y:b.top+b.height/2};}
 let tx=0,ty=0;
 if(aim&&!['sleeping','yawning'].includes(state)&&!motion.matches){const b=bounds();tx=clamp((aim.x-b.left-b.width/2)/Math.max(75,b.width*1.25),-1,1);ty=clamp((aim.y-b.top-b.height/2)/Math.max(75,b.width*1.25),-1,1);}
 const fatigue=state==='drowsy'?1-.85*clamp((now-activity-DROWSY_IDLE)/(YAWN_IDLE-DROWSY_IDLE),0,1):1;
 tx*=fatigue;ty*=fatigue;
 const ek=1-Math.exp(-dt/65),hk=1-Math.exp(-dt/150);
 gx+=(tx*14-gx)*ek;gy+=(ty*10-gy)*ek;hx+=(tx*3-hx)*hk;hy+=(ty*2-hy)*hk;tilt+=(tx*4-tilt)*hk;
 if(motion.matches)gx=gy=hx=hy=tilt=0;
 const shyOffset=emotion==='shy'&&!motion.matches?Math.sin(Math.min(elapsedPose,1200)/1200*Math.PI)*5:0;
 const eyeX=gx+shyOffset;
 attr(eyes,'transform',`translate(${eyeX} ${gy})`);
 attr(mouth,'transform',`translate(${eyeX*.42} ${gy*.42})`);
 attr(wavyMouth,'transform',`translate(${eyeX*.42} ${gy*.42})`);
 const heartScale=motion.matches?1:1+Math.sin(now/260)*.045*current[12];
 if(current[12]>.001)attr(hearts,'transform',`translate(${eyeX} ${gy}) translate(120 77) scale(${heartScale}) translate(-120 -77)`);
 const tearDrift=motion.matches?0:Math.sin(now/180)*2*current[16];
 if(current[16]>.001)attr(tears,'transform',`translate(${gx*.5} ${gy*.5+tearDrift})`);
 const spin=motion.matches?0:Math.sin(now/220)*15*current[17];
 if(current[17]>.001){attr(spirals,'transform',`translate(${gx} ${gy})`);attr(spiralLeft,'transform',`rotate(${spin} 82 77)`);attr(spiralRight,'transform',`rotate(${-spin} 158 77)`);}
 if(current[18]>.001)attr(scaredEyes,'transform',`translate(${gx} ${gy})`);
 attr(blush,'transform',`translate(${gx*.35} ${gy*.35})`);
 attr(shine,'transform',`translate(${gx*.48} ${gy*.35})`);
 const breathe=motion.matches?0:Math.sin(now/1000)*1.2*(1-sleepAmount)+(3+breathing*2.2)*sleepAmount+Math.sin(now/85)*2.5*current[22];
 const fatigueDrop=state==='drowsy'||state==='yawning'?4*clamp((now-activity-DROWSY_IDLE)/(ASLEEP_IDLE-DROWSY_IDLE),0,1):0;
 const intro=motion.matches?0:Math.sin(Math.PI*clamp(elapsedPose/650,0,1));
 const jump=emotion==='excited'&&!motion.matches&&elapsedPose<1000?-5*Math.abs(Math.sin(elapsedPose/1000*Math.PI*2)):0;
 const nod=emotion==='happy'?-2.5*intro:emotion==='sad'?4*intro:emotion==='scared'?3*intro:emotion==='proud'?-3*intro:0;
 const poseTilt=emotion==='curious'?-5*intro:emotion==='confused'?5*Math.sin(elapsedPose/130)*intro:emotion==='shy'?3*intro:0;
 pulse*=Math.exp(-dt/170);
 const squash=motion.matches?0:Math.sin(pulse*Math.PI)*.09+breathing*.012*sleepAmount;
 const elapsed=browserExit?now-browserExit.at:emotion==='angry'?elapsedPose:Infinity;
 const shake=motion.matches||elapsed>=420?0:Math.sin(elapsed/25)*3*(1-elapsed/420);
 attr(head,'transform',`translate(${hx+shake} ${hy+breathe+jump+nod+(motion.matches?0:fatigueDrop)}) rotate(${tilt+current[21]+poseTilt+(motion.matches?0:(5+breathing*.65)*sleepAmount)} 120 90) translate(120 90) scale(${1+squash} ${1-squash}) translate(-120 -90)`);
 // Staggered rising Zs: each glyph fades in, drifts upward/right, and fades out.
 attr(sleep,'opacity',.9*sleepAmount);
 if(sleepAmount>.001){
  for(const [i,glyph] of sleepGlyphs.entries()){
   const phase=motion.matches?.45:((now/2600+i/3)%1);
   attr(glyph,'opacity',Math.sin(Math.PI*phase));
   attr(glyph,'transform',`translate(${192+phase*36} ${48-phase*42}) scale(${.75+phase*.45})`);
  }
 }
 return {current,faceRgb,gx,gy,hx,hy,tilt,pulse};
}
