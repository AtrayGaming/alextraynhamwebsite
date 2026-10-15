# Verification and release notes

## Completed locally

- All five HTML pages pass strict tag-nesting, unique-ID and one-H1 checks.
- 104 local references resolve, including page fragments, CSS, scripts, imagery, résumé and project documents.
- All eight old/current homepage destinations are retained: top, work, projects, content, about, experience, proof, contact.
- All PDF resources have a valid binary PDF signature; the broken abandoned-branch replacement was excluded.
- Canonical URLs, descriptions and social images are present on every page; Radio Ready is included in the sitemap.
- Shared JavaScript and the CI browser script pass Node syntax checks.
- The homepage plus shared CSS/JS and both image files is under the 400 KB raw transfer budget. Images are 157,640 and 68,672 bytes; the latter is lazy-loaded. No fonts or third-party code load at startup.
- `git diff --check` passes.

These structural and size checks are not a Lighthouse score or an accessibility certification.

## Browser verification

The managed workspace does not expose the required local browser-control skill. No local preview/browser result is claimed. The included GitHub Actions workflow runs Playwright in Chromium, Firefox and WebKit on isolated runners, with:

- All five pages at 320, 390, 768 and 1440 CSS pixels.
- Image decoding, horizontal overflow and client exceptions.
- Axe WCAG A/AA checks at 390 and 1440 pixels, with screenshots and JSON reports retained as workflow artifacts.
- Keyboard skip link, mobile menu, Escape focus and menu-link closure.
- All three perspective choices and all six storyboard beats.
- On-request YouTube iframe URL and direct fallback. The third-party player response is stubbed; actual playback is not claimed.
- Reduced-motion styles and complete no-JavaScript navigation/content.

**Passed on commit `fda6c0a3131884235b74d68bb56908f3d6f078be`: Chromium, Firefox and WebKit.** [CI run 38770058380](https://github.com/AtrayGaming/alextraynhamwebsite/actions/runs/38770058380).

All three jobs passed the complete suite: 20 page/viewport combinations per engine, 10 axe scans per engine with zero reported violations, image decoding, no client exceptions, navigation, all perspective/storyboard selections, reduced motion and no-JavaScript fallbacks. This is automated coverage, not a manual WCAG certification.

The first run caught a genuine 320px table overflow. Grid children now shrink correctly so tables scroll inside their own regions. Firefox also exposed a test assumption that rejected a valid cached 304 response; the test now accepts successful cache validation. Both were resolved before the passing run.

Desktop and mobile homepage screenshots were visually reviewed, as was the earlier desktop overview of the full homepage. The final screenshots of all four case studies still need a focused visual pass at the user's requested pause. Physical devices, screen-reader use, live YouTube playback, Google Drive authorization and real-user Core Web Vitals remain outside this automated suite.

The Cloudflare preview deployed successfully. An initial curl check returned HTTP 200 with `X-Robots-Tag: noindex` and the configured headers. Later Python HTTP requests to preview and Radio Ready returned 403; that client did not establish external-site availability, and no protection was bypassed. CI browser tests above run against the repository on isolated GitHub runners, not the live Cloudflare edge.

## Cloudflare release and rollback

Observed project: `alex-traynham`. Production branch: `main`. Build command and destination are empty; the root is served as a static site. Preview branches are enabled. A push to this dedicated branch should generate a preview, not replace `alextraynham.com`.

1. Review the PR, browser evidence and preview.
2. Obtain Alex's approval before merging. Merging into `main` triggers production automatically.
3. After an approved merge, check the homepage, four case URLs, résumé, menu and external demo on the custom domain.
4. If necessary, revert the merge on `main` to trigger the previous source version. Baseline commit: `434df2f6a84a4053fc408d5884c0c207400f6240`. Cloudflare also retains deployment history.

Do not merge the proof-first PR over this implementation. Coordinate the separate Radio Ready application PR independently: its Worker currently tracks `radio-ready-2`, which this work does not alter.

Documentation references: [Cloudflare preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/), [static headers](https://developers.cloudflare.com/pages/configuration/headers/), [Playwright accessibility checks](https://playwright.dev/docs/accessibility-testing).
