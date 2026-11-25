import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';
const engine=process.env.BROWSER||'chromium';
const engines={chromium,firefox,webkit};
if(!engines[engine])throw new Error('Unknown browser: '+engine);
process.env.SITE_EMAIL='contact@example.com';
process.env.SITE_TELEGRAM='mirco_test';
const {server}=await import('../server.js');

await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const origin='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await engines[engine].launch();
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
   await page.locator('body').click({button:'right',position:{x:10,y:10}});
   await page.locator('#custom-context-menu').waitFor();
   await page.keyboard.press('End');await page.keyboard.press('Enter');
   await page.waitForFunction(()=>document.documentElement.dataset.motionPaused==='true');
   await page.locator('.motion-toggle').click();
   await page.waitForFunction(()=>document.documentElement.dataset.motionPaused==='false');
   const cursor=await page.evaluate(()=>({
    fine:matchMedia('(hover:hover) and (pointer:fine)').matches,
    idle:getComputedStyle(document.documentElement).cursor,
    pointer:getComputedStyle(document.querySelector('.motion-toggle')).cursor,
    text:getComputedStyle(document.querySelector('.hero h1')).cursor
   }));
   if(cursor.fine){
    assert.match(cursor.idle,/cursor-idle\.svg/);
    assert.match(cursor.pointer,/cursor-pointer\.svg/);
    assert.equal(cursor.text,'text');
    assert.match(cursor.idle,/\?v=[a-f0-9]{16}/);
   }else{
    // Firefox headless can report no fine pointer. Verify the native fallback instead.
    assert.doesNotMatch(cursor.idle,/cursor-idle\.svg/);
    assert.doesNotMatch(cursor.pointer,/cursor-pointer\.svg/);
    console.log(engine+' reports no fine hover pointer; native cursor fallback verified');
   }
   if(engine==='chromium'){await page.emulateMedia({forcedColors:'active'});assert.doesNotMatch(await page.locator('html').evaluate(el=>getComputedStyle(el).cursor),/cursor-idle\.svg/);await page.emulateMedia({forcedColors:'none'});}
   for(const path of ['/icons/cursor-idle.svg','/icons/cursor-pointer.svg'])assert.equal((await page.request.get(origin+path)).status(),200);
  }
  assert.equal(await page.locator('.contact').getAttribute('href'),'mailto:contact@example.com');
  assert.equal(await page.locator('.social').getAttribute('href'),'https://t.me/mirco_test');
  if(viewport.width===1440||viewport.width===320){
   await page.keyboard.press('Control+Shift+K');
   const terminal=page.locator('.mirco-terminal');
   await terminal.waitFor({state:'visible'});
   assert.equal(await terminal.locator('.terminal-window-controls button').count(),3);
   const dots=await terminal.locator('.terminal-window-dot').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return {left:b.left,right:b.right};}));
   assert.ok(dots[1].left-dots[0].right<=8&&dots[2].left-dots[1].right<=8);
   assert.equal(await terminal.locator('.terminal-logo').count(),1);
   assert.equal(await terminal.locator('.terminal-logo').getAttribute('aria-label'),'MIRCO');
   assert.ok((await terminal.locator('.terminal-logo').textContent()).split('\n').every(row=>row.length===33));
   assert.match(await terminal.locator('.terminal-info').innerText(),/MIRCO OS/);
   const bannerGeometry=await terminal.locator('.terminal-fetch').evaluate(el=>{
    const logo=el.querySelector('.terminal-logo'),svg=logo.querySelector('svg'),info=el.querySelector('.terminal-info'),out=el.closest('.terminal-output');
    const a=logo.getBoundingClientRect(),b=info.getBoundingClientRect(),c=svg.getBoundingClientRect();
    return {stacked:b.top>=a.bottom,width:a.width,height:a.height,svgWidth:c.width,svgHeight:c.height,overflow:logo.scrollWidth>logo.clientWidth+1||logo.scrollHeight>logo.clientHeight+1,bootOverflow:out.scrollHeight>out.clientHeight+1};
   });
   assert.ok(bannerGeometry.stacked&&bannerGeometry.width>0&&bannerGeometry.height>0);
   assert.ok(Math.abs(bannerGeometry.width-bannerGeometry.svgWidth)<1&&Math.abs(bannerGeometry.height-bannerGeometry.svgHeight)<1);
   assert.equal(bannerGeometry.overflow,false);
   assert.equal(bannerGeometry.bootOverflow,false,'fresh boot should fit at '+JSON.stringify(viewport));
   const command=terminal.locator('input');
   await command.fill('neo');await command.press('Tab');assert.equal(await command.inputValue(),'neofetch');
   await command.press('Enter');assert.equal(await terminal.locator('.terminal-logo').count(),2);
   await command.press('ArrowUp');assert.equal(await command.inputValue(),'neofetch');
   await command.press('ArrowDown');assert.equal(await command.inputValue(),'');
   await command.fill('reboot');await command.press('Enter');assert.equal(await terminal.locator('.terminal-logo').count(),1);
   await command.press('Control+l');assert.equal(await terminal.locator('.terminal-output').textContent(),'');
   await command.fill('fastfetch');await command.press('Enter');assert.equal(await terminal.locator('.terminal-logo').count(),1);
   await command.fill('matrix');await command.press('Enter');assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('mirco-matrix')),true);
   await command.fill('matrix');await command.press('Enter');assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('mirco-matrix')),false);
   const initial=await terminal.boundingBox();
   await terminal.locator('.terminal-maximize').click();
   assert.equal(await terminal.locator('.terminal-maximize').getAttribute('aria-pressed'),'true');
   const expanded=await terminal.boundingBox();
   assert.ok(expanded.height>=initial.height);
   assert.ok(expanded.x>=0&&expanded.y>=0&&expanded.x+expanded.width<=viewport.width+1&&expanded.y+expanded.height<=viewport.height+1);
   await terminal.locator('.terminal-maximize').click();
   assert.equal(await terminal.locator('.terminal-maximize').getAttribute('aria-pressed'),'false');
   await terminal.locator('input').fill('help');
   await terminal.locator('input').press('Enter');
   await page.waitForFunction(()=>document.querySelector('.terminal-output').textContent.includes('whoami'));
   assert.ok((await terminal.locator('.terminal-output').boundingBox()).height>=48);
   assert.match(await terminal.locator('.terminal-output').innerText(),/whoami/);
   await terminal.locator('.terminal-minimize').click();
   await terminal.waitFor({state:'hidden'});
   await page.keyboard.press('Control+Shift+K');
   await terminal.waitFor({state:'visible'});
   assert.match(await terminal.locator('.terminal-output').innerText(),/whoami/);
   await terminal.locator('.terminal-close').click();
   await terminal.waitFor({state:'hidden'});
   await page.keyboard.press('Control+Shift+K');
   await terminal.locator('input').fill('retro');
   await terminal.locator('input').press('Enter');
   assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('mirco-retro')),true);
   assert.match(await page.locator('.hero h1').evaluate(el=>getComputedStyle(el).filter),/mirco-crt-warp/);
   assert.equal(await page.locator('.contact').evaluate(el=>getComputedStyle(el).filter),'none');
   assert.equal((await page.request.get(origin+'/icons/crt-displacement.png')).status(),200);
   await page.keyboard.press('Escape');
   await terminal.waitFor({state:'hidden'});
   if(viewport.width===1440){
    // An isolated stationary stripe probe verifies actual rendered pixel displacement.
    await page.evaluate(()=>{
     const probe=document.createElement('div');probe.id='crt-pixel-probe';
     Object.assign(probe.style,{position:'fixed',left:'30px',top:'30px',width:'260px',height:'160px',background:'repeating-linear-gradient(0deg,#fff 0 8px,#000 8px 16px)',zIndex:'1000',pointerEvents:'none'});
     document.body.append(probe);
    });
    const probe=page.locator('#crt-pixel-probe');
    const flat=await probe.screenshot({animations:'disabled'});
    await probe.evaluate(el=>{el.style.filter='url("#mirco-crt-warp")';});
    await page.waitForFunction(()=>getComputedStyle(document.querySelector('#crt-pixel-probe')).filter!=='none');
    const warped=await probe.screenshot({animations:'disabled'});
    assert.notDeepEqual(flat,warped,'CRT must change rendered pixels, not merely CSS state');
    await probe.evaluate(el=>el.remove());
   }
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
  assert.equal(await control.getAttribute('aria-disabled'),'true');
  assert.equal(await control.getAttribute('aria-label'),'Animations paused by system settings');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.waitForFunction(()=>document.documentElement.dataset.motionPaused==='false');
  if(viewport.width===600&&await mascot.isVisible()){
   await mascot.dblclick();
   assert.notEqual(await mascot.getAttribute('data-emotion'),'love');
  }
  await page.close();
 }
 if(engine!=='firefox'){
 const touch=await browser.newPage({viewport:{width:390,height:1000},hasTouch:true,isMobile:true});
 touch.on('pageerror',error=>errors.push(String(error)));
 await touch.goto(origin);
 assert.doesNotMatch(await touch.locator('html').evaluate(el=>getComputedStyle(el).cursor),/cursor-idle\.svg/);
 await touch.waitForFunction(()=>['placed','hidden'].includes(document.querySelector('.mascot').dataset.placement));
 const mascot=touch.locator('.mascot');
 await mascot.waitFor({state:'visible'});
 {
  const b=await mascot.boundingBox();
  await touch.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await touch.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);
  await touch.waitForFunction(()=>document.querySelector('.mascot').dataset.emotion==='love',null,{timeout:2000});
 }
 await touch.close();
 }
 assert.deepEqual(errors,[]);
 console.log(engine+' smoke: desktop, narrow desktop, mobile, landscape, motion persistence and reduced motion passed');
}finally{
 await browser?.close();
 await new Promise(resolve=>server.close(resolve));
}
