"""
@file           test_password_reset.py
@module         API contract tests, reset link
@description    Calls API-PWD-02 and API-PWD-03 of the running Auth API.
                In plain words: shows that a used, old or replaced link is refused alike and that a good link sets the password and ends the other sessions.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-27

@story          US-LGN02-002
@subtask        ST-LGN02-002-BE-04

@lld            LLD-EPIC-LGN-02 v0.5 section 8
@lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/api/test_password_reset.py
@lld-synced     v0.5
@status         built
"""

import pytest
import requests
from conftest import AUTH, TEST_PASSWORD, make_reset_token


def reset(token: str, password: str):
    return requests.post(f"{AUTH}/password/reset", json={"token": token, "newPassword": password}, timeout=15)


def test_tc_lgn02_002_p01(local_user, db):
    """@tc TC-LGN02-002-P01 @story US-LGN02-002 @ac AC-US-LGN02-002-01 @subtask ST-LGN02-002-BE-04
    In plain words: an unknown, an old and a replaced link all answer 410 LINK_EXPIRED, on the check and on the reset."""
    user_id, _ = local_user()
    old = make_reset_token(db, user_id, age_minutes=31)
    replaced = make_reset_token(db, user_id)
    db.run("UPDATE password_reset_tokens SET replaced_at = now() WHERE user_id = CAST(:u AS uuid) AND replaced_at IS NULL AND issued_at > now() - interval '5 minutes'", u=user_id)
    for token in (old, replaced, "not-a-token"):
        assert requests.get(f"{AUTH}/password/reset/{token}", timeout=10).status_code == 410
        res = reset(token, "Newpass1!")
        assert res.status_code == 410 and res.json()["error"]["code"] == "LINK_EXPIRED"


def test_tc_lgn02_002_p02(local_user, db):
    """@tc TC-LGN02-002-P02 @story US-LGN02-002 @ac AC-US-LGN02-002-02 @subtask ST-LGN02-002-BE-04
    In plain words: a good link and a good password save the password, use the link up, keep the history and end the other sessions."""
    user_id, code = local_user()
    session = requests.Session()
    signed = session.post(f"{AUTH}/sign-in", json={"employeeCode": code, "password": TEST_PASSWORD}, timeout=15)
    assert signed.status_code == 200
    token = make_reset_token(db, user_id)
    assert requests.get(f"{AUTH}/password/reset/{token}", timeout=10).json()["data"]["valid"] is True
    assert reset(token, "Newpass1!").status_code == 200
    assert reset(token, "Another1!").status_code == 410
    assert requests.post(f"{AUTH}/sign-in", json={"employeeCode": code, "password": "Newpass1!"}, timeout=15).status_code == 200
    assert requests.post(f"{AUTH}/sign-in", json={"employeeCode": code, "password": TEST_PASSWORD}, timeout=15).status_code == 401
    assert db.run("SELECT count(*) FROM password_history WHERE user_id = CAST(:u AS uuid)", u=user_id)[0][0] == 1
    assert session.post(f"{AUTH}/refresh", timeout=10).status_code == 401
