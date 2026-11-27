"""
@file           cleanup_test_users.py
@module         API contract tests, test-data helper
@description    Removes the test users that earlier runs left behind. In plain words: a user whose employee code is five digits from 40000 up and whose e-mail ends in example.invalid was made by a test; this script lists them and, with --apply, deletes them with their roles, history and tokens. The demo accounts of IPL (codes below 40000) are never touched.
@author         Deepmindz AMS team
@version        1.0.0
@since          2026-11-27

@epic           EPIC-LGN-03
@story          none (follow-up B24 of the master to-do; test data only)
@subtask        none
@status         built

Use: python tests/api/cleanup_test_users.py [--apply]     (database from AMS_DATABASE_URL, default the local compose database on port 5433)
"""
import os
import sys
from urllib.parse import urlparse

import pg8000.native

DB_URL = os.environ.get("AMS_DATABASE_URL", "postgresql://ams:ams@localhost:5433/ams")
WHERE = "employee_code ~ '^[0-9]{5}$' AND employee_code::int >= 40000 AND email LIKE '%@example.invalid'"
CHILDREN = ("one_time_passwords", "password_history", "password_reset_tokens", "user_company_roles")


def main(apply: bool) -> int:
    u = urlparse(DB_URL)
    db = pg8000.native.Connection(user=u.username, password=u.password, host=u.hostname, port=u.port or 5432, database=u.path.lstrip("/"))
    before = db.run(f"SELECT count(*) FROM users WHERE {WHERE}")[0][0]
    total = db.run("SELECT count(*) FROM users")[0][0]
    print(f"users in total: {total}; test users left behind: {before}")
    if not apply:
        print("dry run: nothing deleted (use --apply)")
        return 0
    db.run("BEGIN")
    try:
        for table in CHILDREN:
            db.run(f"DELETE FROM {table} WHERE user_id IN (SELECT id FROM users WHERE {WHERE})")
        db.run(f"DELETE FROM users WHERE {WHERE}")
        db.run("COMMIT")
    except Exception:
        db.run("ROLLBACK")
        raise
    after = db.run(f"SELECT count(*) FROM users WHERE {WHERE}")[0][0]
    print(f"deleted: {before - after}; test users left: {after}; users now: {db.run('SELECT count(*) FROM users')[0][0]}")
    db.close()
    return 0


if __name__ == "__main__":
    sys.exit(main("--apply" in sys.argv))
