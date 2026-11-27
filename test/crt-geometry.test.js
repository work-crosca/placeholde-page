import test from 'node:test';
import assert from 'node:assert/strict';
import {filterGeometry} from '../public/crt.js';
test('one screen map retains the pronounced aspect-correct radial curvature',()=>{
 const screen={left:0,top:0,width:1440,height:900};
 const g=filterGeometry(screen,screen);
 assert.equal(g.scale,180);
 assert.deepEqual(g.map,{x:0,y:0,width:1440,height:900});
 assert.deepEqual(g.gains,{x:1,y:.625});
 assert.ok(g.region.x<=-g.scale/2&&g.region.width>=screen.width+g.scale);
 assert.ok(.45*g.scale>70);
});
test('a tall document samples the same viewport map before and after scroll',()=>{
 const screen={left:0,top:0,width:640,height:490};
 const before=filterGeometry({left:0,top:0,width:640,height:1400},screen);
 const after=filterGeometry({left:0,top:-320,width:640,height:1400},screen);
 assert.equal(after.map.y,320);assert.equal(before.scale,after.scale);
 assert.deepEqual(before.gains,after.gains);assert.deepEqual(before.region,after.region);
});
test('portrait and short landscape preserve equal relative curvature and safe caps',()=>{
 for(const [width,height] of [[320,568],[844,390],[1920,400]]){
  const screen={left:0,top:0,width,height},g=filterGeometry(screen,screen);
  assert.ok(g.scale<=Math.min(width,height)*.24&&g.scale<=180);
  assert.ok(Math.abs(g.gains.x/width-g.gains.y/height)<1e-12);
  assert.ok(g.scale*g.gains.x*.45/width<=.059);
 }
});
