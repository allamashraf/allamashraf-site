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

Measured locally on 31 October 2026:

- `npm run check`: 63 files, zero errors, warnings or hints.
- `npm run test:unit`: 18 passed, zero failures.
- `npm run build:prod`: passed; seven pages, claims gate and release gate passed.
- `npm run check:budgets`: own JS 5.1 KB gzip; deferred motion 43.5 KB; CSS 12.9 KB; fonts 90.2 KB; one font preload; homepage first load 125.0 KB. Every configured size budget passed.
- Clean source history: zero matches for the local blocked-term entry and zero personal Gmail addresses. The original historical database remains untouched and is not used for release.
- Gitleaks 8.30.1: zero findings in the current clean committed history and zero findings in a separate copy of publishable source files.
- Chrome inspection: six normal routes rendered their expected heading, social metadata and Apple icon. A settled 375-pixel mobile frame had no horizontal overflow; selecting the English example produced score 40, Warm, consistent with the scorer's unit tests.
- The multi-page iframe inspection caught active cross-document transitions, so its transient width values are not accepted as final responsive-suite evidence. Re-run the existing cross-browser suite in CI before public launch.
- The preview daemon serves a generic error for an unknown path; direct `404.html` is present. Actual unknown-path HTTP 404 behavior must be confirmed on GitHub Pages, rather than inferred from that daemon.
- GitHub repository creation is blocked by a GitHub sign-in page in the available browser. Name.com also requires sign-in. No DNS or domain-account setting has been changed.

Lighthouse, the full current browser suite, real-device checks, assistive-technology checks, comprehension testing, final mobile wording approval and public-domain verification remain pending. An unfinished item remains pending; do not mark human or account-level checks complete from inference.
