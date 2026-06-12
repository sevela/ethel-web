# Návod pro uživatele

Pro koncové uživatele v Heliosu. Tonalita praktická – co stisknout, co napsat, co se stane.

## Jak Ethel spustit

V Heliosu stiskněte **CTRL+I** (případně akci „Ethel" v menu, podle toho, jak to nastavil váš IT). Otevře se chat okno – vypadá jako messenger, jen ho ovládáte z klávesnice nebo myší.

## První dotaz – ukázka

Napište do chatu cokoliv, na co byste se ptali kolegy nebo si museli vyhledat v sestavě:

> **„Kolik faktur jsme vystavili minulý měsíc?"**

Ethel za 2–5 sekund vrátí odpověď s číslem, případně i SQL, kterou použila. Pokud něco vypadá divně, dejte palec dolů – pomůže nám to ladit.

## 10 příkladů, na co se zeptat

Vyzkoušejte, ať pochopíte rozsah:

1. **„Kolik faktur jsme vystavili minulý měsíc?"**
   Rychlý přehled bez otevírání sestavy.

2. **„Které objednávky čekají na vyřízení déle než 14 dnů?"**
   Provozní filtr jedním dotazem.

3. **„Vysvětli mi sloupec `Datum_S` v tabulce `TabDokladyZbozi`."**
   Význam polí v Heliosu – ideální pro nové kolegy.

4. **„Najdi všechny faktury od dodavatele ABC za poslední čtvrtletí."**
   Filtrování přes přirozený jazyk.

5. **„Co znamená status doplňkového textu = 9?"**
   Vysvětlení číselníků a logiky Heliosu.

6. **„Která dodávka má největší marži za minulý rok?"**
   Agregace s pořadím – co byste hledali přes několik sestav.

7. **„Ukaž mi 10 největších objednávek z minulého týdne."**
   Top-N přehledy.

8. **„Kolik máme aktivních klientů v segmentu B2B?"**
   Filtr přes podmnožinu zákazníků.

9. **„Vypiš tabulky, které obsahují informace o platbách."**
   Když nevíte, kde data hledat – Ethel vám pomůže s orientací.

10. **„Vysvětli mi SQL dotaz, který jsi posledně použila."**
    Pomáhá při učení SQL nebo když chcete pochopit, odkud čísla pochází.

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

> „Kolik faktur jsme vystavili minulý měsíc?" → „A z toho jen ty nezaplacené?"

Ethel si pamatuje kontext konverzace v rámci okna. Nemusíte opakovat předchozí podmínky.

### Když si nejste jistí strukturou

„Které tabulky obsahují informace o platbách?" vám pomůže pochopit, kde co najít. Pak se ptejte konkrétněji.

### Když Ethel řekne, že to neumí

Doptá se nebo nabídne alternativu. Pokud opravdu nezná téma (typicky Mzdy), řekne to a navrhne, s čím vám může pomoct místo toho.

## Klávesové zkratky v chatu

| Zkratka | Akce |
|---|---|
| `Enter` | Odeslat zprávu |
| `Shift + Enter` | Nový řádek (víceřádkový dotaz) |
| `Esc` | Zavřít chat |
| `↑` (v prázdném inputu) | Editovat poslední dotaz |
| `Ctrl + L` | Vymazat konverzaci a začít znovu |

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
