# Portfolio release checklist

Live release: https://allamashraf.dev/ on 1 November 2026 (Cairo).
The approved upgraded mobile design remains the governing mobile implementation.

## Completed launch

- Seven production HTML pages, including custom 404; project statuses and limitations retained.
- Clean public repository, protected main, required verify check, current base branch and resolved conversations. Force-push, deletion and administrator bypass blocked.
- Manual workflow_dispatch deployment only; no automatic production deployment on push.
- Name.com remains registrar and DNS provider: four A, four AAAA, www CNAME, retained ownership TXT and six mail MX plus SPF (17 records). Nameservers unchanged; no wildcard.
- DNS validation successful, TLS active and Enforce HTTPS enabled. Observed apex 200, HTTP-to-HTTPS 301, www-to-apex 301 and missing-path 404. See LAUNCH_REPORT.md for headers.
- External email delivery was confirmed by Allam with inbox evidence before enabling the production address. The existing private forwarding destination is unchanged.
- GitHub and Name.com MFA were observed enabled. Private recovery information and evidence remain unpublished.

## Approved decisions

- Allam approved the five mobile UI labels on 31 October 2026. src/content/mobile.ts records APPROVED; pending-copy references in MOBILE_PLAN_REVIEW.md are historical.
- Fictional samples and disclosure retained. No live customers or production integrations.
- AOG is a former employer, 2025–2026. No unevidenced outcome numbers added.
- Performance exception: existing inline scheduler, 285 raw / 207 gzip bytes, counted in own JS; zero external Script requests before observed LCP. This does not mean literally zero executable JavaScript. All other budgets remain unchanged.
- Allam explicitly authorized launch before the human checks below were complete. Their status is not a pass.

## Validated launch baseline

CI run 41221733662 validated f67f00e001f53ce7ae716bca7e7f0c567b2340d2 before merge 91b376af290c15004149ac6a46627edd12e7a556: 18 unit tests, 113 browser tests (three expected skips), type checking, claims/release gates, budgets, 12 Lighthouse assertions and the observed-LCP external-script gate passed. Gitleaks scanned all eight fetched commits with zero findings. These counts describe that release, not later changes.

## Follow-up implementation

- Desktop hero signal transfers to CLICK before the single pinned scene; complete mobile, reduced-motion, Save-Data and failed-chunk fallbacks remain.
- npm prepare installs repository-local pre-commit checks: staged whitespace, redacted Gitleaks and staged-content formatting. Gitleaks 8.30.1 is required on PATH or through GITLEAKS_BIN. CI independently checks formatting, secrets and quality gates.
- One second-person PR approval is now required. A saved confirmation and a fresh reopening of the protection rule verified this setting. Required CI, an up-to-date branch, conversation resolution and no administrator bypass remain enabled. Future PRs, including documentation, require another GitHub account with suitable review access; the author cannot approve their own PR.
- LAUNCH_REPORT.md records live PageSpeed and LinkedIn Post Inspector results or their actual service/authentication blockers.
- Follow-up PR #6 is deployed by GitHub Pages run 41259260695. CI run 41258762918 passed 18 unit and 115 browser tests (three expected skips). Post-deployment PageSpeed mobile measured 99 performance and 100 in the other three categories; no CrUX field data.

## Unfinished human verification

- Five independent participants, ten seconds each; at least four identify the work, evidence and contact method.
- Actual NVDA or VoiceOver spoken-output pass of the homepage and one case study.
- Full physical mid-range Android, iPhone Safari and desktop-browser matrix. Allam's success report on one unspecified phone is retained as user-reported evidence, not the whole matrix.
- The existing forwarded test message was observed outside Spam, and a separate seven-day Spam search returned no messages for the portfolio address. Filter configuration and private recovery backups remain unverified; registrar account access requires a new login. Do not publish recovery contacts or change credentials through an agent.

## Operations and later scope

Domain expiry observed: 21 October 2027; automatic renewal off. A reminder is scheduled for 22 August 2027 in Africa/Cairo, sixty days before expiry. No purchase is automatic. The private pre-web DNS snapshot remains available for rollback.

Arabic, blog, CMS, analytics, contact forms, a fourth project and hosted automation are deferred. Fix the prototype's disclosed concurrency and broken-payload limits before connecting real services. No field INP/CrUX pass is claimed without real-user data.
