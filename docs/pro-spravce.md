# Pro správce

## Instalace a aktualizace

Aktuální `Ethel.exe` a postup instalace najdete na stránce [Ke stažení](/download/). Do databáze Heliosu Ethel instaluje člen role **sysadmin** na SQL Serveru přímo v okně Ethel: **Nastavení → Správa → Databáze**. Když Ethel spouštíte z Heliosu, správce se nejdřív přihlásí v části **Přihlášení správce**.

Instalace do vybrané databáze vytvoří:

- tabulky `Tabx_Ethel_*` (nastavení, uživatelé Ethel, profily a přístup k datům, zakázané tabulky, audit změn práv, kontext z Heliosu, provozní záznam dotazů),
- procedury `epx_Ethel_*` (kontext z přehledu, uživatelská nastavení a scénáře `epx_Ethel_UseCase_*`),
- externí akci **Ethel** v menu **Doplňky** s klávesovou zkratkou **Ctrl+I** v cca 50 přehledech napříč Heliosem. Zapisuje ji do `TabExtKom`.

Kromě záznamů externí akce v `TabExtKom` instalace na tabulky Heliosu nesahá.

Novou verzi Ethel uvidí správce v proužku pod hlavičkou okna. Jedním kliknutím Ethel stáhne nový `Ethel.exe`, ověří jeho podpis, vymění ho a dohraje databázovou část. Předchozí verze zůstane vedle jako `Ethel.exe.predchozi`.

## Pod jakým účtem Ethel čte

Záleží na tom, jak se do Heliosu přihlašujete. Ethel to převezme z `Helios.INI` a zapíše do `Ethel.ini` vedle programu (`auth=sql` nebo `auth=windows`).

### Přihlášení SQL loginem (výchozí)

Instalace založí na serveru jeden login pro tuhle instalaci. Jmenuje se `ethel_` a osm znaků odvozených z aktivačního tokenu, najdete ho v `sys.server_principals`. Heslo se z tokenu odvozuje při každém spuštění a **nikde není uložené** – ani v databázi, ani v souboru. Kdo umí přečíst token v `Ethel.ini`, umí i heslo. Proto token patří do složky, kam vidí jen uživatelé Heliosu.

Login dostane při instalaci:

- `SELECT` na schéma `dbo` v dané databázi,
- `EXECUTE` na procedury Ethel, které volá za provozu (uživatelská nastavení, kontext z přehledu, scénáře).

Do tabulek Heliosu přímo zapisovat nemůže. Zápis jde jen přes procedury scénářů, a to až po potvrzení uživatele v okně Ethel. `SELECT` na `dbo` technicky pokrývá všechny tabulky, ale které z nich Ethel smí číst, hlídá sama (viz níže).

Každá databáze s vlastním tokenem má vlastní login, takže dvě instalace na jednom serveru si nepřepisují heslo. Starší instalace (do verze 1.1.11) používaly společný login `ethel`. Aktualizace databáze ho v dané databázi nahradí novým. Do té doby ho nová verze Ethel.exe používá jako zálohu. Serverový login `ethel` smažete sami, až budou všechny databáze na serveru aktualizované.

### Přihlášení účtem Windows

Žádný login se nezakládá. Ethel čte pod účtem Windows přihlášeného uživatele, tedy s právy, která ten účet v databázi má. Uživatel Heliosu je obvykle má. Když ne, potřebuje totéž, co login výše: `SELECT` na `dbo` a `EXECUTE` na `epx_Ethel_*`.

### Spuštění bez Heliosu

Ethel jde spustit i dvojklikem na `Ethel.exe` mimo Helios. `Helios.INI` a `Licence.ini` musí být vedle programu nebo o složku výš. Uživatel se přihlásí stejným jménem a heslem jako do Heliosu, nebo účtem Windows, a **dotazy běží pod tímhle účtem**, ne pod účtem Ethel. Kdo v Ethel není povolený, dovnitř nejde.

Jak se bez Heliosu přihlašuje, nastavíte v **Nastavení → Správa → Licence a token → Přihlášení bez Heliosu** (v `Ethel.ini` klíč `prihlaseni`): uživatel si vybere sám (výchozí), vždy účtem Windows, nebo vždy jménem a heslem.

Člen role `sysadmin`, i přes skupinu Windows, je zároveň správcem Ethel a vidí v Nastavení sekce správy.

## Minimální práva – hotové SQL

Pro účet, který nemá práva z instalace (Windows účet, vlastní účet uživatele, nebo když jste práva loginu Ethel upravili), stačí tohle. Za `@Ucet` dosaďte jméno principálu v databázi:

```sql
USE [HeliosData]  -- databáze Heliosu
DECLARE @Ucet sysname = N'ethel_xxxxxxxx'  -- nebo DOMENA\uzivatel

DECLARE @Sql nvarchar(max) = N''
SET @Sql = N'GRANT SELECT ON SCHEMA::dbo TO ' + QUOTENAME(@Ucet) + N';'
SELECT @Sql = @Sql + N'GRANT EXECUTE ON ' + QUOTENAME(SCHEMA_NAME(schema_id)) + N'.' + QUOTENAME(name) + N' TO ' + QUOTENAME(@Ucet) + N';'
FROM sys.procedures
WHERE name LIKE N'epx[_]Ethel[_]%'
EXEC sp_executesql @Sql
```

Když právo chybí, Ethel to neskryje: u dotazu na tabulku bez práva odpoví, že účet nemá na SQL Serveru právo tuhle tabulku číst, a u scénáře, že nemá právo spustit proceduru. Žádný prázdný výsledek, žádná obecná chyba.

## Co si Ethel hlídá sama

Práva na SQL Serveru říkají, co účet *může*. Co uživatel v Ethel *smí*, se nastavuje v okně Ethel a hlídá to Ethel sama, dotaz po dotazu:

- **Nastavení → Správa → Uživatelé**: kdo smí Ethel používat. Odškrtnutý uživatel Ethel nespustí.
- **Nastavení → Správa → Přístup k datům**: každý uživatel má jeden ze dvou režimů – *vidí všechno kromě zakázaného*, nebo *vidí jen tabulky z přiřazených profilů*. Nově přidaný uživatel začíná ve druhém režimu, takže bez profilu nevidí nic. Uživatelé z instalací před zavedením profilů mají první režim. Zkontrolujte, jestli vám tak vyhovuje. Profil může tabulky povolovat i zakazovat.
- **Nastavení → Správa → Audit**: každá změna práv s tím, kdo ji udělal.
- **Citlivé moduly**: Mzdy, Personalistika a Banka jsou ve výchozím stavu zamčené, a to v programu u vás i ve službě Ethel v cloudu. Na žádost firmy je zapneme. Dokud jsou zamčené, Ethel s postupem v nich poradí podle nápovědy Heliosu, jejich data nečte.
- **Zakázané tabulky pro všechny**: uživatelé, role a práva Heliosu, e-maily, datové schránky a několik systémových tabulek. Profilem je povolit nejde.
- **Jen jeden dotaz SELECT**: program Ethel u vás pustí do databáze jen jediný čtecí dotaz, nic jiného.

Tohle je aplikační vrstva. Když udělíte účtu širší práva, než Ethel potřebuje, druhý zámek na úrovni databáze Ethel sama nepřidá. Kdo chce tvrdší zámek, může citlivé a zakázané tabulky zakázat i na SQL Serveru:

```sql
USE [HeliosData]
DECLARE @Ucet sysname = N'ethel_xxxxxxxx'
DECLARE @Sql nvarchar(max) = N''
SELECT @Sql = @Sql + N'DENY SELECT ON dbo.' + QUOTENAME(name) + N' TO ' + QUOTENAME(@Ucet) + N';'
FROM sys.tables
WHERE name LIKE N'TabMz%' OR name LIKE N'TabZamMzd%' OR name = N'TabZamDan'
   OR name LIKE N'TabZamRPr%' OR name = N'TabZamVyp' OR name LIKE N'TabTar%'
   OR name LIKE N'TabZadVyp%' OR name LIKE N'TabPer%' OR name = N'TabCisZam'
   OR name IN (N'TabBankVypisH', N'TabBankVypisR', N'TabDefPlatPrik', N'TabSTDLeaUhradyB')
   OR name LIKE N'TabPlat%'
   OR name IN (N'TabUziv', N'TabUserCfg', N'TabRole', N'TabSouhlasy', N'TabDatoveSchranky', N'TabEmail', N'TabEMailProfil')
   OR name LIKE N'TabPrava%'
EXEC sp_executesql @Sql
```

Vzory odpovídají tomu, co Ethel zakazuje sama. Upravte je podle svého Heliosu.

## Odinstalace

V **Nastavení → Správa → Databáze** je u každé databáze tlačítko **Odinstalovat**, které potvrdíte jménem databáze. Odinstalace smaže externí akci Ethel, procedury, funkce a tabulky Ethel a databázového uživatele loginu Ethel. Nevratně tím zmizí i nastavená práva, audit a provozní záznam dotazů. Serverový login `ethel_…` zůstává – smažete ho příkazem `DROP LOGIN`, až ho nepoužívá žádná databáze.

## Co Ethel zapisuje a co odchází do cloudu

Do databáze Heliosu Ethel zapisuje do vlastních tabulek `Tabx_Ethel_*`, při instalaci externí akci do `TabExtKom` a přes procedury scénářů po potvrzení uživatele to, co scénář zakládá (třeba novou organizaci).

Do cloudu odchází dotaz uživatele, vygenerované SQL a spotřeba tokenů. Výsledky běžných dotazů ne. Výjimky: při vysvětlení sestavy, sloupce nebo databázového objektu jde k modelu jeho definice, a k modelu jdou i přílohy, které uživatel sám vloží. Podrobně na stránce [Bezpečnost](/bezpecnost/).
