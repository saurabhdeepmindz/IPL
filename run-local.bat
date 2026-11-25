@echo off
REM Starts the AMS back end (port 3100) and front end (port 3001) on this computer for review.
REM Needs Docker running with the Postgres and Redis of backend\docker-compose.yml (docker compose up -d).
REM Open http://localhost:3001/login and sign in with employee code 10001 and company IPL (development sign-in).
cd /d "%~dp0backend"
call npx nest build ams-apis
start "AMS API 3100" cmd /k "set APP_ENV=dev&& set APP_PORT=3100&& node dist\apps\ams-apis\apps\ams-apis\src\main.js"
cd /d "%~dp0frontend"
set NEXT_PUBLIC_API_BASE_URL=http://localhost:3100/api/v1
set NEXT_PUBLIC_DEV_SIGN_IN=true
call npx next build
start "AMS Web 3001" cmd /k "npx next start -p 3001"
echo.
echo Open http://localhost:3001/login  (employee code 10001, company IPL)
