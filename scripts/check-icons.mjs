#!/usr/bin/env node
/**
 * check-icons.mjs — build gate against NON-EXISTENT @tabler/icons-react names.
 *
 * Real incident: a dashboard imported `IconWrench` and `IconCable` — both
 * plausible, neither exported by @tabler/icons-react. `tsc` catches it, but
 * only ~20s into `npm run build`; the agent then fixes and rebuilds (~another
 * 20s). This gate resolves the ACTUALLY installed export names (regex over the
 * package's type declarations — never loads the thousands of icon components,
 * which is what makes `tsc` slow) and scans the agent-written sources for
 * `Icon…` imports, so a hallucinated name fails fast — before the build —
 * instead of burning a full build round-trip. Runs before `npm run build`;
 * exit 1 on any unknown icon. It only reports THAT a name does not exist; the
 * agent picks a different real icon (no name suggestion — nearest-string
 * guesses were misleading, e.g. IconHardHat → IconCarFan).
 *
 * Fail-OPEN if the name source can't be located (package layout changed): warn
 * and skip rather than block — tsc remains the safety net. Fail-CLOSED only on
 * a name that is provably absent from a real, large export list.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// ── Resolve the real exported icon names ──────────────────────────────────
const PKG = 'node_modules/@tabler/icons-react';
const DTS_CANDIDATES = [
  'dist/tabler-icons-react.d.ts',
  'dist/esm/tabler-icons-react.d.ts',
  'dist/index.d.ts',
  'dist/esm/index.d.ts',
  'dist/types/index.d.ts',
  'dist/esm/tabler-icons-react.js',
  'dist/cjs/tabler-icons-react.js',
].map(p => join(PKG, p));

function loadValidNames() {
  for (const p of DTS_CANDIDATES) {
    if (!existsSync(p)) continue;
    const src = readFileSync(p, 'utf8');
    const names = new Set();
    // Any `Icon<Capital>…` token in the declarations/barrel is a real export.
    // Greedy on purpose: a stray match only WIDENS the valid set (fewer false
    // positives) — it can never reject a genuinely-exported name.
    const re = /\bIcon[A-Z]\w*/g;
    let m;
    while ((m = re.exec(src)) !== null) names.add(m[0]);
    if (names.size > 100) return names; // sanity: the real list is in the thousands
  }
  return null;
}

const valid = loadValidNames();
if (!valid) {
  console.log('check-icons: SKIP (could not resolve @tabler/icons-react export names — tsc will catch icon errors)');
  process.exit(0);
}

// ── Scan agent-written sources for @tabler/icons-react imports ────────────
const ROOTS = ['src/pages', 'src/components'];
const SKIP = /\.example\.tsx$|[\\/]ui[\\/]/;

function walk(dir, out = []) {
  let entries = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e)) out.push(p);
  }
  return out;
}

const errors = [];
const files = ROOTS.flatMap(r => walk(r)).filter(f => !SKIP.test(f));
// `[^}]*` spans newlines (multiline imports are common) since `}` ends the clause.
const IMPORT_RE = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]@tabler\/icons-react['"]/g;

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  let im;
  while ((im = IMPORT_RE.exec(src)) !== null) {
    const before = src.slice(0, im.index);
    const lineNo = before.split('\n').length;
    for (const raw of im[1].split(',')) {
      // strip aliases (`IconFoo as Bar`) and whitespace — the imported name is the left side
      const name = raw.trim().split(/\s+as\s+/)[0].trim();
      if (!name || !/^Icon[A-Z]/.test(name)) continue;
      if (!valid.has(name)) {
        errors.push(`${file}:${lineNo}: '${name}' is not exported by @tabler/icons-react — pick a different, existing Tabler icon.`);
      }
    }
  }
}

if (errors.length) {
  for (const e of errors) console.error(`ERROR: ${e}`);
  console.error(`\n${errors.length} non-existent icon import(s) — every icon must be a real @tabler/icons-react export. Replace each with an existing one.`);
  process.exit(1);
}
console.log(`check-icons: OK (${files.length} files scanned, ${valid.size} valid names)`);
