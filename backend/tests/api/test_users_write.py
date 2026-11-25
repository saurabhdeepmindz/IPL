"""
@file           test_users_write.py
@module         API contract tests, users
@description    Calls the user routes of the running API and checks the answers.
                In plain words: shows through the API that a user can be created, read and changed, and that the rules hold.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-25

@story          US-ADM01-003
@subtask        ST-ADM01-003-BE-06

@lld            LLD-EPIC-ADM-01 v0.19 6.1
@lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.19.md
@pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/api/test_users_write.py
@lld-synced     v0.19
@status         built
"""

import uuid

import pytest
import requests
from conftest import bearer


@pytest.fixture()
def wr(api, admin_token, db, made):
    """Write helpers as the Administrator. Every user made through the API is removed with its audit rows and one-time passwords."""
    codes: list[str] = []
    role_id, _ = made.role({})
    dept = str(db.run("SELECT id FROM departments ORDER BY code LIMIT 1")[0][0])
    normal = str(db.run("SELECT id FROM designations WHERE NOT is_highest ORDER BY code LIMIT 1")[0][0])
    highest = str(db.run("SELECT id FROM designations WHERE is_highest ORDER BY code LIMIT 1")[0][0])

    class Write:
        role = role_id
        department = dept
        designation = normal
        top = highest

        def code(self) -> str:
            code = str(40000 + int(uuid.uuid4().hex[:4], 16) % 9999)
            codes.append(code)
            return code

        def body(self, code: str | None = None, **over) -> dict:
            code = code or self.code()
            base = {
                "employeeCode": code, "fullName": f"Api {code}", "email": f"api{code}@example.invalid", "mobile": "9876543210",
                "departmentId": dept, "designationId": normal, "reportingManagerCode": "10001", "signIn": "LOCAL",
                "companies": [{"companyCode": "IPL", "roleIds": [role_id], "validFrom": "2026-12-01"}],
            }
            return {**base, **over}

        def create(self, payload: dict, key: str | None = None, token: str | None = None, headers: bool = True):
            head = bearer(token or admin_token)
            if headers:
                head["Idempotency-Key"] = key or str(uuid.uuid4())
            return requests.post(f"{api}/users", json=payload, headers=head, timeout=10)

        def put(self, code: str, payload: dict, token: str | None = None):
            return requests.put(f"{api}/users/{code}", json=payload, headers=bearer(token or admin_token), timeout=10)

        def get(self, code: str, token: str | None = None):
            return requests.get(f"{api}/users/{code}", headers=bearer(token or admin_token), timeout=10)

    yield Write()

    for code in codes:
        for (uid,) in db.run("SELECT id FROM users WHERE employee_code = :c", c=code):
            db.run("DELETE FROM audit_log WHERE entity = 'User' AND entity_key = :k", k=str(uid))
            db.run("DELETE FROM one_time_passwords WHERE user_id = CAST(:u AS uuid)", u=str(uid))
            db.run("DELETE FROM user_company_roles WHERE user_id = CAST(:u AS uuid)", u=str(uid))
            db.run("DELETE FROM users WHERE id = CAST(:u AS uuid)", u=str(uid))


def test_create_user_and_audit(wr, db):
    """
    @tc TC-ADM01-003-P01
    @story US-ADM01-003
    @ac AC-US003-01
    @contract API-USR-02
    @subtask ST-ADM01-003-BE-06
    In plain words: a valid user is created as ACTIVE with its company role, a one-time password is stored only as a hash, and the creation is audited.
    """
    body = wr.body()
    res = wr.create(body)
    assert res.status_code == 201, res.text
    assert res.json()["data"] == {"employeeCode": body["employeeCode"], "status": "ACTIVE", "oneTimePassword": {"required": True, "emailStatus": "SENT"}}
    uid = str(db.run("SELECT id FROM users WHERE employee_code = :c", c=body["employeeCode"])[0][0])
    assert db.run("SELECT status, must_change_password FROM users WHERE id = CAST(:u AS uuid)", u=uid) == [["ACTIVE", True]]
    assert db.run("SELECT count(*) FROM user_company_roles WHERE user_id = CAST(:u AS uuid)", u=uid) == [[1]]
    assert db.run("SELECT reason FROM audit_log WHERE entity = 'User' AND entity_key = :k", k=uid) == [["Created"]]
    (hashed,) = db.run("SELECT hash FROM one_time_passwords WHERE user_id = CAST(:u AS uuid)", u=uid)[0]
    assert hashed.startswith("$2") and hashed not in res.text


def test_duplicates_give_409(wr, db):
    """
    @tc TC-ADM01-003-P02
    @story US-ADM01-003
    @ac AC-US003-02
    @contract API-USR-02
    @subtask ST-ADM01-003-BE-06
    In plain words: a used employee code or e-mail gives 409 and nothing is created.
    """
    first = wr.body()
    assert wr.create(first).status_code == 201
    same_code = wr.create({**first, "email": "other.person@example.invalid"})
    assert (same_code.status_code, same_code.json()["error"]["code"]) == (409, "DUPLICATE_EMPLOYEE_CODE")
    other = wr.body()
    same_mail = wr.create({**other, "email": first["email"].upper()})
    assert (same_mail.status_code, same_mail.json()["error"]["code"]) == (409, "DUPLICATE_EMAIL")
    assert db.run("SELECT count(*) FROM users WHERE employee_code = :c", c=other["employeeCode"]) == [[0]]


def test_read_user_with_two_companies(wr):
    """
    @tc TC-ADM01-003-P03
    @story US-ADM01-003
    @ac AC-US003-03
    @contract API-USR-03
    @subtask ST-ADM01-003-BE-06
    In plain words: a user with roles in two companies shows both companies and a plain sentence about them.
    """
    companies = [
        {"companyCode": "IPL", "roleIds": [wr.role], "validFrom": "2026-01-01"},
        {"companyCode": "IPLFB", "roleIds": [wr.role], "validFrom": "2026-01-01"},
    ]
    body = wr.body(companies=companies)
    assert wr.create(body).status_code == 201
    res = wr.get(body["employeeCode"])
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert sorted(c["code"] for c in data["companies"]) == ["IPL", "IPLFB"]
    assert "Company IPL:" in data["summaryText"] and "Company IPLFB:" in data["summaryText"]
    assert data["activity"][0]["text"] == "Created"


def test_employee_code_read_only_after_sign_in(wr, db):
    """
    @tc TC-ADM01-003-P04
    @story US-ADM01-003
    @ac AC-US003-04
    @contract API-USR-04
    @subtask ST-ADM01-003-BE-06
    In plain words: the employee code changes before the first sign-in and is read-only after it.
    """
    body = wr.body()
    assert wr.create(body).status_code == 201
    renamed = wr.code()
    done = wr.put(body["employeeCode"], {**body, "newEmployeeCode": renamed})
    assert done.status_code == 200, done.text
    assert done.json()["data"]["employeeCode"] == renamed
    db.run("UPDATE users SET first_sign_in_at = now() WHERE employee_code = :c", c=renamed)
    late = wr.put(renamed, {**body, "employeeCode": renamed, "newEmployeeCode": wr.code()})
    assert (late.status_code, late.json()["error"]["code"]) == (422, "EMPLOYEE_CODE_READ_ONLY")


def test_reporting_manager_rule(wr):
    """
    @tc TC-ADM01-003-P05
    @story US-ADM01-003
    @ac AC-US003-05
    @contract API-USR-02
    @subtask ST-ADM01-003-BE-06
    In plain words: the highest designation needs no reporting manager; any other designation does.
    """
    missing = wr.create(wr.body(reportingManagerCode=None))
    assert missing.status_code == 422
    assert [f["field"] for f in missing.json()["error"]["fields"]] == ["reportingManagerCode"]
    top = wr.create(wr.body(designationId=wr.top, reportingManagerCode=None))
    assert top.status_code == 201, top.text


def test_contract_create_shape(wr, made, sign_in, api):
    """
    @tc TC-ADM01-003-C02
    @story US-ADM01-003
    @ac AC-US003-01
    @contract API-USR-02
    @subtask ST-ADM01-003-BE-06
    In plain words: contract: create answers 201, 409, 422, 401 and 403; a repeated key returns the first answer and creates one user.
    """
    body = wr.body()
    first = wr.create(body, key="contract-key-" + body["employeeCode"])
    assert first.status_code == 201
    assert set(first.json()["data"]) == {"employeeCode", "status", "oneTimePassword"}
    again = wr.create(body, key="contract-key-" + body["employeeCode"])
    assert (again.status_code, again.json()) == (201, first.json())
    assert wr.create(wr.body(email="x@example.invalid"), headers=False).status_code == 422
    assert wr.create({**wr.body(), "email": "not-an-email", "employeeCode": "12"}).status_code == 422
    _, plain_code = made.user(made.role({})[0])
    assert wr.create(wr.body(), token=sign_in(plain_code)).status_code == 403
    assert requests.post(f"{api}/users", json=wr.body(), headers={"Idempotency-Key": "no-token"}, timeout=10).status_code == 401


def test_contract_read_shape(wr):
    """
    @tc TC-ADM01-003-C03
    @story US-ADM01-003
    @ac AC-US003-03
    @contract API-USR-03
    @subtask ST-ADM01-003-BE-06
    In plain words: contract: read answers 200 with the documented fields, or 404.
    """
    body = wr.body()
    assert wr.create(body).status_code == 201
    res = wr.get(body["employeeCode"])
    assert res.status_code == 200
    assert sorted(res.json()["data"]) == ["activity", "companies", "department", "designation", "email", "employeeCode", "firstSignInAt", "lastSignIn", "name", "signIn", "signInLocked", "status", "summaryText"]
    missing = wr.get("00001")
    assert (missing.status_code, missing.json()["error"]["code"]) == (404, "USER_NOT_FOUND")


def test_contract_update_shape(wr):
    """
    @tc TC-ADM01-003-C04
    @story US-ADM01-003
    @ac AC-US003-04
    @contract API-USR-04
    @subtask ST-ADM01-003-BE-06
    In plain words: contract: change answers 200, 404, 409 or 422.
    """
    first, second = wr.body(), wr.body()
    assert wr.create(first).status_code == 201 and wr.create(second).status_code == 201
    assert wr.put(first["employeeCode"], {**first, "fullName": "Changed Name"}).status_code == 200
    assert wr.put("00001", wr.body("00001")).status_code == 404
    clash = wr.put(first["employeeCode"], {**first, "email": second["email"]})
    assert (clash.status_code, clash.json()["error"]["code"]) == (409, "DUPLICATE_EMAIL")
    assert wr.put(first["employeeCode"], {**first, "email": "not-an-email"}).status_code == 422
