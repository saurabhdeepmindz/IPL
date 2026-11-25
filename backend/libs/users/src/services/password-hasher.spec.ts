/**
 * @file    password-hasher.spec.ts
 * @module  UsersModule
 *
 * @description
 * Supporting tests of the password hasher (Jest). Written before the code (TDD). They have no test-case ID of their own (decision ST-02); they carry AC-US007-02. In plain words: shows that a password becomes a salted hash that cannot be turned back, and that the right password matches it.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-007
 * @subtask        ST-ADM01-007-BE-05
 * @lld            LLD-EPIC-ADM-01 v0.26 §6.1
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.26.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/libs/users/src/services/password-hasher.spec.ts
 * @lld-synced     v0.26
 * @status         built
 */

import { PasswordHasher } from './password-hasher';

describe('PasswordHasher', () => {
  const hasher = new PasswordHasher();

  /**
   * @story   US-ADM01-007
   * @ac      AC-US007-02
   * @subtask ST-ADM01-007-BE-05
   * In plain words: supporting test. The hash is not the password, the right password matches it and a wrong one does not.
   */
  it('hashes a password and verifies it', async () => {
    const hash = await hasher.hash('Tr0ub4dor-demo');
    expect(hash).not.toContain('Tr0ub4dor-demo');
    expect(hash).toMatch(/^\$2[aby]\$12\$/);
    await expect(hasher.verify('Tr0ub4dor-demo', hash)).resolves.toBe(true);
    await expect(hasher.verify('wrong-password', hash)).resolves.toBe(false);
  });

  /**
   * @story   US-ADM01-007
   * @ac      AC-US007-02
   * @subtask ST-ADM01-007-BE-05
   * In plain words: supporting test. The hash is salted: the same password gives a different hash each time.
   */
  it('gives a different hash for the same password', async () => {
    const [a, b] = await Promise.all([hasher.hash('same-password'), hasher.hash('same-password')]);
    expect(a).not.toBe(b);
  });
});
