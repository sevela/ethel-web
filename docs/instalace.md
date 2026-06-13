# Instalace a správa Ethel

Pro IT administrátory. Cíl: bezpečné nasazení do produkce řádově za hodinu. Co se kde děje, je popsané – žádná magie.

## Předpoklady

| Vyžadováno | Detail |
|---|---|
| Helios iNuvio | Aktuální verze (LTS i běžná). Pro Helios Easy/Green se ozvěte. |
| MS SQL Server | 2016 nebo novější |
| ODBC Driver | Doporučeno 17 nebo 18 for SQL Server; Ethel si driver vybere automaticky (zvládne i SQL Server Native Client) |
| Práva na SQL pro instalaci | `sysadmin` (jednorázově – instalace vytváří SQL login a registruje akce) |
| Přístup na server s Heliosem | Pro umístění `Ethel.exe` |
| Síť | HTTPS výstup na `proxy.ethel.cz` a `app.ethel.cz` (port 443) – z Helios serveru i klientských stanic |
| Aktivační token | UUID, přijde e-mailem po objednávce nebo aktivaci trialu |

## Jak to funguje

```
[Klient s Heliosem]
        │  CTRL+I → Ethel.exe (lokálně, Tauri/WebView2)
        │
        ├──→ [SQL Server lokálně]   ← SQL se spouští tady, data nikdy neopustí server
        │
        └──→ HTTPS → app.ethel.cz (chat UI) → proxy.ethel.cz (backend)
                          │
                          └──→ Claude API (Anthropic)
```

**Princip:** SQL se generuje v cloudu, ale spouští se **lokálně** na vašem SQL Serveru. Výsledky dotazu zůstávají u vás – cloud vidí jen dotaz uživatele a vygenerované SQL, nikdy hodnoty z databáze. Podrobně v [Bezpečnosti](/bezpecnost).

## Instalace

### Krok 1 – Stáhnout a umístit `Ethel.exe`

Po objednávce dostanete odkaz na aktuální verzi. Soubor má cca 12 MB (jeden spustitelný soubor, bez závislostí). Umístěte ho do **stejné složky jako `Helios.exe`** (typicky `C:\Helios\` nebo `C:\Program Files\Asseco\HELIOS iNuvio\`).

### Krok 2 – Spustit průvodce instalací

Spusťte `Ethel.exe` bez parametrů – otevře se průvodce:

1. **Aktivační token** a **přihlášení administrátora k SQL Serveru** (SQL login s dostatečnými právy, nebo Windows autentizace). Vyberete také, jak se má Ethel k databázi připojovat při provozu – přes vytvořený SQL login `ethel`, nebo Windows autentizací.
2. **Výběr databází** Helios, kde má Ethel fungovat (i více najednou).
3. **Výběr uživatelů** pro každou databázi – kdo bude mít k Ethel přístup.
4. **Instalace** – průvodce sám vytvoří:
   - tabulky `Tabx_Ethel_*` (konfigurace, log, denylist, uživatelé, kontext),
   - SQL login `ethel` s právem **jen pro čtení** (a spuštění Ethel procedur),
   - pomocné procedury a **akce v Heliosu** (viz Krok 3).

### Krok 3 – Hotovo

Po instalaci jsou v podporovaných přehledech Heliosu automaticky akce **ET/HEL** pod zkratkou **CTRL+I**. **Nic ručně nenastavujete** – žádná konfigurace zkratek, žádná příkazová řádka. Průvodce nabídne spuštění Heliosu.

## Bezpečnost a přístup k datům

Bezpečnost je vynucena na několika vrstvách:

- **Jen pro čtení.** Ethel agent spustí pouze dotaz začínající `SELECT` nebo `WITH`. Cokoliv s `INSERT/UPDATE/DELETE/DROP/EXEC/…` (i schované přes `SELECT … INTO` nebo `sp_`/`xp_` procedury) je zablokováno ještě před odesláním na SQL Server.
- **SQL login bez práv k zápisu.** Login `ethel` má `GRANT SELECT` – fyzicky nemůže měnit data.
- **Předvyplněný denylist.** Tabulka `Tabx_Ethel_Deny` je už po instalaci naplněná citlivými oblastmi: **Mzdy, Personalistika, Banka, platební příkazy, uživatelská práva, souhlasy/GDPR, e-maily**. Ethel o nich negeneruje SQL.
- **Whitelist v cloudu.** Backend pracuje jen se schválenými tabulkami znalostní báze – co v ní není (typicky výše uvedené moduly), neprojde.
- **Limit výsledku** 500 řádků na dotaz.

### Doplnění vlastních citlivých tabulek

Základ je pokrytý. Když chcete zakázat další tabulku, přidejte záznam do `Tabx_Ethel_Deny`:

```sql
-- Zakázat celou tabulku všem uživatelům
INSERT INTO Tabx_Ethel_Deny (LoginName, TableName) VALUES ('*', 'NazevTabulky');
```

## Ověření po instalaci

Otevřete Helios, stiskněte **CTRL+I** a vyzkoušejte:

1. **Že Ethel funguje** – položte reálný dotaz, např. „Kolik máme organizací v databázi?" Měla by přijít odpověď s číslem (ověří celý řetězec: akce → agent → SQL → odpověď).
2. **Že denylist drží** – zeptejte se na zakázanou oblast, např. „Vypiš mzdy zaměstnanců." Ethel odpoví, že na mzdová data nemá přístup.

## Síťové požadavky

| Cíl | Port | Účel |
|---|---|---|
| `app.ethel.cz` | 443 (HTTPS) | Chat UI (načtení do WebView2) |
| `proxy.ethel.cz` | 443 (HTTPS) | Backend → Claude API |

**Firewall:** při striktním whitelistu povolte obě domény z Helios serveru i klientských stanic. Dostupnost backendu ověříte přes `https://proxy.ethel.cz/health` (vrací HTTP 200 se stavem).

**Proxy:** Ethel respektuje systémovou proxy konfiguraci Windows.

## Správa a provoz

### Aktualizace

Aktualizace probíhá výměnou souboru: stáhněte nový `Ethel.exe` a přepište stávající. Konfigurace v `Tabx_Ethel_*` zůstává – žádný re-install. (Helios při tom nemusí být zavřený, ale doporučujeme.)

### Licence a platnost

Trial má 14 dní, placené tokeny dle předplatného. Po vypršení Ethel zobrazí hlášku o vypršení platnosti a odkáže na ethel.cz. Pro obnovu napište na [info@ethel.cz](mailto:info@ethel.cz).

### Správa uživatelů

Přidat nebo odebrat uživatele lze opětovným spuštěním průvodce (`Ethel.exe` bez parametrů) a úpravou výběru, nebo přímo v `Tabx_Ethel_Users`.

## Řešení potíží

**Ethel se nepřipojí k SQL Serveru** → Zkontrolujte dostupnost ODBC driveru (`odbcad32.exe`). Ethel si driver vybírá automaticky (17/18, případně Native Client).

**Vypršela platnost** → Trial má 14 dní. Pro obnovení napište na [info@ethel.cz](mailto:info@ethel.cz).

**Helios neumí spustit `Ethel.exe`** → Některé instalace blokují externí exe. Povolte přes uživatelskou akci „Externí program" nebo v `Helios.INI`.

**Firewall blokuje backend** → Ověřte `https://proxy.ethel.cz/health` z Helios serveru (má vrátit HTTP 200).

**Ethel odpovídá pomalu (> 10 s)** → Při prvním dotazu je odezva delší (zahřátí cache), další jsou rychlé. Zkontrolujte latenci na `proxy.ethel.cz` a velikost databáze.

---

**Další čtení:**

- [První kroky](/docs/prvni-kroky) – pošlete kolegům, kteří budou s Ethel pracovat
- [Bezpečnost](/bezpecnost) – verze pro IT manažery a ředitele

**Kontakt:** [info@ethel.cz](mailto:info@ethel.cz)
