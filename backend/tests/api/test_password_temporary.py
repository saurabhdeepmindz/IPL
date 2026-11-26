"""
@file           test_password_temporary.py
@module         API contract tests, temporary password
@description    Calls API-PWD-04 of the running Auth API and a route of the main API.
                In plain words: shows that a user with a temporary password can do nothing else, can change it, and that a wrong temporary password counts as a failed sign-in.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-27

@story          US-LGN02-004
@subtask        ST-LGN02-004-BE-04

@lld            LLD-EPIC-LGN-02 v0.3 section 8
@lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/api/test_password_temporary.py
@lld-synced     v0.3
@status         built
"""

import requests
from conftest import AUTH, TEST_PASSWORD, bearer


def sign_in(code: str, password: str = TEST_PASSWORD):
    return requests.post(f"{AUTH}/sign-in", json={"employeeCode": code, "password": password}, timeout=15)


def change(token: str, temporary: str, new: str):
    return requests.post(f"{AUTH}/password/change-temporary", json={"temporaryPassword": temporary, "newPassword": new}, headers=bearer(token), timeout=15)


def test_tc_lgn02_004_p01(api, local_user):
    """@tc TC-LGN02-004-P01 @story US-LGN02-004 @ac AC-US-LGN02-004-01 @subtask ST-LGN02-004-BE-04
    In plain words: a user who must change the password is refused (403 MUST_CHANGE_PASSWORD) on every other route."""
    _, code = local_user(must_change=True)
    token = sign_in(code).json()["data"]["accessToken"]
    res = requests.get(f"{api}/users", headers=bearer(token), timeout=10)
    assert res.status_code == 403 and res.json()["error"]["code"] == "MUST_CHANGE_PASSWORD"


def test_tc_lgn02_004_p02(local_user):
    """@tc TC-LGN02-004-P02 @story US-LGN02-004 @ac AC-US-LGN02-004-02 @subtask ST-LGN02-004-BE-04
    In plain words: the right temporary password and a good different new password are accepted; the flag is cleared and a new session is issued."""
    _, code = local_user(must_change=True)
    token = sign_in(code).json()["data"]["accessToken"]
    assert change(token, TEST_PASSWORD, TEST_PASSWORD).json()["error"]["code"] == "SAME_AS_TEMPORARY"
    res = change(token, TEST_PASSWORD, "Newpass1!")
    assert res.status_code == 200 and res.json()["data"]["nextStep"] == "CHOOSE_WORK" and res.json()["data"]["accessToken"]
    again = sign_in(code, "Newpass1!")
    assert again.status_code == 200 and again.json()["data"]["nextStep"] == "CHOOSE_WORK"
    assert change(token, TEST_PASSWORD, "Another1!").status_code == 409


def test_tc_lgn02_004_p03(local_user, db):
    """@tc TC-LGN02-004-P03 @story US-LGN02-004 @ac AC-US-LGN02-004-03 @subtask ST-LGN02-004-BE-04
    In plain words: a wrong temporary password is 401 INVALID_CREDENTIALS and adds one failed attempt."""
    user_id, code = local_user(must_change=True)
    token = sign_in(code).json()["data"]["accessToken"]
    res = change(token, "wrong-temp", "Newpass1!")
    assert res.status_code == 401 and res.json()["error"]["code"] == "INVALID_CREDENTIALS"
    assert db.run("SELECT failed_attempts FROM users WHERE id = CAST(:u AS uuid)", u=user_id)[0][0] == 1
