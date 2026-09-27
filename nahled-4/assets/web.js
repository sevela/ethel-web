/* ethel.cz /nahled-4: menu, hero demo, pricing, cookie consent + GA4.
   Shared by all pages; every block checks that its elements exist. */
(()=>{
/* Mobile menu */
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
if(menu&&nav){
 const close=()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open')};
 menu.addEventListener('click',()=>{const expanded=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',expanded);nav.classList.toggle('is-open',expanded)});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){close();menu.focus()}});
}

/* Hero demo: question, "Ethel hledá data", answer, follow-up, chart. Plays in a loop,
   shows the final state at once with reduced motion. */
const chat=document.getElementById('demo-chat');
if(chat){
 const steps=[...chat.querySelectorAll('.seq')];
 const STEP_MS=[700,900,1500,2600,900,1500],HOLD_MS=7000;
 chat.classList.add('is-playing');
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){
  steps.filter(s=>!s.classList.contains('seq-transient')).forEach(s=>s.classList.add('is-shown'));
 }else{
  const play=()=>{
   steps.forEach(s=>s.classList.remove('is-shown'));
   let t=0;
   steps.forEach((step,i)=>{
    t+=STEP_MS[i]||1000;
    setTimeout(()=>{
     const prev=steps[i-1];
     if(prev&&prev.classList.contains('seq-transient'))prev.classList.remove('is-shown');
     step.classList.add('is-shown');
    },t);
   });
   setTimeout(play,t+HOLD_MS);
  };
  play();
 }
}

/* Pricing: monthly / annual (−17 %) and the optional Akce module on Standard.
   Annual = the yearly price divided by 12. */
const pricing=document.getElementById('cena');
if(pricing){
 const PRICES={standard:{monthly:1490,annual:14900},enterprise:{monthly:4990,annual:49900},akce:{monthly:990,annual:9900},user:{monthly:249,annual:2508}};
 const fmt=n=>Math.round(n).toLocaleString('cs-CZ');
 const addon=document.getElementById('addon-akce');
 let period='monthly';
 const perMonth=p=>period==='monthly'?p.monthly:p.annual/12;
 const render=()=>{
  const withAkce=addon&&addon.checked;
  const plans={standard:[PRICES.standard].concat(withAkce?[PRICES.akce]:[]),enterprise:[PRICES.enterprise]};
  Object.entries(plans).forEach(([name,parts])=>{
   const month=parts.reduce((sum,p)=>sum+perMonth(p),0),year=parts.reduce((sum,p)=>sum+p.annual,0);
   pricing.querySelectorAll(`[data-price="${name}"]`).forEach(el=>{el.textContent=fmt(month)});
   pricing.querySelectorAll(`[data-note="${name}"]`).forEach(el=>{
    el.textContent=period==='monthly'?(withAkce&&name==='standard'?'měsíční platba, včetně modulu Akce':'měsíční platba'):`${fmt(year)} Kč jednou ročně`;
   });
  });
  pricing.querySelectorAll('[data-addon]').forEach(el=>{el.textContent=fmt(perMonth(PRICES.akce))});
  pricing.querySelectorAll('[data-user]').forEach(el=>{el.textContent=fmt(perMonth(PRICES.user))});
 };
 const periodButtons=[...pricing.querySelectorAll('.price-toggle [data-period]')];
 periodButtons.forEach(b=>b.addEventListener('click',()=>{
  period=b.dataset.period;
  periodButtons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  render();
 }));
 if(addon)addon.addEventListener('change',render);
 render();
}

/* Cookie consent + GA4: analytics only after explicit consent. */
const GA_MEASUREMENT_ID='G-5YGP0D48W7',CONSENT_KEY='ethel_cookie_consent_v1';
const banner=document.getElementById('cookie-banner');
const getConsent=()=>{try{return localStorage.getItem(CONSENT_KEY)}catch(e){return null}};
const setConsent=v=>{try{localStorage.setItem(CONSENT_KEY,v)}catch(e){/* private mode */}};
const loadGA=()=>{
 if(window._ethelGaLoaded)return;
 window._ethelGaLoaded=true;
 const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(GA_MEASUREMENT_ID);document.head.appendChild(s);
 window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config',GA_MEASUREMENT_ID,{anonymize_ip:true});
};
const consent=getConsent();
if(consent==='accepted')loadGA();
else if(consent!=='rejected'&&banner)setTimeout(()=>{banner.hidden=false},1200);
const answer=v=>{setConsent(v);if(banner)banner.hidden=true;if(v==='accepted')loadGA()};
document.getElementById('cookie-accept')?.addEventListener('click',()=>answer('accepted'));
document.getElementById('cookie-reject')?.addEventListener('click',()=>answer('rejected'));

/* Conversion: pricing seen (once per page view). */
const cena=document.getElementById('cena');
if(cena&&'IntersectionObserver' in window){
 const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){if(typeof gtag==='function')gtag('event','pricing_view');io.disconnect()}},{threshold:.3});
 io.observe(cena);
}
})();
