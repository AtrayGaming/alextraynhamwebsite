# Verification report

Verified locally on 2026-10-08 against an optimized Next.js production build. This is not a cloud production verification or a claim of complete security certification.

## Completed checks

- TypeScript check and production build passed.
- Five learning-engine tests passed: fictional catalog coverage, finite retry/completion, category and cleared-item filtering, scenario selection, and shuffle behavior.
- The real HTTP/database integration suite passed: administrator, reviewer, trainer and trainee sign-in; public signup blocked; anonymous access; trainee role restrictions; foreign-origin write rejection; per-user session isolation; persistent session reload; stale-write conflict; unpublished content hidden; separate-reviewer publishing; retirement; progress deletion; persistent trainer scoring; sign-out revocation; small-group analytics suppression.
- Eleven Chromium browser check groups passed: overview accessibility; deliberate miss/retry and finite completion; guest refresh persistence; flashcard reveal/review; scenario explanation; trainer scoring/presentation; mobile layout/accessibility; landing accessibility; case-study route/no client exceptions; keyboard skip navigation; real administrator login, draft editing and review submission.
- Axe WCAG 2 A/AA and 2.1 AA scans reported zero violations on the checked landing and desktop/mobile overview states. This is not a complete manual WCAG audit.
- Desktop 1440px and mobile 390px captures visually inspected. No horizontal overflow in the checked mobile screens. Reduced-motion preference enabled in the browser run.
- Production dependency audit reported zero known vulnerabilities after upgrading Next.js to 16.4.0. This reflects the registry advisory state at the time of the check.
- Public source was checked against original operational code labels: no matches. Original content, assets, database files, credentials and repository history are excluded from delivery. Fictional content is independently authored, not an encrypted or renamed operational lookup.

## Reproduce

Use Node 22.13+, `npm ci`, a local `.env.local`, `npm run db:setup`, and `node --env-file=.env.local --import tsx scripts/test-accounts.ts`. Then build, run `node scripts/run-verification.mjs` for real API/engine checks, and `npm run test:e2e` for browser checks after installing Playwright Chromium. Fixture credentials are random, local-only, and ignored by Git. Allow the login rate-limit window to expire between repeated full authentication runs; do not disable the production limit.

The test host required a separately installed Chromium executable because the standard Playwright download failed. The suite still used real Playwright browser interactions and axe. The GitHub clean-runner checks subsequently passed for the API suite and Chromium and Firefox browser flows. The WebKit job is configured but its result was pending when this report was written. No physical iOS or physical Android verification is claimed. CI evidence: https://github.com/AtrayGaming/alextraynhamwebsite/actions/runs/37801915178 and https://github.com/AtrayGaming/alextraynhamwebsite/actions/runs/37802275227 .

The separate portfolio case-study page also passed desktop/mobile axe checks, a narrow-layout overflow check, and navigation from the new homepage card.

## Release gates still open

- Cloudflare Worker deployment, public HTTPS/domain verification, and remote database provisioning.
- Remote database migration, cross-device persistence, production cookie behavior, backup/restore, and rollback exercise.
- WebKit verification completion, physical Safari/mobile coverage, a screen-reader/manual accessibility review, and realistic concurrent-load testing.
- Real-account enrollment and recovery policy, MFA/SSO for a broader audience, account retention/deletion procedure, and a privacy review before recording real learning activity.
- Analytics are bounded to 2,000 recent sessions and have basic cohort suppression. They are not an enterprise reporting warehouse or an anonymity guarantee.
- CSP currently permits inline scripts needed by the generated Next.js pages; adopt a nonce-based dynamic CSP if stronger script injection mitigation is required for a broader authenticated rollout.

The internal company deployment has not been approved or built. All tests use fictional content and local synthetic identities. No learning efficacy or adoption statistics have been measured.

## Cloudflare migration checks

The final pre-migration GitHub run exposed an intermittent Chromium skip-link focus assertion; the app now explicitly focuses the target, and the test waits for that focus instead of reading it immediately. Firefox and WebKit browser steps passed in that run, although fail-fast cancellation affected their overall job status. The workflow now disables fail-fast so every browser result is retained. OpenNext produced a Worker bundle after explicitly tracing the libSQL Workers files. A generated-output cleanup step prevents stale environment declarations on repeated builds. The first local runtime attempt was blocked by this execution environment’s network-interface enumeration restriction (`uv_interface_addresses`); GitHub now includes a separate Workers runtime job. No cloud deployment or remote-database verification is claimed.
