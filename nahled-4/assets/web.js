/* ethel.cz /nahled-4: menu, pricing toggle, cookie consent + GA4.
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
