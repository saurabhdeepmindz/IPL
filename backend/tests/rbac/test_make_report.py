"""
@file           test_make_report.py
@module         RBAC negative test pack, report test
@description    Tests of the report script.
                In plain words: a small fixed input gives a fixed report and a second run does not overwrite the first.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-25

@story          US-ADM01-018
@subtask        ST-ADM01-018-IN-03
@lld            LLD-EPIC-ADM-01 v0.29 6.9
@lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
@pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/rbac/test_make_report.py
@lld-synced     v0.29
@status         elaborated
"""

import json
from pathlib import Path

from make_report import write_report

API = {
    "matrixVersion": "12",
    "permissions": ["audit.view", "users.manage", "users.view"],
    "noRoute": ["audit.view"],
    "roles": {"Administrator": ["audit.view", "users.manage", "users.view"], "Initiator": []},
    "cases": [
        {"role": "Administrator", "method": "GET", "path": "/users", "permission": "users.view", "cell": True, "expected": "allowed", "status": 200, "passed": True},
        {"role": "Initiator", "method": "POST", "path": "/users", "permission": "users.manage", "cell": False, "expected": "refused", "status": 403, "passed": True},
        {"role": "Initiator", "method": "GET", "path": "/users", "permission": "users.view", "cell": False, "expected": "refused", "status": 403, "passed": True},
        {"role": "Initiator", "method": "GET", "path": "/users/ZZ999", "permission": "users.view", "cell": False, "expected": "refused", "status": 200, "passed": False},
    ],
}
SCREENS = {
    "cases": [
        {"role": "Administrator", "screen": "User Management", "permission": "users.view", "expected": "opens", "passed": True},
        {"role": "Initiator", "screen": "User Management", "permission": "users.view", "expected": "no-access", "passed": True},
    ]
}


def make(tmp_path: Path, date: str = "2026-11-25") -> Path:
    (tmp_path / "in").mkdir(exist_ok=True)
    a, s = tmp_path / "in" / "rbac-api.json", tmp_path / "in" / "rbac-screens.json"
    a.write_text(json.dumps(API), encoding="utf-8")
    s.write_text(json.dumps(SCREENS), encoding="utf-8")
    return write_report(a, s, tmp_path / "out", date)


def test_report_is_made_from_a_fixed_input(tmp_path):
    """
    @tc TC-ADM01-018-P02
    @story US-ADM01-018
    @ac AC-US018-01
    @subtask ST-ADM01-018-IN-03
    In plain words: 3 passed and 1 failed give a report that lists the roles, the counts, the matrix version and the failure with its matrix cell.
    """
    path = make(tmp_path)
    assert path == tmp_path / "out" / "2026-11-25" / "RBAC-report.md"
    text = path.read_text(encoding="utf-8")
    assert "# RBAC test report" in text
    assert "2026-11-25" in text and "Matrix version: 12" in text
    assert "Result: FAIL" in text
    assert "API cases: 4 (3 passed, 1 failed)" in text
    assert "Screen cases: 2 (2 passed, 0 failed)" in text
    assert "| Administrator | audit.view, users.manage, users.view | 1 | 1 | 0 | 1 | 1 | 0 |" in text
    assert "| Initiator | - | 3 | 2 | 1 | 1 | 1 | 0 |" in text
    assert "| Initiator | User Management | users.view | no-access | pass |" in text
    assert "audit.view" in text.split("no route yet")[1]
    assert "Initiator GET /users/ZZ999" in text.split("## Failures")[1]
    assert "users.view is not allowed" in text.split("## Failures")[1]


def test_second_run_does_not_overwrite(tmp_path):
    """
    @tc TC-ADM01-018-P02
    @story US-ADM01-018
    @ac AC-US018-01
    @subtask ST-ADM01-018-IN-03
    In plain words: supporting test. A second report on the same day goes to a new folder and the first is untouched.
    """
    first = make(tmp_path)
    before = first.read_text(encoding="utf-8")
    second = make(tmp_path)
    third = make(tmp_path)
    assert second == tmp_path / "out" / "2026-11-25-2" / "RBAC-report.md"
    assert third == tmp_path / "out" / "2026-11-25-3" / "RBAC-report.md"
    assert first.read_text(encoding="utf-8") == before


def test_all_passed_gives_pass(tmp_path):
    """
    @tc TC-ADM01-018-P02
    @story US-ADM01-018
    @ac AC-US018-01
    @subtask ST-ADM01-018-IN-03
    In plain words: supporting test. When every case passed the report says PASS and the failure list says none.
    """
    api = {**API, "cases": [c for c in API["cases"] if c["passed"]]}
    (tmp_path / "in").mkdir()
    a, s = tmp_path / "in" / "a.json", tmp_path / "in" / "s.json"
    a.write_text(json.dumps(api), encoding="utf-8")
    s.write_text(json.dumps(SCREENS), encoding="utf-8")
    text = write_report(a, s, tmp_path / "out", "2026-11-26").read_text(encoding="utf-8")
    assert "Result: PASS" in text
    assert "None." in text.split("## Failures")[1]
