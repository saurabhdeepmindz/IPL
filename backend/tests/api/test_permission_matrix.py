"""
@file           test_permission_matrix.py
@module         API contract tests, permission matrix
@description    Calls the matrix routes of the running API and checks the answers.
                In plain words: shows through the API that the matrix can be read, previewed and saved, and that the rules refuse what they must.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-25

@story          US-ADM01-014
@subtask        ST-ADM01-014-BE-04

@lld            LLD-EPIC-ADM-01 v0.13 6.6
@lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.13.md
@pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/api/test_permission_matrix.py
@lld-synced     v0.13
@status         built
"""

import re
import uuid

import pytest
import requests
from conftest import bearer

UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


@pytest.fixture()
def mx(api, admin_token, db, made):
    """Matrix helpers as the Administrator; versions and audit rows made by the test are removed after it."""
    prefix = "pt" + uuid.uuid4().hex[:6]

    class Matrix:
        reason = f"{prefix} reason"

        def call(self, method: str, path: str, **kw):
            return requests.request(method, f"{api}/roles/permissions{path}", headers=bearer(admin_token), timeout=10, **kw)

        def get(self) -> dict:
            return self.call("GET", "/matrix").json()["data"]

        def version(self) -> str:
            return self.get()["matrixVersion"]

        def review(self, changes: list):
            return self.call("POST", "/review", json={"changes": changes})

        def save(self, changes: list, version: str | None = None, **extra):
            body = {"changes": changes, "matrixVersion": version or self.version(), "reason": self.reason, **extra}
            return self.call("PUT", "", json=body)

        def cell(self, role_id: str, key: str) -> dict:
            for group in self.get()["groups"]:
                for p in group["permissions"]:
                    if p["key"] == key:
                        return p["cells"][role_id]
            raise AssertionError(key)

        def new_role(self) -> str:
            return made.role({"users.view": "OWN"})[0]

    yield Matrix()

    db.run("DELETE FROM audit_log WHERE entity = 'PermissionMatrix' AND reason LIKE :p", p=f"{prefix}%")
    db.run("DELETE FROM permission_matrix_versions WHERE reason LIKE :p", p=f"{prefix}%")


def test_matrix_shape_and_locked_cells(mx):
    """
    @tc TC-ADM01-014-P01
    @story US-ADM01-014
    @ac AC-US014-01
    @subtask ST-ADM01-014-BE-04
    In plain words: roles across, permissions down by module, every cell with allowed, scope and locked.
    """
    role = mx.new_role()
    m = mx.get()
    assert role in [r["roleId"] for r in m["roles"]]
    assert [g["module"] for g in m["groups"]] == sorted(g["module"] for g in m["groups"])
    assert mx.cell(role, "users.view") == {"allowed": True, "scope": "OWN", "locked": False}
    assert mx.cell(role, "users.manage")["locked"] is True
    admin = next(r["roleId"] for r in m["roles"] if r["name"] == "Administrator")
    assert mx.cell(admin, "roles.manage") == {"allowed": True, "scope": None, "locked": True}


def test_invalid_scope_is_refused(mx):
    """
    @tc TC-ADM01-014-P02
    @story US-ADM01-014
    @ac AC-US014-02
    @subtask ST-ADM01-014-BE-04
    In plain words: a scope other than OWN, DEPARTMENT or COMPANY is refused with 422, in the review and in the save.
    """
    role = mx.new_role()
    change = [{"roleId": role, "permissionKey": "users.view", "scope": "WORLD"}]
    for res in (mx.review(change), mx.save(change)):
        assert res.status_code == 422
        assert any(f["field"].endswith("scope") for f in res.json()["error"]["fields"])
    assert mx.review([{"roleId": role, "permissionKey": "users.view", "scope": "DEPARTMENT"}]).status_code == 200


def test_review_then_save(mx, db):
    """
    @tc TC-ADM01-014-P03
    @story US-ADM01-014
    @ac AC-US014-03
    @subtask ST-ADM01-014-BE-04
    In plain words: review shows before, after and users affected and saves nothing; save keeps the reason and approval reference and changes the cell.
    """
    role = mx.new_role()
    change = [{"roleId": role, "permissionKey": "users.view", "allowed": True, "scope": "COMPANY"}]
    v0 = mx.version()
    row = mx.review(change).json()["data"]["rows"][0]
    assert row["before"] == {"allowed": True, "scope": "OWN"} and row["after"] == {"allowed": True, "scope": "COMPANY"} and row["usersAffected"] == 0
    assert mx.version() == v0 and mx.cell(role, "users.view")["scope"] == "OWN"
    done = mx.save(change, v0, approvalReference="APR-9")
    assert done.status_code == 200, done.text
    data = done.json()["data"]
    assert data["saved"] == 1 and data["matrixVersion"] == str(int(v0) + 1)
    assert mx.cell(role, "users.view")["scope"] == "COMPANY"
    after = db.run("SELECT after FROM audit_log WHERE id = CAST(:i AS uuid)", i=data["auditId"])[0][0]
    assert after["approvalReference"] == "APR-9"
    assert mx.save(change, data["matrixVersion"], reason="").status_code == 422


def test_sensitive_and_stale(mx):
    """
    @tc TC-ADM01-014-P04
    @story US-ADM01-014
    @ac AC-US014-04
    @subtask ST-ADM01-014-BE-04
    In plain words: a sensitive right without confirmSensitive gives 422; a stale version gives 409.
    """
    role = mx.new_role()
    sensitive = [{"roleId": role, "permissionKey": "audit.view", "allowed": True, "scope": "COMPANY"}]
    v0 = mx.version()
    refused = mx.save(sensitive, v0)
    assert refused.status_code == 422 and refused.json()["error"]["code"] == "SENSITIVE_CONFIRM_REQUIRED"
    assert len(mx.review(sensitive).json()["data"]["warnings"]) == 1
    assert mx.save(sensitive, v0, confirmSensitive=True).status_code == 200
    stale = mx.save([{"roleId": role, "permissionKey": "users.view", "scope": "DEPARTMENT"}], v0)
    assert stale.status_code == 409 and stale.json()["error"]["code"] == "STALE_MATRIX"


def test_locked_cells(mx):
    """
    @tc TC-ADM01-014-P05
    @story US-ADM01-014
    @ac AC-US014-05
    @subtask ST-ADM01-014-BE-04
    In plain words: a locked cell of the Administrator role, or an administration right for another role, gives 403 LOCKED_CELL.
    """
    admin = next(r["roleId"] for r in mx.get()["roles"] if r["name"] == "Administrator")
    role = mx.new_role()
    for change in ([{"roleId": admin, "permissionKey": "users.manage", "allowed": False}], [{"roleId": role, "permissionKey": "roles.manage", "allowed": True}]):
        for res in (mx.review(change), mx.save(change)):
            assert res.status_code == 403 and res.json()["error"]["code"] == "LOCKED_CELL"
    assert mx.cell(admin, "users.manage")["allowed"] is True


def test_contract_matrix_shape(mx, api):
    """
    @tc TC-ADM01-014-C01
    @story US-ADM01-014
    @ac AC-US014-01
    @contract API-PRM-01
    @subtask ST-ADM01-014-BE-04
    In plain words: the matrix answer has the documented fields, and a caller with no token gets 401.
    """
    m = mx.get()
    assert sorted(m) == ["groups", "matrixVersion", "roles"]
    assert sorted(m["roles"][0]) == ["name", "roleId", "userCount"]
    permission = m["groups"][0]["permissions"][0]
    assert sorted(permission) == ["cells", "hint", "key", "label"]
    assert requests.get(f"{api}/roles/permissions/matrix", timeout=10).status_code == 401
    assert mx.call("GET", "/matrix", params={"module": "audit"}).json()["data"]["groups"][0]["module"] == "audit"


def test_contract_review_shape(mx):
    """
    @tc TC-ADM01-014-C02
    @story US-ADM01-014
    @ac AC-US014-03
    @contract API-PRM-02
    @subtask ST-ADM01-014-BE-04
    In plain words: review answers 200 with rows and warnings, each row with the documented fields.
    """
    role = mx.new_role()
    data = mx.review([{"roleId": role, "permissionKey": "users.view", "scope": "COMPANY"}]).json()["data"]
    assert sorted(data) == ["rows", "warnings"]
    assert {"roleName", "permissionLabel", "before", "after", "usersAffected", "sensitive"} <= set(data["rows"][0])


def test_contract_save_shape(mx):
    """
    @tc TC-ADM01-014-C03
    @story US-ADM01-014
    @ac AC-US014-03
    @contract API-PRM-03
    @subtask ST-ADM01-014-BE-04
    In plain words: save answers 200 with saved, auditId and matrixVersion; an empty change list is refused with 422.
    """
    role = mx.new_role()
    res = mx.save([{"roleId": role, "permissionKey": "users.view", "scope": "COMPANY"}])
    assert res.status_code == 200
    data = res.json()["data"]
    assert sorted(data) == ["auditId", "matrixVersion", "saved"] and UUID.match(data["auditId"])
    assert mx.save([]).status_code == 422
