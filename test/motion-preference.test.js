import test from 'node:test';
import assert from 'node:assert/strict';
import {createMotionPreference} from '../public/motion-preference.js';
test('manual pause persists, never overrides OS reduced motion, and survives storage errors',()=>{
 const callbacks=new Map(),media={matches:false,addEventListener(k,fn){callbacks.set(k,fn);}};
 let saved='false',events=0;
 const storage={getItem:()=>saved,setItem:(k,v)=>{saved=v;}};
 const root={dataset:{}},motion=createMotionPreference({media,storage,root});
 motion.addEventListener('change',()=>events++);
 motion.toggle();assert.equal(saved,'true');assert.equal(motion.matches,true);assert.equal(root.dataset.motionPaused,'true');
 media.matches=true;callbacks.get('change')();motion.toggle();assert.equal(saved,'false');assert.equal(motion.matches,true);
 media.matches=false;callbacks.get('change')();assert.equal(motion.matches,false);assert.equal(events,4);
 const blocked=createMotionPreference({media,storage:{getItem(){throw Error()},setItem(){throw Error()}}});blocked.toggle();assert.equal(blocked.matches,true);
});
