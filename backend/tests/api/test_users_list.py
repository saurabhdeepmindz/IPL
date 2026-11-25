"""
@file           test_users_list.py
@module         API contract tests, users
@description    Calls the user routes of the running API and checks the answers.
                In plain words: shows through the API that the user rules hold.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-25

@story          US-ADM01-001
@subtask        ST-ADM01-001-BE-04

@lld            LLD-EPIC-ADM-01 v0.14 6.1
@lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.14.md
@pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/api/test_users_list.py
@lld-synced     v0.14
@status         built
"""


import statistics
import time
import uuid
from datetime import date

import pytest
import requests
from conftest import bearer


@pytest.fixture()
def ul(api, admin_token, db, made):
    """User-list helpers as the Administrator. Users made here carry a unique tag in the name and are removed after the test."""
    run = uuid.uuid4().hex[:2]
    tag = "UL" + uuid.uuid4().hex[:6]
    state = {"n": 0}

    class List:
        name_tag = tag

        def mk(self, who: str, company: str = "IPL", role_id: str | None = None, status: str = "ACTIVE", auth: str = "SSO", dept: str | None = None) -> str:
            state["n"] += 1
            code = f"{run}{state['n']:03d}"
            uid = str(uuid.uuid4())
            dept_id = str(db.run("SELECT id FROM departments WHERE code = :c", c=dept)[0][0]) if dept else None
            db.run(
                'INSERT INTO users (id, employee_code, full_name, email, department_id, auth_type, status, updated_at) '
                'VALUES (CAST(:i AS uuid), :c, :n, :e, CAST(:d AS uuid), CAST(:a AS "AuthType"), CAST(:s AS "UserStatus"), now())',
                i=uid, c=code, n=f"{who} {tag}", e=f"{code}.{tag.lower()}@example.invalid", d=dept_id, a=auth, s=status,
            )
            role = role_id or made.role({})[0]
            db.run(
                "INSERT INTO user_company_roles (id, user_id, role_id, company_code, valid_from, assigned_by) VALUES (CAST(:i AS uuid), CAST(:u AS uuid), CAST(:r AS uuid), :c, :f, '10001')",
                i=str(uuid.uuid4()), u=uid, r=role, c=company, f=date(2026, 1, 1),
            )
            return code

        def get(self, token: str | None = None, **params):
            headers = bearer(token or admin_token)
            return requests.get(f"{api}/users", headers=headers, params={"q": tag, **params}, timeout=15)

    yield List()

    db.run("DELETE FROM audit_log WHERE entity = 'UserList' AND actor IN (SELECT id::text FROM users WHERE employee_code = '10001')")
    db.run("DELETE FROM user_company_roles WHERE user_id IN (SELECT id FROM users WHERE full_name LIKE :p)", p=f"% {tag}")
    db.run("DELETE FROM users WHERE full_name LIKE :p", p=f"% {tag}")


def test_list_session_company_with_counts(ul):
    """
    @tc TC-ADM01-001-P01
    @story US-ADM01-001
    @ac AC-US001-01
    @subtask ST-ADM01-001-BE-04
    In plain words: only the session company is listed, and the counts cover the four tabs.
    """
    a1, a2, _a3 = ul.mk("Ann"), ul.mk("Ben", status="INACTIVE"), ul.mk("Cal", company="IPLFB")
    data = ul.get().json()["data"]
    assert [u["employeeCode"] for u in data["items"]] == [a1, a2]
    assert data["counts"] == {"all": 2, "active": 1, "inactive": 1, "locked": 0} and data["total"] == 2
    assert len(ul.get(companyCode="ALL").json()["data"]["items"]) == 3


def test_search_and_filters(ul):
    """
    @tc TC-ADM01-001-P02
    @story US-ADM01-001
    @ac AC-US001-02
    @subtask ST-ADM01-001-BE-04
    In plain words: a search word and filters narrow the list; no match gives an empty list with zero counts.
    """
    local = ul.mk("Dina", auth="LOCAL", dept="FIN")
    ul.mk("Eli", dept="PUR")
    assert [u["employeeCode"] for u in ul.get(signIn="LOCAL").json()["data"]["items"]] == [local]
    assert len(ul.get(q=local).json()["data"]["items"]) == 1
    dept_id = ul.get().json()["data"]["items"][0]["department"]
    assert dept_id == "Finance"
    empty = ul.get(q="no-such-person-xyz").json()["data"]
    assert empty["items"] == [] and empty["total"] == 0 and empty["counts"] == {"all": 0, "active": 0, "inactive": 0, "locked": 0}


def test_all_companies_is_audited(ul, made, sign_in, db):
    """
    @tc TC-ADM01-001-P03
    @story US-ADM01-001
    @ac AC-US001-03
    @subtask ST-ADM01-001-BE-04
    In plain words: ALL companies works for the Administrator and is audited; a user without companies.view-all is refused.
    """
    ul.mk("Fay", company="IPLFB")
    plain_role, _ = made.role({"users.view": "COMPANY"})
    _, code = made.user(plain_role)
    refused = ul.get(token=sign_in(code), companyCode="ALL")
    assert refused.status_code == 403 and refused.json()["error"]["code"] == "COMPANY_MISMATCH"
    before = db.run("SELECT count(*) FROM audit_log WHERE entity = 'UserList' AND entity_key = 'ALL'")[0][0]
    assert ul.get(companyCode="ALL").status_code == 200
    assert db.run("SELECT count(*) FROM audit_log WHERE entity = 'UserList' AND entity_key = 'ALL'")[0][0] == before + 1


def test_list_is_fast_with_200_users(ul):
    """
    @tc TC-ADM01-001-P04
    @story US-ADM01-001
    @ac AC-US001-04
    @subtask ST-ADM01-001-BE-04
    In plain words: with 200 users the list answers within one second at the 95th percentile.
    """
    ul.mk("Seed")
    for n in range(199):
        ul.mk(f"Bulk{n}")
    times = []
    for _ in range(20):
        start = time.perf_counter()
        res = ul.get(pageSize=100)
        times.append(time.perf_counter() - start)
        assert res.status_code == 200 and res.json()["data"]["total"] == 200
    p95 = sorted(times)[int(len(times) * 0.95) - 1]
    assert p95 < 1.0, f"p95 {p95:.3f}s, median {statistics.median(times):.3f}s"


def test_list_needs_the_permission(ul, made, sign_in):
    """
    @tc TC-ADM01-001-P05
    @story US-ADM01-001
    @ac AC-US001-05
    @subtask ST-ADM01-001-BE-04
    In plain words: a user without users.view gets 403; with it, the defaults apply (page 1, 25 per page, name ascending).
    """
    no_role, _ = made.role({})
    _, no_code = made.user(no_role)
    assert ul.get(token=sign_in(no_code)).status_code == 403
    yes_role, _ = made.role({"users.view": "COMPANY"})
    _, yes_code = made.user(yes_role)
    ul.mk("Zed"), ul.mk("Abe")
    data = ul.get(token=sign_in(yes_code)).json()["data"]
    assert data["page"] == 1 and data["pageSize"] == 25
    assert [u["name"] for u in data["items"]] == [f"Abe {ul.name_tag}", f"Zed {ul.name_tag}"]


def test_contract_list_shape(ul, api):
    """
    @tc TC-ADM01-001-C01
    @story US-ADM01-001
    @ac AC-US001-01
    @contract API-USR-01
    @subtask ST-ADM01-001-BE-04
    In plain words: the list answer has the documented fields, 422 names the bad parameter, and no token gives 401.
    """
    ul.mk("Gus")
    data = ul.get().json()["data"]
    assert sorted(data) == ["counts", "items", "page", "pageSize", "total"]
    assert sorted(data["items"][0]) == ["companies", "department", "designation", "email", "employeeCode", "lastSignIn", "name", "signIn", "status"]
    bad = ul.get(pageSize=0)
    assert bad.status_code == 422 and any(f["field"] == "pageSize" for f in bad.json()["error"]["fields"])
    assert requests.get(f"{api}/users", timeout=10).status_code == 401
