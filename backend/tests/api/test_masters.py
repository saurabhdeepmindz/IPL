"""
@file           test_masters.py
@module         API contract tests, masters
@description    Calls the three masters reads of the running API.
                In plain words: shows through the API that the drop-down lists are served.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-25

@story          US-ADM01-002
@subtask        ST-ADM01-002-BE-01

@lld            LLD-EPIC-ADM-01 v0.29 6.3
@lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.29.md
@pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/api/test_masters.py
@lld-synced     v0.29
@status         built
"""

import requests
from conftest import bearer


def test_masters_reads(api, admin_token, made, sign_in):
    """
    @story US-ADM01-002
    @ac AC-US002-02
    @contract API-MST-01
    @subtask ST-ADM01-002-BE-01
    In plain words: supporting test. The departments, designations and companies are returned with the documented fields; canViewAll follows the right `companies.view-all`; 401 without a token and 403 without `users.view`.
    """
    get = lambda token, path: requests.get(f"{api}/masters/{path}", headers=bearer(token), timeout=10)
    deps = get(admin_token, "departments")
    assert deps.status_code == 200 and sorted(deps.json()["data"]["items"][0]) == ["code", "id", "name"]
    desigs = get(admin_token, "designations").json()["data"]["items"]
    assert sorted(desigs[0]) == ["code", "id", "isHighest", "name"] and any(d["isHighest"] for d in desigs)
    comps = get(admin_token, "companies").json()["data"]
    assert comps["canViewAll"] is True and any(c["code"] == "IPL" for c in comps["items"])
    _, viewer_code = made.user(made.role({"users.view": "COMPANY"})[0])
    assert get(sign_in(viewer_code), "companies").json()["data"]["canViewAll"] is False
    _, plain_code = made.user(made.role({})[0])
    assert get(sign_in(plain_code), "departments").status_code == 403
    assert requests.get(f"{api}/masters/departments", timeout=10).status_code == 401
