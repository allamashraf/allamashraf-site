# Launch report — 1 November 2026

## Production verification

Release checked: main 91b376af290c15004149ac6a46627edd12e7a556, deployed by workflow run 41226000349.
Apex HTTPS is valid and Enforce HTTPS is on. DNS ownership TXT and all mail records are retained; nameservers stay ns1.name.com through ns4.name.com.

Six content routes and 404.html returned 200 when requested directly. An unknown path returned HTTP 404 with the custom page. robots.txt, sitemap-index.xml and sitemap-0.xml returned 200. Canonical URLs point to the apex HTTPS origin; inspected pages had no HTTP asset references.

### Observed response headers

Captured using HEAD requests without following redirects. The observation path includes an execution proxy; these are returned headers, not a claim of custom origin-header configuration.

Observed at: 2026-11-01T00:44:52.059840+00:00 (UTC).

### https://allamashraf.dev/

```http
HTTP 200
server: envoy
content-type: text/html; charset=utf-8
last-modified: Sat, 31 Oct 2026 17:45:50 GMT
access-control-allow-origin: *
etag: "6ae6294e-1855f"
expires: Sun, 01 Nov 2026 00:39:51 GMT
cache-control: max-age=600
x-proxy-cache: MISS
x-github-request-id: 4142:3C0BE9:2095CBC:24C04B5:6AE687FE
x-github-edge-region: iad
accept-ranges: bytes
age: 0
date: Sun, 01 Nov 2026 00:44:40 GMT
via: 1.1 varnish
x-served-by: cache-dfw-kdfw8210130-DFW
x-cache: HIT
x-cache-hits: 0
x-timer: S1793493880.032129,VS0,VE59
vary: Accept-Encoding
x-fastly-request-id: df31db7e485379b8b497393a0fd256a5bc3f27c1
content-length: 99679
x-envoy-upstream-service-time: 280
connection: close
```

### http://allamashraf.dev/

```http
HTTP 301
content-length: 162
server: envoy
content-type: text/html
location: https://allamashraf.dev/
x-github-request-id: 5256:1D50C1:28806CF:2C2FCB5:6AE687FD
x-github-edge-region: iad
accept-ranges: bytes
age: 893
date: Sun, 01 Nov 2026 00:44:42 GMT
via: 1.1 varnish
x-served-by: cache-dfw-kdfw8210041-DFW
x-cache: HIT
x-cache-hits: 0
x-timer: S1793493882.451337,VS0,VE3
vary: Accept-Encoding
x-fastly-request-id: fb6a535620c456e04bf65809eafd7c664ea71482
x-envoy-upstream-service-time: 100
connection: close
```

### https://www.allamashraf.dev/

```http
HTTP 301
server: envoy
content-type: text/html
location: https://allamashraf.dev/
x-github-request-id: CC2E:127C5F:1FBB312:23E63A6:6AE687FB
x-github-edge-region: iad
accept-ranges: bytes
age: 897
date: Sun, 01 Nov 2026 00:44:47 GMT
via: 1.1 varnish
x-served-by: cache-dfw-kdfw8210032-DFW
x-cache: HIT
x-cache-hits: 0
x-timer: S1793493887.251229,VS0,VE1
vary: Accept-Encoding
x-fastly-request-id: cddea5251ce421e847a130ea36e3c1a55ad0e394
content-length: 162
x-envoy-upstream-service-time: 84
connection: close
```

### https://allamashraf.dev/release-report-missing/

```http
HTTP 404
server: envoy
content-type: text/html; charset=utf-8
access-control-allow-origin: *
etag: "6ae6294e-2281"
x-proxy-cache: MISS
x-github-request-id: E12E:CFB40:12FF393:184D97E:6AE68B83
x-github-edge-region: iad
accept-ranges: bytes
age: 0
date: Sun, 01 Nov 2026 00:44:52 GMT
via: 1.1 varnish
x-served-by: cache-dfw-kdfw8210130-DFW
x-cache: MISS
x-cache-hits: 0
x-timer: S1793493892.976700,VS0,VE68
vary: Accept-Encoding
x-fastly-request-id: 22adde57f206a14c174e887e97d602cc58e21c5e
content-length: 8833
x-envoy-upstream-service-time: 91
connection: close
```

## Live PageSpeed baseline

Official PageSpeed mobile report captured 1 November 2026 at 02:45 Cairo, before the follow-up motion change:
https://pagespeed.web.dev/analysis/https-allamashraf-dev/23fz7a07z5?form_factor=mobile

Performance 100; accessibility 100; best practices 100; SEO 100. Displayed LCP/FCP/Speed Index 0.9 s, TBT 0 ms, CLS 0. This is one lab run (Lighthouse 13.6.0, emulated Moto G Power, slow 4G), not a physical-device or real-user result, and not a guarantee for later releases. CrUX reports no field data. The unauthenticated PageSpeed API returned HTTP 429; the official web UI completed successfully.

## Follow-up release verification

PR #6 merged as `3f207b6c052541f4af153fc0150b1b5964a9f5e5` and GitHub Pages deployment run [41259260695](https://github.com/allamashraf/allamashraf-site/actions/runs/41259260695) completed successfully. CI run [41258762918](https://github.com/allamashraf/allamashraf-site/actions/runs/41258762918) passed 18 unit tests and 115 browser tests, with three expected skips, plus type, formatting, secret, budget and performance gates. A fresh public-page inspection found the new desktop transfer element after lazy initialization and observed its active state during scrolling. The approved mobile design is retained.

### PageSpeed after the follow-up deployment

Official mobile report captured 1 November 2026 at 03:13 Cairo:
https://pagespeed.web.dev/analysis/https-allamashraf-dev/vmxacc725c?form_factor=mobile

Performance **99**, accessibility **100**, best practices **100**, SEO **100**. Displayed FCP/LCP **1.0 s**, TBT **0 ms**, CLS **0**, Speed Index **3.7 s**. Lighthouse 13.6.0 used an emulated Moto G Power and slow 4G. CrUX still has no field data. This is the post-deployment lab result; the earlier 100/100/100/100 report above is historical. One run does not establish the cause of the one-point difference or replace physical-device verification.

### Remaining administrative checks

- Main protection now requires **one reviewer approval**. Saving initially reached GitHub's Confirm access screen; a later fresh observation showed the saved confirmation, and reopening the rule verified Require approvals enabled with one required approval. Required CI, an up-to-date branch, resolved conversations and no administrator bypass remain enabled; force pushes and deletion remain disabled. Future PRs, including this report update, need another eligible reviewer's approval. Do not disable protection to finish a release.
- The approved forwarding mailbox contained the existing external test message addressed to the portfolio contact address. It had no SPAM label. A separate seven-day spam search for that address returned no messages. This verifies the observed sample, not guaranteed future delivery or the mailbox's filter configuration. No test email was sent during this audit.
- Recovery options were reviewed where accessible without opening recovery codes. Owner verification and private backup of recovery details remain open. The registrar session expired before a fresh account-level read-back. No password, MFA method, forwarding destination or spam setting was changed.
- LinkedIn Post Inspector remains unverified. Browser access was denied because the earlier sign-in was cancelled; fresh explicit authorization is required before another sign-in attempt. Connected LinkedIn profile search does not provide Post Inspector functionality.

## Social preview

Per-page 1200×630 Open Graph images, title, description, Twitter large-image metadata and absolute HTTPS URLs pass the release checks. LinkedIn Post Inspector accepted the public site URL but requires sign-in at https://www.linkedin.com/post-inspector/login before displaying its crawler preview. A successful LinkedIn inspection is not yet recorded. No social post was created.

## Operations

External forwarding delivery was confirmed by Allam before the contact address was published. The follow-up mailbox audit above confirms the existing test was outside Spam. GitHub and Name.com MFA were observed enabled at launch. Private recovery backups and spam-filter configuration still need owner verification; never publish those values.

Domain expiry: 21 October 2027; auto-renew observed off. Renewal reminder created for 22 August 2027, Africa/Cairo, sixty days before expiry. No purchase or automatic renewal setting was changed.

Rollback: keep the private eight-record pre-web snapshot, ownership TXT and mail records. Revert a bad application commit via a PR and run manual deployment again. See ROLLBACK.md.

## Validation still open

Five-person comprehension, actual NVDA/VoiceOver and the complete physical Android/iPhone/desktop matrix remain open. One unspecified phone was user-reported successful. No field INP pass is claimed.
