// Scans EVERY object in the local git database (reachable or not) for:
//   - any entry of the local, git-ignored blocked-terms.txt (whole word, any case)
//   - any gmail.com address
// Prints counts only, never the values. Exit 1 if anything is found.
// Run before the repo goes public (docs/DEPLOY.md step 6).
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { loadBlockedFigures, termPattern } from './check-claims.mjs';

const TERMS_FILE = 'blocked-terms.txt';
if (!existsSync(TERMS_FILE)) {
  console.error(`${TERMS_FILE} is missing; cannot check history for blocked terms.`);
  process.exit(1);
}

const r = spawnSync('git', ['cat-file', '--batch-all-objects', '--batch'], { maxBuffer: 1024 * 1024 * 1024 });
if (r.status !== 0) {
  console.error(`git cat-file failed: ${r.stderr.toString()}`);
  process.exit(1);
}
const all = r.stdout.toString('latin1');

const count = (re) => (all.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`)) ?? []).length;

let failed = false;
loadBlockedFigures(TERMS_FILE).forEach((term, i) => {
  const n = count(termPattern(term));
  console.log(`blocked-terms.txt entry #${i + 1}: ${n} hit(s)`);
  if (n) failed = true;
});
const gmail = count(/[A-Za-z0-9._%+-]+@gmail\.com/i);
console.log(`gmail.com addresses: ${gmail} hit(s)`);
if (gmail) failed = true;

console.log(failed ? 'History check FAILED: squash and purge first (docs/DEPLOY.md step 6).' : 'History check passed.');
process.exit(failed ? 1 : 0);
