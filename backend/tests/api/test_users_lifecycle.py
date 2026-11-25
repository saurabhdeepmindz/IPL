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

@lld            LLD-EPIC-ADM-01 v0.20 6.1
@lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.20.md
@pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/api/test_users_lifecycle.py
@lld-synced     v0.20
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
    run = "Q" + uuid.uuid4().hex[0]  # starts with a letter so a code can never equal a seeded numeric code such as 10001
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

        def post(self, code: str, action: str, token: str | None = None, json: dict | None = None):
            return requests.post(f"{api}/users/{code}/{action}", json=json, headers=bearer(token or admin_token), timeout=10)

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


def test_deactivate_user(lf, sign_in, api, admin_token, db):
    """
    @tc TC-ADM01-005-P01
    @story US-ADM01-005
    @ac AC-US005-01
    @contract API-USR-05
    @subtask ST-ADM01-005-BE-04
    In plain words: a user is deactivated with a reason, can no longer sign in, stays in the list under Inactive and the change is audited; an Administrator who is not the last one can be deactivated too.
    """
    code, uid = lf.mk()
    done = lf.post(code, "deactivate", json={"reason": "LEFT_COMPANY", "note": "Resigned"})
    assert (done.status_code, done.json()["data"]) == (200, {"status": "INACTIVE"})
    assert db.run("SELECT status, deactivation_reason, deactivation_note FROM users WHERE id = CAST(:u AS uuid)", u=uid) == [["INACTIVE", "LEFT_COMPANY", "Resigned"]]
    with pytest.raises(AssertionError):
        sign_in(code)
    listed = requests.get(f"{api}/users", params={"q": code, "status": "inactive"}, headers=bearer(admin_token), timeout=10).json()["data"]["items"]
    assert [u["employeeCode"] for u in listed] == [code]
    assert db.run("SELECT reason FROM audit_log WHERE entity = 'User' AND entity_key = :k", k=uid) == [["Deactivated: LEFT_COMPANY"]]
    boss, boss_id = lf.mk()
    db.run(
        "INSERT INTO user_company_roles (id, user_id, role_id, company_code, valid_from, assigned_by) SELECT CAST(:i AS uuid), CAST(:u AS uuid), id, 'IPL', :f, '10001' FROM roles WHERE code = 'ADMINISTRATOR'",
        i=str(uuid.uuid4()), u=boss_id, f=date(2026, 1, 1),
    )
    assert lf.post(boss, "deactivate", json={"reason": "OTHER"}).status_code == 200


def test_holds_proposals_warning(lf, db):
    """
    @tc TC-ADM01-005-P02
    @story US-ADM01-005
    @ac AC-US005-02
    @contract API-USR-05
    @subtask ST-ADM01-005-BE-04
    In plain words: the running API has no workflow yet, so the stand-in answers 0 proposals and `confirmWithProposals` is not needed; the 409 answer with 7 proposals is proved by J02 and by the route test C05, where the workflow port is replaced by a fake.
    """
    code, uid = lf.mk()
    done = lf.post(code, "deactivate", json={"reason": "TRANSFERRED", "confirmWithProposals": False})
    assert done.status_code == 200, done.text
    assert db.run("SELECT status FROM users WHERE id = CAST(:u AS uuid)", u=uid) == [["INACTIVE"]]
    again = lf.post(code, "deactivate", json={"reason": "TRANSFERRED", "confirmWithProposals": True})
    assert (again.status_code, again.json()["error"]["code"]) == (409, "ALREADY_INACTIVE")


def test_contract_deactivate_shape(lf, made, sign_in, api):
    """
    @tc TC-ADM01-005-C05
    @story US-ADM01-005
    @ac AC-US005-01
    @contract API-USR-05
    @subtask ST-ADM01-005-BE-04
    In plain words: contract: deactivate answers 200 with only the status, 404, 409 ALREADY_INACTIVE, 422 for a reason that is not one of the five, 401 and 403.
    """
    code, _ = lf.mk()
    ok = lf.post(code, "deactivate", json={"reason": "DUPLICATE"})
    assert (ok.status_code, sorted(ok.json()["data"])) == (200, ["status"])
    assert lf.post(code, "deactivate", json={"reason": "DUPLICATE"}).json()["error"]["code"] == "ALREADY_INACTIVE"
    assert lf.post("99999", "deactivate", json={"reason": "OTHER"}).status_code == 404
    other, _ = lf.mk()
    bad = lf.post(other, "deactivate", json={"reason": "BORED"})
    assert bad.status_code == 422 and "reason" in [x["field"] for x in bad.json()["error"]["fields"]]
    assert requests.post(f"{api}/users/{other}/deactivate", json={"reason": "OTHER"}, timeout=10).status_code == 401
    _, plain_code = made.user(made.role({})[0])
    assert lf.post(other, "deactivate", token=sign_in(plain_code), json={"reason": "OTHER"}).status_code == 403
