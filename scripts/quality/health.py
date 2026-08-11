"""ETH-277: zdravotni ukazatel repa — jeden bod trendu technickeho dluhu.

Pouziti:
    python scripts/quality/health.py              # vypise dnesni bod (JSON) na stdout
    python scripts/quality/health.py --record     # zapise ho do .quality-health.json
    python scripts/quality/health.py --check      # CI brana: selze, kdyz snimek nesedi
    python scripts/quality/health.py --trend      # tabulka trendu z historie gitu
    python scripts/quality/health.py --trend --alarm   # + selze pri rustu za okno
    python scripts/quality/health.py --selftest   # negativni kontroly meridla

Proc to existuje: `.quality-baseline.json` odpovi "je tenhle soubor pres limit?",
ale ne "roste dluh, nebo klesa?". Tenhle skript meri stav jednim cislem a snimek
commituje do `.quality-health.json` — **historie je pak historie toho souboru
v gitu**, zadna externi databaze ani bot. Aby ta historie byla uplna, `--check`
odmitne strom, jehoz snimek nesedi se skutecnosti (v OBOU smerech).

Co se do ukazatele pocita a jak by se to dalo osidit: docs/eth277-health-check.md.

Kde tenhle skript zije: kanonicka kopie je `ethel-proxy/scripts/quality/health.py`,
ostatni repa maji **zrcadlo** (stejny vzor jako `audit_gate.py` / `docmap.py`).
Zmena se dela v proxy a kopiruje beze zmeny — soubory maji byt bajt po bajtu
shodne, jinak se definice mereni v jednotlivych repech rozejde.
"""

import argparse
import datetime
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

TOOL_ROOT = Path(__file__).resolve().parents[2]
# ROOT = strom, ktery se meri. Bezne totez co TOOL_ROOT; ETHEL_HEALTH_ROOT je
# oddeluje, aby sla hlidka otestovat proti fixture (--selftest) bez sahani do repa.
ROOT = Path(os.environ.get("ETHEL_HEALTH_ROOT", TOOL_ROOT)).resolve()

# Verze definice mereni. Kdyz se zmeni ZPUSOB pocitani (ne vahy jednotlivych
# nalezu, ty jsou soucasti otisku taky), zvys ji — stara a nova cisla se pak
# odmitnou porovnavat misto toho, aby rozdil definice vypadal jako trend.
METRIC_VERSION = 1

# Vahy. Zamerne cela cisla a zamerne malo polozek — index ma byt "kolik veci
# nekdo jednou musi resit", ne skore, ktere nikdo neumi prepocitat v hlave.
# Vyjimka vazi vic nez jedno mekke poruseni: jedna `continue-on-error` schova
# CELY seznam nalezu toho kroku (v ethel-proxy 12 nalezu ruffu jednim radkem).
# Propadla/nedatovana vyjimka vazi nejvic: to uz neni rozhodnuti, to je slib,
# ktery nikdo nedodrzel.
WEIGHTS = {"soft": 1, "hard": 3, "waiver": 5, "invalid_waiver": 20}

# Polozky, ktere `--check` porovnava. Zbytek bodu (debt_score, velikost repa,
# datum) je kontext: meni se pri kazde zmene kodu, takze porovnavat ho by
# znamenalo prepisovat snimek v kazdem PR a nikdo by uz necetl, co se zmenilo.
COMPARED = ("index", "structure.soft", "structure.hard", "waivers.total")

SNAPSHOT_NAME = ".quality-health.json"


def _sourozenec(nazev):
    """Import az za behu — skript se pousti primo (`python scripts/quality/health.py`),
    ne jako balicek, takze sourozeneckou cestu je potreba dolozit rucne."""
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    return __import__(nazev)


def waivers_module():
    return _sourozenec("health_waivers")


def baseline_command(root):
    if os.environ.get("ETHEL_HEALTH_BASELINE_CMD"):
        return os.environ["ETHEL_HEALTH_BASELINE_CMD"].split()
    if (root / "scripts" / "quality" / "baseline.py").exists():
        return [sys.executable, "scripts/quality/baseline.py"]
    if (root / "scripts" / "quality" / "baseline.js").exists():
        return ["node", "scripts/quality/baseline.js"]
    raise waivers_module().MeasurementError(
        f"v {root} neni scripts/quality/baseline.py ani baseline.js"
    )


def baseline_report(root, canned=None):
    """Strukturalni cast bere z meridla, ktere uz v repu je (ETH-270/342).
    Nemeri si vlastni limity — dve definice limitu by se rozesly."""
    chyba = waivers_module().MeasurementError
    if canned:
        return json.loads(Path(canned).read_text(encoding="utf-8"))
    env = dict(os.environ, PYTHONUTF8="1", PYTHONIOENCODING="utf-8")
    env.pop("ETHEL_HEALTH_ROOT", None)
    env["ETHEL_BASELINE_ROOT"] = str(root)
    result = subprocess.run(
        baseline_command(root), cwd=str(root), capture_output=True, env=env, timeout=600
    )
    if result.returncode != 0:
        raise chyba(
            f"meridlo limitu skoncilo s {result.returncode}: "
            f"{result.stderr.decode('utf-8', 'replace')[-500:]}"
        )
    try:
        return json.loads(result.stdout.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise chyba(f"meridlo limitu nevratilo JSON ({exc})") from exc


def structure_stats(report):
    if "violations" not in report:
        raise waivers_module().MeasurementError("report meridla limitu nema klic 'violations'")
    items = [i for group in report["violations"].values() for i in group]
    board = report.get("top10_worst_files", [])
    scores = [entry.get("score") or 0 for entry in board]
    return {
        "soft": sum(1 for i in items if i.get("level") == "soft"),
        "hard": sum(1 for i in items if i.get("level") == "hard"),
        "items": len(items),
        "worst_score": max(scores, default=0),
        "debt_score": round(sum(scores), 3),
        "worst_file": board[0]["path"] if board else None,
    }


def definition_fingerprint(report):
    """Otisk definice mereni. Zvednout limity je legitimni krok, ale ma se poznat
    jako zmena definice, ne jako pokles dluhu."""
    waivers = waivers_module()
    payload = json.dumps(
        {
            "metric_version": METRIC_VERSION,
            "weights": WEIGHTS,
            "compared": COMPARED,
            "suppressions": list(waivers.SUPPRESSIONS),
            "suppressions_ignored": list(waivers.SUPPRESSION_IGNORED_CODES),
            "limits": report.get("limits"),
            "measured_by": report.get("measured_by"),
            "baseline_schema": report.get("schema_version"),
        },
        sort_keys=True,
        ensure_ascii=False,
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:12]


def debt_index(structure, waiver_counts):
    return (
        structure["soft"] * WEIGHTS["soft"]
        + structure["hard"] * WEIGHTS["hard"]
        + waiver_counts["total"] * WEIGHTS["waiver"]
        + len(waiver_counts["invalid"]) * WEIGHTS["invalid_waiver"]
    )


def build_point(root=ROOT, canned=None, today=None):
    waivers = waivers_module()
    today = today or datetime.date.today()
    report = baseline_report(root, canned)
    structure = structure_stats(report)
    waiver_counts = waivers.waivers(root, today)
    return {
        "schema_version": METRIC_VERSION,
        "recorded_at": today.isoformat(),
        "ecosystem": report.get("ecosystem"),
        "definition": definition_fingerprint(report),
        "index": debt_index(structure, waiver_counts),
        "structure": structure,
        "waivers": waiver_counts,
        "size": waivers.repo_size(root),
    }


def _dig(point, dotted):
    value = point
    for part in dotted.split("."):
        value = value[part]
    return value


def _drift(current, snapshot):
    return [
        f"{field}: {_dig(snapshot, field)} -> {_dig(current, field)}"
        for field in COMPARED
        if _dig(current, field) != _dig(snapshot, field)
    ]


def load_snapshot(root=ROOT):
    path = root / SNAPSHOT_NAME
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def record_mode(current, root=ROOT):
    path = root / SNAPSHOT_NAME
    # newline="\n" schvalne: na Windows by `write_text` udelal CRLF, git by ho pri
    # commitu prevedl na LF a Prettier (ethel-app/-web) by soubor v pracovnim strome
    # oznacil za nenaformatovany. Snimek se zapisuje porad stejne na vsech systemech.
    with path.open("w", encoding="utf-8", newline="\n") as soubor:
        soubor.write(json.dumps(current, indent=2, ensure_ascii=False) + "\n")
    print(f"Zapsano {path.name}: index={current['index']}")
    return 0


def _print_invalid(current):
    print("Neplatne vyjimky (propadle nebo bez duvodu/tiketu/data):", file=sys.stderr)
    for defect in current["waivers"]["invalid"]:
        print(f"  - {defect}", file=sys.stderr)


def _print_drift(current, snapshot, drift):
    smer = "ZHORSENI" if current["index"] > snapshot["index"] else "ZLEPSENI"
    print(f"{smer} proti {SNAPSHOT_NAME}:", file=sys.stderr)
    for line in drift:
        print(f"  - {line}", file=sys.stderr)
    print(
        "  Spust `python scripts/quality/health.py --record` a commitni snimek "
        "— historie toho souboru je jediny zdroj trendu.",
        file=sys.stderr,
    )


def check_mode(current, root=ROOT):
    """Brana. Selze pri neplatne vyjimce, pri zmene definice a pri JAKEMKOLI
    rozdilu proti snimku — i pri zlepseni. Snimek je tvrzeni o repu; kdyz nesedi,
    trend postaveny na jeho historii je fikce, at uz lze v kterykoli smer."""
    snapshot = load_snapshot(root)
    if snapshot is None:
        print(f"Chybi {SNAPSHOT_NAME} — spust --record.", file=sys.stderr)
        return 1
    if current["waivers"]["invalid"]:
        _print_invalid(current)
        return 1
    if snapshot.get("definition") != current["definition"]:
        print(
            "ZMENA DEFINICE MERENI — stara a nova cisla nejsou srovnatelna.\n"
            f"  snimek {snapshot.get('definition')} vs. meridlo {current['definition']}\n"
            "  Zvedni to vedome vlastnim PR: --record a v popisu napis, co se v definici zmenilo.",
            file=sys.stderr,
        )
        return 3
    drift = _drift(current, snapshot)
    if drift:
        _print_drift(current, snapshot, drift)
        return 1
    print(f"OK — index {current['index']} sedi se snimkem (definice {current['definition']}).")
    return 0


def _build_parser():
    parser = argparse.ArgumentParser(description="ETH-277 zdravotni ukazatel repa")
    parser.add_argument("--record", action="store_true", help="zapis bod do .quality-health.json")
    parser.add_argument("--check", action="store_true", help="CI brana proti snimku")
    parser.add_argument("--trend", action="store_true", help="tabulka trendu z historie gitu")
    parser.add_argument("--alarm", action="store_true", help="s --trend: selze pri rustu za okno")
    parser.add_argument("--window-days", type=int, default=28, help="okno pro --alarm (dni)")
    parser.add_argument("--selftest", action="store_true", help="negativni kontroly meridla")
    parser.add_argument("--baseline-json", help="hotovy report meridla limitu (pro testy)")
    return parser


def main(argv=None):
    args = _build_parser().parse_args(argv)
    if args.selftest:
        return _sourozenec("health_selftest").run_selftest()
    if args.trend:
        return _sourozenec("health_trend").trend_mode(ROOT, args)
    try:
        current = build_point(ROOT, canned=args.baseline_json)
    except waivers_module().MeasurementError as exc:
        print(f"MERIDLO NEMERI: {exc}", file=sys.stderr)
        return 3
    if args.record:
        return record_mode(current, ROOT)
    if args.check:
        return check_mode(current, ROOT)
    print(json.dumps(current, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
