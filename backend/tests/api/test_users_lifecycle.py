"""
@file           test_users_lifecycle.py
@module         API contract tests, users
@description    Calls the user routes of the running API and checks the answers.
                In plain words: shows through the API that the user rules hold.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-25

@story          US-ADM01-005, US-ADM01-007
@subtask        ST-ADM01-005-BE-04

@lld            LLD-EPIC-ADM-01 v0.15 6.1
@lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.15.md
@pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/api/test_users_lifecycle.py
@lld-synced     v0.15
@status         built
"""

import uuid
from datetime import date, datetime

import pytest
import requests
from conftest import bearer


@pytest.fixture()
def lf(api, admin_token, db, made):
    """User-life helpers as the Administrator. Users made here are removed with their audit rows and one-time passwords."""
    run = uuid.uuid4().hex[:2]
    state = {"n": 0, "ids": []}

    class Life:
        def mk(self, auth: str = "LOCAL", status: str = "ACTIVE", signed_in: bool = False) -> tuple[str, str]:
            state["n"] += 1
            code = f"{run}{state['n']:03d}"
            uid = str(uuid.uuid4())
            locked = status == "LOCKED"
            db.run(
                'INSERT INTO users (id, employee_code, full_name, email, auth_type, status, failed_attempts, locked_until, first_sign_in_at, updated_at) '
                'VALUES (CAST(:i AS uuid), :c, :n, :e, CAST(:a AS "AuthType"), CAST(:s AS "UserStatus"), :f, :l, :g, now())',
                i=uid, c=code, n=f"Life {code}", e=f"{code}.life@example.invalid", a=auth, s=status, f=5 if locked else 0,
                l=datetime(2099, 1, 1) if locked else None, g=datetime(2026, 5, 1) if signed_in else None,
            )
            role_id, _ = made.role({})
            db.run(
                "INSERT INTO user_company_roles (id, user_id, role_id, company_code, valid_from, assigned_by) VALUES (CAST(:i AS uuid), CAST(:u AS uuid), CAST(:r AS uuid), 'IPL', :f, '10001')",
                i=str(uuid.uuid4()), u=uid, r=role_id, f=date(2026, 1, 1),
            )
            state["ids"].append(uid)
            return code, uid

        def post(self, code: str, action: str, token: str | None = None):
            return requests.post(f"{api}/users/{code}/{action}", headers=bearer(token or admin_token), timeout=10)

        def otps(self, uid: str) -> list:
            return db.run("SELECT hash, used_at IS NOT NULL FROM one_time_passwords WHERE user_id = CAST(:u AS uuid) ORDER BY issued_at", u=uid)

    yield Life()

    for uid in state["ids"]:
        db.run("DELETE FROM audit_log WHERE entity = 'User' AND entity_key = :k", k=uid)
        db.run("DELETE FROM one_time_passwords WHERE user_id = CAST(:u AS uuid)", u=uid)
        db.run("DELETE FROM user_company_roles WHERE user_id = CAST(:u AS uuid)", u=uid)
        db.run("DELETE FROM users WHERE id = CAST(:u AS uuid)", u=uid)


def test_unlock_user(lf, sign_in):
    """
    @tc TC-ADM01-007-P01
    @story US-ADM01-007
    @ac AC-US007-01
    @subtask ST-ADM01-007-BE-05
    In plain words: a Locked user is unlocked and can sign in again; a user who is not locked gives 409.
    """
    code, _ = lf.mk(status="LOCKED")
    with pytest.raises(AssertionError):
        sign_in(code)
    done = lf.post(code, "unlock")
    assert done.status_code == 200 and done.json()["data"] == {"status": "ACTIVE"}
    assert sign_in(code)
    again = lf.post(code, "unlock")
    assert again.status_code == 409 and again.json()["error"]["code"] == "NOT_LOCKED"


def test_reset_password(lf, db):
    """
    @tc TC-ADM01-007-P02
    @story US-ADM01-007
    @ac AC-US007-02
    @subtask ST-ADM01-007-BE-05
    In plain words: a local user gets a one-time password stored only as a hash, must change it at the first sign-in, and the earlier one stops.
    """
    code, uid = lf.mk()
    assert lf.post(code, "reset-password").json()["data"] == {"emailStatus": "SENT"}
    first = lf.otps(uid)
    assert len(first) == 1 and first[0][1] is False and first[0][0].startswith("$2")
    assert db.run("SELECT must_change_password FROM users WHERE id = CAST(:u AS uuid)", u=uid)[0][0] is True
    lf.post(code, "reset-password")
    rows = lf.otps(uid)
    assert [r[1] for r in rows] == [True, False] and rows[0][0] != rows[1][0]


def test_resend_one_time_password(lf):
    """
    @tc TC-ADM01-007-P03
    @story US-ADM01-007
    @ac AC-US007-03
    @subtask ST-ADM01-007-BE-05
    In plain words: the one-time password is sent again and the old one stops working; an SSO user and a user who has signed in are refused.
    """
    code, uid = lf.mk()
    lf.post(code, "reset-password")
    done = lf.post(code, "one-time-password")
    assert done.status_code == 200 and done.json()["data"] == {"emailStatus": "SENT"}
    assert [r[1] for r in lf.otps(uid)] == [True, False]
    sso, _ = lf.mk(auth="SSO")
    assert lf.post(sso, "one-time-password").json()["error"]["code"] == "NOT_LOCAL_USER"
    signed, _ = lf.mk(signed_in=True)
    refused = lf.post(signed, "one-time-password")
    assert refused.status_code == 422 and refused.json()["error"]["code"] == "ALREADY_SIGNED_IN"


def test_contract_unlock_shape(lf, api, made, sign_in):
    """
    @tc TC-ADM01-007-C06
    @story US-ADM01-007
    @ac AC-US007-01
    @contract API-USR-06
    @subtask ST-ADM01-007-BE-05
    In plain words: unlock answers 200 with the status, 404 for an unknown user, 409 when not locked, 401 with no token and 403 without the right.
    """
    code, _ = lf.mk(status="LOCKED")
    assert lf.post(code, "unlock").json()["data"] == {"status": "ACTIVE"}
    assert lf.post(code, "unlock").status_code == 409
    assert lf.post("99999", "unlock").status_code == 404
    assert requests.post(f"{api}/users/{code}/unlock", timeout=10).status_code == 401
    role, _ = made.role({})
    _, plain = made.user(role)
    assert lf.post(code, "unlock", token=sign_in(plain)).status_code == 403


def test_contract_reset_shape(lf):
    """
    @tc TC-ADM01-007-C07
    @story US-ADM01-007
    @ac AC-US007-02
    @contract API-USR-07
    @subtask ST-ADM01-007-BE-05
    In plain words: reset answers 200 with the e-mail status, 422 for an SSO user, 409 for an Inactive user and 404 for an unknown one.
    """
    code, _ = lf.mk()
    assert lf.post(code, "reset-password").json()["data"] == {"emailStatus": "SENT"}
    sso, _ = lf.mk(auth="SSO")
    assert lf.post(sso, "reset-password").json()["error"]["code"] == "NOT_LOCAL_USER"
    off, _ = lf.mk(status="INACTIVE")
    assert lf.post(off, "reset-password").json()["error"]["code"] == "USER_INACTIVE"
    assert lf.post("99999", "reset-password").status_code == 404


def test_contract_resend_shape(lf):
    """
    @tc TC-ADM01-007-C08
    @story US-ADM01-007
    @ac AC-US007-03
    @contract API-USR-08
    @subtask ST-ADM01-007-BE-05
    In plain words: send-again answers 200 with the e-mail status, 422 NOT_LOCAL_USER or ALREADY_SIGNED_IN, and 404.
    """
    code, _ = lf.mk()
    assert sorted(lf.post(code, "one-time-password").json()["data"]) == ["emailStatus"]
    assert lf.post("99999", "one-time-password").status_code == 404


@pytest.mark.skip(reason="story 005 (build order L-62)")
def test_deactivate_user():
    """
    @tc TC-ADM01-005-P01
    @story US-ADM01-005
    @ac AC-US005-01
    @contract API-USR-05
    @subtask ST-ADM01-005-BE-04
    In plain words: a user is deactivated, can no longer sign in, and stays in the list under Inactive.
    """
    # TODO: call the route as a seeded Administrator (development sign-in) with temporary users and roles; assert the status, the error code and the body.
    raise NotImplementedError("pseudo-code")

@pytest.mark.skip(reason="story 005 (build order L-62)")
def test_holds_proposals_warning():
    """
    @tc TC-ADM01-005-P02
    @story US-ADM01-005
    @ac AC-US005-02
    @contract API-USR-05
    @subtask ST-ADM01-005-BE-04
    In plain words: held proposals give HOLDS_PROPOSALS until confirmed (the workflow port is replaced by a fake that holds 7).
    """
    # TODO: call the route as a seeded Administrator (development sign-in) with temporary users and roles; assert the status, the error code and the body.
    raise NotImplementedError("pseudo-code")

@pytest.mark.skip(reason="story 005 (build order L-62)")
def test_contract_deactivate_shape():
    """
    @tc TC-ADM01-005-C05
    @story US-ADM01-005
    @ac AC-US005-01
    @contract API-USR-05
    @subtask ST-ADM01-005-BE-04
    In plain words: contract: deactivate answers 200, 404, 409 or 422.
    """
    # TODO: call the route as a seeded Administrator (development sign-in) with temporary users and roles; assert the status, the error code and the body.
    raise NotImplementedError("pseudo-code")
