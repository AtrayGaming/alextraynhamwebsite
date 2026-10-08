# alextraynham.com

Alex Traynham's digital content and marketing portfolio. Static HTML, CSS, and JavaScript; no framework, build step, or runtime dependency.

## Pages

- `index.html`: positioning, selected work, supporting projects, About, experience, resume, and contact.
- `one-group-different-speeds.html`: independent Universal content proposal with script, text storyboard, thumbnail layout studies, distribution, and proposed evaluation.
- `youtube-content.html`: published creator work, packaging reflection, and a proposed analytics review.
- `guest-experience.html`: exploratory UCF research, operations perspective, and a new communication sample.
- Existing project PDFs and resume remain available at their original URLs.

Shared styles and navigation behavior live in `style.css` and `script.js`. `assets/alex-epic-universe.webp` is a smaller-format copy of the existing photo. The original remains in the repository. Old homepage anchors (`#projects`, `#content`, `#experience`, `#about`, `#contact`, `#top`) remain available.

## Preview and deployment

Serve this directory with any static HTTP server, for example `python3 -m http.server 8000`. The repository is connected to Cloudflare Pages. Pushing to `main` triggers the existing production deployment at https://alextraynham.com.

## Content maintenance

Keep independent concepts, academic work, published work, and future tests clearly labeled. Do not add performance claims without their source, date range, and methodology. The MBA wording currently describes an application; update it only when status changes. The existing resume PDF has been retained and should be aligned with the new degree wording and current career focus in a separate resume update.

For new case studies, use this sequence: opportunity, audience, objective, personal role, strategy, visible deliverables, distribution, measurement, limits, and reflection. Publish the evidence on the page; use PDFs as supporting detail.

When adding a page, add its canonical URL to `sitemap.xml`. Bump the CSS/JS query version after shared asset changes. Check internal links, narrow layouts, keyboard navigation, reduced motion, and the direct YouTube fallback. The player loads only on request and does not require site JavaScript for the external viewing link.
