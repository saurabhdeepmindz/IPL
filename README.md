# AMS source code · local setup for every team member

Approval Management System (AMS), Phase 1, for Indian Potash Limited. Two applications in one repository:

| Folder | What | Port |
|---|---|---|
| `backend/` | NestJS 11 API and jobs (TypeScript, Prisma, PostgreSQL, Redis) | 3000 (3100 is used for test runs) |
| `frontend/` | Next.js 16 web application (React 19, UX4G, TanStack Query) | 3001 |

Design, stories, LLD, sub-tasks, the coding standard and the test results live in the documents project (`IPL-ProjectSourceCode/docs`), not in this repository. Every source file starts with a header block that names its story and sub-task. Read `backend/README.md`, `backend/STRUCTURE.md` and `frontend/README.md` once.

**First time on localhost? Follow the step-by-step guide `INSTALL-LOCALHOST.md`.** This README is the reference.

## 1. What to install (once per computer)

| Tool | Version we use | Why |
|---|---|---|
| Git | any recent | clone and commit |
| Node.js | 22 or newer (we use 24.x), with npm 10 or newer | both applications; the back end needs 22+ |
| Docker Desktop | 4.x or newer, running | PostgreSQL 16 and Redis 7 in containers |
| Python | 3.12 | only for the API contract tests (`pytest`) |
| A code editor | VS Code with the ESLint and Prettier extensions | the project lints on commit |

Windows notes: use PowerShell or Git Bash. Some company computers block **compiled native programs** (Windows Application Control). That is why the project uses pure-JavaScript and pure-Python libraries (`bcryptjs`, `pg8000`). If a command is blocked, tell the tech lead; do not add a package with a native binary.

## 2. Get the code

```
git clone https://github.com/saurabhdeepmindz/IPL.git
cd IPL
```

(The repository root is the `source-code` folder: `backend`, `frontend`, `requirements.txt`, this file.)

## 3. Start PostgreSQL and Redis

```
cd backend
docker compose up -d
```

This starts PostgreSQL on port **5432** and Redis on **6379**. If port 5432 is already used on your computer, set `POSTGRES_PORT=5433` in `backend/.env` (step 4) before you run the command, and use the same port in `DATABASE_URL`. Check with `docker ps`: two containers, `postgres` and `redis`, are up.

## 4. Set up the back end

```
cd backend
copy .env.example .env          (Git Bash: cp .env.example .env)
npm install                     (also runs `prisma generate`)
npm run prisma:deploy           (creates the tables)
npm run seed:all                (seeds companies, roles, permissions, departments, designations, the Administrator 10001)
```

Edit `.env` only where needed:

| Setting | Default | Change when |
|---|---|---|
| `DATABASE_URL` | `postgresql://ams:ams@localhost:5432/ams` | your Postgres port is not 5432 |
| `APP_ENV` | `dev` | `test` for the API contract tests (see 7) |
| `JWT_SECRET` | `change-me` | never commit a real secret; `.env` is git-ignored |
| `CORS_ORIGINS`, `WEB_BASE_URL` | `http://localhost:3001` | the front end runs on another port |

Run it: `npm run start:dev` (API on http://localhost:3000, health check `GET /api/v1/health`). The development sign-in (`POST /api/v1/dev/sign-in`) exists only when `APP_ENV` is `dev` or `test`; it does not exist in production.

## 5. Set up the front end

```
cd frontend
copy .env.example .env.local
```

Add these lines to `.env.local` for local work:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_DEV_SIGN_IN=true
```

Then:

```
npm install
npx playwright install chromium     (once; the tests use this browser)
npx next dev -p 3001
```

Open http://localhost:3001/login, use the development sign-in with employee code **10001** and company **IPL**. After you sign in, use the menu and links; **do not reload the page** (the access token is kept in memory only, and the refresh route comes with the sign-in epic, so a reload signs you out). `NEXT_PUBLIC_DEV_SIGN_IN` must never be true in a shared or production build.

**One-click review stack (Windows):** `run-local.bat` in this folder builds and starts the API on port 3100 and the front end on port 3001. Docker must be running first (step 3).

## 6. Python tools for the API contract tests (optional but needed before a story is closed)

```
python -m venv ipl-venv
ipl-venv\Scripts\activate           (Git Bash: source ipl-venv/Scripts/activate)
pip install -r requirements.txt
```

## 7. Run the checks

| What | Command | Where |
|---|---|---|
| Back end unit and route tests (real PostgreSQL and Redis) | `npm test` | `backend` |
| Back end lint and header check | `npm run lint` | `backend` |
| Build all five back-end applications | `npm run build:all` | `backend` |
| API contract tests (pytest) | start the API with `APP_ENV=test` and `APP_PORT=3100` (`npm run build` then `node dist/apps/ams-apis/apps/ams-apis/src/main.js`), then in `backend`: `set AMS_API_URL=http://localhost:3100/api/v1` and `pytest tests/api -q` | `backend`, venv on |
| Front end unit, component and story tests | `npx vitest run` | `frontend` |
| Front end lint, header check, types | `npm run lint` and `npx tsc --noEmit` | `frontend` |
| Visual tests of the design components | `npm run build-storybook` once, then `npx playwright test tests/visual/` | `frontend` |
| Journeys (browser, real API and web app) | start the API as for pytest, then `set E2E=1`, `set E2E_SHOTS=<folder for screenshots>` and `npx playwright test tests/e2e` (builds and starts Next on 3001 by itself) | `frontend` |

Test results of a story are saved with its sprint in the documents project: `docs/releases/R<n>/sprints/S<nn>/test-results/`.

## 8. Libraries (all installed by `npm install`; versions are in each `package.json` and lock file)

**Back end:** NestJS 11 (`@nestjs/common`, `core`, `config`, `jwt`, `platform-express`, `swagger`), Prisma 7.10.1 with `@prisma/adapter-pg` and `pg` (PostgreSQL), `ioredis` (Redis), `bcryptjs` (password hashes), `class-validator` and `class-transformer`, `reflect-metadata`, `rxjs`, `dotenv`. Tests and tools: Jest, ts-jest, supertest, ESLint, Prettier, TypeScript. Prisma is the only ORM; Objection and Knex are not used.

**Front end:** Next.js 16, React 19, TypeScript, TanStack Query, React Hook Form with Zod, Axios, Zustand, `next-themes`, Tailwind 4 (prefix `tw:`, layout only), `lucide-react`. Design: UX4G (loaded from a CDN) and the brand tokens (`tokens/brand.json`, generated CSS is never edited by hand). Tests and tools: Vitest, Testing Library, Storybook with the accessibility add-on, Playwright, ESLint, Prettier, Husky with commitlint.

**Python (tests only):** `pytest`, `pytest-html`, `requests`, `pg8000`.

## 9. Working rules (short version; the full Standard is in `docs/standards`)

1. Work from the sprint tasks in `docs/releases/R<n>/sprints/S<nn>/TASKS.md`. Write the test first, watch it fail, then write the code.
2. Every file keeps its header block (`@story`, `@subtask`, `@lld`, `@status`). Limits: 250 lines per file, 30 per method, one class per file, a component up to 200 lines.
3. Commits use the form `feat(scope): what [US-...][ST-...]` (Husky checks it). Never commit `.env`, secrets or real personal data.
4. Only `database.ts` repository files import Prisma. The failure body is always `{ error: { code, message, fields[] } }`.
5. Front end: UX4G first, brand tokens second, `tw:` for layout gaps only. The access token stays in memory; user text is never rendered as HTML.
6. A story is closed only when its tests, lint, the build and the regression of all earlier sprints are green.

## 10. If something does not work

| Problem | What to try |
|---|---|
| `docker compose up` fails or Postgres does not start | Start Docker Desktop; check that port 5432 and 6379 are free, or change the ports in `.env` |
| `prisma migrate` cannot connect | `DATABASE_URL` port must match `POSTGRES_PORT`; run `docker ps` |
| API starts but a sign-in answers 404 | `APP_ENV` must be `dev` or `test` |
| The browser shows a CORS error | `CORS_ORIGINS` in the back-end `.env` must contain the web address, for example `http://localhost:3001` |
| You are sent back to /login after a reload | Expected in this release (token in memory, no refresh route yet); sign in again |
| `npm audit` shows 3 high findings | Known: Prisma CLI, build-time only; Prisma is pinned at 7.10.1 on purpose |
| Playwright says a browser is missing | `npx playwright install chromium` |
| "Port 3000 already in use" | Another API is running; stop it or set `APP_PORT` |
