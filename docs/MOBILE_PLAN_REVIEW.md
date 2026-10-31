# Mobile mockup implementation review

## Approval update — 31 October 2026

The implementation notes below describe the original review state. Allam has now explicitly approved the five labels in `src/content/mobile.ts`: Menu; Fictional samples; Write your own; Fictional leads · rules from the lead-routing prototype; Sample result. Their status is APPROVED, and only the editorial PROPOSED suffix is removed from that caption. The fictional-data disclosure, sample messages, rules, claims and mobile appearance remain unchanged. Imported draft content is not covered by this five-label approval. Current release evidence and unfinished gates are recorded in RELEASE_CHECKLIST.md.

Local branch: `codex/mobile-plan`. No push, publish, deployment, new dependency, plugin, or browser installation.

Open the complete local comparison at `../.shots/mobile-plan/comparison.html`. It contains a screenshot beside **each of the six supplied references**, followed by the capabilities, contact, and footer screenshots. Comparison PNGs are also saved individually in that directory. Original references are embedded only in the local review artifact, never in the website or production assets.

## What changed

- `src/components/Hero.astro`: mobile header spacing, approved heading and bio, pill buttons, LinkedIn, credibility strip and particle wave.
- `src/components/SiteHeader.astro`: mobile full-name/location header and native disclosure menu; original desktop appearance preserved.
- `src/components/SignalPath.astro`: mobile scoring scene ahead of a compact five-station stepper; original desktop scene preserved.
- `src/components/CaseCard.astro`: mobile-only schematics on homepage cards.
- `src/pages/index.astro`: mobile card layout, collapsed capabilities/approach, and sticky LinkedIn contact action.
- `src/components/MobileParticles.astro`: seeded static particle paths and decorative canvas layers. Static dots are batched into paths to avoid thousands of DOM nodes.
- `src/components/MobileLeadDemo.astro`: worked example, three fictional sample controls, rule explanation, bilingual optional input, and no-JS fallback.
- `src/components/MobileSchematic.astro`: code-native diagrams for the real showroom, hotel page, and routing prototype.
- `src/scripts/mobile-experience.ts`: existing scorer integration; no requests, persistence, or URL payloads; decorative motion; visibility/resize handling and performance fallbacks.
- `src/content/mobile.ts`: new UI wording explicitly `PROPOSED`. Reused sample wording is already PROPOSED in the existing draft; its containing UI is marked accordingly.
- `src/styles/mobile.css`: homepage overrides restricted to `max-width: 767px`.
- `tests/e2e/mobile.spec.ts`: replace assertions about the superseded mobile layout, retain tablet regression checks.
- `tests/e2e/mobile-scene.spec.ts`: scorer parity, privacy, no-JS, reduced motion, Save-Data, narrow screens, unavailable canvas, offscreen pause, DPR and desktop boundary.
- `scripts/mobile-review.mjs`, `scripts/mobile-comparisons.mjs`: repeatable local screenshots, pixel comparison and review packaging using existing Playwright and Sharp.
- `.gitignore`: keep browser-generated `debug.log` out of source control alongside other review outputs.
- This review document.

Approved copy, claim ledger, real case titles/statuses/summaries, scorer rules, dependencies, and desktop motion implementation were not rewritten.

## Verification

- `npm run build:prod`: PASS, including the claims gate.
- `npm run check:claims`: PASS.
- `npm run check`: PASS, 0 errors, warnings or hints. There is no separate lint script configured.
- `git diff --check`: PASS.
- `npm test -- --workers=4`: 18 unit tests PASS; 115 browser tests PASS; 1 existing Firefox CSS scroll-timeline test skipped because that browser lacks the feature.
- Existing axe AA/overflow checks pass at 320, 375, 768 and 1440px across all public routes and 404. Color is accompanied by text labels; Warm is amber and Cold ivory white.
- Pixel comparisons: **18/18 identical** full-page screenshots across six public routes at 768, 1024 and 1440px, with reduced motion for deterministic capture. This verifies those settled renderings; it is not a claim of exhaustive device or animation equivalence.
- Mobile screenshots: first viewport and full page at 320, 375, 390 and 767px; individual section crops at 375px.
- Measured gzip budgets: own JS 5.1KB / 8KB; desktop motion 43.5KB / 55KB; CSS 12.9KB / 30KB; homepage first load 124.9KB / 350KB. Fonts 90.2KB / 110KB; one font preload.

Evidence: `.shots/mobile-plan/tests-final.log`, `desktop-comparison.json`, `before-*.png`, `after-*.png`, `mobile-*-viewport.png`, `mobile-*-full.png`, `section-*.png`, `comparison-*.png`, `comparison.html`.

## Every known visual deviation and its reason

| Area | Difference from the supplied art | Reason |
| --- | --- | --- |
| All references | Phone bezel, operating-system clock, notch, status icons and photographed finger are absent. | They frame the mockup and are not website UI. |
| Typography | Existing local Inter, JetBrains Mono and the site's display font are retained. Exact reference font files, weights and kerning cannot be established from the raster art. | No font assets were supplied; no remote font or dependency was introduced. Mobile hero is 40px at 375px; text remains selectable HTML. |
| Text contrast | Muted mobile homepage text is lighter than some reference gray text. | Preserve AA contrast on the near-black surface. |
| Header | Name and existing location replace the role/location placeholder; menu uses existing Work/About/Contact destinations. | Reuse approved identity and navigation, without inventing a new role line. |
| Hero heading | Existing H1 occupies five lines at 375px, rather than the reference's four. Height and subsequent vertical positions differ. | The user explicitly prohibited copying or shortening placeholder text; approved H1 is longer. |
| Hero supporting text | Approved short bio and four actual capability titles replace the reference text; their wraps and strip density differ. | Preserve approved copy. The capability strip uses smaller mono labels to retain the four-column geometry. |
| Hero actions | LinkedIn replaces the email action; arrow is external-link shaped. | Explicit user requirement; existing verified LinkedIn URL is used. |
| Particle wave | The wave is a seeded SVG texture with a Canvas 2D overlay, with a simpler, sparser ribbon and less photographic bloom than the rendered art. | Reproduce the visual language procedurally, with no image background, WebGL, blur filter, external asset, or heavy animation library. Exact particle placement and simulated depth are not matched. |
| Demo heading/eyebrows | Existing “How a lead moves” and approved intro replace all mockup headings. The mirrored right-hand placeholder eyebrow is absent. | No approved short equivalent was added merely to fill that label. New behavior labels are PROPOSED. |
| Demo samples | Three existing fictional Arabic/English/short examples replace channel, property-type and telephone chips. | The mockup's data is forbidden placeholder content. No phone number is supplied or generated by the new UI. |
| Score card | Default score is 70; other samples score 40 and 0. Actual fired rule labels/points replace the example score and invented criteria. Longer rule labels wrap and make the card taller. | The existing scorer is the source of truth. Budget +25, price/payment +20, site visit +30, valid phone +10, urgency +20, short/empty -15; clamp 0–100. |
| Demo streams | Only Hot/Warm/Cold labels and their rings remain. Reference counters and qualitative subtitles are absent. | The counters are explicitly prohibited and those subtitles are not existing approved scoring copy. |
| Demo particles/glow | The convergence, gate, branches and landing rings are approximate; exact bokeh, highlights and radial ornamentation differ. | Lightweight procedural rendering with 40 hero plus 80 funnel moving particles, capped DPR 2 and target 30fps. The static fallback intentionally has less bloom than the artwork. |
| Demo additions/height | Fictional-data/PROPOSED caption, optional input, rulebook and compact station explanations make this section longer. | These are behavior/accessibility requirements supplied by the plan; actual text remains available in the DOM. |
| Work introduction | The approved introduction occupies more lines; the right-hand repeated section eyebrow is absent. | Keep existing wording and avoid adding decorative duplicate copy. |
| Work cards | Real titles, full summaries and roles make cards taller. Delivered/unreleased/prototype order matches the real collection. | Explicit user requirement to retain real titles/statuses/summaries. Content is not truncated or replaced with invented one-line summaries. |
| Work status badges | Existing distinct double/dashed border treatments are retained in addition to reference-inspired pill shape and color. | Preserve the established status distinction beyond color alone. |
| Work schematics | Labels, icon geometry and paths differ; they depict the actual showroom, bilingual interest capture and local routing prototype. | Replacing them with the image's fictional brands, database, model, inventory, and follow-up integrations would misrepresent the work. |
| Landscape lead-flow reference | Five horizontal cards, slider arrows, desktop navigation and metric strip are not reproduced on mobile. The five real station sentences form a compact vertical stepper. | Desktop must remain unchanged; portrait behavior comes from the mobile reference and plan. All metric placeholders are excluded. |
| Landscape system/case reference | The existing prototype case-study architecture and eleven evidence sections remain, rather than a replica of that fictional desktop case page/sidebar. | No mobile case-study mockup was supplied. Real architecture, limitations and approved copy take priority; desktop is unchanged. This reference is included beside the actual architecture screenshot so the remaining mismatch is explicit. |
| Landscape funnel reference | The side-by-side desktop headline and horizontal funnel are represented by the mobile wave and vertical interactive scene. No metric strip or example thresholds are copied. | Mobile images establish that layout; real thresholds are Hot ≥60, Warm 30–59, Cold <30. |
| Capabilities/approach | Existing text is in native collapsed rows, rather than a separately matched mockup. | No image was supplied for these sections; the plan specifies native disclosures. |
| Contact/footer | Existing approved contact, availability, location and footer text remain with mobile styling. | No matching image was supplied; LinkedIn is used as requested. |
| Sticky action/bottom spacing | Sticky LinkedIn appears after the hero and hides near contact. Reserved bottom space includes the safe area. | Behavior supplied by the plan, rather than shown in the mockups. It can overlay content while scrolling, as a sticky action normally does; bottom content remains reachable. |
| Motion/fallbacks | Static screenshots show no motion. Reduced motion, Save-Data, width below 340px, unavailable canvas and persistent slow drawing use the static scene. | Required accessibility and performance fallbacks. Scene pauses offscreen and when the document is hidden. |

## Remaining risks and limits

- No physical mid-range Android device was connected. Battery use, thermal behavior and real-device frame pacing still need that check before launch. The target 30fps is a cap, not a measured performance promise.
- No Lighthouse score, LCP, INP or CLS result is claimed; the run measured bundle budgets and tested behavior, accessibility and rendering.
- Adaptive slow-draw degradation is implemented but was not benchmarked on slow physical hardware. Save-Data/reduced-motion/narrow-screen/no-canvas fallback paths were exercised in browser tests.
- New PROPOSED wording and existing PROPOSED sample wording still await copy approval. Nothing was published.
- Side-by-side screenshots show the remaining visual differences; this is not a claim of a pixel-perfect match to the mockups.

Local preview: `node scripts/static-server.mjs dist 4411`, then open `http://127.0.0.1:4411/` at a viewport below 768px. To regenerate review artifacts, set the existing browser-cache path if needed, then run `node scripts/mobile-review.mjs` followed by `node scripts/mobile-comparisons.mjs`. Baselines were captured before implementation with `--baseline`; do not overwrite those when reviewing this change.
