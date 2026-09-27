/* ethel.cz /nahled-4: menu, hero demo, use cases, pricing, cookie consent + GA4.
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

/* "V praxi": pick a question on the left, the Ethel window answers it; table / chart toggle inside the window.
   Illustrative data only. */
const caseDemo=document.getElementById('case-demo');
if(caseDemo){
 const CASES=[
  {ctx:'Faktury vydané / přehled',q:'Top 5 zákazníků v maloobchodu za letos',a:'Pět největších odběratelů v maloobchodu odebralo za <strong>13,2 mil. Kč</strong>.',cols:['Odběratel','Obrat bez DPH'],unit:'Kč',rows:[['Alfa trade',4120000],['Delta servis',3080000],['Beta market',2460000],['Gama obchod',1940000],['Omega retail',1610000]]},
  {ctx:'Faktury vydané / přehled',q:'Kolik máme faktur po splatnosti?',a:'Po splatnosti je <strong>12 faktur za 328 500 Kč</strong>. Největší část připadá na Alfa trade.',cols:['Odběratel','Po splatnosti'],unit:'Kč',rows:[['Alfa trade',184200],['Delta servis',96500],['Ostatní',47800]]},
  {ctx:'Dobropisy vydané / přehled',q:'Kolik dobropisů jsme vystavili v srpnu?',a:'V srpnu jsme vystavili <strong>14 dobropisů za 86 200 Kč</strong>, víc než polovinu v obchodě.',cols:['Středisko','Dobropisy'],unit:'Kč',rows:[['Obchod',52400],['E-shop',21300],['Servis',12500]]},
  {ctx:'Skladové karty / přehled',q:'Jaká je volná zásoba položky 51003?',a:'Volná zásoba položky 51003 je <strong>335 ks</strong> na třech skladech.',cols:['Sklad','Volná zásoba'],unit:'ks',rows:[['Hlavní sklad',240],['Brno',60],['Expedice',35]]},
  {ctx:'Expediční příkazy / přehled',q:'Kolik expedičních příkazů je ve stavu sklad?',a:'Ve stavu sklad čeká <strong>23 expedičních příkazů</strong>, nejvíc v hlavním skladu.',cols:['Sklad','Příkazy'],unit:'',rows:[['Hlavní sklad',15],['Brno',5],['Expedice',3]]},
  {ctx:'Výrobní příkazy / přehled',q:'Jaký normovaný čas odvedli zaměstnanci ve výrobě minulý týden?',a:'Minulý týden odvedli <strong>612 normohodin</strong>, nejvíc ve středu.',cols:['Den','Normohodiny'],unit:'h',rows:[['Pondělí',118],['Úterý',124],['Středa',136],['Čtvrtek',122],['Pátek',112]]}
 ];
 const SEARCH_MS=800;
 const fmt=(n,unit)=>n.toLocaleString('cs-CZ')+(unit?' '+unit:'');
 const esc=t=>t.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 let view='table',timer=null,current=0;
 const buttons=[...document.querySelectorAll('.usecase[data-case]')];
 const context=document.getElementById('case-context');
 const table=c=>`<table><thead><tr><th>${c.cols[0]}</th><th class="num">${c.cols[1]}</th></tr></thead><tbody>${c.rows.map(([n,v])=>`<tr><td>${esc(n)}</td><td class="num">${fmt(v,c.unit)}</td></tr>`).join('')}</tbody></table>`;
 const chart=c=>{const max=Math.max(...c.rows.map(r=>r[1]));return `<div class="hbar-chart" role="img" aria-label="${esc(c.cols[1])}: ${c.rows.map(([n,v])=>esc(n)+' '+fmt(v,c.unit)).join(', ')}">${c.rows.map(([n,v])=>`<div class="hbar"><span class="hbar-label">${esc(n)}</span><span class="hbar-track"><i style="width:${Math.max(4,v/max*100)}%"></i></span><span class="hbar-value">${fmt(v,c.unit)}</span></div>`).join('')}</div>`};
 const answer=c=>`<div class="demo-answer is-new"><p>${c.a}</p><div class="view-toggle" role="group" aria-label="Zobrazení výsledku"><button type="button" data-view="table" aria-pressed="${view==='table'}">Tabulka</button><button type="button" data-view="chart" aria-pressed="${view==='chart'}">Graf</button></div><div class="case-view">${view==='table'?table(c):chart(c)}</div></div>`;
 const show=(i,animate)=>{
  current=i;const c=CASES[i];
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.case===String(i))));
  context.textContent=c.ctx;
  clearTimeout(timer);
  const question=`<p class="user-message is-new">${esc(c.q)}</p>`;
  if(!animate){caseDemo.innerHTML=question+answer(c);return}
  caseDemo.innerHTML=question+'<p class="status-line is-new">Ethel hledá data<span class="dots" aria-hidden="true"></span></p>';
  timer=setTimeout(()=>{caseDemo.innerHTML=question.replace(' is-new','')+answer(c)},SEARCH_MS);
 };
 buttons.forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.case),true)));
 caseDemo.addEventListener('click',e=>{
  const btn=e.target.closest('[data-view]');if(!btn)return;
  view=btn.dataset.view;
  caseDemo.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===btn)));
  caseDemo.querySelector('.case-view').innerHTML=view==='table'?table(CASES[current]):chart(CASES[current]);
 });
 show(0,false);
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
