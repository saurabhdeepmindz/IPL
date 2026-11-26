"""
@file           test_it_adm_lgn.py
@module         API contract tests
@description    pytest cases of US-LGN01-009 (QA engineer verifies sign-in end to end with the Administrator module). In plain words: every case is skipped with a reason until /dev writes it first.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-26

@story          US-LGN01-009
@subtask        ST-LGN01-009-IN-01
@lld            LLD-EPIC-LGN-01 v0.2 10
@lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.2.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/api/test_it_adm_lgn.py
@lld-synced     v0.2
@status         pseudo
"""

import pytest


@pytest.mark.skip(reason="TC-LGN01-009-P01: written first by /dev; not implemented yet")
def test_tc_lgn01_009_p01():
    """@tc TC-LGN01-009-P01
    @story US-LGN01-009
    @ac AC-US-LGN01-009-01
    @subtask ST-LGN01-009-IN-01
    In plain words: Given a user created by the Administrator, when the user signs in with the right password, then the journ...
    """
    pass

@pytest.mark.skip(reason="TC-LGN01-009-P02: written first by /dev; not implemented yet")
def test_tc_lgn01_009_p02():
    """@tc TC-LGN01-009-P02
    @story US-LGN01-009
    @ac AC-US-LGN01-009-02
    @subtask ST-LGN01-009-IN-01
    In plain words: Given the account is locked by failures, when the Administrator unlocks it, then the user can sign in.
    """
    pass
