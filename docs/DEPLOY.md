# Deployment and maintenance

Production: https://allamashraf.dev/ — GitHub Pages, manual deployment only.
RELEASE_CHECKLIST.md records approvals, exceptions and unfinished human validation; LAUNCH_REPORT.md records production HTTP evidence.

## Prepare a change

1. Create a work branch; never push directly to protected main.
2. Run npm ci. prepare sets core.hooksPath=.githooks for this checkout only. Install Gitleaks 8.30.1 from https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1 or set GITLEAKS_BIN to that executable.
3. Format changed files with npm run format -- <paths>, then stage them. The hook reads the Git index, checks whitespace, scans staged content with redacted Gitleaks output and verifies formatting. Partially staged content is checked as committed.
4. Run npm run check, npm run build:prod, npm run check:budgets and npm test. Keep local evidence and denylists private; never import the original uploaded Git database.
5. Open a PR and pass verify, update with main and resolve conversations. Required second-person approval needs someone other than the author; an AI report or self-review is not a GitHub approval.

CI independently checks changed-file formatting, secrets, browsers, accessibility, Lighthouse, claims and budgets. It runs on PRs and pushes to main, and can be called as a reusable workflow. GitHub API writes do not execute a developer's local hook.

## Publish

1. Merge the reviewed PR after verify passes.
2. Actions → Deploy to GitHub Pages → Run workflow, selecting main.
   The deployment first runs the complete reusable CI workflow from the same commit. Build waits for verify to succeed, and deploy waits for build. A failed, cancelled or skipped gate blocks publication. Branches other than main are rejected by skipping verify and its dependent jobs. Publication remains manual; a push to main runs CI without deploying.
3. Keep EMAIL_PUBLISHED=true only while external forwarding works. Never put the private destination in public source.
4. Verify HTTPS, HTTP/www redirects, page URLs, missing-path 404, social metadata and contact behavior. Record headers in LAUNCH_REPORT.md.
5. Use ROLLBACK.md for a failed release. Never force-push, remove domain verification or overwrite MX/SPF records.

## Initial-paint gate

The enhancement scheduler waits for window load, local fonts, completion or cancellation of the headline's word reveals, and two animation frames before requesting `/client/client.js`. The previous fonts-plus-two-frames schedule could request that file before the final headline paint in a Lighthouse trace. The strict observed-LCP gate and all performance limits are retained. The scheduler is bundled inline and its measured gzip bytes remain part of the own-JS budget; the earlier 285 raw / 207 gzip byte measurement is historical.

Local production build measured the new inline scheduler at 449 raw / 318 gzip bytes, total own JS 4.9 KB gzip against 8 KB, motion 48.6 KB against 55 KB, and homepage first-load 124.5 KB against 350 KB. Remote browser and Lighthouse results are reported by the matching CI run, not inferred from this build.

## Hosting limits

GitHub Pages cannot set custom response security headers. Meta CSP uses hashes; a meta referrer policy is present. frame-ancestors is ignored in meta CSP. The .dev TLD provides HSTS preload. The site stays static, without logins, backend forms, analytics or third-party scripts.

## Maintenance

- Review Dependabot PRs manually.
- Keep GitHub and Name.com MFA and private recovery information current; never expose authentication secrets.
- Confirm forwarded messages reach the inbox and privately configure a suitable spam filter if needed.
- Domain expiry: 21 October 2027, automatic renewal observed off. A reminder is scheduled sixty days earlier; no purchase occurs automatically.
