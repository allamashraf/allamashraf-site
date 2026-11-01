import { spawnSync } from 'node:child_process';

const whitespace = spawnSync('git', ['diff', '--cached', '--check'], { stdio: 'inherit' });
if (whitespace.status !== 0) process.exit(whitespace.status ?? 1);
const secrets = spawnSync(
  process.env.GITLEAKS_BIN || 'gitleaks',
  ['git', '--pre-commit', '--staged', '--redact', '--no-banner', '--config', '.gitleaks.toml'],
  { stdio: 'inherit' },
);
if (secrets.error?.code === 'ENOENT') {
  console.error(
    'Commit blocked: install Gitleaks 8.30.1 from its official release, or set GITLEAKS_BIN to its executable path.',
  );
}
if (secrets.status !== 0) process.exit(secrets.status ?? 1);
const format = spawnSync(process.execPath, ['scripts/check-staged-format.mjs'], { stdio: 'inherit' });
process.exitCode = format.status ?? 1;
