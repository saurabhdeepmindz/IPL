"""
@file           test_lgn02_setup.py
@module         API contract tests, password set-up
@description    Checks the set-up of EPIC-LGN-02: the three new tables and the local mail trap.
                In plain words: shows that the database has the tables the password work needs and that the mail trap answers.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-27

@story          US-LGN02-000
@subtask        ST-LGN02-000-BE-01, ST-LGN02-000-BE-02

@lld            LLD-EPIC-LGN-02 v0.3 1
@lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/api/test_lgn02_setup.py
@lld-synced     v0.3
@status         built
"""
import os

import pytest
import requests

EXPECTED = {
    "password_reset_tokens": {"id", "user_id", "token_hash", "issued_at", "used_at", "replaced_at"},
    "password_history": {"id", "user_id", "hash", "hash_type", "set_at"},
    "mail_log": {"id", "message_name", "recipient", "result", "attempts", "sent_at"},
}


def test_setup_tables_exist_with_their_columns(db):
    """TC-LGN02-000-P01: the three tables exist with the columns of LLD section 5."""
    for table, columns in EXPECTED.items():
        rows = db.run("SELECT column_name FROM information_schema.columns WHERE table_name = :t", t=table)
        assert columns <= {r[0] for r in rows}, f"{table} is missing columns"


def test_reset_token_hash_is_unique(db):
    """TC-LGN02-000-P02: the same token hash cannot be stored twice."""
    rows = db.run("SELECT indexdef FROM pg_indexes WHERE tablename = 'password_reset_tokens'")
    assert any("UNIQUE" in r[0] and "token_hash" in r[0] for r in rows)


def test_mail_trap_answers_on_port_8025():
    """TC-LGN02-000-P03: the local mail trap web interface answers (docker compose service)."""
    url = os.environ.get("MAIL_TRAP_URL", "http://localhost:8025")
    try:
        res = requests.get(url + "/api/v2/messages", timeout=3)
    except requests.RequestException:
        pytest.fail("The mail trap is not running: start it with `docker compose up -d mailtrap` (port 8025).")
    assert res.status_code == 200
