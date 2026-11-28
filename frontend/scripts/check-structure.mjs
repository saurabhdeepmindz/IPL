/**
 * @file    check-structure.mjs
 * @module  Tooling
 *
 * @description
 * Structure checker of the front end. In plain words: reads the folders and the imports of `src` and fails when a rule of the structure document is broken (loose component file, kebab-case component folder, loose file in a feature root, wrong file name, import against the direction, import cycle between features, missing ignore entry). Known findings are listed in `structure-allowlist.json` with owner and reason; only new findings fail.
 * Rules are in `structure.config.json`; the numbers F2, F4, F6, F7, F13, F14, G3, G4 and G5 are those of Section 0 of the structure document.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R16-PS33
 * @status  built
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PASCAL = /^[A-Z][A-Za-z0-9]*$/;
const SKIP = new Set(['node_modules', '.next', 'dist', 'coverage']);

function list(dir) {
  try {
    return readdirSync(dir).filter((n) => !SKIP.has(n));
  } catch {
    return [];
  }
}
const isDir = (p) => {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};
function walk(dir, out = []) {
  for (const n of list(dir)) {
    const full = join(dir, n);
    if (isDir(full)) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Find the structure problems of a front-end folder. Returns { violations, warnings, allowed, stale }. */
export function checkStructure({ root, config, allowlist = [] }) {
  const R = resolve(root);
  const rel = (p) => relative(R, p).split(sep).join('/');
  const found = [];
  const warnings = [];
  const add = (rule, key, message) => {
    if (!found.some((f) => f.rule === rule && f.key === key)) found.push({ rule, key, file: key, message });
  };
  const read = (p) => readFileSync(p, 'utf8');

  // F6 and F14: the anatomy of every feature
  const featuresDir = join(R, 'src/features');
  const features = list(featuresDir).filter((n) => isDir(join(featuresDir, n)));
  for (const f of features) {
    const dir = join(featuresDir, f);
    if (!existsSync(join(dir, 'index.ts'))) add('F6', rel(dir), 'the feature has no index.ts (its public door)');
    for (const n of list(dir)) {
      const full = join(dir, n);
      if (n.startsWith('.')) continue;
      if (isDir(full)) {
        if (!config.featureDirs.includes(n)) add('F6', rel(full), `folder "${n}" is not part of the feature anatomy (${config.featureDirs.join(', ')})`);
      } else if (n !== 'index.ts') add('F14', rel(full), 'loose file in a feature root: put it in utils/ or constants/');
    }
  }

  // F2 and F4: one PascalCase folder per component
  const compDirs = features.map((f) => join(featuresDir, f, 'components')).concat(config.componentAreas.map((a) => join(R, a)));
  for (const cd of compDirs) {
    if (!isDir(cd)) continue;
    const isArea = !cd.includes(`${sep}features${sep}`);
    for (const n of list(cd)) {
      const full = join(cd, n);
      if (n.startsWith('.')) continue;
      if (!isDir(full)) {
        if (isArea && n === 'index.ts') continue;
        add('F2', rel(full), 'loose component file: give it its own folder (Name/Name.tsx and index.ts)');
        continue;
      }
      if (!PASCAL.test(n)) {
        add('F4', rel(full), 'component folders are PascalCase; kebab-case names belong to URLs in src/app');
        continue;
      }
      const hasMain = existsSync(join(full, `${n}.tsx`)) || existsSync(join(full, `${n}.ts`));
      if (!existsSync(join(full, 'index.ts')) || !hasMain) add('F2', rel(full), `the folder must hold ${n}.tsx and index.ts`);
    }
  }

  // F13: file names in hooks, types and schemas
  for (const f of features) {
    const rules = [
      ['hooks', /^(use[A-Z][A-Za-z0-9]*\.tsx?|[a-z0-9-]+\.keys\.ts)$/, 'use<Thing>.ts or <feature>.keys.ts'],
      ['types', /\.types\.ts$/, '<thing>.types.ts'],
      ['schemas', /Schema\.ts$/, '<thing>Schema.ts'],
    ];
    for (const [sub, re, hint] of rules) {
      const d = join(featuresDir, f, sub);
      for (const n of list(d)) {
        if (n === 'index.ts' || n.startsWith('.') || /\.(test|spec)\./.test(n) || isDir(join(d, n))) continue;
        if (!re.test(n)) add('F13', rel(join(d, n)), `file name should be ${hint}`);
      }
    }
  }

  // G5: .gitkeep only in an empty folder
  for (const file of walk(join(R, 'src'))) {
    if (file.endsWith(`${sep}.gitkeep`)) {
      const dir = join(file, '..');
      if (list(dir).some((n) => n !== '.gitkeep')) add('G5', rel(dir), '.gitkeep in a folder that has files: delete it');
    }
  }

  // imports: F7, G3 and the cycles
  const edges = new Map();
  const files = walk(join(R, 'src')).filter((p) => /\.(ts|tsx)$/.test(p) && !p.endsWith('.d.ts'));
  for (const file of files) {
    const r = rel(file);
    const text = read(file);
    const own = features.find((f) => r.startsWith(`src/features/${f}/`));
    const imports = [...text.matchAll(/from '@\/(features|components)(?:\/([a-z-]+))?(\/[^']*)?'/g)];
    for (const m of imports) {
      const [, kind, feat, sub] = m;
      if (kind === 'features' && feat && own && feat !== own) {
        if (!edges.has(own)) edges.set(own, new Set());
        edges.get(own).add(feat);
      }
      if (kind === 'features' && feat && feat !== own && sub) {
        const first = sub.split('/')[1];
        const ok = r.startsWith('src/app/') && config.appMayImport.includes(first);
        if (!ok) add('F7', r, `imports ${feat}'s internal file ${sub}: import from @/features/${feat} (src/app may import a component folder)`);
      }
      const low = config.lowLayers.some((l) => r.startsWith(`${l}/`) || r === l);
      const sharedComponent = r.startsWith('src/components/');
      if (kind === 'features' && (sharedComponent || low)) add('G3', r, 'a shared component or a low layer must not import a feature (imports run app, features, components, lib)');
      if (kind === 'components' && low && !sharedComponent) add('G3', r, 'a low layer must not import components');
    }
    if (own && /^src\/features\/[a-z-]+\/components\/[A-Za-z0-9]+\/[A-Za-z0-9]+\.tsx$/.test(r) && !/@pseudo-source/.test(text.slice(0, 2500))) warnings.push({ rule: 'H-trace', key: r, message: 'header has no @pseudo-source tag' });
  }
  // cycles between features (every feature pair and longer loops, once each)
  const seen = new Set();
  const visit = (start, node, path) => {
    for (const next of edges.get(node) ?? []) {
      if (next === start) {
        const key = [...path].sort().join(',');
        if (!seen.has(key)) {
          seen.add(key);
          add('F7-cycle', key, `features import each other: ${[...path, start].join(' > ')}`);
        }
      } else if (!path.includes(next)) visit(start, next, [...path, next]);
    }
  };
  for (const f of edges.keys()) visit(f, f, [f]);

  // G4: the ignore files cover the machine-made folders
  const ignoreLines = new Set();
  for (const ig of config.ignoreFiles ?? ['.gitignore']) {
    const p = join(R, ig);
    if (existsSync(p)) read(p).split(/\r?\n/).map((l) => l.trim().replace(/^\//, '').replace(/\/\*?$/, '')).filter(Boolean).forEach((l) => ignoreLines.add(l));
  }
  for (const pat of config.g4 ?? []) {
    const covered = ignoreLines.has(pat) || (pat === '.env' && [...ignoreLines].some((l) => l.startsWith('.env')));
    if (!covered) add('G4', pat, `the ignore files do not list ${pat}`);
  }

  // the allow-list
  const used = new Set();
  const violations = [];
  const allowed = [];
  for (const v of found) {
    const hit = allowlist.findIndex((a) => a.rule === v.rule && a.key === v.key);
    if (hit >= 0) {
      used.add(hit);
      allowed.push({ ...v, owner: allowlist[hit].owner, reason: allowlist[hit].reason });
    } else violations.push(v);
  }
  const stale = allowlist.filter((_, i) => !used.has(i));
  return { violations, warnings, allowed, stale };
}

function main() {
  const root = resolve(process.argv[2] ?? '.');
  const config = JSON.parse(readFileSync(join(root, 'structure.config.json'), 'utf8'));
  const allowPath = join(root, 'structure-allowlist.json');
  const allowlist = existsSync(allowPath) ? JSON.parse(readFileSync(allowPath, 'utf8')) : [];
  const res = checkStructure({ root, config, allowlist });
  /* eslint-disable no-console */
  res.violations.forEach((v) => console.error(`  ${v.rule}  ${v.key}\n        ${v.message}`));
  res.stale.forEach((a) => console.error(`  stale allow-list entry (nothing matches it any more): ${a.rule} ${a.key}`));
  console.log(`Structure check: ${res.violations.length} violation(s), ${res.allowed.length} listed in the allow-list, ${res.warnings.length} warning(s) (trace tags)`);
  res.allowed.forEach((a) => console.log(`  listed: ${a.rule} ${a.key} (${a.owner}: ${a.reason})`));
  if (res.violations.length || res.stale.length) {
    console.error('Structure check: FAIL');
    process.exit(1);
  }
  console.log('Structure check: PASS');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
