// build:prod = astro build with PUBLISH_MODE=prod, then the claims gate.
// Calls node directly (no shell), so it runs the same on Windows and CI.
import { spawnSync } from 'node:child_process';

const env = { ...process.env, PUBLISH_MODE: 'prod', ASTRO_TELEMETRY_DISABLED: '1' };
const run = (args) => {
  const r = spawnSync(process.execPath, args, { stdio: 'inherit', env });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run(['node_modules/astro/bin/astro.mjs', 'build']);
run(['scripts/check-claims.mjs']);
run(['scripts/check-release.mjs']);
