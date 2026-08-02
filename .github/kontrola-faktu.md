2. 8. 2026

# Křížová kontrola faktů — ethel.cz, vrstva A

Interní soubor. Leží v `.github/`, protože GitHub Pages publikují z kořene repa a `.github/`
je adresář, který by publikovaný výstup obsahovat neměl. **Předpoklad k ověření po mergi:**
`curl -sI https://ethel.cz/.github/kontrola-faktu.md` musí vrátit 404. Kdyby vrátil 200,
soubor se musí z repa vyndat jinam — GitHub Pages s `.nojekyll` kopírují obsah větve včetně
dot-adresářů, takže spolehnout se na to, že `.github/` zůstane skrytý, nejde. Jako levná pojistka
je v `robots.txt` řádek `Disallow: /.github/`; **není to řešení, jen zdržení** — kdyby `curl`
vrátil 200, soubor musí pryč z repa. V `sitemap.xml` není.

Zdroje pravdy pro tuhle kontrolu: ceník v5 platný od 24. 7. 2026, katalog akcí a seznam šesti
bezpečnostních invariantů ze zadání ze 2. 8. 2026, dále Jira ETH-17, ETH-257, ETH-259, ETH-287,
ETH-295, ETH-296, ETH-299.

**Použitá varianta: A1b (bez modulu Akce).** ETH-295 i ETH-296 byly 2. 8. 2026 ve stavu Backlog,
ETH-287 ve stavu Úkoly. Modul Akce, custom scénář ani „modul v ceně" u Enterprise se proto na web
nedostaly. Vrstva B je blokovaná na ETH-287 → ETH-299 a v téhle dávce se nedělala.

---

## Lighthouse baseline

Měřeno v Kroku 0, před prvním commitem. **Měřeno lokálně** (`python3 -m http.server`, checkout
větve `main`), ne na `https://ethel.cz/` — ze sandboxu není na ethel.cz síťový přístup
(`curl` končí na code 000). Po mergi je potřeba přeměřit proti živé URL.

Příkaz: `npx lighthouse <url> --form-factor=mobile --quiet`, medián ze tří běhů, Chromium 1194.

| Kategorie | Baseline (main) | Po zásahu (web/vrstva-a) | Rozdíl |
|---|---|---|---|
| Performance (mobil) | **77** | **79** | +2 |
| Accessibility | 100 | 100 | 0 |
| Best practices | 100 | 100 | 0 |
| SEO | 100 | 100 | 0 |

Jednotlivé běhy baseline: 77 / 77 / 79. Po zásahu: 77 / 79 / 79.

Metriky baseline (medián běh): FCP 3,5 s · LCP 4,1 s · TBT 0 ms · CLS 0 · Speed Index 4,7 s.
Performance drží dolů FCP a LCP, ne skripty. Lokální server bez komprese a HTTP/2 je horší než
GitHub Pages, takže živé číslo bude vyšší.

---

## Tvrzení na webu

Úplnost ověřená proti seznamu sekcí homepage **ve stavu po zásahu** (14 sekcí ze zadání plus chat
carousel, trust box a nová sekce o zápisech, které v původním výčtu chyběly).

### Homepage

| # | Sekce | Tvrzení | Zdroj | Shoda |
|---|---|---|---|---|
| 1 | navigace | bez číselných a schopnostních tvrzení | — | — |
| 2 | hero | hero podtitul: schopnost odpovídat na dotazy, vysvětlit sestavy a pomoct s orientací v datech (shrnutí, ne citace) | katalog schopností, ETH-17 | A |
| 3 | chat carousel | ilustrační čísla v ukázkové konverzaci (47 objednávek, 128 450 Kč, 12 faktur…) | žádný — jde o mockup | **N → opraveno**: doplněn popisek „Ukázka konverzace. Čísla i názvy položek v odpovědích jsou ilustrační, ne data konkrétního zákazníka." |
| 3 | chat carousel | fiktivní firmy „ABC Trade s.r.o." a „Delta Elektro" | žádný | **N → odstraněno** (precedent ETH-161) |
| 4 | value strip | „10 kliků v sestavách → 1 otázka" | **žádný ověřitelný zdroj** | **N → přepsáno** na „Klikání v sestavách → Jedna otázka" |
| 4 | value strip | „Export do Excelu a ruční počítání → Okamžitá odpověď", „Závislost na IT → Odpovědi pro každého" | kvalitativní, bez čísla | A (první z nich přeformulována, aby se významově nepřekrývala s klikáním v sestavách) |
| 5 | funkce | „Otázku můžete i nadiktovat, psát ji nemusíte." | ETH-259, hotovo 24. 7. 2026 | A (doplněno) |
| 5 | funkce | „prohledává celou wiki Heliosu, všech 11 023 úseků nápovědy" | ETH-17, v produkci (11 023 chunků) | A (doplněno) |
| 5 | funkce | „AI vidí strukturu databáze, ale ne obsah vašich tabulek" | ⚠️ viz otevřená otázka 3 | **?** |
| 5 | funkce | „Standardní procedury, views a triggery Helios Inuvio." | ETH-17, changelog 12. 6. 2026 | A |
| 6 | persony | tři role bez čísel | — | A |
| 7 | Jak to funguje | čtyři kroky instalace, aktivační token | dokumentace `/docs/prvni-kroky` | A |
| 8 | **Co se stane, když Ethel něco zapisuje** (nová) | „Ethel dnes umí jednu zápisovou akci: založení organizace podle IČO z ARESu" | katalog akcí — jediná položka „na web: ANO" | A |
| 8 | tamtéž | „Ta akce běží v ostrém provozu" | katalog akcí, ETH-255/256 | A |
| 8 | tamtéž | zápis jde přes whitelist `epx_Ethel_*` | invariant I2 | A |
| 8 | tamtéž | „Potvrzení drží aplikace, ne model." | invariant I5 | A |
| 8 | tamtéž | co whitelist garantuje: „Whitelist hlídá jinou věc: které procedury Ethel vůbec smí volat." | invariant I2 — hlídá jméno procedury, ne hodnoty parametrů | A (první formulace slibovala, že whitelist zastaví i jiné hodnoty — přepsáno) |
| 8 | tamtéž | „Co přesně se zapíše, čtete v návrhu, který schvalujete." | ne invariant, ale chování potvrzovací smyčky (návrh se uživateli zobrazuje před provedením); invarianty I2 a I5 tenhle konkrétní slib nekryjí | A, ale opora je aplikační, ne testovaná — patří ověřit v ETH-299 |
| 8 | tamtéž | „založení organizace podle IČO z ARESu" | katalog akcí | A, ale dotaz do ARESu je volání ven a bezpečnostní box o něm mlčí — viz otevřená otázka 12 |
| 8 | tamtéž | auditní záznam o spuštění | invariant I5, ETH-295 (`ethel.action_log`) | A |
| 9 | Co se lidé ptají | popis sekce „Ukázky dotazů z běžného dne v Heliosu" | ilustrace, netvrdí četnost (mezikrok „padají nejčastěji" byl tvrzení o četnosti bez zdroje, přepsán) | A |
| 9 | Co se lidé ptají | „Vypíše počet i celkovou částku za včerejšek" | schopnost, bez konkrétního čísla | A |
| 9 | tamtéž | „Založ organizaci podle IČO z ARESu" + čtyřkrokový sled | katalog akcí | A |
| 9 | tamtéž | „Co když Ethel zapíše něco špatně?" — potvrzení + whitelist | invarianty I2 a I5 | A |
| 9 | tamtéž | „ABC Trade s.r.o. – obrat 4,2 mil. Kč, Delta Elektro 3,1 mil. Kč" | žádný | **N → přepsáno** bez firem a bez částek |
| 9 | tamtéž | „Nemusíte číst 300 řádků SQL" | ilustrační rozsah, ne tvrzení o produktu | A |
| 10 | bezpečnost (box) | „Vaše data nikam neodchází", „Do cloudu jde jen dotaz" | ⚠️ ETH-287 popisuje čtyři cesty ven | **?** viz otevřená otázka 3 |
| 10 | tamtéž | disclaimer o Asseco Solutions | rozhodnutí, zůstává | A |
| 11 | o autorovi | „Přes 18 let pracuju s Heliosem" | osobní údaj Jakuba, konzistentní s `/faq` | A |
| 12 | trust box | nadpis „Nasazeno u reálných firem" bez reference | text pod ním to relativizuje, ale nadpis slibuje víc | **?** viz otevřená otázka 5 |
| 13 | ceník | Standard 1 490 Kč/měs, 1 databáze, 5 uživatelů | ceník v5 | A |
| 13 | ceník | další uživatel +249 Kč/měs | ceník v5 | A |
| 13 | ceník | „1 akce v ceně: založení organizace" | ceník v5 | A (doplněno) |
| 13 | ceník | Enterprise 4 990 Kč/měs, neomezeně DB i uživatelů | ceník v5 | A |
| 13 | ceník | roční režim Standard 1 236 Kč, Enterprise 4 141 Kč, další uživatel 206 Kč | 1 490 × 0,83 = 1 236,7 → 1 236; 4 990 × 0,83 = 4 141,7 → 4 141; 249 × 0,83 = 206,6 → 206 | A (opraveno z v4: 1 242 / 4 158 / 209) |
| 13 | ceník | roční součty „14 900 Kč / rok" a „49 900 Kč / rok" | ceník v5 roční součet nezobrazuje | **N → odstraněno** |
| 13 | ceník | „Ceník platný od 24. 7. 2026", „Všechny ceny jsou bez DPH." | ceník v5 | A (doplněno) |
| 13 | ceník | trial 14 dní zdarma, bez omezení, bez karty | ceník v5, řádek Trial: „14 dní, bez omezení, bez platební karty, akce zapnuté"; formulace „akce zapnuté" na web podle A1b nejde | A |
| 14 | CTA | bez číselných tvrzení | — | — |
| 15 | formulář (modal) | „ozveme se vám do 24 hodin s aktivačním tokenem" | provozní slib Jakuba, nezměněno | A |
| 16 | cookie banner | „jen analytické cookies (Google Analytics)" | GA4 na homepage, `G-5YGP0D48W7` | A |
| 17 | footer | IČ 75185628, kontaktní údaje | rejstřík | A |
| 17 | footer | odkaz `/partneri` | **stránka v repu neexistuje** | **N** viz otevřená otázka 4 |

### `/faq` (dotčeno v téhle dávce)

| Tvrzení | Zdroj | Shoda |
|---|---|---|
| „Ethel je pouze pro čtení. Zápisové operace neprojdou." | katalog akcí — zápisové akce běží od 24. 7. 2026 | **N → přepsáno**: čtení přes generované SQL zůstává read-only, zápis jen přes potvrzenou akci a whitelistovanou proceduru |
| „Ethel spouští jen čtecí dotazy" (zátěž SQL Serveru) | totéž | **N → doplněno** o větu o zápisové akci |
| Standard 1 490 Kč, Enterprise 4 990 Kč, +249 Kč, bez DPH | ceník v5 | A |
| výčet u Standardu bez „1 akce v ceně: založení organizace" | ceník v5 | **N → doplněno** v HTML i v JSON-LD, aby `/faq` a homepage říkaly totéž |
| „Měsíční předplatné" bez zmínky ročního režimu | homepage roční režim má | **?** viz otevřená otázka 7 |
| TLS 1.2+, model-agnostická architektura, instalace 15–30 minut | `/bezpecnost`, dokumentace | A (nedotčeno) |

### `/docs/prvni-kroky` (dotčeno v téhle dávce)

| Tvrzení | Zdroj | Shoda |
|---|---|---|
| „Mazat ani měnit data v Heliosu. Ethel umí pouze číst." | katalog akcí | **N → přepsáno** stejnou logikou jako `/faq`; zdrojem je `docs/prvni-kroky.md`, HTML vzniklo `npm run build:docs` |
| „Ethel je tu na čtení a vyhledávání. Pro úpravy dat slouží standardní postupy v Heliosu." (ř. 53 zdrojového `.md`) | katalog akcí | **N → přepsáno**; ta věta popírala opravu o pár řádků výš |
| „Ethel za 2–5 sekund vrátí odpověď" | žádný doložený benchmark | **?** viz otevřená otázka 8 |

### `/bezpecnost`, `/docs/changelog`, `/nahled` — nedotčeno

`/bezpecnost` patří vrstvě B a je blokovaná na ETH-287 → ETH-299. Nálezy k ní jsou v otevřených
otázkách 3, 6 a 9. **Otázka 6 je vědomě odložený rozpor, ne přehlédnutí.**

---

## Otevřené otázky pro Jakuba

**1. Homepage nepoužívá `brand/tokens.css`.**
`index.html` má vlastní `:root` se starou paletou (`--accent: #6b94b8`, pozadí `#08080a`) a fonty
Sora / JetBrains Mono / Space Mono. Brand systém z 24.–26. 7. 2026 (azurová `#56a8e8`, Lora,
DM Sans, DM Mono, Space Grotesk) žije jen v `nahled/index.html` a v `scripts/og-image.html`.
Stránky `/faq`, `/bezpecnost` a `/docs/*` jedou přes `docs/_assets/docs.css`, což je třetí kopie
tokenů, taky se starým accentem.

Vrstva A do toho nesahá — je to redesign, ne oprava faktů. Ve svých změnách jsem nepřidal jedinou
novou hex hodnotu; nové CSS staví výhradně na existujících proměnných homepage. Tím pádem ale
platí: **pravidlo wordmarku `ethel.` s tečkou 700 / 125 % se na homepage nedá ověřit, protože
homepage wordmark nemá** — v navigaci je textové logo `ET/HEL`. Správně řešený wordmark je
v `nahled/index.html`.

Rozhodnutí k udělání: kdy se přepis z `/nahled` propíše do ostrého webu, a jestli se předtím
sjednotí `docs.css` s `tokens.css`.

**2. `/nahled/` je veřejně dostupný a prodává modul Akce.**
`robots.txt` má `Disallow: /nahled/`, což jen odrazuje od indexace; stránka zůstává přístupná
komukoli s odkazem. Obsahuje ceník s modulem Akce +990 Kč, katalog pěti akcí, které podle katalogu
zatím nejsou spustitelné (realizace faktury, faktura z objednávky, objednávky pod minimum skladu,
překlad popisů, odeslání faktury e-mailem), custom scénář od 9 900 Kč, promo „Pro první klienty
6 měsíců v ceně" a fiktivní firmy ABC Trade a Delta Elektro. Podle varianty A1b nesmí nic z toho
ven. Po dohodě z 2. 8. 2026 jsem na `/nahled/` nesahal.

Rozhodnutí k udělání: buď přidat na náhled basic auth / přesunout ho mimo Pages, nebo ho srovnat
s A1b.

**3. Slib o datech na homepage a `/bezpecnost` neodpovídá ETH-287.**
Homepage tvrdí „Vaše data nikam neodchází" a „AI vidí strukturu databáze, ale ne obsah vašich tabulek",
`/bezpecnost` má „Vaše firemní data nikdy neopustí váš server". ETH-287 popisuje čtyři cesty, kterými
data dnes klientský stroj opouštějí (text ODBC chyby, `sql_result` v `/api/interpret`, výsledky
čtecích kroků scénářů, hlasové čtení přes ElevenLabs), a sám navrhuje slib přeformulovat.
Přeformulování patří do vrstvy B a je blokované na ETH-287 → ETH-299, takže jsem tenhle text
nechal beze změny. **Je to nejzávažnější nepravdivost, která na webu zůstává.**

**4. Odkaz `/partneri` vrací 404 z každé stránky webu.**
Je v patičce na `index.html`, `/faq`, `/bezpecnost`, `/docs/`, `/docs/prvni-kroky`,
`/docs/changelog` i v šabloně `scripts/_docs-template.html`, takže ho zdědí každá nově
vygenerovaná docs stránka. Adresář `partneri/` v repu není. Nesahal jsem na to, protože nevím,
jestli stránka vzniká, nebo má odkaz zmizet.

**5. „Nasazeno u reálných firem" slibuje víc, než text pod nadpisem unese.**
Text správně říká, že reference přijdou časem. Nadpis zní jako reference sám o sobě. Podle zadání
se reference řeší až po konverzích trialů, tak jsem to nechal, ale stojí za přepis nadpisu.

Poznámka: počet zákaznických instalací, u kterých akce běží, jsem na web **nedal** — `CLAUDE.md`
zakazuje publikovat počty klientů.

**6. `/bezpecnost` po téhle dávce tvrdí opak než homepage a `/faq`.**
`bezpecnost/index.html:202`: „Ethel pracuje **výhradně v režimu čtení** (SELECT). Každé
vygenerované SQL prochází validační vrstvou, která zápisové operace … nepropustí." A znovu
`:293` v shrnutí: „Co když Ethel vygeneruje špatné SQL? → Pouze čtení, validace mimo AI model."
Od 24. 7. 2026 to neplatí; homepage, `/faq` i `/docs/prvni-kroky` teď říkají, že Ethel zapisuje
přes potvrzenou akci a whitelistovanou proceduru.

Rozhodnutí z 2. 8. 2026: `/bezpecnost` patří vrstvě B, kterou blokuje ETH-287 → ETH-299, a v téhle
dávce se na ni nesahalo. **Do doby, než se vrstva B odblokuje, tvrdí web na téhle jedné stránce
nepravdu**, a homepage na ni odkazuje přímo ze safety boxu („Více o bezpečnosti →"). Když se
vrstva B protáhne, stojí za zvážení opravit ty dvě věty samostatně, dřív než přijdou invarianty
z ETH-299 — je to jednořádková oprava stejného typu, jaká proběhla ve `/faq`.

**7. `/faq` neuvádí roční režim.** Homepage má přepínač měsíčně/ročně se slevou 17 %, `/faq` tvrdí
„Měsíční předplatné" a „platbu kartou připravujeme". Není to lež, ale je to neúplné.

**8. „Ethel za 2–5 sekund vrátí odpověď"** v `/docs/prvni-kroky` je jediné výkonnostní číslo na
webu a nemám k němu doložený zdroj. Nechal jsem ho být.

**9. `/faq` a `/bezpecnost` nemají cookie banner.** GA4 snippet je jen na homepage, takže právní
problém to není. Kdyby se GA rozšířilo na podstránky, banner tam bude potřeba doplnit.

**10. Nedoložená čísla, která na webu zůstala.** „Nemusíte číst 300 řádků SQL" (homepage,
ilustrační rozsah) a „Ethel za 2–5 sekund vrátí odpověď" (`/docs/prvni-kroky`, jediné výkonnostní
číslo na webu, viz otázka 8). U chat mockupu jsem se vědomě rozhodl **čísla nechat a přiznat je
popiskem** místo odstranění: bez čísel ztrácí ukázka konverzace smysl, s popiskem „čísla jsou
ilustrační" nikoho neklame.

**11. Duplicitní cookie banner na homepage.** `index.html` obsahoval dvakrát tentýž blok s totožnými
`id="cookie-banner"`, `id="cookie-reject"` a `id="cookie-accept"`. JS obsluhoval jen první, druhý
visel v DOM. **Odstraněno** v téhle dávce.

**12. Dotaz do ARESu je volání ven a bezpečnostní box o něm mlčí.**
Nová sekce o zápisech uvádí, že Ethel dohledá firmu v ARESu. Bezpečnostní box o pár sekcí níž
tvrdí „Vaše data nikam neodchází" a mezi pilulkami má „Žádný export dat". IČO, které uživatel
zadá, jde do veřejného rejstříku — je to jiná kategorie než výsledky SQL, o kterých mluví
invariant I1, ale na webu to nikde nestojí. ETH-287 tuhle cestu ve svém výčtu čtyř nemá, protože
řeší výsledky dotazů. **Nedomýšlím, jestli ARES volá agent u klienta, nebo proxy** — to je otázka
na tebe. Až se bude psát vrstva B, patří odpověď do formulace slibu o datech.

**13. `/docs/changelog` končí 12. 6. 2026 a nezná nic z toho, co dnes web tvrdí.**
Homepage teď mluví o zápisových akcích (od 24. 7.), hlasovém vstupu (ETH-259) a wiki s 11 023
úseky (ETH-17). Changelog o žádné z nich neví a u vydání 1.0 má pořád „(pouze čtení)". Nedotýkal
jsem se ho, protože doplnit changelog znamená znát data vydání, která nemám. Stojí za samostatnou
dávku.

---

## Co se v téhle dávce neověřovalo

- Šest bezpečnostních invariantů (I1–I6) a jejich opora v testech. Podklad dodá ETH-299, produktový
  kód není v tomhle repu; opora se nesmí odvozovat, jen přebírat.
- Seznam zpracovatelů dat. Dodá ETH-299.
- Kritéria vyžadující živé URL: `curl` na `.github/kontrola-faktu.md` (musí vrátit 404) a Lighthouse
  proti `https://ethel.cz/`. Obojí jde ověřit až po mergi.
