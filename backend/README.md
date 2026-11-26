# AMS back end

NestJS 11 monorepo · TypeScript · Prisma (added in ST-ADM01-000-BE-02) · PostgreSQL · Redis.

Rules: `docs/standards/CODING-AND-DOCUMENTATION-STANDARD` in the documents project (sections 3 to 8 and 10). Applications: `ams-apis` (all HTTP APIs), `file-services`, `background-worker`, `scheduler-job`, `control-panel`. Libraries: see `STRUCTURE.md`.

## Commands

| Command | What it does |
|---|---|
| `npm run start:dev` | API on port 3000 with reload |
| `npm run build` | Build the API (`npm run build:all` builds every application) |
| `npm test` | Jest unit and end-to-end tests |
| `npm run lint` | ESLint and the header check |
| `docker compose up -d` | PostgreSQL, Redis and the local mail trap (web page and API on http://localhost:8025, SMTP on 1025) for local work |

Copy `.env.example` to `.env`. Never commit real values.

## Status (ST-ADM01-000-BE-01, 25 Nov 2026)

Set up: configuration, aliases, five applications, eleven empty libraries, typed config files, the health route `GET /api/v1/health`. Not here yet: Prisma (BE-02), exception filter (BE-04), Redis (BE-05), development sign-in (BE-06), seeds (BE-07). Objection and Knex are not used.
