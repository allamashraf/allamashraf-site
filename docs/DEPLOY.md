# Deploy (GitHub Pages): only after Allam's written approval

The private repository, draft release PR, owner-only preview, domain ownership verification and email-forwarding configuration exist. The public GitHub Pages launch and website DNS cutover have not been performed. Current evidence and pending gates are in RELEASE_CHECKLIST.md. Deployment stays manual.

## Before the repo goes public
1. All local gates green: `npm run check`, `npm run build:prod`, `npm run check:budgets`, `npm test`.
2. Review every `USER_REPORTED` claim in `src/content/claims.yaml` and set `approvedBy`.
3. Approve or edit all `PROPOSED` copy (`src/content/copy.ts`, `copy: PROPOSED` claims).
4. Full-history secret scan: `gitleaks git --redact --config .gitleaks.toml` (gitleaks 8.30.1). Zero findings.
   - `CLAUDE.md` and `docs/MASTER_PLAN.md` are local-only (git-ignored, untracked since 22 Oct 2026). Keep them out of the repo.
   - The custom `personal-gmail-address` rule must report zero findings across the full history.
5. Confirm `evidence/`, `blocked-figures.txt` and `blocked-terms.txt` were never committed: `git log --all -- evidence blocked-figures.txt blocked-terms.txt` prints nothing.
6. **Use the clean release history.** The uploaded historical Git database is retained privately for audit and is not the release repository. Do not import it, reset already-pushed branches or run a history purge on the release repository.
   Run `npm run check:history` with the local-only denylists available. It checks every local object and prints counts without revealing entries. Stop if any count is above zero or the output does not end with `History check passed.` Repeat the full-history Gitleaks scan after the final source commit.
7. Complete the real-device, screen-reader and five-person comprehension checks recorded in RELEASE_CHECKLIST.md. Record actual results, not emulation or inferred approvals. Name.com account MFA must also be enabled by its owner.
8. Review the exact performance interpretation: the inline scheduler is included in the own-JS budget; `check:lcp-scripts` checks external requests before observed LCP. It does not demonstrate literal zero executable JavaScript before LCP.

## Publish
1. Only after all release gates above pass: GitHub → repo Settings → General → change visibility to **Public** (required for free Pages).
2. Settings → Pages → Source: **GitHub Actions**.
3. Actions → "Deploy to GitHub Pages" → **Run workflow** (`workflow_dispatch` only).
4. Custom domain: follow `docs/DNS_PLAN.md` in order. Set the custom domain in the repo **before** adding DNS records.

## Post-launch checks
```bash
curl -I https://allamashraf.dev/
curl -I https://www.allamashraf.dev/
curl -I https://allamashraf.dev/does-not-exist/
```
Expect: `200`, a redirect from www to the apex, and `404` serving `404.html`. Record the headers in this file.

## Accepted residual risks (GitHub Pages cannot set custom headers)
- `frame-ancestors` is ignored in a meta CSP, so clickjacking protection is not available.
- `X-Content-Type-Options`, `Permissions-Policy` and `Referrer-Policy` headers cannot be set; referrer is set by meta tag.
- HSTS is covered by the `.dev` TLD preload list.
- Mitigation: static site, no forms, no logins, no third-party scripts, meta CSP with hashes.
