"""
@file           test_it_password_flow.py
@module         API contract tests
@description    pytest cases of US-LGN02-009 (QA engineer verifies the reset and temporary-password flows end to end). In plain words: every case is skipped with a reason until /dev writes it first.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-26

@story          US-LGN02-009
@subtask        ST-LGN02-009-IN-01
@lld            LLD-EPIC-LGN-02 v0.3 10
@lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/api/test_it_password_flow.py
@lld-synced     v0.3
@status         pseudo
"""

import pytest


@pytest.mark.skip(reason="TC-LGN02-009-P01: written first by /dev; not implemented yet")
def test_tc_lgn02_009_p01():
    """@tc TC-LGN02-009-P01
    @story US-LGN02-009
    @ac AC-US-LGN02-009-01
    @subtask ST-LGN02-009-IN-01
    In plain words: Given a reset request for a local user, when the journey reads the mail trap, then it finds one e-mail wi...
    """
    pass

@pytest.mark.skip(reason="TC-LGN02-009-P02: written first by /dev; not implemented yet")
def test_tc_lgn02_009_p02():
    """@tc TC-LGN02-009-P02
    @story US-LGN02-009
    @ac AC-US-LGN02-009-02
    @subtask ST-LGN02-009-IN-01
    In plain words: Given the link and a valid password, when the user saves, then the new password works and the link cannot...
    """
    pass

@pytest.mark.skip(reason="TC-LGN02-009-P03: written first by /dev; not implemented yet")
def test_tc_lgn02_009_p03():
    """@tc TC-LGN02-009-P03
    @story US-LGN02-009
    @ac AC-US-LGN02-009-03
    @subtask ST-LGN02-009-IN-01
    In plain words: Given a user with a temporary password, when the user changes it, then the journey reaches company and ye...
    """
    pass
