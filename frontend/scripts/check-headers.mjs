/**
 * @file    check-headers.mjs
 * @module  Tooling
 *
 * @description
 * Fails when a source file has no header block (Standard v0.3, section 3). In plain words: every file must say what it is for.
 * Checked: .ts and .tsx files under src and stories. Generated files and tests that start with a header are accepted.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-FE-01
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src', 'stories'];
const SKIP = ['.d.ts'];
const bad = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(name) && !SKIP.some((s) => name.endsWith(s))) check(full);
  }
}

function check(file) {
  const text = readFileSync(file, 'utf8').replace(/^'use (client|server)';\r?\n/, '').trimStart();
  const head = text.slice(0, 1200);
  if (!text.startsWith('/**') || !/@file\s/.test(head) || !/@module\s/.test(head)) bad.push(file);
}

ROOTS.forEach((r) => {
  try {
    walk(r);
  } catch {
    /* folder may not exist yet */
  }
});

if (bad.length) {
  console.error('Files without a header block (@file and @module):');
  bad.forEach((f) => console.error('  -', f));
  process.exit(1);
}
// eslint-disable-next-line no-console
console.log('Header check: PASS');
