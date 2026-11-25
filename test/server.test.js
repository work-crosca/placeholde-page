import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {server} from '../server.js';

test('HTTP server handles malformed targets and remains available',async(t)=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const port=server.address().port;
 function request(path,method='GET'){return new Promise((resolve,reject)=>{const req=http.request({hostname:'127.0.0.1',port,path,method},res=>{let body='';res.on('data',chunk=>body+=chunk);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));});req.on('error',reject);req.end();});}
 assert.equal((await request('//[')).status,400);
 assert.equal((await request('//example.com/health')).status,400);
 assert.equal((await request('/\\health')).status,400);
 const health=await request('/health?check=1');assert.equal(health.status,200);assert.deepEqual(JSON.parse(health.body),{status:'ok'});
 const head=await request('/health','HEAD');assert.equal(head.status,200);assert.equal(head.body,'');
 const post=await request('/health','POST');assert.equal(post.status,405);assert.equal(post.headers.allow,'GET, HEAD');
 assert.equal((await request('/missing')).status,404);
 assert.equal((await request('/manifest.webmanifest')).status,200);
 assert.equal((await request('/fonts/space-grotesk-latin.woff2')).status,200);
 for(const path of ['/motion-preference.js','/mascot/expressions.js','/mascot/placement.js','/mascot/renderer.js'])assert.equal((await request(path)).status,200);
 for(const path of ['/icons/cursor-idle.svg','/icons/cursor-pointer.svg']){const cursor=await request(path);assert.equal(cursor.status,200);assert.equal(cursor.headers['content-type'],'image/svg+xml');}
 const html=await request('/');assert.equal(html.headers['x-content-type-options'],'nosniff');
 const version=html.body.match(/style\.css\?v=([a-f0-9]{16})/)[1];
 const stylesheet=await request('/style.css?v='+version);
 assert.ok(stylesheet.body.includes('/icons/cursor-idle.svg?v='+version));
 assert.ok(stylesheet.body.includes('/icons/cursor-pointer.svg?v='+version));
 assert.ok(!stylesheet.body.includes('__ASSET_VERSION__'));
});
