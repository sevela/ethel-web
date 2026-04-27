# Email šablona – Welcome (po úspěšné instalaci)

**Předmět:** Vítejte v ET/HEL! 👋

**Příjemce:** zákazník, jehož agent se poprvé úspěšně přihlásil k api.ethel.cz
**Odesílatel:** ethel@jakubsevela.cz
**Formát:** plain text + HTML verze (později)
**Trigger:** první úspěšný `/api/ask` request s daným tokenem

---

Dobrý den,

ET/HEL u vás úspěšně **odpověděla na první dotaz** – gratulujeme k zaběhnutí! 🎉

Tady je rychlý úvod, jak ze služby vytěžit maximum.

## Co ET/HEL umí (zkusit na dnešní porady)

ET/HEL je **AI asistentka přímo ve vašem Heliosu**. Neumí klikat za vás v UI, ale **odpovídá na dotazy** o vašich datech a pomáhá s orientací v systému.

### 3 tipy pro start

#### 💡 Tip 1: Pište přirozeně, jako kolegovi

Místo *„SELECT COUNT(*) FROM TabFakturyVydan WHERE Datum >= ..."* zkuste:

> **„Kolik faktur jsme vystavili tento měsíc?"**

ET/HEL si SQL přeloží sama a vrátí odpověď s číslem.

#### 💡 Tip 2: Ptejte se na strukturu, když nevíte

Nevíte, kde jsou data? Zeptejte se:

> **„Které tabulky obsahují informace o objednávkách?"**

ET/HEL vysvětlí logiku Heliosu – perfektní pro nové kolegy nebo méně časté oblasti.

#### 💡 Tip 3: Pokračujte v konverzaci

ET/HEL si pamatuje předchozí otázky. Po první odpovědi můžete pokračovat:

> *„Kolik faktur jsme vystavili tento měsíc?"* → ET/HEL: *„184 faktur..."*
> **„A z toho jen ty po splatnosti?"** ← ET/HEL ví, na co navazujete.

## Pošlete tip kolegům

Ať si ET/HEL nezůstane jen u vás – největší hodnota je, když se začnou ptát všichni v týmu:

- 📖 [Rychlý start pro uživatele](https://ethel.cz/docs/quickstart) – pošlete účetním, skladníkům, obchodu
- 📊 [Návod pro IT](https://ethel.cz/docs/guide-it) – pro vašeho administrátora

V tarifu **{{TIER_NAME}}** máte **{{USER_COUNT}} uživatelů v ceně**. Přidání dalších je otázka pár kliknutí – kontaktujte nás na ethel@jakubsevela.cz.

## Pomozte nám ET/HEL zlepšovat

Po každé odpovědi v chatu vidíte palce 👍 / 👎. **Klikněte je** – pomáhá nám to ladit přesnost odpovědí pro váš konkrétní Helios.

Cokoli vás napadne, napište nám na **[ethel@jakubsevela.cz](mailto:ethel@jakubsevela.cz)** – feature requesty, hlášení chyb i pochvaly. Reagujeme rychle.

---

Hodně dotazů a méně klikání. 🚀

Tým ET/HEL
[ethel.cz](https://ethel.cz) · [ethel@jakubsevela.cz](mailto:ethel@jakubsevela.cz)

---

> *Tento e-mail jste obdrželi, protože jste si nainstalovali ET/HEL. Posíláme jen občas – žádný spam, slibujeme.*

---

## Placeholders k naplnění

| Placeholder | Popis |
|---|---|
| `{{TIER_NAME}}` | "Trial 14 dní" / "Standard" / "Enterprise" |
| `{{USER_COUNT}}` | "5" / "neomezený počet" podle tarifu |

## Načasování

Doporučený trigger: **první úspěšný `/api/ask` request** (ne při instalaci – počkat až se reálně použije).

Alternativně: 24 hodin po aktivaci tokenu, pokud nedojde k použití (jiný welcome content typu „nepoužili jste to ještě, potřebujete pomoct?").
