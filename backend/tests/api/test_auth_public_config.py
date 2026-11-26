"""
@file           test_auth_public_config.py
@module         API contract tests
@description    pytest cases of US-LGN01-004 (System serves the sign-in settings before sign-in). In plain words: every case is skipped with a reason until /dev writes it first.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-26

@story          US-LGN01-004
@subtask        ST-LGN01-004-BE-02
@contract       API-AUTH-05
@lld            LLD-EPIC-LGN-01 v0.3 10
@lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.3.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/api/test_auth_public_config.py
@lld-synced     v0.3
@status         built
"""

import requests


def test_tc_lgn01_004_p01(auth_api):
    """@tc TC-LGN01-004-P01 @story US-LGN01-004 @ac AC-US-LGN01-004-01 @subtask ST-LGN01-004-BE-02
    The settings need no token and carry the helpdesk phone, e-mail, hours and the placeholder flag."""
    r = requests.get(f"{auth_api}/public-config", timeout=15)
    assert r.status_code == 200
    h = r.json()["data"]["helpdesk"]
    assert h["phone"] and h["email"] and h["hours"] and isinstance(h["placeholder"], bool)


def test_tc_lgn01_004_p02(auth_api):
    """@tc TC-LGN01-004-P02 @story US-LGN01-004 @ac AC-US-LGN01-004-02 @subtask ST-LGN01-004-BE-02
    Outside production the identity mode is shown (stub in development)."""
    assert requests.get(f"{auth_api}/public-config", timeout=15).json()["data"]["idpMode"] == "stub"
