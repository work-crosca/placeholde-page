// Eye geometry: horizontal half-span, vertical half-span, curve, stroke, offset.
const E=(w=0,h=11,c=0,s=26,o=0)=>[w,h,c,s,o];
const N=E();
const poses={
 neutral:[N,N,12,0],happy:[E(15,0,-25,9),E(15,0,-25,9),14,0],
 sad:[E(12,-6,7,9,2),E(12,6,7,9,2),-13,0],
 surprised:[E(0,13,0,29),E(0,13,0,29),0,1],
 sleepy:[E(14,0,8,4,3),E(14,0,8,4,3),0,.12],
 love:[E(0,10,0,24),E(0,10,0,24),16,0],
 suspicious:[E(13,3,0,7),E(12,-2,0,6,3),-3,0],
 bored:[E(14,0,0,7,3),E(14,0,0,7,3),0,0],
 confused:[E(12,3,-10,9),E(10,-4,5,8,5),-6,0],
 excited:[E(16,0,-28,10),E(16,0,-28,10),14,.85],
 shy:[E(11,0,-14,8,6),E(11,0,-14,8,6),10,0],
 angry:[E(15,8,0,11),E(15,-8,0,11),-14,0],
 curious:[E(0,13,0,26),E(0,6,0,17,3),7,0],
 wink:[E(0,11,0,24),E(13,0,-7,6),12,0],
 blink:[E(13,0,0,3),E(13,0,0,3),8,0],
 laughing:[E(16,0,-30,9),E(16,0,-30,9),16,1],
 scared:[E(0,12,0,24),E(0,12,0,24),-4,.9],
 crying:[E(13,-8,-3,8),E(13,8,-3,8),-16,0],
 dizzy:[E(0,10,0,22),E(0,10,0,22),0,0],
 proud:[E(14,0,10,7),E(14,0,10,7),13,0],
 drowsy:[E(10,1,4,11,3),E(10,1,4,11,3),-1,0],
 'slow-blink':[E(13,0,5,3,4),E(13,0,5,3,4),-1,0],
 yawning:[E(14,0,8,5,3),E(14,0,8,5,3),0,1]
};
export const names=Object.keys(poses).filter(n=>!['neutral','blink','sleepy','wink','drowsy','slow-blink','yawning'].includes(n));
export const idleNames=names.filter(n=>!['angry','crying','scared'].includes(n));
// Additional interpolated channels: blush, glow strength and screen-face brightness.
const accents={love:[.48,.38,1],shy:[.65,.25,1],excited:[.12,.58,1],happy:[.12,.35,1],sleepy:[0,.08,.55],surprised:[0,.42,1],angry:[0,.40,1],laughing:[.28,.48,1],scared:[0,.34,1],crying:[0,.2,.9],dizzy:[0,.24,1],proud:[.16,.32,1],drowsy:[0,.15,.82],'slow-blink':[0,.12,.78],yawning:[0,.12,.76]};
export const colors={angry:'#ff777e',love:'#f9a1cb',sad:'#81aef3',sleepy:'#759fc4',scared:'#d0eaff',crying:'#81b8ff',dizzy:'#c3b7ff'};
// Extra channels: tears, spiral eyes, hollow eyes, mouth width, wavy mouth, proud tilt, laugh bounce.
export const baseColor='#b9e7ff';
export const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
export const hexColor=channels=>'#'+channels.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
export const DROWSY_IDLE=20000,YAWN_IDLE=30000,ASLEEP_IDLE=32000,WAKE_OPEN=450,WAKE_SMILE=1000;
export const vector=n=>[...poses[n][0],...poses[n][1],...poses[n].slice(2),n==='love'?1:0,...(accents[n]||[0,.22,1]),n==='crying'?1:0,n==='dizzy'?1:0,n==='scared'?1:0,n==='laughing'?10:n==='proud'?3:0,n==='dizzy'?1:0,n==='proud'?-5:0,n==='laughing'?1:0,n==='sleepy'?1:0];
