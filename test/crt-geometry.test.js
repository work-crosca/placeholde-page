import test from 'node:test';
import assert from 'node:assert/strict';
import {filterGeometry} from '../public/crt.js';
test('page targets share a screen origin and pronounced aspect-correct curvature',()=>{
 const screen={left:0,top:0,width:1440,height:900};
 const title={left:100,top:370,width:1000,height:120},description={left:100,top:280,width:650,height:65};
 const a=filterGeometry(title,screen),b=filterGeometry(description,screen);
 assert.equal(a.scale,b.scale);assert.equal(a.scale,180);
 assert.equal(title.left+a.map.x,screen.left);assert.equal(description.top+b.map.y,screen.top);
 assert.deepEqual(a.gains,{x:1,y:.625});assert.deepEqual(a.gains,b.gains);
 assert.equal(a.map.width,b.map.width);assert.equal(a.map.height,b.map.height);
 assert.ok(a.region.x<=-a.scale/2&&a.region.width>=title.width+a.scale);
 assert.ok(b.region.y<=-b.scale/2&&b.region.height>=description.height+b.scale);
 assert.ok(.45*a.scale>70);
 assert.ok(Math.abs(a.gains.x/screen.width-a.gains.y/screen.height)<1e-12);
});
test('terminal glass has its own center and stronger bounded distortion',()=>{
 const glass={left:400,top:240,width:640,height:448},output={left:424,top:260,width:592,height:350};
 const g=filterGeometry(output,glass,true);
 assert.equal(g.map.x,-24);assert.equal(g.map.y,-20);assert.equal(g.map.width,640);
 assert.ok(g.scale>70&&g.scale<=100);assert.ok(.45*g.scale>30);
});
test('portrait and short landscape preserve equal relative curvature and safe caps',()=>{
 for(const [width,height] of [[320,568],[844,390],[1920,400]]){
  const screen={left:0,top:0,width,height},g=filterGeometry(screen,screen);
  assert.ok(g.scale<=Math.min(width,height)*.24&&g.scale<=180);
  assert.ok(Math.abs(g.gains.x/width-g.gains.y/height)<1e-12);
  assert.ok(g.scale*g.gains.x*.45/width<=.059);
 }
});
