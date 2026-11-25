import test from 'node:test';
import assert from 'node:assert/strict';
import {filterGeometry} from '../public/crt.js';
test('CRT uses one shared screen origin and a bounded pixel displacement',()=>{
 const screen={left:0,top:0,width:1600,height:900};
 const title={left:100,top:370,width:1000,height:120},description={left:100,top:280,width:650,height:65};
 const a=filterGeometry(title,screen),b=filterGeometry(description,screen);
 assert.equal(a.scale,b.scale);assert.ok(a.scale<=32);
 assert.equal(title.left+a.map.x,screen.left);assert.equal(description.top+b.map.y,screen.top);
 assert.equal(a.map.width,b.map.width);assert.equal(a.map.height,b.map.height);
 assert.ok(a.region.x<=-a.scale/2&&a.region.width>=title.width+a.scale);
 assert.ok(b.region.y<=-b.scale/2&&b.region.height>=description.height+b.scale);
});
test('terminal has independent center and lower distortion strength',()=>{
 const window={left:400,top:200,width:640,height:490},output={left:424,top:260,width:592,height:350};
 const g=filterGeometry(output,window,true);
 assert.equal(g.map.x,-24);assert.equal(g.map.y,-60);assert.equal(g.map.width,640);assert.ok(g.scale<=10);
 const mobile=filterGeometry({left:0,top:0,width:320,height:568},{left:0,top:0,width:320,height:568});
 assert.ok(mobile.scale<g.scale+2);
});
