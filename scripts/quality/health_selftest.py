"""ETH-277: negativni kontroly meridla — umi hlidka vubec spadnout?

Bezi jednim prikazem v kazdem repu (`health.py --selftest`), takze nepotrebuje
testovaci framework a plati stejne tam, kde zadny neni. Kazdy pripad postavi
fixture strom v tmp (`health_fixture.py`), schvalne v nem neco zhorsi a overi,
ze `--check` **zcervena prave ocekavanym kodem**. Soucasti je pozitivni kontrola
(cisty strom projde) — bez ni by "vzdycky cervena" prosla stejne dobre.

Vzor prevzaty z ETH-342 (`tests/eth342-hlidka-limitu.test.js` v ethel-app), kde
se ukazalo, ze meridlo umi tise ztratit nalez a vypadat pritom jako "cisto".

**Pripad, ktery by prosel i s rozbitym meridlem, sem nepatri.** Dva takove tu byly
(detekce neplatne vyjimky) a nasla je az nezavisla kontrola — proto ma kazdy pripad
moznost predpripravit stav PRED zapisem snimku, aby se v mutaci menila jen ta jedna
vec, kterou pripad meri.
"""

import json
import sys
import tempfile
from datetime import date, timedelta
from pathlib import Path

from health_fixture import (
    CANNED_BASELINE,
    HERE,
    WORKFLOW_SILENCED,
    _build_fixture,
    _commit_snapshot,
    _health,
    _run_git,
    _snapshot,
    _write,
)


def _case_zhorseni(root, canned, mutate, priprava=None):
    """`priprava` bezi PRED zapisem snimku. Je to jediny zpusob, jak overit
    detekci NEPLATNE vyjimky: kdyz vyjimka az v mutaci pribude, posune se
    `waivers.total` a `--check` zcervena i s vypnutou validaci — pripad by
    prosel i s rozbitym meridlem (nalez kontrolora, 11. 8. 2026)."""
    if priprava:
        priprava(root)
    _health(root, canned, "--record")
    canned_pro_check = mutate(root, canned)
    result = _health(root, canned_pro_check or canned, "--check")
    return result.returncode, (result.stdout + result.stderr).strip()


def _mut_nic(root, canned):
    return canned


def _mut_pridej_continue_on_error(root, canned):
    _write(root, ".github/workflows/ci.yml", WORKFLOW_SILENCED)
    return canned


def _bezpecnostni_vyjimka(root, expires):
    _write(
        root,
        ".security-quarantine.json",
        json.dumps(
            {"accepted_advisories": [{"id": "X-1", "reason": "nedosazitelne", "expires": expires}]}
        ),
    )


def _pre_platna_bezpecnostni_vyjimka(root):
    _bezpecnostni_vyjimka(root, (date.today() + timedelta(days=30)).isoformat())


def _mut_propadla_bezpecnostni_vyjimka(root, canned):
    """Vyjimka uz ve snimku JE (viz priprava) — meni se jen jeji platnost.
    Pocet vyjimek zustava 1, takze zcervenat muze jedine detekce propadnuti."""
    _bezpecnostni_vyjimka(root, (date.today() - timedelta(days=1)).isoformat())
    return canned


def _karantena(root, polozka):
    _write(root, ".quality-quarantine.json", json.dumps({"quarantine": [polozka]}))


def _pre_karantena_s_tiketem(root):
    _karantena(root, {"path": "t.py", "test": "t", "reason": "flaky", "ticket": "ETH-1"})


def _mut_karantena_bez_tiketu(root, canned):
    """Stejna polozka jako v priprave, jen bez tiketu — pocet se nemeni."""
    _karantena(root, {"path": "t.py", "test": "t", "reason": "flaky"})
    return canned


def _mut_platna_vyjimka(root, canned):
    zitra = (date.today() + timedelta(days=30)).isoformat()
    _write(
        root,
        ".quality-refactor.json",
        json.dumps(
            {
                "allowances": [
                    {
                        "path": "a.py",
                        "metric": "file_lines",
                        "max_value": 750,
                        "reason": "refaktoring",
                        "ticket": "ETH-1",
                        "expires": zitra,
                    }
                ]
            }
        ),
    )
    return canned


def _mut_potlaceni_v_kodu(root, canned):
    _write(root, "a.py", "def f(a, b, c, d, e, g):  # " + "noqa\n    return a\n")
    return canned


def _mut_vypnuty_test(root, canned):
    """Test, o kterem vime, ze neprochazi, je vedoma slepa skvrna jako kazda jina."""
    _write(root, "t.py", "@pytest.mark." + "xfail(reason='vime o tom')\ndef test_x():\n    pass\n")
    _run_git(root, "add", "t.py")
    return canned


def _mut_atribut_v_komentari(root, canned):
    """NEGATIVNI kontrola: zminka o atributu ve vysvetlujicim komentari neni
    potlaceni kontroly. Kdyby se pocitala, meridlo by trestalo psani komentaru
    o tom, co se prestalo umlcovat — presne takovy komentar je v ethel-agent."""
    _write(root, "a.py", "// ETH-1 zrusilo tri #[" + "allow(dead_code)] nalezy\n")
    return canned


def _mut_vyjimka_bez_podpory(root, canned):
    """Vyjimka v repu, jehoz meridlo limitu ji neumi, je brana, ktera vypada
    otevrena. Fixture nema scripts/quality/allowances.py, takze musi spadnout
    jako chyba mereni (3), ne se tvarit, ze vyjimka plati."""
    _mut_platna_vyjimka(root, canned)
    (root / "scripts" / "quality" / "allowances.py").unlink()
    return canned


def _mut_smaz_job(root, canned):
    """Umlcet krok jde i tim, ze se cely job smaze. Pocet vyjimek se tim nezvedne
    — proto je pocet jobu v porovnavanych polich, ne jen v kontextu."""
    _write(
        root,
        ".github/workflows/ci.yml",
        "name: CI\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n"
        "    steps:\n      - run: echo ok\n",
    )
    return canned


def _mut_zmena_definice(root, canned):
    jina = dict(CANNED_BASELINE, limits={"file_lines": {"soft": 900, "hard": 1200}})
    return _write(root, "canned2.json", json.dumps(jina))


def _mut_zuzeni_rozsahu(root, canned):
    """Limit rika, jak vysoko je latka; rozsah, pres ktere sektory se skace.
    Vynechat adresar z mereni srazi index stejne jako zvednuti limitu — a musi
    se to poznat stejne, tedy jako zmena definice (nalez kontrolora)."""
    jina = dict(
        CANNED_BASELINE,
        measurement_scope={"excluded_dir_parts": [".git", "tests"], "extensions": [".py"]},
    )
    return _write(root, "canned4.json", json.dumps(jina))


def _mut_meridlo_nedeklaruje_rozsah(root, canned):
    """Meridlo, ktere nerekne, co meri, nesmi projit — jinak by zuzeni rozsahu
    nebylo videt nikde."""
    jina = {k: v for k, v in CANNED_BASELINE.items() if k != "measurement_scope"}
    return _write(root, "canned5.json", json.dumps(jina))


def _mut_zlepseni(root, canned):
    """Snimek se zapise v zhorsenem stavu, pak se dluh odstrani."""
    return _write(
        root,
        "canned3.json",
        json.dumps(dict(CANNED_BASELINE, violations={"files": [], "functions": [], "classes": []})),
    )


# (nazev, mutace, ocekavany exit, priprava pred zapisem snimku, retezec ve vystupu)
# Posledni polozka je volitelna kontrola TEXTU: exit kod rekne, ze brana zcervenala,
# ne uz, jestli autorovi PR rekla pravdu o smeru zmeny.
PRIPADY = [
    ("cisty strom projde (pozitivni kontrola)", _mut_nic, 0, None),
    ("pribyl continue-on-error krok", _mut_pridej_continue_on_error, 1, None, "ZHORSENI"),
    (
        "platna bezp. vyjimka propadla (pocet se nemeni)",
        _mut_propadla_bezpecnostni_vyjimka,
        1,
        _pre_platna_bezpecnostni_vyjimka,
    ),
    (
        "karantene testu zmizel tiket (pocet se nemeni)",
        _mut_karantena_bez_tiketu,
        1,
        _pre_karantena_s_tiketem,
    ),
    ("platna vyjimka refaktoringu se pocita jako dluh", _mut_platna_vyjimka, 1, None),
    ("potlaceni kontroly primo v kodu", _mut_potlaceni_v_kodu, 1, None),
    ("vypnuty test (xfail) se pocita", _mut_vypnuty_test, 1, None),
    ("zminka o atributu v komentari se NEpocita", _mut_atribut_v_komentari, 0, None),
    ("vyjimka v repu, ktery ji neumi vynutit", _mut_vyjimka_bez_podpory, 3, None),
    ("zmena definice mereni", _mut_zmena_definice, 3, None),
    ("zuzeni rozsahu mereni je taky zmena definice", _mut_zuzeni_rozsahu, 3, None),
    ("meridlo nedeklaruje rozsah mereni", _mut_meridlo_nedeklaruje_rozsah, 3, None),
    ("zlepseni bez prepsani snimku", _mut_zlepseni, 1, None, "ZLEPSENI"),
    ("zmizel job z CI (pocet jobu se hlida)", _mut_smaz_job, 1, None, "ZHORSENI"),
]


def _case_trend(root, stary_index, novy_index, expirace_za_dni=None):
    _build_fixture(root)
    davno = (date.today() - timedelta(days=40)).isoformat()
    dnes = date.today().isoformat()
    _commit_snapshot(root, _snapshot(stary_index, 0, davno), davno)
    _commit_snapshot(root, _snapshot(novy_index, 0, dnes), dnes)
    if expirace_za_dni is not None:
        _write(
            root,
            ".quality-refactor.json",
            json.dumps(
                {
                    "allowances": [
                        {
                            "path": "a.py",
                            "metric": "file_lines",
                            "max_value": 750,
                            "reason": "refaktoring",
                            "ticket": "ETH-1",
                            "expires": (date.today() + timedelta(days=expirace_za_dni)).isoformat(),
                        }
                    ]
                }
            ),
        )
    result = _health(root, None, "--trend", "--alarm", "--window-days", "28")
    return result.returncode, (result.stdout + result.stderr).strip()


def _meridlo_nepocita_samo_sebe():
    """Vzory potlaceni musi byt v meridle zapsane tak, aby je meridlo nenaslo
    ve vlastnim zdrojaku. Jinak by kazde rozsireni sady vzoru zvedlo index
    a vypadalo to jako novy dluh v repu."""
    import health_waivers

    nalezy = []
    # `allowances.py` je jen v ethel-proxy — v zrcadlech chybi a to je v poradku.
    kandidati = sorted(HERE.glob("health*.py")) + [HERE / "allowances.py"]
    for path in [p for p in kandidati if p.exists()]:
        text = path.read_text(encoding="utf-8", errors="replace")
        for i, line in enumerate(text.splitlines(), 1):
            if health_waivers._line_suppressions(line):
                nalezy.append(f"{path.name}:{i}: {line.strip()[:60]}")
    return nalezy


def _vysledek(chyby, nazev, kod, ocekavany, vystup):
    if kod == ocekavany:
        print(f"  OK   {nazev} (exit {kod})")
    else:
        chyby.append(f"{nazev}: cekal jsem exit {ocekavany}, dostal {kod}\n{vystup[:400]}")
        print(f"  CHYBA {nazev}: exit {kod}, cekal {ocekavany}")


def run_selftest():
    print("ETH-277 selftest meridla — kazdy pripad musi zcervenat prave ocekavanym kodem:")
    chyby = []
    for pripad in PRIPADY:
        nazev, mutate, ocekavany, priprava = pripad[:4]
        ocekavany_text = pripad[4] if len(pripad) > 4 else None
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            canned = _build_fixture(root)
            kod, vystup = _case_zhorseni(root, canned, mutate, priprava)
            if ocekavany_text and ocekavany_text not in vystup:
                kod = f"{kod} bez '{ocekavany_text}' ve vystupu"
            _vysledek(chyby, nazev, kod, ocekavany, vystup)
    for nazev, stary, novy, expirace, ocekavany in [
        ("budik: dluh za 40 dni vzrostl", 10, 20, None, 1),
        ("budik: dluh klesl, ticho", 20, 10, None, 0),
        ("budik: dluh stejny, ticho", 10, 10, None, 0),
        ("budik: vyjimka propadne za 7 dni", 10, 10, 7, 1),
        ("budik: vyjimka plati jeste 90 dni, ticho", 10, 10, 90, 0),
    ]:
        with tempfile.TemporaryDirectory() as tmp:
            kod, vystup = _case_trend(Path(tmp), stary, novy, expirace)
            _vysledek(chyby, nazev, kod, ocekavany, vystup)
    sam_sebe = _meridlo_nepocita_samo_sebe()
    _vysledek(
        chyby,
        "meridlo nepocita vlastni definici vzoru",
        1 if sam_sebe else 0,
        0,
        "\n".join(sam_sebe),
    )
    if chyby:
        print("\nSELFTEST SELHAL:", file=sys.stderr)
        for chyba in chyby:
            print(f"  - {chyba}", file=sys.stderr)
        return 1
    print("\nOK — meridlo umi spadnout ve vsech merenych pripadech.")
    return 0
