# Ethel pro správce: účty a práva

Tenhle návod je pro správce Heliosu nebo SQL Serveru. Říká, pod jakým účtem Ethel čte z databáze, jaká práva k tomu potřebuje a co si hlídá sama. Uživatelský návod je v [Prvních krocích](prvni-kroky.md).

## Co instalace udělá

Aktuální `Ethel.exe` a postup instalace najdete na stránce [Ke stažení](/download/). Ethel instaluje správce s rolí **sysadmin** na SQL Serveru přímo v okně Ethel: **Nastavení → Databáze**. Instalace do vybrané databáze Heliosu vytvoří:

- tabulky `Tabx_Ethel_*` (nastavení uživatelů, profily práv, audit změn práv, kontext z Heliosu, uživatelská nastavení),
- procedury `epx_Ethel_*` (uložení kontextu z přehledu, nastavení uživatele a scénáře `epx_Ethel_UseCase_*`),
- externí akci **Ethel** v menu Heliosu, která okno otevírá.

Instalace nesahá na žádnou tabulku Heliosu. Aktualizaci databázové části spouští stejný správce ze stejného místa; nic se neděje samo.

## Pod jakým účtem Ethel čte

Záleží na tom, jak se do Heliosu přihlašujete. Ethel to převezme z `Helios.INI` a zapíše do `Ethel.ini` vedle programu (`auth=sql` nebo `auth=windows`).

### Přihlášení SQL loginem (výchozí)

Instalace založí na serveru jeden login pro tuhle instalaci. Jmenuje se `ethel_` a osm znaků odvozených z aktivačního tokenu, najdete ho v `sys.server_principals`. Heslo se z tokenu odvozuje při každém spuštění a **nikde není uložené** – ani v databázi, ani v souboru. Kdo umí přečíst token v `Ethel.ini`, umí i heslo; proto token patří do složky, kam vidí jen uživatelé Heliosu.

Login dostane při instalaci:

- `SELECT` na schéma `dbo` v dané databázi,
- `EXECUTE` na procedury `epx_Ethel_*` (uživatelská nastavení a scénáře).

Nic víc. Zapisovat do tabulek Heliosu nemůže; zápis jde jen přes schválené procedury scénářů, a to až po potvrzení uživatele v okně Ethel.

Každá databáze s vlastním tokenem má vlastní login, takže dvě instalace na jednom serveru si nepřepisují heslo. Starší instalace (do verze 1.1.11) používaly společný login `ethel` – aktualizace databáze ho v dané databázi nahradí novým; serverový login `ethel` zůstává, dokud ho nesmažete sami, až ho nepoužívá žádná databáze.

### Přihlášení účtem Windows

Žádný login se nezakládá. Ethel čte pod účtem Windows přihlášeného uživatele, tedy s právy, která ten účet v databázi má. Uživatel Heliosu je obvykle má; když ne, potřebuje totéž, co login výše: `SELECT` na `dbo` a `EXECUTE` na `epx_Ethel_*`.

### Spuštění bez Heliosu

Ethel jde spustit i dvojklikem na `Ethel.exe` mimo Helios (jiný stroj, zástupce na ploše; soubory Heliosu musí být vedle). Uživatel se přihlásí stejným jménem a heslem jako do Heliosu, nebo účtem Windows, a **dotazy běží pod tímhle účtem**, ne pod účtem Ethel. Kdo v Ethel není povolený, dovnitř nejde. Člen role `sysadmin` je zároveň správcem Ethel a vidí v Nastavení sekce správy.

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

- **Nastavení → Uživatelé**: kdo smí Ethel používat.
- **Nastavení → Přístup k datům**: profily práv a tabulky, které uživatel vidí. Uživatel bez profilu nevidí nic.
- **Citlivé moduly** – Mzdy, Personalistika a Banka – jsou ve výchozím stavu zamčené pro všechny. Zpřístupnit je můžete vybraným uživatelům přes práva a profily. Dokud jsou zamčené, Ethel nad nimi negeneruje dotazy; postup z nápovědy Heliosu poradí, data ne.

Tohle je aplikační vrstva. Když udělíte účtu širší práva, než Ethel potřebuje, druhý zámek na úrovni databáze Ethel sama nepřidá. Kdo chce tvrdší zámek, může citlivé tabulky zakázat i na SQL Serveru – Ethel se pak k nim nedostane, ani kdyby ji o to model požádal:

```sql
USE [HeliosData]
DECLARE @Ucet sysname = N'ethel_xxxxxxxx'
DECLARE @Sql nvarchar(max) = N''
SELECT @Sql = @Sql + N'DENY SELECT ON dbo.' + QUOTENAME(name) + N' TO ' + QUOTENAME(@Ucet) + N';'
FROM sys.tables
WHERE name LIKE N'TabMz%' OR name LIKE N'TabZamMzd%' OR name = N'TabZamDan'
   OR name LIKE N'TabZamRPr%' OR name = N'TabZamVyp' OR name LIKE N'TabTar%'
   OR name LIKE N'TabZadVyp%' OR name LIKE N'TabPer%' OR name = N'TabCisZam'
   OR name LIKE N'TabBankVypis%' OR name LIKE N'TabPlatPrik%'
EXEC sp_executesql @Sql
```

Vzory odpovídají tomu, co Ethel vylučuje sama; upravte je podle svého Heliosu.

## Odinstalace

**Nastavení → Databáze → Odinstalovat** smaže tabulky a procedury Ethel z databáze a databázového uživatele loginu Ethel. Serverový login `ethel_…` zůstává – smažete ho příkazem `DROP LOGIN`, až ho nepoužívá žádná databáze. Externí akci v menu Heliosu odebere odinstalace také.

## Co Ethel z databáze zapisuje a kam

Do databáze Heliosu Ethel zapisuje jen do vlastních tabulek `Tabx_Ethel_*` a přes procedury scénářů. Do cloudu odchází dotaz uživatele, vygenerované SQL a spotřeba tokenů; výsledek dotazu nikdy. Podrobně na stránce [Bezpečnost](/bezpecnost).
