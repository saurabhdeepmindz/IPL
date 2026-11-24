/**
 * @file    check-headers.js
 * @module  Tooling
 *
 * @description
 * Fails when a source file has no header block (Standard v0.3, section 3). In plain words: every file must say what it is for.
 * Checked: .ts files under apps, libs, config and tests.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-BE-01
 */
const { readdirSync, readFileSync, statSync } = require('node:fs');
const { join } = require('node:path');

const ROOTS = ['apps', 'libs', 'config', 'tests'];
const bad = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === 'generated') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (name.endsWith('.ts') && !name.endsWith('.d.ts')) check(full);
  }
}

function check(file) {
  const text = readFileSync(file, 'utf8').trimStart();
  const head = text.slice(0, 1200);
  if (!text.startsWith('/**') || !/@file\s/.test(head) || !/@module\s/.test(head)) bad.push(file);
}

for (const root of ROOTS) {
  try {
    walk(root);
  } catch {
    /* folder may not exist yet */
  }
}

if (bad.length) {
  console.error('Files without a header block (@file and @module):');
  bad.forEach((f) => console.error('  -', f));
  process.exit(1);
}
console.log('Header check: PASS');
