# ET/HEL – Návod pro Helios partnery

Průvodce pro implementační partnery Heliosu, kteří chtějí ET/HEL nabízet svým klientům jako přidanou hodnotu k vlastním službám.

## Co je ET/HEL pro vašeho klienta

**ET/HEL = AI asistentka přímo v Heliosu iNuvio.** Místo proklikávání sestav se uživatel zeptá česky a dostane odpověď.

Pro klienta to znamená:
- **Operativa a účetní** najdou informace bez čekání na IT
- **Management** dostane provozní přehled jedním dotazem
- **Noví kolegové** se rychleji zorientují v Heliosu – ET/HEL vysvětluje sestavy a pole

Pro vás jako partnera to znamená:
- **Méně nudných tiketů** typu „kde najdu fakturu od XY"
- **Vyšší value** ve vaší implementaci – Helios + AI vrstva
- **Možnost provize** za zprostředkování (viz partnerský program níže)

## Jak to funguje (1 odstavec)

ET/HEL je nativní Windows aplikace (Tauri/Rust, ~12 MB), která se spouští z Heliosu klávesovou zkratkou. SQL dotazy běží **lokálně** na klientově serveru – do cloudu jdou pouze **metadata** (struktura DB) a **text dotazu**. Backend (proxy + Claude API) hostujeme my, klient se nestará o AI klíče ani infrastrukturu.

Detailní architektura: [guide-it.md](guide-it.md).

## Pro koho je ET/HEL ideální

✅ **Hodí se:**
- Firmy s 5–500 zaměstnanci na Heliosu iNuvio
- Týmy, kde se hodně **ptají IT na data** (skladníci, účetní, obchod)
- Klienti, kteří **onboardují nové lidi** do Heliosu
- Společnosti, kde se **opakovaně exportují stejné sestavy**

⚠️ **Méně se hodí:**
- Firmy, které mají vlastní BI nástroj na všechny dotazy (Power BI, Tableau)
- Specifické nasazení s heavy modifikacemi jádra Heliosu (může vyžadovat custom konfiguraci)
- Klienti s velmi citlivými daty bez možnosti odesílání DDL ven (i když data nikdy neopouští server)

## Argumenty pro klienta

### Time-to-value

**Instalace do hodiny.** Žádný projekt, žádné API klíče, žádné integrace na míru. Stáhne `Ethel.exe`, zadá token, funguje.

### ROI v jedné větě

*„Jeden uživatel ušetří v průměru 30–60 minut týdně hledání v sestavách. Při 5 uživatelích to je 5 hodin týdně, 20 hodin měsíčně. Standard tarif je 1 490 Kč/měs."*

### Datová bezpečnost

Klíčová námitka u většiny klientů. **Reálná data nikdy neopouští server klienta.** Posíláme jen DDL (názvy tabulek/sloupců) a text dotazu. SQL se vykoná lokálně.

Pro paranoidní klienty: **denylist** v `Tabx_Ethel_Deny` umožní úplně vyřadit citlivé tabulky (mzdy, osobní údaje) ze znalosti AI.

### Není to GPT s omezeními

ET/HEL **rozumí konkrétnímu Heliosu klienta** – ne obecný Helios, ale jeho stored procedurám, číselníkům, customizacím. Po instalaci si „rozhlédne" databázi a postaví znalostní mapu.

## Instalační postup

Instalace je standardní podle [návodu pro IT](guide-it.md). Stručně:

1. Stáhnout `Ethel.exe` na server s Heliosem
2. Spustit bez parametrů → wizard projde tokenem, SQL přihlášením, výběrem DB a uživatelů
3. Nastavit klávesovou zkratku v Heliosu (CTRL+I doporučujeme)

Jako partner můžete instalaci zařadit do svého standardního „Helios setup" balíčku – typicky 30–60 minut práce.

## Demo scénář pro prezentaci klientovi

Tři dotazy, které dělají „wow" efekt:

### 1. Konkrétní data z jeho DB (otevírá oči)

> **„Kolik faktur jsme vystavili tento měsíc?"**

Stačí pár sekund. Klient vidí **svá data**, ne demo. Tohle obvykle utne diskuzi typu „a co kdyby halucinovala".

### 2. Vysvětlení sloupce (kontext)

> **„Vysvětli mi, co znamená sloupec `Zruseno` v `TabKmenZbozi`."**

Klient vidí, že ET/HEL **rozumí jeho konkrétní instanci** – včetně customizací a obvyklého použití pole.

### 3. Praktický provozní dotaz

> **„Které objednávky čekají na vyřízení déle než 14 dnů?"**

Reálný use case z denního provozu. Klient si představí, kdo všechno tohle bude používat.

**Tip:** Předem si připravte dotaz, který klient typicky řeší (zeptejte se před demo na bolesti). Pak ho v ET/HEL rovnou ukažte.

## Ceník

| Tarif | Cena (měs.) | Pro koho |
|---|---|---|
| **Standard** | 1 490 Kč | 1 databáze, 5 uživatelů v ceně. Každý další +249 Kč/měs. |
| **Enterprise** | 4 990 Kč | Multi-DB, neomezený tým, onboarding call, prioritní podpora. |

Plné ceny a roční tarif na [ethel.cz](https://ethel.cz#pricing).

**Pro klienty platí 14denní trial bez karty** – perfektní moment pro vaši asistovanou instalaci.

## Partnerský program

Aktuálně připravujeme strukturovaný partnerský program (provize za doporučení, sleva pro vlastní nasazení, přístup do partnerského portálu).

**Předběžně:** zájemci, kteří doporučí klienta v trial fázi, dostanou **20% provizi** z prvního ročního předplatného. Ozvěte se na [partner@jakubsevela.cz](mailto:partner@jakubsevela.cz) – domluvíme se na podmínkách.

> **Pozn.:** Konkrétní podmínky partnerského programu jsou v aktivním vývoji. Aktuálně preferujeme osobní domluvu, podpisy smluv chystáme na Q3 2026.

## FAQ pro partnery

**Můžu ET/HEL nasadit do bezpečnostně náročného prostředí (banky, zdravotnictví)?**
Závisí na specifikách. Reálná data nikam neodchází, ale DDL posíláme. Pro on-prem variantu (vlastní LLM provider) nás kontaktujte – zvažujeme enterprise edici.

**Funguje ET/HEL s customizacemi Heliosu?**
Ano. ET/HEL si při instalaci přečte aktuální DDL – vidí všechny customizační tabulky a sloupce. Custom procedury vidí také.

**Co když si klient přeje vlastní úpravy promptu / chování?**
Enterprise tarif zahrnuje **vlastní konfiguraci promptů**. Pro Standard tarif můžeme udělat menší úpravy ad-hoc.

**Můžu ET/HEL prodávat pod vlastní značkou (white-label)?**
Aktuálně ne, ale je to v plánu pro 2026. Ozvěte se, pokud máte konkrétní požadavek.

## Kontakt

- **Partnerský kontakt**: [partner@jakubsevela.cz](mailto:partner@jakubsevela.cz)
- **Technická podpora**: [ethel@jakubsevela.cz](mailto:ethel@jakubsevela.cz)
- **Web**: [ethel.cz](https://ethel.cz)

---

**Další čtení:**
- [Rychlý start pro koncové uživatele](quickstart.md) – pošlete klientovi po instalaci
- [Návod pro IT administrátory](guide-it.md) – technické detaily, troubleshooting, bezpečnost
