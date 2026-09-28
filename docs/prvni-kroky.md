# První kroky

Ethel je AI asistentka přímo v Heliosu. Zeptáte se přirozeně, jako kolegy, a ona data vyhledá, spočítá nebo vám je vysvětlí. Tady je vše, co potřebujete na začátek.

## Jak Ethel spustit

V Heliosu stiskněte **Ctrl+I** nebo v menu zvolte **Doplňky → Ethel**. Funguje to v 51 přehledech, mimo jiné v organizacích, kmenových kartách, dokladech a sestavách. Ethel ví, ve kterém přehledu jste a které záznamy máte označené.

Ethel jde spustit i bez Heliosu dvojklikem na `Ethel.exe`. Pak se přihlásíte stejným jménem a heslem jako do Heliosu, nebo účtem Windows.

## První dotaz

Napište cokoliv, na co byste se jinak ptali kolegy nebo zdlouhavě hledali v sestavě:

> **„Kolik máme faktur vydaných v roce 2026 a jaká je jejich celková hodnota?"**

Zatímco Ethel pracuje, uvidíte, co právě dělá. Odpoví větou s číslem, nebo tabulkou. Odeslat můžete klávesou **Enter**, nový řádek v dotazu uděláte **Shift+Enter**.

## Co s odpovědí můžete dělat

Když na odpověď najedete myší, ukážou se pod ní ikony:

- **?** – Ethel vysvětlí, jak k výsledku došla a z jakých dat čerpá
- **Kopírovat** – tabulku zkopíruje tak, že ji rovnou vložíte do Excelu
- **Zobrazit jako graf** – sloupce, čára nebo koláč ze stejných dat
- **Stáhnout tabulku** – CSV, Excel nebo PDF; soubor vzniká ve vašem počítači
- **Zobrazit SQL dotaz** – ukáže dotaz, který Ethel použila
- **Palec nahoru / dolů** – dáte nám vědět, jestli odpověď sedí; u palce dolů můžete napsat, co bylo špatně

## Otevřete ji nad sestavou

Když Ethel otevřete nad sestavou, uživatelským sloupcem nebo externí akcí a máte označený záznam, sama vysvětlí, co dělá a jak se počítá. U databázového objektu (procedura, pohled, trigger) pak tlačítkem **Analyzovat výkon** rozebere jeho SQL kód a poradí, kde zrychlit.

## Jak na to v Heliosu

Na otázky typu „jak stornovat fakturu“ odpovídá podle oficiální nápovědy Heliosu. Postup napíše po krocích a přidá odkazy na zdroj.

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

## Scénáře: Ethel i zapisuje

Když má vaše firma scénáře zapnuté, Ethel umí i zapsat. Napíšete třeba „Založ organizaci s IČO 04997476“, Ethel dohledá údaje v ARES, na chybějící se zeptá a hodnoty z číselníků nabídne k výběru klikáním. Nakonec ukáže kontrolní kartu se všemi údaji a do Heliosu zapíše až po kliknutí na **Potvrdit a založit**.

## Co Ethel neumí

- **Měnit data mimo scénáře.** Běžné dotazy data jen čtou. Scénář zapíše jen to, co dovoluje, a až po vašem potvrzení.
- **Číst soubory, e-maily ani jiné aplikace.** Pracuje s databází Heliosu. Při zakládání organizace se ptá veřejného rejstříku ARES.
- **Spustit cokoliv jiného než jeden čtecí dotaz.** Program Ethel u vás to kontroluje před každým spuštěním.
- **Pracovat s Mzdami, Personalistikou a Bankou,** dokud je pro vaši firmu nezapneme. S postupem v těchto modulech poradí podle nápovědy Heliosu i tak.
- **Vidět tabulky, které vám správce nepovolil.**

Více o tom, co odchází do cloudu, najdete na stránce [Bezpečnost](/bezpecnost/).

## Tipy do začátku

### Pište česky a přirozeně

„Najdi mi faktury od září" funguje stejně dobře jako „Vrať mi všechny vydané faktury od 1. 9. do 30. 9.". Ethel rozumí obojímu.

### Buďte konkrétní

Čím přesnější dotaz, tím lepší odpověď. Přidejte třeba:

- období – „za tento týden", „od minulého úterý"
- subjekt – „od dodavatele [název]", „pro středisko 110"
- měnu – „v CZK", „v EUR"

### Ptejte se dál

Po první odpovědi můžete pokračovat. Ethel si pamatuje, o čem spolu mluvíte, takže nemusíte opakovat předchozí podmínky:

> „Najdi top 10 zákazníků v segmentu maloobchod v roce 2026." → „A z jakých jsou měst?"

Když chcete začít znovu, zvolte v levém panelu **Nový chat**.

### Přiložte soubor

K dotazu můžete přiložit soubor, třeba snímek chybové hlášky.

### Nadiktujte dotaz

Místo psaní můžete dotaz nadiktovat tlačítkem mikrofonu. V Nastavení si vyberete, jestli se nadiktovaný text jen přepíše, nebo rovnou odešle.

### Když si nevíte rady

Nevíte, jak se na něco zeptat? Napište to vlastními slovy. Když si Ethel nebude jistá, sama se doptá.

## Nastavení

**Nastavení** najdete vlevo dole: velikost písma, světlý nebo tmavý motiv, režim diktování a přepínač, aby okno zůstalo nad Heliosem. Databázi přepnete a odhlásíte se ve spodní liště okna.

## Když Ethel odpoví špatně

Stává se to – ne často, ale stává. Co s tím:

1. **Klikněte na ikonu „?"** u odpovědi – Ethel vysvětlí, jak k výsledku došla a z jakých dat čerpá.
2. **Zkontrolujte SQL,** který Ethel použila – nesrovnalost je často vidět hned (např. špatný filtr na datum).
3. **Dejte palec dolů** a napište, co bylo špatně – pomáhá nám to ladit.
4. **Přeformulujte dotaz** konkrétněji („myslel jsem vydané faktury, ne přijaté").
5. **U kritických rozhodnutí** (audit, daňové přiznání) berte odpověď jako prvotní vodítko a ověřte ji standardní cestou v sestavách Heliosu.

## Když dotaz vyjde dobře

Dejte palec nahoru – pomáhá nám to poznat, které dotazy fungují dobře a kam Ethel dál rozvíjet.

## Něco nefunguje? Máte nápad?

Napište na [info@ethel.cz](mailto:info@ethel.cz). Reagujeme rychle a každá zpětná vazba pomáhá.
