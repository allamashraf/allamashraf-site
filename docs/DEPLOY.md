# Deployment and maintenance

Production: https://allamashraf.dev/ — GitHub Pages, manual deployment only.
RELEASE_CHECKLIST.md records approvals, exceptions and unfinished human validation; LAUNCH_REPORT.md records production HTTP evidence.

## Prepare a change

1. Create a work branch; never push directly to protected main.
2. Run npm ci. prepare sets core.hooksPath=.githooks for this checkout only. Install Gitleaks 8.30.1 from https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1 or set GITLEAKS_BIN to that executable.
3. Format changed files with npm run format -- <paths>, then stage them. The hook reads the Git index, checks whitespace, scans staged content with redacted Gitleaks output and verifies formatting. Partially staged content is checked as committed.
4. Run npm run check, npm run build:prod, npm run check:budgets and npm test. Keep local evidence and denylists private; never import the original uploaded Git database.
5. Open a PR and pass verify, update with main and resolve conversations. Required second-person approval needs someone other than the author; an AI report or self-review is not a GitHub approval.

CI independently checks changed-file formatting, secrets, browsers, accessibility, Lighthouse, claims and budgets. GitHub API writes do not execute a developer's local hook.

## Publish

1. Merge the reviewed PR after verify passes.
2. Actions → Deploy to GitHub Pages → Run workflow, selecting main.
3. Keep EMAIL_PUBLISHED=true only while external forwarding works. Never put the private destination in public source.
4. Verify HTTPS, HTTP/www redirects, page URLs, missing-path 404, social metadata and contact behavior. Record headers in LAUNCH_REPORT.md.
5. Use ROLLBACK.md for a failed release. Never force-push, remove domain verification or overwrite MX/SPF records.

## Hosting limits

GitHub Pages cannot set custom response security headers. Meta CSP uses hashes; a meta referrer policy is present. frame-ancestors is ignored in meta CSP. The .dev TLD provides HSTS preload. The site stays static, without logins, backend forms, analytics or third-party scripts.

## Maintenance

- Review Dependabot PRs manually.
- Keep GitHub and Name.com MFA and private recovery information current; never expose authentication secrets.
- Confirm forwarded messages reach the inbox and privately configure a suitable spam filter if needed.
- Domain expiry: 21 October 2027, automatic renewal observed off. A reminder is scheduled sixty days earlier; no purchase occurs automatically.
