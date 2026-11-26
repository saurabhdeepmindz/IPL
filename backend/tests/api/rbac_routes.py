"""
@file           rbac_routes.py
@module         RBAC negative test pack
@description    The protected routes of the API and the permission each needs.
                In plain words: the one hand-kept list of the pack; a test checks it against the controllers so it cannot go stale.
@author         Deepmindz AMS team
@version        0.1.0
@since          2026-11-25

@story          US-ADM01-018
@subtask        ST-ADM01-018-IN-01
@lld            LLD-EPIC-ADM-01 v0.30 6.9
@lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
@pseudo-source  docs/modules/ADM-A1/lld/EPIC-ADM-01/pseudo-code/tests/api/rbac_routes.py
@lld-synced     v0.30
@status         pseudo
"""

from typing import NamedTuple

UNKNOWN_USER = "ZZ999"
UNKNOWN_ROLE = "00000000-0000-4000-8000-000000000000"


class Route(NamedTuple):
    """One protected route: the method, the path, the permission it needs."""
    method: str
    path: str
    permission: str


ROUTES: list[Route] = [
    Route("GET", "/users", "users.view"),
    Route("GET", f"/users/{UNKNOWN_USER}", "users.view"),
    Route("GET", "/masters/departments", "users.view"),
    Route("GET", "/masters/designations", "users.view"),
    Route("GET", "/masters/companies", "users.view"),
    Route("POST", "/users", "users.manage"),
    Route("PUT", f"/users/{UNKNOWN_USER}", "users.manage"),
    Route("POST", "/users/import/check", "users.manage"),
    Route("POST", "/users/import", "users.manage"),
    Route("POST", f"/users/{UNKNOWN_USER}/deactivate", "users.manage"),
    Route("POST", f"/users/{UNKNOWN_USER}/unlock", "users.manage"),
    Route("POST", f"/users/{UNKNOWN_USER}/reset-password", "users.manage"),
    Route("POST", f"/users/{UNKNOWN_USER}/one-time-password", "users.manage"),
    Route("GET", "/roles", "roles.view"),
    Route("GET", f"/roles/{UNKNOWN_ROLE}", "roles.view"),
    Route("GET", "/roles/permissions/matrix", "roles.view"),
    Route("POST", "/roles", "roles.manage"),
    Route("PUT", f"/roles/{UNKNOWN_ROLE}", "roles.manage"),
    Route("POST", f"/roles/{UNKNOWN_ROLE}/deactivate", "roles.manage"),
    Route("POST", f"/roles/{UNKNOWN_ROLE}/users", "roles.manage"),
    Route("POST", "/roles/permissions/review", "roles.manage"),
    Route("PUT", "/roles/permissions", "roles.manage"),
]

SIX_ROLES = ["Administrator", "Initiator", "Processor", "Finance", "Report Viewer", "Auditor"]
