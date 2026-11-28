"""
@file           test_rbac_negative.py
@module         RBAC negative test pack, API
@description    Generates one case per role and protected route from the permission matrix and checks the answer of the running API.
                In plain words: a role without a right is refused with 403 on every route that needs it; a role with the right is not refused.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-25

@story          US-ADM01-018
@subtask        ST-ADM01-018-IN-01
@lld            LLD-EPIC-ADM-01 v0.30 6.9
@lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
@pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/tests/api/test_rbac_negative.py
@lld-synced     v0.30
@status         built
Environment: RBAC_OUT (folder for rbac-api.json, default ./rbac-out) and AMS_CONTROLLERS_DIR (default: the controllers of this repository).
"""

import json
import os
import re
import uuid
from collections import Counter
from datetime import date, timedelta
from pathlib import Path

import pytest
import requests
from conftest import bearer
from codes import free_code
from rbac_routes import ROUTES, SIX_ROLES, Route

OUT = Path(os.environ.get("RBAC_OUT", "rbac-out"))
CONTROLLERS = Path(os.environ.get("AMS_CONTROLLERS_DIR", Path(__file__).resolve().parents[2] / "apps" / "ams-apis" / "src" / "controllers"))
RESULTS: list[dict] = []


@pytest.fixture(scope="session")
def matrix(api, admin_token):
    """The saved permission matrix (API-PRM-01), read once at the start of the run."""
    res = requests.get(f"{api}/roles/permissions/matrix", headers=bearer(admin_token), timeout=15)
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    names = {r["name"] for r in data["roles"]}
    missing = [r for r in SIX_ROLES if r not in names]
    assert not missing, f"the matrix has no role {missing}"
    return data


def allowed(matrix: dict, role: str, permission: str) -> bool:
    """True when the matrix cell of the role for the permission is allowed."""
    role_id = next(r["roleId"] for r in matrix["roles"] if r["name"] == role)
    for group in matrix["groups"]:
        for p in group["permissions"]:
            if p["key"] == permission:
                return bool(p["cells"][role_id]["allowed"])
    raise AssertionError(f"the matrix has no permission {permission}")


@pytest.fixture(scope="session")
def role_tokens(api, db, sign_in, matrix):
    """One test user per role in company IPL, signed in; the users are removed after the run."""
    codes6 = [free_code(db, 60000, 30000) for _ in SIX_ROLES]
    made: list[str] = []
    tokens: dict[str, str] = {}
    for i, role in enumerate(SIX_ROLES):
        role_id = next(r["roleId"] for r in matrix["roles"] if r["name"] == role)
        user_id = str(uuid.uuid4())
        code = codes6[i]
        db.run(
            "INSERT INTO users (id, employee_code, full_name, email, updated_at) VALUES (CAST(:id AS uuid), :code, :name, :email, now())",
            id=user_id, code=code, name=f"RBAC {role}", email=f"rbac{user_id[:8]}@example.invalid",
        )
        db.run(
            "INSERT INTO user_company_roles (id, user_id, role_id, company_code, valid_from, valid_to, assigned_by) VALUES (CAST(:id AS uuid), CAST(:u AS uuid), CAST(:r AS uuid), 'IPL', :vf, NULL, '10001')",
            id=str(uuid.uuid4()), u=user_id, r=role_id, vf=date.today() - timedelta(days=30),
        )
        made.append(user_id)
        tokens[role] = sign_in(code)
    yield tokens
    for user_id in made:
        db.run("DELETE FROM user_company_roles WHERE user_id = CAST(:u AS uuid)", u=user_id)
        db.run("DELETE FROM users WHERE id = CAST(:u AS uuid)", u=user_id)


@pytest.fixture(scope="session", autouse=True)
def write_results(matrix):
    """At the end of the run write rbac-api.json: the matrix version, what each role holds and every case."""
    yield
    if not RESULTS:
        return
    perms = sorted({p["key"] for g in matrix["groups"] for p in g["permissions"]})
    roles = {role: [k for k in perms if allowed(matrix, role, k)] for role in SIX_ROLES}
    used = {r.permission for r in ROUTES}
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "rbac-api.json").write_text(json.dumps({"matrixVersion": matrix["matrixVersion"], "permissions": perms, "noRoute": [k for k in perms if k not in used], "roles": roles, "cases": RESULTS}, indent=1), encoding="utf-8")


def test_inventory_is_complete():
    """
    @tc TC-ADM01-018-P01
    @story US-ADM01-018
    @ac AC-US018-01
    @subtask ST-ADM01-018-IN-01
    In plain words: supporting test. Every route with a permission in the controllers is in the list of the pack, and the counts per permission match.
    """
    assert CONTROLLERS.is_dir(), f"no controllers at {CONTROLLERS}"
    in_code: Counter = Counter()
    for f in sorted(CONTROLLERS.rglob("*.controller.ts")):
        if f.name == "dev-probe.controller.ts":
            continue
        in_code.update(re.findall(r"@RequirePermission\('([a-z.\-]+)'\)", f.read_text(encoding="utf-8")))
    in_pack = Counter(r.permission for r in ROUTES)
    assert in_code == in_pack, f"the pack is out of step with the controllers: code {dict(in_code)} pack {dict(in_pack)}"
    assert len(ROUTES) == len({(r.method, r.path) for r in ROUTES}), "a route is listed twice"


def send(api: str, token: str, route: Route) -> requests.Response:
    """Call the route as the role; a write gets an empty body so nothing is created or changed."""
    body = {} if route.method in ("POST", "PUT") else None
    return requests.request(route.method, f"{api}{route.path}", headers=bearer(token), json=body, timeout=15)


@pytest.mark.parametrize("role,route", [(role, route) for role in SIX_ROLES for route in ROUTES], ids=lambda v: v if isinstance(v, str) else f"{v.method} {v.path}")
def test_rbac_case(role, route, api, matrix, role_tokens):
    """
    @tc TC-ADM01-018-P01
    @story US-ADM01-018
    @ac AC-US018-01
    @subtask ST-ADM01-018-IN-01
    In plain words: 6 roles x 22 routes = 132 cases; not allowed in the matrix gives 403 FORBIDDEN, allowed gives anything but 403 (and no server error).
    """
    cell = allowed(matrix, role, route.permission)
    res = send(api, role_tokens[role], route)
    if cell:
        ok = res.status_code not in (401, 403) and res.status_code < 500
        expected = "allowed"
    else:
        code = res.json().get("error", {}).get("code") if res.headers.get("content-type", "").startswith("application/json") else None
        ok = res.status_code == 403 and code == "FORBIDDEN"
        expected = "refused"
    RESULTS.append({"role": role, "method": route.method, "path": route.path, "permission": route.permission, "cell": cell, "expected": expected, "status": res.status_code, "passed": ok})
    assert ok, f"{role} {route.method} {route.path}: the matrix cell {route.permission} is {'allowed' if cell else 'not allowed'}, expected {expected}, got HTTP {res.status_code} {res.text[:120]}"
