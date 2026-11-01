import { spawnSync } from 'node:child_process';

// npm also runs prepare in CI and source archives, where a local hook is unnecessary.
if (!process.env.CI && spawnSync('git', ['rev-parse', '--git-dir'], { stdio: 'ignore' }).status === 0) {
  const result = spawnSync('git', ['config', '--local', 'core.hooksPath', '.githooks'], { stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
}
