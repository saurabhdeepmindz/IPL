# AMS back end (NestJS monorepo)

Built fresh from `ProjectStructure/BACKEND-FOLDER-STRUCTURE.md`, Project Foundation v0.1 and Standard v0.3.

Created 25 Nov 2026 as an empty folder skeleton (each folder holds a `.gitkeep`). No code is written yet: `/prd` copies the pseudo-code of one story at a time into these folders, and `/dev` elaborates it. Files `package.json`, `tsconfig.json` and the framework configuration come from the foundation sub-tasks (see `docs/modules/ADM-A1/subtasks/EPIC-ADM-01/`).

## Differences from the team's structure document
| Item in the team document | Here | Why |
|---|---|---|
| `apps/starter-apis` and `apps/auth-apis` | One application `apps/ams-apis` (sign-in is added to it by the sign-in epic) | Decision of 24 Nov 2026 and Standard §7.1 |
| `database/` (Knex migrations), `knexfile.js`, Objection `baseModel.ts` and `queryBuilder.ts` | Left out | Prisma is the only ORM and migration tool |
| `libs/users` models folder | Left out | Prisma generates the models |
| `libs/audit`, `libs/organisation` | Added | Needed by EPIC-ADM-01 (Foundation §2.2) |
| `libs/location`, `libs/payment-and-subscription`, `libs/sample-domain`, `libs/settings` | Left out | Not part of AMS |
| `libs/core/src/redis` | Added | `RedisService` helpers (ST-ADM01-000-BE-05) |
| `tests/api`, `tests/e2e` | Added | pytest and Playwright (Standard section 10) |

## Folders

| Folder | Purpose |
|---|---|
| `apps/ams-apis/src/constants` | Application constants |
| `apps/ams-apis/src/controllers` | HTTP routes. Thin: route, guards, one service call |
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
| `libs/core/src/redis` | RedisService helpers (getJson, setJson, deleteByPrefix) |
| `libs/database/src/extensions` | Prisma client extension: company filter and audit columns |
| `libs/database/src/repositories` | Shared repository bases |
| `libs/dmz/src/console` | Console command runner |
| `libs/dmz/src/rest` | REST bootstrap helpers and base controllers |
| `libs/infrastructure/src/cache` | Cache contract and Redis implementation |
| `libs/infrastructure/src/mail` | Mail provider (SES or SMTP) |
| `libs/infrastructure/src/storage` | Storage contract and S3 implementation |
| `libs/mailman/src` | Mail service used by applications and jobs |
| `libs/organisation/src/ports` | MastersPort and other ports to later epics (with stand-ins) |
| `libs/organisation/src/repositories/company` | Companies (read) |
| `libs/organisation/src/repositories/department` | Departments (read) |
| `libs/organisation/src/repositories/designation` | Designations (read) |
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
