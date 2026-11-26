"""
@file           test_it_adm_mail.py
@module         API contract tests
@description    pytest cases of US-LGN02-010 (QA engineer verifies the Administrator's one-time password e-mail goes out through the real adapter). In plain words: every case is skipped with a reason until /dev writes it first.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-26

@story          US-LGN02-010
@subtask        ST-LGN02-010-IN-01
@lld            LLD-EPIC-LGN-02 v0.3 10
@lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.3.md
@pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/tests/api/test_it_adm_mail.py
@lld-synced     v0.3
@status         pseudo
"""

import pytest


@pytest.mark.skip(reason="TC-LGN02-010-P01: written first by /dev; not implemented yet")
def test_tc_lgn02_010_p01():
    """@tc TC-LGN02-010-P01
    @story US-LGN02-010
    @ac AC-US-LGN02-010-01
    @subtask ST-LGN02-010-IN-01
    In plain words: Given the Administrator creates a local user, when the e-mail is sent, then it is found in the mail trap ...
    """
    pass
