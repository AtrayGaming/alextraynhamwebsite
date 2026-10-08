# Radio Ready source audit and migration decision

Audited 2026-10-08. Source recovered through the owner's Sites connection. The original repository and its internal content are excluded from this new project.

## Findings from source inspection

- React 19 / Next 16 conventions wrapped in Sites-specific Vinext, Workers, and build scripts.
- One large client page owns content, all modes, scores, category selection and storage.
- Four learning modes and a reference view exist. Quick Match already excludes marked items, retries misses and ends with a completion state. Preserve that behavior.
- Flashcards support flipping and previous/next navigation. Preserve the interaction; distinguish self-review from demonstrated proficiency.
- Trainer mode reveals answers and supports two manually scored teams. Preserve facilitation; add resumable session records for signed-in trainers.
- Original shuffle uses random sorting, which is biased. Replace with Fisher–Yates.
- Small category pools fall back to the full deck when selecting scenario/trainer questions. Keep the question within its category; broaden only distractors if necessary.
- A single correct answer or manual mark becomes “mastered.” Replace that label with “cleared in this practice”; do not imply qualification.
- Only a list of marked items survives refresh; active queues, attempts, group scores and sessions are lost. Store complete versioned sessions.
- Database schema is empty. There is no content management, application role enforcement, publishing workflow, persistent account progress or analytics backend.
- Existing automated test checks rendered preview metadata only. It does not verify learning logic, security or persistence.
- Site uses owner-only access. Hosting access is distinct from an approved internal deployment.
- Original content is embedded in the client bundle. It cannot be migrated into a public application.

These are source-backed findings, not a claim that every original live browser interaction was tested. New-build behavior is covered separately in the test report.

## Reuse decision

Retain React/TypeScript, flashcard recall, finite retry sessions, category selection, scenario explanations and facilitator scoring. Reimplement these as small typed modules with tests. Do not copy operational data or its history, Sites authentication headers, deployment manifests, legacy localStorage, or original assets. Public content is newly authored: 45 fictional activity labels and 8 fictional visitor-choice scenarios, including atmosphere design with no weather thresholds or response procedures.

## Architecture

Next.js App Router on Cloudflare Workers through OpenNext, Better Auth for account/session handling, and Drizzle + libSQL for persistent content and session records. The owner selected Cloudflare on 2026-10-08. OpenNext retains the existing tested Next.js build; it is independently managed and has no Sites runtime dependency. Cloudflare currently recommends vinext for new Next.js deployments, while maintaining its OpenNext guide. Changing the application runtime again is unnecessary for this existing build.

Local Node development uses SQLite. Workers account services require a separately provisioned remote libSQL/Turso database. The transport must be compatible with Workers; local filesystem databases are rejected. D1 would consolidate storage under Cloudflare, but its transaction API differs from the tested libSQL adapter. It is a possible later migration, not an implemented or provisioned feature.

The guest demonstration can deploy without a database. No paid plan or upgrade is assumed; check the actual bundled Worker limits against the account plan before publishing. Your portfolio remains on Cloudflare Pages. The application goes to a separate Worker, with `radio.alextraynham.com` as the intended custom domain.

## Public/internal boundary

Separate deployments, databases, identities, secrets, content pipelines, repositories and analytics. The public build includes only invented content. Personal hosting is never the destination for an internal content import. A future company deployment requires a named sponsor, content owner, approved hosting and identity, permission to record training data, retention rules and security review. An email allowlist is not organizational authorization.

References: https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/ ; https://opennext.js.org/cloudflare/get-started ; https://opennext.js.org/cloudflare/howtos/env-vars ; https://better-auth.com/docs/adapters/drizzle .
