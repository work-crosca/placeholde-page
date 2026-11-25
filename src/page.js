import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {FaTelegramPlane} from 'react-icons/fa';
import {FiArrowUpRight} from 'react-icons/fi';
const copy={
 en:{soon:'Coming soon.',maintenance:'Back soon.',description:'Something new is taking shape. Check back soon.',maintenanceDescription:'We’re making a few improvements. Please check back later.',status:'In development',maintenanceStatus:'Maintenance',contact:'Get in touch'},
 ro:{soon:'În curând.',maintenance:'Revenim curând.',description:'Pregătim ceva nou. Revino în curând.',maintenanceDescription:'Facem câteva îmbunătățiri. Te rugăm să revii mai târziu.',status:'În dezvoltare',maintenanceStatus:'Mentenanță',contact:'Contactează-ne'},
 ru:{soon:'Скоро.',maintenance:'Скоро вернёмся.',description:'Мы готовим кое-что новое. Загляните позже.',maintenanceDescription:'Мы работаем над улучшениями. Загляните позже.',status:'В разработке',maintenanceStatus:'Обслуживание',contact:'Связаться с нами'}
};
export const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function config(env={}){
 const lang=Object.hasOwn(copy,env.SITE_LANGUAGE)?env.SITE_LANGUAGE:'en';
 const mode=env.SITE_MODE==='maintenance'?'maintenance':'soon';
 const t=copy[lang], maintenance=mode==='maintenance';
 const email=/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(env.SITE_EMAIL||'')?env.SITE_EMAIL:'';
 const telegram=/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(env.SITE_TELEGRAM||'')?env.SITE_TELEGRAM:'';
 let origin='';
 try {const u=new URL(env.SITE_URL||'');if(['http:','https:'].includes(u.protocol)&&!u.username&&!u.password)origin=u.origin;}catch{}
 return {ascii:env.SITE_ASCII_BACKGROUND!=='false',origin,telegram,lang,mode,name:env.SITE_NAME||'MIRCO',title:env.SITE_TITLE||(maintenance?t.maintenance:t.soon),description:env.SITE_DESCRIPTION||(maintenance?t.maintenanceDescription:t.description),status:maintenance?t.maintenanceStatus:t.status,email,contact:t.contact,mascot:env.SITE_MASCOT!=='false'};
}
export function manifest(c){
 return {id:'/',name:c.name,short_name:c.name,description:c.description,lang:c.lang,start_url:'/',scope:'/',display:'browser',background_color:'#191717',theme_color:'#191717',icons:[
 {src:'/icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
 {src:'/icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
 {src:'/icons/icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}
 ]};
}
export function render(c){
 const e=escapeHtml;
 const title=e(c.title+' — '+c.name);
 const image=e((c.origin||'https://mirco.uk')+'/images/social/mirco.png');
 const metadata=`<link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#191717"><meta name="color-scheme" content="dark"><meta name="application-name" content="${e(c.name)}"><meta name="apple-mobile-web-app-title" content="${e(c.name)}"><meta name="author" content="MIRCO"><meta property="og:locale" content="${({en:'en_GB',ro:'ro_RO',ru:'ru_RU'})[c.lang]}"><meta property="og:image:type" content="image/png"><meta property="og:type" content="website"><meta property="og:site_name" content="${e(c.name)}"><meta property="og:title" content="${title}"><meta property="og:description" content="${e(c.description)}"><meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Mirco — Software &amp; Engineering"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${e(c.description)}"><meta name="twitter:image" content="${image}"><meta name="twitter:image:alt" content="Mirco — Software &amp; Engineering">${c.origin?`<meta property="og:url" content="${e(c.origin)}/">`:''}`;
 return `<!doctype html><html lang="${e(c.lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><meta name="description" content="${e(c.description)}"><title>${e(c.title)} — ${e(c.name)}</title><link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" type="image/x-icon"><link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml"><link rel="icon" href="/icons/favicon-32.png" sizes="32x32" type="image/png"><link rel="icon" href="/icons/favicon-16.png" sizes="16x16" type="image/png"><link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">${metadata}<link rel="stylesheet" href="/style.css?v=fixed-mascot-1"><script type="module" src="/mascot.js?v=robot-9"></script>${c.ascii?`<script type="module" src="/ascii-background.js?v=3"></script>`:""}</head><body><main class="shell">${c.ascii?`<canvas id="ascii-background" aria-hidden="true"></canvas>`:""}<header><span class="brand"><img src="/images/brand/mark.svg" width="48" height="28" alt="${e(c.name)}"></span><span class="status"><i></i>${e(c.status)}</span></header><section class="hero"><p class="description">${e(c.description)}</p><h1>${e(c.title)}</h1>${c.email?`<a class="contact" href="mailto:${e(c.email)}">${e(c.contact)} ${renderToStaticMarkup(createElement(FiArrowUpRight,{"aria-hidden":true,focusable:false,size:18}))}</a>`:''}</section>${c.mascot?`<button type="button" class="mascot" aria-label="${({en:'Interact with robot',ro:'Interacționează cu robotul',ru:'Взаимодействовать с роботом'})[c.lang]}"><svg id="mascot" viewBox="0 0 240 190" aria-hidden="true" focusable="false"><defs>
<linearGradient id="shell-blue" x1="0" y1="0" x2=".35" y2="1"><stop stop-color="#c7eaff"/><stop offset=".55" stop-color="#8bc5f5"/><stop offset="1" stop-color="#619cde"/></linearGradient>
<linearGradient id="screen-blue" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#17263c"/><stop offset="1" stop-color="#091321"/></linearGradient>
<linearGradient id="screen-reflection" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d2eeff" stop-opacity=".12"/><stop offset="1" stop-color="#d2eeff" stop-opacity="0"/></linearGradient>
<clipPath id="screen-clip"><rect x="39" y="29" width="162" height="117" rx="40"/></clipPath>
<filter id="face-glow" x="-25%" y="-40%" width="150%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/><feComponentTransfer in="blur" result="soft"><feFuncA id="face-glow-alpha" type="linear" slope=".22"/></feComponentTransfer><feMerge><feMergeNode in="soft"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs><g id="head">
<rect x="24" y="21" width="192" height="147" rx="53" fill="#477daf"/>
<rect x="24" y="15" width="192" height="147" rx="53" fill="url(#shell-blue)" stroke="#addcff" stroke-width="1"/>
<rect x="36" y="26" width="168" height="124" rx="43" fill="#5389bc"/>
<rect x="39" y="29" width="162" height="117" rx="40" fill="url(#screen-blue)"/>
<g clip-path="url(#screen-clip)" pointer-events="none"><path id="screen-shine" d="M36 24H204V65Q120 40 36 65Z" fill="url(#screen-reflection)"/>
<g id="blush" fill="#ff9abd" opacity="0"><ellipse cx="67" cy="103" rx="10" ry="4"/><ellipse cx="173" cy="103" rx="10" ry="4"/></g>
<g id="face" fill="#9fd8ff" stroke="#9fd8ff" stroke-linecap="round" stroke-linejoin="round" filter="url(#face-glow)"><g id="eyes" fill="none" stroke-width="20"><path id="eye-left" d="M85 69Q85 79 85 89"/><path id="eye-right" d="M155 69Q155 79 155 89"/></g><g id="hearts" opacity="0" stroke="none"><path d="M85 96C47 70 76 55 85 70C94 55 123 70 85 96Z"/><path d="M155 96C117 70 146 55 155 70C164 55 193 70 155 96Z"/></g><g id="tears" opacity="0" fill="#77c7ff" stroke="none"><path d="M73 91C69 99 65 103 65 107a8 8 0 0 0 16 0c0-4-4-8-8-16Z"/><path d="M167 91c-4 8-8 12-8 16a8 8 0 0 0 16 0c0-4-4-8-8-16Z"/></g><g id="spiral-eyes" opacity="0" fill="none" stroke-width="4"><path d="M85 79c-5-5 4-11 10-5 9 9-4 20-15 14-14-8-8-29 9-30"/><path d="M155 79c-5-5 4-11 10-5 9 9-4 20-15 14-14-8-8-29 9-30"/></g><g id="scared-eyes" opacity="0" fill="none" stroke-width="5"><ellipse cx="85" cy="79" rx="11" ry="16"/><ellipse cx="155" cy="79" rx="11" ry="16"/></g><path id="wavy-mouth" d="M108 117l6-5 6 5 6-5 6 5" fill="none" stroke-width="3.8" opacity="0"/><path id="mouth" d="M110 116Q120 123 130 116" fill-opacity="0" stroke-width="3.8"/></g></g></g><g id="sleep-symbols" opacity="0" fill="#9fd8ff" font-family="monospace" font-size="13" pointer-events="none"><text id="sleep-z1" opacity="0">z</text><text id="sleep-z2" opacity="0">z</text><text id="sleep-z3" opacity="0">Z</text></g></svg></button>`:''}<footer><span>© ${new Date().getFullYear()} ${e(c.name)}</span>${c.telegram?`<a class="social" href="https://t.me/${e(c.telegram)}" aria-label="Telegram" target="_blank" rel="noopener noreferrer">${renderToStaticMarkup(createElement(FaTelegramPlane,{"aria-hidden":true,size:28}))}</a>`:""}</footer></main></body></html>`;
}
