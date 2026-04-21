# ET/HEL — Rychlý start

Vítejte v ET/HEL. Tento návod vás za pár minut provede prvními kroky.

## Co je ET/HEL

ET/HEL je AI asistentka přímo v Heliosu iNuvio. Místo proklikávání sestav se prostě **zeptáte** česky a dostanete odpověď s kontextem vašich dat.

## Instalace (5 minut)

Instalaci obvykle provádí váš IT administrátor podle [návodu pro IT](guide-it.md). Z pohledu uživatele to vypadá takto:

1. Administrátor nainstaluje ET/HEL na server s Heliosem.
2. Dostanete e-mailem **aktivační token** a krátkou informaci, že už můžete spustit.
3. Otevřete Helios jako obvykle.

## Jak ET/HEL spustit

V Heliosu stiskněte **CTRL+I** *(nebo akci „ET/HEL" v menu, podle nasazení vaší firmy)*. Otevře se chat okno.

## 5 příkladů, na co se zeptat

Vyzkoušejte tyto dotazy — pomůžou vám pochopit, co ET/HEL umí:

1. **„Kolik faktur jsme vystavili minulý měsíc?"**
   Rychlá odpověď bez nutnosti otevírat sestavu.

2. **„Které objednávky čekají na vyřízení déle než 14 dnů?"**
   Provozní přehled jedním dotazem.

3. **„Vysvětli mi sloupec `Datum_S` v tabulce `TabDokladyZbozi`."**
   Kontext a význam polí — ideální pro nové kolegy.

4. **„Najdi všechny faktury od dodavatele ABC za poslední čtvrtletí."**
   Filtrování přes přirozený jazyk.

5. **„Co znamená status doplňkového textu = 9?"**
   Vysvětlí číselníky a logiku Heliosu.

## Co ET/HEL **NEUMÍ** (a proč)

Ze záměrnosti — bezpečnost vašich dat je priorita.

- ❌ **Mazat ani měnit data v Heliosu.** ET/HEL umí pouze číst.
- ❌ **Přistupovat k datům mimo Helios** (souborový systém, jiné aplikace, e-maily).
- ❌ **Spouštět vlastní SQL příkazy** mimo schválený seznam dotazů.
- ❌ **Posílat data ven** bez vašeho vědomí. Více v sekci [Bezpečnost](guide-it.md#co-se-posílá-ven).

Pokud potřebujete akci typu „uprav záznam", ET/HEL navrhne SQL a zeptá se vás, zda ho chcete spustit. **Bez vašeho kliknutí nic neudělá.**

## Tipy do začátku

- **Pište česky a přirozeně.** „Najdi mi faktury od září" funguje stejně dobře jako technické formulace.
- **Buďte konkrétní s časem a kontextem.** „Tento týden", „od dodavatele XY", „pro středisko 110" — čím přesněji, tím lepší odpověď.
- **Použijte follow-up otázky.** Po první odpovědi můžete pokračovat: „A z toho jen ty nezaplacené?" — ET/HEL si pamatuje kontext konverzace.
- **Když si nejste jistí, zeptejte se na strukturu.** „Které tabulky obsahují informace o platbách?" vám pomůže pochopit, kde co najít.

## Něco nefunguje? Máte nápad?

Napište nám na **[ethel@jakubsevela.cz](mailto:ethel@jakubsevela.cz)**. Reagujeme rychle a každá zpětná vazba pomáhá.

Pokud ET/HEL odpoví špatně nebo divně, dejte palec dolů přímo v chatu — pomůže nám to ladit přesnost.

---

**Další čtení:**
- [Návod pro IT administrátory](guide-it.md) — instalace, síťové požadavky, troubleshooting
- [Návod pro Helios partnery](guide-partner.md) — jak nabídnout ET/HEL klientům
- [ethel.cz](https://ethel.cz) — funkce, ceník, kontakt
