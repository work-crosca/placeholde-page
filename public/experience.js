import {motion} from './motion-preference.js';
const lang=document.documentElement.lang;
const copy={
 en:{title:'MIRCO terminal',close:'Close',input:'Command',run:'Run',intro:'Type help to explore.',about:'A small digital experience from MIRCO.',unknown:'Unknown command. Try help.',robot:'Hello, human!',secret:'You found a little secret!',offline:'Offline',online:'Online',who:'A curious human.',contact:'Contact not configured.'},
 ro:{title:'Terminal MIRCO',close:'Închide',input:'Comandă',run:'Execută',intro:'Scrie help pentru a explora.',about:'O mică experiență digitală de la MIRCO.',unknown:'Comandă necunoscută. Încearcă help.',robot:'Salut, omule!',secret:'Ai descoperit un mic secret!',offline:'Offline',online:'Online',who:'Un om curios.',contact:'Contactul nu este configurat.'},
 ru:{title:'Терминал MIRCO',close:'Закрыть',input:'Команда',run:'Выполнить',intro:'Введите help для списка команд.',about:'Небольшой цифровой эксперимент MIRCO.',unknown:'Неизвестная команда. Попробуйте help.',robot:'Привет, человек!',secret:'Вы нашли маленький секрет!',offline:'Нет сети',online:'В сети',who:'Любопытный человек.',contact:'Контакт не настроен.'}
}[lang]||{};
const element=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el;};
const dialog=element('dialog','mirco-terminal');
dialog.setAttribute('aria-label',copy.title);
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
form.append(element('span','','
let previousFocus=null;
function line(value){output.append(element('div','',value));while(output.children.length>50)output.firstElementChild.remove();output.scrollTop=output.scrollHeight;}
function open(){if(dialog.open)return;previousFocus=document.activeElement;dialog.showModal();input.focus();}
close.addEventListener('click',()=>dialog.close());
minimize.addEventListener('click',()=>dialog.close());
maximize.addEventListener('click',()=>{
 const expanded=dialog.classList.toggle('is-expanded');
 maximize.setAttribute('aria-pressed',String(expanded));
 const label=expanded?windowLabels.restore:windowLabels.maximize;
 maximize.setAttribute('aria-label',label);maximize.title=label;
 maximize.firstElementChild.textContent=expanded?'↙':'↗';
});
dialog.addEventListener('close',()=>{if(previousFocus instanceof HTMLElement&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});});
const celebrate=()=>window.dispatchEvent(new Event('mirco:celebrate'));
function secret(){open();line(copy.secret);celebrate();}
line(copy.intro);
form.addEventListener('submit',e=>{
 e.preventDefault();const raw=input.value.trim();input.value='';if(!raw)return;
 const command=raw.toLowerCase();
 if(command==='clear'){output.replaceChildren();return;}
 line('$ '+raw);
 switch(command){
 case 'help':line('help · about · status · robot · contact · whoami · clear · retro · exit');break;
 case 'about':line(copy.about);break;
 case 'status':line((document.querySelector('.status')?.textContent.trim()||'')+' · '+(navigator.onLine?copy.online:copy.offline));break;
 case 'robot':line(copy.robot);celebrate();break;
 case 'contact':line(document.querySelector('.contact')?.getAttribute('href')?.replace(/^mailto:/,'')||copy.contact);break;
 case 'whoami':line(copy.who);break;
 case 'retro':document.documentElement.classList.toggle('mirco-retro');line('CRT: '+(document.documentElement.classList.contains('mirco-retro')?'ON':'OFF'));break;
 case 'exit':dialog.close();break;
 default:line(copy.unknown);
 }
});
window.addEventListener('mirco:terminal',open);
let keys=[],lastKey=0;
const konami=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
window.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='k'){e.preventDefault();dialog.open?dialog.close():open();return;}
 if(dialog.open||e.ctrlKey||e.metaKey||e.altKey||e.repeat||e.target.closest?.('input,textarea,select,[contenteditable]'))return;
 const now=performance.now();if(now-lastKey>1500)keys=[];lastKey=now;
 keys.push(e.key.length===1?e.key.toLowerCase():e.key);keys=keys.slice(-10);
 if(keys.join(',')===konami.join(',')){keys=[];document.documentElement.classList.toggle('mirco-retro');secret();}
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
),input,run);
const content=element('div','terminal-content');content.append(output,form);dialog.append(header,content);document.body.append(dialog);
let previousFocus=null;
function line(value){output.append(element('div','',value));while(output.children.length>50)output.firstElementChild.remove();output.scrollTop=output.scrollHeight;}
function open(){if(dialog.open)return;previousFocus=document.activeElement;dialog.showModal();input.focus();}
close.addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{if(previousFocus instanceof HTMLElement&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});});
const celebrate=()=>window.dispatchEvent(new Event('mirco:celebrate'));
function secret(){open();line(copy.secret);celebrate();}
line(copy.intro);
form.addEventListener('submit',e=>{
 e.preventDefault();const raw=input.value.trim();input.value='';if(!raw)return;
 const command=raw.toLowerCase();
 if(command==='clear'){output.replaceChildren();return;}
 line('$ '+raw);
 switch(command){
 case 'help':line('help · about · status · robot · contact · whoami · clear · retro · exit');break;
 case 'about':line(copy.about);break;
 case 'status':line((document.querySelector('.status')?.textContent.trim()||'')+' · '+(navigator.onLine?copy.online:copy.offline));break;
 case 'robot':line(copy.robot);celebrate();break;
 case 'contact':line(document.querySelector('.contact')?.getAttribute('href')?.replace(/^mailto:/,'')||copy.contact);break;
 case 'whoami':line(copy.who);break;
 case 'retro':document.documentElement.classList.toggle('mirco-retro');line('CRT: '+(document.documentElement.classList.contains('mirco-retro')?'ON':'OFF'));break;
 case 'exit':dialog.close();break;
 default:line(copy.unknown);
 }
});
window.addEventListener('mirco:terminal',open);
let keys=[],lastKey=0;
const konami=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
window.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='k'){e.preventDefault();dialog.open?dialog.close():open();return;}
 if(dialog.open||e.ctrlKey||e.metaKey||e.altKey||e.repeat||e.target.closest?.('input,textarea,select,[contenteditable]'))return;
 const now=performance.now();if(now-lastKey>1500)keys=[];lastKey=now;
 keys.push(e.key.length===1?e.key.toLowerCase():e.key);keys=keys.slice(-10);
 if(keys.join(',')===konami.join(',')){keys=[];document.documentElement.classList.toggle('mirco-retro');secret();}
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
