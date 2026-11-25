import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createGlitchController} from '../public/title-glitch.js';
import {config,render} from '../src/page.js';

function harness(){
 const listeners=new Map(),jobs=new Map(),classes=new Set();
 const motion={matches:false,addEventListener(k,fn){listeners.set(k,fn)},removeEventListener(k){listeners.delete(k)}};
 const doc={hidden:false,addEventListener(k,fn){listeners.set(k,fn)},removeEventListener(k){listeners.delete(k)}};
 const layers=[{hidden:false},{hidden:false}];let id=0;
 const title={classList:{add:k=>classes.add(k),remove:k=>classes.delete(k)}};
 const controller=createGlitchController({title,layers,motion,document:doc,random:()=>0,setTimer(fn,ms){jobs.set(++id,{fn,ms});return id},clearTimer(key){jobs.delete(key)}});
 function step(){const [key,job]=jobs.entries().next().value;jobs.delete(key);job.fn();return job.ms;}
 return {listeners,jobs,classes,motion,doc,layers,controller,step};
}
test('glitch layers are hidden outside the 460ms animation',()=>{
 const h=harness();assert.ok(h.layers.every(layer=>layer.hidden));
 assert.equal(h.step(),1800);assert.ok(h.classes.has('is-glitching'));
 assert.ok(h.layers.every(layer=>!layer.hidden));
 assert.equal(h.step(),460);assert.ok(h.layers.every(layer=>layer.hidden));
 assert.ok(!h.classes.has('is-glitching'));h.controller.dispose();
 assert.equal(h.jobs.size,0);
});
test('glitch is cancelled on hidden tab or reduced motion',()=>{
 const h=harness();h.step();
 h.doc.hidden=true;h.listeners.get('visibilitychange')();
 assert.ok(h.layers.every(layer=>layer.hidden));assert.equal(h.jobs.size,0);
 h.doc.hidden=false;h.listeners.get('visibilitychange')();assert.equal(h.jobs.size,1);
 h.motion.matches=true;h.listeners.get('change')();assert.equal(h.jobs.size,0);
 h.controller.dispose();assert.equal(h.listeners.size,0);
});
test('decorative copies remain hidden and fallback text visible until enhancement',()=>{
 const html=render(config());
 assert.match(html,/<span class="typewriter-accessible">Something new is taking shape\.<\/span>/);
 assert.match(html,/class="title-glitch-layer title-glitch-upper" aria-hidden="true" hidden/);
 assert.match(html,/class="typewriter-display" aria-hidden="true" hidden/);
 const css=readFileSync(new URL('../public/style.css',import.meta.url),'utf8');
 assert.match(css,/\.title-glitch-layer\[hidden\]\{display:none!important\}/);
 assert.match(css,/\.typewriter-measure\[hidden\],\.typewriter-display\[hidden\]\{display:none!important\}/);
 assert.match(css,/\.description-rotating\.is-typewriter\{display:grid/);
 assert.match(css,/\.is-typewriter \.typewriter-accessible\{position:absolute/);
});
