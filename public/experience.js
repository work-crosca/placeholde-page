import {motion} from './motion-preference.js';
import './crt.js';
import {commands,logo,createHistory,complete,formatUptime} from './terminal-core.js';
const lang=document.documentElement.lang;
const copy={
 en:{title:'MIRCO terminal',close:'Close',input:'Command',run:'Run',intro:'Type help to explore.',about:'A small digital experience from MIRCO.',unknown:'Unknown command. Try help.',robot:'Hello, human!',secret:'You found a little secret!',offline:'Offline',online:'Online',who:'A curious human.',contact:'Contact not configured.'},
 ro:{title:'Terminal MIRCO',close:'Închide',input:'Comandă',run:'Execută',intro:'Scrie help pentru a explora.',about:'O mică experiență digitală de la MIRCO.',unknown:'Comandă necunoscută. Încearcă help.',robot:'Salut, omule!',secret:'Ai descoperit un mic secret!',offline:'Offline',online:'Online',who:'Un om curios.',contact:'Contactul nu este configurat.'},
 ru:{title:'Терминал MIRCO',close:'Закрыть',input:'Команда',run:'Выполнить',intro:'Введите help для списка команд.',about:'Небольшой цифровой эксперимент MIRCO.',unknown:'Неизвестная команда. Попробуйте help.',robot:'Привет, человек!',secret:'Вы нашли маленький секрет!',offline:'Нет сети',online:'В сети',who:'Любопытный человек.',contact:'Контакт не настроен.'}
}[lang]||{};
const terminalCopy={
 en:{session:'Simulated terminal',system:'OS',shell:'Shell',theme:'Theme',status:'Status',mascot:'Mascot',enabled:'Enabled',disabled:'Disabled',version:'Build',unavailable:'Unavailable',matrixDisabled:'ASCII background is disabled.'},
 ro:{session:'Terminal simulat',system:'Sistem',shell:'Shell',theme:'Temă',status:'Stare',mascot:'Mascotă',enabled:'Activată',disabled:'Dezactivată',version:'Build',unavailable:'Indisponibil',matrixDisabled:'Fundalul ASCII este dezactivat.'},
 ru:{session:'Симуляция терминала',system:'ОС',shell:'Оболочка',theme:'Тема',status:'Статус',mascot:'Маскот',enabled:'Включён',disabled:'Выключен',version:'Сборка',unavailable:'Недоступно',matrixDisabled:'ASCII-фон отключён.'}
}[lang];
const element=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el;};
const dialog=element('dialog','mirco-terminal');
dialog.setAttribute('aria-label',copy.title);dialog.setAttribute('aria-modal','true');
const header=element('div','terminal-header');
const windowLabels={
 en:{minimize:'Minimize',maximize:'Maximize',restore:'Restore window'},
 ro:{minimize:'Minimizează',maximize:'Maximizează',restore:'Restabilește fereastra'},
 ru:{minimize:'Свернуть',maximize:'Развернуть',restore:'Восстановить окно'}
}[lang]||{minimize:'Minimize',maximize:'Maximize',restore:'Restore window'};
const controls=element('div','terminal-window-controls');
function windowButton(name,label,glyph){
 const button=element('button','terminal-window-button terminal-'+name);
 button.type='button';button.setAttribute('aria-label',label);button.title=label;
 const dot=element('span','terminal-window-dot',glyph);dot.setAttribute('aria-hidden','true');button.append(dot);
 return button;
}
const close=windowButton('close',copy.close,'×');
const minimize=windowButton('minimize',windowLabels.minimize,'−');
const maximize=windowButton('maximize',windowLabels.maximize,'↗');
maximize.setAttribute('aria-pressed','false');
controls.append(close,minimize,maximize);
header.append(controls,element('strong','terminal-title',copy.title));
const output=element('div','terminal-output');
output.setAttribute('role','log');output.setAttribute('aria-live','polite');output.tabIndex=0;
const form=element('form','terminal-form'),input=element('input'),run=element('button','terminal-run',copy.run);
input.setAttribute('aria-label',copy.input);input.placeholder='help';input.autocomplete='off';input.spellcheck=false;input.maxLength=120;run.type='submit';
const prompt=element('span','terminal-prompt','visitor@mirco:~$');
prompt.setAttribute('aria-hidden','true');
const inputWrap=element('div','terminal-input-wrap'),caret=element('span','terminal-caret');
caret.setAttribute('aria-hidden','true');inputWrap.append(input,caret);
form.append(prompt,inputWrap,run);
const content=element('div','terminal-content');
content.append(output,form);dialog.append(header,content);
const shell=document.querySelector('.shell'),root=document.documentElement;
const backdrop=element('div','terminal-backdrop');backdrop.hidden=true;backdrop.setAttribute('aria-hidden','true');
document.querySelector('.crt-screen').append(backdrop,dialog);
let previousFocus=null,booted=false,previousInert=false;
const history=createHistory();
function append(node){output.append(node);while(output.children.length>50)output.firstElementChild.remove();output.scrollTop=output.scrollHeight;}
function line(value,className=''){append(element('div',className,value));}
function build(){return new URL(import.meta.url).searchParams.get('v')||terminalCopy.unavailable;}
function fetchInfo(){
 const banner=element('div','terminal-fetch');
 // Render the original ASCII matrix as fixed vector cells, independent of fallback fonts.
 const art=element('div','terminal-logo');art.setAttribute('aria-label','MIRCO');art.setAttribute('role','img');
 const source=element('pre','terminal-logo-source',logo);source.setAttribute('aria-hidden','true');
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 33 11.2');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
 const path=document.createElementNS('http://www.w3.org/2000/svg','path');
 let cells='';
 logo.split('\n').forEach((row,y)=>{[...row].forEach((char,x)=>{if(char==='█')cells+='M'+x+' '+(y*1.6)+'h1v1.6h-1z';});});
 path.setAttribute('d',cells);path.setAttribute('fill','currentColor');svg.append(path);art.append(source,svg);
 const info=element('div','terminal-info');
 info.append(element('strong','terminal-host','visitor@mirco'),element('div','terminal-session',terminalCopy.session));
 const fields=[[terminalCopy.system,'MIRCO OS'],[terminalCopy.shell,'mirco-shell'],[terminalCopy.theme,'Midnight Blue'],[terminalCopy.status,document.querySelector('.status')?.textContent.trim()||terminalCopy.unavailable],[terminalCopy.mascot,document.querySelector('.mascot')?terminalCopy.enabled:terminalCopy.disabled]];
 for(const [label,value] of fields){const row=element('div','terminal-info-row');row.append(element('span','terminal-info-label',label+': '),element('span','',value));info.append(row);}
 const palette=element('div','terminal-palette');palette.setAttribute('aria-hidden','true');for(let i=0;i<7;i++)palette.append(element('span'));
 info.append(palette);const divider=element('div','terminal-fetch-divider');divider.setAttribute('aria-hidden','true');banner.append(art,divider,info);append(banner);
}
function boot(){output.replaceChildren();fetchInfo();line(copy.intro,'terminal-hint');output.scrollTop=0;booted=true;}
// A top-layer showModal() escapes the root filter, so keep the dialog in
// normal paint order and explicitly preserve its modal accessibility behavior.
function open(){
 if(dialog.open)return;
 previousFocus=document.activeElement;previousInert=shell.inert;shell.inert=true;
 backdrop.hidden=false;root.classList.add('mirco-terminal-open');
 dialog.show();if(!booted)boot();input.focus();window.dispatchEvent(new Event('mirco:crt-layout'));
}
function restore(){
 if(dialog.open||backdrop.hidden)return;
 backdrop.hidden=true;shell.inert=previousInert;root.classList.remove('mirco-terminal-open');
 if(previousFocus instanceof HTMLElement&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});
 previousFocus=null;window.dispatchEvent(new Event('mirco:crt-layout'));
}
function closeTerminal(){if(!dialog.open)return;dialog.close();restore();}
close.addEventListener('click',closeTerminal);
minimize.addEventListener('click',closeTerminal);
maximize.addEventListener('click',()=>{
 const expanded=dialog.classList.toggle('is-expanded');
 maximize.setAttribute('aria-pressed',String(expanded));
 const label=expanded?windowLabels.restore:windowLabels.maximize;
 maximize.setAttribute('aria-label',label);maximize.title=label;
 maximize.firstElementChild.textContent=expanded?'↙':'↗';
 window.dispatchEvent(new Event('mirco:crt-layout'));
});
dialog.addEventListener('close',restore);
document.addEventListener('focusin',e=>{if(dialog.open&&!dialog.contains(e.target))input.focus();});
dialog.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&!e.isComposing){e.preventDefault();closeTerminal();return;}
 if(e.key!=='Tab'||e.defaultPrevented)return;
 const focusable=[...dialog.querySelectorAll('button:not([disabled]),input:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length>0);
 if(!focusable.length)return;
 const first=focusable[0],last=focusable.at(-1);
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
});
const celebrate=()=>window.dispatchEvent(new Event('mirco:celebrate'));
function secret(){open();line(copy.secret);celebrate();}
input.addEventListener('keydown',e=>{
 if(e.isComposing)return;
 if(e.key==='ArrowUp'||e.key==='ArrowDown'){
  e.preventDefault();input.value=history.move(e.key==='ArrowUp'?-1:1,input.value);input.setSelectionRange(input.value.length,input.value.length);
 }else if(e.key==='Tab'&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
  const result=complete(input.value);
  if(result.matches.length&&result.value!==input.value){e.preventDefault();input.value=result.value;input.setSelectionRange(input.value.length,input.value.length);}
  else if(result.matches.length>1&&result.value===input.value){e.preventDefault();line(result.matches.join('  '));}
 }
});
dialog.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&e.key.toLowerCase()==='l'){e.preventDefault();output.replaceChildren();input.focus();}
});
function toggleMode(name){
 const enabled=document.documentElement.classList.toggle(name);
 window.dispatchEvent(new Event('mirco:visual-mode'));
 return enabled;
}
form.addEventListener('submit',e=>{
 e.preventDefault();const raw=input.value.trim();input.value='';if(!raw)return;
 const command=raw.toLowerCase();history.add(raw);
 if(command==='clear'){output.replaceChildren();return;}
 if(command==='reboot'){history.reset();boot();return;}
 line('visitor@mirco:~$ '+raw,'terminal-command');
 switch(command){
 case 'help':line(commands.join(' · '));break;
 case 'neofetch':case 'fastfetch':fetchInfo();break;
 case 'date':line(new Date().toLocaleString(lang));break;
 case 'uptime':line(formatUptime(performance.now()));break;
 case 'version':line(terminalCopy.version+': '+build());break;
 case 'matrix':if(document.querySelector('#ascii-background'))line('Matrix: '+(toggleMode('mirco-matrix')?'ON':'OFF'));else line(terminalCopy.matrixDisabled);break;
 case 'about':line(copy.about);break;
 case 'status':line((document.querySelector('.status')?.textContent.trim()||'')+' · '+(navigator.onLine?copy.online:copy.offline));break;
 case 'robot':line(copy.robot);celebrate();break;
 case 'contact':line(document.querySelector('.contact')?.getAttribute('href')?.replace(/^mailto:/,'')||copy.contact);break;
 case 'whoami':line(copy.who);break;
 case 'retro':line('CRT: '+(toggleMode('mirco-retro')?'ON':'OFF'));break;
 case 'exit':closeTerminal();break;
 default:line(copy.unknown);
 }
});
window.addEventListener('mirco:terminal',open);
let keys=[],lastKey=0;
const konami=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
window.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='k'){e.preventDefault();dialog.open?closeTerminal():open();return;}
 if(dialog.open||e.ctrlKey||e.metaKey||e.altKey||e.repeat||e.target.closest?.('input,textarea,select,[contenteditable]'))return;
 const now=performance.now();if(now-lastKey>1500)keys=[];lastKey=now;
 keys.push(e.key.length===1?e.key.toLowerCase():e.key);keys=keys.slice(-10);
 if(keys.join(',')===konami.join(',')){keys=[];toggleMode('mirco-retro');secret();}
 else if(keys.slice(-5).join('')==='mirco'){keys=[];secret();}
});
let logoCount=0,logoAt=0;
document.querySelector('.brand')?.addEventListener('click',()=>{const now=performance.now();logoCount=now-logoAt<1500?logoCount+1:1;logoAt=now;if(logoCount===5){logoCount=0;secret();}});
let robotCount=0,robotAt=0;
const mascot=document.querySelector('.mascot');
mascot?.addEventListener('click',()=>{const now=performance.now();robotCount=now-robotAt<900?robotCount+1:1;robotAt=now;if(robotCount===10){robotCount=0;celebrate();}});
if(mascot){
 const icons=[...document.querySelectorAll('link[rel="icon"]')].map(el=>({el,href:el.getAttribute('href'),sizes:el.getAttribute('sizes'),type:el.getAttribute('type')}));
 const groups={happy:'happy',excited:'happy',laughing:'happy',love:'love',angry:'angry',sleepy:'sleep',drowsy:'sleep',yawning:'sleep'};
 let timer=0,active='';
 function sync(){
  clearTimeout(timer);
  const next=motion.matches?'':groups[mascot.dataset.emotion]||'';
  if(next===active)return;
  const apply=()=>{
   active=next;
   for(const item of icons){
    for(const [key,value] of Object.entries({href:next?'/icons/mood-'+next+'.svg':item.href,sizes:next?'any':item.sizes,type:next?'image/svg+xml':item.type})){
     if(value===null)item.el.removeAttribute(key);else item.el.setAttribute(key,value);
    }
   }
  };
  if(motion.matches)apply();else timer=setTimeout(apply,500);
 }
 new MutationObserver(sync).observe(mascot,{attributes:true,attributeFilter:['data-emotion']});
 motion.addEventListener('change',sync);sync();
}
