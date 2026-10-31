# Deploy (GitHub Pages): only after Allam's written approval

Nothing here has been run. Every step is manual and Allam's call.

## Before the repo goes public
1. All local gates green: `npm run check`, `npm run build:prod`, `npm run check:budgets`, `npm test`.
2. Review every `USER_REPORTED` claim in `src/content/claims.yaml` and set `approvedBy`.
3. Approve or edit all `PROPOSED` copy (`src/content/copy.ts`, `copy: PROPOSED` claims).
4. Full-history secret scan: `gitleaks git --redact --config .gitleaks.toml` (gitleaks 8.30.1). Zero findings.
   - `CLAUDE.md` and `docs/MASTER_PLAN.md` are local-only (git-ignored, untracked since 22 Oct 2026). Keep them out of the repo.
   - The custom `personal-gmail-address` rule must report zero findings across the full history.
5. Confirm `evidence/`, `blocked-figures.txt` and `blocked-terms.txt` were never committed: `git log --all -- evidence blocked-figures.txt blocked-terms.txt` prints nothing.
6. **REQUIRED: squash and purge the local history.** Early commits (before 22 Oct 2026, `f5c06be`) contain an unannounced project name that is now listed in the local `blocked-terms.txt`. The history must be rewritten before anyone else can see it. This is safe only while the repo has never been pushed.
   ```bash
   git reset --soft "$(git rev-list --max-parents=0 HEAD)"
   git commit --amend -m "feat: allamashraf.dev site"
   git reflog expire --expire=now --all
   git gc --prune=now
   ```
   After the squash and purge, scan **every** git object in the database (reachable or not) for each term in `blocked-terms.txt` (whole word, any case) and for any Gmail address. It prints counts only, never the values:
   ```bash
   npm run check:history
   ```
   - **If any count is above 0, or the output does not end with "History check passed.": STOP. Do not make the repo public.** Find and remove the source, repeat the squash and purge, and run the scan again.
   - Only when it passes, re-run step 4 (gitleaks on the full history).

## Publish
1. Only if step 6 above passed: GitHub → repo Settings → General → change visibility to **Public** (required for free Pages).
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
