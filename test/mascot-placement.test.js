import test from 'node:test';
import assert from 'node:assert/strict';
import {choosePlacement} from '../public/mascot/placement.js';
const box=(left,top,width,height)=>({left,top,width,height,right:left+width,bottom:top+height});
test('placement preserves the default if clear and moves out of content',()=>{
 const preferred=box(190,400,110,87),viewport={width:320,height:600};
 assert.deepEqual(choosePlacement({preferred,viewport,obstacles:[]}),preferred);
 const result=choosePlacement({preferred,viewport,obstacles:[box(20,380,280,115)]});
 assert.ok(result);assert.ok(result.bottom<=372||result.top>=503);
});
test('placement shrinks when needed, or hides when no safe area exists',()=>{
 const preferred=box(190,200,110,87),viewport={width:320,height:320};
 const result=choosePlacement({preferred,viewport,obstacles:[box(0,0,220,320)]});
 assert.ok(result);assert.ok(result.width<110);
 assert.equal(choosePlacement({preferred,viewport,obstacles:[box(0,0,320,320)]}),null);
});
