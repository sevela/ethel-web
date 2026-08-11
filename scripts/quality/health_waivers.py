"""ETH-277: mista, kde se repo vedome nediva — jadro ukazatele dluhu.

Oddeleno od `health.py` schvalne: samo meridlo musi projit limity, ktere hlida
(400 radku na soubor). Kdyby se na to vzala vyjimka, prvni polozkou v seznamu
"vedome se nedivame" by byl nastroj, ktery ten seznam vede.

Vyjimka je tu **vsechno, co potlacuje kontrolu**: `continue-on-error` v CI,
karantena testu, prijate bezpecnostni advisory, docasna vyjimka z baseline
a potlaceni primo v kodu (komentare, ktere umlci linter nebo vypnou test).
Neplatna vyjimka (bez duvodu, bez tiketu, bez data, nebo propadla) je vlastni
kategorie — to uz neni rozhodnuti, to je slib, ktery nikdo nedodrzel.
"""

import datetime
import json
import re
import subprocess
from pathlib import Path

SOURCE_EXT = (".py", ".js", ".mjs", ".cjs", ".rs")

# Vzory potlaceni kontroly primo v kodu. Jsou to **regulerni vyrazy**, ne
# podretezce: `#[allow(...)]` a `#[ignore]` se poznavaji jen na zacatku radku,
# aby se nezapocital atribut zmineny ve vysvetlujicim komentari (v ethel-agent
# takovy komentar je). Vzor bez kotvy se pocita kdekoli na radku, protoze
# potlaceni typu noqa **je** komentar ze sve podstaty.
#
# Zapisuji se tak, aby tenhle soubor nematchoval sam sebe — jinak by meridlo
# pocitalo vlastni definici jako dluh. Ze to plati, hlida `--selftest`
# (pripad "zminka o atributu v komentari se NEpocita") a kontrola nize.
NOQA = r"#\s*noqa"
SUPPRESSIONS = (
    NOQA,
    r"type:\s*ignore",
    "eslint-" + "disable",
    r"pragma:\s*no cover",
    "@ts-" + "ignore",
    r"^\s*#\[allow\(",
    r"^\s*#\[ignore\]",
    # Test, o kterem vime, ze neprochazi. `skipif` sem NEPATRI (chybejici
    # SUPABASE_DB_URL je konfigurace prostredi, ne vedoma slepa skvrna).
    r"^\s*@pytest\.mark\.xfail",
)
_SUPPRESSION_RE = tuple((p, re.compile(p)) for p in SUPPRESSIONS)
# Kody, ktere se do dluhu nepocitaji. E402 ("import neni na zacatku souboru") je
# v testech dusledek toho, ze si test pred importem dopisuje sys.path — neni to
# umlceny nalez o kvalite a v ethel-proxy je jich 76 z 79, takze by prehlusil
# vsechno ostatni. Rozsireni tehle mnoziny **meni otisk definice mereni**, takze
# si ji nikdo nepripise potichu, aby si snizil index.
SUPPRESSION_IGNORED_CODES = ("E402",)
_NOQA_CODES = re.compile(r"#\s*noqa:?\s*([A-Z]+[0-9]+(?:\s*,\s*[A-Z]+[0-9]+)*)?")


class MeasurementError(RuntimeError):
    """Meridlo nemuze merit. Nikdy se nepolyka — tichy nulovy nalez je horsi nez pad."""


def read_json(path, expected_key):
    """Chybejici soubor = prazdno. Rozbity soubor = pad, ne prazdno."""
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise MeasurementError(f"{path.name} nejde precist ({exc})") from exc
    if expected_key not in data:
        raise MeasurementError(f"{path.name} nema klic '{expected_key}'")
    return data


def tracked_files(root):
    result = subprocess.run(
        ["git", "ls-files"],
        cwd=str(root),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if result.returncode != 0:
        raise MeasurementError(f"`git ls-files` selhalo v {root}: {result.stderr.strip()}")
    return [line.strip() for line in result.stdout.splitlines() if line.strip()]


def _count_jobs(text):
    """Pocet jobu v jednom workflow. Kontext, ne dluh — smazany job snizi pocet
    vyjimek, aniz by se cokoli zlepsilo, a tohle cislo to prozradi."""
    inside = False
    total = 0
    for line in text.splitlines():
        if line.startswith("jobs:"):
            inside = True
            continue
        if not inside:
            continue
        if line and not line[0].isspace():
            break
        if re.match(r"^  [A-Za-z0-9_-]+:\s*$", line):
            total += 1
    return total


def ci_waivers(root):
    """Kroky v CI, ktere smi selhat, a pocet jobu jako kontext."""
    workflows = sorted((root / ".github" / "workflows").glob("*.yml"))
    silenced, jobs = 0, 0
    for path in workflows:
        text = path.read_text(encoding="utf-8", errors="replace")
        silenced += len(re.findall(r"continue-on-error:\s*(?!false\b)\S+", text))
        jobs += _count_jobs(text)
    return {"ci_continue_on_error": silenced, "ci_jobs": jobs, "ci_workflows": len(workflows)}


def _entry_defects(kind, entries, needed, today):
    """Vyjimka bez duvodu, bez tiketu, bez data nebo propadla = neplatna."""
    defects = []
    for entry in entries:
        label = entry.get("id") or entry.get("test") or entry.get("path") or "?"
        defects += [
            f"{kind} {label}: chybi '{field}'"
            for field in needed
            if not str(entry.get(field, "")).strip()
        ]
        defects += _expiry_defects(kind, label, str(entry.get("expires", "")).strip(), today)
    return defects


def _expiry_defects(kind, label, raw, today):
    if not raw:
        return []
    try:
        expires = datetime.date.fromisoformat(raw)
    except ValueError:
        return [f"{kind} {label}: 'expires' neni datum ({raw})"]
    return [f"{kind} {label}: vyjimka propadla {raw}"] if expires < today else []


def waivers(root, today):
    """Vsechna mista, kde se repo vedome nediva. Jadro ukazatele."""
    counts = ci_waivers(root)
    tests = read_json(root / ".quality-quarantine.json", "quarantine").get("quarantine", [])
    security = read_json(root / ".security-quarantine.json", "accepted_advisories").get(
        "accepted_advisories", []
    )
    allowances = read_json(root / ".quality-refactor.json", "allowances").get("allowances", [])
    if allowances and not (root / "scripts" / "quality" / "allowances.py").exists():
        # Vyjimky z baseline umi zatim jen `baseline.py` v ethel-proxy. Kdyby si
        # nekdo zalozil soubor v repu, kde je meridlo limitu jine, vyjimka by se
        # pocitala do dluhu, ale limit by ji nerespektoval — brana, ktera vypada
        # otevrena, a dluh navic. Radeji pad.
        raise MeasurementError(
            ".quality-refactor.json existuje, ale scripts/quality/allowances.py v tomhle "
            "repu neni — meridlo limitu vyjimky neumi a soubor by nic nedelal"
        )

    defects = _entry_defects("karantena testu", tests, ("reason", "ticket"), today)
    defects += _entry_defects("bezp. vyjimka", security, ("reason", "expires"), today)
    defects += _entry_defects(
        "vyjimka refaktoringu", allowances, ("reason", "ticket", "expires"), today
    )

    counts.update(
        {
            "quarantined_tests": len(tests),
            "security_exceptions": len(security),
            "refactor_allowances": len(allowances),
            "inline_suppressions": count_suppressions(root),
        }
    )
    counts["total"] = (
        counts["ci_continue_on_error"]
        + counts["quarantined_tests"]
        + counts["security_exceptions"]
        + counts["refactor_allowances"]
        + counts["inline_suppressions"]
    )
    counts["invalid"] = defects
    return counts


def _jen_ignorovane_kody(line):
    match = _NOQA_CODES.search(line)
    raw = (match.group(1) or "") if match else ""
    codes = [code.strip() for code in raw.split(",") if code.strip()]
    # Holy `noqa` bez kodu umlci vsechno naraz — ten se pocita vzdycky.
    return bool(codes) and all(code in SUPPRESSION_IGNORED_CODES for code in codes)


def _line_suppressions(line):
    total = 0
    for pattern, regex in _SUPPRESSION_RE:
        if not regex.search(line):
            continue
        if pattern == NOQA and _jen_ignorovane_kody(line):
            continue
        total += 1
    return total


def count_suppressions(root):
    total = 0
    for rel in tracked_files(root):
        if not rel.endswith(SOURCE_EXT) or not (root / rel).exists():
            continue
        text = (root / rel).read_text(encoding="utf-8", errors="replace")
        total += sum(_line_suppressions(line) for line in text.splitlines())
    return total


def repo_size(root):
    files = [f for f in tracked_files(root) if f.endswith(SOURCE_EXT)]
    lines = 0
    for rel in files:
        path = Path(root) / rel
        if path.exists():
            lines += len(path.read_text(encoding="utf-8", errors="replace").splitlines())
    return {"source_files": len(files), "source_lines": lines}
