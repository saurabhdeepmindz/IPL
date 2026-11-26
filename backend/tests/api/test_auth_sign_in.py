"""
@file           test_auth_sign_in.py
@module         API contract tests
@description    pytest cases of US-LGN01-001 (System signs a user in with employee code and password). In plain words: every case is skipped with a reason until /dev writes it first.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-26

@story          US-LGN01-001
@subtask        ST-LGN01-001-BE-04
@contract       API-AUTH-01
@lld            LLD-EPIC-LGN-01 v0.4 10
@lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/api/test_auth_sign_in.py
@lld-synced     v0.4
@status         built
"""

import re

import requests
from conftest import TEST_PASSWORD, audit_after


def post(auth_api, code, password, **kw):
    return requests.post(f"{auth_api}/sign-in", json={"employeeCode": code, "password": password}, timeout=15, **kw)


def test_tc_lgn01_001_p01(auth_api, local_user):
    """@tc TC-LGN01-001-P01 @story US-LGN01-001 @ac AC-US-LGN01-001-01 @subtask ST-LGN01-001-BE-04
    The right code and password give 200, the next step, an access token and a secure refresh cookie."""
    _, code = local_user()
    r = post(auth_api, code, TEST_PASSWORD)
    assert r.status_code == 200
    data = r.json()["data"]
    assert data["nextStep"] == "CHOOSE_WORK"
    assert data["user"]["employeeCode"] == code
    assert data["accessToken"].count(".") == 2 and data["expiresIn"] == 900
    cookie = r.headers["set-cookie"]
    assert "ams_refresh=" in cookie and "HttpOnly" in cookie and "SameSite=Strict" in cookie
    assert "refreshToken" not in r.text


def test_tc_lgn01_001_p02(auth_api, local_user, db):
    """@tc TC-LGN01-001-P02 @story US-LGN01-001 @ac AC-US-LGN01-001-02 @subtask ST-LGN01-001-BE-04
    One audit row per attempt: the code as typed, the result; never the password."""
    _, code = local_user()
    post(auth_api, code, TEST_PASSWORD)
    post(auth_api, code, "Wrong-pass-1")
    rows = audit_after(db, code)
    assert len(rows) == 2
    assert '"SUCCESS"' in rows[0] and '"INVALID_CREDENTIALS"' in rows[1]
    assert TEST_PASSWORD not in "".join(rows) and "Wrong-pass-1" not in "".join(rows)


def test_tc_lgn01_001_p03(auth_api, local_user):
    """@tc TC-LGN01-001-P03 @story US-LGN01-001 @ac AC-US-LGN01-001-03 @subtask ST-LGN01-001-BE-04
    One call finishes the sign-in: there is no second factor step in the answer."""
    _, code = local_user()
    data = post(auth_api, code, TEST_PASSWORD).json()["data"]
    assert set(data) == {"nextStep", "user", "accessToken", "expiresIn"}


def test_tc_lgn01_001_p04(auth_api, local_user):
    """@tc TC-LGN01-001-P04 @story US-LGN01-001 @ac AC-US-LGN01-001-04 @subtask ST-LGN01-001-BE-04
    A wrong code and a wrong password give the same 401 answer."""
    _, code = local_user()
    unknown = post(auth_api, "70001", "whatever")
    wrong = post(auth_api, code, "whatever")
    assert unknown.status_code == wrong.status_code == 401
    assert unknown.json() == wrong.json()
    assert unknown.json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_tc_lgn01_001_p05(auth_api, local_user, db):
    """@tc TC-LGN01-001-P05 @story US-LGN01-001 @ac AC-US-LGN01-001-05 @subtask ST-LGN01-001-BE-04
    The 5th wrong password gives 423 with the lock time and a reference; the user is LOCKED."""
    user_id, code = local_user()
    codes = [post(auth_api, code, "nope").status_code for _ in range(5)]
    assert codes == [401, 401, 401, 401, 423]
    last = post(auth_api, code, "nope").json()["error"]
    assert last["code"] == "ACCOUNT_LOCKED" and re.match(r"^LCK-\d{4}-[A-Z0-9]{4}$", last["details"]["reference"]) and last["details"]["lockedUntil"]
    assert db.run("SELECT status::text FROM users WHERE id = CAST(:u AS uuid)", u=user_id)[0][0] == "LOCKED"


def test_tc_lgn01_001_p06(auth_api, local_user, db):
    """@tc TC-LGN01-001-P06 @story US-LGN01-001 @ac AC-US-LGN01-001-06 @subtask ST-LGN01-001-BE-04
    A locked account refuses the right password; once the lock time has passed the sign-in works and the count is cleared."""
    user_id, code = local_user()
    for _ in range(5):
        post(auth_api, code, "nope")
    assert post(auth_api, code, TEST_PASSWORD).status_code == 423
    db.run("UPDATE users SET locked_until = now() - interval '1 minute' WHERE id = CAST(:u AS uuid)", u=user_id)
    assert post(auth_api, code, TEST_PASSWORD).status_code == 200
    row = db.run("SELECT status::text, failed_attempts, locked_until FROM users WHERE id = CAST(:u AS uuid)", u=user_id)[0]
    assert row[0] == "ACTIVE" and row[1] == 0 and row[2] is None


def test_tc_lgn01_001_p07(auth_api, local_user):
    """@tc TC-LGN01-001-P07 @story US-LGN01-001 @ac AC-US-LGN01-001-07 @subtask ST-LGN01-001-BE-04
    A deactivated user gets 403 ACCOUNT_INACTIVE with a reference."""
    _, code = local_user(status="INACTIVE")
    r = post(auth_api, code, TEST_PASSWORD)
    assert r.status_code == 403
    err = r.json()["error"]
    assert err["code"] == "ACCOUNT_INACTIVE" and re.match(r"^INA-\d{4}-[A-Z0-9]{4}$", err["details"]["reference"])


def test_validation_and_must_change(auth_api, local_user):
    """A bad body is 422 with field errors; a user who must change the password is sent to that step."""
    assert post(auth_api, "12", "").status_code == 422
    _, code = local_user(must_change=True)
    assert post(auth_api, code, TEST_PASSWORD).json()["data"]["nextStep"] == "CHANGE_PASSWORD"
