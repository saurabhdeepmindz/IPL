"""
@file           test_auth_sso.py
@module         API contract tests
@description    pytest cases of US-LGN01-002 (System signs a user in through single sign-on). In plain words: every case is skipped with a reason until /dev writes it first.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-26

@story          US-LGN01-002
@subtask        ST-LGN01-002-BE-04
@contract       API-AUTH-02, API-AUTH-03
@lld            LLD-EPIC-LGN-01 v0.3 10
@lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.3.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/api/test_auth_sso.py
@lld-synced     v0.3
@status         built
"""

import re
from urllib.parse import parse_qs, urlparse

import requests


def start(auth_api, return_to=None):
    r = requests.get(f"{auth_api}/sso/start", params={"returnTo": return_to} if return_to else None, allow_redirects=False, timeout=15)
    assert r.status_code == 302
    return r.headers["location"]


def callback(auth_api, location, account):
    """Follows the stub provider: calls the callback with the state from the start address and the chosen account."""
    state = parse_qs(urlparse(location).query)["state"][0]
    return requests.get(f"{auth_api}/sso/callback", params={"state": state, "account": account}, allow_redirects=False, timeout=15)


def test_tc_lgn01_002_p01(auth_api, local_user):
    """@tc TC-LGN01-002-P01 @story US-LGN01-002 @ac AC-US-LGN01-002-01 @subtask ST-LGN01-002-BE-04
    The stub round trip for an active user starts a session and redirects to the next step with the cookie set."""
    _, code = local_user()
    r = callback(auth_api, start(auth_api, "/users"), f"ok-{code}")
    assert r.status_code == 302
    assert "/choose-work?next=%2Fusers" in r.headers["location"]
    assert "ams_refresh=" in r.headers["set-cookie"] and "HttpOnly" in r.headers["set-cookie"]


def test_tc_lgn01_002_p02(auth_api, local_user, db):
    """@tc TC-LGN01-002-P02 @story US-LGN01-002 @ac AC-US-LGN01-002-02 @subtask ST-LGN01-002-BE-04
    Every attempt writes an audit row with the result."""
    from conftest import audit_after
    _, code = local_user()
    callback(auth_api, start(auth_api), f"ok-{code}")
    assert any('"SUCCESS"' in a and '"SSO"' in a for a in audit_after(db, code))


def test_tc_lgn01_002_p03(auth_api):
    """@tc TC-LGN01-002-P03 @story US-LGN01-002 @ac AC-US-LGN01-002-03 @subtask ST-LGN01-002-BE-04
    The identity mode is one of the supported ones (the stub only outside production)."""
    body = requests.get(f"{auth_api}/public-config", timeout=15).json()["data"]
    assert body["ssoAvailable"] is True and body["idpMode"] in ("stub", "saml", "oidc")


def test_tc_lgn01_002_p04(auth_api):
    """@tc TC-LGN01-002-P04 @story US-LGN01-002 @ac AC-US-LGN01-002-04 @subtask ST-LGN01-002-BE-04
    Sign-in follows the employee code the provider confirms: a code with no user finds no account."""
    r = callback(auth_api, start(auth_api), "ok-70002")
    assert "state=noaccount" in r.headers["location"]


def test_tc_lgn01_002_p05(auth_api):
    """@tc TC-LGN01-002-P05 @story US-LGN01-002 @ac AC-US-LGN01-002-05 @subtask ST-LGN01-002-BE-04
    A provider that does not answer gives the failed state with a reference."""
    loc = callback(auth_api, start(auth_api), "fail").headers["location"]
    assert "state=failed" in loc and re.search(r"ref=FAI-\d{4}-[A-Z0-9]{4}", loc)


def test_tc_lgn01_002_p06(auth_api, local_user):
    """@tc TC-LGN01-002-P06 @story US-LGN01-002 @ac AC-US-LGN01-002-06 @subtask ST-LGN01-002-BE-04
    No AMS user (or an inactive one) gives the no-account state."""
    _, code = local_user(status="INACTIVE")
    for account in ("noaccount", f"ok-{code}"):
        loc = callback(auth_api, start(auth_api), account).headers["location"]
        assert "state=noaccount" in loc and re.search(r"ref=NOA-", loc)


def test_tc_lgn01_002_p07(auth_api):
    """@tc TC-LGN01-002-P07 @story US-LGN01-002 @ac AC-US-LGN01-002-07 @subtask ST-LGN01-002-BE-04
    A user who stops at the provider gets the cancelled state."""
    assert "state=cancelled" in callback(auth_api, start(auth_api), "cancel").headers["location"]


def test_tc_lgn01_002_p08(auth_api, local_user):
    """@tc TC-LGN01-002-P08 @story US-LGN01-002 @ac AC-US-LGN01-002-08 @subtask ST-LGN01-002-BE-04
    The stub start address is the local callback with a state; a state works once; a return path that is not local is ignored."""
    _, code = local_user()
    loc = start(auth_api, "//evil.example")
    assert re.match(r"^/api/v1/auth/sso/callback\?state=[A-Za-z0-9_-]+&account=", loc)
    first = callback(auth_api, loc, f"ok-{code}")
    assert "/choose-work" in first.headers["location"] and "evil" not in first.headers["location"]
    second = callback(auth_api, loc, f"ok-{code}")
    assert "state=failed" in second.headers["location"]
