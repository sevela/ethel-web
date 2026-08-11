"""ETH-277: trend dluhu = historie souboru `.quality-health.json` v gitu.

Zadna externi databaze, zadny bot, zadna vetev navic. Bod trendu vznika tim, ze
nekdo commitne snimek — a `health.py --check` neprousti strom, jehoz snimek
nesedi se skutecnosti, takze historie nemuze mit diry.

Body zmerene JINOU definici mereni se do porovnani neberou (sloupec `!`).
Trend pres zmenu definice by michal "zmenil se kod" a "zmenil se metr".
"""

import datetime
import json
import subprocess

SNAPSHOT = ".quality-health.json"


def _git(root, *args):
    return subprocess.run(
        ["git", *args],
        cwd=str(root),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )


def load_history(root):
    """Vsechny commitnute verze snimku, od nejstarsi. Commit, kde snimek nejde
    precist, se preskoci s poznamkou — ne tise."""
    log = _git(root, "log", "--reverse", "--format=%H%x09%ad", "--date=short", "--", SNAPSHOT)
    points, problems = [], []
    for line in log.stdout.splitlines():
        if "\t" not in line:
            continue
        sha, date = line.split("\t", 1)
        blob = _git(root, "show", f"{sha}:{SNAPSHOT}")
        if blob.returncode != 0:
            problems.append(f"{sha[:8]}: snimek v commitu neni")
            continue
        try:
            point = json.loads(blob.stdout)
        except json.JSONDecodeError as exc:
            problems.append(f"{sha[:8]}: snimek nejde precist ({exc})")
            continue
        point["commit"] = sha[:8]
        point["commit_date"] = date.strip()
        points.append(point)
    return points, problems


def _row(point, previous, comparable):
    delta = ""
    if previous is not None and comparable:
        diff = point["index"] - previous["index"]
        delta = "0" if diff == 0 else f"{diff:+d}"
    return (
        f"| {point['commit_date']} | `{point['commit']}` | {point['index']} | "
        f"{point['structure']['soft']} | {point['structure']['hard']} | "
        f"{point['waivers']['total']} | {point['structure']['debt_score']} | "
        f"{delta} | {'' if comparable else '!'} |"
    )


def render_table(points):
    if not points:
        return "_Zadny commitnuty snimek — trend zacne prvnim `--record`._"
    definition = points[-1]["definition"]
    lines = [
        "| datum | commit | index | mekke | tvrde | vyjimky | koncentrace | zmena | ! |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ]
    previous = None
    for point in points:
        comparable = point.get("definition") == definition
        lines.append(_row(point, previous, comparable))
        previous = point if comparable else previous
    lines.append("")
    lines.append("`!` = bod zmereny jinou definici mereni, do porovnani se nebere.")
    return "\n".join(lines)


def _reference(points, window_days):
    """Nejnovejsi bod, ktery je aspon `window_days` starsi nez ten posledni."""
    newest = points[-1]
    hranice = datetime.date.fromisoformat(newest["commit_date"]) - datetime.timedelta(
        days=window_days
    )
    kandidati = [
        p
        for p in points[:-1]
        if p.get("definition") == newest["definition"]
        and datetime.date.fromisoformat(p["commit_date"]) <= hranice
    ]
    return kandidati[-1] if kandidati else None


PREDSTIH_DNI = 14


def expirace_na_spadnuti(root, dni=PREDSTIH_DNI, today=None):
    """Vyjimky, ktere propadnou behem `dni`. Propadla vyjimka uz je cervena
    v kazdem PR — predstih je proto, aby se to stihlo vyresit prace, ne aby to
    nekomu spadlo na hlavu v pondeli rano uprostred jine davky."""
    import health_waivers

    today = today or datetime.date.today()
    hranice = today + datetime.timedelta(days=dni)
    nalezy = []
    zdroje = (
        (".quality-refactor.json", "allowances", "vyjimka refaktoringu"),
        (".security-quarantine.json", "accepted_advisories", "bezp. vyjimka"),
    )
    for nazev, klic, popis in zdroje:
        for entry in health_waivers.read_json(root / nazev, klic).get(klic, []):
            raw = str(entry.get("expires", "")).strip()
            if not raw:
                continue
            try:
                expires = datetime.date.fromisoformat(raw)
            except ValueError:
                continue  # neplatny format resi `--check`, tady by to byl druhy hlas
            if today <= expires <= hranice:
                label = entry.get("ticket") or entry.get("id") or entry.get("path") or "?"
                nalezy.append(f"{popis} {label} propadne {raw} (za {(expires - today).days} dni)")
    return nalezy


def alarm(points, window_days, root=None, today=None):
    """Vraci seznam duvodu k probuzeni. Prazdny seznam = ticho."""
    duvody = list(expirace_na_spadnuti(root, today=today)) if root is not None else []
    if len(points) < 2:
        return duvody
    newest, reference = points[-1], _reference(points, window_days)
    if reference is None:
        return duvody
    if newest["index"] > reference["index"]:
        duvody.append(
            f"index dluhu za {window_days} dni vzrostl: {reference['index']} "
            f"({reference['commit_date']}) -> {newest['index']} ({newest['commit_date']})"
        )
    if newest["waivers"]["total"] > reference["waivers"]["total"]:
        duvody.append(
            f"pribylo vyjimek: {reference['waivers']['total']} -> {newest['waivers']['total']}"
        )
    return duvody


def trend_mode(root, args):
    points, problems = load_history(root)
    print(render_table(points))
    for problem in problems:
        print(f"\n::warning::{problem}")
    if not args.alarm:
        return 0
    duvody = alarm(points, args.window_days, root=root)
    if not duvody:
        print(
            f"\nOK — dluh za poslednich {args.window_days} dni neroste "
            f"a zadna vyjimka nepropadne do {PREDSTIH_DNI} dni."
        )
        return 0
    print("\nBUDIK:")
    for duvod in duvody:
        print(f"  - {duvod}")
    return 1
