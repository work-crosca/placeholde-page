import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../public/mascot.js',import.meta.url),'utf8');

function exercise(run,assert){
 function scenario(reduced=false){
  let now=1000,raf=0;
  const listeners=()=>({events:{},addEventListener(n,f){(this.events[n]??=[]).push(f);},emit(n,e={}){for(const f of this.events[n]||[])f(e);}});
  const node=()=>Object.assign(listeners(),{attrs:{},dataset:{},setAttribute(k,v){this.attrs[k]=String(v);},getBoundingClientRect(){return {left:100,top:200,width:180,height:150};}});
  const nodes=Object.fromEntries(['#head','#eyes','#eye-left','#eye-right','#mouth','#face','#blush','#screen-shine','#face-glow-alpha','#hearts','#sleep-symbols'].map(k=>[k,node()]));
  const svg=Object.assign(node(),{querySelector:k=>nodes[k]});
  const button=Object.assign(node(),{querySelector:()=>svg});
  const root=listeners(),win=Object.assign(listeners(),{scrollY:0,dispatchEvent(){}});
  const doc=Object.assign(listeners(),{hidden:false,documentElement:root,querySelector:k=>k==='.mascot'?button:null});
  const queue=new Map();
  run({document:doc,window:win,matchMedia:q=>Object.assign(listeners(),{matches:q.includes('reduced-motion')&&reduced}),performance:{now:()=>now},requestAnimationFrame:f=>{queue.set(++raf,f);return raf;},cancelAnimationFrame:id=>queue.delete(id),setTimeout:()=>1,clearTimeout(){},navigator:{},CustomEvent:class{}});
  function frame(ms=16){now+=ms;const pending=[...queue.values()];queue.clear();for(const f of pending)f(now);}
  const exit=(y,type='mouse',relatedTarget=null)=>root.emit('pointerleave',{pointerType:type,clientX:180,clientY:y,relatedTarget});
  exit(0,'touch');assert.notEqual(button.dataset.emotion,'angry');
  exit(200);assert.notEqual(button.dataset.emotion,'angry');
  exit(0,'mouse',{});assert.notEqual(button.dataset.emotion,'angry');
  exit(0);assert.equal(button.dataset.emotion,'angry');assert.equal(button.dataset.state,'context');
  frame();assert.equal(nodes['#face'].attrs.stroke,'#ff777e');
  frame(35000);assert.equal(button.dataset.emotion,'angry');
  root.emit('pointerenter',{pointerType:'mouse'});frame();assert.equal(button.dataset.emotion,'neutral');assert.equal(nodes['#face'].attrs.stroke,'#9fd8ff');
  exit(0);win.emit('pointermove',{pointerType:'mouse',clientX:120,clientY:100});frame();assert.notEqual(button.dataset.emotion,'angry');assert.equal(nodes['#face'].attrs.stroke,'#9fd8ff');
  exit(0);win.emit('blur');frame();assert.equal(button.dataset.emotion,'neutral');
  exit(0);doc.emit('visibilitychange');frame();assert.equal(button.dataset.emotion,'neutral');
  // A touch double-tap activates love, including its color and dynamic accents.
  button.emit('click',{pointerType:'touch',detail:1});frame(100);
  button.emit('click',{pointerType:'touch',detail:1});frame(100);
  assert.equal(button.dataset.emotion,'love');assert.equal(nodes['#face'].attrs.stroke,'#f9a1cb');
  for(let i=0;i<15;i++)frame(16);
  assert.ok(Number(nodes['#blush'].attrs.opacity)>.3);assert.ok(Number(nodes['#hearts'].attrs.opacity)>.8);
  assert.ok(Number(nodes['#face-glow-alpha'].attrs.slope)>.3);
  if(!reduced){frame(31000);for(let i=0;i<20;i++)frame(16);assert.equal(button.dataset.emotion,'sleepy');assert.ok(Number(nodes['#face'].attrs.opacity)<.65);}
 }
 scenario();scenario(true);
}

test('top-edge mouse exit, recovery, idle priority and reduced motion',()=>exercise(globals=>runInNewContext(source,globals),assert));
