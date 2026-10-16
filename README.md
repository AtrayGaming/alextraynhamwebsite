# alextraynham.com

Alex Traynham's portfolio. Static HTML, CSS, and JavaScript; no framework, build step, or runtime dependency. Design: clean editorial — off-white background, black type, one blue accent, hairline rules instead of cards.

## Pages

- `index.html`: introduction, projects, a section on training tools Alex built (`#proof`, kept for anchor compatibility), four supporting project PDFs, About, experience, resume, and contact.
- `one-group-different-speeds.html`: independent Universal content proposal with script, text storyboard, thumbnail layout studies, distribution, and proposed evaluation.
- `youtube-content.html`: published creator work, packaging reflection, and a proposed analytics review.
- `guest-experience.html`: exploratory UCF research, operations perspective, and a new communication sample.
- Existing project PDFs and resume remain available at their original URLs.

Shared styles and navigation behavior live in `style.css` and `script.js`. `assets/alex-epic-universe.webp` is a smaller-format copy of the existing photo. The original remains in the repository. Old homepage anchors (`#projects`, `#content`, `#experience`, `#about`, `#contact`, `#top`) remain available.

## Preview and deployment

Serve this directory with any static HTTP server, for example `python3 -m http.server 8000`. The repository is connected to Cloudflare Pages. Pushing to `main` triggers the existing production deployment at https://alextraynham.com.

## Content maintenance

Keep independent concepts, academic work, published work, and future tests clearly labeled. Do not add performance claims without their source, date range, and methodology. Evergreen rule: do not publish statistics that change over time (counts of observations, training days or hours, trainees, commendations, points, or videos); describe the work in plain, durable terms instead. Headings and copy stay in Alex's plain first-person voice: no slogans or marketing taglines. The MBA wording currently describes an application; update it only when status changes. The resume PDF in this repository is an older version; the current one-page PDF must be swapped in through the GitHub web UI (same filename) because API uploads corrupt binary files. The Curse Tracker and Gamification PDFs remain in the repository at their original URLs but are no longer featured on the homepage.

For new case studies, use this sequence: opportunity, audience, objective, personal role, strategy, visible deliverables, distribution, measurement, limits, and reflection. Publish the evidence on the page; use PDFs as supporting detail.

When adding a page, add its canonical URL to `sitemap.xml`. Bump the CSS/JS query version after shared asset changes. Check internal links, narrow layouts, keyboard navigation, reduced motion, and the direct YouTube fallback. The player loads only on request and does not require site JavaScript for the external viewing link.
