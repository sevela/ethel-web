# První kroky s Ethel

Ethel je AI asistentka přímo v Heliosu. Zeptáte se přirozeně – jako kolegy – a ona data vyhledá, spočítá nebo vám je vysvětlí. Tady je vše, co potřebujete na začátek.

## Jak Ethel spustit

V Heliosu stiskněte **CTRL+I** nebo zvolte akci **Ethel** v menu – obojí je po instalaci k dispozici automaticky, ve všech podporovaných přehledech. Otevře se okno chatu; ovládáte ho klávesnicí i myší, jako messenger.

## První dotaz

Napište cokoliv, na co byste se jinak ptali kolegy nebo zdlouhavě hledali v sestavě:

> **„Kolik máme faktur vydaných v roce 2026 a jaká je jejich celková hodnota?"**

Ethel za 2–5 sekund vrátí odpověď s číslem, případně i SQL, který použila. Pokud něco vypadá divně, dejte palec dolů – pomáhá nám to ladit.

## Co s odpovědí můžete dělat

U každé odpovědi s daty najdete řádek ikon:

- **?** – Ethel vysvětlí, jak k výsledku došla a z jakých dat čerpá
- **Analyzovat výkon** – u definice databázového objektu (procedura, trigger, pohled) Ethel rozebere výkon jeho SQL kódu a poradí, kde zrychlit
- **Kopírovat** – zkopíruje odpověď do schránky
- **Stáhnout CSV** – uloží tabulku jako soubor pro Excel (jen u tabulkových výsledků)
- **Zobrazit SQL** – ukáže dotaz, který Ethel použila
- **Palec nahoru / dolů** – dáte nám vědět, jestli odpověď sedí

## Na co se zeptat

Pár dotazů z praxe, ať vidíte rozsah:

- „Kolik faktur po splatnosti?"
- „Top 10 nejprodávanějších položek za květen."
- „Jakou mám skladovou zásobu na jednotlivých skladech?"
- „Vypiš tržby po měsících a střediscích za rok 2026."
- „Najdi top 10 zákazníků v segmentu maloobchod v roce 2026."
- „Které položky mají největší marži?"
- „Vypiš telefonní čísla a e-maily organizací."
- „Porovnej tržby za Q1 2026 a Q1 2025 po měsících."
- „Které aktivní položky nemají přiřazenou cenu v ceníku?"
- „Shrň, co se dělo ve skladu za poslední rok – příjmy, výdeje, saldo."

## Co Ethel **neumí** (a proč)

Ze záměru – bezpečnost vašich dat je priorita.

- ❌ **Mazat ani měnit data v Heliosu.** Ethel umí pouze číst.
- ❌ **Přistupovat k datům mimo Helios** (souborový systém, jiné aplikace, e-maily).
- ❌ **Spouštět vlastní SQL** mimo schválený rozsah.
- ❌ **Pracovat s Mzdami, Personalistikou a Bankou.** Tyto moduly nejsou ve znalostní bázi.
- ❌ **Posílat data ven** bez vašeho vědomí. Více v sekci [Bezpečnost](/bezpecnost).

Ethel je tu na čtení a vyhledávání. Pro úpravy dat slouží standardní postupy v Heliosu.

## Tipy do začátku

### Pište česky a přirozeně

„Najdi mi faktury od září" funguje stejně dobře jako „Vrať mi všechny vydané faktury od 1. 9. do 30. 9.". Ethel rozumí obojímu.

### Buďte konkrétní

Čím přesnější dotaz, tím lepší odpověď. Přidejte třeba:

- období – „za tento týden", „od minulého úterý"
- subjekt – „od dodavatele [název]", „pro středisko 110"
- měnu – „v CZK", „v EUR"

### Ptejte se dál

Po první odpovědi můžete pokračovat – Ethel si pamatuje kontext konverzace, takže nemusíte opakovat předchozí podmínky:

> „Najdi top 10 zákazníků v segmentu maloobchod v roce 2026." → „A z jakých jsou měst?"

### Když si nevíte rady

Nevíte, jak se na něco zeptat? Napište to vlastními slovy. Když si Ethel nebude jistá, sama se doptá nebo nabídne, jak dotaz upřesnit.

## Když Ethel odpoví špatně

Stává se to – ne často, ale stává. Co s tím:

1. **Klikněte na ikonu „?"** u odpovědi – Ethel vysvětlí, jak k výsledku došla a z jakých dat čerpá.
2. **Zkontrolujte SQL,** který Ethel zobrazila – nesrovnalost je často vidět hned (např. špatný filtr na datum).
3. **Dejte palec dolů** a napište, co bylo špatně – pomáhá nám to ladit.
4. **Přeformulujte dotaz** konkrétněji („myslel jsem vydané faktury, ne přijaté").
5. **U kritických rozhodnutí** (audit, daňové přiznání) berte odpověď jako prvotní vodítko a ověřte ji standardní cestou v sestavách Heliosu.

## Když dotaz vyjde dobře

Dejte palec nahoru – pomáhá nám to poznat, které dotazy fungují dobře a kam Ethel dál rozvíjet.

## Něco nefunguje? Máte nápad?

Napište na [info@ethel.cz](mailto:info@ethel.cz). Reagujeme rychle a každá zpětná vazba pomáhá.

---

**Další čtení:**

- [Instalace a správa](/docs/instalace) – pro IT (pošlete kolegovi z IT, pokud je problém s nasazením)
- [Bezpečnost](/bezpecnost) – pro ředitele a IT manažery
- [Changelog](/docs/changelog) – co se nově přidává
