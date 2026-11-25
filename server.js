import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {render, config, manifest} from './src/page.js';
const settings=config(process.env);
const assets=new Map([['/style.css','text/css'],['/analytics.js','text/javascript'],['/mascot.js','text/javascript'],['/context-menu.js','text/javascript'],['/title-glitch.js','text/javascript'],['/description-typewriter.js','text/javascript'],['/ascii-background.js','text/javascript'],['/favicon.svg','image/svg+xml'],['/images/brand/mark.svg','image/svg+xml'],['/favicon.ico','image/x-icon'],['/apple-touch-icon.png','image/png'],['/icons/favicon-16.png','image/png'],['/icons/favicon-32.png','image/png'],['/icons/favicon-48.png','image/png'],['/icons/icon-192.png','image/png'],['/icons/icon-512.png','image/png'],['/icons/icon-maskable-512.png','image/png'],['/images/social/mirco.png','image/png']]);
// Fingerprint assets at startup so a deployment never reuses stale CSS/JS URLs.
const hash=createHash('sha256');
for(const path of [...assets.keys()].filter(path=>/\.(css|js)$/.test(path)).sort()){
 hash.update(path);hash.update(await readFile(fileURLToPath(new URL('./public'+path,import.meta.url))));
}
const assetVersion=hash.digest('hex').slice(0,16);
const analyticsPolicy=settings.analyticsId
 ? "script-src 'self' https://www.googletagmanager.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; img-src 'self' https://*.google-analytics.com https://*.googletagmanager.com;"
 : "script-src 'self'; img-src 'self';";
const server=http.createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; "+analyticsPolicy+" style-src 'self'; manifest-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"};
 const send=(status,type,body,extra={})=>{res.writeHead(status,{...headers,'Content-Type':type,...extra});res.end(req.method==='HEAD'?undefined:body);};
 if(!['GET','HEAD'].includes(req.method))return send(405,'text/plain','Method not allowed',{Allow:'GET, HEAD'});
 if(path==='/manifest.webmanifest')return send(200,'application/manifest+json; charset=utf-8',JSON.stringify(manifest(settings)),{'Cache-Control':'no-cache'});
 if(path==='/health')return send(200,'application/json','{"status":"ok"}');
 if(assets.has(path)){try{return send(200,assets.get(path),await readFile(fileURLToPath(new URL('./public'+path,import.meta.url))),{'Cache-Control':path==='/style.css'||path.endsWith('.js')?'no-store':'public, max-age=3600'});}catch{return send(500,'text/plain','Asset unavailable');}}
 if(path==='/robots.txt')return send(200,'text/plain','User-agent: *\nDisallow: /\n');
 if(path!=='/')return send(404,'text/plain','Not found');
 return send(settings.mode==='maintenance'?503:200,'text/html; charset=utf-8',render(settings,assetVersion),{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow',...(settings.mode==='maintenance'?{'Retry-After':'3600'}:{})});
});
server.listen(Number(process.env.PORT||3000),'0.0.0.0');
