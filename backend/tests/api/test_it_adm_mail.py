"""
@file           test_it_adm_mail.py
@module         API contract tests
@description    pytest cases of US-LGN02-010 (QA engineer verifies the Administrator's one-time password e-mail goes out through the real adapter). In plain words: the Administrator creates a local user and resends the one-time password; the mail is found in the mail trap, the status shows SENT, and the e-mailed password signs in.
@author         Deepmindz AMS team
@version        1.0.0
@since          2026-11-26

@story          US-LGN02-010
@subtask        ST-LGN02-010-IN-01
@lld            LLD-EPIC-LGN-02 v0.5 10
@lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/api/test_it_adm_mail.py
@lld-synced     v0.5
@status         built
"""

import uuid

import requests
from conftest import bearer, message_text, trap_messages, wait_for_mail
from codes import free_code

SUBJECT = "one-time password"


def password_in(item: dict) -> str:
    """The one-time password inside a mail of the trap."""
    return message_text(item).split("account:")[1].split()[0]


def test_tc_lgn02_010_p01(api, auth_api, admin_token, db, made):
    """@tc TC-LGN02-010-P01
    @story US-LGN02-010
    @ac AC-US-LGN02-010-01
    @subtask ST-LGN02-010-IN-01
    In plain words: the Administrator creates a local user; the one-time password e-mail is found in the mail trap (sent through the real adapter and recorded as SENT) and User Management shows the status SENT; Resend sends a second mail with a new password, and only the new one signs in."""
    role_id, _ = made.role({})
    dept = str(db.run("SELECT id FROM departments ORDER BY code LIMIT 1")[0][0])
    desig = str(db.run("SELECT id FROM designations WHERE NOT is_highest ORDER BY code LIMIT 1")[0][0])
    code = free_code(db, 62000, 999)
    address = f"itadm{code}@example.invalid"
    body = {"employeeCode": code, "fullName": f"It Adm {code}", "email": address, "mobile": "9876543210", "departmentId": dept, "designationId": desig,
            "reportingManagerCode": "10001", "signIn": "LOCAL", "companies": [{"companyCode": "IPL", "roleIds": [role_id], "validFrom": "2026-12-01"}]}
    try:
        created = requests.post(f"{api}/users", json=body, headers={**bearer(admin_token), "Idempotency-Key": str(uuid.uuid4())}, timeout=15)
        assert created.status_code == 201
        assert created.json()["data"]["oneTimePassword"] == {"required": True, "emailStatus": "SENT"}
        first = password_in(wait_for_mail(address, SUBJECT))
        assert len(trap_messages(address)) == 1
        assert first not in created.text
        assert db.run("SELECT result FROM mail_log WHERE recipient = :r AND message_name = 'one-time-password'", r=address) == [["SENT"]]

        resent = requests.post(f"{api}/users/{code}/one-time-password", headers={**bearer(admin_token), "Idempotency-Key": str(uuid.uuid4())}, timeout=15)
        assert resent.status_code == 200 and resent.json()["data"]["emailStatus"] == "SENT"
        wait_for_mail_count(address, 2)
        second = password_in(trap_messages(address)[0])
        assert second != first
        assert requests.post(f"{auth_api}/sign-in", json={"employeeCode": code, "password": first}, timeout=15).status_code == 401
        signed = requests.post(f"{auth_api}/sign-in", json={"employeeCode": code, "password": second}, timeout=15)
        assert signed.status_code == 200 and signed.json()["data"]["nextStep"] == "CHANGE_PASSWORD"
    finally:
        for (uid,) in db.run("SELECT id FROM users WHERE employee_code = :c", c=code):
            db.run("DELETE FROM audit_log WHERE entity_key = :k OR entity_key = :c", k=str(uid), c=code)
            for table in ("one_time_passwords", "user_company_roles", "password_history", "password_reset_tokens"):
                db.run(f"DELETE FROM {table} WHERE user_id = CAST(:u AS uuid)", u=str(uid))
            db.run("DELETE FROM users WHERE id = CAST(:u AS uuid)", u=str(uid))
        db.run("DELETE FROM mail_log WHERE recipient = :r", r=address)


def wait_for_mail_count(address: str, count: int, timeout: float = 25.0) -> None:
    """Wait until the trap holds at least `count` messages for the address."""
    import time

    end = time.time() + timeout
    while time.time() < end:
        if len(trap_messages(address)) >= count:
            return
        time.sleep(0.5)
    raise AssertionError(f"The mail trap holds fewer than {count} messages for {address}. Is the mail worker running?")
