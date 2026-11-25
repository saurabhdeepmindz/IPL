"""
@file           test_permission_refusal.py
@module         API contract tests, authorization
@description    Calls real routes with and without the right role and checks the refusal.
                In plain words: shows through the running API that a switched-off right is refused.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-25

@lld            LLD-EPIC-ADM-01 v0.5 6.8
@lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.5.md
@pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/api/test_permission_refusal.py
@lld-synced     v0.5
@status         pseudo
"""


def test_switched_off_permission_is_refused_on_next_call():
    """
    @tc TC-ADM01-017-P01
    @story US-ADM01-017
    @ac AC-US017-01
    @subtask ST-ADM01-017-BE-06
    In plain words: save the matrix with a right switched off; the same user's next call returns 403.
    """
    # TODO: 1. Sign in as a seeded Administrator and as a seeded user of the role under test.
    # TODO: 2. Call GET /api/v1/users as that user: expect 200.
    # TODO: 3. As Administrator, save the matrix with users.view off (API-PRM-03).
    # TODO: 4. Call GET /api/v1/users again as that user: expect 403 with code FORBIDDEN.
    raise NotImplementedError("pseudo-code")


def test_user_without_admin_permission_gets_403_on_users_and_roles():
    """
    @tc TC-ADM01-017-P02
    @story US-ADM01-017
    @ac AC-US017-02
    @subtask ST-ADM01-017-BE-06
    In plain words: an Initiator calling any users or roles route is refused.
    """
    # TODO: 1. Sign in as a seeded Initiator.
    # TODO: 2. Call every /api/v1/users and /api/v1/roles route: expect 403.
    raise NotImplementedError("pseudo-code")


def test_other_company_is_refused():
    """
    @tc TC-ADM01-017-P03
    @story US-ADM01-017
    @ac AC-US017-03
    @subtask ST-ADM01-017-BE-06
    In plain words: a call that names another company is refused with COMPANY_MISMATCH.
    """
    # TODO: Call GET /api/v1/users?companyCode=<other> as a user signed in to company A; expect 403 COMPANY_MISMATCH.
    raise NotImplementedError("pseudo-code")


def test_all_companies_needs_view_all():
    """
    @tc TC-ADM01-017-P04
    @story US-ADM01-017
    @ac AC-US017-04
    @subtask ST-ADM01-017-BE-06
    In plain words: ALL is allowed only with companies.view-all.
    """
    # TODO: Call GET /api/v1/users?companyCode=ALL with and without the right; expect 200 and 403.
    raise NotImplementedError("pseudo-code")


def test_route_without_declared_permission_is_refused():
    """
    @tc TC-ADM01-017-P05
    @story US-ADM01-017
    @ac AC-US017-05
    @subtask ST-ADM01-017-BE-06
    In plain words: a route with no permission and no open mark is refused.
    """
    # TODO: Call the test-only route that declares nothing; expect 403 NO_PERMISSION_DECLARED.
    raise NotImplementedError("pseudo-code")


def test_no_session_gets_401_and_open_route_answers():
    """
    @tc TC-ADM01-017-P06
    @story US-ADM01-017
    @ac AC-US017-06
    @subtask ST-ADM01-017-BE-06
    In plain words: no session gives 401; an open route answers.
    """
    # TODO: Call a protected route without a token: expect 401 UNAUTHENTICATED; call the health route: expect 200.
    raise NotImplementedError("pseudo-code")


def test_expired_role_gives_no_rights():
    """
    @tc TC-ADM01-017-P07
    @story US-ADM01-017
    @ac AC-US017-07
    @subtask ST-ADM01-017-BE-06
    In plain words: a role whose end date has passed gives no rights.
    """
    # TODO: Give a user a role with valid_to yesterday; call a route that role allows; expect 403.
    raise NotImplementedError("pseudo-code")


def test_list_is_limited_by_data_scope():
    """
    @tc TC-ADM01-017-P08
    @story US-ADM01-017
    @ac AC-US017-08
    @subtask ST-ADM01-017-BE-06
    In plain words: a list is limited by the data scope.
    """
    # TODO: Call a list route as OWN, DEPARTMENT and COMPANY users; expect only the records of that scope.
    raise NotImplementedError("pseudo-code")
