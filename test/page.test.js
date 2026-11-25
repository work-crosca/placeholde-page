import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {config,render,manifest} from '../src/page.js';
test('defaults',()=>{assert.equal(config().mode,'soon');assert.match(render(config()),/Coming soon/);});
test('Romanian maintenance',()=>{const c=config({SITE_LANGUAGE:'ro',SITE_MODE:'maintenance'});assert.equal(c.title,'Revenim curând.');assert.match(render(c),/lang="ro"/);});
test('safe text and contact',()=>{const html=render(config({SITE_NAME:'<script>alert(1)</script>',SITE_EMAIL:'javascript:bad',SITE_MASCOT:'false'}));assert.ok(!html.includes('<script>alert'));assert.ok(!html.includes('mailto:'));assert.ok(!html.includes('id="mascot"'));});
test('valid contact and fallback',()=>{assert.match(render(config({SITE_EMAIL:'hello@example.com',SITE_LANGUAGE:'unknown'})),/mailto:hello@example.com/);assert.equal(config({SITE_LANGUAGE:'__proto__'}).lang,'en');});

test('Telegram only with valid username',()=>{const html=render(config({SITE_TELEGRAM:'mirco_test'}));assert.match(html,/https:\/\/t\.me\/mirco_test/);assert.match(html,/aria-label="Telegram"/);assert.ok(!render(config({SITE_TELEGRAM:'https://evil.test'})).includes('aria-label="Telegram"'));});

test('shared brand metadata',()=>{const html=render(config({SITE_URL:'https://example.mirco.uk'}));assert.ok(html.includes('content="https://example.mirco.uk/apple-touch-icon.png"'));assert.ok(html.includes('name="twitter:card"'));assert.ok(html.includes('href="/favicon.ico"'));assert.ok(html.includes('href="/apple-touch-icon.png"'));assert.equal(config({SITE_URL:'javascript:alert(1)'}).origin,'');});

test('head-only interactive mascot',()=>{const html=render(config());assert.match(html,/button type="button" class="mascot"/);assert.match(html,/id="eye-left"/);assert.match(html,/id="eye-right"/);assert.match(html,/id="mouth"/);assert.ok(!render(config({SITE_MASCOT:'false'})).includes('class="mascot"'));});

test('optional ASCII background',()=>{assert.match(render(config()),/id="ascii-background"/);assert.match(render(config()),/ascii-background\.js/);const html=render(config({SITE_ASCII_BACKGROUND:'false'}));assert.ok(!html.includes('id="ascii-background"'));assert.ok(!html.includes('ascii-background.js'));});

test('animated face layers',()=>{const html=render(config());assert.match(html,/id="hearts"/);assert.match(html,/id="sleep-symbols"/);assert.match(html,/mascot\.js\?v=dev/);});

test('header uses original brand mark',()=>{const html=render(config());assert.match(html,/<img src="\/images\/brand\/mark\.svg" width="48" height="28" alt="MIRCO"/);assert.ok(!html.includes('<span class="brand">MIRCO</span>'));});

test('contact uses SVG arrow icon',()=>{const html=render(config({SITE_EMAIL:'hello@example.com'}));assert.match(html,/<a class="contact"[^>]*>[^<]*<svg/);assert.ok(!html.includes('>↗<'));});

test('runtime manifest and metadata',()=>{const c=config({SITE_NAME:'Example',SITE_LANGUAGE:'ro'});const m=manifest(c);assert.equal(m.name,'Example');assert.equal(m.lang,'ro');assert.equal(m.start_url,'/');assert.equal(m.display,'browser');assert.equal(m.icons.length,3);assert.ok(m.icons.some(i=>i.purpose==='maskable'));const html=render(c);assert.match(html,/rel="manifest" href="\/manifest\.webmanifest"/);assert.match(html,/name="theme-color" content="#191717"/);assert.match(html,/property="og:locale" content="ro_RO"/);assert.ok(html.includes('https://mirco.uk/apple-touch-icon.png'));});

test('refined mascot SVG uses clipped reflection and dynamic accents',()=>{const html=render(config());for(const id of ['screen-blue','screen-clip','screen-shine','face-glow-alpha','blush'])assert.ok(html.includes('id="'+id+'"'));assert.match(html,/style\.css\?v=dev/);assert.match(html,/clip-path="url\(#screen-clip\)"/);});

test('mascot remains fixed across viewport sizes without reserving hero space',()=>{const css=readFileSync(new URL('../public/style.css',import.meta.url),'utf8');const rules=[...css.matchAll(/\.mascot\s*\{([^}]+)\}/g)].map(m=>m[1]);assert.ok(rules.length>=2);assert.match(rules[0],/position:fixed/);assert.match(rules[0],/bottom:calc\(100px \+ env\(safe-area-inset-bottom,0px\)\)/);assert.ok(rules.some(rule=>rule.includes('bottom:calc(80px + env(safe-area-inset-bottom,0px))')));assert.ok(rules.every(rule=>! /position:\s*(absolute|relative|static|sticky)/.test(rule)));assert.ok(!css.includes('.shell:has(.mascot) .hero'));assert.match(css,/header,footer,\.hero > \.contact\{z-index:11\}/);});

test('five new facial expressions have dedicated SVG layers',()=>{const html=render(config());for(const id of ['tears','spiral-eyes','scared-eyes','wavy-mouth'])assert.ok(html.includes('id="'+id+'"'));});

test('sleeping mascot has three independently animated Z glyphs',()=>{const html=render(config());for(const id of ['sleep-z1','sleep-z2','sleep-z3'])assert.ok(html.includes('id="'+id+'"'));});

test('decorative title and description layers are hidden by default without CSS',()=>{const html=render(config());assert.match(html,/class="typewriter-measure" aria-hidden="true" hidden/);assert.match(html,/class="typewriter-display" aria-hidden="true" hidden/);assert.match(html,/class="title-glitch-layer title-glitch-upper" aria-hidden="true" hidden/);assert.match(html,/class="title-glitch-layer title-glitch-lower" aria-hidden="true" hidden/);});

test('social previews use the square M icon and compact card',()=>{const html=render(config({SITE_URL:'https://example.mirco.uk'}));assert.match(html,/property="og:image" content="https:\/\/example\.mirco\.uk\/apple-touch-icon\.png"/);assert.match(html,/name="twitter:image" content="https:\/\/example\.mirco\.uk\/apple-touch-icon\.png"/);assert.match(html,/name="twitter:card" content="summary"/);assert.doesNotMatch(html,/property="og:image:(width|height)"/);});

test('Space Grotesk is self-hosted and applies to the page and controls',()=>{const css=readFileSync(new URL('../public/style.css',import.meta.url),'utf8');const server=readFileSync(new URL('../server.js',import.meta.url),'utf8');assert.match(css,/body\{[^}]*font-family:"Space Grotesk",Arial/);assert.match(css,/\.context-menu button\{[^}]*font:500 .9rem\/1.2 "Space Grotesk"/);assert.match(css,/font-weight:300 700/);assert.match(css,/h1\{[^}]*font-weight:700/);assert.match(server,/font-src 'self'/);assert.match(server,/space-grotesk-latin-ext-wght-normal\.woff2/);assert.match(server,/font\/woff2/);});

test('Mascot 2.0 has a larger display and independently animated spirals',()=>{const html=render(config());assert.match(html,/<rect x="30" y="29" width="180" height="120" rx="43" fill="url\(#screen-blue\)"\/>/);for(const id of ['spiral-left','spiral-right'])assert.ok(html.includes('id="'+id+'"'));const css=readFileSync(new URL('../public/style.css',import.meta.url),'utf8');assert.ok(css.includes('--mascot-size:clamp(180px,18vw,240px)'));assert.ok(css.includes('width:clamp(110px,30vw,140px)'));});

test('text selection uses the branded palette, including gradient headings',()=>{const css=readFileSync(new URL('../public/style.css',import.meta.url),'utf8');assert.match(css,/::selection\{background:#9fd8ff;color:#191717/);assert.match(css,/\.title-text::selection\{-webkit-text-fill-color:#191717;color:#191717;background-color:#9fd8ff/);});

test('circular cursor uses centered hotspots, preserves text selection and limits itself to fine pointers',()=>{
 const css=readFileSync(new URL('../public/style.css',import.meta.url),'utf8');
 assert.match(css,/@media \(hover:hover\) and \(pointer:fine\)/);
 assert.match(css,/cursor:url\("\/icons\/cursor-idle\.svg"\) 12 12,default/);
 assert.match(css,/cursor:url\("\/icons\/cursor-pointer\.svg"\) 12 12,pointer/);
 assert.match(css,/\.description,\.hero h1,[^{}]*\{cursor:text\}/);
 const idle=readFileSync(new URL('../public/icons/cursor-idle.svg',import.meta.url),'utf8');
 const pointer=readFileSync(new URL('../public/icons/cursor-pointer.svg',import.meta.url),'utf8');
 assert.match(idle,/fill="none"/);assert.match(pointer,/fill="#9fd8ff"/);
 for(const image of [idle,pointer])assert.match(image,/width="24" height="24"/);
});
