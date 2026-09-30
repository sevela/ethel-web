# První kroky s Ethel

Ethel vám pomůže dohledat data v Heliosu, porozumět sestavám a zjistit, jak postupovat. Otázky píšete vlastními slovy. Tady najdete vše potřebné pro první použití.

## Jak Ethel spustit

V podporovaném přehledu Heliosu stiskněte **Ctrl+I** nebo zvolte **Doplňky / Ethel**. K dispozici je přibližně v 50 přehledech, například u organizací, kmenových karet, dokladů a sestav.

Ethel ví, který přehled máte otevřený a které záznamy jste označili.

Spustit ji můžete také samostatně dvojklikem na `Ethel.exe`. Potom se přihlásíte svým jménem a heslem jako do Heliosu nebo účtem Windows. Podmínky samostatného spuštění najdete v [návodu pro správce](/docs/pro-spravce/).

## První otázka

Zkuste se zeptat na něco, co byste jinak hledali v přehledu nebo sestavě:

> **„Kolik máme vydaných faktur za rok 2026 a jaká je jejich celková hodnota?“**

Otázku odešlete klávesou **Enter**. Nový řádek vložíte pomocí **Shift+Enter**.

Během zpracování uvidíte, co Ethel právě dělá. Výsledek zobrazí jako text nebo tabulku.

## Co můžete dělat s odpovědí

Když na odpověď najedete myší, zobrazí se dostupné možnosti:

- **?** – vysvětlí, jak Ethel k výsledku došla a z jakých dat vycházela.
- **Kopírovat** – zkopíruje tabulku tak, abyste ji mohli rovnou vložit do Excelu.
- **Zobrazit jako graf** – vytvoří ze stejných dat sloupcový, čárový nebo koláčový graf.
- **Stáhnout tabulku** – uloží výsledek do CSV, Excelu nebo PDF. Soubor vzniká ve vašem počítači.
- **Zobrazit SQL dotaz** – ukáže dotaz, kterým Ethel data získala.
- **Palec nahoru / dolů** – odešle hodnocení odpovědi. U palce dolů můžete připsat, co nebylo správně.

## Vysvětlení sestavy nebo sloupce

Označte sestavu, uživatelský sloupec nebo externí akci a otevřete Ethel. Vysvětlí, k čemu slouží a jak funguje.

U databázových objektů, například procedur, pohledů a triggerů, můžete použít tlačítko **Analyzovat výkon**. Ethel rozebere SQL kód a navrhne, kde hledat možnosti zrychlení.

## Pomoc s postupy v Heliosu

Nevíte, jak stornovat fakturu nebo vytvořit uložený filtr? Zeptejte se Ethel. Postup popíše podle oficiální nápovědy Heliosu a přidá odkaz na zdroj.

## Na co se můžete zeptat

- Kolik máme faktur po splatnosti?
- Kterých deset položek se v květnu prodávalo nejvíc?
- Jaká je zásoba na jednotlivých skladech?
- Vypiš tržby po měsících a střediscích za rok 2026
- Najdi deset největších zákazníků v maloobchodu za rok 2026
- Které položky mají největší marži?
- Vypiš telefonní čísla a e-maily organizací
- Porovnej tržby za Q1 2026 a Q1 2025 po měsících
- Které aktivní položky nemají přiřazenou cenu v ceníku?
- Shrň příjmy, výdeje a saldo skladu za poslední rok

Při analytickém shrnutí Ethel posílá modelu data, ze kterých má napsat vyhodnocení. Podrobnosti najdete na stránce [Bezpečnost](/bezpecnost/).

## Zápis pomocí scénářů

Pokud má vaše firma zapnuté scénáře, můžete Ethel zadat i konkrétní úkol. Například:

> **„Založ organizaci Ukázková s.r.o.“**

Ethel dohledá údaje v ARES a zeptá se na to, co chybí. Hodnoty z číselníků nabídne k výběru. Nakonec zobrazí kontrolní kartu a do Heliosu zapíše až po kliknutí na **Potvrdit a založit**.

Do potvrzení můžete scénář zrušit.

## Jaká má Ethel omezení

- **Data mění pouze pomocí scénářů.** Běžné otázky data jen čtou. Scénář může zapsat pouze to, k čemu je připravený, a čeká na vaše potvrzení.
- **Nemá samostatný přístup k vašim souborům, e-mailům ani jiným aplikacím.** Pracuje s databází Heliosu a se soubory, které jí sami přiložíte. Při zakládání organizace vyhledává také ve veřejném rejstříku ARES.
- **Běžný dotaz na data musí být jediný čtecí příkaz SELECT.** Program to před spuštěním kontroluje. Zápisy probíhají odděleně prostřednictvím scénářů.
- **Mzdy, Personalistika a Banka jsou ve výchozím nastavení zamknuté.** Přístup k jejich datům zapneme na žádost firmy. S používáním těchto modulů Ethel poradí podle nápovědy i bez odemčení.
- **Přístup k datům určuje správce.** Ethel nemůže zpřístupnit oblasti, které máte zakázané.

[Jak Ethel pracuje s daty](/bezpecnost/)

## Tipy do začátku

### Pište vlastními slovy

Nemusíte znát názvy tabulek ani SQL. Stačí například „Ukaž mi vydané faktury za září 2026“.

### Doplňte podrobnosti

Pokud záleží na období, firmě nebo měně, napište je rovnou:

- období: „za tento týden“ nebo „od minulého úterý“,
- firma či středisko: „od dodavatele [název]“ nebo „pro středisko 110“,
- měna: „v CZK“ nebo „v EUR“.

### Ptejte se dál

Na odpověď můžete navázat bez opakování celého zadání:

> „Najdi deset největších zákazníků v maloobchodu za rok 2026.“
>
> „A z jakých jsou měst?“

Pokud chcete začít nové téma, zvolte v levém panelu **Nový chat**.

### Přiložte soubor

K otázce můžete přidat například snímek chybové hlášky. Obsah přílohy se předává AI modelu, aby s ním mohl pracovat.

### Nadiktujte otázku

Klikněte na mikrofon a otázku řekněte. V **Nastavení** vyberete, jestli se nadiktovaný text jen přepíše, nebo také rovnou odešle.

### Popište, co potřebujete

Nevíte, jak otázku formulovat? Napište, čeho chcete dosáhnout. Pokud bude Ethel potřebovat další informace, doptá se.

## Nastavení

**Nastavení** najdete vlevo dole. Změníte v něm velikost písma, světlý nebo tmavý vzhled, způsob diktování i to, zda má okno zůstávat nad Heliosem.

Ve spodní liště okna vidíte, pod kterým jménem a ve které databázi pracujete. Kliknutím na název databáze přepnete na jinou databázi, ve které máte Ethel povolenou. Pokud jste Ethel spustili samostatně, odhlásíte se kliknutím na své jméno v liště.

## Když odpověď nesedí

Ethel se může splést. Pokud výsledek neodpovídá tomu, co očekáváte:

1. Klikněte na **?** a nechte si vysvětlit postup i použitá data.
2. Upřesněte zadání, například „Myslel jsem vydané faktury, ne přijaté“.
3. Pokud pracujete s SQL, zobrazte použitý dotaz a zkontrolujte například období nebo filtry.
4. Dejte odpovědi palec dolů a stručně popište problém.
5. Výsledky pro důležitá rozhodnutí, například audit nebo daňové přiznání, ověřte také v sestavách Heliosu.

## Když vám odpověď pomůže

Dejte jí palec nahoru. Pomůže nám to poznat, které odpovědi fungují dobře a co má smysl dál rozvíjet.

## Napište nám, když něco nefunguje nebo vás napadne zlepšení

Ozvěte se na [info@ethel.cz](mailto:info@ethel.cz). Pomůže nám popis situace i toho, jaký výsledek jste očekávali.
