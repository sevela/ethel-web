(()=>{
const doc=document.documentElement;
const themes=document.querySelectorAll('[data-set-theme]');
function applyTheme(theme){doc.dataset.theme=theme;themes.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.setTheme===theme)));document.querySelectorAll('.app-avatar').forEach(x=>x.src='assets/logos/ethel-icon-'+theme+'.svg');}
applyTheme(doc.dataset.theme==='dark'?'dark':'light');
themes.forEach(button=>button.addEventListener('click',()=>{applyTheme(button.dataset.setTheme);try{localStorage.setItem('ethel-theme',button.dataset.setTheme)}catch(e){}}));
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
menu.addEventListener('click',()=>{const expanded=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',expanded);nav.classList.toggle('is-open',expanded)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open')}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');menu.focus()}});
const original=document.querySelector('#demo-answer').innerHTML;
const demos={invoices:{question:'Které faktury jsou více než 30 dní po splatnosti?',answer:original,source:'Zdroj: Faktury vydané · CZK'},columns:{question:'Co znamenají tyto sloupce v přehledu faktur?',answer:'<p>V tomto přehledu vidíte <strong>stav vydaných faktur.</strong></p><ul class="answer-columns"><li><strong>Částka:</strong> celková hodnota faktury.</li><li><strong>Uhrazeno:</strong> dosud evidované platby.</li><li><strong>Zbývá:</strong> částka, která čeká na úhradu.</li></ul><p>Pro přehled po splatnosti se zároveň používá datum splatnosti dokladu.</p>',source:'Ilustrační vysvětlení sestavy'},sql:{question:'Vysvětli mi rozdíl mezi WHERE a HAVING.',answer:'<p><strong>WHERE filtruje jednotlivé řádky.</strong> HAVING vybírá až výsledné skupiny po agregaci.</p><div class="answer-code">WHERE Datum &gt;= @Od<br>GROUP BY Organizace<br>HAVING SUM(Castka) &gt; 100000</div><p>Nejprve se vyberou doklady od daného data. Potom se ponechají organizace se součtem nad 100 000.</p>',source:'Ilustrační SQL · bez připojení k databázi'}};
document.querySelectorAll('[data-demo]').forEach(b=>b.addEventListener('click',()=>{const demo=demos[b.dataset.demo];document.querySelector('#demo-question').textContent=demo.question;document.querySelector('#demo-answer').innerHTML=demo.answer;document.querySelector('#demo-source').textContent=demo.source;document.querySelectorAll('[data-demo]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}));
})();
