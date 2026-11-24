import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {FaTelegramPlane} from 'react-icons/fa';
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
 return {telegram,lang,mode,name:env.SITE_NAME||'MIRCO',title:env.SITE_TITLE||(maintenance?t.maintenance:t.soon),description:env.SITE_DESCRIPTION||(maintenance?t.maintenanceDescription:t.description),status:maintenance?t.maintenanceStatus:t.status,email,contact:t.contact,mascot:env.SITE_MASCOT!=='false'};
}
export function render(c){
 const e=escapeHtml;
 return `<!doctype html><html lang="${e(c.lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="description" content="${e(c.description)}"><title>${e(c.title)} — ${e(c.name)}</title><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/style.css"><script type="module" src="/mascot.js"></script></head><body><main class="shell"><header><span class="brand">${e(c.name)}</span><span class="status"><i></i>${e(c.status)}</span></header><section class="hero"><p class="description">${e(c.description)}</p><h1>${e(c.title)}</h1>${c.email?`<a class="contact" href="mailto:${e(c.email)}">${e(c.contact)} <span aria-hidden="true">↗</span></a>`:''}</section>${c.mascot?`<div class="mascot" aria-hidden="true"><svg id="mascot" viewBox="0 0 240 210"><ellipse cx="120" cy="194" rx="67" ry="9" fill="#050b10" opacity=".55"/><g id="head"><path d="M52 111Q23 85 43 68L66 86M174 86L197 68Q217 85 188 111" fill="#53bca9" stroke="#172f35" stroke-width="5"/><path d="M120 49V25" stroke="#9de6d4" stroke-width="6" stroke-linecap="round"/><circle cx="120" cy="20" r="9" fill="#e4ffad"/><rect x="49" y="48" width="142" height="130" rx="51" fill="#a9e8d7" stroke="#172f35" stroke-width="5"/><rect x="66" y="75" width="108" height="69" rx="31" fill="#17333b"/><g id="eyes"><ellipse cx="96" cy="108" rx="13" ry="17" fill="#f5fff8"/><ellipse cx="144" cy="108" rx="13" ry="17" fill="#f5fff8"/><g id="pupils" fill="#163a40"><circle cx="96" cy="108" r="6"/><circle cx="144" cy="108" r="6"/></g></g><path d="M108 153Q120 161 132 153" fill="none" stroke="#28595b" stroke-width="4" stroke-linecap="round"/><path d="M78 177v10m84-10v10" stroke="#74c8b8" stroke-width="13" stroke-linecap="round"/></g></svg></div>`:''}<footer><span>© ${new Date().getFullYear()} ${e(c.name)}</span>${c.telegram?`<a class="social" href="https://t.me/${e(c.telegram)}" aria-label="Telegram" target="_blank" rel="noopener noreferrer">${renderToStaticMarkup(createElement(FaTelegramPlane,{"aria-hidden":true,size:28}))}</a>`:""}</footer></main></body></html>`;
}
