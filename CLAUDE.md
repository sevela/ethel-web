# CLAUDE.md — ethel-web

> Založeno v ETH-270 (CI pipeline, konvence a limity AI-generovaného kódu). Platí pro
> tenhle repo samostatně — širší kontext monorepa je v rootu `ethel/CLAUDE.md`.

## Struktura repa

- `index.html`, `faq/`, `bezpecnost/`, `brand/`, `nahled/` — statický marketingový/dokumentační
  obsah (landing page, dokumentace, brand materiály). Deploy na **ethel.cz** přes GitHub Pages
  (`CNAME`).
- `scripts/build-docs.js` — renderuje `docs/*.md` do `docs/<slug>/index.html` přes `marked`.
  **Po každé změně `docs/*.md` spusť `npm run build:docs` a commitni i vygenerovaný
  `docs/<slug>/index.html`** — jinak se na ethel.cz nic nezmění (viz `README.md`).
- `scripts/build-fonts.js`, `scripts/generate-og.js` — pomocné build skripty.
- `scripts/quality/` — nástroje pro CI kvalitu (viz níže).
- `.github/workflows/ci.yml` — vlastní ETH-270, ostatní dávky do něj nesahají bez konzultace.

**Toto je jediný repo z bloku ETH-270, kde CI pokrývá jen `scripts/**/*.js`** (build skripty).
Zbytek repa je statický obsah (HTML/MD landing page a dokumentace) — limity na délku souboru
na něj nedávají smysl (dlouhá landing page není technický dluh) a nemá to smysl lintovat jako
kód.

## Jak spustit lokálně

```bash
npm run build:docs
npm run lint
npm run format:check
node scripts/quality/baseline.js --check
```

Žádný test framework v repu není (statický web).

## Měřené limity (ETH-270)

CI (`quality-baseline` job) porovnává tenhle stav proti `.quality-baseline.json` a **selže
jen při zhoršení**. Měří `scripts/quality/baseline.js` — **jen `scripts/**/*.js`**, stejný
rozsah jako `npm run lint`. Function-level metriky bere z jádrových ESLint pravidel
(`max-lines-per-function`, `max-params`, `max-depth`, `complexity`) s dočasně vynuceným
prahem 1.

| Metrika | Měkký limit | Tvrdý limit | Jak se měří |
|---|---|---|---|
| Řádků v souboru | 400 | 600 | jen `scripts/**/*.js` |
| Řádků ve funkci | 50 | 80 | ESLint `max-lines-per-function` |
| Parametrů funkce | 5 | 8 | ESLint `max-params` |
| Úrovní vnoření | 3 | 4 | ESLint `max-depth` |
| Cyklomatická složitost | 10 | 15 | ESLint `complexity` |

Aktuální stav: `.quality-baseline.json` je prázdný (0 položek) — build skripty jsou malé
a čisté. **Veřejné metody na třídu se nemíří** — žádná `class` v kódu, ESLint pro to nemá
jádrové pravidlo.

Baseline **nemůže vyrůst sama** — každý růst existující položky je vědomé rozšíření souboru
člověkem v PR. Snížení (refaktoring) se promítne automaticky při přegenerování.

**Tightening je manuální krok (ETH-289), ne automatika ani týdenní bot** — stejné rozhodnutí a
zdůvodnění jako v ostatních třech repech, viz `ethel-agent/CLAUDE.md`. Stav k ETH-289: baseline
je prázdná a odpovídá aktuálnímu kódu, žádná korekce nebyla potřeba. Volnější limit pro
testovací soubory (viz `ethel-proxy`, 800/1200 řádků) tu nedává smysl — repo nemá testovací
framework ani jediný test soubor, přidávat carve-out pro neexistující kategorii by byla
spekulativní abstrakce navíc.

Dependency-audit job (`npm audit`) v tomhle repu zůstává **záměrně neblokující**
(`continue-on-error: true`) a **není** v required checks branch protection rulesetu — na
rozdíl od ostatních tří repů tu žádný produkční kód neběží proti datům zákazníků, jde o
statický landing page. ETH-309 se ho proto netýkal; schedule (týdenní cron) tu už existoval
z ETH-270 stejně jako všude jinde.

## Karanténa testů

`.quality-quarantine.json` existuje, ale je prázdná a nepoužívá se — repo nemá testovací
framework (statický web).

## Závislosti

**Žádná nová položka v `package.json` bez souhlasu.** Pro blok kvality jsou předem
schváleny nástroje uvedené ve sdílených pravidlech ETH-270. Cokoli dalšího vyžaduje
Jakubův souhlas předem.

## Veřejný obsah — žádné interní info

Cokoli, co jde do `index.html`, `faq/`, `docs/` nebo `brand/`, je **veřejné**. Nikdy tam
nepatří marže, počty klientů, partnerská %, technické pivoty ani jiné interní detaily.

## Styl kódu

Přímočarý kód před chytrými abstrakcemi. Novou abstrakci zaváděj až při **třetím výskytu**
stejného vzoru. Magická čísla (limity velikosti, timeouty) pojmenuj jako konstanty.

## Boy scout rule — s výjimkou

Dávka, která se dotkne souboru nad limitem z `.quality-baseline.json`, ho zmenší o kus.
**Výjimka:** neplatí pro ETH-270, ETH-272, ETH-273, ETH-276, ETH-277 a ETH-260 — ty mají
zákaz měnit kód nad rámec vlastního zadání. Zmenšování souborů vlastní **ETH-284**.

## Merge flow

Do `main` se merguje výhradně přes pull request — ruleset `protect-main` přímý push
odmítne. `npm run format` (bez `--check`) patří vždy do samostatného commitu, nikdy
smíchaný s jinou změnou.

## Required check musí umět spadnout (ETH-311)

Job vedený jako required status check v rulesetu `eth270-required-checks` musí mít reálnou
podmínku selhání — `echo`, holý `exit 0` nebo `continue-on-error: true` bez odůvodnění tam
nepatří. ETH-311: v `ethel-app` byl required job `no-tests` přes měsíc jen `echo "žádný
framework"`, zatímco v repu mezitím přibyly dva testovací soubory — commit, který by jejich
regrese vrátil zpátky, by prošel zeleně. `ethel-web` skutečné testy nemá a `no-tests` job to
smí tvrdit — ale musí to tvrzení sám ověřovat, ne ho jen vypsat: job selže, jakmile v repu
vzniknou testovací soubory (`*.test.js`/`*.spec.js`) nebo `test` skript v `package.json` a
nikdo ho neaktualizuje. Pravdivé tvrzení, které se časem stane nepravdivým a nikdo si toho
nevšimne, je přesně ten samý nález jako v `ethel-app` — jen o krok dřív.

## Architektonická rozhodnutí (ADR) — ETH-273

**Každé netriviální rozhodnutí zakládá nové ADR.** Kód Ethel je AI-generovaný: vznikne
snadno, ale *proč* je takový, zůstane v ukončené session. ADR je jediné místo, kde ten
důvod přežije dávku, která ho vymyslela.

**Kde žijí:** `docs/adr/` v repu **ethel-proxy** ([odkaz](https://github.com/sevela/ethel-proxy/blob/main/docs/adr)), ne tady.
Jedno místo napříč repy, ne kopie per repo — stejné pravidlo jako pro
`docs/private/` (viz root `ethel/CLAUDE.md`).

**Formát:** `NNNN-nazev.md`, krátké — kontext → rozhodnutí → důsledky (dobré **i zlé**)
→ alternativy, které padly a proč. Šablona je `0000-template.md`. Odstavec o ceně
rozhodnutí nesmí chybět; rozhodnutí bez ceny je marketing, ne ADR. Číslo se nerecykluje,
nahrazené ADR se nemaže — dostane `Stav: nahrazeno ADR NNNN`.

**Kdy ho zakládáš:** když volba nejde odvodit z kódu a někdo by se za půl roku ptal „proč
zrovna takhle" — volba technologie, bezpečnostní kompromis, vědomé omezení, práh nebo
konstanta s netriviálním dopadem, vzor, který se má opakovat. **Nezakládáš ho** na
běžnou implementaci, opravu chyby ani přejmenování.

**Když důvod neznáš, nevymýšlej ho.** Napiš „důvod nedoložen, doplní Jakub" a dej to do
otázek k dávce. Domyšlený důvod je horší než žádný — vypadá stejně jako doložený.
