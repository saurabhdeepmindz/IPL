/**
 * @file    rememberChoices.test.ts
 * @module  Tests
 *
 * @description
 * Vitest cases of US-LGN03-006 (Browser remembers the employee code and the last company and year). In plain words: every case is a named todo until /dev writes it first.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN03-006
 * @subtask        ST-LGN03-006-FE-01
 * @lld            LLD-EPIC-LGN-03 v0.3 §10
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/tests/unit/features/auth/rememberChoices.test.ts
 * @lld-synced     v0.3
 * @status         elaborated
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readContext, readEmployeeCode, rememberContext, rememberEmployeeCode } from '@/features/auth/rememberChoices';

describe('Browser remembers the employee code and the last company and year (US-LGN03-006)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  /** @tc TC-LGN03-006-J01 @story US-LGN03-006 @ac AC-US-LGN03-006-01 @subtask ST-LGN03-006-FE-01 In plain words: the last company and year are stored under one key, read back as they were, cleared when the box is unticked, and never break when the stored text is damaged or the browser blocks storage. */
  it('TC-LGN03-006-J01 stores, reads and clears the last company and year', () => {
    expect(readContext()).toBeNull();
    rememberContext({ companyCode: 'IPL', financialYear: '2026-27' });
    expect(JSON.parse(localStorage.getItem('ams.context') ?? 'null')).toEqual({ companyCode: 'IPL', financialYear: '2026-27' });
    expect(readContext()).toEqual({ companyCode: 'IPL', financialYear: '2026-27' });
    rememberContext({ companyCode: 'IPLFB', financialYear: '2025-26' });
    expect(readContext()).toEqual({ companyCode: 'IPLFB', financialYear: '2025-26' });
    rememberContext(null);
    expect(localStorage.getItem('ams.context')).toBeNull();
    expect(readContext()).toBeNull();
  });

  /** @story US-LGN03-006 @ac AC-US-LGN03-006-01 @subtask ST-LGN03-006-FE-01 In plain words: supporting test. Damaged or foreign text under the key gives nothing, not an error. */
  it('gives nothing for damaged or foreign stored text', () => {
    for (const bad of ['not json', '42', '{"companyCode":1}', '{"financialYear":"2026-27"}', '[]', 'null']) {
      localStorage.setItem('ams.context', bad);
      expect(readContext()).toBeNull();
    }
  });

  /** @tc TC-LGN03-006-J02 @story US-LGN03-006 @ac AC-US-LGN03-006-02 @subtask ST-LGN03-006-FE-01 In plain words: the employee code is stored on its own (never a password), read back, and cleared when the box is unticked. The key is the one the sign-in page already uses, so codes remembered earlier still work. */
  it('TC-LGN03-006-J02 stores, reads and clears the employee code and never a password', () => {
    expect(readEmployeeCode()).toBeNull();
    rememberEmployeeCode('10002');
    expect(localStorage.getItem('ams-rem-code')).toBe('10002');
    expect(readEmployeeCode()).toBe('10002');
    expect(Object.keys(localStorage)).toEqual(['ams-rem-code']);
    rememberEmployeeCode(null);
    expect(localStorage.getItem('ams-rem-code')).toBeNull();
    expect(readEmployeeCode()).toBeNull();
  });

  /** @story US-LGN03-006 @ac AC-US-LGN03-006-02 @subtask ST-LGN03-006-FE-01 In plain words: supporting test. A stored value that is not an employee code (empty, too long, with spaces or symbols) is not given back. */
  it('does not give back a stored value that is not an employee code', () => {
    for (const bad of ['', ' ', '10002 ', 'a b', 'x'.repeat(40), '<script>']) {
      localStorage.setItem('ams-rem-code', bad);
      expect(readEmployeeCode()).toBeNull();
    }
  });

  /** @story US-LGN03-006 @ac AC-US-LGN03-006-01 @subtask ST-LGN03-006-FE-01 In plain words: supporting test. When the browser blocks storage (a private window) nothing is remembered and nothing throws. */
  it('does nothing and does not throw when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => rememberEmployeeCode('10002')).not.toThrow();
    expect(() => rememberContext({ companyCode: 'IPL', financialYear: '2026-27' })).not.toThrow();
    expect(() => rememberContext(null)).not.toThrow();
    expect(readEmployeeCode()).toBeNull();
    expect(readContext()).toBeNull();
  });
});
