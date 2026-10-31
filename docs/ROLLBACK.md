# Rollback

## Bad content or a broken build
1. `git revert <commit>` (never force-push `main`).
2. Run the gates locally (`npm run build:prod && npm test`).
3. Actions → "Deploy to GitHub Pages" → Run workflow.

## DNS problem
1. Restore the records from the pre-launch snapshot (`docs/DNS_PLAN.md` step 1).
2. **Keep** the `_github-pages-challenge-…` TXT record; it protects against domain takeover.
3. If the site must go dark, remove the custom domain in repo Settings → Pages **before** deleting the A/AAAA/CNAME records.

## Email forwarding problem
1. Set `EMAIL_PUBLISHED: 'false'` in `deploy.yml` and redeploy; LinkedIn becomes the only channel.
2. Fix forwarding in Name.com, re-test, then flip back.
