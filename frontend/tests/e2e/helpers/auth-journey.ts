/**
 * @file    auth-journey.ts
 * @module  Tests (journey helpers)
 *
 * @description
 * Helpers of the sign-in journeys. In plain words: makes a password user in the test database (with the known test password), removes it afterwards, and walks the stub single sign-on round trip.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005, US-LGN01-006, US-LGN01-007, US-LGN01-008
 * @subtask        ST-LGN01-005-FE-03
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.5
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/tests/e2e/helpers/auth-journey.ts
 * @lld-synced     v0.4
 * @status         built
 */

import { execSync } from 'node:child_process';
import type { APIRequestContext, Locator, Page } from '@playwright/test';

export const AUTH = process.env.AUTH_API_URL ?? 'http://localhost:3200/api/v1';
export const DB = process.env.E2E_DB_EXEC ?? 'docker exec backend-postgres-1 psql -U ams -d ams -c';
export const SHOTS = process.env.E2E_SHOTS ?? 'test-results/e2e-shots';
export const PASSWORD = 'Test@12345';
// bcrypt cost-12 hash of PASSWORD (made once with bcryptjs; used only by the tests)
const HASH = '$2b$12$2jFUI/81n4RIbETaphMEPOz9agYiEQ9ssh5jia3BPY87Dt8B1ectq';
const made: string[] = [];

/** Next 16 keeps visited pages hidden in the page, so only the visible element counts. */
export const tid = (page: Page, id: string): Locator => page.getByTestId(id).filter({ visible: true });
export const shot = (page: Page, name: string) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });

/** Makes an Active (or other status) password user with a known password. Returns the employee code. */
export function makeLocalUser(status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE', mustChange = false): string {
  const code = String(70000 + (Math.floor(Math.random() * 9000) + (Date.now() % 1000)) % 9999);
  execSync(`${DB} "insert into users (id, employee_code, full_name, email, auth_type, password_hash, must_change_password, status, updated_at) values (gen_random_uuid(), '${code}', 'Journey ${code}', 'j${code}@example.invalid', 'LOCAL', '${HASH}', ${mustChange}, '${status}', now())"`);
  made.push(code);
  return code;
}

export function unlockInDatabase(code: string): void {
  execSync(`${DB} "update users set locked_until = now() - interval '1 minute' where employee_code = '${code}'"`);
}

/** Removes the users made by makeLocalUser and their audit rows. */
export function removeMadeUsers(): void {
  for (const code of made.splice(0)) {
    execSync(`${DB} "delete from audit_log where entity_key = '${code}'"`);
    execSync(`${DB} "delete from users where employee_code = '${code}'"`);
  }
}

/** Fills the password form and presses Sign in. */
export async function submitPassword(page: Page, code: string, password: string): Promise<void> {
  await tid(page, 'employee-code').fill(code);
  await tid(page, 'password').fill(password);
  // wait for the answer, so two quick submits are never merged into one
  await Promise.all([page.waitForResponse((r) => r.url().includes('/auth/sign-in') && r.request().method() === 'POST'), tid(page, 'sign-in-submit').click()]);
}

/** Walks the stub round trip: starts, then calls the callback with the chosen stub account. The browser ends where the Auth API redirects it. */
export async function stubCallback(page: Page, request: APIRequestContext, account: string): Promise<void> {
  const start = await request.get(`${AUTH}/auth/sso/start`, { maxRedirects: 0 });
  const state = new URL('http://x' + start.headers()['location']).searchParams.get('state');
  await page.goto(`${AUTH}/auth/sso/callback?state=${state}&account=${account}`);
}
