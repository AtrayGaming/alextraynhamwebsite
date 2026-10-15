# alextraynham.com

Alex Traynham's portfolio: entertainment operations, digital content, guest strategy and creative technology. A static, buildless website with no runtime dependencies.

## Pages

- `index.html`: selected work, three-perspective interaction, personality, experience and contact.
- `radio-ready.html`: learning-product case study with a real public-demo screenshot, finite-session decisions, physical testing and evidence boundaries.
- `one-group-different-speeds.html`: independent content proposal, script, interactive storyboard, packaging and proposed measurement.
- `youtube-content.html`: published creator sample, packaging critique and proposed analytics review. YouTube loads only when requested.
- `guest-experience.html`: exploratory UCF study, candid research limitations, operations context and a communication sample.

All original PDFs and the résumé remain at their original URLs. The résumé wording predates the current website; it is preserved rather than silently replaced with the invalid file on `proof-first-rebuild`.

## Design and decision records

- [PR and branch audit](docs/PR-AUDIT.md)
- [Creative direction and architecture](docs/CREATIVE-DIRECTION.md)
- [Before and after](docs/BEFORE-AFTER.md)
- [Verification and release instructions](docs/VERIFICATION.md)

## Editing

Content lives in the HTML files. Shared styling is in `style.css`; accessible progressive enhancements are in `script.js`. Add/change a case in HTML, keep its status and evidence limits explicit, and update `sitemap.xml`. Bump asset query versions after CSS/JS changes. Keep navigation/footer consistent across all five pages. Typography is system-based and requires no external font service.

Core links and content work without JavaScript. The perspective panels and storyboard progressively become selectable; print exposes every panel/beat. Respect `prefers-reduced-motion`. Never hide primary content behind scroll-triggered effects.

No internal Universal material belongs in this repository. All Radio Ready examples shown here are fictional public reconstructions. The actual application and its deployment remain on the `radio-ready-2` branch and `radio.alextraynham.com`; this static portfolio does not change the Worker or account services.

## Verification

```sh
python3 scripts/check-site.py
node --check script.js
```

The `Portfolio quality` workflow tests Chromium, Firefox and WebKit. Browser dependencies are CI-only and installed in `/tmp/portfolio-test-deps`, not shipped to visitors. See `scripts/browser-check.cjs` and the verification report for coverage and limits.

Outside managed workspaces, use any static HTTP server to preview the repository root. In a managed workspace, follow its supported preview tooling.

## Deployment

Cloudflare Pages project `alex-traynham` serves the repository root with no build command. **Pushing/merging to `main` deploys production.** The `ultimate-alex-portfolio` branch is for review; obtain Alex's approval before merging. Cloudflare's configured branch previews are separate from production. No DNS, production configuration, account secrets, or Radio Ready hosting changes are required.
