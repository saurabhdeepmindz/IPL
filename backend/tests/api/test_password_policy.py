"""
@file           test_password_policy.py
@module         API contract tests, password policy
@description    Calls API-PWD-03 with passwords that break the policy.
                In plain words: shows that every broken rule is listed, a refused password does not burn the link, and one of the last three is refused.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-27

@story          US-LGN02-003
@subtask        ST-LGN02-003-BE-04

@lld            LLD-EPIC-LGN-02 v0.3 section 8
@lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/api/test_password_policy.py
@lld-synced     v0.3
@status         built
"""

import requests
from conftest import AUTH, make_reset_token


def reset(token: str, password: str):
    return requests.post(f"{AUTH}/password/reset", json={"token": token, "newPassword": password}, timeout=15)


def test_tc_lgn02_003_p01(local_user, db):
    """@tc TC-LGN02-003-P01 @story US-LGN02-003 @ac AC-US-LGN02-003-01 @subtask ST-LGN02-003-BE-04
    In plain words: a weak password gets 422 PASSWORD_POLICY with every rule that is not met, and the link still works."""
    user_id, _ = local_user()
    token = make_reset_token(db, user_id)
    res = reset(token, "abc")
    body = res.json()["error"]
    assert res.status_code == 422 and body["code"] == "PASSWORD_POLICY"
    assert len(body["fields"]) == 4
    assert requests.get(f"{AUTH}/password/reset/{token}", timeout=10).status_code == 200


def test_tc_lgn02_003_p02(local_user, db):
    """@tc TC-LGN02-003-P02 @story US-LGN02-003 @ac AC-US-LGN02-003-02 @subtask ST-LGN02-003-BE-04
    In plain words: a password that was used among the last three is refused with 422 PASSWORD_REUSED."""
    user_id, _ = local_user()
    assert reset(make_reset_token(db, user_id), "Newpass1!").status_code == 200
    res = reset(make_reset_token(db, user_id), "Newpass1!")
    assert res.status_code == 422 and res.json()["error"]["code"] == "PASSWORD_REUSED"
