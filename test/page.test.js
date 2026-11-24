import test from 'node:test';
import assert from 'node:assert/strict';
import {config,render} from '../src/page.js';
test('defaults',()=>{assert.equal(config().mode,'soon');assert.match(render(config()),/Coming soon/);});
test('Romanian maintenance',()=>{const c=config({SITE_LANGUAGE:'ro',SITE_MODE:'maintenance'});assert.equal(c.title,'Revenim curând.');assert.match(render(c),/lang="ro"/);});
test('safe text and contact',()=>{const html=render(config({SITE_NAME:'<script>alert(1)</script>',SITE_EMAIL:'javascript:bad',SITE_MASCOT:'false'}));assert.ok(!html.includes('<script>alert'));assert.ok(!html.includes('mailto:'));assert.ok(!html.includes('id="mascot"'));});
test('valid contact and fallback',()=>{assert.match(render(config({SITE_EMAIL:'hello@example.com',SITE_LANGUAGE:'unknown'})),/mailto:hello@example.com/);assert.equal(config({SITE_LANGUAGE:'__proto__'}).lang,'en');});

test('Telegram only with valid username',()=>{const html=render(config({SITE_TELEGRAM:'mirco_test'}));assert.match(html,/https:\/\/t\.me\/mirco_test/);assert.match(html,/aria-label="Telegram"/);assert.ok(!render(config({SITE_TELEGRAM:'https://evil.test'})).includes('aria-label="Telegram"'));});
