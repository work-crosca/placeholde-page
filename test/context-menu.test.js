import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {config,render} from '../src/page.js';

const script=readFileSync(new URL('../public/context-menu.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../public/style.css',import.meta.url),'utf8');
const server=readFileSync(new URL('../server.js',import.meta.url),'utf8');

test('context menu is rendered with localized accessible actions',()=>{
  const en=render(config());
  assert.match(en,/id="custom-context-menu"[^>]*role="menu"[^>]*hidden/);
  assert.match(en,/role="menuitem" data-action="soon"/);
  assert.match(en,/role="menuitem" data-action="refresh"/);
  assert.match(en,/Page options/);
  assert.match(en,/Coming soon/);
  assert.match(en,/Refresh/);
  assert.match(en,/id="context-menu-toast"[^>]*role="status"[^>]*aria-live="polite" hidden/);
  assert.match(en,/context-menu\.js\?v=dev/);
  const ro=render(config({SITE_LANGUAGE:'ro'}));
  assert.match(ro,/Opțiuni pagină/);
  assert.match(ro,/Reîmprospătează/);
  const ru=render(config({SITE_LANGUAGE:'ru'}));
  assert.match(ru,/Параметры страницы/);
  assert.match(ru,/Обновить/);
});

test('new script is served and the menu is visible only on request',()=>{
  assert.match(server,/\['\/context-menu\.js','text\/javascript'\]/);
  assert.match(css,/\.context-menu\[hidden\],\.context-menu-toast\[hidden\]\{display:none\}/);
  assert.match(css,/\.context-menu\{[^}]*position:fixed/);
  assert.match(css,/@keyframes context-menu-enter/);
});

test('menu supports keyboard, viewport bounds, outside dismissal and actions',()=>{
  assert.match(script,/addEventListener\('contextmenu'/);
  assert.match(script,/event\.preventDefault\(\)/);
  assert.match(script,/window\.innerWidth - bounds\.width/);
  assert.match(script,/window\.innerHeight - bounds\.height/);
  assert.match(script,/event\.key === 'Escape'/);
  assert.match(script,/event\.key === 'ContextMenu'/);
  assert.match(script,/event\.key === 'ArrowDown'/);
  assert.match(script,/addEventListener\('pointerdown'/);
  assert.match(script,/window\.location\.reload\(\)/);
  assert.match(script,/toast\.hidden = false/);
  assert.match(script,/pointerType === 'touch'/);
  assert.match(script,/function editable\(target\)/);
});

test('all animated assets use the same deployment fingerprint',()=>{
 const html=render(config(),'abc123def456');
 for(const file of ['style.css','mascot.js','context-menu.js','title-glitch.js','description-typewriter.js','ascii-background.js'])assert.ok(html.includes('/'+file+'?v=abc123def456'));
 assert.match(server,/createHash\('sha256'\)/);
 assert.match(server,/render\(settings,assetVersion\)/);
});

test('context menu has spaced items and no visible border',()=>{const rule=css.match(/\.context-menu\{([^}]+)\}/)[1];assert.match(rule,/display:flex/);assert.match(rule,/flex-direction:column/);assert.match(rule,/gap:4px/);assert.match(rule,/border:0/);});

test('native links and media keep their own menu and selection remains readable',()=>{assert.match(script,/nativeMenu\(event.target\)/);assert.match(script,/a\[href\], img, video, audio/);assert.match(css,/::selection\{[^}]*background:#9fd8ff/);});
