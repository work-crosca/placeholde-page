import test from 'node:test';
import assert from 'node:assert/strict';
import {createMood} from '../public/mascot/mood.js';
test('mood is bounded, decays and avoids repeats',()=>{
 const mood=createMood(0,()=>.5);
 for(let i=0;i<10;i++)mood.react('happy',0);
 assert.equal(mood.value(0),3);
 assert.ok(mood.value(90000)<.03);
 assert.equal(mood.choose(['happy','sad'],'happy',0),'sad');
 for(let i=0;i<10;i++)mood.react('angry',0);
 assert.equal(mood.value(0),-3);
});
