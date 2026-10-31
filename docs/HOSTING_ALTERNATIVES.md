# Hosting alternatives (not used in v1)

- **GitHub Pages (chosen).** Free on a public repo, apex A/AAAA records at any DNS provider, automatic www↔apex redirect, Enforce HTTPS. No custom headers.
- **Cloudflare Pages / Workers.** Stronger headers and previews, but an apex domain requires a Cloudflare zone with Cloudflare nameservers. Decision 1 keeps Name.com nameservers, so this is a future migration path only. Name.com email forwarding would also need replacing (Cloudflare Email Routing needs Cloudflare DNS).
- **Vercel Hobby.** Rejected: its terms limit it to non-commercial personal use.

The build output (`dist/`) is plain static files, so moving hosts needs no code change.
