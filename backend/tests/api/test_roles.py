"""
@file           test_roles.py
@module         API contract tests, roles
@description    Calls the role routes of the running API and checks the answers.
                In plain words: shows through the API that roles can be listed, created, changed and deactivated, and that the rules refuse what they must.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-25

@story          US-ADM01-010
@subtask        ST-ADM01-010-BE-06

@lld            LLD-EPIC-ADM-01 v0.29 6.4
@lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
@pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/api/test_roles.py
@lld-synced     v0.29
@status         built
"""

import re
import uuid

import pytest
import requests
from conftest import bearer

SIX = ["Administrator", "Auditor", "Finance", "Initiator", "Processor", "Report Viewer"]
POSITIONS = ["First Processor", "Second Processor", "Terminator", "Discussion participant", "AWI assignee"]
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


@pytest.fixture()
def roles_api(api, admin_token, db):
    """Role-route helpers as the Administrator; roles made through the API are removed after the test."""
    prefix = "Pt" + uuid.uuid4().hex[:6]
    made_names: list[str] = []

    class Roles:
        name_prefix = prefix

        def call(self, method: str, path: str, **kw):
            return requests.request(method, f"{api}{path}", headers=bearer(admin_token), timeout=10, **kw)

        def new_name(self, tag: str) -> str:
            name = f"{prefix} {tag}"
            made_names.append(name)
            return name

        def create(self, tag: str, **extra):
            body = {"name": self.new_name(tag), "description": "pytest role", "status": "ACTIVE", "reason": "pytest", **extra}
            return self.call("POST", "/roles", json=body)

        def by_name(self, name: str) -> dict:
            items = self.call("GET", "/roles", params={"q": name}).json()["data"]["items"]
            return next(i for i in items if i["name"].lower() == name.lower())

    yield Roles()

    for name in made_names:
        rows = db.run("SELECT id FROM roles WHERE lower(name) = lower(:n)", n=name)
        for (rid,) in rows:
            db.run("DELETE FROM audit_log WHERE entity_key = :k", k=str(rid))
            db.run("DELETE FROM role_permissions WHERE role_id = CAST(:r AS uuid)", r=str(rid))
            db.run("DELETE FROM roles WHERE id = CAST(:r AS uuid)", r=str(rid))


def test_list_returns_roles_and_filters_work(roles_api):
    """
    @tc TC-ADM01-010-P01
    @story US-ADM01-010
    @ac AC-US010-01
    @subtask ST-ADM01-010-BE-06
    In plain words: the seeded roles are listed, and the type and name filters narrow the list.
    """
    items = roles_api.call("GET", "/roles", params={"type": "STANDARD"}).json()["data"]["items"]
    assert sorted(i["name"] for i in items) == SIX
    found = roles_api.call("GET", "/roles", params={"q": "audit"}).json()["data"]["items"]
    assert [i["name"] for i in found] == ["Auditor"]


def test_create_role_with_copied_cells(roles_api, db):
    """
    @tc TC-ADM01-010-P02
    @story US-ADM01-010
    @ac AC-US010-02
    @subtask ST-ADM01-010-BE-06
    In plain words: a role is created with the cells of another role, and an audit record with the reason is written.
    """
    auditor = roles_api.by_name("Auditor")
    res = roles_api.create("copy", copyFromRoleId=auditor["roleId"], reason="pytest copy")
    assert res.status_code == 201, res.text
    role_id = res.json()["data"]["roleId"]
    cells = db.run("SELECT count(*) FROM role_permissions WHERE role_id = CAST(:r AS uuid) AND allowed", r=role_id)[0][0]
    auditor_cells = db.run("SELECT count(*) FROM role_permissions WHERE role_id = CAST(:r AS uuid) AND allowed", r=auditor["roleId"])[0][0]
    assert cells == auditor_cells > 0
    reason = db.run("SELECT reason FROM audit_log WHERE entity = 'Role' AND entity_key = :k", k=role_id)[0][0]
    assert reason == "pytest copy"


def test_duplicate_name_gives_409(roles_api):
    """
    @tc TC-ADM01-010-P03
    @story US-ADM01-010
    @ac AC-US010-03
    @subtask ST-ADM01-010-BE-06
    In plain words: a name that exists gives 409 ROLE_NAME_EXISTS and no second role is created.
    """
    assert roles_api.create("dup").status_code == 201
    body = {"name": f"{roles_api.name_prefix} DUP", "description": "x", "status": "ACTIVE", "reason": "pytest"}
    again = roles_api.call("POST", "/roles", json=body)
    assert again.status_code == 409
    assert again.json()["error"]["code"] == "ROLE_NAME_EXISTS"
    assert len(roles_api.call("GET", "/roles", params={"q": f"{roles_api.name_prefix} dup"}).json()["data"]["items"]) == 1


def test_administrator_role_is_locked(roles_api):
    """
    @tc TC-ADM01-010-P04
    @story US-ADM01-010
    @ac AC-US010-04
    @subtask ST-ADM01-010-BE-06
    In plain words: the Administrator role cannot lose a protected right or be deactivated: 403 ROLE_LOCKED.
    """
    admin = roles_api.by_name("Administrator")
    body = {
        "name": "Administrator",
        "description": admin["description"],
        "status": "ACTIVE",
        "reason": "pytest",
        "permissions": [{"permissionKey": "roles.manage", "allowed": False}],
    }
    res = roles_api.call("PUT", f"/roles/{admin['roleId']}", json=body)
    assert res.status_code == 403 and res.json()["error"]["code"] == "ROLE_LOCKED"
    res = roles_api.call("POST", f"/roles/{admin['roleId']}/deactivate", json={"reason": "pytest"})
    assert res.status_code == 403 and res.json()["error"]["code"] == "ROLE_LOCKED"


def test_deactivate_checks_holders(roles_api, made):
    """
    @tc TC-ADM01-010-P05
    @story US-ADM01-010
    @ac AC-US010-05
    @subtask ST-ADM01-010-BE-06
    In plain words: a role that users hold gives 409 ROLE_IN_USE with the count; an unused role becomes INACTIVE.
    """
    role_id, _ = made.role({"users.view": "COMPANY"})
    made.user(role_id)
    held = roles_api.call("POST", f"/roles/{role_id}/deactivate", json={"reason": "pytest"})
    assert held.status_code == 409
    assert held.json()["error"]["code"] == "ROLE_IN_USE" and held.json()["error"]["fields"] == [{"field": "userCount", "message": "1"}]
    done = roles_api.call("POST", f"/roles/{roles_api.create('free').json()['data']['roleId']}/deactivate", json={"reason": "pytest"})
    assert done.status_code == 200 and done.json()["data"] == {"status": "INACTIVE"}


def test_reason_is_required_and_audited(roles_api, db):
    """
    @tc TC-ADM01-010-P06
    @story US-ADM01-010
    @ac AC-US010-06
    @subtask ST-ADM01-010-BE-06
    In plain words: a save with no reason is refused; with a reason it is in the audit trail with the actor.
    """
    body = {"name": roles_api.new_name("noreason"), "description": "x", "status": "ACTIVE"}
    refused = roles_api.call("POST", "/roles", json=body)
    assert refused.status_code == 422
    assert "reason" in [f["field"] for f in refused.json()["error"]["fields"]]
    ok = roles_api.call("POST", "/roles", json={**body, "reason": "audited reason"})
    assert ok.status_code == 201
    row = db.run("SELECT reason, actor FROM audit_log WHERE entity = 'Role' AND entity_key = :k", k=ok.json()["data"]["roleId"])[0]
    assert row[0] == "audited reason" and row[1]


def test_no_roles_for_proposal_positions(roles_api):
    """
    @tc TC-ADM01-010-P07
    @story US-ADM01-010
    @ac AC-US010-07
    @subtask ST-ADM01-010-BE-06
    In plain words: no role exists for the positions on a proposal.
    """
    names = [i["name"] for i in roles_api.call("GET", "/roles").json()["data"]["items"]]
    for position in POSITIONS:
        assert position not in names


def test_contract_list_shape(roles_api, api):
    """
    @tc TC-ADM01-010-C01
    @story US-ADM01-010
    @ac AC-US010-01
    @contract API-ROL-01
    @subtask ST-ADM01-010-BE-06
    In plain words: the list answer has the documented fields, and a caller with no token gets 401.
    """
    res = roles_api.call("GET", "/roles")
    assert res.status_code == 200
    item = res.json()["data"]["items"][0]
    assert sorted(item) == ["description", "lastChanged", "name", "roleId", "status", "type", "userCount"]
    assert requests.get(f"{api}/roles", timeout=10).status_code == 401


def test_contract_create_shape(roles_api):
    """
    @tc TC-ADM01-010-C02
    @story US-ADM01-010
    @ac AC-US010-02
    @contract API-ROL-02
    @subtask ST-ADM01-010-BE-06
    In plain words: create answers 201 with the new role id; a bad body answers 422 naming every invalid field.
    """
    res = roles_api.create("shape")
    assert res.status_code == 201 and UUID.match(res.json()["data"]["roleId"])
    bad = roles_api.call("POST", "/roles", json={"name": "x" * 41, "description": "d", "status": "ACTIVE"})
    assert bad.status_code == 422
    assert {"name", "reason"} <= {f["field"] for f in bad.json()["error"]["fields"]}


def test_contract_update_shape(roles_api):
    """
    @tc TC-ADM01-010-C03
    @story US-ADM01-010
    @ac AC-US010-04
    @contract API-ROL-03
    @subtask ST-ADM01-010-BE-06
    In plain words: change answers 200 with the role, 404 for no such role, 409 for a name that exists.
    """
    role_id = roles_api.create("upd").json()["data"]["roleId"]
    other = roles_api.create("upd2").json()["data"]["roleId"]
    body = {"name": f"{roles_api.name_prefix} upd", "description": "changed", "status": "ACTIVE", "reason": "pytest"}
    ok = roles_api.call("PUT", f"/roles/{role_id}", json=body)
    assert ok.status_code == 200 and ok.json()["data"]["description"] == "changed"
    assert roles_api.call("PUT", f"/roles/{uuid.uuid4()}", json=body).status_code == 404
    clash = roles_api.call("PUT", f"/roles/{other}", json=body)
    assert clash.status_code == 409 and clash.json()["error"]["code"] == "ROLE_NAME_EXISTS"


def test_contract_deactivate_shape(roles_api):
    """
    @tc TC-ADM01-010-C04
    @story US-ADM01-010
    @ac AC-US010-05
    @contract API-ROL-04
    @subtask ST-ADM01-010-BE-06
    In plain words: deactivate answers 200 with the status, and 422 when the reason is missing.
    """
    role_id = roles_api.create("deact").json()["data"]["roleId"]
    assert roles_api.call("POST", f"/roles/{role_id}/deactivate", json={}).status_code == 422
    done = roles_api.call("POST", f"/roles/{role_id}/deactivate", json={"reason": "pytest"})
    assert done.status_code == 200 and done.json()["data"]["status"] == "INACTIVE"
