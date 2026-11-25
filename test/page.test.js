import test from 'node:test';
import assert from 'node:assert/strict';
import {config,render,manifest} from '../src/page.js';
test('defaults',()=>{assert.equal(config().mode,'soon');assert.match(render(config()),/Coming soon/);});
test('Romanian maintenance',()=>{const c=config({SITE_LANGUAGE:'ro',SITE_MODE:'maintenance'});assert.equal(c.title,'Revenim curând.');assert.match(render(c),/lang="ro"/);});
test('safe text and contact',()=>{const html=render(config({SITE_NAME:'<script>alert(1)</script>',SITE_EMAIL:'javascript:bad',SITE_MASCOT:'false'}));assert.ok(!html.includes('<script>alert'));assert.ok(!html.includes('mailto:'));assert.ok(!html.includes('id="mascot"'));});
test('valid contact and fallback',()=>{assert.match(render(config({SITE_EMAIL:'hello@example.com',SITE_LANGUAGE:'unknown'})),/mailto:hello@example.com/);assert.equal(config({SITE_LANGUAGE:'__proto__'}).lang,'en');});

test('Telegram only with valid username',()=>{const html=render(config({SITE_TELEGRAM:'mirco_test'}));assert.match(html,/https:\/\/t\.me\/mirco_test/);assert.match(html,/aria-label="Telegram"/);assert.ok(!render(config({SITE_TELEGRAM:'https://evil.test'})).includes('aria-label="Telegram"'));});

test('shared brand metadata',()=>{const html=render(config({SITE_URL:'https://example.mirco.uk'}));assert.ok(html.includes('content="https://example.mirco.uk/images/social/mirco.png"'));assert.ok(html.includes('name="twitter:card"'));assert.ok(html.includes('href="/favicon.ico"'));assert.ok(html.includes('href="/apple-touch-icon.png"'));assert.equal(config({SITE_URL:'javascript:alert(1)'}).origin,'');});

test('head-only interactive mascot',()=>{const html=render(config());assert.match(html,/button type="button" class="mascot"/);assert.match(html,/id="eye-left"/);assert.match(html,/id="eye-right"/);assert.match(html,/id="mouth"/);assert.ok(!render(config({SITE_MASCOT:'false'})).includes('class="mascot"'));});

test('optional ASCII background',()=>{assert.match(render(config()),/id="ascii-background"/);assert.match(render(config()),/ascii-background\.js/);const html=render(config({SITE_ASCII_BACKGROUND:'false'}));assert.ok(!html.includes('id="ascii-background"'));assert.ok(!html.includes('ascii-background.js'));});

test('animated face layers',()=>{const html=render(config());assert.match(html,/id="hearts"/);assert.match(html,/id="sleep-symbols"/);assert.match(html,/mascot\.js\?v=robot-5/);});

test('header uses original brand mark',()=>{const html=render(config());assert.match(html,/<img src="\/images\/brand\/mark\.svg" width="48" height="28" alt="MIRCO"/);assert.ok(!html.includes('<span class="brand">MIRCO</span>'));});

test('contact uses SVG arrow icon',()=>{const html=render(config({SITE_EMAIL:'hello@example.com'}));assert.match(html,/<a class="contact"[^>]*>[^<]*<svg/);assert.ok(!html.includes('>↗<'));});

test('runtime manifest and metadata',()=>{const c=config({SITE_NAME:'Example',SITE_LANGUAGE:'ro'});const m=manifest(c);assert.equal(m.name,'Example');assert.equal(m.lang,'ro');assert.equal(m.start_url,'/');assert.equal(m.display,'browser');assert.equal(m.icons.length,3);assert.ok(m.icons.some(i=>i.purpose==='maskable'));const html=render(c);assert.match(html,/rel="manifest" href="\/manifest\.webmanifest"/);assert.match(html,/name="theme-color" content="#191717"/);assert.match(html,/property="og:locale" content="ro_RO"/);assert.ok(html.includes('https://mirco.uk/images/social/mirco.png'));});
