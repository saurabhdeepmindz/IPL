"""
@file           test_permission_refusal.py
@module         API contract tests, authorization
@description    Calls real routes with and without the right role and checks the refusal.
                In plain words: shows through the running API that a switched-off right is refused.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-25

@lld            LLD-EPIC-ADM-01 v0.7 6.8
@lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.7.md
@pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/api/test_permission_refusal.py
@lld-synced     v0.7
@status         built
"""


from datetime import date, timedelta

import requests
from conftest import bearer


def get(api, path, token=None, **params):
    """GET a route, with a token when given."""
    return requests.get(f"{api}{path}", headers=bearer(token) if token else {}, params=params or None, timeout=10)


def test_switched_off_permission_is_refused_on_next_call(api, sign_in, admin_token, made):
    """
    @tc TC-ADM01-017-P01
    @story US-ADM01-017
    @ac AC-US017-01
    @subtask ST-ADM01-017-BE-06
    In plain words: save the matrix with a right switched off; the same user's next call returns 403.
    """
    role_id, role_code = made.role({"users.view": "COMPANY"})
    _, code = made.user(role_id)
    token = sign_in(code)
    assert get(api, "/dev/probe/users", token).status_code == 200
    saved = requests.post(
        f"{api}/dev/probe/matrix",
        json={"roleCode": role_code, "permissionKey": "users.view", "allowed": False},
        headers=bearer(admin_token),
        timeout=10,
    )
    assert saved.status_code == 201, saved.text
    after = get(api, "/dev/probe/users", token)
    assert after.status_code == 403
    assert after.json()["error"]["code"] == "FORBIDDEN"


def test_user_without_admin_permission_gets_403_on_users_and_roles(api, sign_in, made):
    """
    @tc TC-ADM01-017-P02
    @story US-ADM01-017
    @ac AC-US017-02
    @subtask ST-ADM01-017-BE-06
    In plain words: an Initiator calling any users or roles route is refused.
    """
    role_id, _ = made.role({"users.view": "OWN"})
    _, code = made.user(role_id)
    token = sign_in(code)
    for path in ("/dev/probe/users-manage", "/dev/probe/roles-manage"):
        res = get(api, path, token)
        assert res.status_code == 403, path
        assert res.json()["error"]["code"] == "FORBIDDEN"


def test_other_company_is_refused(api, sign_in, made):
    """
    @tc TC-ADM01-017-P03
    @story US-ADM01-017
    @ac AC-US017-03
    @subtask ST-ADM01-017-BE-06
    In plain words: a call that names another company is refused with COMPANY_MISMATCH.
    """
    role_id, _ = made.role({"users.view": "COMPANY"})
    _, code = made.user(role_id, company="IPL")
    token = sign_in(code, "IPL")
    res = get(api, "/dev/probe/users", token, companyCode="IPLFB")
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "COMPANY_MISMATCH"
    assert get(api, "/dev/probe/users", token, companyCode="IPL").status_code == 200


def test_all_companies_needs_view_all(api, sign_in, made):
    """
    @tc TC-ADM01-017-P04
    @story US-ADM01-017
    @ac AC-US017-04
    @subtask ST-ADM01-017-BE-06
    In plain words: companyCode=ALL works only for a user who holds companies.view-all.
    """
    plain_role, _ = made.role({"users.view": "COMPANY"})
    all_role, _ = made.role({"users.view": "COMPANY", "companies.view-all": None})
    _, plain_code = made.user(plain_role)
    _, all_code = made.user(all_role)
    refused = get(api, "/dev/probe/users", sign_in(plain_code), companyCode="ALL")
    assert refused.status_code == 403
    assert refused.json()["error"]["code"] == "COMPANY_MISMATCH"
    assert get(api, "/dev/probe/users", sign_in(all_code), companyCode="ALL").status_code == 200


def test_route_with_no_declared_permission_is_refused(api, admin_token):
    """
    @tc TC-ADM01-017-P05
    @story US-ADM01-017
    @ac AC-US017-05
    @subtask ST-ADM01-017-BE-06
    In plain words: a route that declares no permission and is not open is refused, even for the Administrator.
    """
    res = get(api, "/dev/probe/undeclared", admin_token)
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "NO_PERMISSION_DECLARED"


def test_no_session_gives_401_and_open_routes_answer(api):
    """
    @tc TC-ADM01-017-P06
    @story US-ADM01-017
    @ac AC-US017-06
    @subtask ST-ADM01-017-BE-06
    In plain words: a protected route with no token gives 401; the open route and the health route answer.
    """
    res = get(api, "/dev/probe/users")
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "UNAUTHENTICATED"
    assert get(api, "/dev/probe/open").status_code == 200
    assert get(api, "/health").status_code == 200


def test_ended_role_gives_no_rights(api, sign_in, made, db):
    """
    @tc TC-ADM01-017-P07
    @story US-ADM01-017
    @ac AC-US017-07
    @subtask ST-ADM01-017-BE-06
    In plain words: a role whose end date has passed, or that is Inactive, gives no rights.
    """
    ended_role, _ = made.role({"users.view": "COMPANY"})
    off_role, _ = made.role({"users.view": "COMPANY"})
    ended_user, ended_code = made.user(ended_role)
    off_user, off_code = made.user(off_role)
    ended_token, off_token = sign_in(ended_code), sign_in(off_code)  # sign in while the roles are still good
    db.run("UPDATE user_company_roles SET valid_to = :d WHERE user_id = CAST(:u AS uuid)", d=date.today() - timedelta(days=1), u=ended_user)
    db.run("UPDATE roles SET status = 'INACTIVE' WHERE id = CAST(:r AS uuid)", r=off_role)
    assert get(api, "/dev/probe/users", ended_token).status_code == 403
    assert get(api, "/dev/probe/users", off_token).status_code == 403


def test_list_is_limited_by_data_scope(api, sign_in, made):
    """
    @tc TC-ADM01-017-P08
    @story US-ADM01-017
    @ac AC-US017-08
    @subtask ST-ADM01-017-BE-06
    In plain words: OWN, DEPARTMENT and COMPANY users each get the filter of their scope.
    """
    own_user, own_code = made.user(made.role({"users.view": "OWN"})[0])
    _, dept_code = made.user(made.role({"users.view": "DEPARTMENT"})[0], department="FIN")
    _, company_code = made.user(made.role({"users.view": "COMPANY"})[0])

    own = get(api, "/dev/probe/scoped", sign_in(own_code)).json()["data"]
    assert own["scope"] == "OWN" and own["where"] == {"companyCode": "IPL", "createdBy": own_user}

    dept_token = sign_in(dept_code)
    dept = get(api, "/dev/probe/scoped", dept_token).json()["data"]
    me = get(api, "/dev/whoami", dept_token).json()["data"]
    assert dept["scope"] == "DEPARTMENT" and dept["where"] == {"companyCode": "IPL", "departmentId": me["departmentId"]}
    assert me["departmentId"] is not None

    company = get(api, "/dev/probe/scoped", sign_in(company_code)).json()["data"]
    assert company["scope"] == "COMPANY" and company["where"] == {"companyCode": "IPL"}
