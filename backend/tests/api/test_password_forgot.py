"""
@file           test_password_forgot.py
@module         API contract tests, forgot password
@description    Calls API-PWD-01 of the running Auth API.
                In plain words: shows that the reset request answers the same for every pair, queues one e-mail for a match, waits 60 seconds and has a limit.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-27

@story          US-LGN02-001
@subtask        ST-LGN02-001-BE-04

@lld            LLD-EPIC-LGN-02 v0.5 section 8
@lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/api/test_password_forgot.py
@lld-synced     v0.5
@status         built
"""

import uuid

import pytest
import requests
from conftest import AUTH, link_token, make_reset_token, trap_messages, user_email, wait_for_mail  # noqa: F401


def ask(code: str, email: str):
    return requests.post(f"{AUTH}/password/forgot", json={"employeeCode": code, "email": email}, timeout=15)


def test_tc_lgn02_001_p01(local_user, db):
    """@tc TC-LGN02-001-P01 @story US-LGN02-001 @ac AC-US-LGN02-001-01 @subtask ST-LGN02-001-BE-04
    In plain words: the answer is the same 202 whether or not the code and e-mail match."""
    _, code = local_user()
    hit = ask(code, user_email(db, code))
    miss = ask(str(90000 + int(uuid.uuid4().hex[:4], 16) % 9999), "nobody@example.invalid")
    wrong = ask(code, "wrong@example.invalid")
    assert hit.status_code == miss.status_code == 202
    assert hit.json() == miss.json()
    assert wrong.json()["data"]["message"] == hit.json()["data"]["message"]


def test_tc_lgn02_001_p02(local_user, db):
    """@tc TC-LGN02-001-P02 @story US-LGN02-001 @ac AC-US-LGN02-001-02 @subtask ST-LGN02-001-BE-04
    In plain words: a matching user gets one reset e-mail with a link; only the hash of the token is stored; the link works once."""
    user_id, code = local_user()
    address = user_email(db, code)
    assert ask(code, address).status_code == 202
    token = link_token(wait_for_mail(address, "Reset your AMS password"))
    stored = [r[0] for r in db.run("SELECT token_hash FROM password_reset_tokens WHERE user_id = CAST(:u AS uuid)", u=user_id)]
    assert len(stored) == 1 and stored[0] != token and len(stored[0]) == 64
    assert requests.get(f"{AUTH}/password/reset/{token}", timeout=10).status_code == 200


def test_tc_lgn02_001_p03(local_user, db):
    """@tc TC-LGN02-001-P03 @story US-LGN02-001 @ac AC-US-LGN02-001-03 @subtask ST-LGN02-001-BE-04
    In plain words: a second request within 60 seconds sends nothing new and carries the time left."""
    _, code = local_user()
    address = user_email(db, code)
    ask(code, address)
    wait_for_mail(address, "Reset your AMS password")
    second = ask(code, address)
    assert second.status_code == 202
    assert 0 < second.json()["data"]["retryAfterSeconds"] <= 60
    assert len(trap_messages(address)) == 1


def test_tc_lgn02_001_p04(local_user, db):
    """@tc TC-LGN02-001-P04 @story US-LGN02-001 @ac AC-US-LGN02-001-04 @subtask ST-LGN02-001-BE-04
    In plain words: a single sign-on user gets the same 202 and no e-mail."""
    user_id, code = local_user()
    db.run("UPDATE users SET auth_type = 'SSO' WHERE id = CAST(:u AS uuid)", u=user_id)
    res = ask(code, user_email(db, code))
    assert res.status_code == 202
    assert db.run("SELECT count(*) FROM password_reset_tokens WHERE user_id = CAST(:u AS uuid)", u=user_id)[0][0] == 0
    assert trap_messages(user_email(db, code)) == []


def test_tc_lgn02_001_p05(local_user, db):
    """@tc TC-LGN02-001-P05 @story US-LGN02-001 @ac AC-US-LGN02-001-05 @subtask ST-LGN02-001-BE-04
    In plain words: after 3 requests for one employee code in the window, the next gets 429."""
    _, code = local_user()
    address = user_email(db, code)
    assert [ask(code, address).status_code for _ in range(3)] == [202, 202, 202]
    res = ask(code, address)
    assert res.status_code == 429
    assert res.json()["error"]["code"] == "RATE_LIMITED"
