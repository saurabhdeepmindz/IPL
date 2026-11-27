"""
@file           test_test_codes.py
@module         API contract tests, test-data helper
@description    Cases of the test-code helper. In plain words: the codes the tests give to the users they make never repeat inside a run and never equal a code that is already in the database.
@author         Deepmindz AMS team
@version        1.0.0
@since          2026-11-27

@epic           EPIC-LGN-03
@story          none (follow-up B24 of the master to-do; test data only)
@subtask        none
@status         built
"""
from codes import free_code


def test_codes_do_not_repeat_in_a_run(db):
    """Many draws from a narrow range return different codes each time."""
    drawn = [free_code(db, 41000, 300) for _ in range(250)]
    assert len(set(drawn)) == 250


def test_codes_are_not_in_the_database(db):
    """A code already held by a user is never returned."""
    taken = {r[0] for r in db.run("SELECT employee_code FROM users WHERE employee_code ~ '^[0-9]{5}$' AND employee_code::int >= 40000")}
    for _ in range(100):
        assert free_code(db, 40000, 60000) not in taken


def test_codes_stay_inside_the_range(db):
    """The code is five digits and inside the asked range."""
    code = free_code(db, 52000, 100)
    assert len(code) == 5 and 52000 <= int(code) < 52100
