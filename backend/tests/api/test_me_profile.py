"""
@file           test_me_profile.py
@module         API contract tests
@description    pytest cases of US-LGN03-001 (System tells a signed-in user which companies, roles and years they can work in). In plain words: GET /me gives only the caller's own companies with the roles in each, the financial years with the current one marked, and an empty list with the helpdesk values for a user who has no company today.
@author         Deepmindz AMS team
@version        1.0.0
@since          2026-11-26

@story          US-LGN03-001
@subtask        ST-LGN03-001-BE-03
@contract       API-ME-01
@lld            LLD-EPIC-LGN-03 v0.4 10
@lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/tests/api/test_me_profile.py
@lld-synced     v0.4
@status         built
"""
import uuid
from datetime import date, datetime, timedelta, timezone

import requests
from conftest import AUTH, TEST_PASSWORD, bearer

IST = timezone(timedelta(hours=5, minutes=30))


def get_me(api: str, token: str) -> requests.Response:
    return requests.get(f"{api}/me", headers=bearer(token), timeout=10)


def add_company_role(db, user_id: str, role_id: str, company: str) -> None:
    """Gives the user the role in one more company (valid from 30 days ago, no end)."""
    db.run(
        "INSERT INTO user_company_roles (id, user_id, role_id, company_code, valid_from, valid_to, assigned_by) VALUES (CAST(:id AS uuid), CAST(:u AS uuid), CAST(:r AS uuid), :c, :vf, NULL, '10001')",
        id=str(uuid.uuid4()), u=user_id, r=role_id, c=company, vf=date.today() - timedelta(days=30),
    )


def test_tc_lgn03_001_p01(api, made, sign_in):
    """@tc TC-LGN03-001-P01
    @story US-LGN03-001
    @ac AC-US-LGN03-001-01
    @subtask ST-LGN03-001-BE-03
    In plain words: two users of different companies each read GET /me and each sees only the own company.
    """
    role_id, _ = made.role({})
    _, code_a = made.user(role_id, company="IPL")
    _, code_b = made.user(role_id, company="IPLFB")
    a = get_me(api, sign_in(code_a, "IPL"))
    b = get_me(api, sign_in(code_b, "IPLFB"))
    assert a.status_code == 200 and b.status_code == 200, (a.text, b.text)
    assert [c["code"] for c in a.json()["data"]["companies"]] == ["IPL"]
    assert [c["code"] for c in b.json()["data"]["companies"]] == ["IPLFB"]
    assert a.json()["data"]["employeeCode"] == code_a


def test_tc_lgn03_001_p02(api, db, made, sign_in):
    """@tc TC-LGN03-001-P02
    @story US-LGN03-001
    @ac AC-US-LGN03-001-02
    @subtask ST-LGN03-001-BE-03
    In plain words: a user with a role in two companies sees both, each with the role name.
    """
    role_id, role_name = made.role({})
    user_id, code = made.user(role_id, company="IPL")
    add_company_role(db, user_id, role_id, "IPLFB")
    res = get_me(api, sign_in(code, "IPL"))
    assert res.status_code == 200, res.text
    companies = {c["code"]: c for c in res.json()["data"]["companies"]}
    assert set(companies) == {"IPL", "IPLFB"}
    assert companies["IPL"]["roles"] == [role_name] and companies["IPLFB"]["roles"] == [role_name]
    assert companies["IPL"]["name"] and companies["IPLFB"]["name"]


def test_tc_lgn03_001_p03(api, made, sign_in):
    """@tc TC-LGN03-001-P03
    @story US-LGN03-001
    @ac AC-US-LGN03-001-03
    @subtask ST-LGN03-001-BE-03
    In plain words: the answer lists the financial years (April to March), the current one marked.
    """
    role_id, _ = made.role({})
    _, code = made.user(role_id)
    res = get_me(api, sign_in(code))
    assert res.status_code == 200, res.text
    years = res.json()["data"]["financialYears"]
    today = datetime.now(IST)
    start = today.year if today.month >= 4 else today.year - 1
    labels = [f"{y}-{str(y + 1)[2:]}" for y in (start, start - 1, start - 2)]
    assert [y["label"] for y in years] == labels
    assert [y["current"] for y in years] == [True, False, False]


def real_sign_in(code: str) -> str:
    """Signs in through the Auth API, as the browser does; the token has no company yet."""
    res = requests.post(f"{AUTH}/sign-in", json={"employeeCode": code, "password": TEST_PASSWORD}, timeout=15)
    assert res.status_code == 200, res.text
    return res.json()["data"]["accessToken"]


def test_tc_lgn03_001_p04(api, local_user):
    """@tc TC-LGN03-001-P04
    @story US-LGN03-001
    @ac AC-US-LGN03-001-04
    @subtask ST-LGN03-001-BE-03
    In plain words: a user who has no company and role valid today signs in through the Auth API and reads GET /me: an empty list of companies and the helpdesk values (200, not an error).
    """
    _, code = local_user()
    res = get_me(api, real_sign_in(code))
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert data["companies"] == []
    assert set(data["helpdesk"]) >= {"phone", "email", "hours"}
    assert data["context"] is None


def test_me_after_the_real_sign_in(api, local_user, grant_role, made):
    """@story US-LGN03-001
    @ac AC-US-LGN03-001-02
    @subtask ST-LGN03-001-BE-03
    In plain words: supporting test. A token from the real sign-in has no company; GET /me still answers and lists the user's companies, and a normal route still refuses the same token.
    """
    user_id, code = local_user()
    role_id, role_name = made.role({})
    grant_role(user_id, role_id, "IPL")
    token = real_sign_in(code)
    res = get_me(api, token)
    assert res.status_code == 200, res.text
    assert [c["code"] for c in res.json()["data"]["companies"]] == ["IPL"]
    assert res.json()["data"]["companies"][0]["roles"] == [role_name]
    assert requests.get(f"{api}/masters/departments", headers=bearer(token), timeout=10).status_code == 401


def test_me_needs_a_session(api):
    """@story US-LGN03-001
    @ac AC-US-LGN03-001-01
    @subtask ST-LGN03-001-BE-03
    In plain words: supporting test. No token gives 401.
    """
    assert requests.get(f"{api}/me", timeout=10).status_code == 401
