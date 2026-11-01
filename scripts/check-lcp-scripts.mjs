// Compare observed request timestamps with observed LCP from the SAME trace.
// Never compare network timestamps with Lighthouse's simulated/throttled LCP.
// This gate measures external requests; the inline scheduler is separately
// counted by check-budgets.mjs and is not claimed to be zero executable bytes.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const directory = process.argv[2] ?? '.lighthouseci';
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
const reports = new Map();
for (const file of walk(directory).filter((file) => file.endsWith('.json'))) {
  const report = JSON.parse(readFileSync(file, 'utf8'));
  if (report.lighthouseVersion && report.audits) {
    reports.set(`${report.requestedUrl}|${report.fetchTime}`, report);
  }
}
const required = new Map(['/', '/work/', '/work/lead-routing-prototype/', '/about/'].map((path) => [path, 0]));
let failed = false;
for (const report of reports.values()) {
  const path = new URL(report.requestedUrl).pathname;
  if (!required.has(path)) continue;
  required.set(path, required.get(path) + 1);
  const lcp = report.audits.metrics?.details?.items?.[0]?.observedLargestContentfulPaint;
  const requests = report.audits['network-requests']?.details?.items;
  if (!(lcp > 0) || !Array.isArray(requests)) throw new Error(`Missing trace data: ${path}`);
  const early = requests.filter((request) => request.resourceType === 'Script' && request.networkRequestTime < lcp);
  const bytes = early.reduce((sum, request) => sum + request.transferSize, 0);
  if (early.length) failed = true;
  console.log(
    `${early.length ? 'FAIL' : 'PASS'} ${path}: ${early.length} external JS requests before observed LCP; ${bytes} transferred bytes`,
  );
  for (const request of early) {
    console.error(
      `  ${new URL(request.url).pathname}: requested at ${request.networkRequestTime}ms; observed LCP ${lcp}ms`,
    );
  }
}
for (const [path, count] of required) {
  if (count !== 3) {
    console.error(`FAIL ${path}: expected 3 unique Lighthouse runs, found ${count}`);
    failed = true;
  }
}
process.exitCode = failed ? 1 : 0;
