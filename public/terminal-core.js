export const commands=['help','about','status','robot','contact','whoami','neofetch','fastfetch','date','uptime','version','reboot','clear','retro','matrix','exit'];
// Seven equally sized rows; fixed five-column letters with two-column spacing.
export const logo=[
 "█   █  █████  ████    ████   ███ ",
 "██ ██    █    █   █  █      █   █",
 "█ █ █    █    █   █  █      █   █",
 "█   █    █    ████   █      █   █",
 "█   █    █    █ █    █      █   █",
 "█   █    █    █  █   █      █   █",
 "█   █  █████  █   █   ████   ███ "
].join('\n');
export function createHistory(limit=50){
 let entries=[],index=0,draft='';
 return {
  add(value){if(value!==entries.at(-1))entries.push(value);entries=entries.slice(-limit);index=entries.length;draft='';},
  move(direction,current){if(index===entries.length)draft=current;index=Math.max(0,Math.min(entries.length,index+direction));return index===entries.length?draft:entries[index];},
  reset(){entries=[];index=0;draft='';}
 };
}
export function complete(value){
 const prefix=value.trim().toLowerCase();
 if(!prefix||/\s/.test(prefix))return {value,matches:[]};
 const matches=commands.filter(name=>name.startsWith(prefix));
 if(!matches.length)return {value,matches};
 const common=[...matches[0]].reduce((out,char,i)=>out.length===i&&matches.every(name=>name[i]===char)?out+char:out,'');
 return {value:common,matches};
}
export function formatUptime(ms){
 const total=Math.max(0,Math.floor(ms/1000));
 return [Math.floor(total/3600),Math.floor(total/60)%60,total%60].map(n=>String(n).padStart(2,'0')).join(':');
}
// Radial barrel curvature for decorative coordinates only; DOM hit targets are unchanged.
export function crtPoint(x,y,width,height,strength=.055){
 const nx=2*x/Math.max(1,width)-1,ny=2*y/Math.max(1,height)-1;
 const scale=1-strength*(nx*nx+ny*ny);
 return [(nx*scale+1)*width/2,(ny*scale+1)*height/2];
}
