// Content & evidence gate for build:prod (master plan §7.1, §16 item 46).
// Fails when the built site (dist/) contains:
//   - a rendered claim whose status is not VERIFIED / USER_REPORTED
//   - the text of any blocked claim, or any [[PLACEHOLDER ...]] marker
//   - a digit in case-study body text outside <Claim> (structural numbers excepted)
//   - the word "freelance" anywhere
//   - any entry of the local, git-ignored blocked-figures.txt (never printed)
//   - any entry of the local, git-ignored blocked-terms.txt as a whole word, any case
//     (unannounced names; never printed)
//   - any email address other than the public one (and that one only when published)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const PUBLISHABLE = new Set(['VERIFIED', 'USER_REPORTED']);
const PUBLIC_EMAIL = 'allam@allamashraf.dev';
const TEXT_EXT = /\.(html|xml|txt|js|mjs|css|json|svg|webmanifest)$/i;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function loadClaims(file) {
  const doc = parse(readFileSync(file, 'utf8')) ?? {};
  return Object.entries(doc).map(([id, c]) => ({ id, ...c }));
}

export function loadBlockedFigures(file) {
  if (!file || !existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Whole-word, case-insensitive matcher for a blocked term. */
export const termPattern = (term) => new RegExp(`(^|[^A-Za-z0-9])${escapeRegExp(term)}(?![A-Za-z0-9])`, 'i');

// Text of the case-study body with claims, structural labels, diagrams and tags removed.
export function caseBodyText(html) {
  const m = html.match(/<article[^>]*\bdata-case-body\b[^>]*>([\s\S]*?)<\/article>/);
  if (!m) return null;
  return m[1]
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<span[^>]*\bdata-claim=[^>]*>[\s\S]*?<\/span>/g, ' ')
    .replace(/<(\w+)[^>]*\bdata-structural\b[^>]*>[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ');
}

/**
 * @param {string} distDir
 * @param {{ claims: {id:string,text:string,status:string}[], blockedFigures?: string[], blockedTerms?: string[], emailPublished?: boolean }} opts
 * @returns {string[]} errors (never contain blocked-figure or blocked-term values)
 */
export function checkDist(distDir, { claims, blockedFigures = [], blockedTerms = [], emailPublished = false }) {
  const errors = [];
  const files = walk(distDir).filter((f) => TEXT_EXT.test(f));
  const blocked = claims.filter((c) => !PUBLISHABLE.has(c.status));
  const termRes = blockedTerms.map(termPattern);

  for (const file of files) {
    const rel = relative(distDir, file).replace(/\\/g, '/');
    const text = readFileSync(file, 'utf8');
    const isHtml = rel.endsWith('.html');

    if (/freelance/i.test(text)) errors.push(`${rel}: contains the banned word "freelance"`);

    blockedFigures.forEach((fig, i) => {
      if (text.includes(fig)) errors.push(`${rel}: contains blocked-figures.txt entry #${i + 1} (value not printed)`);
    });

    termRes.forEach((re, i) => {
      if (re.test(text)) errors.push(`${rel}: contains blocked-terms.txt entry #${i + 1} (value not printed)`);
    });

    for (const email of text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []) {
      if (email.toLowerCase() !== PUBLIC_EMAIL) errors.push(`${rel}: contains an email address other than ${PUBLIC_EMAIL}`);
      else if (!emailPublished) errors.push(`${rel}: shows ${PUBLIC_EMAIL} while EMAIL_PUBLISHED is false`);
    }

    if (!isHtml) continue;

    for (const m of text.matchAll(/data-claim="([^"]+)"[^>]*data-claim-status="([^"]+)"/g)) {
      if (!PUBLISHABLE.has(m[2])) errors.push(`${rel}: renders claim "${m[1]}" with status ${m[2]}`);
    }

    if (text.includes('[[PLACEHOLDER')) errors.push(`${rel}: contains a [[PLACEHOLDER]] marker`);

    for (const c of blocked) {
      if (text.includes(c.text) || text.includes(escapeHtml(c.text))) {
        errors.push(`${rel}: contains the text of ${c.status} claim "${c.id}"`);
      }
    }

    const body = caseBodyText(text);
    if (body !== null) {
      const digits = body.match(/[^\s]*\d[^\s]*/g);
      if (digits) errors.push(`${rel}: digits in case-study body outside <Claim>: ${[...new Set(digits)].slice(0, 5).join(', ')}`);
    }
  }
  return errors;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = resolve(fileURLToPath(import.meta.url), '../..');
  const distDir = resolve(root, process.env.ASTRO_OUT_DIR ?? 'dist');
  const errors = checkDist(distDir, {
    claims: loadClaims(join(root, 'src/content/claims.yaml')),
    blockedFigures: loadBlockedFigures(join(root, 'blocked-figures.txt')),
    blockedTerms: loadBlockedFigures(join(root, 'blocked-terms.txt')),
    emailPublished: process.env.EMAIL_PUBLISHED === 'true',
  });
  if (errors.length) {
    console.error(`Claims gate FAILED (${errors.length}):\n- ${errors.join('\n- ')}`);
    process.exit(1);
  }
  // Not a failure in Sprint 1, but launch-blocking: the site must offer at least one way to reach Allam.
  const home = readFileSync(join(distDir, 'index.html'), 'utf8');
  if (!/id="contact"[\s\S]*?(href="mailto:|data-linkedin)/.test(home)) {
    console.warn('WARNING: the contact section publishes no channel (no LinkedIn URL, email unpublished).');
  }
  console.log('Claims gate passed.');
}
