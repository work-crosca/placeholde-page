import test from 'node:test';
import assert from 'node:assert/strict';
import {commands,logo,createHistory,complete,formatUptime,crtPoint} from '../public/terminal-core.js';
test('terminal history preserves draft, bounds and resets',()=>{
 const h=createHistory(2);h.add('help');h.add('date');h.add('date');h.add('retro');
 assert.equal(h.move(-1,'draft'),'retro');assert.equal(h.move(-1,''),'date');assert.equal(h.move(-1,''),'date');
 assert.equal(h.move(1,''),'retro');assert.equal(h.move(1,''),'draft');h.reset();assert.equal(h.move(-1,'new'),'new');
});
test('completion is deterministic and restricted to known commands',()=>{
 assert.deepEqual(complete('neo'),{value:'neofetch',matches:['neofetch']});
 assert.equal(complete('re').value,'re');assert.deepEqual(complete('re').matches,['reboot','retro']);
 assert.deepEqual(complete('rm -rf'),{value:'rm -rf',matches:[]});assert.equal(commands.includes('matrix'),true);
 assert.equal(logo.split('\n').length,5);assert.equal(formatUptime(3661000),'01:01:01');
});
test('CRT curvature keeps center fixed and moves corners inward symmetrically',()=>{
 assert.deepEqual(crtPoint(500,250,1000,500),[500,250]);
 const a=crtPoint(0,0,1000,500),b=crtPoint(1000,500,1000,500);
 assert.ok(a[0]>0&&a[1]>0&&b[0]<1000&&b[1]<500);
 assert.ok(Math.abs(a[0]+b[0]-1000)<1e-8&&Math.abs(a[1]+b[1]-500)<1e-8);
});
