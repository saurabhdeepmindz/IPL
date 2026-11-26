"""
@file           test_auth_refresh.py
@module         API contract tests
@description    pytest cases of US-LGN01-003 (System starts the session at sign-in and renews the access token). In plain words: every case is skipped with a reason until /dev writes it first.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-26

@story          US-LGN01-003
@subtask        ST-LGN01-003-BE-03
@contract       API-AUTH-04
@lld            LLD-EPIC-LGN-01 v0.3 10
@lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.3.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/api/test_auth_refresh.py
@lld-synced     v0.3
@status         built
"""

import requests
from conftest import TEST_PASSWORD


def sign_in(auth_api, code):
    r = requests.post(f"{auth_api}/sign-in", json={"employeeCode": code, "password": TEST_PASSWORD}, timeout=15)
    assert r.status_code == 200
    return r.cookies.get("ams_refresh") or r.headers["set-cookie"].split("ams_refresh=")[1].split(";")[0]


def refresh(auth_api, token):
    return requests.post(f"{auth_api}/refresh", headers={"Cookie": f"ams_refresh={token}"} if token else {}, timeout=15)


def test_tc_lgn01_003_p01(auth_api, local_user):
    """@tc TC-LGN01-003-P01 @story US-LGN01-003 @ac AC-US-LGN01-003-01 @subtask ST-LGN01-003-BE-03
    The sign-in sets an HTTP-only refresh cookie and the readable marker cookie; the access token lives 15 minutes."""
    _, code = local_user()
    r = requests.post(f"{auth_api}/sign-in", json={"employeeCode": code, "password": TEST_PASSWORD}, timeout=15)
    cookies = r.headers["set-cookie"]
    assert "ams_refresh=" in cookies and "ams_session=1" in cookies
    assert r.json()["data"]["expiresIn"] == 900


def test_tc_lgn01_003_p02(auth_api, local_user):
    """@tc TC-LGN01-003-P02 @story US-LGN01-003 @ac AC-US-LGN01-003-02 @subtask ST-LGN01-003-BE-03
    A valid refresh cookie gives a new access token and a new cookie; the old cookie used again ends the session; no cookie is 401."""
    _, code = local_user()
    first = sign_in(auth_api, code)
    r = refresh(auth_api, first)
    assert r.status_code == 200 and r.json()["data"]["accessToken"].count(".") == 2
    second = r.headers["set-cookie"].split("ams_refresh=")[1].split(";")[0]
    assert second != first
    again = refresh(auth_api, first)
    assert again.status_code == 401 and again.json()["error"]["code"] == "SESSION_ENDED"
    assert refresh(auth_api, second).status_code == 401  # the whole session was ended
    assert refresh(auth_api, None).status_code == 401
