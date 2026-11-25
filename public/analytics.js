// Initialize the Google tag only on pages explicitly configured with a valid GA4 ID.
(() => {
 const id=document.currentScript?.dataset.measurementId;
 if(!/^G-[A-Z0-9]{4,32}$/.test(id||''))return;
 window.dataLayer=window.dataLayer||[];
 function gtag(){window.dataLayer.push(arguments);}
 window.gtag=gtag;
 gtag('js',new Date());
 gtag('config',id,{allow_google_signals:false,allow_ad_personalization_signals:false});
 const tag=document.createElement('script');
 tag.async=true;
 tag.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);
 document.head.appendChild(tag);
})();
