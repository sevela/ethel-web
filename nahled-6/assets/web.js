/* ethel.cz: menu, hero demo with five examples, pricing, cookie consent + GA4.
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

/* Hero: five examples (what Ethel does) and one Ethel window. The question is typed into the input row,
   sent, appended as a bubble, "Ethel hledá…", then the answer. The conversation starts at the top and
   grows downwards; once the window is full it scrolls and messages above the view are dropped, the
   window keeps its height. Without a click the examples rotate; the first click stops the loop.
   Illustrative data. */
const heroLog=document.getElementById('hero-log');
if(heroLog){
 const input=document.getElementById('hero-input');
 const send=document.querySelector('.hero .chat-input-send');
 const buttons=[...document.querySelectorAll('.hero button[data-cap]')];
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const esc=t=>t.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const TYPE_MS=28,SEND_MS=350,SEARCH_MS=1600,HOLD_MS=6500;
 const INVOICES={cols:['Odběratel','Po splatnosti'],rows:[['Alfa trade',184200],['Delta servis',96500],['Ostatní',47800]]};
 const CAPS=[
  {q:'Které faktury jsou víc než 30 dní po splatnosti?',status:'Sbírám data z Heliosu',data:INVOICES,
   a:'<p>Celkem <strong>12</strong> faktur za <strong>328 500 Kč</strong>. Největší část připadá na Alfa trade.</p>'},
  {q:'A jaký byl vývoj za posledních šest měsíců?',status:'Sbírám data z Heliosu',follow:0,
   a:'<p>Po splatnosti je teď nejvíc za celé pololetí, od srpna <strong>+9 %</strong>.</p><figure class="bar-chart" aria-label="Pohledávky po splatnosti po měsících, v tisících Kč: duben 212, květen 245, červen 198, červenec 263, srpen 301, září 329."><div style="--v:64%"><span>212</span><i></i><b>dub</b></div><div style="--v:74%"><span>245</span><i></i><b>kvě</b></div><div style="--v:60%"><span>198</span><i></i><b>čvn</b></div><div style="--v:80%"><span>263</span><i></i><b>čvc</b></div><div style="--v:91%"><span>301</span><i></i><b>srp</b></div><div class="is-now" style="--v:100%"><span>329</span><i></i><b>zář</b></div></figure><p class="chart-caption">tis. Kč po splatnosti</p>'},
  {q:'Jak se počítá sloupec Marže % v tomhle přehledu?',status:'Čtu definici sloupce',
   a:'<p>Marže % je uživatelský sloupec vaší firmy. Z&nbsp;položek faktury sečte prodejní a&nbsp;nákladové ceny a&nbsp;spočítá, kolik procent z&nbsp;prodeje zůstane:</p><pre class="answer-code"><code>(prodej − náklad) ÷ prodej × 100</code></pre><p>Když faktura nemá položky s&nbsp;nákladovou cenou, sloupec zůstane prázdný. Proto u&nbsp;služeb uvidíte prázdné místo, ne nulu.</p>'},
  {q:'Jak stornovat fakturu?',status:'Hledám v nápovědě',
   a:'<p>Pokud je faktura jen vystavená (ještě nebyla realizována ani zaúčtována), stačí ji v&nbsp;přehledu označit a&nbsp;použít akci Zrušit – systém se zeptá, jestli chceš záznam smazat, a&nbsp;potvrdíš Ano.</p><p>Pokud je faktura realizovaná nebo zaúčtovaná, smazat ji takhle nejde. Musíš vystavit opravný doklad:</p><ol class="help-steps"><li>Označ fakturu v&nbsp;přehledu.</li><li>Použij akci Generovat dobropis – tím vznikne storno (dobropis) k&nbsp;celé faktuře.</li><li>Pokud chceš stornovat jen část, použij na záložce Položky akci Převod položek, Vydané faktury a&nbsp;vyber, které položky se mají převést.</li></ol>'},
  {q:'Založ organizaci Ukázková s.r.o.',status:'Hledám v ARESu',
   a:'<p>Firmu jsem našla v&nbsp;ARES a&nbsp;v&nbsp;Heliosu ještě není. Zkontrolujte údaje, zapíšu je až po potvrzení.</p><div class="check-card"><dl><div><dt>Název</dt><dd>Ukázková s.r.o.</dd><dd class="origin">ARES</dd></div><div><dt>Adresa</dt><dd>Ukázková 12, 602 00 Brno</dd><dd class="origin">ARES</dd></div><div><dt>DIČ</dt><dd>CZ12345678</dd><dd class="origin">ARES</dd></div><div><dt>Splatnost</dt><dd>14 dní</dd><dd class="origin origin-default">výchozí</dd></div></dl><div class="check-card-actions"><span class="check-confirm">Potvrdit</span><span>Zrušit</span></div></div>'}
 ];
 const fmt=n=>n.toLocaleString('cs-CZ')+' Kč';
 const table=d=>`<table><thead><tr><th>${d.cols[0]}</th><th class="num">${d.cols[1]}</th></tr></thead><tbody>${d.rows.map(([n,v])=>`<tr><td>${esc(n)}</td><td class="num">${fmt(v)}</td></tr>`).join('')}</tbody></table>`;
 let timers=[],auto=true;
 const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
 /* Drop messages that are fully above the view (keeping the visible part in place), append, then
    scroll so the newest message is visible. */
 const append=html=>{
  const top=heroLog.getBoundingClientRect().top;
  let first=heroLog.firstElementChild;
  while(first&&first.nextElementSibling&&first.getBoundingClientRect().bottom<=top){
   const shift=first.nextElementSibling.getBoundingClientRect().top-first.getBoundingClientRect().top;
   first.remove();heroLog.scrollTop-=shift;first=heroLog.firstElementChild;
  }
  heroLog.insertAdjacentHTML('beforeend',html);
  const full=heroLog.scrollHeight>heroLog.clientHeight;
  heroLog.classList.toggle('is-scrolled',full);
  if(full)heroLog.scrollTop=heroLog.scrollHeight;
 };
 const answer=(i,animate)=>append(`<div class="demo-answer${animate?' is-new':''}" data-cap="${i}">${CAPS[i].a}${CAPS[i].data?table(CAPS[i].data):''}</div>`);
 const run=i=>{
  timers.forEach(clearTimeout);timers=[];
  const c=CAPS[i];
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cap===String(i))));
  heroLog.querySelector('.status-line')?.remove();
  /* A follow-up needs its first question on screen. */
  const last=heroLog.querySelector('.demo-answer:last-of-type');
  if(c.follow!==undefined&&(!last||last.dataset.cap!==String(c.follow))){append(`<p class="user-message">${esc(CAPS[c.follow].q)}</p>`);answer(c.follow,false)}
  if(reduce){append(`<p class="user-message">${esc(c.q)}</p>`);answer(i,false);return}
  let t=0;input.textContent='';input.classList.add('is-typing');
  [...c.q].forEach((_,k)=>later(()=>{input.textContent=c.q.slice(0,k+1)},t+=TYPE_MS));
  later(()=>send.classList.add('is-sending'),t+=SEND_MS);
  later(()=>{send.classList.remove('is-sending');input.classList.remove('is-typing');input.textContent='Zadej otázku…';append(`<p class="user-message is-new">${esc(c.q)}</p>`)},t+=250);
  later(()=>append(`<p class="status-line is-new">${c.status}</p>`),t+=500);
  later(()=>{heroLog.querySelector('.status-line')?.remove();answer(i,true)},t+=SEARCH_MS);
  if(auto)later(()=>run((i+1)%CAPS.length),t+=HOLD_MS);
 };
 buttons.forEach(b=>b.addEventListener('click',()=>{auto=false;run(Number(b.dataset.cap))}));
 run(0);
}

/* Pricing: monthly / annual (−17 %) and the optional Scénáře module on Standard.
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
    el.textContent=period==='monthly'?(withAkce&&name==='standard'?'Při měsíční platbě, včetně modulu Scénáře':'Při měsíční platbě'):`Při roční platbě, ${fmt(year)} Kč jednou ročně`;
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
