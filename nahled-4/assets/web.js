/* ethel.cz /nahled-4: menu, hero demo, capability tabs, pricing toggle, cookie consent + GA4.
   Shared by all pages; every block checks that its elements exist. */
(()=>{
const reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Mobile menu */
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
if(menu&&nav){
 const close=()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open')};
 menu.addEventListener('click',()=>{const expanded=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',expanded);nav.classList.toggle('is-open',expanded)});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){close();menu.focus()}});
}

/* Hero demo: three steps of one illustrative conversation, played once, then clickable. */
const steps=[...document.querySelectorAll('.demo-step')],stepButtons=[...document.querySelectorAll('[data-demo-step]')];
if(steps.length){
 let timer=null;
 const show=n=>{steps.forEach(s=>s.classList.toggle('is-active',s.dataset.step===String(n)));stepButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.demoStep===String(n))))};
 stepButtons.forEach(b=>b.addEventListener('click',()=>{clearTimeout(timer);show(b.dataset.demoStep)}));
 if(!reduced){
  let n=1;
  const next=()=>{n+=1;if(n>steps.length)return;show(n);timer=setTimeout(next,5200)};
  timer=setTimeout(next,5200);
 }
}

/* Capability tabs (WAI-ARIA tabs pattern). Without JS all panels stay visible. */
const tabs=[...document.querySelectorAll('.cap-tabs [role=tab]')];
if(tabs.length){
 const select=(tab,focus)=>{
  tabs.forEach(t=>{const on=t===tab;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;document.getElementById(t.getAttribute('aria-controls')).classList.toggle('is-active',on)});
  if(focus)tab.focus();
 };
 tabs.forEach((t,i)=>{
  t.addEventListener('click',()=>select(t,false));
  t.addEventListener('keydown',e=>{
   const move={ArrowRight:1,ArrowLeft:-1}[e.key];
   if(move){e.preventDefault();select(tabs[(i+move+tabs.length)%tabs.length],true)}
   else if(e.key==='Home'){e.preventDefault();select(tabs[0],true)}
   else if(e.key==='End'){e.preventDefault();select(tabs[tabs.length-1],true)}
  });
 });
}

/* Pricing: monthly / annual (−17 %), values live in data-monthly / data-annual. */
const pricing=document.querySelector('#cena[data-period]');
if(pricing){
 const periodButtons=[...pricing.querySelectorAll('.price-toggle [data-period]')];
 periodButtons.forEach(b=>b.addEventListener('click',()=>{
  const period=b.dataset.period;
  pricing.dataset.period=period;
  periodButtons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  pricing.querySelectorAll('[data-monthly]').forEach(el=>{el.textContent=el.getAttribute('data-'+period)});
 }));
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
