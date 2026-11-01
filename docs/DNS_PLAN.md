# DNS plan: Name.com only, nameservers unchanged

Launch completed on 1 November 2026: four apex A records, four apex AAAA records and the www CNAME were added; all eight mail/verification baseline records were retained (17 total). DNS validation passed, TLS is active and Enforce HTTPS is enabled. Name.com nameservers are unchanged. External mail delivery was confirmed before publishing the contact address. The private pre-web baseline remains the rollback reference. The sequence below documents this setup; do not add duplicate records.

1. **Snapshot** every existing record in Name.com (screenshot plus a text copy, kept in `evidence/`, never committed).
2. **Confirm** the nameservers are Name.com's defaults. Required for email forwarding and for these records.
3. **Verify the domain in GitHub** (account Settings → Pages → Add a domain): add the TXT record
   `_github-pages-challenge-<github-username>` with the value GitHub shows. Keep it permanently (prevents takeover).
4. **Set the custom domain in the repo first** (Settings → Pages → Custom domain: `allamashraf.dev`), then add DNS.
5. **Name.com records**:
   | Type  | Host | Value                         |
   | ----- | ---- | ----------------------------- |
   | A     | @    | 185.199.108.153               |
   | A     | @    | 185.199.109.153               |
   | A     | @    | 185.199.110.153               |
   | A     | @    | 185.199.111.153               |
   | AAAA  | @    | 2606:50c0:8000::153           |
   | AAAA  | @    | 2606:50c0:8001::153           |
   | AAAA  | @    | 2606:50c0:8002::153           |
   | AAAA  | @    | 2606:50c0:8003::153           |
   | CNAME | www  | `<github-username>.github.io` |
   - No wildcard records.
   - **Never enable Name.com URL forwarding.** It overwrites the A records and cannot serve HTTPS on `.dev`.
6. **CAA**: if any CAA record exists, it must allow `letsencrypt.org`.
7. Wait for the certificate, then tick **Enforce HTTPS**.
8. **Email**: Name.com → Email Forwarding → `allam@allamashraf.dev` → the destination confirmed privately from Allam's supplied plan. Do not put the destination address in source or public docs.
   - Test from an external, non-Gmail account. Add a Gmail filter "Never send it to Spam".
   - Only after the test arrives: set `EMAIL_PUBLISHED: 'true'` in `.github/workflows/deploy.yml` and redeploy.
