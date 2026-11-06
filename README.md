# alextraynham.com

Alex Traynham's portfolio. Static HTML, CSS, and JavaScript, with no framework, build step, or backend. Warm paper, black type, cobalt tabs, serif accents, original thumbnails, and script excerpts carry across focused pages.

## Pages

- `/`: a personal introduction and three project stories with original thumbnails, a dated analytics snapshot, a script excerpt, and links into the full case studies.
- `/work`: the complete project index and supporting academic PDFs.
- `/experience`: roles, education, training tools, and the resume download.
- `/about`: Alex's story and direction.
- `/contact`: email, LinkedIn, and resume.
- `/one-group-different-speeds`: independent content proposal.
- `/youtube-content`: published creator work, dated analytics, and proposed packaging tests.
- `/guest-experience`: research, operations perspective, and a communication sample.
- `/curse-tracker`: independent concept case study.
- Existing PDFs retain their original filenames and URLs.

Shared navigation appears on every page. The four primary links stay visible on mobile. Active links use `aria-current="page"`; case studies keep Work selected. Page navigation uses real links and does not depend on JavaScript.

Legacy homepage fragments (`#work`, `#projects`, `#content`, `#archive`, `#experience`, `#proof`, `#about`, `#contact`) route to their new pages through a small script. Without JavaScript, each old fragment exposes a link to its new destination. `#top` still targets the introduction. URL fragments are not sent to the server, so these cannot be handled by HTTP redirects alone.

## Preview and deployment

Cloudflare Pages remains the host for this design release. The repository has no build command. Pages serves clean extensionless URLs for the HTML files. A basic local server can preview individual `.html` files, but will need extensionless routing to exercise the site navigation.

Changes go through a feature branch and pull request. Cloudflare's existing Git integration builds branch previews. Review the preview before merging: a push to `main` triggers production automatically. A draft PR is not a production deployment.

Workers with Static Assets is a separate planned hosting change. Do not add a framework or runtime Worker just to serve these pages. Preserve the existing Pages project and a known-good deployment until any later migration is verified.

## Content maintenance

Keep independent concepts, academic research, published work, and future tests clearly labeled. Do not add outcomes or performance claims without a source, date range, and methodology. Prefer durable descriptions; existing analytics snapshots remain explicitly dated. Preserve Alex's plain first-person voice.

MBA wording reflects the confirmed Spring 2027 Evening MBA start. The resume PDF is still the existing file and needs a separate factual refresh before the new site is promoted to production. Replace it with a verified PDF under the same filename; do not run binary content through a text upload API.

For a case study, show the opportunity, audience, Alex's role, decisions, visible deliverables, evidence, limits, and next step. PDFs support the page rather than replace it.

Add new canonical URLs to `sitemap.xml`. Update the CSS/JS query version when shared assets change. The YouTube player loads only on request, and its external viewing link works without site JavaScript.

## Release review

- Check every page, project URL, PDF, legacy fragment, and an unknown URL (real 404).
- Test direct entry, refresh, Back/Forward, and primary navigation on desktop and mobile.
- Check keyboard focus, skip links, active-page indication, reduced motion, 200% zoom, and narrow screens.
- Confirm the YouTube frame takes no space before it loads and the direct YouTube link remains usable.
- Check page titles, descriptions, canonical URLs, sitemap, and preview indexing headers.
- Review the factual copy and refresh the resume before production approval.
- Record the current production deployment before release. Roll back through Pages to the prior deployment if needed, then revert the release commit to keep Git history aligned.
