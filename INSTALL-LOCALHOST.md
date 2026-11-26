# Install the AMS application on localhost · step by step

For a team member or a reviewer who wants to run the Approval Management System (AMS) on their own computer. It takes about 30 to 45 minutes the first time. Every step says what you should see when it worked. Commands are for **Windows (PowerShell or Git Bash)**; the Linux and macOS commands are the same except where noted.

You will run four things: **PostgreSQL** (database), **Redis** (cache), the **API** (back end, port 3100) and the **web application** (front end, port 3001).

---

## Step 0 · Check what you need

| # | Tool | How to check | You need |
|---|---|---|---|
| 1 | Git | `git --version` | any recent version |
| 2 | Node.js | `node -v` | 22 or newer (24 is what we use) |
| 3 | npm | `npm -v` | 10 or newer (comes with Node) |
| 4 | Docker Desktop | `docker --version`, then open Docker Desktop and wait for "Engine running" | 4.x or newer |
| 5 | Python (only to run the API contract tests) | `python --version` | 3.12 |

If a tool is missing, install it from its official site: nodejs.org (choose the LTS or newer), docker.com (Docker Desktop), python.org, git-scm.com. Restart the terminal afterwards.

> Some company computers block downloaded programs. If an installer or a command is blocked, ask your IT team. Do not try to bypass the block.

---

## Step 1 · Get the code

1. Open a terminal in the folder where you keep projects, for example `D:\Work`.
2. Clone the repository and go in:

```
git clone https://github.com/saurabhdeepmindz/IPL.git
cd IPL
```

3. Check: `dir` (or `ls`) shows the folders `backend` and `frontend` and the files `README.md` and `run-local.bat`.

---

## Step 2 · Start the database and the cache (Docker)

1. Make sure Docker Desktop is running.
2. In the terminal:

```
cd backend
docker compose up -d   # also starts a local mail trap: every e-mail the application sends can be read at http://localhost:8025
```

3. Check: `docker ps` lists two containers, one with `postgres` and one with `redis`, both "Up".

**If port 5432 is already used on your computer** (you have another PostgreSQL): create the file `backend\.env` first (Step 3, point 1), add the line `POSTGRES_PORT=5433`, run `docker compose up -d` again, and use `5433` in `DATABASE_URL` in Step 3. The rest of this guide uses 5432.

---

## Step 3 · Set up the back end (API)

Still in the `backend` folder:

1. Make your settings file:

```
copy .env.example .env          (Git Bash or Linux/macOS: cp .env.example .env)
```

2. Open `.env` in a text editor. For a normal local run **you change nothing**, except:
   - `DATABASE_URL` port, only if you used 5433 in Step 2 (`postgresql://ams:ams@localhost:5433/ams`);
   - `JWT_SECRET`, put any long random text of your own (never share it, never commit it).

3. Install the libraries (about 2 to 5 minutes):

```
npm install
```

Check: it ends without errors. It also prints "Generated Prisma Client".

4. Create the tables in the database:

```
npm run prisma:deploy
```

Check: it prints "All migrations have been successfully applied".

5. Fill the starting data (companies, roles, permissions, departments, designations and the Administrator user 10001):

```
npm run seed:all
```

Check: it finishes without an error message.

---

## Step 4 · Start the API

1. Build it once:

```
npx nest build ams-apis
```

2. Start it on port 3100 (this guide uses 3100 so it never clashes with another app on 3000).

   PowerShell:

```
$env:APP_ENV="dev"; $env:APP_PORT="3100"; node dist/apps/ams-apis/apps/ams-apis/src/main.js
```

   Git Bash / Linux / macOS:

```
APP_ENV=dev APP_PORT=3100 node dist/apps/ams-apis/apps/ams-apis/src/main.js
```

3. Leave this window open. Check, in another terminal or in the browser, open http://localhost:3100/api/v1/health : it answers `{"data":{"status":"ok"...}}` (or similar with status ok).

`APP_ENV=dev` turns on the development sign-in. It does not exist in production.

---

## Step 5 · Set up and start the web application

Open a **new terminal** and go to the `frontend` folder (`cd IPL\frontend`).

1. Make your settings file:

```
copy .env.example .env.local     (Git Bash or Linux/macOS: cp .env.example .env.local)
```

2. Open `.env.local` and set these two lines (change the first one if it says port 3000):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3100/api/v1
NEXT_PUBLIC_DEV_SIGN_IN=true
```

   `NEXT_PUBLIC_DEV_SIGN_IN=true` shows the development sign-in form. Never use it in a shared or production build.

3. Install the libraries (2 to 5 minutes):

```
npm install
```

4. Start the web application:

```
npx next dev -p 3001
```

   (For a faster, production-like run use `npx next build` and then `npx next start -p 3001`.)

5. Check: the terminal says "Ready" and http://localhost:3001/login opens a page with the title "Sign in".

---

## Step 6 · Sign in and look around

1. Open http://localhost:3001/login .
2. Below the "Sign in" text you see the **development sign-in** form. Enter employee code **10001** and company **IPL**, then click **Sign in**.
3. You land on **Role Management**: the list of roles. From here you can create a role, open a role, and assign users.
4. **Do not reload the page** after you sign in. The access token is kept in memory only and the refresh route is not built yet, so a reload sends you back to the sign-in page. Sign in again if that happens.

---

## Step 7 (optional) · Run the automatic checks

| What | Where | Command | You should see |
|---|---|---|---|
| Back-end tests | `backend` | `npm test` | all suites pass |
| Front-end tests | `frontend` | `npx vitest run` | all tests pass |
| Front-end lint and types | `frontend` | `npm run lint` and `npx tsc --noEmit` | no errors |

The browser journeys and the API contract tests need two more tools (the Playwright browser: `npx playwright install chromium`, and the Python tools from `requirements.txt`); the steps are in `README.md`, sections 6 and 7.

---

## One-click start on Windows (after the first install)

After Steps 1 to 3 and 5 are done once, you can start both applications with `run-local.bat` in the repository root. Docker Desktop must be running with the two containers up (Step 2).

---

## Stop and start again

| To | Do |
|---|---|
| Stop the web application or the API | Click its terminal window and press `Ctrl + C` |
| Stop the database and the cache | `cd backend`, then `docker compose stop` |
| Start them again later | `docker compose up -d` in `backend`, then Step 4 and Step 5.4 |
| Remove all local data and start fresh | `docker compose down -v` in `backend` (this deletes the database), then Steps 2 to 4 |

---

## If something goes wrong

| What you see | What to do |
|---|---|
| `docker compose up` fails, or `docker ps` shows nothing | Start Docker Desktop and wait until it says "Engine running"; try again |
| `npm run prisma:deploy` says it cannot reach the database | The `DATABASE_URL` port must match the Docker port; check with `docker ps` |
| The API window shows an error about Redis | Check that the `redis` container is up (`docker ps`) |
| The browser shows a CORS error | In `backend\.env`, `CORS_ORIGINS` must be `http://localhost:3001` (the web address); restart the API |
| The sign-in form does not appear | `NEXT_PUBLIC_DEV_SIGN_IN=true` must be in `frontend\.env.local`; restart `next dev` after changing it |
| Sign-in says the user is unknown | Run `npm run seed:all` again in `backend`; the user is employee code 10001 and company IPL |
| "Port is already in use" | Another program uses that port; close it, or change `APP_PORT` (API) or the `-p` number (web) and the matching URL in `.env.local` |
| You are sent back to the sign-in page | Normal after a page reload in this release; sign in again |
| A command is blocked by the computer's security policy | Tell the tech lead; the project uses libraries without native binaries on purpose |

Need more detail? Read `README.md` (setup, checks, libraries, working rules), `backend/README.md` and `frontend/README.md`.
