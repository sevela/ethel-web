# Všeobecné obchodní podmínky služby ET/HEL

> ⚠️ **DRAFT — připraveno k právnímu review.**
> Tento dokument je pracovní verze připravená k předání právnímu poradci. Před zveřejněním nutná kontrola advokátem se specializací na e-commerce / SaaS smlouvy v ČR.
> *Místa označená `[…]` doplní provozovatel.*

**Účinnost:** [datum účinnosti]
**Verze:** 1.0 (draft)

---

## 1. Úvodní ustanovení

1.1. Tyto všeobecné obchodní podmínky (dále jen „**VOP**") upravují vzájemná práva a povinnosti smluvních stran vzniklé v souvislosti s poskytováním služby ET/HEL prostřednictvím webové stránky [ethel.cz](https://ethel.cz) a navazující infrastruktury.

1.2. **Provozovatelem služby** je:

> Jakub Ševela
> IČO: `[doplnit]`
> DIČ: `[doplnit, pokud plátce]`
> Sídlo: `[doplnit, Brno]`
> E-mail: ethel@jakubsevela.cz
> (dále jen „**Provozovatel**")

1.3. **Uživatelem** služby je fyzická nebo právnická osoba, která prostřednictvím webové stránky uzavřela s Provozovatelem smlouvu o poskytování služby ET/HEL (dále jen „**Uživatel**").

1.4. Smluvní vztah se řídí těmito VOP a zákonem č. 89/2012 Sb., občanský zákoník, v platném znění. V případě B2B vztahu jsou vyloučena ustanovení o adhezních smlouvách.

## 2. Vymezení služby

2.1. **Služba ET/HEL** (dále také jen „**Služba**") je SaaS (Software as a Service) řešení v podobě AI asistentky pro ERP systém Helios iNuvio. Služba umožňuje Uživateli pokládat dotazy v přirozeném jazyce a získávat odpovědi s využitím AI modelu třetí strany (Anthropic Claude).

2.2. Služba se skládá ze dvou částí:
- **Klientská aplikace** (`Ethel.exe`) — instalovaná na infrastruktuře Uživatele, zajišťuje připojení k databázi Helios a UI
- **Cloudová proxy** ([api.ethel.cz](https://api.ethel.cz)) — backend zajišťující komunikaci s AI modelem

2.3. **Reálná data Uživatele** (obsah řádků databáze Helios) **nikdy neopouštějí infrastrukturu Uživatele**. Provozovateli se předávají pouze:
- Text dotazu Uživatele
- Strukturní informace databáze (názvy tabulek, sloupců, datové typy — DDL)
- Vygenerovaný SQL dotaz pro audit

2.4. Provozovatel **není výrobcem ani distributorem** ERP systému Helios iNuvio (výrobcem je Asseco Solutions, a.s.). ET/HEL je samostatný produkt třetí strany.

## 3. Uzavření smlouvy

3.1. Smlouva o poskytování Služby je uzavřena okamžikem, kdy Uživatel:
- a) vytvoří objednávku přes formulář na webové stránce a
- b) Provozovatel doručí Uživateli e-mail s aktivačním tokenem.

3.2. Před zaplacením prvního období je Uživateli umožněn **bezplatný 14denní zkušební provoz** (dále jen „**trial**"). Trial se aktivuje stejně jako placená verze, ale bez nutnosti zadání platebních údajů. Po uplynutí trialu Služba automaticky končí, pokud Uživatel nezaktivuje placené předplatné.

3.3. Uživatel je povinen při objednávce uvést pravdivé údaje. Provozovatel je oprávněn ověřit identitu Uživatele a v případě podezření na zneužití odmítnout aktivaci.

## 4. Cena a platební podmínky

4.1. Aktuální ceník Služby je zveřejněn na [ethel.cz/#pricing](https://ethel.cz/#pricing). Ceny jsou uvedeny **bez DPH**, pokud není uvedeno jinak.

4.2. Předplatné se hradí **měsíčně nebo ročně předem** podle volby Uživatele. Roční předplatné nabízí slevu uvedenou v aktuálním ceníku.

4.3. **Automatické obnovování:** Předplatné se automaticky obnovuje na další stejně dlouhé období, pokud jej Uživatel nezruší alespoň 1 den před koncem aktuálního období.

4.4. **Platba** probíhá kartou nebo bankovním převodem prostřednictvím platební brány. Platební údaje zpracovává platební brána, Provozovatel je neukládá.

4.5. **Faktura** je vystavena automaticky po každém zaplaceném období a doručena na e-mail Uživatele. Faktura splňuje náležitosti daňového dokladu dle zákona č. 235/2004 Sb., o DPH.

4.6. **Změna cen:** Provozovatel může jednostranně změnit ceník s účinností pro **příští fakturační období**. O změně cen informuje Uživatele e-mailem nejméně 30 dní předem.

## 5. Práva a povinnosti Uživatele

5.1. Uživatel se zavazuje:
- Používat Službu v souladu se VOP a platnými právními předpisy
- Nezneužívat Službu k automatizovanému strojovému dotazování (DDoS, scraping)
- Chránit aktivační token před zneužitím (token je vázán na konkrétní instanci Uživatele)
- Neumožnit přístup ke Službě třetím stranám mimo schválený rozsah uživatelů (dle zvoleného tarifu)

5.2. **Porušení článku 5.1** opravňuje Provozovatele k pozastavení Služby bez náhrady.

5.3. Uživatel je oprávněn poskytovat zpětnou vazbu, hlásit chyby a požadovat vylepšení Služby.

## 6. AI disclaimer a omezení odpovědnosti

6.1. **Odpovědi Služby generuje AI model.** Přes maximální péči Provozovatele může AI model:
- Poskytnout nepřesnou nebo neúplnou odpověď
- Vygenerovat SQL dotaz, který nevrací očekávaná data
- Misinterpretovat strukturu databáze nebo dotaz Uživatele

6.2. **Uživatel je povinen ověřit kritické informace** získané ze Služby (zejména finanční údaje, podklady pro účetnictví, personální data) v originálních zdrojích Heliosu nebo dotazem na vlastní IT.

6.3. **Provozovatel neodpovídá** za:
- Škody vzniklé nesprávnou interpretací odpovědi AI Uživatelem
- Škody vzniklé spuštěním SQL dotazu, který Uživatel sám potvrdil
- Škody vzniklé nedostupností Služby (mimo úmyslné zavinění)
- Škody vzniklé třetí stranou (Anthropic, Asseco, poskytovatel hostingu)

6.4. **Maximální výše náhrady škody** ze strany Provozovatele je omezena částkou rovnající se ceně předplatného za **3 měsíce** předcházející vzniku škody.

## 7. Dostupnost Služby (SLA)

7.1. Provozovatel se zavazuje vyvinout maximální úsilí pro nepřetržitou dostupnost Služby (best-effort).

7.2. **V této verzi VOP není garantována žádná specifická úroveň SLA.** Plánované odstávky budou Uživatelům oznámeny e-mailem nejméně 48 hodin předem.

7.3. V případě výpadku delšího než **24 hodin** v jednom kalendářním měsíci má Uživatel nárok na poměrné prodloužení předplatného.

## 8. Ukončení smlouvy

8.1. **Uživatel může smlouvu ukončit kdykoli** bez udání důvodu. Zrušení provede e-mailem na ethel@jakubsevela.cz nebo přes účet (pokud je dostupný). Přístup ke Službě skončí na konci posledního zaplaceného období.

8.2. **Provozovatel může smlouvu ukončit** s 30denní výpovědní dobou bez udání důvodu, případně okamžitě v případě porušení článku 5.1 Uživatelem.

8.3. **Vrácení nevyčerpaného předplatného:** V případě ukončení ze strany Provozovatele bez zavinění Uživatele má Uživatel nárok na vrácení poměrné části předplatného.

## 9. Ochrana osobních údajů

9.1. Provozovatel zpracovává osobní údaje Uživatele v souladu s nařízením GDPR (EU) 2016/679 a zákonem č. 110/2019 Sb.

9.2. Detailní informace o zpracování osobních údajů jsou v samostatném dokumentu **[Zásady zpracování osobních údajů](privacy.md)** *(připravuje se)*.

9.3. **Klíčové body:**
- Provozovatel zpracovává: jméno, e-mail, fakturační údaje, IP adresu, telemetrii používání
- Provozovatel **nezpracovává** obsah databáze Uživatele (data Heliosu)
- Doba uchování: po dobu trvání smlouvy + 5 let pro účetní účely
- Uživatel má právo na přístup, opravu, výmaz, omezení zpracování a přenositelnost údajů

## 10. Závěrečná ustanovení

10.1. Tyto VOP nabývají účinnosti dnem zveřejnění na webové stránce.

10.2. Provozovatel je oprávněn VOP jednostranně měnit. O změnách informuje Uživatele e-mailem nejméně 30 dní předem. Pokud Uživatel se změnami nesouhlasí, je oprávněn smlouvu vypovědět ke dni účinnosti změny.

10.3. **Rozhodné právo:** Vztah se řídí právním řádem **České republiky**.

10.4. **Soudní příslušnost:** K rozhodování sporů jsou příslušné obecné soudy ČR podle sídla Provozovatele.

10.5. Pokud se některé ustanovení těchto VOP ukáže neplatným, ostatní ustanovení zůstávají v platnosti.

10.6. **Kontakt na Provozovatele:** ethel@jakubsevela.cz

---

> *Tento dokument je v draftu připraveném pro právní review. Před zveřejněním je nutná kontrola advokátem se specializací na e-commerce/SaaS smlouvy v ČR.*
