/**
 * @file    check-structure.js
 * @module  Tooling
 *
 * @description
 * Structure checker of the back end. In plain words: reads the folders and the imports of `apps` and `libs` and fails when a rule of the structure document is broken (library without index.ts or module.ts, import against the layers, import cycle between libraries, repository folder of the wrong shape, a controller that imports a repository or the database, DTO outside an area folder, `process.env` outside config/, file without its role suffix, loose controller, missing ignore entry). Known findings are listed in `structure-allowlist.json` with owner and reason; only new findings fail.
 * Rules are in `structure.config.json`; the numbers B2, B3, B4, B5, B8, B9, B12, B15, G4 and G5 are those of Section 0 of the structure document.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R16-PS33
 * @status  built
 */
const { existsSync, readFileSync, readdirSync, statSync } = require('node:fs');
const { join, relative, resolve, sep } = require('node:path');

const SKIP = new Set(['node_modules', 'dist', 'coverage', 'generated']);
const TEST_FILE = /\.(spec|fakes|e2e-spec)\.ts$/;

function list(dir) {
  try {
    return readdirSync(dir).filter((n) => !SKIP.has(n));
  } catch {
    return [];
  }
}
function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}
function walk(dir, out = []) {
  for (const n of list(dir)) {
    const full = join(dir, n);
    if (isDir(full)) walk(full, out);
    else out.push(full);
  }
  return out;
}

function walkDirs(dir, out = []) {
  for (const n of list(dir)) {
    const full = join(dir, n);
    if (isDir(full)) {
      out.push(full);
      walkDirs(full, out);
    }
  }
  return out;
}

/** Find the structure problems of a back-end folder. Returns { violations, warnings, allowed, stale }. */
function checkStructure({ root, config, allowlist = [] }) {
  const R = resolve(root);
  const rel = (p) => relative(R, p).split(sep).join('/');
  const found = [];
  const add = (rule, key, message) => {
    if (!found.some((f) => f.rule === rule && f.key === key)) found.push({ rule, key, file: key, message });
  };
  const layerOf = new Map();
  config.layers.forEach((names, i) => names.forEach((n) => layerOf.set(n, i)));

  // B2 and B3: every library has a public door and a layer
  const libsDir = join(R, 'libs');
  const appsDir = join(R, 'apps');
  const libs = list(libsDir).filter((n) => isDir(join(libsDir, n)));
  for (const lib of libs) {
    if (!existsSync(join(libsDir, lib, 'src', 'index.ts'))) add('B2', `libs/${lib}`, 'the library has no src/index.ts (its public door)');
    if (!existsSync(join(libsDir, lib, 'src', 'module.ts'))) add('B2', `libs/${lib}/src/module.ts`, 'the library has no src/module.ts (its Nest module)');
    if (!layerOf.has(lib)) add('B3', `libs/${lib}`, 'the library is not in a layer of structure.config.json (a new module gets a new library and a layer)');
  }

  // B3: imports between libraries and from libraries to apps; cycles
  const edges = new Map();
  const files = walk(libsDir).filter((p) => p.endsWith('.ts') && !TEST_FILE.test(p));
  for (const file of files) {
    const r = rel(file);
    const lib = r.split('/')[1];
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/from '@libs\/([a-z-]+)/g)) {
      const to = m[1];
      if (to === lib) continue;
      if (!edges.has(lib)) edges.set(lib, new Set());
      edges.get(lib).add(to);
      if (layerOf.has(lib) && layerOf.has(to) && layerOf.get(to) > layerOf.get(lib)) add('B3', `${lib}>${to}`, `${lib} imports ${to}, which is in a higher layer (${r})`);
    }
    if (/from '@app\//.test(text)) add('B3', r, 'a library must not import an app');
  }
  const seen = new Set();
  const visit = (start, node, path) => {
    for (const next of edges.get(node) ?? []) {
      if (next === start) {
        const key = [...path].sort().join(',');
        if (!seen.has(key)) {
          seen.add(key);
          add('B3-cycle', key, `libraries import each other: ${[...path, start].join(' > ')}`);
        }
      } else if (!path.includes(next)) visit(start, next, [...path, next]);
    }
  };
  for (const l of edges.keys()) visit(l, l, [l]);

  // B9: role suffix of the files in the named folders
  const roots = ['apps', 'libs'].map((d) => join(R, d));
  for (const file of roots.flatMap((d) => walk(d))) {
    if (!file.endsWith('.ts')) continue;
    const parts = rel(file).split('/');
    const name = parts[parts.length - 1];
    if (name === 'index.ts' || TEST_FILE.test(name)) continue;
    for (const [folder, suffix] of Object.entries(config.suffixes)) {
      const at = parts.indexOf(folder, 3);
      if (at > 0 && at < parts.length - 1 && !name.endsWith(suffix)) {
        add('B9', rel(file), `a file in ${folder}/ must end with ${suffix}`);
        break;
      }
    }
  }

  // B15: controllers grouped by module
  for (const app of list(appsDir)) {
    const cd = join(appsDir, app, 'src', 'controllers');
    if (!isDir(cd)) continue;
    const loose = list(cd).filter((n) => n.endsWith('.controller.ts'));
    const hasModules = list(cd).some((n) => isDir(join(cd, n)));
    if (hasModules || loose.length > 3) loose.forEach((n) => add('B15', rel(join(cd, n)), 'group the controllers of an app that serves several modules in controllers/<module>/'));
  }

  // B5: repository folders hold contract.ts, database.ts and index.ts; no loose repository file
  for (const dir of walkDirs(libsDir)) {
    if (!dir.endsWith(`${sep}repositories`)) continue;
    for (const n of list(dir)) {
      const full = join(dir, n);
      if (isDir(full)) {
        const miss = ['contract.ts', 'database.ts', 'index.ts'].filter((f) => !existsSync(join(full, f)));
        if (miss.length) add('B5', rel(full), `a repository folder holds contract.ts, database.ts and index.ts (missing: ${miss.join(', ')})`);
      } else if (n.endsWith('.ts') && n !== 'index.ts' && !TEST_FILE.test(n)) add('B5', rel(full), 'a repository sits in its own folder: repositories/<entity>/');
    }
  }

  // B8: DTOs are in dtos/<area>/, not directly in dtos/
  for (const app of list(appsDir)) {
    const dd = join(appsDir, app, 'src', 'dtos');
    for (const n of list(dd)) if (n.endsWith('.dto.ts') && !isDir(join(dd, n))) add('B8', rel(join(dd, n)), 'put the DTO in dtos/<area>/');
  }

  // B12: settings come from config/, not from process.env
  for (const file of [...walk(appsDir), ...walk(libsDir)]) {
    if (!file.endsWith('.ts') || TEST_FILE.test(file)) continue;
    const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
    if (/process\.env/.test(text)) add('B12', rel(file), 'read settings through config/ (ConfigService), not process.env');
  }

  // B4: controllers are thin: they import no repository and no database client
  for (const file of walk(appsDir)) {
    if (!file.endsWith('.controller.ts') || TEST_FILE.test(file)) continue;
    const text = readFileSync(file, 'utf8');
    if (/from '[^']*\/repositories\/[^']*'/.test(text) || /\bPrisma(Service|Client)\b/.test(text)) add('B4', rel(file), 'a controller imports a repository or the database client: call a service');
  }

  // G5: .gitkeep only in an empty folder
  for (const file of ['apps', 'libs', 'config'].flatMap((d) => walk(join(R, d)))) {
    if (file.endsWith(`${sep}.gitkeep`)) {
      const dir = join(file, '..');
      if (list(dir).some((n) => n !== '.gitkeep')) add('G5', rel(dir), '.gitkeep in a folder that has files: delete it');
    }
  }

  // G4: the ignore files cover the machine-made folders
  const ignored = new Set();
  for (const ig of config.ignoreFiles ?? ['.gitignore']) {
    const p = join(R, ig);
    if (existsSync(p)) readFileSync(p, 'utf8').split(/\r?\n/).map((l) => l.trim().replace(/^\//, '').replace(/\/\*?$/, '')).filter(Boolean).forEach((l) => ignored.add(l));
  }
  for (const pat of config.g4 ?? []) {
    const covered = ignored.has(pat) || (pat === '.env' && [...ignored].some((l) => l.startsWith('.env')));
    if (!covered) add('G4', pat, `the ignore files do not list ${pat}`);
  }

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
  return { violations, warnings: [], allowed, stale: allowlist.filter((_, i) => !used.has(i)) };
}

function main() {
  const root = resolve(process.argv[2] ?? '.');
  const config = JSON.parse(readFileSync(join(root, 'structure.config.json'), 'utf8'));
  const allowPath = join(root, 'structure-allowlist.json');
  const allowlist = existsSync(allowPath) ? JSON.parse(readFileSync(allowPath, 'utf8')) : [];
  const res = checkStructure({ root, config, allowlist });
  res.violations.forEach((v) => console.error(`  ${v.rule}  ${v.key}\n        ${v.message}`));
  res.stale.forEach((a) => console.error(`  stale allow-list entry (nothing matches it any more): ${a.rule} ${a.key}`));
  console.log(`Structure check: ${res.violations.length} violation(s), ${res.allowed.length} listed in the allow-list`);
  res.allowed.forEach((a) => console.log(`  listed: ${a.rule} ${a.key} (${a.owner}: ${a.reason})`));
  if (res.violations.length || res.stale.length) {
    console.error('Structure check: FAIL');
    process.exit(1);
  }
  console.log('Structure check: PASS');
}

module.exports = { checkStructure };
if (require.main === module) main();
