"""
@file           test_role_assignment.py
@module         API contract tests, role assignment
@description    Calls the role details and assign routes of the running API and checks the answers.
                In plain words: shows through the API that a role can be given to users, that the same data shows on the role, and that the rules refuse what they must.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-25

@story          US-ADM01-011
@subtask        ST-ADM01-011-BE-03

@lld            LLD-EPIC-ADM-01 v0.15 6.4
@lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.15.md
@pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/api/test_role_assignment.py
@lld-synced     v0.15
@status         built
"""


import re
import uuid

import pytest
import requests
from conftest import bearer

UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
FROM = "2026-01-02"


@pytest.fixture()
def ra(api, admin_token, db, made):
    """Role assignment helpers as the Administrator; the audit rows made by the test are removed after it."""
    reason = "pt011 " + uuid.uuid4().hex[:6]

    class Assign:
        def call(self, method: str, path: str, **kw):
            return requests.request(method, f"{api}{path}", headers=bearer(admin_token), timeout=10, **kw)

        def assign(self, role_id: str, codes: list, **extra):
            body = {"employeeCodes": codes, "companyCode": "IPL", "validFrom": FROM, "reason": reason, **extra}
            return self.call("POST", f"/roles/{role_id}/users", json=body)

        def details(self, role_id: str, **params):
            return self.call("GET", f"/roles/{role_id}", params=params or None)

        def users_of(self, role_id: str) -> list:
            return sorted(u["employeeCode"] for u in self.details(role_id).json()["data"]["users"])

    yield Assign()

    db.run("DELETE FROM audit_log WHERE entity = 'Role' AND reason = :r", r=reason)


def test_assign_users_and_audit(ra, made, db):
    """
    @tc TC-ADM01-011-P01
    @story US-ADM01-011
    @ac AC-US011-01
    @subtask ST-ADM01-011-BE-03
    In plain words: users are given the role, a second call skips them, and the change is audited with the reason.
    """
    base, _ = made.role({})
    target, _ = made.role({"users.view": "COMPANY"})
    codes = [made.user(base)[1], made.user(base)[1]]
    done = ra.assign(target, codes)
    assert done.status_code == 200, done.text
    assert done.json()["data"] == {"assigned": 2}
    assert ra.assign(target, codes).json()["data"] == {"assigned": 0}
    rows = db.run("SELECT reason, after FROM audit_log WHERE entity = 'Role' AND entity_key = :k", k=target)
    assert len(rows) == 1 and rows[0][0].startswith("pt011") and sorted(rows[0][1]["employeeCodes"]) == sorted(codes)


def test_role_details_show_same_data(ra, made, sign_in):
    """
    @tc TC-ADM01-011-P02
    @story US-ADM01-011
    @ac AC-US011-02
    @subtask ST-ADM01-011-BE-03
    In plain words: the role details show the people given the role, and the user's own next call already uses it (same data, cache cleared).
    """
    base, _ = made.role({})
    target, _ = made.role({"users.view": "COMPANY"})
    _, code = made.user(base)
    token = sign_in(code)
    probe = lambda: requests.get(f"{ra.call('GET', '/health').url.rsplit('/health', 1)[0]}/dev/probe/users", headers=bearer(token), timeout=10)
    assert probe().status_code == 403
    assert ra.assign(target, [code]).status_code == 200
    assert ra.users_of(target) == [code]
    assert probe().status_code == 200


def test_second_role_for_same_user(ra, made, db):
    """
    @tc TC-ADM01-011-P03
    @story US-ADM01-011
    @ac AC-US011-03
    @subtask ST-ADM01-011-BE-03
    In plain words: a user with one role is given another and holds both.
    """
    first, _ = made.role({"users.view": "OWN"})
    second, _ = made.role({"audit.view": "COMPANY"})
    user_id, code = made.user(first)
    assert ra.assign(second, [code]).json()["data"] == {"assigned": 1}
    held = db.run("SELECT role_id FROM user_company_roles WHERE user_id = CAST(:u AS uuid)", u=user_id)
    assert sorted(str(r[0]) for r in held) == sorted([first, second])
    assert code in ra.users_of(first) and code in ra.users_of(second)


def test_contract_details_shape(ra, made, api):
    """
    @tc TC-ADM01-011-C05
    @story US-ADM01-011
    @ac AC-US011-02
    @contract API-ROL-05
    @subtask ST-ADM01-011-BE-03
    In plain words: the details answer has the documented fields; 404 for no such role; 401 with no token.
    """
    role, _ = made.role({"users.view": "COMPANY"})
    _, code = made.user(role)
    data = ra.details(role).json()["data"]
    assert {"roleId", "name", "description", "type", "userCount", "lastChanged", "status", "users", "allows"} <= set(data)
    assert sorted(data["users"][0]) == ["assignedOn", "company", "department", "employeeCode", "name"]
    assert data["allows"] == [{"permission": "users.view", "scope": "COMPANY"}]
    missing = ra.details(str(uuid.uuid4()))
    assert missing.status_code == 404 and missing.json()["error"]["code"] == "ROLE_NOT_FOUND"
    assert requests.get(f"{api}/roles/{role}", timeout=10).status_code == 401


def test_contract_assign_shape(ra, made, api):
    """
    @tc TC-ADM01-011-C06
    @story US-ADM01-011
    @ac AC-US011-01
    @contract API-ROL-06
    @subtask ST-ADM01-011-BE-03
    In plain words: assign answers 200 with the count; 404 for an unknown role or user; 422 for an Inactive role or a bad body; 403 for another company.
    """
    role, _ = made.role({})
    inactive, _ = made.role({})
    ra.call("POST", f"/roles/{inactive}/deactivate", json={"reason": "pt011"})
    _, code = made.user(role)
    assert ra.assign(str(uuid.uuid4()), [code]).json()["error"]["code"] == "ROLE_NOT_FOUND"
    unknown = ra.assign(role, [code, "ZZZZZ"])
    assert unknown.status_code == 404 and unknown.json()["error"]["code"] == "USER_NOT_FOUND"
    assert unknown.json()["error"]["fields"] == [{"field": "employeeCodes", "message": "ZZZZZ"}]
    assert ra.assign(inactive, [code]).status_code == 422
    assert ra.call("POST", f"/roles/{role}/users", json={"employeeCodes": []}).status_code == 422
    other = ra.assign(role, [code], companyCode="IPLFB")
    assert other.status_code == 403 and other.json()["error"]["code"] == "COMPANY_MISMATCH"
    assert requests.post(f"{api}/roles/{role}/users", json={}, timeout=10).status_code == 401
