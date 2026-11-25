import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {FaTelegramPlane} from 'react-icons/fa';
import {FiArrowUpRight,FiClock,FiRefreshCw,FiPause,FiPlay,FiTerminal} from 'react-icons/fi';
const copy={
 en:{soon:'Coming soon.',maintenance:'Back soon.',description:'Something new is taking shape. Check back soon.',maintenanceDescription:'We’re making a few improvements. Please check back later.',status:'In development',maintenanceStatus:'Maintenance',contact:'Get in touch',menuLabel:'Page options',menuSoon:'Coming soon',menuRefresh:'Refresh',menuPause:'Pause animations',menuResume:'Resume animations',menuSystemMotion:'Animations paused by system settings'},
 ro:{soon:'În curând.',maintenance:'Revenim curând.',description:'Pregătim ceva nou. Revino în curând.',maintenanceDescription:'Facem câteva îmbunătățiri. Te rugăm să revii mai târziu.',status:'În dezvoltare',maintenanceStatus:'Mentenanță',contact:'Contactează-ne',menuLabel:'Opțiuni pagină',menuSoon:'În curând',menuRefresh:'Reîmprospătează',menuPause:'Oprește animațiile',menuResume:'Reia animațiile',menuSystemMotion:'Animații oprite prin setările sistemului'},
 ru:{soon:'Скоро.',maintenance:'Скоро вернёмся.',description:'Мы готовим кое-что новое. Загляните позже.',maintenanceDescription:'Мы работаем над улучшениями. Загляните позже.',status:'В разработке',maintenanceStatus:'Обслуживание',contact:'Связаться с нами',menuLabel:'Параметры страницы',menuSoon:'Скоро',menuRefresh:'Обновить',menuPause:'Приостановить анимацию',menuResume:'Возобновить анимацию',menuSystemMotion:'Анимация отключена настройками системы'}
};
export const descriptionPhrases={
 "en": [
  "Something new is taking shape.",
  "Good things take a little time.",
  "Building something worth the wait.",
  "A little progress every day.",
  "The next chapter is in the works.",
  "Ideas are becoming reality.",
  "Working behind the scenes.",
  "Something exciting is on the way."
 ],
 "ro": [
  "Pregătim ceva nou.",
  "Lucrurile bune au nevoie de timp.",
  "Construim ceva ce merită așteptarea.",
  "Facem progrese în fiecare zi.",
  "Următorul capitol prinde contur.",
  "Ideile devin realitate.",
  "Lucrăm în culise.",
  "Ceva interesant este pe drum."
 ],
 "ru": [
  "Что-то новое обретает форму.",
  "Хорошие вещи требуют времени.",
  "Создаём то, чего стоит ждать.",
  "Каждый день — шаг вперёд.",
  "Новая глава уже в работе.",
  "Идеи становятся реальностью.",
  "Работаем за кулисами.",
  "Впереди что-то интересное."
 ]
};
export const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function config(env={}){
 const lang=Object.hasOwn(copy,env.SITE_LANGUAGE)?env.SITE_LANGUAGE:'en';
 const mode=env.SITE_MODE==='maintenance'?'maintenance':'soon';
 const t=copy[lang], maintenance=mode==='maintenance';
 const gaValue=String(env.SITE_GOOGLE_ANALYTICS_ID||'').trim();
 const analyticsId=/^G-[A-Z0-9]{4,32}$/.test(gaValue)?gaValue:'';
 const customDescription=String(env.SITE_DESCRIPTION||'').trim();
 const phrases=maintenance||env.SITE_TYPEWRITER==='false'?[]:[...new Set([...(customDescription?[customDescription]:[]),...descriptionPhrases[lang]])];
 const email=/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(env.SITE_EMAIL||'')?env.SITE_EMAIL:'';
 const telegram=/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(env.SITE_TELEGRAM||'')?env.SITE_TELEGRAM:'';
 let origin='';
 try {const u=new URL(env.SITE_URL||'');if(['http:','https:'].includes(u.protocol)&&!u.username&&!u.password)origin=u.origin;}catch{}
 return {analyticsId,ascii:env.SITE_ASCII_BACKGROUND!=='false',origin,telegram,lang,mode,name:env.SITE_NAME||'MIRCO',title:env.SITE_TITLE||(maintenance?t.maintenance:t.soon),description:customDescription||(maintenance?t.maintenanceDescription:t.description),phrases,status:maintenance?t.maintenanceStatus:t.status,email,contact:t.contact,mascot:env.SITE_MASCOT!=='false'};
}
export function manifest(c){
 return {id:'/',name:c.name,short_name:c.name,description:c.description,lang:c.lang,start_url:'/',scope:'/',display:'browser',background_color:'#191717',theme_color:'#191717',icons:[
 {src:'/icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
 {src:'/icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
 {src:'/icons/icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}
 ]};
}
export function render(c,assetVersion='dev') {
 const e=escapeHtml;
 const menuCopy=copy[c.lang]||copy.en;
 const icon=Icon=>renderToStaticMarkup(createElement(Icon,{'aria-hidden':true,focusable:false,size:17}));
 const menuMarkup=`<div id="custom-context-menu" class="context-menu" role="menu" aria-label="${e(menuCopy.menuLabel)}" hidden><button type="button" role="menuitem" data-action="soon"><span class="context-menu-icon">${icon(FiClock)}</span><span>${e(menuCopy.menuSoon)}</span></button><button type="button" role="menuitem" data-action="refresh"><span class="context-menu-icon">${icon(FiRefreshCw)}</span><span>${e(menuCopy.menuRefresh)}</span></button><button type="button" role="menuitem" data-action="terminal"><span class="context-menu-icon">${icon(FiTerminal)}</span><span>${e(({en:'Terminal',ro:'Terminal',ru:'Терминал'})[c.lang])}</span></button><button type="button" role="menuitem" data-action="motion" data-motion-toggle="menu" data-pause="${e(menuCopy.menuPause)}" data-resume="${e(menuCopy.menuResume)}" data-system="${e(menuCopy.menuSystemMotion)}"><span class="context-menu-icon"><span class="motion-pause-icon">${icon(FiPause)}</span><span class="motion-play-icon">${icon(FiPlay)}</span></span><span data-motion-label>${e(menuCopy.menuPause)}</span></button></div><div id="context-menu-toast" class="context-menu-toast" role="status" aria-live="polite" hidden>${e(c.description)}</div>`;
 const phrases=c.phrases||[];
 const descriptionMarkup=phrases.length>1?`<p class="description description-rotating" data-typewriter="${e(JSON.stringify(phrases))}"><span class="typewriter-accessible">${e(phrases[0])}</span><span class="typewriter-measure" aria-hidden="true" hidden>${phrases.map(phrase=>`<span>${e(phrase)}<span class="typewriter-cursor"></span></span>`).join('')}</span><span class="typewriter-display" aria-hidden="true" hidden><span class="typewriter-text">${e(phrases[0])}</span><span class="typewriter-cursor"></span></span></p>`:`<p class="description">${e(c.description)}</p>`;
 const analyticsMarkup=c.analyticsId?`<script defer src="/analytics.js?v=${e(assetVersion)}" data-measurement-id="${e(c.analyticsId)}"></script>`:'';
 const title=e(c.title+' — '+c.name);
 const image=e((c.origin||'https://mirco.uk')+'/apple-touch-icon.png');
 const metadata=`<link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#191717"><meta name="color-scheme" content="dark"><meta name="application-name" content="${e(c.name)}"><meta name="apple-mobile-web-app-title" content="${e(c.name)}"><meta name="author" content="MIRCO"><meta property="og:locale" content="${({en:'en_GB',ro:'ro_RO',ru:'ru_RU'})[c.lang]}"><meta property="og:image:type" content="image/png"><meta property="og:type" content="website"><meta property="og:site_name" content="${e(c.name)}"><meta property="og:title" content="${title}"><meta property="og:description" content="${e(c.description)}"><meta property="og:image" content="${image}"><meta property="og:image:alt" content="${e(c.name)} logo"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${e(c.description)}"><meta name="twitter:image" content="${image}"><meta name="twitter:image:alt" content="${e(c.name)} logo">${c.origin?`<meta property="og:url" content="${e(c.origin)}/">`:''}`;
 return `<!doctype html><html lang="${e(c.lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><meta name="description" content="${e(c.description)}"><title>${e(c.title)} — ${e(c.name)}</title><link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" type="image/x-icon"><link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml"><link rel="icon" href="/icons/favicon-32.png" sizes="32x32" type="image/png"><link rel="icon" href="/icons/favicon-16.png" sizes="16x16" type="image/png"><link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">${metadata}${analyticsMarkup}<link rel="stylesheet" href="/style.css?v=${e(assetVersion)}"><script type="module" src="/mascot.js?v=${e(assetVersion)}"></script><script type="module" src="/context-menu.js?v=${e(assetVersion)}"></script><script type="module" src="/experience.js?v=${e(assetVersion)}"></script><script type="module" src="/title-glitch.js?v=${e(assetVersion)}"></script>${phrases.length>1?`<script type="module" src="/description-typewriter.js?v=${e(assetVersion)}"></script>`:""}${c.ascii?`<script type="module" src="/ascii-background.js?v=${e(assetVersion)}"></script>`:""}</head><body><main class="shell">${c.ascii?`<canvas id="ascii-background" aria-hidden="true"></canvas>`:""}<header><span class="brand"><img src="/images/brand/mark.svg" width="48" height="28" alt="${e(c.name)}"></span><span class="status"><i></i>${e(c.status)}</span></header><section class="hero">${descriptionMarkup}<h1><span class="title-text">${e(c.title)}</span><span class="title-glitch-layer title-glitch-upper" aria-hidden="true" hidden>${e(c.title)}</span><span class="title-glitch-layer title-glitch-lower" aria-hidden="true" hidden>${e(c.title)}</span></h1>${c.email?`<a class="contact" href="mailto:${e(c.email)}">${e(c.contact)} ${renderToStaticMarkup(createElement(FiArrowUpRight,{"aria-hidden":true,focusable:false,size:18}))}</a>`:''}</section>${c.mascot?`<button type="button" class="mascot" aria-label="${({en:'Interact with robot',ro:'Interacționează cu robotul',ru:'Взаимодействовать с роботом'})[c.lang]}"><svg id="mascot" viewBox="0 0 240 190" aria-hidden="true" focusable="false"><defs>
<linearGradient id="shell-blue" x1="0" y1="0" x2=".2" y2="1"><stop stop-color="#c6e7ff"/><stop offset=".55" stop-color="#94c4ed"/><stop offset="1" stop-color="#679ac9"/></linearGradient>
<linearGradient id="screen-blue" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#131f30"/><stop offset="1" stop-color="#080e18"/></linearGradient>
<linearGradient id="screen-reflection" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d2eeff" stop-opacity=".035"/><stop offset="1" stop-color="#d2eeff" stop-opacity="0"/></linearGradient>
<clipPath id="screen-clip"><rect x="30" y="29" width="180" height="120" rx="43"/></clipPath>
<filter id="face-glow" x="-25%" y="-40%" width="150%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/><feComponentTransfer in="blur" result="soft"><feFuncA id="face-glow-alpha" type="linear" slope=".22"/></feComponentTransfer><feMerge><feMergeNode in="soft"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs><g id="head">
<rect x="20" y="27" width="200" height="140" rx="51" fill="#42688b"/>
<rect x="20" y="19" width="200" height="140" rx="51" fill="url(#shell-blue)"/>
<rect x="30" y="29" width="180" height="120" rx="43" fill="url(#screen-blue)"/>
<g clip-path="url(#screen-clip)" pointer-events="none"><path id="screen-shine" d="M30 29H210V58Q120 43 30 58Z" fill="url(#screen-reflection)"/>
<g id="blush" fill="#ff9abd" opacity="0"><ellipse cx="58" cy="104" rx="10" ry="4"/><ellipse cx="182" cy="104" rx="10" ry="4"/></g>
<g id="face" fill="#b9e7ff" stroke="#b9e7ff" stroke-linecap="round" stroke-linejoin="round" filter="url(#face-glow)"><g id="eyes" fill="none" stroke-width="26"><path id="eye-left" d="M82 66Q82 77 82 88"/><path id="eye-right" d="M158 66Q158 77 158 88"/></g><g id="hearts" opacity="0" stroke="none"><path d="M82 97C43 70 72 53 82 68C92 53 121 70 82 97Z"/><path d="M158 97C119 70 148 53 158 68C168 53 197 70 158 97Z"/></g><g id="tears" opacity="0" fill="#77c7ff" stroke="none"><path d="M68 90C64 98 60 102 60 106a8 8 0 0 0 16 0c0-4-4-8-8-16Z"/><path d="M172 90c-4 8-8 12-8 16a8 8 0 0 0 16 0c0-4-4-8-8-16Z"/></g><g id="spiral-eyes" opacity="0" fill="none" stroke-width="4"><path id="spiral-left" d="M82 77c-5-5 4-11 10-5 9 9-4 20-15 14-14-8-8-29 9-30"/><path id="spiral-right" d="M158 77c-5-5 4-11 10-5 9 9-4 20-15 14-14-8-8-29 9-30"/></g><g id="scared-eyes" opacity="0" fill="none" stroke-width="5"><ellipse cx="82" cy="77" rx="12" ry="16"/><ellipse cx="158" cy="77" rx="12" ry="16"/></g><path id="wavy-mouth" d="M108 116q3-5 6 0t6 0t6 0t6 0" fill="none" stroke-width="3.8" opacity="0"/><path id="mouth" d="M108 115Q120 127 132 115" fill-opacity="0" stroke-width="4.5"/></g></g></g><g id="sleep-symbols" opacity="0" fill="#9fd8ff" font-family="monospace" font-size="13" pointer-events="none"><text id="sleep-z1" opacity="0">z</text><text id="sleep-z2" opacity="0">z</text><text id="sleep-z3" opacity="0">Z</text></g></svg></button>`:''}<footer><span>© ${new Date().getFullYear()} ${e(c.name)}</span><button type="button" class="motion-toggle" data-motion-toggle="standalone" data-pause="${e(menuCopy.menuPause)}" data-resume="${e(menuCopy.menuResume)}" data-system="${e(menuCopy.menuSystemMotion)}" aria-label="${e(menuCopy.menuPause)}" hidden><span class="motion-pause-icon">${icon(FiPause)}</span><span class="motion-play-icon">${icon(FiPlay)}</span></button>${c.telegram?`<a class="social" href="https://t.me/${e(c.telegram)}" aria-label="Telegram" target="_blank" rel="noopener noreferrer">${renderToStaticMarkup(createElement(FaTelegramPlane,{"aria-hidden":true,size:28}))}</a>`:""}</footer>${menuMarkup}</main></body></html>`;
}
