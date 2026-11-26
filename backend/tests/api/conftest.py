"""
@file           conftest.py
@module         API contract tests, shared set-up
@description    Fixtures for the API contract tests: where the API is, a database connection, and helpers that make a temporary role and user and remove them afterwards.
                In plain words: each test makes the people and roles it needs, so no shared seed data is changed.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-25

@story          US-ADM01-017
@subtask        ST-ADM01-017-BE-06

@lld            LLD-EPIC-ADM-01 v0.30 6.8
@lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
@pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/tests/api/conftest.py
@lld-synced     v0.30
@status         built

Environment: AMS_API_URL (default http://localhost:3000/api/v1) and AMS_DATABASE_URL (default postgresql://ams:ams@localhost:5433/ams).
The API must run with APP_ENV=dev or test (the probe routes and the development sign-in exist only there).
"""
import os
import uuid
from datetime import date, timedelta
from urllib.parse import urlparse

import pg8000.native
import pytest
import requests

API = os.environ.get("AMS_API_URL", "http://localhost:3000/api/v1")
DB_URL = os.environ.get("AMS_DATABASE_URL", "postgresql://ams:ams@localhost:5433/ams")


@pytest.fixture(scope="session")
def api() -> str:
    """The base URL of the running API."""
    return API


@pytest.fixture(scope="session")
def db():
    """One database connection for the whole run. Every statement is committed at once, so the API sees each change."""
    u = urlparse(DB_URL)
    conn = pg8000.native.Connection(user=u.username, password=u.password, host=u.hostname, port=u.port or 5432, database=u.path.lstrip("/"))
    yield conn
    conn.close()


@pytest.fixture(scope="session")
def sign_in(api):
    """Return a function that signs a user in through the development sign-in and gives the access token."""

    def _sign_in(employee_code: str, company: str = "IPL") -> str:
        res = requests.post(f"{api}/dev/sign-in", json={"employeeCode": employee_code, "companyCode": company}, timeout=10)
        assert res.status_code == 201, res.text
        return res.json()["data"]["accessToken"]

    return _sign_in


@pytest.fixture(scope="session")
def admin_token(sign_in) -> str:
    """Token of the seeded Administrator (employee 10001)."""
    return sign_in("10001")


@pytest.fixture()
def made(db):
    """Make temporary roles and users; everything made is removed after the test."""
    roles: list[str] = []
    users: list[str] = []

    class Maker:
        def role(self, grants: dict[str, str | None]) -> tuple[str, str]:
            """Make an Active role. `grants` maps a permission code to its scope (None for unscoped); other cells are not allowed."""
            role_id = str(uuid.uuid4())
            code = "T" + role_id[:8]
            db.run(
                "INSERT INTO roles (id, code, name, description, type, status, updated_at) VALUES (CAST(:id AS uuid), :code, :code, 'test role', 'CUSTOM', 'ACTIVE', now())",
                id=role_id,
                code=code,
            )
            for pid, pcode in db.run("SELECT id, code FROM permissions"):
                allowed = pcode in grants
                scope = grants.get(pcode) if allowed else None
                db.run(
                    'INSERT INTO role_permissions (role_id, permission_id, allowed, scope) VALUES (CAST(:r AS uuid), CAST(:p AS uuid), :a, CAST(:s AS "DataScope"))',
                    r=role_id,
                    p=str(pid),
                    a=allowed,
                    s=scope,
                )
            roles.append(role_id)
            return role_id, code

        def user(self, role_id: str, company: str = "IPL", valid_to: date | None = None, department: str | None = None) -> tuple[str, str]:
            """Make an Active user holding the role in the company. Returns (user id, employee code)."""
            user_id = str(uuid.uuid4())
            code = str(90000 + int(user_id[:4], 16) % 9999)
            dept_id = None
            if department:
                dept_id = str(db.run("SELECT id FROM departments WHERE code = :c", c=department)[0][0])
            db.run(
                "INSERT INTO users (id, employee_code, full_name, email, department_id, updated_at) VALUES (CAST(:id AS uuid), :code, 'Test User', :email, CAST(:dept AS uuid), now())",
                id=user_id,
                code=code,
                email=f"t{user_id[:8]}@example.invalid",
                dept=dept_id,
            )
            db.run(
                "INSERT INTO user_company_roles (id, user_id, role_id, company_code, valid_from, valid_to, assigned_by) VALUES (CAST(:id AS uuid), CAST(:u AS uuid), CAST(:r AS uuid), :c, :vf, :vt, '10001')",
                id=str(uuid.uuid4()),
                u=user_id,
                r=role_id,
                c=company,
                vf=date.today() - timedelta(days=30),
                vt=valid_to,
            )
            users.append(user_id)
            return user_id, code

    yield Maker()

    for user_id in users:
        db.run("DELETE FROM user_company_roles WHERE user_id = CAST(:u AS uuid)", u=user_id)
        db.run("DELETE FROM users WHERE id = CAST(:u AS uuid)", u=user_id)
    for role_id in roles:
        db.run("DELETE FROM role_permissions WHERE role_id = CAST(:r AS uuid)", r=role_id)
        db.run("DELETE FROM user_company_roles WHERE role_id = CAST(:r AS uuid)", r=role_id)
        db.run("DELETE FROM roles WHERE id = CAST(:r AS uuid)", r=role_id)


def bearer(token: str) -> dict[str, str]:
    """Authorization header for a token."""
    return {"Authorization": f"Bearer {token}"}


# ---- Auth API fixtures (EPIC-LGN-01, ST-LGN01-001-BE-04)
AUTH = os.environ.get("AMS_AUTH_URL", "http://localhost:3200/api/v1/auth")
TEST_PASSWORD = "Test@12345"
# bcrypt cost-12 hash of TEST_PASSWORD, made once with bcryptjs; used only by the tests
TEST_PASSWORD_HASH = "$2b$12$2jFUI/81n4RIbETaphMEPOz9agYiEQ9ssh5jia3BPY87Dt8B1ectq"


@pytest.fixture(scope="session")
def auth_api() -> str:
    """The base URL of the running Auth API (port 3200). It runs with APP_ENV=dev and a high sign-in address limit (SETTING_SIGNIN_LIMITPERADDRESS)."""
    return AUTH


@pytest.fixture()
def local_user(db):
    """Make a user who signs in with a password (TEST_PASSWORD); the user and its audit rows are removed after the test."""
    made_ids: list[tuple[str, str]] = []

    def _make(status: str = "ACTIVE", must_change: bool = False) -> tuple[str, str]:
        user_id = str(uuid.uuid4())
        code = str(80000 + int(user_id[:4], 16) % 9999)
        db.run(
            "INSERT INTO users (id, employee_code, full_name, email, auth_type, password_hash, must_change_password, status, updated_at) "
            "VALUES (CAST(:id AS uuid), :code, 'Login Test', :email, 'LOCAL', :h, :m, CAST(:s AS \"UserStatus\"), now())",
            id=user_id, code=code, email=f"l{user_id[:8]}@example.invalid", h=TEST_PASSWORD_HASH, m=must_change, s=status,
        )
        made_ids.append((user_id, code))
        return user_id, code

    yield _make

    for user_id, code in made_ids:
        db.run("DELETE FROM audit_log WHERE entity_key = :c", c=code)
        db.run("DELETE FROM users WHERE id = CAST(:u AS uuid)", u=user_id)


def audit_after(db, code: str) -> list[str]:
    """The `after` text of every sign-in audit row written for an employee code, oldest first."""
    return [r[0] for r in db.run("SELECT after::text FROM audit_log WHERE entity_key = :c ORDER BY created_at", c=code)]
