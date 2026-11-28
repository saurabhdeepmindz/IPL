# AMS back end (NestJS monorepo)

Built fresh from `ProjectStructure/BACKEND-FOLDER-STRUCTURE.md`, Project Foundation v0.1 and Standard v0.3.

Created 25 Nov 2026 as an empty folder skeleton (each folder holds a `.gitkeep`). No code is written yet: `/prd` copies the pseudo-code of one story at a time into these folders, and `/dev` elaborates it. Files `package.json`, `tsconfig.json` and the framework configuration come from the foundation sub-tasks (see `docs/modules/ADM-A1/subtasks/EPIC-ADM-01/`).

## Differences from the team's structure document
| Item in the team document | Here | Why |
|---|---|---|
| `apps/starter-apis` and `apps/auth-apis` | Two applications: `apps/ams-apis` (users, roles, permissions, masters) and `apps/auth-apis` (sign-in, tokens, passwords). The 24 Nov 2026 plan was one application; the sign-in epic built the second (rule B10 of the structure document, 28 Nov 2026) | Standard §7.1; the code |
| `database/` (Knex migrations), `knexfile.js`, Objection `baseModel.ts` and `queryBuilder.ts` | Left out | Prisma is the only ORM and migration tool |
| `libs/users` models folder | Left out | Prisma generates the models |
| `libs/audit`, `libs/organisation` | Added | Needed by EPIC-ADM-01 (Foundation §2.2) |
| `libs/location`, `libs/payment-and-subscription`, `libs/sample-domain`, `libs/settings` | Left out | Not part of AMS |
| `libs/infrastructure/src/redis` | Added (first in `libs/core/src/redis`; moved to `infrastructure` in R18 S35, so that `security` need not import `core`) | `RedisService` helpers (ST-ADM01-000-BE-05) |
| `tests/api`, `tests/e2e` | Added | pytest and Playwright (Standard section 10) |

## Folders

| Folder | Purpose |
|---|---|
| `apps/ams-apis/src/constants` | Application constants |
| `apps/ams-apis/src/controllers/<module>` | HTTP routes, one folder per module: `users`, `roles`, `permissions`, `masters`, `me`, `health`, `dev`. Thin: route, guards, one service call; no repository and no database client (rule B4) |
| `apps/auth-apis/src/dtos/sign-in`, `apps/auth-apis/src/dtos/password` | Request shapes of the Auth API, one folder per area (rule B8) |
| `config/env.ts` | The one reader of the process environment for code that runs before the settings are loaded (rule B12) |
| `scripts/check-structure.js`, `scripts/boot-check.js` | The structure check (rules in `structure.config.json`, known findings in `structure-allowlist.json`) and the boot check of both APIs in dev, test, uat and prod |
| `apps/ams-apis/src/dtos/permissions` | Request and response shapes for the permission matrix |
| `apps/ams-apis/src/dtos/roles` | Request and response shapes for roles |
| `apps/ams-apis/src/dtos/users` | Request and response shapes for users (validation) |
| `apps/ams-apis/src/enums` | API-level enumerations |
| `apps/ams-apis/src/interfaces` | Application contracts and response types |
| `apps/ams-apis/src/services` | Use-case services that join domain services |
| `apps/ams-apis/src/transformer` | Domain to response transformations |
| `apps/ams-apis/src/utils` | Application-specific helpers |
| `apps/ams-apis/test` | Application end-to-end tests |
| `apps/background-worker/src` | Queue job processors: e-mail, SAP sync, notifications. Filled by later epics |
| `apps/control-panel/src/commands` | Command-line tasks: seed:roles, seed:admin, seed:masters, create:admin |
| `apps/control-panel/test` | Command end-to-end tests |
| `apps/file-services/src` | Upload and download of attachments (S3). Filled by later epics |
| `apps/scheduler-job/src` | Timed jobs: reminders, escalation, clean-up. Filled by later epics |
| `config` | Typed configuration read from environment variables |
| `docs` | Pseudo-copy log written by /prd |
| `libs/audit/src/repositories/audit-log` | Audit log repository (contract.ts and database.ts) |
| `libs/audit/src/services` | AuditService: recordChange, recordRefusal |
| `libs/common/src/constants` | Shared constants |
| `libs/common/src/decorators` | Shared decorators |
| `libs/common/src/enums` | Shared enumerations |
| `libs/common/src/errors` | Typed exceptions with their HTTP code and error code |
| `libs/common/src/filters` | Global exception filter |
| `libs/common/src/pagination` | Paging types and helpers |
| `libs/common/src/pipes` | Validation and transformation pipes |
| `libs/common/src/response` | Standard success and failure bodies |
| `libs/common/src/transformers` | Shared response transformers |
| `libs/common/src/utils` | Generic helpers |
| `libs/core/src/auth` | Password and token services |
| `libs/core/src/authorization` | Permission guard, company guard, data-scope filter, cache (EPIC-ADM-01 US-ADM01-017) |
| `libs/infrastructure/src/redis` | RedisService helpers (getJson, setJson, deleteByPrefix); exported by `@libs/infrastructure` |
| `libs/database/src/extensions` | Prisma client extension: company filter and audit columns |
| `libs/database/src/repositories` | Shared repository bases |
| `libs/dmz/src/console` | Console command runner |
| `libs/dmz/src/rest` | REST bootstrap helpers and base controllers |
| `libs/infrastructure/src/cache` | Cache contract and Redis implementation |
| `libs/infrastructure/src/mail` | Mail provider (SES or SMTP) |
| `libs/infrastructure/src/storage` | Storage contract and S3 implementation |
| `libs/mailman/src` | Mail service used by applications and jobs |
| `libs/organisation/src/repositories/masters` | Masters questions: `contract.ts` re-exports `MastersPort`, `database.ts`, `index.ts` |
| `libs/organisation/src/repositories/masters-read` | Reads of departments, designations and companies |
| `libs/organisation/src/ports` | `MastersPort` (moved from `libs/users` in R18 S35) |
| `libs/organisation/src/repositories/user-company-role` | User, company and role rows |
| `libs/organisation/src/services` | Reads of companies, departments, designations |
| `libs/queues/src/contracts` | Job payload contracts |
| `libs/queues/src/processors` | Job processors |
| `libs/queues/src/queues` | Queue definitions |
| `libs/roles-and-permissions/src/enums` | Role and permission enumerations |
| `libs/roles-and-permissions/src/errors` | Role exceptions (ROLE_LOCKED, ROLE_IN_USE ...) |
| `libs/roles-and-permissions/src/interfaces` | Service interfaces and types |
| `libs/roles-and-permissions/src/repositories/permission-matrix-version` | Matrix version repository |
| `libs/roles-and-permissions/src/repositories/role` | Role repository |
| `libs/roles-and-permissions/src/repositories/role-permission` | Role permission (matrix cell) repository |
| `libs/roles-and-permissions/src/services` | RolesService, PermissionMatrixService |
| `libs/users/src/enums` | User enumerations |
| `libs/users/src/errors` | User exceptions |
| `libs/users/src/interfaces` | Service interfaces and types |
| `libs/users/src/policies` | Who may do what for users |
| `libs/users/src/repositories/one-time-password` | One-time password repository |
| `libs/users/src/repositories/user` | User repository (contract.ts and database.ts) |
| `libs/users/src/services` | UsersQueryService, UsersCommandService, UsersLifecycleService, OneTimePasswordService |
| `prisma/migrations` | Prisma migrations (never edited after they have run in a shared environment) |
| `resources/lang` | Language strings (English only) |
| `scripts` | Build and packaging scripts |
| `storage` | Local runtime file storage (not committed) |
| `tests/api` | pytest API and contract tests |
| `tests/e2e` | Playwright end-to-end tests |

## Structure rules of 28 Nov 2026 (release R16)

The team agreed on 28 Nov 2026 to follow `ProjectStructure/28-Nov-2026/IPL_AMS_Project-Structure-v0.4` and `docs/standards/BACKEND-STRUCTURE-v0.3`. In short:

| Rule | Meaning |
|---|---|
| Layers (B3), as built | base `common` < technical (`database`, `infrastructure`, `mailman`, `queues`, `settings`, `audit`, `dmz`, `integrations`) < domain (`organisation`, `users`, `roles-and-permissions`, and the planned modules) < application core (`core`, `security`); a library imports its own layer or a lower one. Listed exceptions: `organisation`/`users`, `core`/`security` |
| New module, new library (B14) | `proposals`, `approvals`, `finance`, `awi`, `delegation`, `reports`, `workflow`, `masters`, `documents`, `signature`, `notifications` are created only when the module's first story is built |
| Controllers by module (B15) | `controllers/<module>/` once an app serves more than one module; done in R16 S33 (PS-30) |
| Prisma only (B6) | Kysely only later, for a complex report query, with the team's agreement |

**Status (28 Nov 2026):** the 11 controllers of `ams-apis` are in 7 module folders (R16 S33, PS-30); `npm run lint` runs the structure check (`scripts/check-structure.js`, rules in `structure.config.json`, known findings in `structure-allowlist.json`).
