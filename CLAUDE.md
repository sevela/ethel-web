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
člověkem v PR.

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
