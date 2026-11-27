"""
@file           test_users_import.py
@module         API contract tests, users import
@description    Calls the two import routes of the running API and checks the answers.
                In plain words: shows through the API that the check saves nothing, the import creates the good rows, 201 rows are refused, and only users.manage may call.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-26

@story          US-ADM01-009
@subtask        ST-ADM01-009-IN-03
@lld            LLD-EPIC-ADM-01 v0.30 6.2
@lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
@pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/tests/api/test_users_import.py
@lld-synced     v0.30
@status         built
"""

import uuid

import pytest
import requests
from conftest import bearer
from codes import free_code


@pytest.fixture()
def imp(api, admin_token, db, made):
    """Import helpers as the Administrator. Every user the import creates is removed with its audit rows and one-time passwords."""
    codes: list[str] = []
    role_id, _ = made.role({})
    dept = str(db.run("SELECT id FROM departments ORDER BY code LIMIT 1")[0][0])
    desig = str(db.run("SELECT id FROM designations WHERE NOT is_highest ORDER BY code LIMIT 1")[0][0])

    class Import:
        def row(self, n: int | None = None, **over) -> dict:
            code = free_code(db, 50000, 9999) if n is None else str(n)
            codes.append(code)
            base = {
                "employeeCode": code, "fullName": f"Import {code}", "email": f"imp{code}@example.invalid", "mobile": "9876543210",
                "departmentId": dept, "designationId": desig, "reportingManagerCode": "10001", "signIn": "LOCAL",
                "companies": [{"companyCode": "IPL", "roleIds": [role_id], "validFrom": "2026-12-01"}],
            }
            return {**base, **over}

        def check(self, rows: list, token: str | None = None):
            return requests.post(f"{api}/users/import/check", json={"rows": rows}, headers=bearer(token or admin_token), timeout=30)

        def run(self, rows: list, token: str | None = None):
            return requests.post(f"{api}/users/import", json={"rows": rows}, headers=bearer(token or admin_token), timeout=60)

        def count(self, code: str) -> int:
            return int(db.run("SELECT count(*) FROM users WHERE employee_code = :c", c=code)[0][0])

    yield Import()

    for code in codes:
        for (uid,) in db.run("SELECT id FROM users WHERE employee_code = :c", c=code):
            db.run("DELETE FROM audit_log WHERE entity = 'User' AND entity_key = :k", k=str(uid))
            db.run("DELETE FROM one_time_passwords WHERE user_id = CAST(:u AS uuid)", u=str(uid))
            db.run("DELETE FROM user_company_roles WHERE user_id = CAST(:u AS uuid)", u=str(uid))
            db.run("DELETE FROM users WHERE id = CAST(:u AS uuid)", u=str(uid))


def test_check_saves_nothing_and_reports_rows(imp):
    """
    @tc TC-ADM01-009-P02
    @story US-ADM01-009
    @ac AC-US009-03
    @contract API-USR-09
    @subtask ST-ADM01-009-IN-03
    In plain words: a list of 3 rows, one with a repeated e-mail: the answer lists that row with field and message; no user exists afterwards.
    """
    good_a, good_b = imp.row(), imp.row()
    bad = imp.row(email=good_a["email"])
    res = imp.check([good_a, bad, good_b])
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert data["checked"] == 3
    assert [(f["row"], f["field"]) for f in data["failed"]] == [(2, "email")]
    assert data["failed"][0]["message"]
    assert [imp.count(r["employeeCode"]) for r in (good_a, bad, good_b)] == [0, 0, 0]


def test_import_creates_good_rows_only(imp, db):
    """
    @tc TC-ADM01-009-P02
    @story US-ADM01-009
    @ac AC-US009-01
    @contract API-USR-09
    @subtask ST-ADM01-009-IN-03
    In plain words: the good rows are created with their company roles; a bad row is reported; with no good row the answer is 422 BULK_IMPORT_FAILED.
    """
    good_a, good_b = imp.row(), imp.row()
    bad = imp.row(fullName="")
    res = imp.run([good_a, bad, good_b])
    assert res.status_code == 201, res.text
    data = res.json()["data"]
    assert data["created"] == 2
    assert [(f["row"], f["field"]) for f in data["failed"]] == [(2, "fullName")]
    assert [imp.count(r["employeeCode"]) for r in (good_a, bad, good_b)] == [1, 0, 1]
    uid = str(db.run("SELECT id FROM users WHERE employee_code = :c", c=good_a["employeeCode"])[0][0])
    assert db.run("SELECT count(*) FROM user_company_roles WHERE user_id = CAST(:u AS uuid)", u=uid) == [[1]]
    assert db.run("SELECT reason FROM audit_log WHERE entity = 'User' AND entity_key = :k", k=uid) == [["Excel import"]]
    none = imp.run([imp.row(fullName="")])
    assert (none.status_code, none.json()["error"]["code"]) == (422, "BULK_IMPORT_FAILED")
    assert none.json()["error"]["fields"][0]["field"] == "rows.1.fullName"


def test_import_refuses_201_rows_and_other_roles(imp, made, sign_in):
    """
    @tc TC-ADM01-009-P02
    @story US-ADM01-009
    @ac AC-US009-04
    @contract API-USR-09
    @subtask ST-ADM01-009-IN-03
    In plain words: 201 rows give 422; no rows give 422; a user without users.manage gets 403 FORBIDDEN on both routes.
    """
    row = imp.row()
    too_many = [{**row, "employeeCode": f"{60000 + i}", "email": f"many{i}@example.invalid"} for i in range(201)]
    for call in (imp.check, imp.run):
        res = call(too_many)
        assert (res.status_code, res.json()["error"]["code"]) == (422, "VALIDATION_FAILED")
        assert call([]).status_code == 422
    _, plain_code = made.user(made.role({})[0])
    token = sign_in(plain_code)
    for call in (imp.check, imp.run):
        res = call([row], token=token)
        assert (res.status_code, res.json()["error"]["code"]) == (403, "FORBIDDEN")
    assert imp.count(row["employeeCode"]) == 0
