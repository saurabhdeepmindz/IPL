/**
 * @file    boot-check.js
 * @module  Tooling
 *
 * @description
 * Boot check of the two APIs. In plain words: starts the built main API and the built Auth API once for each environment (dev, test, uat, prod) on free ports, asks the health route, checks that the port and the CORS origin come from the settings, and that the development sign-in exists only in dev and test. In prod the mail transport is smtp and the identity provider mode is oidc, because the stand-ins are refused there. Run after `npm run build:all`; it stops every process it started.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R18-S35
 * @status  built
 */
const { spawn } = require('node:child_process');
const http = require('node:http');
const net = require('node:net');
const { join } = require('node:path');

const ROOT = join(__dirname, '..');
const APPS = [
  { name: 'ams-apis', file: 'dist/apps/ams-apis/apps/ams-apis/src/main.js', portVar: 'APP_PORT', devRoute: true },
  { name: 'auth-apis', file: 'dist/apps/auth-apis/apps/auth-apis/src/main.js', portVar: 'AUTH_PORT', devRoute: false },
];
const MODES = ['dev', 'test', 'uat', 'prod'];
const ORIGIN = 'http://boot-check.example';

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
    s.on('error', reject);
  });
}

function request(port, path, method = 'GET', headers = {}) {
  return new Promise((resolve) => {
    const req = http.request({ host: '127.0.0.1', port, path, method, headers, timeout: 4000 }, (res) => {
      res.resume();
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers }));
    });
    req.on('error', () => resolve({ status: 0, headers: {} }));
    req.on('timeout', () => req.destroy());
    req.end();
  });
}

async function waitFor(port, tries = 40) {
  for (let i = 0; i < tries; i += 1) {
    const r = await request(port, '/api/v1/health');
    if (r.status === 200) return r;
    await new Promise((ok) => setTimeout(ok, 1000));
  }
  return { status: 0, headers: {} };
}

async function check(app, mode) {
  const port = await freePort();
  const env = { ...process.env, APP_ENV: mode, [app.portVar]: String(port), CORS_ORIGINS: ORIGIN, MAIL_TRANSPORT: mode === 'prod' ? 'smtp' : process.env.MAIL_TRANSPORT || 'log', ...(mode === 'prod' ? { IDP_MODE: 'oidc' } : {}) };
  const child = spawn('node', [app.file], { cwd: ROOT, env, stdio: 'ignore' });
  const problems = [];
  try {
    const health = await waitFor(port);
    if (health.status !== 200) return [`${app.name} ${mode}: health route did not answer 200 on port ${port}`];
    const cors = await request(port, '/api/v1/health', 'GET', { Origin: ORIGIN });
    if (cors.headers['access-control-allow-origin'] !== ORIGIN) problems.push(`${app.name} ${mode}: CORS origin does not come from CORS_ORIGINS`);
    if (app.devRoute) {
      const dev = await request(port, '/api/v1/dev/sign-in', 'POST', { 'content-type': 'application/json' });
      const exists = dev.status !== 404;
      if (exists !== (mode === 'dev' || mode === 'test')) problems.push(`${app.name} ${mode}: the development sign-in ${exists ? 'exists' : 'is missing'} (it belongs to dev and test only)`);
    }
  } finally {
    child.kill();
  }
  return problems;
}

(async () => {
  const all = [];
  for (const app of APPS) {
    for (const mode of MODES) {
      const p = await check(app, mode);
      console.log(`${p.length ? 'FAIL' : 'ok  '} ${app.name} ${mode}`);
      all.push(...p);
    }
  }
  all.forEach((p) => console.error(`  ${p}`));
  console.log(all.length ? 'Boot check: FAIL' : 'Boot check: PASS');
  process.exit(all.length ? 1 : 0);
})();
