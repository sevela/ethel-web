# Instalace a správa Ethel

## Instalace a aktualizace

Aktuální soubor `Ethel.exe` a postup instalace najdete na stránce [Ke stažení](/download/).

Instalaci do databáze provádí člen role **sysadmin** na SQL Serveru přímo v aplikaci: **Nastavení → Správa → Databáze**. Pokud Ethel spouštíte z Heliosu, nejprve použijte **Přihlášení správce**.

Ve vybrané databázi instalace vytvoří:

- tabulky `Tabx_Ethel_*` pro nastavení, uživatele, přístupové profily, zakázané tabulky, audit oprávnění, kontext z Heliosu a provozní záznamy,
- procedury `epx_Ethel_*` pro práci s kontextem, uživatelským nastavením a scénáři `epx_Ethel_UseCase_*`,
- pohled `hvw_Ethel_Employees`, který z karty zaměstnance zpřístupní jen ID, osobní číslo a jméno,
- externí akci **Ethel** v nabídce **Doplňky → Ethel** se zkratkou **Ctrl+I** přibližně v 50 přehledech Heliosu. Její záznamy se ukládají do `TabExtKom`.

Kromě záznamů externí akce v `TabExtKom` instalace tabulky Heliosu nemění.

Na novou verzi upozorní správce pruh pod hlavičkou okna. Po spuštění aktualizace Ethel stáhne a ověří nový soubor, nahradí program a aktualizuje databázovou část. Předchozí soubor zůstane uložený jako `Ethel.exe.predchozi`.

## Pod jakým účtem Ethel pracuje

Způsob přihlášení Ethel převezme z `Helios.INI` a uloží do souboru `Ethel.ini` vedle programu jako `auth = sql` nebo `auth = windows`.

### Přihlášení přes SQL

Při instalaci vznikne SQL login pro danou instalaci. Jeho název začíná `ethel_` a pokračuje osmi znaky odvozenými z aktivačního klíče (tokenu). Najdete ho v `sys.server_principals`.

Heslo se z klíče odvozuje při každém spuštění. Samostatně se neukládá do databáze ani do souboru. Kdo má přístup ke klíči v `Ethel.ini`, může z něj odvodit také heslo. Přístup ke složce proto omezte na uživatele, kteří jej potřebují.

Při instalaci získá login:

- `SELECT` na schéma `dbo` v dané databázi,
- `EXECUTE` na provozní procedury Ethel pro nastavení, kontext přehledu a scénáře.

Účet nemůže přímo zapisovat do tabulek Heliosu. Zápisy probíhají prostřednictvím procedur scénářů po potvrzení uživatele.

Oprávnění `SELECT` na schéma `dbo` technicky zahrnuje všechny jeho tabulky. Další omezení přístupu uplatňuje Ethel na úrovni aplikace, jak je popsáno níže.

Instalace s různými aktivačními klíči mají vlastní loginy a navzájem si nepřepisují hesla. Starší instalace do verze 1.1.11 používaly společný login `ethel`. Aktualizace databázové části ho v dané databázi nahradí novým účtem. Do té doby jej nová verze programu používá jako záložní možnost.

Původní serverový login `ethel` odstraňte až po aktualizaci všech databází, které ho používají.

### Přihlášení účtem Windows

Samostatný SQL login se nevytváří. Ethel pracuje pod účtem Windows přihlášeného uživatele a používá jeho databázová oprávnění.

Pokud potřebná práva nemá, je nutné mu přidělit `SELECT` na schéma `dbo` a `EXECUTE` na příslušné procedury `epx_Ethel_*`.

### Spuštění bez Heliosu

Ethel lze spustit dvojklikem na `Ethel.exe`. Soubory `Helios.INI` a `Licence.ini` musí být vedle programu nebo o složku výš.

Uživatel se přihlásí svým jménem a heslem jako do Heliosu nebo účtem Windows. Dotazy v tomto režimu běží pod jeho účtem, nikoli pod SQL účtem Ethel. Uživatel zároveň musí mít používání Ethel povolené.

Způsob přihlášení nastavíte v **Nastavení → Správa → Licence a token → Přihlášení bez Heliosu**. V souboru `Ethel.ini` mu odpovídá klíč `prihlaseni`.

Na výběr jsou tři možnosti:

- **Výběr: jménem a heslem, nebo účtem Windows** (`prihlaseni = vyber`, výchozí) – způsob přihlášení si vybere uživatel,
- **Automaticky účtem Windows** (`prihlaseni = windows`) – vždy se použije účet Windows,
- **Jen jménem a heslem** (`prihlaseni = sql`) – vždy se zadává jméno a heslo.

Člen role **sysadmin**, včetně členství přes skupinu Windows, je zároveň správcem Ethel a má přístup k administračním částem nastavení.

## Minimální oprávnění a příklad SQL

Pokud používáte účet Windows, vlastní SQL účet nebo jste změnili oprávnění účtu Ethel, můžete potřebná práva nastavit následujícím skriptem. Upravte název databáze a do `@Ucet` zadejte název databázového uživatele.

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

Pokud účtu oprávnění chybí, Ethel popíše, co nelze provést. U čtení upozorní na chybějící přístup k tabulce, u scénáře na chybějící právo spustit proceduru.

## Oprávnění uvnitř Ethel

SQL Server určuje technická oprávnění účtu. Další pravidla pro jednotlivé uživatele nastavuje správce přímo v Ethel a aplikace je kontroluje při každém dotazu.

- **Nastavení → Správa → Uživatelé:** určuje, kdo smí Ethel používat. Uživatel s vypnutým přístupem ji nespustí.
- **Nastavení → Správa → Přístup k datům:** uživatel může mít přístup ke všemu kromě zakázaných oblastí, nebo pouze k tabulkám z přiřazených profilů. Noví uživatelé začínají ve druhém režimu a bez profilu nemají přístup k datům. Uživatelé ze starších instalací mohou mít první režim, proto zkontrolujte, zda vám vyhovuje. Profily mohou tabulky povolovat i zakazovat.
- **Nastavení → Správa → Audit:** zaznamenává změny režimu a přiřazených profilů u jednotlivých uživatelů včetně toho, kdo je provedl.
- **Citlivé moduly:** Mzdy, Personalistika a Banka jsou ve výchozím nastavení zamknuté v programu i cloudové službě. Odemkneme je na žádost firmy. Nápovědu k jejich používání může Ethel poskytovat i bez přístupu k datům.
- **Trvale zakázané tabulky:** zahrnují uživatele, role a oprávnění Heliosu, e-maily, datové schránky a vybrané systémové tabulky. Přístup k nim nelze povolit profilem.
- **Kontrola čtecích dotazů:** běžný dotaz smí obsahovat jediný příkaz `SELECT` (případně uvozený `WITH`). Zápisy probíhají odděleně přes připravené scénáře.

Tato pravidla fungují na úrovni aplikace. Pokud má účet na SQL Serveru širší oprávnění, Ethel je sama neodebere. Přístup k vybraným tabulkám můžete navíc zakázat přímo v databázi:

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

Použité vzory odpovídají tabulkám blokovaným aplikací. Před použitím je zkontrolujte podle své databáze Heliosu.

## Odinstalace

V **Nastavení → Správa → Databáze** zvolte u příslušné databáze **Odinstalovat**. Akci potvrdíte v dialogu, který uvádí název databáze.

Odinstalace odstraní externí akci Ethel, její procedury, funkce, pohledy, tabulky a databázového uživatele účtu Ethel. Nevratně se tím odstraní také nastavená oprávnění, audit a provozní záznamy uložené v těchto tabulkách.

Serverový login `ethel_…` zůstane zachovaný. Příkazem `DROP LOGIN` jej můžete odstranit, až ho nepoužívá žádná databáze.

## Zápisy do databáze a přenos dat do cloudu

Ethel ukládá vlastní nastavení a provozní údaje do tabulek `Tabx_Ethel_*`. Při instalaci zapisuje externí akci do `TabExtKom`. Údaje do běžných tabulek Heliosu zapisuje prostřednictvím procedur scénářů, vždy v rozsahu scénáře a po potvrzení uživatele.

Do cloudu se posílá otázka uživatele, vygenerované SQL a související informace potřebné pro zpracování. Výsledky běžných dotazů zůstávají u vás.

Některé funkce potřebují předat modelu další obsah, například definici sestavy pro vysvětlení, vloženou přílohu, názvy zboží pro překlad nebo data pro analytické shrnutí. Úplný přehled najdete na stránce [Bezpečnost](/bezpecnost/).
