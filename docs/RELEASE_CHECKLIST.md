# Portfolio release checklist

Release candidate: starter-v2, with the mobile upgrade retained.
Review date: 31 October 2026.

## Governing decisions

The original master plan governs scope, content integrity, performance, testing and GitHub Pages deployment. The mobile implementation documented in MOBILE_PLAN_REVIEW.md and Allam's 31 October instruction supersede the original mobile appearance. Keep its colors, typography, particle treatment, menu, cards and interactive scoring scene. Do not restore the earlier Proof Rail or heading dot on phones merely to match the original desktop specification.

AOG is a former employer. Existing approved claims and project statuses remain unchanged. The static portfolio does not turn its local routing prototype into a hosted automation service.

## Implemented release work

- Seven production HTML pages, including the custom 404 page.
- Per-page social PNG cards at 1200 by 630, using the existing project fonts and approved titles.
- Open Graph and large Twitter cards with absolute canonical-domain URLs and descriptive alternative text.
- Apple touch icon derived from the existing favicon.
- Production build runs the claims gate and a separate release gate for social assets, icons, internal references, sitemap and draft exclusion.
- CI can be run manually as well as on pull requests. Deployment remains manual only.
- The release uses the clean source repository created for the preview; the uploaded historical Git database is not imported.

## Copy review

The existing mobile copy remains marked PROPOSED in source. Selecting the mobile design does not record a separate approval of new wording.

Current UI wording for final review:

- Menu
- Fictional samples
- Write your own
- Fictional leads · rules from the lead-routing prototype
- Sample result

The preview still identifies the proposal. Remove its editorial marker only after the wording is accepted; do not change scoring rules, sample results or claims to obtain approval.

## Required verification

| Requirement | Current evidence |
| --- | --- |
| Type checking | Run on the final release commit and record the result below |
| Unit tests and claims gate | Run on the final release commit and record the result below |
| Asset-size budgets | Measure the final production output |
| All routes, internal links, SEO and no drafts | Automated static release gate plus browser/HTTP checks |
| Chromium, Firefox, WebKit, axe, keyboard, no-JS, reduced motion and Save-Data | Re-run the repository's existing browser suite; the earlier report is not a substitute |
| Lighthouse | Record three mobile runs per configured route; Performance >=90, LCP <=2500 ms, CLS <=0.1, TBT <=150 ms |
| Secret and history checks | Scan the final clean history and publishable files; no local denylist content may be printed or committed |
| Physical Android and iPhone | Pending real hardware; browser emulation does not complete this requirement |
| NVDA or VoiceOver | Pending a full homepage and one case-study pass |
| Comprehension | Pending five independent people, ten seconds each; at least four explain the work, evidence and contact method |

## Domain and launch

1. Review Name.com expiry, auto-renew, saved-card state, DNSSEC, unchanged default nameservers and account MFA. Do not purchase or alter security settings as part of a read-only review.
2. Save the existing DNS records privately before changes.
3. Verify domain ownership in GitHub with its issued TXT record; retain that record.
4. Set allamashraf.dev as the repository's custom domain before changing DNS. Use the existing DNS_PLAN.md; re-check official GitHub values before applying.
5. Publish only after release gates pass. Check valid HTTPS, www-to-apex redirect, normal pages, missing-path HTTP 404 and canonical/social URLs.
6. Record the launch headers and rollback reference. No launch result is recorded until observed.
7. Keep the email hidden until forwarding has been tested externally. LinkedIn remains the available contact channel meanwhile.

## Out of scope for this release

Arabic, blog, CMS, analytics, a contact form, hosted automation and optional Lab projects remain deferred. Original customer assets, private evidence, local denylists and the old Git database remain outside the public repository.

## Current measured results

Measured on 31 October 2026:

- Release before the scheduling change: GitHub Actions run 41181865650 passed 113 browser tests (three expected skips), 18 unit tests, the claims/release gates and Gitleaks 8.30.1. All 12 Lighthouse runs passed their configured assertions.
- Median Lighthouse Performance / LCP / CLS / TBT for that release: home 94 / 2411 ms / 0.0746 / 0 ms; work 98 / 1806 ms / 0 / 0 ms; prototype 98 / 1809 ms / 0 / 0 ms; about 99 / 1655 ms / 0 / 0 ms. Accessibility was 100 on all four routes.
- A stricter trace review found three external script requests (3269 transferred bytes) before observed homepage LCP. Passing the score alone did not satisfy the deferred-loading intent.
- The current change consolidates progressive enhancements behind load, local-font readiness and two animation frames. Static content, native navigation, design, scoring rules and motion safeguards stay unchanged. No dependency was added.
- Local final check: 66 files, zero errors, warnings or hints. All 18 unit tests passed; seven-page production build, claims gate and release gate passed.
- Current measured budgets: own JS 4.8 KB gzip; desktop motion 48.2 KB; CSS 12.9 KB; fonts 90.2 KB; one preload; initial homepage 124.2 KB. Each configured size budget passed.
- The inline scheduler is 285 raw bytes / 207 gzip bytes and is included in the own-JS budget. The new trace gate measures **external requests before observed LCP**, not literal zero executable JavaScript. The original wording “JS before LCP 0KB” is therefore not recorded as literally met; this distinction must remain visible at final plan review.
- The new trace gate rejects the previous reports and requires three unique measured runs on each configured route. GitHub Actions run 41215333010 on application commit fd35220e07045edf9a2bdc5bcfe4c2ff57c775b0 passed: 113 browser tests (three expected skips), 18 unit tests, all 12 Lighthouse assertions, the new pre-LCP external-request gate and Gitleaks 8.30.1 (zero findings across the four PR commits).
- Current median Lighthouse results: home Performance 95, LCP 2257 ms, CLS 0.0746, TBT 0 ms; work 98 / 1806 ms / 0 / 0 ms; prototype 98 / 1807 ms / 0 / 0 ms; about 99 / 1654 ms / 0 / 0 ms. Accessibility was 100 on all four routes. Every one of the 12 traces had zero external Script requests before observed LCP.
- The release artifact SHA-256 is dd00aa4d61e90912f5d62f852c24cf839d3bb6a7fe4710dfd522b22d42922418. Local full-object history check: zero blocked-term matches and zero personal Gmail addresses; sanitized publishable files also had zero Gitleaks findings.
- The clean source history excludes the uploaded historical Git database, private evidence, local denylists and personal email addresses. Run the final history scan before launch.

## Account and domain preparation observed

- The private GitHub repository allamashraf/allamashraf-site and draft PR #1 exist. The separate automation repository is untouched. GitHub 2FA is configured. Actions paid usage is capped at $0.
- GitHub has verified ownership of allamashraf.dev using its issued TXT record.
- Name.com default nameservers are unchanged. The domain expires 21 October 2027; auto-renew is off and a payment profile is present. DNSSEC is unavailable on those default nameservers. No purchase or security-setting change was made.
- Name.com two-step verification is still pending the owner's secure setup. No new authentication secret is handled by the agent.
- The eight-record pre-web DNS snapshot is saved privately for rollback. Forwarding for allam@allamashraf.dev is configured, but external delivery has not been tested; EMAIL_PUBLISHED stays false.
- No website A/AAAA or www CNAME cutover has occurred. Main protection, repository public visibility, GitHub Pages configuration, final HTTPS/redirect/404/header checks and public launch remain unfinished.

## Remaining human checks

Physical Android and iPhone, NVDA or VoiceOver, the five-person comprehension test and final mobile wording approval remain pending. Browser emulation does not substitute for these tests. No human result, approval or live-domain result is inferred.
