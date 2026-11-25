import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { server } from '../server.js';

await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const origin='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch();
 const errors=[];
 for(const viewport of [{width:1440,height:900},{width:600,height:900},{width:320,height:568},{width:844,height:390}]){
  const page=await browser.newPage({viewport});
  page.on('pageerror',error=>errors.push(String(error)));
  await page.addInitScript(()=>{Math.random=()=>.1;});
  await page.goto(origin);
  const mascot=page.locator('.mascot');
  await mascot.waitFor({state:'attached'});
  await page.waitForFunction(()=>['placed','hidden'].includes(document.querySelector('.mascot').dataset.placement));
  const safe=await page.evaluate(()=>{
   const m=document.querySelector('.mascot');
   if(m.dataset.placement==='hidden')return true;
   const a=m.getBoundingClientRect();
   return [...document.querySelectorAll('.hero .description,.hero h1,.hero .contact,header > *,footer > *')].filter(el=>!el.hidden).every(el=>{
    const b=el.getBoundingClientRect();
    return !(a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1);
   });
  });
  assert.ok(safe,'mascot must not cover content at '+JSON.stringify(viewport));
  if(viewport.width===1440)assert.equal(await mascot.getAttribute('data-placement'),'placed');
  if(viewport.width===1440){
   const cursor=await page.evaluate(()=>({
    idle:getComputedStyle(document.documentElement).cursor,
    pointer:getComputedStyle(document.querySelector('.motion-toggle')).cursor,
    text:getComputedStyle(document.querySelector('.hero h1')).cursor
   }));
   assert.match(cursor.idle,/cursor-idle\.svg/);
   assert.match(cursor.pointer,/cursor-pointer\.svg/);
   assert.equal(cursor.text,'text');
   for(const path of ['/icons/cursor-idle.svg','/icons/cursor-pointer.svg'])assert.equal((await page.request.get(origin+path)).status(),200);
  }
  if(viewport.width===1440){
   await page.keyboard.press('Control+Shift+K');
   const terminal=page.locator('.mirco-terminal');
   await terminal.waitFor({state:'visible'});
   await terminal.locator('input').fill('help');
   await terminal.locator('input').press('Enter');
   assert.match(await terminal.locator('.terminal-output').innerText(),/whoami/);
   await terminal.locator('input').fill('retro');
   await terminal.locator('input').press('Enter');
   assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('mirco-retro')),true);
   await page.keyboard.press('Escape');
   await terminal.waitFor({state:'hidden'});
   await page.keyboard.press('Control+Shift+K');
   await terminal.locator('input').fill('retro');
   await terminal.locator('input').press('Enter');
   await page.keyboard.press('Escape');
   await terminal.waitFor({state:'hidden'});
   for(const name of ['happy','love','angry','sleep'])assert.equal((await page.request.get(origin+'/icons/mood-'+name+'.svg')).status(),200);
  }
  const control=page.locator('.motion-toggle');
  await control.click();
  assert.equal(await page.locator('html').getAttribute('data-motion-paused'),'true');
  await page.reload();await control.waitFor();
  assert.equal(await page.locator('html').getAttribute('data-motion-paused'),'true');
  await control.click();
  assert.equal(await page.locator('html').getAttribute('data-motion-paused'),'false');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.documentElement.dataset.motionPaused==='true');
  await control.click();await control.click();
  assert.equal(await page.locator('html').getAttribute('data-motion-paused'),'true');
  if(viewport.width===600&&await mascot.isVisible()){
   await mascot.dblclick();
   assert.notEqual(await mascot.getAttribute('data-emotion'),'love');
  }
  await page.close();
 }
 const touch=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 touch.on('pageerror',error=>errors.push(String(error)));
 await touch.goto(origin);
 assert.doesNotMatch(await touch.locator('html').evaluate(el=>getComputedStyle(el).cursor),/cursor-idle\.svg/);
 await touch.waitForFunction(()=>['placed','hidden'].includes(document.querySelector('.mascot').dataset.placement));
 const mascot=touch.locator('.mascot');
 if(await mascot.isVisible()){
  const b=await mascot.boundingBox();
  await touch.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await touch.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);
  assert.equal(await mascot.getAttribute('data-emotion'),'love');
 }
 await touch.close();
 assert.deepEqual(errors,[]);
 console.log('Chromium smoke: desktop, narrow desktop, mobile, landscape, motion persistence and reduced motion passed');
}finally{
 await browser?.close();
 await new Promise(resolve=>server.close(resolve));
}
