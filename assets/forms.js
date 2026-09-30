/* Contact form: shared backend of all three sites, edge function web-lead (Supabase).
   JSON mode (Accept: application/json) returns {ok, error}; 429 = rate limit. Honeypot field "mail".
   Prefill of the message works from a CTA on the same page (data-prefill) or via ?tema= in the URL.
   The optional plan select (name=topic) goes to the backend as `type`; empty = general question. */
(()=>{
const ENDPOINT='https://gygwfcattcunbikootbx.supabase.co/functions/v1/web-lead';
const PREFILLS={
 scenar:'Vlastní scénář. Postup, který bych chtěl(a) předat Ethel: ',
 nasazeni:'Nasazení v tarifu Enterprise. Náš provoz: ',
 kompatibilita:'Ověření kompatibility. Verze Heliosu a prostředí: ',
 instalace:'Instalace Ethel. Prostředí máme: ',
 demo:'Zajímá mě ukázka Ethel. Co bych rád(a) viděl(a): '
};
const form=document.querySelector('#contact-form');
const message=document.querySelector('#contact-message');
const topic=document.querySelector('#contact-topic');

function prefill(key){
 if(!PREFILLS[key]||!message||message.value.trim())return;
 message.value=PREFILLS[key];
 if(topic&&key==='nasazeni')topic.value='Enterprise';
}
document.addEventListener('click',e=>{
 const trigger=e.target.closest&&e.target.closest('[data-prefill]');
 if(!trigger)return;
 prefill(trigger.getAttribute('data-prefill'));
});
const tema=new URLSearchParams(location.search).get('tema');
if(tema)prefill(tema);

if(!form)return;
const required=[...form.querySelectorAll('[required]')];
const summary=document.querySelector('#contact-errors');
const failed=document.querySelector('#contact-failed');
const limit=document.querySelector('#contact-limit');
const success=document.querySelector('#contact-success');
const submit=form.querySelector('[type="submit"]');
const submitLabel=submit.querySelector('span');
const submitText=submitLabel.textContent;

function validate(field){
 let msg='';
 if(!field.value.trim())msg=field.name==='name'?'Doplňte prosím své jméno.':'Doplňte prosím e-mail.';
 else if(field.type==='email'&&field.validity.typeMismatch)msg='Zadejte platný e-mail, například jan@firma.cz.';
 const error=document.getElementById(field.getAttribute('aria-describedby'));
 error.textContent=msg;error.hidden=!msg;
 field.setAttribute('aria-invalid',String(Boolean(msg)));
 return !msg;
}
required.forEach(field=>field.addEventListener('input',()=>{if(field.hasAttribute('aria-invalid'))validate(field);if(!form.querySelector('[aria-invalid="true"]'))summary.hidden=true}));

form.addEventListener('submit',event=>{
 event.preventDefault();
 const invalid=required.filter(field=>!validate(field));
 summary.hidden=!invalid.length;
 failed.hidden=true;limit.hidden=true;
 if(invalid.length){invalid[0].focus();return}
 const value=name=>(form.elements[name]?.value||'').trim();
 const type=value('topic')||'dotaz';
 submit.disabled=true;submitLabel.textContent='Odesílám…';
 fetch(ENDPOINT,{
  method:'POST',
  headers:{'Content-Type':'application/json','Accept':'application/json'},
  body:JSON.stringify({name:value('name'),email:value('email'),company:value('company')||'–',type,message:value('message'),mail:value('mail')})
 }).then(res=>res.json().catch(()=>({})).then(payload=>({res,payload})))
 .then(({res,payload})=>{
  if(res.ok&&payload.ok){
   form.hidden=true;success.hidden=false;success.focus();
   if(typeof gtag==='function')gtag('event','lead_submit',{lead_type:type});
  }else if(res.status===429){limit.hidden=false}
  else{failed.hidden=false}
 })
 .catch(()=>{failed.hidden=false})
 .finally(()=>{submit.disabled=false;submitLabel.textContent=submitText});
});
})();
