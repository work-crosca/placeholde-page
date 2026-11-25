import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {config,render} from '../src/page.js';
const script=readFileSync(new URL('../public/analytics.js',import.meta.url),'utf8');
test('GA4 is opt-in and rejects invalid IDs',()=>{
 for(const value of ['', 'UA-123-1','G-ABC"><script>']){
  const c=config({SITE_GOOGLE_ANALYTICS_ID:value});
  assert.equal(c.analyticsId,'');
  assert.doesNotMatch(render(c),/data-measurement-id/);
 }
});
test('valid GA4 ID renders local initializer with runtime value',()=>{
 const c=config({SITE_GOOGLE_ANALYTICS_ID:' G-ENKKEVJ415 '});
 assert.equal(c.analyticsId,'G-ENKKEVJ415');
 assert.match(render(c,'abc'),/src="\/analytics\.js\?v=abc" data-measurement-id="G-ENKKEVJ415"/);
});
test('initializer queues config and loads Google tag',()=>{
 const window={},tags=[];
 const document={currentScript:{dataset:{measurementId:'G-ENKKEVJ415'}},createElement:()=>({}),head:{appendChild:tag=>tags.push(tag)}};
 runInNewContext(script,{document,window,Date,encodeURIComponent});
 assert.equal(tags.length,1);
 assert.equal(tags[0].src,'https://www.googletagmanager.com/gtag/js?id=G-ENKKEVJ415');
 assert.equal(window.dataLayer[1][0],'config');
 assert.equal(window.dataLayer[1][1],'G-ENKKEVJ415');
 assert.equal(window.dataLayer[1][2].allow_google_signals,false);
 assert.equal(window.dataLayer[1][2].allow_ad_personalization_signals,false);
});
test('invalid initializer ID does not load tracking',()=>{
 const window={};
 runInNewContext(script,{document:{currentScript:{dataset:{measurementId:'invalid'}}},window});
 assert.equal(window.dataLayer,undefined);
});
