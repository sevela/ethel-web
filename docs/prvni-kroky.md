# Návod pro uživatele

Pro koncové uživatele v Heliosu. Tonalita praktická – co stisknout, co napsat, co se stane.

## Jak Ethel spustit

V Heliosu stiskněte **CTRL+I** (případně akci „Ethel" v menu, podle toho, jak to nastavil váš IT). Otevře se chat okno – vypadá jako messenger, jen ho ovládáte z klávesnice nebo myší.

## První dotaz – ukázka

Napište do chatu cokoliv, na co byste se ptali kolegy nebo si museli vyhledat v sestavě:

> **„Kolik máme faktur vydaných v roce 2026 a jaká je jejich celková hodnota?"**

Ethel za 2–5 sekund vrátí odpověď s číslem, případně i SQL, kterou použila. Pokud něco vypadá divně, dejte palec dolů – pomůže nám to ladit.

## 10 příkladů, na co se zeptat

Vyzkoušejte, ať pochopíte rozsah:

1. **„Kolik faktur po splatnosti?"**
   Provozní filtr jedním dotazem.

2. **„Top 10 nejprodávanějších položek za květen."**
   Top-N přehledy.

3. **„Jakou mám skladovou zásobu (celkem kusů) na jednotlivých skladech?"**
   Stav skladu napříč všemi sklady najednou.

4. **„Vypiš tržby po měsících a střediscích za rok 2026."**
   Agregace ve dvou rozměrech – rovnou jako tabulka.

5. **„Najdi mi top 10 zákazníků v segmentu maloobchod v roce 2026."**
   Filtr přes podmnožinu zákazníků s pořadím.

6. **„Které položky mají největší marži?"**
   Co byste jinak skládali přes několik sestav.

7. **„Vypiš telefonní čísla a e-maily organizací."**
   Kontaktní údaje jedním dotazem.

8. **„Porovnej mi tržby za Q1 2026 a Q1 2025 po měsících."**
   Srovnání dvou období vedle sebe.

9. **„Udělej mi přehled aktivních položek, které nemají přiřazenou cenu v ceníku."**
   Kontrola úplnosti dat – Ethel najde díry, které byste ručně hledali dlouho.

10. **„Shrň mi, co se dělo ve skladu za poslední rok – příjmy, výdeje, saldo."**
    Souhrnná analytika jedním dotazem.

## Co Ethel **NEUMÍ** (a proč)

Ze záměru – bezpečnost vašich dat je priorita.

- ❌ **Mazat ani měnit data v Heliosu.** Ethel umí pouze číst.
- ❌ **Přistupovat k datům mimo Helios** (souborový systém, jiné aplikace, e-maily).
- ❌ **Spouštět vlastní SQL příkazy** mimo schválený rozsah.
- ❌ **Pracovat s Mzdami, Personalistikou, Bankou.** Tyto moduly nejsou ve znalostní bázi.
- ❌ **Posílat data ven** bez vašeho vědomí. Více v [Bezpečnost](/bezpecnost).

Pokud potřebujete akci typu „uprav záznam", Ethel vám pomůže s návrhem SQL, ale spuštění zůstane na vás – v Heliosu standardní cestou.

## Tipy do začátku

### Pište česky a přirozeně

„Najdi mi faktury od září" funguje stejně dobře jako „Vrať mi všechny FA od 1. 9. po 30. 9.". Ethel rozumí oběma.

### Buďte konkrétní s časem a kontextem

Čím přesněji, tím lepší odpověď:

- „Tento týden" / „od minulého úterý"
- „Od dodavatele XY"
- „Pro středisko 110"
- „V CZK", „v EUR"

### Použijte follow-up otázky

Po první odpovědi pokračujte:

> „Najdi mi top 10 zákazníků v segmentu maloobchod v roce 2026." → „Z jakých měst?"

Ethel si pamatuje kontext konverzace v rámci okna. Nemusíte opakovat předchozí podmínky.

### Když si nejste jistí strukturou

„Které tabulky obsahují informace o platbách?" vám pomůže pochopit, kde co najít. Pak se ptejte konkrétněji.

### Když Ethel řekne, že to neumí

Doptá se nebo nabídne alternativu. Pokud opravdu nezná téma (typicky Mzdy), řekne to a navrhne, s čím vám může pomoct místo toho.

## Když Ethel odpoví špatně

Stává se to – ne často, ale stává. Co dělat:

1. **Zkontrolujte SQL**, které Ethel zobrazila – často je rozdíl vidět rovnou (např. špatný filtr na datum).
2. **Dejte palec dolů** přímo v chatu. Pomáhá nám to ladit prompty.
3. **Reformulujte dotaz** konkrétněji nebo s upřesněním („myslel jsem vydané faktury, ne přijaté").
4. **U kritických rozhodnutí** (audit, daňové přiznání) považujte odpověď Ethel za prvotní vodítko a ověřte standardní cestou v sestavách Heliosu.

## Když nějaký dotaz funguje překvapivě dobře

Dejte palec nahoru a klidně napište do feedbacku, čím vás potěšilo. Pomáhá to nastavit, kterým směrem Ethel dál ladit.

## Něco nefunguje? Máte nápad?

Napište na [info@ethel.cz](mailto:info@ethel.cz). Reagujeme rychle, každá zpětná vazba pomáhá.

---

**Další čtení:**

- [Instalace a správa](/docs/instalace) – pro IT (pošlete kolegovi z IT, pokud je problém s nasazením)
- [Bezpečnost](/bezpecnost) – pro ředitele a IT manažery
- [Changelog](/docs/changelog) – co se nově přidává
