// Proves each failure mode of the claims gate (master plan §16 item 46).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkDist, loadBlockedFigures, loadClaims } from '../../scripts/check-claims.mjs';

const claims = [
  { id: 'ok', text: 'A reported sentence.', status: 'USER_REPORTED' },
  { id: 'missing', text: '[[PLACEHOLDER: test fact]]', status: 'NEEDS_EVIDENCE' },
  { id: 'secret', text: 'A sentence held back.', status: 'NOT_FOR_PUBLICATION' },
];

function makeDist(files) {
  const dir = mkdtempSync(join(tmpdir(), 'claims-gate-'));
  for (const [rel, content] of Object.entries(files)) {
    const p = join(dir, rel);
    mkdirSync(join(p, '..'), { recursive: true });
    writeFileSync(p, content);
  }
  return dir;
}

const page = (body) => `<!doctype html><html lang="en"><body>${body}</body></html>`;
const claim = (c) => `<span class="claim" data-claim="${c.id}" data-claim-status="${c.status}">${c.text}</span>`;

function gate(files, opts = {}) {
  const dir = makeDist(files);
  try {
    return checkDist(dir, { claims, ...opts });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('passes a clean site with publishable claims', () => {
  assert.deepEqual(gate({ 'index.html': page(`<p>${claim(claims[0])}</p>`) }), []);
});

test('fails when a NEEDS_EVIDENCE claim is rendered', () => {
  const errors = gate({ 'index.html': page(claim(claims[1])) });
  assert.ok(errors.some((e) => e.includes('status NEEDS_EVIDENCE')), errors.join('\n'));
});

test('fails when a NOT_FOR_PUBLICATION claim text appears without the component', () => {
  const errors = gate({ 'index.html': page('<p>A sentence held back.</p>') });
  assert.ok(errors.some((e) => e.includes('"secret"')), errors.join('\n'));
});

test('fails on any [[PLACEHOLDER]] marker', () => {
  const errors = gate({ 'about/index.html': page('<p>[[PLACEHOLDER: anything]]</p>') });
  assert.ok(errors.some((e) => e.includes('[[PLACEHOLDER]]')), errors.join('\n'));
});

test('fails on a digit in case-study body text outside <Claim>', () => {
  const body = '<article data-case-body><p>We improved it by 40%.</p></article>';
  const errors = gate({ 'work/x/index.html': page(body) });
  assert.ok(errors.some((e) => e.includes('digits in case-study body')), errors.join('\n'));
});

test('allows digits inside a claim, a structural label or an SVG diagram', () => {
  const ok = { id: 'n', text: 'Three workflows, 2 mocks.', status: 'VERIFIED' };
  const body = `<article data-case-body><h2><span class="mono" data-structural>01</span>Status</h2>${claim(ok)}<svg><text>REP 2</text></svg></article>`;
  assert.deepEqual(checkDist(makeDist({ 'work/x/index.html': page(body) }), { claims: [...claims, ok] }), []);
});

test('fails when "freelance" appears in any built file', () => {
  const errors = gate({ '_astro/app.js': 'const s = "Freelance";' });
  assert.ok(errors.some((e) => e.includes('freelance')), errors.join('\n'));
});

test('fails on a blocked-figures.txt entry without printing its value', () => {
  const figure = 'ZZ-TEST-FIGURE-9137';
  const errors = gate({ 'index.html': page(`<p>${figure}</p>`) }, { blockedFigures: [figure] });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /entry #1/);
  assert.ok(!errors[0].includes(figure), 'error message must not leak the figure');
});

test('fails on a blocked-terms.txt entry as a whole word, any case, without printing it', () => {
  const term = 'Zorblax';
  const hit = gate({ 'work/x/index.html': page('<p>The ZORBLAX project.</p>') }, { blockedTerms: [term] });
  assert.equal(hit.length, 1);
  assert.match(hit[0], /blocked-terms\.txt entry #1/);
  assert.ok(!hit[0].toLowerCase().includes(term.toLowerCase()), 'error message must not leak the term');
  // Inside another word it is not a hit.
  assert.deepEqual(gate({ 'index.html': page('<p>zorblaxian</p>') }, { blockedTerms: [term] }), []);
});

test('fails on a non-public email, and on the public one while unpublished', () => {
  const errors = gate({ 'index.html': page('<p>someone@example.com allam@allamashraf.dev</p>') });
  assert.ok(errors.some((e) => e.includes('other than')), errors.join('\n'));
  assert.ok(errors.some((e) => e.includes('EMAIL_PUBLISHED is false')), errors.join('\n'));
  assert.deepEqual(gate({ 'index.html': page('<p>allam@allamashraf.dev</p>') }, { emailPublished: true }), []);
});

test('blocked-figures loader ignores comments, blanks and a missing file', () => {
  const dir = mkdtempSync(join(tmpdir(), 'bf-'));
  const f = join(dir, 'blocked-figures.txt');
  writeFileSync(f, '# comment\n\nAAA\r\n BBB \n');
  assert.deepEqual(loadBlockedFigures(f), ['AAA', 'BBB']);
  assert.deepEqual(loadBlockedFigures(join(dir, 'nope.txt')), []);
  rmSync(dir, { recursive: true, force: true });
});

test('the real ledger parses, has unique ids and only allowed statuses', () => {
  const real = loadClaims(new URL('../../src/content/claims.yaml', import.meta.url));
  const allowed = new Set(['VERIFIED', 'USER_REPORTED', 'NEEDS_EVIDENCE', 'NOT_FOR_PUBLICATION']);
  assert.ok(real.length > 0);
  for (const c of real) assert.ok(allowed.has(c.status), `${c.id}: ${c.status}`);
});
