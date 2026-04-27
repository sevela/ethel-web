# Email šablona – Platba se nezdařila

**Předmět:** ET/HEL – platba se nezdařila ⚠️

**Příjemce:** zákazník, jehož automatická platba neproběhla
**Odesílatel:** ethel@jakubsevela.cz
**Formát:** plain text + HTML verze (později)
**Trigger:** Stripe webhook `invoice.payment_failed` (viz ETH-45)

---

Dobrý den,

automatická platba za vaše předplatné **ET/HEL** se bohužel nezdařila. Nic dramatického – chceme vás jen informovat a dát vám možnost to napravit.

## Co se stalo

- **Tarif:** {{TIER_NAME}}
- **Částka:** {{AMOUNT}} Kč
- **Datum pokusu o platbu:** {{ATTEMPT_DATE}}
- **Důvod (od platební brány):** {{FAILURE_REASON}}

Nejčastější příčiny: **expirovaná karta**, nedostatek prostředků, banka zablokovala transakci jako podezřelou.

## Co teď

1. **Aktualizujte platební údaje** zde: {{UPDATE_PAYMENT_URL}}
2. Po aktualizaci **zkusíme platbu znovu** automaticky během několika minut.
3. Pokud platba projde, **přístup k ET/HEL pokračuje bez přerušení**.

## Dokdy můžu zaplatit

- Po dobu **{{GRACE_PERIOD_DAYS}} dní** od dnešního data **funguje ET/HEL normálně** – máte čas to v klidu vyřešit.
- Pokus o opětovné stržení proběhne **automaticky za 3 a 7 dní**.
- Po **{{GRACE_PERIOD_DAYS}} dnech** bez úspěšné platby přístup **dočasně pozastavíme**. Data ve vaší databázi (logy, konfigurace) zůstávají – po obnovení platby se vše rozjede tam, kde to skončilo.

## Potřebujete poradit?

Napište nám na **[ethel@jakubsevela.cz](mailto:ethel@jakubsevela.cz)** – pomůžeme s řešením, případně domluvíme alternativní platební metodu (bankovní převod, faktura).

Pokud chcete předplatné **zrušit**, stačí odpovědět na tento email – žádné poplatky, žádný stres.

---

Děkujeme, že jste s námi. Doufáme, že to společně rychle vyřešíme. 🤝

Tým ET/HEL
[ethel.cz](https://ethel.cz) · [ethel@jakubsevela.cz](mailto:ethel@jakubsevela.cz)

---

## Placeholders k naplnění

| Placeholder | Popis |
|---|---|
| `{{TIER_NAME}}` | "Standard" / "Enterprise" |
| `{{AMOUNT}}` | částka v Kč, formátovaná (např. `1 490`) |
| `{{ATTEMPT_DATE}}` | datum pokusu, formát `21. 4. 2026` |
| `{{FAILURE_REASON}}` | text z platební brány, přeložený do češtiny pokud možno |
| `{{UPDATE_PAYMENT_URL}}` | Stripe Customer Portal link |
| `{{GRACE_PERIOD_DAYS}}` | konstanta – doporučuji **7 dní** |

## Pozn. k workflow

- 1. emailem **upozornění** (tento template)
- 2. emailem za 3 dny **2. pokus + reminder** (variace tohoto templatu)
- 3. emailem za 7 dní **finální upozornění** (suspend at the end of day)
- Po 14 dnech: **pozastavení účtu** + email "Pozastavili jsme váš účet"
- Po 30 dnech: **definitivní zrušení** předplatného (možnost reaktivovat ručně)
