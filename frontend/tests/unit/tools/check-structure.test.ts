/**
 * @file    check-structure.test.ts
 * @module  Tooling
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
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkStructure } from '../../../scripts/check-structure.mjs';

const CONFIG = {
  featureDirs: ['components', 'hooks', 'services', 'schemas', 'types', 'utils', 'constants', 'store'],
  componentAreas: ['src/components/ui', 'src/components/layout', 'src/components/ams'],
  appMayImport: ['components', 'utils'],
  lowLayers: ['src/lib', 'src/hf', 'src/store', 'src/constants', 'src/types', 'src/providers'],
  g4: ['node_modules', '.next', 'storybook-static', 'test-results', 'rbac-out', '*.tsbuildinfo', '.env'],
};
const GOOD_IGNORE = 'node_modules\n.next\nstorybook-static\ntest-results\nrbac-out\n*.tsbuildinfo\n.env*\n';

let dirs: string[] = [];
function tree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'chk-'));
  dirs.push(root);
  const all = { '.gitignore': GOOD_IGNORE, ...files };
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
const rules = (root: string, allowlist: { rule: string; key: string }[] = []) => checkStructure({ root, config: CONFIG, allowlist }).violations.map((v) => `${v.rule} ${v.key}`);

const GOOD = {
  'src/features/users/index.ts': "export * from './components/UserForm';\n",
  'src/features/users/components/UserForm/UserForm.tsx': 'export const UserForm = () => null;\n',
  'src/features/users/components/UserForm/index.ts': "export * from './UserForm';\n",
  'src/features/users/hooks/useUsers.ts': 'export const useUsers = () => 1;\n',
  'src/features/users/hooks/users.keys.ts': 'export const k = 1;\n',
  'src/features/users/types/user.types.ts': 'export type U = 1;\n',
  'src/features/users/schemas/userFormSchema.ts': 'export const s = 1;\n',
  'src/app/users/page.tsx': "import { UserForm } from '@/features/users/components/UserForm';\nexport default UserForm;\n",
};

describe('structure checker (front end)', () => {
  it('passes a tree that follows the rules', () => {
    expect(rules(tree(GOOD))).toEqual([]);
  });
  it('F2: a loose component file in components/ is named', () => {
    const r = rules(tree({ ...GOOD, 'src/features/users/components/UserTable.tsx': 'export const T = 1;\n' }));
    expect(r).toContain('F2 src/features/users/components/UserTable.tsx');
  });
  it('F2: a component folder without index.ts is named', () => {
    const files = { ...GOOD, 'src/features/users/components/UserTable/UserTable.tsx': 'export const T = 1;\n' };
    expect(rules(tree(files))).toContain('F2 src/features/users/components/UserTable');
  });
  it('F4: a kebab-case folder in components/ is named', () => {
    const files = { ...GOOD, 'src/features/users/components/set-password/SetPasswordPage.tsx': 'export const P = 1;\n', 'src/features/users/components/set-password/index.ts': '\n' };
    expect(rules(tree(files))).toContain('F4 src/features/users/components/set-password');
  });
  it('F14: a loose file in a feature root is named', () => {
    expect(rules(tree({ ...GOOD, 'src/features/users/landing.map.ts': 'export const a = 1;\n' }))).toContain('F14 src/features/users/landing.map.ts');
  });
  it('F6: a feature without index.ts and a folder that is not in the anatomy are named', () => {
    const files = { ...GOOD, 'src/features/roles/components/RoleForm/RoleForm.tsx': 'x\n', 'src/features/roles/components/RoleForm/index.ts': 'x\n', 'src/features/users/misc/a.ts': 'x\n' };
    const r = rules(tree(files));
    expect(r).toContain('F6 src/features/roles');
    expect(r).toContain('F6 src/features/users/misc');
  });
  it('F13: a hook, type and schema with the wrong file name are named', () => {
    const files = { ...GOOD, 'src/features/users/hooks/getUsers.ts': 'x\n', 'src/features/users/types/user.ts': 'x\n', 'src/features/users/schemas/userForm.ts': 'x\n' };
    const r = rules(tree(files));
    expect(r).toEqual(expect.arrayContaining(['F13 src/features/users/hooks/getUsers.ts', 'F13 src/features/users/types/user.ts', 'F13 src/features/users/schemas/userForm.ts']));
  });
  it('G5: a .gitkeep in a folder that has files is named', () => {
    expect(rules(tree({ ...GOOD, 'src/features/users/hooks/.gitkeep': '' }))).toContain('G5 src/features/users/hooks');
  });
  it('F7: a file outside a feature that imports a file inside it is named; src/app may import a component folder', () => {
    const files = { ...GOOD, 'src/features/roles/index.ts': 'x\n', 'src/features/roles/components/RoleForm/RoleForm.tsx': "import { useUsers } from '@/features/users/hooks/useUsers';\n", 'src/features/roles/components/RoleForm/index.ts': 'x\n', 'src/app/bad/page.tsx': "import { useUsers } from '@/features/users/hooks/useUsers';\n" };
    const r = rules(tree(files));
    expect(r).toContain('F7 src/features/roles/components/RoleForm/RoleForm.tsx');
    expect(r).toContain('F7 src/app/bad/page.tsx');
    expect(r).not.toContain('F7 src/app/users/page.tsx');
  });
  it('G3: a shared component or a low layer that imports a feature is named', () => {
    const files = { ...GOOD, 'src/components/layout/TopBar/TopBar.tsx': "import { UserForm } from '@/features/users';\n", 'src/components/layout/TopBar/index.ts': 'x\n', 'src/lib/api.ts': "import { UserForm } from '@/features/users';\n" };
    const r = rules(tree(files));
    expect(r).toContain('G3 src/components/layout/TopBar/TopBar.tsx');
    expect(r).toContain('G3 src/lib/api.ts');
  });
  it('F7-cycle: two features that import each other are named', () => {
    const files = {
      ...GOOD,
      'src/features/roles/index.ts': 'x\n',
      'src/features/roles/hooks/useRoles.ts': "import { useUsers } from '@/features/users';\n",
      'src/features/users/hooks/useUsers.ts': "import { useRoles } from '@/features/roles';\n",
    };
    expect(rules(tree(files))).toContain('F7-cycle roles,users');
  });
  it('G4: an ignore file that misses a machine-made folder is named', () => {
    const r = rules(tree({ ...GOOD, '.gitignore': 'node_modules\n.next\n' }));
    expect(r).toEqual(expect.arrayContaining(['G4 test-results', 'G4 rbac-out', 'G4 storybook-static']));
  });
  it('F8: a component or a page that imports the HTTP client is named; a hook and a service may', () => {
    const files = {
      ...GOOD,
      'src/features/users/components/UserForm/UserForm.tsx': "import { client } from '@/lib/api-client';\nexport const UserForm = () => null;\n",
      'src/app/bad/page.tsx': "import axios from 'axios';\n",
      'src/features/users/hooks/useUsersHttp.ts': "import { client } from '@/lib/api-client';\n",
      'src/features/users/services/users.service.ts': "import { client } from '@/lib/api-client';\n",
    };
    const r = rules(tree(files));
    expect(r).toContain('F8 src/features/users/components/UserForm/UserForm.tsx');
    expect(r).toContain('F8 src/app/bad/page.tsx');
    expect(r).not.toContain('F8 src/features/users/hooks/useUsersHttp.ts');
    expect(r).not.toContain('F8 src/features/users/services/users.service.ts');
  });
  it('F13: a file in services/ that is not <thing>.service.ts is named', () => {
    const files = { ...GOOD, 'src/features/users/services/users.service.ts': 'x\n', 'src/features/users/services/buildTemplate.ts': 'x\n' };
    const r = rules(tree(files));
    expect(r).toContain('F13 src/features/users/services/buildTemplate.ts');
    expect(r).not.toContain('F13 src/features/users/services/users.service.ts');
  });
  it('F11: a CSS module is named', () => {
    expect(rules(tree({ ...GOOD, 'src/features/users/components/UserForm/UserForm.module.css': '.a{}\n' }))).toContain('F11 src/features/users/components/UserForm/UserForm.module.css');
  });
  it('an allow-list entry turns a known finding into a listed one; an unused entry is reported', () => {
    const root = tree({ ...GOOD, 'src/features/users/landing.map.ts': 'x\n' });
    const res = checkStructure({ root, config: CONFIG, allowlist: [{ rule: 'F14', key: 'src/features/users/landing.map.ts', owner: 'o', reason: 'r' }, { rule: 'F2', key: 'gone', owner: 'o', reason: 'r' }] });
    expect(res.violations).toEqual([]);
    expect(res.allowed.map((a) => a.key)).toEqual(['src/features/users/landing.map.ts']);
    expect(res.stale.map((a) => a.key)).toEqual(['gone']);
  });
});
