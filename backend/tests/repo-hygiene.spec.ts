/**
 * @file    repo-hygiene.spec.ts
 * @module  Tests
 *
 * @description
 * Repository checks. In plain words: shows the decisions of the project are kept (Prisma only, aliases work, every file has a header).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = join(__dirname, '..');

function listTs(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (['node_modules', 'dist', 'coverage'].includes(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) listTs(full, out);
    else if (name.endsWith('.ts') && !name.endsWith('.spec.ts') && !name.endsWith('.e2e-spec.ts')) out.push(full);
  }
  return out;
}

describe('Repository rules (ST-ADM01-000-BE-01)', () => {
  /** @subtask ST-ADM01-000-BE-01 In plain words: Objection and Knex are not used (Prisma is the only ORM). */
  it('has no Objection or Knex in the dependencies or the code', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    expect(deps.filter((d) => /^(objection|knex)$/.test(d))).toEqual([]);
    const offenders = ['apps', 'libs', 'config']
      .flatMap((d) => listTs(join(root, d)))
      .filter((f) => /from ['"](objection|knex)['"]/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  /** @subtask ST-ADM01-000-BE-01 In plain words: every library can be imported through its alias. */
  it('resolves every library alias', () => {
    const libs = ['common', 'core', 'database', 'infrastructure', 'dmz', 'mailman', 'queues', 'audit', 'organisation', 'users', 'roles-and-permissions'];
    for (const lib of libs) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      expect(() => require(`@libs/${lib}`)).not.toThrow();
    }
  });

  /** @subtask ST-ADM01-000-BE-01 In plain words: every source file starts with a header block. */
  it('has a header block on every source file', () => {
    const out = execFileSync('node', [join(root, 'scripts', 'check-headers.js')], { cwd: root, encoding: 'utf8' });
    expect(out).toContain('PASS');
  });
});
