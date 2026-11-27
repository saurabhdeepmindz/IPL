"""
@file           test_it_password_flow.py
@module         API contract tests
@description    pytest cases of US-LGN02-009 (QA engineer verifies the reset and temporary-password flows end to end). In plain words: the whole reset and the temporary-password change are walked through the public Auth API with the real mail worker and the local mail trap.
@author         Deepmindz AMS team
@version        1.0.0
@since          2026-11-26

@story          US-LGN02-009
@subtask        ST-LGN02-009-IN-01
@lld            LLD-EPIC-LGN-02 v0.3 10
@lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/api/test_it_password_flow.py
@lld-synced     v0.3
@status         built
"""

import os

import requests
from conftest import AUTH, TEST_PASSWORD, bearer, link_token, message_text, trap_messages, user_email, wait_for_mail

WEB_BASE = os.environ.get("WEB_BASE_URL", "http://localhost:3001")
NEW_PASSWORD = "Fresh#Pass2026"
SUBJECT = "Reset your AMS password"


def sign_in(code: str, password: str):
    return requests.post(f"{AUTH}/sign-in", json={"employeeCode": code, "password": password}, timeout=15)


def ask_for_link(code: str, address: str):
    return requests.post(f"{AUTH}/password/forgot", json={"employeeCode": code, "email": address}, timeout=15)


def reset(token: str, password: str):
    return requests.post(f"{AUTH}/password/reset", json={"token": token, "newPassword": password}, timeout=15)


def test_tc_lgn02_009_p01(local_user, db):
    """@tc TC-LGN02-009-P01
    @story US-LGN02-009
    @ac AC-US-LGN02-009-01
    @subtask ST-LGN02-009-IN-01
    In plain words: a reset request for a local user puts exactly one e-mail in the mail trap, sent to that user, with one link that opens the set-password page and carries a token the API accepts; the text holds no password."""
    _, code = local_user()
    address = user_email(db, code)
    assert ask_for_link(code, address).status_code == 202
    item = wait_for_mail(address, SUBJECT)
    assert len(trap_messages(address)) == 1
    text = message_text(item)
    token = link_token(item)
    assert f"{WEB_BASE}/set-password?token={token}" in text
    assert text.count("token=") == 1
    assert TEST_PASSWORD not in text
    check = requests.get(f"{AUTH}/password/reset/{token}", timeout=10)
    assert check.status_code == 200 and check.json()["data"]["valid"] is True


def test_tc_lgn02_009_p02(local_user, db):
    """@tc TC-LGN02-009-P02
    @story US-LGN02-009
    @ac AC-US-LGN02-009-02
    @subtask ST-LGN02-009-IN-01
    In plain words: the link from the mail and a valid password save the new password: it signs in, the old one does not, and the same link is refused afterwards (410)."""
    _, code = local_user()
    address = user_email(db, code)
    ask_for_link(code, address)
    token = link_token(wait_for_mail(address, SUBJECT))
    assert reset(token, NEW_PASSWORD).status_code == 200
    again = sign_in(code, NEW_PASSWORD)
    assert again.status_code == 200 and again.json()["data"]["nextStep"] == "CHOOSE_WORK"
    assert sign_in(code, TEST_PASSWORD).status_code == 401
    used = reset(token, "Another#Pass2027")
    assert used.status_code == 410 and used.json()["error"]["code"] == "LINK_EXPIRED"
    assert requests.get(f"{AUTH}/password/reset/{token}", timeout=10).status_code == 410


def test_tc_lgn02_009_p03(local_user):
    """@tc TC-LGN02-009-P03
    @story US-LGN02-009
    @ac AC-US-LGN02-009-03
    @subtask ST-LGN02-009-IN-01
    In plain words: a user with a temporary password signs in and is told to change it, changes it with the token of that sign-in, and the answer leads on to company and year; the new password then signs in without the change step."""
    _, code = local_user(must_change=True)
    first = sign_in(code, TEST_PASSWORD)
    assert first.status_code == 200 and first.json()["data"]["nextStep"] == "CHANGE_PASSWORD"
    changed = requests.post(
        f"{AUTH}/password/change-temporary",
        json={"temporaryPassword": TEST_PASSWORD, "newPassword": NEW_PASSWORD},
        headers=bearer(first.json()["data"]["accessToken"]),
        timeout=15,
    )
    assert changed.status_code == 200 and changed.json()["data"]["nextStep"] == "CHOOSE_WORK"
    assert changed.json()["data"]["accessToken"]
    later = sign_in(code, NEW_PASSWORD)
    assert later.status_code == 200 and later.json()["data"]["nextStep"] == "CHOOSE_WORK"
    assert sign_in(code, TEST_PASSWORD).status_code == 401
