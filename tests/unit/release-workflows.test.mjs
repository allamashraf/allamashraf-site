import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

const workflow = (name) => parse(readFileSync(new URL(`../../.github/workflows/${name}.yml`, import.meta.url), 'utf8'));

test('every manual Pages deployment must pass the same-commit quality gate before build and publish', () => {
  const release = workflow('deploy');
  assert.deepEqual(Object.keys(release.on), ['workflow_dispatch'], 'publishing must remain manual');
  assert.equal(release.jobs.verify.uses, './.github/workflows/ci.yml');
  assert.equal(release.jobs.verify.if, "github.ref == 'refs/heads/main'");
  assert.equal(release.jobs.build.needs, 'verify');
  assert.equal(release.jobs.deploy.needs, 'build');
  for (const name of ['verify', 'build', 'deploy']) {
    assert.ok(!release.jobs[name]['continue-on-error'], `${name} must fail closed`);
  }
  for (const name of ['build', 'deploy']) {
    assert.equal(release.jobs[name].if, undefined, `${name} must retain the default success-only dependency guard`);
  }
  const checkout = release.jobs.build.steps.find((step) => step.uses?.startsWith('actions/checkout@'));
  assert.ok(checkout);
  assert.equal(checkout.with?.ref, undefined, 'build must not switch away from the verified commit');
  assert.equal(release.jobs.deploy.environment.name, 'github-pages');
});

test('CI checks merged main and exposes the full browser and performance checks to deployment', () => {
  const ci = workflow('ci');
  assert.deepEqual(ci.on.push.branches, ['main']);
  assert.ok(Object.hasOwn(ci.on, 'pull_request'));
  assert.ok(Object.hasOwn(ci.on, 'workflow_call'));
  const steps = ci.jobs.verify.steps;
  for (const command of ['npm run test:unit', 'npx playwright test', 'npx lhci autorun', 'npm run check:lcp-scripts']) {
    const step = steps.find((entry) => entry.run === command);
    assert.ok(step, `missing release check: ${command}`);
    assert.equal(step.if, undefined, `${command} must also run during manual releases`);
    assert.ok(!step['continue-on-error']);
  }
  assert.notEqual(ci.concurrency.group, 'ci-${{ github.ref }}', 'release verification must not cancel push CI');
  const formatting = steps.find((step) => step.name === 'Check formatting of changed files');
  assert.match(formatting.env.FORMAT_BASE, /github.event.before/);
  assert.doesNotMatch(formatting.env.FORMAT_BASE, /github.sha/, 'formatting must not compare HEAD with itself');
});
