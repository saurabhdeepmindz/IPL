"""
@file           codes.py
@module         API contract tests, test-data helper
@description    Draws employee codes for the users the tests make. In plain words: a code is picked at random inside a range, but never one that already belongs to a user in the database and never one this run has drawn before, so a test no longer fails with "employee_code already exists".
@author         Deepmindz AMS team
@version        1.0.0
@since          2026-11-27

@epic           EPIC-LGN-03
@story          none (follow-up B24 of the master to-do; test data only)
@subtask        none
@status         built
"""
import random

_drawn: set[str] = set()


def free_code(db, low: int, span: int) -> str:
    """
    Returns a five-digit employee code that is free.

    In plain words: picks a number from `low` up to (not including) `low + span`; tries again if the number is used by a user already or was handed out earlier in this run.

    @param db - The database connection of the test run
    @param low - First code of the range
    @param span - How many codes the range holds
    @returns The code as text
    @throws RuntimeError - The range has no free code left (ask for a wider range)
    """
    for _ in range(200):
        code = str(low + random.randrange(span))
        if code in _drawn:
            continue
        if db.run("SELECT 1 FROM users WHERE employee_code = :c", c=code):
            continue
        _drawn.add(code)
        return code
    raise RuntimeError(f"no free employee code in {low}..{low + span - 1}")
