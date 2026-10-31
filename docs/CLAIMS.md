# Claims ledger and content gate

Every factual sentence on the site comes from `src/content/claims.yaml` through `<Claim id="..." />`.

| Status | Meaning | `npm run build` (review) | `npm run build:prod` |
|---|---|---|---|
| `VERIFIED` | Evidence on file and reviewed | renders | renders |
| `USER_REPORTED` | Stated by Allam; `approvedBy` set once he confirms the wording | renders | renders |
| `NEEDS_EVIDENCE` | Missing fact, usually `[[PLACEHOLDER: …]]` | renders with a red **UNVERIFIED** marker | withheld |
| `NOT_FOR_PUBLICATION` | Never public | renders with marker | withheld |

When every claim in a case-study section is withheld, the section says "Not yet published" instead of rendering empty.

## What `build:prod` fails on (`scripts/check-claims.mjs`)
- a rendered claim with a non-publishable status, or the text of such a claim anywhere in `dist/`
- any `[[PLACEHOLDER` marker
- a digit in case-study body text outside `<Claim>`; structural labels (`data-structural`, e.g. "01") and SVG diagrams are exempt
- the word "freelance" in any built file
- any line of the local, git-ignored `blocked-figures.txt` (one value per line, `#` for comments). Errors name the entry number, never the value
- any email address other than `allam@allamashraf.dev`, or that address while `EMAIL_PUBLISHED` is false

Each failure mode has a unit test in `tests/unit/check-claims.test.mjs`.

## Project status badges
Mono text plus border style, never colour alone: DELIVERED (solid), UNRELEASED (double; built and complete, never launched; added 22 Oct 2026), PROTOTYPE (dashed), CONCEPT (dotted), IN PROGRESS (half-filled dot).

## Rules
- `evidenceRef` is a **public-safe pointer** ("screenshot set A, held by Allam"). Private files live in the git-ignored `evidence/` folder.
- A claim that contains `[[PLACEHOLDER` cannot be `VERIFIED` or `USER_REPORTED` (schema error).
- No figure (conversion, volume, revenue, file size, test count) becomes `VERIFIED` without evidence Allam holds.
- AOG Developments is a former employer: past tense, period `2025 – 2026`.
