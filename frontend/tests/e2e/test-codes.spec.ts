/**
 * @file    test-codes.spec.ts
 * @module  Journey helpers
 *
 * @description
 * Cases of the journey helper `freeEmployeeCode`. In plain words: the codes the journeys give to the users they make never repeat in a run and never equal a code a user already has.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-27
 *
 * @epic    EPIC-LGN-03
 * @story   none (follow-up B24 of the master to-do; test data only)
 * @status  built
 */
import { execSync } from 'node:child_process';
import { expect, test } from '@playwright/test';
import { DB, freeEmployeeCode } from './helpers/auth-journey';

test.describe('Journey test codes (B24)', () => {
  test('codes do not repeat in a run and stay inside the range', () => {
    const drawn = Array.from({ length: 60 }, () => freeEmployeeCode(71000, 300));
    expect(new Set(drawn).size).toBe(60);
    for (const c of drawn) {
      expect(c).toMatch(/^\d{5}$/);
      expect(Number(c)).toBeGreaterThanOrEqual(71000);
      expect(Number(c)).toBeLessThan(71300);
    }
  });

  test('a code that a user already has is never returned', () => {
    const code = '71111';
    execSync(`${DB} "insert into users (id, employee_code, full_name, email, status, updated_at) values (gen_random_uuid(), '${code}', 'Code Probe', 'probe${code}@example.invalid', 'ACTIVE', now())"`);
    try {
      // the range holds 71111 (taken) and 71112 (free): only 71112 can come back, and then nothing is left
      expect(freeEmployeeCode(71111, 2)).toBe('71112');
      expect(() => freeEmployeeCode(71111, 2)).toThrow(/no free employee code/);
    } finally {
      execSync(`${DB} "delete from users where employee_code = '${code}'"`);
    }
  });
});
