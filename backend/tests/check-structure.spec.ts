/**
 * @file    check-structure.spec.ts
 * @module  Tests
 *
 * @description
 * Tests of the structure checker. In plain words: each rule of the structure document is broken on purpose in a small temporary folder and the checker must name the rule and the file; a folder that follows the rules passes.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R16-PS33
 * @status  built
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { checkStructure } = require('../scripts/check-structure.js') as {
  checkStructure: (a: { root: string; config: unknown; allowlist?: { rule: string; key: string; owner?: string; reason?: string }[] }) => {
    violations: { rule: string; key: string }[];
    allowed: { key: string }[];
    stale: { key: string }[];
  };
};

const CONFIG = {
  layers: [
    ['common'],
    ['database', 'audit', 'mailman', 'queues'],
    ['organisation', 'users'],
    ['core', 'security'],
  ],
  suffixes: { controllers: '.controller.ts', dtos: '.dto.ts', guards: '.guard.ts', interceptors: '.interceptor.ts', transformer: '.transformer.ts', errors: '.exception.ts' },
  g4: ['node_modules', 'dist', '.env', 'rbac-out', '__pycache__'],
};
const GOOD_IGNORE = 'node_modules\ndist\n.env\nrbac-out\n__pycache__\n';

let dirs: string[] = [];
function tree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'chkb-'));
  dirs.push(root);
  const all: Record<string, string> = { '.gitignore': GOOD_IGNORE, ...files };
  for (const [p, text] of Object.entries(all)) {
    const full = join(root, p);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, text);
  }
  return root;
}
afterEach(() => {
  dirs.forEach((d) => rmSync(d, { recursive: true, force: true }));
  dirs = [];
});
const rules = (root: string) => checkStructure({ root, config: CONFIG }).violations.map((v) => `${v.rule} ${v.key}`);

const GOOD: Record<string, string> = {
  'libs/common/src/index.ts': 'export {};\n',
  'libs/database/src/index.ts': "import { x } from '@libs/common/errors';\nexport {};\n",
  'libs/users/src/index.ts': "import { db } from '@libs/database';\nexport {};\n",
  'libs/users/src/errors/duplicate-email.exception.ts': 'export {};\n',
  'apps/ams-apis/src/controllers/users/users.controller.ts': "import { u } from '@libs/users';\nexport {};\n",
  'apps/ams-apis/src/controllers/roles/roles.controller.ts': 'export {};\n',
  'apps/ams-apis/src/dtos/users/create-user.dto.ts': 'export {};\n',
};

describe('structure checker (back end)', () => {
  it('passes a tree that follows the rules', () => {
    expect(rules(tree(GOOD))).toEqual([]);
  });
  it('B2: a library without index.ts is named', () => {
    expect(rules(tree({ ...GOOD, 'libs/queues/src/queue.service.ts': 'export {};\n' }))).toContain('B2 libs/queues');
  });
  it('B3: a library that imports an app, and an upward import between layers, are named', () => {
    const files = { ...GOOD, 'libs/users/src/bad.ts': "import { m } from '@app/ams-apis/module';\n", 'libs/database/src/up.ts': "import { u } from '@libs/users';\n" };
    const r = rules(tree(files));
    expect(r).toContain('B3 libs/users/src/bad.ts');
    expect(r).toContain('B3 database>users');
  });
  it('B3: a test file may import anything', () => {
    expect(rules(tree({ ...GOOD, 'libs/database/src/x.spec.ts': "import { u } from '@libs/users';\n" }))).toEqual([]);
  });
  it('B3-cycle: two libraries that import each other are named', () => {
    const files = { ...GOOD, 'libs/organisation/src/index.ts': "import { u } from '@libs/users';\n", 'libs/users/src/org.ts': "import { o } from '@libs/organisation';\n" };
    expect(rules(tree(files))).toContain('B3-cycle organisation,users');
  });
  it('B9: a file without its role suffix is named', () => {
    const files = { ...GOOD, 'apps/ams-apis/src/controllers/users/helper.ts': 'export {};\n', 'apps/ams-apis/src/dtos/users/CreateUser.ts': 'export {};\n', 'libs/users/src/errors/oops.ts': 'export {};\n' };
    const r = rules(tree(files));
    expect(r).toEqual(expect.arrayContaining(['B9 apps/ams-apis/src/controllers/users/helper.ts', 'B9 apps/ams-apis/src/dtos/users/CreateUser.ts', 'B9 libs/users/src/errors/oops.ts']));
  });
  it('B15: a loose controller next to module folders is named', () => {
    expect(rules(tree({ ...GOOD, 'apps/ams-apis/src/controllers/health.controller.ts': 'export {};\n' }))).toContain('B15 apps/ams-apis/src/controllers/health.controller.ts');
  });
  it('B15: an app with only a few loose controllers and no module folders passes', () => {
    const files = { 'apps/auth-apis/src/controllers/auth.controller.ts': 'export {};\n', 'apps/auth-apis/src/controllers/health.controller.ts': 'export {};\n' };
    expect(rules(tree(files))).toEqual([]);
  });
  it('G5: a .gitkeep in a folder that has files is named', () => {
    expect(rules(tree({ ...GOOD, 'libs/users/src/errors/.gitkeep': '' }))).toContain('G5 libs/users/src/errors');
  });
  it('G4: an ignore file that misses a machine-made folder is named', () => {
    expect(rules(tree({ ...GOOD, '.gitignore': 'node_modules\n' }))).toEqual(expect.arrayContaining(['G4 dist', 'G4 rbac-out', 'G4 .env']));
  });
  it('an allow-list entry turns a known finding into a listed one; an unused entry is reported', () => {
    const root = tree({ ...GOOD, 'libs/queues/src/queue.service.ts': 'export {};\n' });
    const res = checkStructure({ root, config: CONFIG, allowlist: [{ rule: 'B2', key: 'libs/queues', owner: 'o', reason: 'r' }, { rule: 'B2', key: 'gone', owner: 'o', reason: 'r' }] });
    expect(res.violations).toEqual([]);
    expect(res.allowed.map((a) => a.key)).toEqual(['libs/queues']);
    expect(res.stale.map((a) => a.key)).toEqual(['gone']);
  });
});
