"""
@file           test_me_context.py
@module         API contract tests
@description    pytest cases of US-LGN03-002 (System sets the company and financial year of the session and picks the landing page). In plain words: PUT /me/context stores the choice in the session and gives a new token and the landing route; a company the user does not have today is refused; the landing follows the role order.
@author         Deepmindz AMS team
@version        1.0.0
@since          2026-11-27

@story          US-LGN03-002
@subtask        ST-LGN03-002-BE-03
@contract       API-ME-02
@lld            LLD-EPIC-LGN-03 v0.2 10
@lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.2.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/tests/api/test_me_context.py
@lld-synced     v0.2
@status         elaborated
"""
from datetime import datetime, timedelta, timezone

import requests
from conftest import AUTH, TEST_PASSWORD, bearer

IST = timezone(timedelta(hours=5, minutes=30))


def current_year() -> str:
    today = datetime.now(IST)
    start = today.year if today.month >= 4 else today.year - 1
    return f"{start}-{str(start + 1)[2:]}"


def real_sign_in(code: str) -> tuple[str, str]:
    """Signs in through the Auth API, as the browser does. Returns the access token (no company yet) and the refresh cookie."""
    res = requests.post(f"{AUTH}/sign-in", json={"employeeCode": code, "password": TEST_PASSWORD}, timeout=15)
    assert res.status_code == 200, res.text
    return res.json()["data"]["accessToken"], res.headers["set-cookie"].split("ams_refresh=")[1].split(";")[0]


def choose(api: str, token: str, company: str, year: str | None = None) -> requests.Response:
    return requests.put(f"{api}/me/context", json={"companyCode": company, "financialYear": year or current_year()}, headers=bearer(token), timeout=10)


def standard_role(db, code: str) -> str:
    return str(db.run("SELECT id FROM roles WHERE code = :c", c=code)[0][0])


def user_with(local_user, grant_role, db, roles: dict[str, list[str]]) -> tuple[str, str]:
    """A password user holding the standard roles listed per company. Returns (user id, employee code)."""
    user_id, code = local_user()
    for company, role_codes in roles.items():
        for role in role_codes:
            grant_role(user_id, standard_role(db, role), company)
    return user_id, code


def test_tc_lgn03_002_p01(api, db, local_user, grant_role):
    """@tc TC-LGN03-002-P01
    @story US-LGN03-002
    @ac AC-US-LGN03-002-01
    @subtask ST-LGN03-002-BE-03
    In plain words: a valid choice is stored in the session: the new token shows the company and year in GET /me, a company-scoped route works with it, and a company named in the call instead of the session company is refused.
    """
    _, code = user_with(local_user, grant_role, db, {"IPL": ["ADMINISTRATOR"]})
    token, _ = real_sign_in(code)
    res = choose(api, token, "IPL")
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert data["context"] == {"companyCode": "IPL", "financialYear": current_year()}
    assert data["accessToken"].count(".") == 2 and data["expiresIn"] == 900
    new = data["accessToken"]
    assert requests.get(f"{api}/me", headers=bearer(new), timeout=10).json()["data"]["context"] == data["context"]
    assert requests.get(f"{api}/masters/departments", headers=bearer(new), timeout=10).status_code == 200
    other = requests.get(f"{api}/masters/departments", params={"companyCode": "IPLFB"}, headers=bearer(new), timeout=10)
    assert other.status_code == 403 and other.json()["error"]["code"] == "COMPANY_MISMATCH"


def test_tc_lgn03_002_p02(api, db, local_user, grant_role):
    """@tc TC-LGN03-002-P02
    @story US-LGN03-002
    @ac AC-US-LGN03-002-02
    @subtask ST-LGN03-002-BE-03
    In plain words: a user who chose one company and then another moves the session to the second; a refresh keeps the second; there is one company at a time.
    """
    _, code = user_with(local_user, grant_role, db, {"IPL": ["INITIATOR"], "IPLFB": ["AUDITOR"]})
    token, cookie = real_sign_in(code)
    first = choose(api, token, "IPL")
    assert first.status_code == 200, first.text
    second = choose(api, first.json()["data"]["accessToken"], "IPLFB")
    assert second.status_code == 200, second.text
    assert second.json()["data"]["context"]["companyCode"] == "IPLFB"
    now = requests.get(f"{api}/me", headers=bearer(second.json()["data"]["accessToken"]), timeout=10).json()["data"]["context"]
    assert now == {"companyCode": "IPLFB", "financialYear": current_year()}
    renewed = requests.post(f"{AUTH}/refresh", headers={"Cookie": f"ams_refresh={cookie}"}, timeout=15)
    assert renewed.status_code == 200, renewed.text
    after = requests.get(f"{api}/me", headers=bearer(renewed.json()["data"]["accessToken"]), timeout=10).json()["data"]["context"]
    assert after == {"companyCode": "IPLFB", "financialYear": current_year()}


def test_tc_lgn03_002_p03(api, db, local_user, grant_role):
    """@tc TC-LGN03-002-P03
    @story US-LGN03-002
    @ac AC-US-LGN03-002-03
    @subtask ST-LGN03-002-BE-03
    In plain words: a company the user does not have today (no role, an ended role, or a company that does not exist) is refused with 403 COMPANY_NOT_ALLOWED.
    """
    from datetime import date

    user_id, code = user_with(local_user, grant_role, db, {"IPL": ["INITIATOR"]})
    grant_role(user_id, standard_role(db, "AUDITOR"), "IPLFB", valid_from=date.today() - timedelta(days=60), valid_to=date.today() - timedelta(days=1))
    token, _ = real_sign_in(code)
    for company in ("IPLFB", "NOPE"):
        res = choose(api, token, company)
        assert res.status_code == 403 and res.json()["error"]["code"] == "COMPANY_NOT_ALLOWED", (company, res.text)


def test_tc_lgn03_002_p04(api, db, local_user, grant_role):
    """@tc TC-LGN03-002-P04
    @story US-LGN03-002
    @ac AC-US-LGN03-002-04
    @subtask ST-LGN03-002-BE-03
    In plain words: a user with one role in the company gets the landing route of that role.
    """
    expected = {"FINANCE": "/landing/finance", "ADMINISTRATOR": "/dashboard", "AUDITOR": "/landing/reports"}
    for role, route in expected.items():
        _, code = user_with(local_user, grant_role, db, {"IPL": [role]})
        token, _ = real_sign_in(code)
        res = choose(api, token, "IPL")
        assert res.status_code == 200, res.text
        assert res.json()["data"]["landing"] == {"role": role, "route": route}


def test_tc_lgn03_002_p05(api, db, local_user, grant_role):
    """@tc TC-LGN03-002-P05
    @story US-LGN03-002
    @ac AC-US-LGN03-002-05
    @subtask ST-LGN03-002-BE-03
    In plain words: with several roles the landing follows the order Administrator, Finance, Initiator / Processor, Auditor / Report Viewer.
    """
    cases = [(["AUDITOR", "INITIATOR", "FINANCE", "ADMINISTRATOR"], "ADMINISTRATOR"), (["REPORT_VIEWER", "INITIATOR", "FINANCE"], "FINANCE"), (["REPORT_VIEWER", "AUDITOR", "PROCESSOR"], "PROCESSOR"), (["REPORT_VIEWER", "AUDITOR"], "AUDITOR")]
    for roles, first in cases:
        _, code = user_with(local_user, grant_role, db, {"IPL": roles})
        res = choose(api, real_sign_in(code)[0], "IPL")
        assert res.status_code == 200, res.text
        assert res.json()["data"]["landing"]["role"] == first, roles


def test_tc_lgn03_002_p06(api, db, local_user, grant_role):
    """@tc TC-LGN03-002-P06
    @story US-LGN03-002
    @ac AC-US-LGN03-002-06
    @subtask ST-LGN03-002-BE-03
    In plain words: an initiator only gets the Initiator Dashboard; an initiator who is also a processor gets the Inbox.
    """
    _, only = user_with(local_user, grant_role, db, {"IPL": ["INITIATOR"]})
    res = choose(api, real_sign_in(only)[0], "IPL")
    assert res.json()["data"]["landing"] == {"role": "INITIATOR", "route": "/landing/initiator"}
    _, both = user_with(local_user, grant_role, db, {"IPL": ["INITIATOR", "PROCESSOR"]})
    res = choose(api, real_sign_in(both)[0], "IPL")
    assert res.json()["data"]["landing"]["route"] == "/landing/inbox"


def test_invalid_year_and_bad_input(api, db, local_user, grant_role):
    """@story US-LGN03-002
    @ac AC-US-LGN03-002-01
    @subtask ST-LGN03-002-BE-03
    In plain words: supporting test. A year that is not in the list is 422 INVALID_YEAR; a body that is not a company code and a year is 422; no token is 401.
    """
    _, code = user_with(local_user, grant_role, db, {"IPL": ["INITIATOR"]})
    token, _ = real_sign_in(code)
    bad = choose(api, token, "IPL", "1999-00")
    assert bad.status_code == 422 and bad.json()["error"]["code"] == "INVALID_YEAR", bad.text
    wrong_shape = requests.put(f"{api}/me/context", json={"companyCode": "IPL", "financialYear": "2026"}, headers=bearer(token), timeout=10)
    assert wrong_shape.status_code == 422
    assert requests.put(f"{api}/me/context", json={"companyCode": "IPL", "financialYear": current_year()}, timeout=10).status_code == 401


def test_the_choice_is_audited(api, db, local_user, grant_role):
    """@story US-LGN03-002
    @ac AC-US-LGN03-002-01
    @subtask ST-LGN03-002-BE-03
    In plain words: supporting test. Every choice writes one audit record of the company and year.
    """
    _, code = user_with(local_user, grant_role, db, {"IPL": ["INITIATOR"]})
    token, _ = real_sign_in(code)
    assert choose(api, token, "IPL").status_code == 200
    rows = db.run("SELECT after::text FROM audit_log WHERE entity = 'SessionContext' AND entity_key = :c", c=code)
    assert len(rows) == 1 and "IPL" in rows[0][0]
    db.run("DELETE FROM audit_log WHERE entity = 'SessionContext' AND entity_key = :c", c=code)
