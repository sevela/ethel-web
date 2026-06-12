# Instalace Ethel

Pro IT administrátory. Cíl: bezpečné nasazení do produkce za hodinu. Bez surovostí, bez magie – co se kde děje, je popsané.

## Předpoklady

| Vyžadováno | Detail |
|---|---|
| Helios Inuvio | Aktuální verze (LTS i běžná). Pro Helios Easy/Green se ozvěte. |
| MS SQL Server | 2016 nebo novější (testujeme až do 2022; 2025 viz [changelog](/docs/changelog)) |
| ODBC Driver | 17 nebo 18 for SQL Server |
| Práva na SQL | `sysadmin` nebo `db_owner` cílových databází (jednorázově pro instalaci) |
| Přístup na server s Helios | Pro umístění `Ethel.exe` |
| Síť | HTTPS výstup na `api.ethel.cz` a `app.ethel.cz` (port 443) – z Helios serveru i klientských stanic |
| Aktivační token | UUID, přijde e-mailem po objednávce nebo aktivaci trialu |

## Architektura ve zkratce

```
[Klient s Heliosem]
        │
        │  CTRL+I → Ethel.exe (lokálně, Tauri/WebView2)
        │
        ├──→ [SQL Server lokálně]   ← data nikdy neopouští server
        │
        └──→ HTTPS → [api.ethel.cz]  ← jen metadata + dotaz uživatele
                          │
                          └──→ Claude API (Anthropic)
```

**Princip:** SQL se generuje v cloudu, spouští se lokálně. Hodnoty z databáze cloud nikdy nevidí. Podrobněji viz [Bezpečnostní architektura](/bezpecnost).

## Krok 1 – Stáhnout `Ethel.exe`

Po objednávce dostanete odkaz na aktuální verzi. Soubor má cca 12 MB (Tauri/Rust, vše statické – žádné závislosti).

Doporučené umístění: **stejná složka jako `Helios.exe`** (typicky `C:\Helios\` nebo `C:\Program Files\Asseco\HELIOS iNuvio\`).

## Krok 2 – Spustit `Ethel.exe` bez parametrů

Bez parametrů `Ethel.exe` otevře instalační wizard:

1. **Aktivační token** (UUID, např. `e33de134-...`)
2. **Přihlášení k SQL Serveru** – SQL login s odpovídajícími právy, nebo Windows autentizace
3. **Výběr databází** Helios, kde má Ethel fungovat (lze i víc najednou)
4. **Výběr uživatelů per databáze** – kteří mají mít přístup (volitelně všichni)
5. **Automatické vytvoření**:
   - Tabulek `Tabx_Ethel_*` v cílových databázích (Log, Token, Deny, KB)
   - SQL loginu pro Ethel agenta
   - Práv na čtení a logování

Po dokončení wizard nabídne spuštění Heliosu.

## Krok 3 – Konfigurace klávesové zkratky v Heliosu

Pro otevření Ethel z Heliosu se používá uživatelská akce:

```
Ethel.exe --database <NázevDB> --token <token>
```

S kontextem aktuálního záznamu (Ethel pak ví, na co se uživatel dívá):

```
Ethel.exe --database <NázevDB> --token <token> --id 123 --browse-id 456 --table TabDoklady
```

Klávesovou zkratku (doporučujeme **CTRL+I**) nastavíte standardní cestou: **Možnosti → Konfigurace uživatelských zkratek**.

## Krok 4 – Denylist citlivých dat

Než pustíte Ethel k uživatelům, doplňte do `Tabx_Ethel_Deny` zápisy pro tabulky, ke kterým Ethel nemá mít přístup:

```sql
-- Zakázat celou tabulku
INSERT INTO Tabx_Ethel_Deny (TableName, ColumnName) VALUES ('TabMzdyZam', '*');

-- Zakázat jen konkrétní sloupec
INSERT INTO Tabx_Ethel_Deny (TableName, ColumnName) VALUES ('TabCisZam', 'RodneCislo');
```

Standardně mimo znalostní bázi: Mzdy, Personalistika, Banka. Doplňte vlastní citlivé tabulky.

## Krok 5 – Test

Otevřete Helios, stiskněte CTRL+I, položte testovací dotaz:

> „Které tabulky vidíš?"

Ethel vrátí seznam tabulek, ke kterým má přístup. Ověřte, že tam nejsou tabulky z denylistu. Pokud ano, zkontrolujte `Tabx_Ethel_Deny`.

## Síťové požadavky

| Cíl | Port | Účel |
|---|---|---|
| `api.ethel.cz` | 443 (HTTPS) | Backend proxy → Claude API |
| `app.ethel.cz` | 443 (HTTPS) | Chat UI (load do WebView2) |

**Firewall:** při striktním whitelistu povolte výše uvedené domény z Helios serveru i klientských stanic.

**Proxy:** Ethel respektuje systémovou proxy konfiguraci Windows. Pro vlastní proxy nastavení se ozvěte.

## Aktualizace

Průběžné aktualizace jsou součástí předplatného. Notifikaci dostanete e-mailem nebo přímo v chatu (banner „Nová verze k dispozici").

Postup:

1. Stáhnout nový `Ethel.exe` z odkazu v notifikaci.
2. Přepsat starý exe (Helios při aktualizaci nemusí být zavřený, ale doporučujeme).
3. Konfigurace v `Tabx_Ethel_*` zůstává – žádný re-install.

## Bezpečnostní checklist před produkčním nasazením

- [ ] `Tabx_Ethel_Deny` obsahuje všechny citlivé tabulky
- [ ] Aktivační token uložen na bezpečném místě (ne ve sdílené složce)
- [ ] HTTPS přístup na `api.ethel.cz` ověřen z Helios serveru (`curl -I https://api.ethel.cz/health` vrací HTTP 200)
- [ ] Test dotaz „Které tabulky vidíš?" – odpověď neobsahuje denylistované tabulky
- [ ] `Tabx_Ethel_Log` zařazen do retenčního plánu (doporučeno 90 dnů)
- [ ] Klávesová zkratka v Heliosu funguje pro všechny schválené uživatele

## Troubleshooting

**Ethel se nepřipojí k SQL Serveru**
→ Zkontrolujte ODBC Driver 17/18 (`odbcad32.exe`). Ethel si driver vybere automaticky.

**„Token expired"**
→ Trial má 14 dní, placené tokeny podle předplatného. Pro obnovení napište na [info@ethel.cz](mailto:info@ethel.cz).

**Helios neumí spustit `Ethel.exe`**
→ Některé instalace blokují externí exe. Povolte přes uživatelskou akci „Externí program" nebo v `Helios.INI`.

**Firewall blokuje `api.ethel.cz`**
→ `curl -I https://api.ethel.cz/health` z Helios serveru, mělo by vrátit HTTP 200.

**Ethel odpovídá pomalu (> 10 s)**
→ Zkontrolujte latenci na `api.ethel.cz` a velikost vaší databáze. Při velkém DDL je první dotaz pomalejší (cache warm-up), další jsou rychlé.

**„Nerozumím dotazu"**
→ Zformulujte konkrétněji nebo se zeptejte na strukturu: „Kde najdu informace o XY?" Ethel pak vysvětlí, kterou tabulku použít.

Více řešení viz [stránku Bezpečnost](/bezpecnost).

---

**Další čtení:**

- [První kroky](/docs/prvni-kroky) – pošlete kolegům, kteří budou s Ethel pracovat
- [Stránka Bezpečnost](/bezpecnost) – verze pro IT manažery a ředitele

**Kontakt:** [info@ethel.cz](mailto:info@ethel.cz)
