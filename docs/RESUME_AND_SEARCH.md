# Resume and search metadata

This update adds the requested public resume and GitHub profile links without changing project status or publishing private project code.

## Resume

- Public download: `/resume/Allam-Ashraf-Resume.pdf`.
- Editable content: `src/content/resume.json`; regenerate with `python3 scripts/build-resume.py` (ReportLab required only for regeneration).
- Source facts: the approved claims in `src/content/claims.yaml`, timeline in `src/content/timeline.yaml` and published case studies. The older CV contains superseded project wording; it is not used to override these sources.
- AOG is a former employer (years 2025-2026). Gold Star uses the approved website timeline (2024-2025). No graduation year, language proficiency, phone number, personal email or business outcome is added.
- The PDF identifies the hotel as unreleased and lead routing as a local, fictional-data prototype with disconnected integrations. No real customer data or private assets are included.
- Render and inspect the single PDF page after changing it. Verify extracted text, public contact links and that it stays one page before committing.

## Links

GitHub is visible in desktop navigation, the mobile menu, the footer and every case page. Case-page links explicitly say **GitHub profile**. They do not imply that private AOG source or the separate lead-routing repository has been published. The independent repository remains a separate plan item.

## Search

Page-specific titles and descriptions retain delivered, unreleased and prototype distinctions. Open Graph and Twitter descriptions use the same page metadata. Canonicals and social image paths stay on the production domain.

The JSON-LD graph connects Person, WebSite and the current WebPage, with ProfilePage only on About and CollectionPage on Work. Person uses the confirmed LinkedIn and approved GitHub URLs and points to the public resume. It claims no current employer, expertise rating, business impact, customer count or fictional evidence. The noindex error page emits no graph.

Primary implementation references: [Astro template directives](https://docs.astro.build/en/reference/directives-reference/), [Google title links](https://developers.google.com/search/docs/appearance/title-link), [Google snippets](https://developers.google.com/search/docs/appearance/snippet), [Google profile pages](https://developers.google.com/search/docs/appearance/structured-data/profile-page).

Search indexing, ranking and the exact snippet chosen by search engines are not guaranteed. This implements the metadata portion now; original media evidence and the separate lead-routing repository remain deferred.
