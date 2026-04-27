# ET/HEL – Návod pro IT administrátory

Technický průvodce instalací a provozem ET/HEL ve vaší firmě. Cíl: bezpečné nasazení do hodiny.

## Předpoklady

- **Helios iNuvio** běžící na **MS SQL Server 2016 nebo novějším**.
- Přístup k SQL Serveru s právy na **vytvoření tabulek a SQL loginu** (sysadmin nebo db_owner cílové databáze).
- Přístupy k **serveru, kde běží Helios** – pro umístění `Ethel.exe`.
- **HTTPS přístup** ven na `api.ethel.cz` (port 443) z Helios serveru i klientských stanic.
- **Aktivační token** od ET/HEL (přijde e-mailem po objednávce nebo aktivaci trialu).

## Architektura ve zkratce

```
[Klient s Heliosem]
        │
        │  CTRL+I → Ethel.exe (lokálně, frameless WebView2)
        │
        ├──→ [SQL Server lokálně]   ← data nikdy neopouští server
        │
        └──→ HTTPS → [api.ethel.cz]  ← jen metadata + dotaz uživatele
                          │
                          └──→ Claude API (Anthropic)
```

**Klíčový princip:** Reálná data zůstávají na vašem SQL Serveru. Do cloudu jdou pouze:
- Text dotazu uživatele („Kolik faktur jsme vystavili?")
- Struktura databáze (názvy tabulek a sloupců, typy)
- Vygenerovaný SQL dotaz

Hodnoty z databáze se **nikdy** neposílají do Anthropic API.

## Instalace – krok za krokem

### 1. Stáhnout `Ethel.exe`

Po objednávce dostanete odkaz na aktuální verzi exe. Soubor má cca 12 MB, žádné závislosti (Tauri/Rust, vše statické).

Doporučené umístění: **stejná složka jako `Helios.exe`** (typicky `C:\Helios\` nebo `C:\Program Files\Asseco\HELIOS iNuvio\`).

### 2. Spustit Ethel.exe bez parametrů

Spuštění bez parametrů otevře instalační wizard:

1. **Zadání aktivačního tokenu** (formát UUID, např. `e33de134-...`)
2. **Přihlášení k SQL Serveru** – buď SQL login s odpovídajícími právy, nebo Windows autentizace
3. **Výběr Helios databází**, kde má ET/HEL fungovat (lze více najednou)
4. **Výběr uživatelů per databáze** – kteří mají mít přístup k ET/HEL (volitelně všichni)
5. **Vytvoření**:
   - Tabulek `Tabx_Ethel_*` v cílových databázích
   - SQL loginu pro ET/HEL agenta
   - Práv na čtení (a logování)

Po dokončení wizard nabídne spuštění Heliosu.

### 3. Konfigurace klávesové zkratky v Heliosu

Pro otevření ET/HEL z Heliosu se používá uživatelská akce:

```
Ethel.exe --database <NázevDB> --token <token>
```

S kontextem aktuálního záznamu:

```
Ethel.exe --database <NázevDB> --token <token> --id 123 --browse-id 456 --table TabDoklady
```

Klávesovou zkratku (CTRL+I doporučujeme) nastavíte standardní cestou v Heliosu: **Možnosti → Konfigurace uživatelských zkratek**.

## Síťové požadavky

| Cíl | Port | Účel |
|---|---|---|
| `api.ethel.cz` | 443 (HTTPS) | Backend proxy → Claude API |
| `app.ethel.cz` | 443 (HTTPS) | Chat UI (load do WebView2) |
| `fonts.googleapis.com`, `fonts.gstatic.com` | 443 | Webfonty |

**Firewall**: pokud používáte striktní whitelist, povolte výše uvedené domény z **Helios serveru i klientských stanic**.

**Proxy**: ET/HEL respektuje systémovou proxy konfiguraci Windows. Pro vlastní proxy nastavení kontaktujte podporu.

## Co se posílá ven

Plná transparentnost – toto opouští váš server směrem na `api.ethel.cz`:

✅ **Posíláme:**
- Textový dotaz uživatele
- Strukturu databáze (DDL – názvy tabulek/sloupců/typů)
- Vygenerovaný SQL dotaz (pro audit)
- Aktivační token (autentizace)
- Anonymní telemetrii (čas odpovědi, počet tokenů)

❌ **NEposíláme:**
- Hodnoty z databázových řádků
- Žádné údaje o vašich klientech, fakturách, zboží
- Nic, co byste neviděli v `EXEC sp_help` nebo `INFORMATION_SCHEMA`

SQL dotaz se vykoná **lokálně** na vašem serveru, výsledek se zformátuje **lokálně** a teprve formátovaný text se zobrazí v ET/HEL chatu (uvnitř WebView2 okna na klientské stanici).

## Logování

Vše se loguje do tabulek `Tabx_Ethel_*` ve vaší databázi:

- **`Tabx_Ethel_Log`** – kompletní auditní stopa: kdo, kdy, jaký dotaz, jaké SQL, jak dlouho trvalo
- **`Tabx_Ethel_Token`** – aktivní tokeny, prošlé tokeny
- **`Tabx_Ethel_Deny`** – blacklist tabulek/sloupců, ke kterým ET/HEL nesmí přistupovat (citlivá data, mzdy, osobní údaje)

Logy jsou ve **vaší databázi** – máte plnou kontrolu nad retencí, exportem, GDPR mazáním.

## Citlivá data – denylist

Pro ochranu citlivých sloupců (mzdy, osobní údaje, hesla) doplňte do `Tabx_Ethel_Deny` zápisy:

```sql
-- Příklad: zakázat celou tabulku
INSERT INTO Tabx_Ethel_Deny (TableName, ColumnName) VALUES ('TabMzdyZam', '*');

-- Příklad: zakázat jen konkrétní sloupec
INSERT INTO Tabx_Ethel_Deny (TableName, ColumnName) VALUES ('TabCisZam', 'RodneCislo');
```

ET/HEL pak tyto tabulky/sloupce vůbec nezahrne do své znalosti databáze.

## Troubleshooting

**ET/HEL se nepřipojí k SQL Serveru**
→ Zkontrolujte, zda je nainstalovaný **ODBC Driver 17 nebo 18 for SQL Server** (`odbcad32.exe`). ET/HEL si driver vybere automaticky.

**„Token expired" hláška**
→ Trial má 14 dní, placené tokeny jsou aktivní podle předplatného. Kontaktujte [ethel@jakubsevela.cz](mailto:ethel@jakubsevela.cz) pro obnovení.

**Helios neumí spustit `Ethel.exe`**
→ Některé instalace Heliosu zakazují spouštění externích exe. Povolte ho v `Helios.INI` nebo přes uživatelskou akci typu „Externí program".

**Firewall blokuje `api.ethel.cz`**
→ Otestujte z Helios serveru: `curl -I https://api.ethel.cz/health`. Mělo by vrátit HTTP 200.

**ET/HEL odpovídá pomalu**
→ Standardně 2–5 s. Pokud trvá víc, zkontrolujte latenci na `api.ethel.cz` (typicky pod 150 ms ze střední Evropy) a velikost vaší databáze (čím větší DDL, tím delší cache warm-up).

**Chat říká „Nerozumím dotazu"**
→ Zformulujte konkrétněji nebo se zeptejte na strukturu: „Kde najdu informace o XY?" ET/HEL pak vysvětlí, kterou tabulku použije.

## Aktualizace

Průběžné aktualizace jsou součástí předplatného. Notifikaci dostanete e-mailem nebo přímo v chatu (banner „Nová verze k dispozici").

Postup aktualizace:
1. Stáhnout nový `Ethel.exe` z odkazu v notifikaci.
2. Přepsat starý exe (Helios při aktualizaci nemusí být zavřený, ale doporučujeme).
3. Konfigurace v `Tabx_Ethel_*` zůstává – žádný re-install není potřeba.

## Bezpečnostní checklist před nasazením do produkce

- [ ] `Tabx_Ethel_Deny` obsahuje všechny citlivé tabulky (mzdy, osobní údaje, klíče)
- [ ] Aktivační token uložen na bezpečném místě (ne ve sdílené složce)
- [ ] HTTPS přístup na `api.ethel.cz` ověřen z Helios serveru
- [ ] Vyzkoušený test dotaz: „Které tabulky vidíš?" – odpověď neobsahuje denylistované tabulky
- [ ] GDPR – `Tabx_Ethel_Log` zařazen do retenčního plánu (doporučeno 90 dnů)

## Kontakt

- **Podpora**: [ethel@jakubsevela.cz](mailto:ethel@jakubsevela.cz) (typická odezva do 24 hodin v pracovní dny)
- **Web**: [ethel.cz](https://ethel.cz)
- **Statusová stránka**: zatím neveřejná – incidenty hlásíme e-mailem všem zákazníkům

---

**Další čtení:**
- [Rychlý start pro koncové uživatele](quickstart.md) – pošlete kolegům
- [Návod pro Helios partnery](guide-partner.md) – pokud ET/HEL nasazujete u klientů jako služba
