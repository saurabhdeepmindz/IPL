"""
@file           test_it_company_separation.py
@module         API contract tests, integration
@description    pytest cases of US-LGN03-007 (QA engineer verifies company separation and landing end to end). In plain words: users of different companies sign in through the Auth API and each sees only the own companies and the own company's data; users with different roles each land on the page of the own role, and the token of the chosen company opens only what the role allows.
@author         Deepmindz AMS team
@version        1.0.0
@since          2026-11-26

@story          US-LGN03-007
@subtask        ST-LGN03-007-IN-01
@workflow       UF-03
@lld            LLD-EPIC-LGN-03 v0.4 10
@lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/tests/api/test_it_company_separation.py
@lld-synced     v0.4
@status         built
"""
from datetime import datetime, timedelta, timezone

import requests
from conftest import AUTH, TEST_PASSWORD, bearer

IST = timezone(timedelta(hours=5, minutes=30))


def current_year() -> str:
    today = datetime.now(IST)
    start = today.year if today.month >= 4 else today.year - 1
    return f"{start}-{str(start + 1)[2:]}"


def sign_in(code: str) -> str:
    """Signs in through the Auth API, as the browser does; the token has no company yet."""
    res = requests.post(f"{AUTH}/sign-in", json={"employeeCode": code, "password": TEST_PASSWORD}, timeout=15)
    assert res.status_code == 200, res.text
    return res.json()["data"]["accessToken"]


def choose(api: str, token: str, company: str) -> requests.Response:
    return requests.put(f"{api}/me/context", json={"companyCode": company, "financialYear": current_year()}, headers=bearer(token), timeout=10)


def company_codes(api: str, token: str) -> list[str]:
    res = requests.get(f"{api}/me", headers=bearer(token), timeout=10)
    assert res.status_code == 200, res.text
    return [c["code"] for c in res.json()["data"]["companies"]]


def standard_role(db, code: str) -> str:
    return str(db.run("SELECT id FROM roles WHERE code = :c", c=code)[0][0])


def listed_codes(api: str, token: str, query: str) -> list[str]:
    res = requests.get(f"{api}/users", params={"q": query}, headers=bearer(token), timeout=10)
    assert res.status_code == 200, res.text
    return [u["employeeCode"] for u in res.json()["data"]["items"]]


def test_tc_lgn03_007_p01(api, db, made, local_user, grant_role):
    """@tc TC-LGN03-007-P01
    @story US-LGN03-007
    @ac AC-US-LGN03-007-01
    @subtask ST-LGN03-007-IN-01
    In plain words: two users who can view users, one in each company, sign in. Each is offered only the own company, cannot choose the other, and after the choice sees only the users of the own company; a call that names the other company is refused.
    """
    viewer, _ = made.role({"users.view": "COMPANY"})
    user_a, code_a = local_user()
    user_b, code_b = local_user()
    grant_role(user_a, viewer, "IPL")
    grant_role(user_b, viewer, "IPLFB")
    token_a, token_b = sign_in(code_a), sign_in(code_b)
    assert company_codes(api, token_a) == ["IPL"]
    assert company_codes(api, token_b) == ["IPLFB"]
    # the other company cannot be chosen
    for token, other in ((token_a, "IPLFB"), (token_b, "IPL")):
        refused = choose(api, token, other)
        assert refused.status_code == 403 and refused.json()["error"]["code"] == "COMPANY_NOT_ALLOWED", refused.text
    # after the choice each sees only the users of the own company
    in_a = choose(api, token_a, "IPL").json()["data"]["accessToken"]
    in_b = choose(api, token_b, "IPLFB").json()["data"]["accessToken"]
    assert code_a in listed_codes(api, in_a, code_a)
    assert listed_codes(api, in_a, code_b) == []
    assert code_b in listed_codes(api, in_b, code_b)
    assert listed_codes(api, in_b, code_a) == []
    # a call that names the other company instead of the session company is refused
    for token, other in ((in_a, "IPLFB"), (in_b, "IPL")):
        res = requests.get(f"{api}/masters/departments", params={"companyCode": other}, headers=bearer(token), timeout=10)
        assert res.status_code == 403 and res.json()["error"]["code"] == "COMPANY_MISMATCH", res.text


def test_tc_lgn03_007_p02(api, db, local_user, grant_role):
    """@tc TC-LGN03-007-P02
    @story US-LGN03-007
    @ac AC-US-LGN03-007-02
    @subtask ST-LGN03-007-IN-01
    In plain words: users with different roles each choose the company and land on the page of the own role (Administrator, Finance, initiator with processor, auditor with report viewer, custom role only); the token of the choice opens the user list only for the Administrator.
    """
    cases = [
        (["ADMINISTRATOR"], {"role": "ADMINISTRATOR", "route": "/dashboard"}, 200),
        (["FINANCE"], {"role": "FINANCE", "route": "/landing/finance"}, 403),
        (["INITIATOR", "PROCESSOR"], {"role": "PROCESSOR", "route": "/landing/inbox"}, 403),
        (["REPORT_VIEWER", "AUDITOR"], {"role": "AUDITOR", "route": "/landing/reports"}, 200),
    ]
    for roles, landing, users_status in cases:
        user_id, code = local_user()
        for role in roles:
            grant_role(user_id, standard_role(db, role), "IPL")
        token = sign_in(code)
        res = choose(api, token, "IPL")
        assert res.status_code == 200, (roles, res.text)
        assert res.json()["data"]["landing"] == landing, roles
        listed = requests.get(f"{api}/users", headers=bearer(res.json()["data"]["accessToken"]), timeout=10)
        assert listed.status_code == users_status, (roles, listed.status_code, listed.text[:200])
