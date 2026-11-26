import {deflateSync} from 'node:zlib';
// Self-hosted opaque RGB map for inverse barrel sampling. A normalized cubic
// radial field keeps the optical center neutral and progressively bends edges.
// The browser applies aspect gains and an independently bounded pixel scale.
export function displacementChannels(x,y){
 const nx=2*x-1,ny=2*y-1,r2=(nx*nx+ny*ny)/2;
 const channel=value=>Math.max(0,Math.min(255,Math.round(255*(.5+.45*value))));
 return [channel(nx*r2),channel(ny*r2),128];
}
function crc32(bytes){
 let crc=0xffffffff;
 for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
 return (crc^0xffffffff)>>>0;
}
function chunk(type,data){
 const name=Buffer.from(type),header=Buffer.alloc(4),tail=Buffer.alloc(4);
 header.writeUInt32BE(data.length);tail.writeUInt32BE(crc32(Buffer.concat([name,data])));
 return Buffer.concat([header,name,data,tail]);
}
export function makeCrtMap(size=129){
 const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=2;
 const pixels=Buffer.alloc(size*(1+size*3));
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const channels=displacementChannels(x/(size-1),y/(size-1));
  const offset=y*(1+size*3)+1+x*3;
  pixels.set(channels,offset);
 }
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]);
}
