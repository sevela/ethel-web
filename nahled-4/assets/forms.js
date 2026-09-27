/* Preview only: validates locally, never submits, stores or sends field values. */
(()=>{
const form=document.querySelector('#contact-form');
if(!form)return;
const required=[...form.querySelectorAll('[required]')];
const summary=document.querySelector('#contact-errors');
const success=document.querySelector('#contact-success');
function validate(field){
 let message='';
 if(!field.value.trim())message=field.name==='name'?'Doplňte prosím své jméno.':field.name==='email'?'Doplňte prosím e-mail.':'Napište prosím, s čím vám můžeme pomoci.';
 else if(field.type==='email'&&field.validity.typeMismatch)message='Zadejte platný e-mail, například vy@firma.cz.';
 const error=document.getElementById(field.getAttribute('aria-describedby'));
 error.textContent=message;error.hidden=!message;
 field.setAttribute('aria-invalid',String(Boolean(message)));
 return !message;
}
required.forEach(field=>field.addEventListener('input',()=>{if(field.hasAttribute('aria-invalid'))validate(field);if(!form.querySelector('[aria-invalid="true"]'))summary.hidden=true;}));
form.addEventListener('submit',event=>{
 event.preventDefault();
 const invalid=required.filter(field=>!validate(field));
 summary.hidden=!invalid.length;
 if(invalid.length){invalid[0].focus();return;}
 form.hidden=true;success.hidden=false;success.focus();
});
document.querySelector('#contact-again').addEventListener('click',()=>{
 form.reset();required.forEach(field=>{field.removeAttribute('aria-invalid');document.getElementById(field.getAttribute('aria-describedby')).hidden=true;});
 summary.hidden=true;success.hidden=true;form.hidden=false;required[0].focus();
});
form.querySelector('[type="submit"]').disabled=false;
})();
