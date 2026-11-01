import { spawnSync } from 'node:child_process';
import * as prettier from 'prettier';

// Read the index, so partially staged files are checked exactly as they will be committed.
const base = process.argv[2] === '--base' ? process.argv[3] : undefined;
const list = spawnSync(
  'git',
  ['diff', ...(base ? [base, 'HEAD'] : ['--cached']), '--name-only', '--diff-filter=ACMR', '-z'],
  { encoding: 'utf8' },
);
if (list.status !== 0) process.exit(list.status ?? 1);
const files = list.stdout.split('\0').filter((path) => /\.(?:astro|[cm]?js|ts|json|css|md|mdx|ya?ml)$/.test(path));
let failed = false;
for (const file of files) {
  const info = await prettier.getFileInfo(file, { ignorePath: '.prettierignore', plugins: ['prettier-plugin-astro'] });
  if (info.ignored || !info.inferredParser) continue;
  const staged = spawnSync('git', ['show', `${base ? 'HEAD:' : ':'}${file}`]);
  if (staged.status !== 0) {
    failed = true;
    continue;
  }
  const options = await prettier.resolveConfig(file);
  if (!(await prettier.check(staged.stdout.toString(), { ...options, filepath: file }))) {
    console.error(`Formatting required: ${file}`);
    failed = true;
  }
}
process.exitCode = failed ? 1 : 0;
