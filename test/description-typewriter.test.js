import test from 'node:test';
import assert from 'node:assert/strict';
import {config,render,descriptionPhrases} from '../src/page.js';
import {createTypewriter} from '../public/description-typewriter.js';

function harness(phrases=['First.','Second.','Third.']){
 const listeners=new Map();
 const motion={matches:false,addEventListener(k,fn){listeners.set(k,fn)},removeEventListener(k){listeners.delete(k)}};
 const doc={hidden:false,addEventListener(k,fn){listeners.set(k,fn)},removeEventListener(k){listeners.delete(k)}};
 const jobs=new Map();let id=0;
 const node={textContent:''};
 const controller=createTypewriter({node,phrases,motion,document:doc,random:()=>0,setTimer(fn,ms){jobs.set(++id,{fn,ms});return id},clearTimer(key){jobs.delete(key)}});
 function step(){const [key,job]=jobs.entries().next().value;jobs.delete(key);job.fn();return job.ms;}
 function until(text){for(let i=0;i<100&&node.textContent!==text;i++)step();assert.equal(node.textContent,text);}
 return {node,jobs,step,until,motion,doc,listeners,controller};
}
test('all locales have eight distinct phrases and accessible rotation markup',()=>{
 for(const lang of ['en','ro','ru']){
  assert.equal(new Set(descriptionPhrases[lang]).size,8);
  const html=render(config({SITE_LANGUAGE:lang}));
  assert.match(html,/data-typewriter="/);
  assert.match(html,/class="typewriter-display" aria-hidden="true"/);
  assert.match(html,/description-typewriter\.js/);
 }
});
test('custom and maintenance copy remain static',()=>{
 for(const env of [{SITE_DESCRIPTION:'Custom text'},{SITE_MODE:'maintenance'}]){
  assert.equal(config(env).phrases.length,0);
  assert.doesNotMatch(render(config(env)),/data-typewriter=/);
 }
});
test('phrases rotate without repetition and hold for at least five seconds',()=>{
 const h=harness();
 assert.equal(h.node.textContent,'First.');
 assert.equal(h.step(),5000);
 h.until('Second.');
 h.until('Third.');
 h.until('First.');
 h.controller.dispose();
 assert.equal(h.jobs.size,0);
});
test('reduced motion and hidden tabs cancel partial typing',()=>{
 const h=harness();
 h.step();assert.notEqual(h.node.textContent,'First.');
 h.motion.matches=true;h.listeners.get('change')();
 assert.equal(h.node.textContent,'First.');assert.equal(h.jobs.size,0);
 h.motion.matches=false;h.listeners.get('change')();assert.equal(h.jobs.size,1);
 h.doc.hidden=true;h.listeners.get('visibilitychange')();assert.equal(h.jobs.size,0);
 h.controller.dispose();assert.equal(h.listeners.size,0);
});

test('interrupted erasing does not skip the next unshown phrase',()=>{
 const h=harness();h.step();
 h.doc.hidden=true;h.listeners.get('visibilitychange')();
 assert.equal(h.node.textContent,'First.');
 h.doc.hidden=false;h.listeners.get('visibilitychange')();
 h.until('Second.');h.until('Third.');h.controller.dispose();
});
