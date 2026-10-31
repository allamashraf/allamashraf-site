// Test server for Playwright: builds the prod site (dist/) and an EMAIL_PUBLISHED=true
// variant (.variants/email-on/), then serves both with scripts/static-server.mjs
// (astro preview allows only one server per project).
//   :4400  prod build, email unpublished (what would ship today)
//   :4401  prod build, email published (only used by the contact tests)
import { spawn, spawnSync } from 'node:child_process';

const ASTRO = 'node_modules/astro/bin/astro.mjs';
const base = { ...process.env, PUBLISH_MODE: 'prod', ASTRO_TELEMETRY_DISABLED: '1' };
const variant = { ...base, EMAIL_PUBLISHED: 'true', ASTRO_OUT_DIR: './.variants/email-on' };

const build = (env, gate) => {
  for (const args of [[ASTRO, 'build'], ...(gate ? [['scripts/check-claims.mjs']] : [])]) {
    const r = spawnSync(process.execPath, args, { stdio: 'inherit', env });
    if (r.status !== 0) process.exit(r.status ?? 1);
  }
};

// :4402 review build (PUBLISH_MODE=dev): the only build that contains /draft/ pages. No gate.
const review = { ...process.env, PUBLISH_MODE: 'dev', ASTRO_TELEMETRY_DISABLED: '1', ASTRO_OUT_DIR: './.variants/review' };

const clientBuild = spawnSync(process.execPath, ['scripts/build-client.mjs'], { stdio: 'inherit', env: base });
if (clientBuild.status !== 0) process.exit(clientBuild.status ?? 1);
build(variant, true);
build(review, false);
build(base, true);

const children = [];
const serve = (dir, port) => {
  const child = spawn(process.execPath, ['scripts/static-server.mjs', dir, String(port)], { stdio: 'inherit' });
  children.push(child);
  return child;
};

async function waitFor(url) {
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}

serve('.variants/email-on', 4401);
serve('.variants/review', 4402);
await waitFor('http://127.0.0.1:4401/');
await waitFor('http://127.0.0.1:4402/');
serve('dist', 4400);

const stop = () => {
  for (const c of children) c.kill();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
