import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {render, config} from './src/page.js';
const settings=config(process.env);
const assets=new Map([['/style.css','text/css'],['/mascot.js','text/javascript'],['/ascii-background.js','text/javascript'],['/favicon.svg','image/svg+xml'],['/images/brand/mark.svg','image/svg+xml'],['/favicon.ico','image/x-icon'],['/apple-touch-icon.png','image/png'],['/icons/favicon-16.png','image/png'],['/icons/favicon-32.png','image/png'],['/icons/favicon-48.png','image/png'],['/images/social/mirco.png','image/png']]);
const server=http.createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"};
 const send=(status,type,body,extra={})=>{res.writeHead(status,{...headers,'Content-Type':type,...extra});res.end(req.method==='HEAD'?undefined:body);};
 if(!['GET','HEAD'].includes(req.method))return send(405,'text/plain','Method not allowed',{Allow:'GET, HEAD'});
 if(path==='/health')return send(200,'application/json','{"status":"ok"}');
 if(assets.has(path)){try{return send(200,assets.get(path),await readFile(fileURLToPath(new URL('./public'+path,import.meta.url))),{'Cache-Control':path==='/style.css'||path.endsWith('.js')?'no-cache':'public, max-age=3600'});}catch{return send(500,'text/plain','Asset unavailable');}}
 if(path==='/robots.txt')return send(200,'text/plain','User-agent: *\nDisallow: /\n');
 if(path!=='/')return send(404,'text/plain','Not found');
 return send(settings.mode==='maintenance'?503:200,'text/html; charset=utf-8',render(settings),{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow',...(settings.mode==='maintenance'?{'Retry-After':'3600'}:{})});
});
server.listen(Number(process.env.PORT||3000),'0.0.0.0');
