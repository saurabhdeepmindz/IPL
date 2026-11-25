"""
@file           make_report.py
@module         RBAC negative test pack, report
@description    Writes the RBAC test report from the two result files of a run.
                In plain words: roles, cases, passed and failed, the matrix version and the failures; a folder of an earlier run is never overwritten.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-25

@story          US-ADM01-018
@subtask        ST-ADM01-018-IN-03
@lld            LLD-EPIC-ADM-01 v0.29 6.9
@lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
@pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/rbac/make_report.py
@lld-synced     v0.29
@status         built

Command line: python make_report.py --api rbac-api.json --screens rbac-screens.json --out-root <folder> [--date YYYY-MM-DD]
"""

import argparse
import json
from datetime import date as today
from pathlib import Path


def _counts(cases: list[dict]) -> tuple[int, int, int]:
    """(total, passed, failed) of a list of cases."""
    passed = sum(1 for c in cases if c["passed"])
    return len(cases), passed, len(cases) - passed


def _folder(out_root: Path, day: str) -> Path:
    """The folder of this run: the date, or the date with -2, -3 ... when it exists; never an existing folder."""
    path, n = out_root / day, 1
    while path.exists():
        n += 1
        path = out_root / f"{day}-{n}"
    return path


def write_report(api_json: Path, screens_json: Path, out_root: Path, date: str) -> Path:
    """
    Write RBAC-report.md into out_root/<date> (or <date>-2, -3 ... when it exists) and return its path.

    @story US-ADM01-018
    @subtask ST-ADM01-018-IN-03
    @ac AC-US018-01
    In plain words: reads rbac-api.json and rbac-screens.json and writes the report.

    @param api_json - the result file of the API cases
    @param screens_json - the result file of the screen cases
    @param out_root - the folder that holds one folder per run
    @param date - the date of the run, YYYY-MM-DD
    @returns The path of the report
    """
    api = json.loads(Path(api_json).read_text(encoding="utf-8"))
    screens = json.loads(Path(screens_json).read_text(encoding="utf-8"))
    a_cases, s_cases = api["cases"], screens["cases"]
    a_total, a_pass, a_fail = _counts(a_cases)
    s_total, s_pass, s_fail = _counts(s_cases)
    roles = list(api["roles"].keys())
    lines = [
        "# RBAC test report",
        "",
        f"Date: {date}",
        f"Matrix version: {api['matrixVersion']}",
        f"Result: {'PASS' if a_fail + s_fail == 0 else 'FAIL'}",
        "",
        f"API cases: {a_total} ({a_pass} passed, {a_fail} failed)",
        f"Screen cases: {s_total} ({s_pass} passed, {s_fail} failed)",
        "",
        "Every case is made from the saved permission matrix of this run: a right that is off must be refused (HTTP 403, code FORBIDDEN) and a right that is on must not be refused.",
        "",
        "## Roles",
        "",
        "| Role | Rights held | API cases | Passed | Failed | Screen cases | Passed | Failed |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for role in roles:
        ac = [c for c in a_cases if c["role"] == role]
        sc = [c for c in s_cases if c["role"] == role]
        at, ap, af = _counts(ac)
        st, sp, sf = _counts(sc)
        held = ", ".join(api["roles"][role]) or "-"
        lines.append(f"| {role} | {held} | {at} | {ap} | {af} | {st} | {sp} | {sf} |")
    lines += ["", "## Screens", "", "| Role | Screen | Permission | Expected | Result |", "|---|---|---|---|---|"]
    for c in s_cases:
        lines.append(f"| {c['role']} | {c['screen']} | {c['permission']} | {c['expected']} | {'pass' if c['passed'] else 'FAIL'} |")
    no_route = api.get("noRoute", [])
    lines += ["", "## Permissions that guard no route yet", "", ", ".join(no_route) if no_route else "None.", "", "## Failures", ""]
    failures = []
    for c in a_cases:
        if not c["passed"]:
            failures.append(f"- {c['role']} {c['method']} {c['path']}: {c['permission']} is {'allowed' if c['cell'] else 'not allowed'} in the matrix, expected {c['expected']}, got HTTP {c['status']}")
    for c in s_cases:
        if not c["passed"]:
            failures.append(f"- {c['role']} {c['screen']}: {c['permission']} decides the screen, expected {c['expected']}")
    lines += failures if failures else ["None."]
    lines.append("")
    folder = _folder(Path(out_root), date)
    folder.mkdir(parents=True)
    path = folder / "RBAC-report.md"
    path.write_text("\n".join(lines), encoding="utf-8", newline="\n")
    return path


def main() -> int:
    """Command line entry: writes the report and prints its path."""
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", required=True)
    ap.add_argument("--screens", required=True)
    ap.add_argument("--out-root", required=True)
    ap.add_argument("--date", default=today.today().isoformat())
    a = ap.parse_args()
    print(write_report(Path(a.api), Path(a.screens), Path(a.out_root), a.date))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
