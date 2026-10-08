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

Next.js App Router on Vercel, Better Auth for account/session handling, Drizzle + libSQL for persistent content and session records. Local development uses a real SQLite file through the same client; production uses a separately provisioned remote Turso/libSQL database. No filesystem database is allowed on Vercel. Auth and account features fail closed when configuration is absent; the public guest demo remains functional and explicitly device-local.

Cloudflare Workers with static assets and D1 is a strong alternative, especially where an account is already configured. It requires a Workers-compatible application/auth adapter and Cloudflare deployment access. Cloudflare Pages alone does not supply the requested backend. Vercel is connected here and keeps native Next support, previews and rollback straightforward. A personal portfolio demo may fit Vercel Hobby's personal/non-commercial scope; any expanded organizational or commercial use requires a fresh plan/terms assessment. Database costs depend on the selected provider plan and usage; no paid service is authorized by this implementation.

## Public/internal boundary

Separate deployments, databases, identities, secrets, content pipelines, repositories and analytics. The public build includes only invented content. Personal hosting is never the destination for an internal content import. A future company deployment requires a named sponsor, content owner, approved hosting and identity, permission to record training data, retention rules and security review. An email allowlist is not organizational authorization.

References checked during architecture selection: https://vercel.com/docs/plans/hobby ; https://developers.cloudflare.com/workers/static-assets/ ; https://developers.cloudflare.com/d1/platform/pricing/ ; https://better-auth.com/docs/adapters/drizzle ; https://better-auth.com/docs/concepts/rate-limit .
