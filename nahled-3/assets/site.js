/* ==========================================================================
   ethel.cz – NÁHLED 3. Chování stránek. Beze změny převzaté z /nahled-2
   (chat v hero, kontaktní formulář, cookie souhlas + GA4), plus jediná
   novinka: předvyplnění tématu funguje i z jiné stránky, přes ?tema= v URL.
   Formulář žije jen na homepage, ostatní stránky na něj odkazují.
   ========================================================================== */

/* ===== CHAT – přehraje konverzaci jednou (bez karuselu) ===== */
(function () {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var msgs = Array.prototype.slice.call(document.querySelectorAll('#chat-body .chat-msg'));
  var typing = document.getElementById('chat-typing');
  if (!msgs.length) return;
  if (reduced) {
    msgs.forEach(function (m) { m.classList.add('visible'); });
    return;
  }
  var i = 0;
  function next() {
    if (i >= msgs.length) return;
    var msg = msgs[i];
    if (msg.classList.contains('bot') && typing) {
      typing.classList.add('visible');
      setTimeout(function () {
        typing.classList.remove('visible');
        msg.classList.add('visible');
        i++;
        setTimeout(next, 1000);
      }, 900);
    } else {
      msg.classList.add('visible');
      i++;
      setTimeout(next, 700);
    }
  }
  setTimeout(next, 900);
})();

/* ===== KONTAKTNÍ FORMULÁŘ =====
   Společný backend všech tří webů: edge funkce web-lead (Supabase).
   Odpověď v JSON režimu (Accept: application/json), honeypot pole "mail". */
(function () {
  var ENDPOINT = 'https://gygwfcattcunbikootbx.supabase.co/functions/v1/web-lead';

  /* Texty pro předvyplnění zprávy – ať lead dorazí s kontextem.
     Klíč se bere buď z data-prefill na tlačítku (stejná stránka),
     nebo z ?tema= v URL (odkaz z /akce, /download, /demo). */
  var PREFILLS = {
    scenar: 'Vlastní scénář. Rutina, kterou bych chtěl(a) předat Ethel: ',
    nasazeni: 'Nasazení v tarifu Enterprise. Náš provoz: ',
    kompatibilita: 'Ověření kompatibility. Verze Heliosu a prostředí: ',
    instalace: 'Instalace Ethel. Chci poslat instalačku, prostředí máme: ',
    demo: 'Zajímá mě ukázka Ethel. Co bych rád(a) viděl(a): '
  };

  var fields = document.getElementById('form-fields');
  var success = document.getElementById('form-success');
  var errBanner = document.getElementById('form-err');
  var waitBanner = document.getElementById('form-wait');
  var submitBtn = document.getElementById('form-submit');
  var msgEl = document.getElementById('f-msg');

  function prefill(key) {
    if (!PREFILLS[key] || !msgEl) return;
    if (msgEl.value.trim()) return;
    msgEl.value = PREFILLS[key];
  }

  /* CTA na téže stránce */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('[data-prefill]');
    if (!trigger) return;
    var key = trigger.getAttribute('data-prefill');
    prefill(key);
    if (typeof gtag === 'function') gtag('event', 'cta_click', { cta_type: key });
  });

  /* CTA z jiné stránky: /nahled-3/?tema=scenar#kontakt */
  var tema = new URLSearchParams(window.location.search).get('tema');
  if (tema) prefill(tema);

  if (!fields || !submitBtn) return;

  function hideBanners() {
    errBanner.classList.remove('show');
    waitBanner.classList.remove('show');
  }

  submitBtn.addEventListener('click', function () {
    var name = document.getElementById('f-name').value.trim();
    var email = document.getElementById('f-email').value.trim();
    var company = document.getElementById('f-company').value.trim();
    var msg = msgEl.value.trim();
    var honeypot = document.getElementById('f-mail').value.trim();

    if (!name || !email) {
      (name ? document.getElementById('f-email') : document.getElementById('f-name')).focus();
      return;
    }

    hideBanners();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Odesílám…';

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: name, email: email, company: company || '–',
        type: 'trial', message: msg, mail: honeypot
      })
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (payload) {
        return { res: res, payload: payload };
      });
    }).then(function (result) {
      if (result.res.ok && result.payload.ok) {
        fields.classList.add('hidden');
        success.classList.add('show');
        if (typeof gtag === 'function') gtag('event', 'lead_submit', { lead_type: 'trial' });
      } else if (result.res.status === 429) {
        waitBanner.classList.add('show');
      } else {
        errBanner.classList.add('show');
      }
    }).catch(function () {
      errBanner.classList.add('show');
    }).finally(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Chci vyzkoušet Ethel';
    });
  });

  /* Konverze: scroll na #cena (jednorázově za session) */
  var pricingEl = document.getElementById('cena');
  if (pricingEl && 'IntersectionObserver' in window) {
    var fired = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !fired) {
          fired = true;
          if (typeof gtag === 'function') gtag('event', 'pricing_view');
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(pricingEl);
  }
})();

/* ===== COOKIE CONSENT + GA4 =====
   Lišta je v HTML právě jednou na stránku. Na ostré homepage je dnes
   dvakrát (index.html:1344 a :1356, obojí id="cookie-banner") a JS obsluhuje
   jen tu první – tady se to opakovat nesmí. */
(function () {
  var GA_MEASUREMENT_ID = 'G-5YGP0D48W7';
  var CONSENT_KEY = 'ethel_cookie_consent_v1';

  var banner = document.getElementById('cookie-banner');
  var acceptBtn = document.getElementById('cookie-accept');
  var rejectBtn = document.getElementById('cookie-reject');

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* private mode */ }
  }
  function hideBanner() {
    if (banner) banner.classList.remove('show');
  }
  function loadGA() {
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;
    if (window._ethelGaLoaded) return;
    window._ethelGaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  var existing = getConsent();
  if (existing === 'accepted') {
    loadGA();
  } else if (existing !== 'rejected' && banner) {
    setTimeout(function () { banner.classList.add('show'); }, 1200);
  }

  if (acceptBtn) acceptBtn.addEventListener('click', function () {
    setConsent('accepted');
    hideBanner();
    loadGA();
  });
  if (rejectBtn) rejectBtn.addEventListener('click', function () {
    setConsent('rejected');
    hideBanner();
  });
})();
