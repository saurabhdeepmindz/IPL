"""
@file           test_mail_adapter.py
@module         API contract tests, mail adapter
@description    Requests e-mail through the running APIs and reads the local mail trap and the mail record.
                In plain words: shows that e-mail goes through the queue and the worker to the trap, that a failing mail server never shows an error and is tried again, and that the one-time password e-mail goes through the real adapter.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-27

@story          US-LGN02-005
@subtask        ST-LGN02-005-BE-04

@lld            LLD-EPIC-LGN-02 v0.3 section 8
@lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/api/test_mail_adapter.py
@lld-synced     v0.3
@status         built
"""

import subprocess
import time
import uuid

import requests
from conftest import AUTH, bearer, link_token, message_text, trap_messages, user_email, wait_for_mail


def ask(code: str, email: str):
    return requests.post(f"{AUTH}/password/forgot", json={"employeeCode": code, "email": email}, timeout=15)


def test_tc_lgn02_005_p01(local_user, db):
    """@tc TC-LGN02-005-P01 @story US-LGN02-005 @ac AC-US-LGN02-005-01 @subtask ST-LGN02-005-BE-04
    In plain words: a reset e-mail goes through the transport (SMTP to the trap), carries the link and is recorded as SENT without its text."""
    _, code = local_user()
    address = user_email(db, code)
    ask(code, address)
    item = wait_for_mail(address, "Reset your AMS password")
    assert "/set-password?token=" in message_text(item)
    rows = db.run("SELECT result, attempts FROM mail_log WHERE recipient = :r AND message_name = 'reset-link'", r=address)
    assert rows == [["SENT", 1]]
    db.run("DELETE FROM mail_log WHERE recipient = :r", r=address)


def test_tc_lgn02_005_p02(local_user, db):
    """@tc TC-LGN02-005-P02 @story US-LGN02-005 @ac AC-US-LGN02-005-02 @subtask ST-LGN02-005-BE-04
    In plain words: when the mail server does not answer, the user sees no error and the job is tried 3 times; every failed try is recorded (the worker then writes the MAIL_FAILED alarm line)."""
    _, code = local_user()
    address = user_email(db, code)
    subprocess.run(["docker", "stop", "backend-mailtrap-1"], check=True, capture_output=True)
    try:
        assert ask(code, address).status_code == 202
        end = time.time() + 30
        tries: list[int] = []
        while time.time() < end and tries != [1, 2, 3]:
            tries = sorted(r[0] for r in db.run("SELECT attempts FROM mail_log WHERE recipient = :r AND result = 'FAILED'", r=address))
            time.sleep(0.5)
        assert tries == [1, 2, 3], "expected 3 FAILED tries: is the worker running with MAIL_RETRY_DELAYS_MS set to short waits?"
    finally:
        subprocess.run(["docker", "start", "backend-mailtrap-1"], check=True, capture_output=True)
        time.sleep(3)
        db.run("DELETE FROM mail_log WHERE recipient = :r", r=address)


def test_tc_lgn02_005_p03(api, auth_api, admin_token, db, made):
    """@tc TC-LGN02-005-P03 @story US-LGN02-005 @ac AC-US-LGN02-005-03 @subtask ST-LGN02-005-BE-04
    In plain words: the Administrator creates a local user; the one-time password e-mail goes through the real adapter; the user signs in with the password in the e-mail."""
    role_id, _ = made.role({})
    dept = str(db.run("SELECT id FROM departments ORDER BY code LIMIT 1")[0][0])
    desig = str(db.run("SELECT id FROM designations WHERE NOT is_highest ORDER BY code LIMIT 1")[0][0])
    code = str(61000 + int(uuid.uuid4().hex[:3], 16) % 999)
    address = f"mail{code}@example.invalid"
    body = {"employeeCode": code, "fullName": f"Mail Test {code}", "email": address, "mobile": "9876543210", "departmentId": dept, "designationId": desig,
            "reportingManagerCode": "10001", "signIn": "LOCAL", "companies": [{"companyCode": "IPL", "roleIds": [role_id], "validFrom": "2026-12-01"}]}
    try:
        res = requests.post(f"{api}/users", json=body, headers={**bearer(admin_token), "Idempotency-Key": str(uuid.uuid4())}, timeout=15)
        assert res.status_code == 201
        text = message_text(wait_for_mail(address, "one-time password"))
        password = text.split("account:")[1].split()[0]
        assert db.run("SELECT result FROM mail_log WHERE recipient = :r AND message_name = 'one-time-password'", r=address) == [["SENT"]]
        signed = requests.post(f"{auth_api}/sign-in", json={"employeeCode": code, "password": password}, timeout=15)
        assert signed.status_code == 200 and signed.json()["data"]["nextStep"] == "CHANGE_PASSWORD"
    finally:
        for (uid,) in db.run("SELECT id FROM users WHERE employee_code = :c", c=code):
            db.run("DELETE FROM audit_log WHERE entity_key = :k OR entity_key = :c", k=str(uid), c=code)
            for table in ("one_time_passwords", "user_company_roles", "password_history", "password_reset_tokens"):
                db.run(f"DELETE FROM {table} WHERE user_id = CAST(:u AS uuid)", u=str(uid))
            db.run("DELETE FROM users WHERE id = CAST(:u AS uuid)", u=str(uid))
        db.run("DELETE FROM mail_log WHERE recipient = :r", r=address)
