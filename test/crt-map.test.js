import test from 'node:test';
import assert from 'node:assert/strict';
import {inflateSync} from 'node:zlib';
import {makeCrtMap,displacementChannels} from '../src/crt-map.js';
test('CRT displacement map is neutral in center and radially symmetric',()=>{
 assert.deepEqual(displacementChannels(.5,.5),[128,128,128]);
 const left=displacementChannels(0,.5),right=displacementChannels(1,.5),corner=displacementChannels(0,0);
 assert.ok(left[0]<128&&right[0]>128&&corner[0]<left[0]&&corner[1]<128);
 assert.equal(left[1],128);assert.ok(Math.abs(left[0]+right[0]-255)<=1);
});
test('radial displacement grows cubically toward the edge without channel saturation',()=>{
 const near=displacementChannels(.75,.5)[0]-128,edge=displacementChannels(1,.5)[0]-128;
 assert.ok(near>0&&edge>=near*6);
 const corner=displacementChannels(1,1);
 assert.ok(corner[0]>=240&&corner[0]<255&&corner[0]===corner[1]);
 assert.equal(displacementChannels(.5,0)[0],128);
});
test('CRT map is an opaque RGB PNG with expected scanlines',()=>{
 const map=makeCrtMap(9);assert.equal(map.subarray(1,4).toString(),'PNG');assert.equal(map.readUInt32BE(16),9);assert.equal(map[25],2);
 const length=map.readUInt32BE(33);assert.equal(map.subarray(37,41).toString(),'IDAT');
 const pixels=inflateSync(map.subarray(41,41+length));
 assert.equal(pixels.length,9*28);assert.deepEqual([...pixels.subarray(4*28+1+4*3,4*28+1+4*3+3)],[128,128,128]);
});
