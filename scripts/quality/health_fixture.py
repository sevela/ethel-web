"""ETH-277: fixture strom pro `--selftest` (`health_selftest.py`).

Oddeleno od `health_selftest.py` schvalne: selftest prerostl mekky limit 400 radku,
ktery sam hlida. Vyjimka by tady byla ta nejhorsi moznost — prvni polozkou v seznamu
"vedome se nedivame" by bylo meridlo, ktere ten seznam vede.

Tady zije **jak se fixture postavi** (minimalni git repo, workflow, karanteny,
hotovy report meridla limitu). Co se v nem schvalne pokazi a jaky exit kod se
ceka, je v `health_selftest.py`.
"""

import json
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
HEALTH = HERE / "health.py"

WORKFLOW_CLEAN = """name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo ok
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: echo ok
"""

WORKFLOW_SILENCED = WORKFLOW_CLEAN.replace(
    "  lint:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo ok\n",
    "  lint:\n    runs-on: ubuntu-latest\n    steps:\n      - continue-on-error: true\n"
    "        run: echo ok\n",
)

CANNED_BASELINE = {
    "ecosystem": "python",
    "measured_by": "fixture",
    "limits": {"file_lines": {"soft": 400, "hard": 600}},
    "measurement_scope": {"excluded_dir_parts": [".git"], "extensions": [".py"]},
    "violations": {
        "files": [{"path": "a.py", "metric": "file_lines", "value": 700, "level": "hard"}],
        "functions": [
            {"path": "a.py", "name": "f", "metric": "params", "value": 6, "level": "soft"}
        ],
        "classes": [],
    },
    "top10_worst_files": [{"path": "a.py", "lines": 700, "max_complexity": 12, "score": 0.933}],
}


def _run_git(root, *args, env_extra=None):
    env = dict(os.environ)
    env.setdefault("GIT_AUTHOR_NAME", "selftest")
    env.setdefault("GIT_AUTHOR_EMAIL", "selftest@example.com")
    env.setdefault("GIT_COMMITTER_NAME", "selftest")
    env.setdefault("GIT_COMMITTER_EMAIL", "selftest@example.com")
    env.update(env_extra or {})
    return subprocess.run(
        ["git", *args], cwd=str(root), capture_output=True, text=True, env=env, check=True
    )


def _write(root, rel, text):
    path = root / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    return path


def _build_fixture(root):
    """Minimalni repo: jeden zdrojak, jeden workflow, prazdne karanteny."""
    _run_git(root, "init", "-q")
    _write(root, "a.py", "def f(a, b, c, d, e, g):\n    return a\n")
    _write(root, ".github/workflows/ci.yml", WORKFLOW_CLEAN)
    _write(root, ".quality-quarantine.json", json.dumps({"quarantine": []}))
    _write(root, ".security-quarantine.json", json.dumps({"accepted_advisories": []}))
    _write(root, ".quality-refactor.json", json.dumps({"allowances": []}))
    # Znacka "meridlo limitu v tomhle repu umi vyjimky" — viz `waivers()`.
    _write(root, "scripts/quality/allowances.py", "# fixture\n")
    _run_git(root, "add", "a.py", ".github/workflows/ci.yml")
    canned = _write(root, "canned.json", json.dumps(CANNED_BASELINE))
    return canned


def _health(root, canned, *args):
    env = dict(os.environ, ETHEL_HEALTH_ROOT=str(root), PYTHONUTF8="1", PYTHONIOENCODING="utf-8")
    env.pop("ETHEL_HEALTH_BASELINE_CMD", None)
    cmd = [sys.executable, str(HEALTH), *args]
    if canned:
        cmd += ["--baseline-json", str(canned)]
    return subprocess.run(cmd, cwd=str(root), capture_output=True, text=True, env=env)


def _snapshot(index, waivers_total, den):
    return {
        "schema_version": 1,
        "recorded_at": den,
        "ecosystem": "python",
        "definition": "abcdef123456",
        "index": index,
        "structure": {
            "soft": index,
            "hard": 0,
            "items": index,
            "worst_score": 1.0,
            "debt_score": 1.0,
            "worst_file": "a.py",
        },
        "waivers": {"total": waivers_total, "invalid": []},
        "size": {"source_files": 1, "source_lines": 2},
    }


def _commit_snapshot(root, point, den):
    _write(root, ".quality-health.json", json.dumps(point))
    _run_git(root, "add", ".quality-health.json")
    stamp = f"{den}T12:00:00+00:00"
    _run_git(
        root,
        "commit",
        "-q",
        "-m",
        f"snimek {den}",
        env_extra={"GIT_AUTHOR_DATE": stamp, "GIT_COMMITTER_DATE": stamp},
    )
