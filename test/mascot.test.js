import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
// Run the real controller in a deterministic DOM/timer harness; modules are tested separately.
const expressions=readFileSync(new URL('../public/mascot/expressions.js',import.meta.url),'utf8').replaceAll('export const ','const ');
const source=expressions+"\nconst motion=matchMedia('(prefers-reduced-motion: reduce)');\nconst attachPlacement=()=>{};\n"+readFileSync(new URL('../public/mascot.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');

function exercise(run,assert){
 function scenario(reduced=false){
  let narrow=false;
  let now=1000,raf=0,randomValue=.5;
  const listeners=()=>({events:{},addEventListener(n,f){(this.events[n]??=[]).push(f);},emit(n,e={}){for(const f of this.events[n]||[])f(e);}});
  const node=()=>Object.assign(listeners(),{attrs:{},dataset:{},setAttribute(k,v){this.attrs[k]=String(v);},getBoundingClientRect(){return {left:100,top:200,width:180,height:150};}});
  const nodes=Object.fromEntries(['#head','#eyes','#eye-left','#eye-right','#mouth','#face','#blush','#screen-shine','#face-glow-alpha','#hearts','#tears','#spiral-eyes','#spiral-left','#spiral-right','#scared-eyes','#wavy-mouth','#sleep-symbols','#sleep-z1','#sleep-z2','#sleep-z3'].map(k=>[k,node()]));
  const svg=Object.assign(node(),{querySelector:k=>nodes[k]});
  const button=Object.assign(node(),{querySelector:()=>svg});
  const root=listeners(),win=Object.assign(listeners(),{scrollY:0,innerWidth:1000,dispatchEvent(){}});
  const contact=node(),social=node();
  const doc=Object.assign(listeners(),{hidden:false,documentElement:root,querySelector:k=>k==='.mascot'?button:k==='.contact'?contact:k==='.social'?social:null});
  const queue=new Map(),timers=new Map();
  run({Math:Object.assign(Object.create(Math),{random:()=>randomValue}),document:doc,window:win,matchMedia:q=>Object.assign(listeners(),{get matches(){return q.includes('reduced-motion')?reduced:q.includes('max-width')&&narrow;}}),performance:{now:()=>now},requestAnimationFrame:f=>{queue.set(++raf,f);return raf;},cancelAnimationFrame:id=>queue.delete(id),setTimeout:(f,ms)=>{timers.set(++raf,{f,at:now+ms});return raf;},clearTimeout:id=>timers.delete(id),navigator:{},CustomEvent:class{}});
  function frame(ms=16){now+=ms;for(const [id,timer] of [...timers])if(timer.at<=now&&timers.delete(id))timer.f();const pending=[...queue.values()];queue.clear();for(const f of pending)f(now);}
  const exit=(y,type='mouse',relatedTarget=null)=>root.emit('pointerleave',{pointerType:type,clientX:180,clientY:y,relatedTarget});
  exit(0,'touch');assert.notEqual(button.dataset.emotion,'angry');
  exit(200);assert.notEqual(button.dataset.emotion,'angry');
  exit(0,'mouse',{});assert.notEqual(button.dataset.emotion,'angry');
  exit(0);assert.equal(button.dataset.emotion,'angry');assert.equal(button.dataset.state,'context');
  frame();assert.equal(nodes['#face'].attrs.stroke,'#ff777e');
  frame(35000);assert.equal(button.dataset.emotion,'angry');
  root.emit('pointerenter',{pointerType:'mouse'});frame();assert.equal(button.dataset.emotion,'neutral');assert.ok(reduced?nodes['#face'].attrs.stroke==='#b9e7ff':nodes['#face'].attrs.stroke!=='#ff777e');
  exit(0);win.emit('pointermove',{pointerType:'mouse',clientX:120,clientY:100});frame();assert.notEqual(button.dataset.emotion,'angry');assert.ok(reduced?nodes['#face'].attrs.stroke==='#b9e7ff':nodes['#face'].attrs.stroke!=='#ff777e');
  exit(0);win.emit('blur');frame();assert.equal(button.dataset.emotion,'angry');
  doc.emit('visibilitychange');frame();assert.equal(button.dataset.emotion,'neutral');
  // Preview before browser chrome takes over; no animation frame is required.
  const move=(y,x=180)=>win.emit('pointermove',{pointerType:'mouse',clientX:x,clientY:y});
  move(60);move(10);assert.equal(button.dataset.emotion,'angry');
  assert.equal(nodes['#face'].attrs.stroke,'#ff777e');
  assert.equal(nodes['#eye-left'].attrs.d,'M67 69Q82 77 97 85');
  move(40);frame();assert.equal(button.dataset.emotion,'neutral');
  // A fast departure may report a last in-page coordinate instead of y=0.
  move(100);move(35);
  win.emit('mouseout',{clientX:180,clientY:35,relatedTarget:null});assert.equal(button.dataset.emotion,'angry');
  root.emit('mouseenter',{});frame();assert.equal(button.dataset.emotion,'neutral');
  // Mouseout and mouseleave are fallbacks; duplicate exits are idempotent.
  win.emit('mouseout',{clientX:180,clientY:5,relatedTarget:null});assert.equal(button.dataset.emotion,'angry');
  root.emit('mouseleave',{clientX:180,clientY:5,relatedTarget:null});assert.equal(button.dataset.emotion,'angry');
  move(100);frame();assert.equal(button.dataset.emotion,'neutral');
  win.emit('mouseout',{clientX:180,clientY:5,relatedTarget:{}});assert.equal(button.dataset.emotion,'neutral');
  move(70);move(35,1);win.emit('mouseout',{clientX:0,clientY:35,relatedTarget:null});assert.notEqual(button.dataset.emotion,'angry');
  win.emit('pointerdown',{pointerType:'touch',isPrimary:true,clientX:180,clientY:5});
  win.emit('mouseout',{clientX:180,clientY:5,relatedTarget:null,sourceCapabilities:{firesTouchEvents:true}});assert.notEqual(button.dataset.emotion,'angry');
  // A touch double-tap activates love, including its color and dynamic accents.
  button.emit('click',{pointerType:'touch',detail:1});frame(100);
  let lastChosen=button.dataset.emotion;
  button.emit('click',{pointerType:'touch',detail:1});frame(100);
  assert.equal(button.dataset.emotion,'love');assert.ok(reduced?nodes['#face'].attrs.stroke==='#f9a1cb':nodes['#face'].attrs.stroke!=='#f9a1cb');
  for(let i=0;i<45;i++)frame(16);
  assert.equal(nodes['#face'].attrs.stroke,'#f9a1cb');
  assert.ok(Number(nodes['#blush'].attrs.opacity)>.3);assert.ok(Number(nodes['#hearts'].attrs.opacity)>.8);
  assert.ok(Number(nodes['#face-glow-alpha'].attrs.slope)>.3);
  if(!reduced){frame(33000);for(let i=0;i<40;i++)frame(16);assert.equal(button.dataset.emotion,'sleepy');assert.ok(Number(nodes['#face'].attrs.opacity)<.65);}
  const pool=['happy','sad','surprised','love','suspicious','bored','confused','excited','shy','angry','curious','laughing','scared','crying','dizzy','proud'];
  const newPoses={laughing:null,scared:'#scared-eyes',crying:'#tears',dizzy:'#spiral-eyes',proud:null};
  for(const [name,layer] of Object.entries(newPoses)){
   doc.emit('visibilitychange');frame(800);
   const candidates=pool.filter(n=>n!==lastChosen);randomValue=(candidates.indexOf(name)+.5)/candidates.length;
   button.emit('click',{pointerType:'mouse',detail:1});lastChosen=name;
   assert.equal(button.dataset.emotion,name);
   for(let i=0;i<25;i++)frame(16);
   for(const id of ['#tears','#spiral-eyes','#scared-eyes'])assert.ok(layer===id?Number(nodes[id].attrs.opacity)>.95:Number(nodes[id].attrs.opacity)<.05);
   assert.ok(name==='dizzy'?Number(nodes['#wavy-mouth'].attrs.opacity)>.95:Number(nodes['#wavy-mouth'].attrs.opacity)<.05);
   assert.ok(name==='scared'||name==='dizzy'?Number(nodes['#eye-left'].attrs.opacity)<.05:Number(nodes['#eye-left'].attrs.opacity)>.95);
   if(name==='laughing')assert.ok(Number(nodes['#mouth'].attrs['fill-opacity'])>.95);
   if(name==='dizzy'){assert.match(nodes['#spiral-left'].attrs.transform,/82 77/);assert.match(nodes['#spiral-right'].attrs.transform,/158 77/);}
   if(name==='proud')assert.ok(nodes['#head'].attrs.transform.includes('rotate(-'));
   move(60);move(10);assert.equal(button.dataset.emotion,'angry');assert.equal(nodes['#face'].attrs.stroke,'#ff777e');assert.equal(Number(nodes['#tears'].attrs.opacity),0);assert.equal(Number(nodes['#spiral-eyes'].attrs.opacity),0);assert.equal(Number(nodes['#scared-eyes'].attrs.opacity),0);move(80);frame();
  }
  doc.emit('visibilitychange');
  frame(19999);assert.notEqual(button.dataset.state,'drowsy');
  frame(1);if(!reduced){
   assert.equal(button.dataset.state,'drowsy');assert.equal(button.dataset.emotion,'drowsy');
   frame(2000);assert.equal(button.dataset.emotion,'slow-blink');
   frame(650);assert.equal(button.dataset.emotion,'drowsy');
   frame(7350);assert.equal(button.dataset.state,'yawning');
   for(let i=0;i<50;i++)frame(20);
   assert.ok(Number(nodes['#mouth'].attrs['fill-opacity'])>.9);
   frame(999);assert.equal(button.dataset.state,'yawning');
   frame(1);assert.equal(button.dataset.state,'sleeping');assert.equal(button.dataset.emotion,'sleepy');
   for(let i=0;i<40;i++)frame(20);
   assert.ok(Number(nodes['#sleep-symbols'].attrs.opacity)>.8);
   const glyph=nodes['#sleep-z1'].attrs.transform,headPose=nodes['#head'].attrs.transform;
   frame(100);assert.notEqual(nodes['#sleep-z1'].attrs.transform,glyph);assert.notEqual(nodes['#head'].attrs.transform,headPose);
   move(100);assert.equal(button.dataset.state,'waking');assert.equal(button.dataset.emotion,'neutral');
   frame(100);assert.ok(Number(nodes['#eye-left'].attrs['stroke-width'])<8);
   frame(200);assert.ok(Number(nodes['#eye-left'].attrs['stroke-width'])<8);
   frame(149);assert.equal(button.dataset.state,'waking');
   move(100);frame(1);assert.equal(button.dataset.emotion,'happy');
   frame(1000);assert.equal(button.dataset.emotion,'neutral');
   for(let i=0;i<20;i++)frame(16);assert.ok(Number(nodes['#sleep-symbols'].attrs.opacity)<.05);
   doc.emit('visibilitychange');frame(20000);win.emit('keydown');assert.equal(button.dataset.state,'waking');frame(450);assert.equal(button.dataset.emotion,'happy');
   doc.emit('visibilitychange');frame(30000);win.scrollY=10;win.emit('scroll');assert.equal(button.dataset.state,'waking');
   doc.emit('visibilitychange');frame(32000);contact.emit('pointerenter',{pointerType:'mouse'});assert.equal(button.dataset.emotion,'excited');frame(40000);assert.equal(button.dataset.emotion,'excited');contact.emit('pointerleave');frame();assert.equal(button.dataset.emotion,'neutral');
   frame(32000);social.emit('pointerenter',{pointerType:'mouse'});assert.equal(button.dataset.emotion,'curious');social.emit('pointerleave');frame(32000);move(60);move(10);assert.equal(button.dataset.emotion,'angry');assert.equal(Number(nodes['#sleep-symbols'].attrs.opacity),0);
   move(100);doc.emit('visibilitychange');move(160,500);for(let i=0;i<15;i++)frame(16);assert.notEqual(nodes['#mouth'].attrs.transform,'translate(0 0)');
   doc.emit('visibilitychange');randomValue=.75;for(let i=0;i<3;i++){frame(8000);assert.ok(!['angry','crying','scared'].includes(button.dataset.emotion));frame(2000);}
   doc.emit('visibilitychange');frame(32000);win.emit('pointerdown',{pointerType:'touch',isPrimary:true,clientX:100,clientY:100});assert.equal(button.dataset.state,'waking');
  }else{frame(40000);assert.notEqual(button.dataset.state,'sleeping');assert.equal(button.dataset.emotion,'neutral');}
  // Explicit mouse events never become touch gestures even in a narrow viewport.
  if(!reduced){narrow=true;randomValue=0;doc.emit('visibilitychange');frame(1000);button.emit('click',{pointerType:'mouse',detail:1});frame(100);button.emit('click',{pointerType:'mouse',detail:2});assert.notEqual(button.dataset.emotion,'love');narrow=false;}
  // An unconfirmed top-edge preview expires even with reduced motion.
  doc.emit('visibilitychange');move(80);move(10);assert.equal(button.dataset.emotion,'angry');frame(1799);assert.equal(button.dataset.emotion,'angry');frame(1);assert.equal(button.dataset.emotion,'neutral');
  // Confirmation cancels expiry and preserves the browser-exit reaction.
  move(80);move(10);exit(0);frame(2000);assert.equal(button.dataset.emotion,'angry');root.emit('pointerenter',{pointerType:'mouse'});frame();assert.equal(button.dataset.emotion,'neutral');
  // A previous click timeout must not override a newer CTA interaction.
  button.emit('click',{pointerType:'mouse',detail:1});contact.emit('pointerenter',{pointerType:'mouse'});frame(1500);assert.equal(button.dataset.emotion,'excited');contact.emit('pointerleave');
  // Reconstruct keyboard focus after a hidden tab is shown again.
  doc.activeElement=contact;contact.emit('focus');doc.hidden=true;doc.emit('visibilitychange');doc.hidden=false;doc.emit('visibilitychange');frame();assert.equal(button.dataset.emotion,'excited');doc.activeElement=null;contact.emit('blur');frame();assert.equal(button.dataset.emotion,'neutral');
 }
 scenario();scenario(true);
}

test('top-edge mouse exit, recovery, idle priority and reduced motion',()=>exercise(globals=>runInNewContext(source,globals),assert));
