# Email šablona — Aktivace tokenu

**Předmět:** Váš aktivační token pro ET/HEL 🔑

**Příjemce:** zákazník po objednávce / aktivaci trialu
**Odesílatel:** ethel@jakubsevela.cz
**Formát:** plain text + HTML verze (později)

---

Dobrý den,

děkujeme za vyzkoušení **ET/HEL** — AI asistentky pro Helios iNuvio. Níže najdete váš aktivační token a krátký návod, jak jej použít.

## Váš aktivační token

```
{{ACTIVATION_TOKEN}}
```

*(zkopírujte celý řetězec včetně pomlček)*

## Co s tokenem dál

1. **Stáhněte `Ethel.exe`** z odkazu: {{DOWNLOAD_URL}}
2. Soubor uložte na **server, kde běží Helios** (ideálně do stejné složky jako `Helios.exe`).
3. Spusťte `Ethel.exe` **bez parametrů** — otevře se instalační wizard.
4. Při prvním kroku **zadejte tento token**.
5. Wizard vás provede zbytkem (přihlášení k SQL Serveru, výběr databází, oprávnění).

Celá instalace trvá obvykle **5–15 minut**.

## Něco se nepodařilo?

- 📖 [Návod pro IT administrátory](https://ethel.cz/docs/guide-it) — detailní kroky, troubleshooting
- 🚀 [Rychlý start pro uživatele](https://ethel.cz/docs/quickstart) — pošlete kolegům po instalaci
- 💬 Napište nám na **[ethel@jakubsevela.cz](mailto:ethel@jakubsevela.cz)** — odpovídáme do 24 hodin v pracovní dny

## Důležité info k vašemu předplatnému

- **Trial:** 14 dní zdarma, bez omezení funkcí. Bez automatické fakturace — pokud trial nezaktivujete, jednoduše vyprší.
- **Placené předplatné:** automatické obnovování měsíčně/ročně. Můžete kdykoli zrušit (mailem nebo přes web).
- **Tarif:** {{TIER_NAME}} — {{TIER_DESCRIPTION}}

---

Hodně úspěchů s ET/HEL — věříme, že vás (a hlavně vaše kolegy) potěší. 👋

Tým ET/HEL
[ethel.cz](https://ethel.cz) · [ethel@jakubsevela.cz](mailto:ethel@jakubsevela.cz)

---

> *Tento e-mail jste obdrželi, protože jste si zaregistrovali účet ET/HEL. Pokud jste objednávku nezadali, prosíme, kontaktujte nás.*

---

## Placeholders k naplnění

| Placeholder | Popis |
|---|---|
| `{{ACTIVATION_TOKEN}}` | UUID token, např. `e33de134-7842-4b91-a7c1-...` |
| `{{DOWNLOAD_URL}}` | Aktuální URL ke stažení `Ethel.exe` (verzionované) |
| `{{TIER_NAME}}` | "Trial 14 dní" / "Standard" / "Enterprise" |
| `{{TIER_DESCRIPTION}}` | "1 databáze, 5 uživatelů" apod. |
