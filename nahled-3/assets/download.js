/* ==========================================================================
   Stránka ke stažení (ETH-241): číslo verze a datum vydání se berou za běhu
   z proxy, ne z HTML – zapsané natvrdo by zestárlo s prvním dalším vydáním.
   Tlačítko ke stažení na skriptu nezávisí: odkaz vede přes stálou adresu
   /api/agent/download vždy na nejnovější zapnuté vydání. Když se verze
   nenačte, stránka to řekne a tlačítko funguje dál.
   ========================================================================== */
(function () {
  var ENDPOINT = 'https://proxy.ethel.cz/api/agent/latest';
  var verze = document.getElementById('dl-version');
  var poznamky = document.getElementById('dl-notes');
  if (!verze) return;

  function datumCs(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear();
  }

  function selhani() {
    verze.textContent = 'Číslo verze se nepodařilo načíst. Odkaz vede vždy na nejnovější vydání.';
  }

  fetch(ENDPOINT, { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (v) {
      if (!v || !v.version) return selhani();
      var datum = datumCs(v.published_at);
      verze.textContent = 'Verze ' + v.version + (datum ? ' · vydáno ' + datum : '');
      if (poznamky && v.notes) {
        poznamky.textContent = v.notes;
        poznamky.hidden = false;
      }
    })
    .catch(selhani);
})();
