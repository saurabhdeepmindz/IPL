"""
@file           test_it_adm_lgn.py
@module         API contract tests
@description    pytest cases of US-LGN01-009 (QA engineer verifies sign-in end to end with the Administrator module). In plain words: every case is skipped with a reason until /dev writes it first.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-26

@story          US-LGN01-009
@subtask        ST-LGN01-009-IN-01
@lld            LLD-EPIC-LGN-01 v0.5 10
@lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/api/test_it_adm_lgn.py
@lld-synced     v0.5
@status         built
"""

import re
import uuid

import pytest
import requests
from conftest import bearer
from codes import free_code


@pytest.fixture()
def admin_made(api, admin_token, db, made):
    """A user made through the Administrator API (a password user, as in the real flow). The one-time password goes by e-mail, which arrives with EPIC-LGN-02, so the test sets a known password hash in the database instead (see the stand-in register). Everything is removed afterwards."""
    codes: list[str] = []
    role_id, _ = made.role({})
    dept = str(db.run("SELECT id FROM departments ORDER BY code LIMIT 1")[0][0])
    desig = str(db.run("SELECT id FROM designations WHERE NOT is_highest ORDER BY code LIMIT 1")[0][0])

    def _make() -> str:
        code = free_code(db, 60000, 9999)
        codes.append(code)
        body = {
            "employeeCode": code, "fullName": f"IT Login {code}", "email": f"itlogin{code}@example.invalid", "mobile": "9876543210",
            "departmentId": dept, "designationId": desig, "reportingManagerCode": "10001", "signIn": "LOCAL",
            "companies": [{"companyCode": "IPL", "roleIds": [role_id], "validFrom": "2026-12-01"}],
        }
        head = {**bearer(admin_token), "Idempotency-Key": str(uuid.uuid4())}
        assert requests.post(f"{api}/users", json=body, headers=head, timeout=10).status_code == 201
        db.run("UPDATE users SET password_hash = :h WHERE employee_code = :c", h="$2b$12$2jFUI/81n4RIbETaphMEPOz9agYiEQ9ssh5jia3BPY87Dt8B1ectq", c=code)
        return code

    yield _make

    for code in codes:
        for (uid,) in db.run("SELECT id FROM users WHERE employee_code = :c", c=code):
            db.run("DELETE FROM audit_log WHERE entity = 'User' AND entity_key = :k", k=str(uid))
        db.run("DELETE FROM audit_log WHERE entity_key = :c", c=code)
        for (uid,) in db.run("SELECT id FROM users WHERE employee_code = :c", c=code):
            db.run("DELETE FROM one_time_passwords WHERE user_id = CAST(:u AS uuid)", u=str(uid))
            db.run("DELETE FROM user_company_roles WHERE user_id = CAST(:u AS uuid)", u=str(uid))
            db.run("DELETE FROM users WHERE id = CAST(:u AS uuid)", u=str(uid))


def sign_in(auth_api, code, password="Test@12345"):
    return requests.post(f"{auth_api}/sign-in", json={"employeeCode": code, "password": password}, timeout=15)


def test_tc_lgn01_009_p01(auth_api, admin_made):
    """@tc TC-LGN01-009-P01 @story US-LGN01-009 @ac AC-US-LGN01-009-01 @subtask ST-LGN01-009-IN-01
    IT-ADM-LGN: a user the Administrator created signs in with the right password; the user still has the one-time password flag, so the next step is the change-password page."""
    code = admin_made()
    r = sign_in(auth_api, code)
    assert r.status_code == 200
    assert r.json()["data"]["nextStep"] == "CHANGE_PASSWORD"
    assert r.json()["data"]["user"]["employeeCode"] == code


def test_tc_lgn01_009_p02(api, auth_api, admin_made, admin_token, db):
    """@tc TC-LGN01-009-P02 @story US-LGN01-009 @ac AC-US-LGN01-009-02 @subtask ST-LGN01-009-IN-01
    IT-ADM-LGN: five wrong passwords lock the account; the Administrator unlocks it through the Admin API; the user can sign in again."""
    code = admin_made()
    for _ in range(5):
        sign_in(auth_api, code, "wrong-pass")
    assert sign_in(auth_api, code).status_code == 423
    unlocked = requests.post(f"{api}/users/{code}/unlock", headers=bearer(admin_token), timeout=10)
    assert unlocked.status_code == 200
    r = sign_in(auth_api, code)
    assert r.status_code == 200 and r.json()["data"]["nextStep"] == "CHANGE_PASSWORD"
