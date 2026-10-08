# Radio Ready 2.0

A standalone learning application and public portfolio demonstration by Alex Traynham. Native Next.js, React, TypeScript, Better Auth, Drizzle and libSQL, deployed through OpenNext on Cloudflare Workers. No ChatGPT Sites runtime or hosting dependency.

All included content is newly invented: 45 community-festival concepts and eight scenarios. Nothing in this repository is an operational reference.

## Run locally

Requires Node 22.13+ and npm.

```sh
npm ci
cp .env.example .env.local
# Set a unique BETTER_AUTH_SECRET (32+ random characters) in .env.local.
npm run db:setup
npm run dev
```

Open http://localhost:3000. The guest demo works without any database configuration. For local account features, complete the environment file, apply the schema and use `npm run account:create` with the ACCOUNT_EMAIL, ACCOUNT_PASSWORD and ACCOUNT_ROLE environment variables set securely. Public signup is disabled. Never commit environment files, database files or test credentials.

## Implemented

- Public showcase, practice studio, and evidence-based case study with portfolio links.
- Learn, finite Quick Match, explained scenarios and trainer facilitation.
- Category filtering, missed-item review, presentation view, team scoring, and guest resume.
- Actual database-backed authentication and account session history when configured.
- Server-enforced trainee/trainer/admin roles, ownership checks and stale-write conflicts.
- Content editing, immutable revisions, draft/review/publish workflow and separate reviewer.
- Aggregate metrics derived from actual records with small-group suppression.
- Accessible controls, reduced motion, responsive layouts and self-hosted fonts.

## Test and build

```sh
npm run typecheck
npm test
npm run build
```

`npm test` runs the pure engine tests; API tests skip explicitly unless TEST_BASE_URL is set. To run the real local account integration suite:

```sh
node --env-file=.env.local --import tsx scripts/test-accounts.ts
node scripts/run-verification.mjs
```

This creates random local-only fixture credentials under ignored `.data/`. Never run fixture setup against a remote database. For browser testing, install Playwright Chromium, then run `npm run test:e2e` after building. Set CHROMIUM_EXECUTABLE only when using a separately installed test browser. Additional engines can be selected with BROWSER=firefox or BROWSER=webkit once installed. See docs/VERIFICATION.md for checks actually completed and limitations.

## Structure

- `app/`: routes, layout, style system and API endpoints.
- `components/`: interactive workspace and content editor.
- `lib/`: typed content, learning engine and API client.
- `server/`: database, auth and request authorization.
- `scripts/`: explicit schema/account administration and verification.
- `tests/`: learning logic and real HTTP/database integration tests.
- `docs/`: source audit, design, deployment, internal boundary and verification.

## Deployment status

Cloudflare Workers is the deployment target, using `wrangler.jsonc` and a pinned OpenNext adapter. Run `npm run build:cloudflare`, `npm run preview:cloudflare` for a local Workers preview, and `npm run deploy:cloudflare` only after selecting the correct Cloudflare account. The app root is `apps/radio-ready`; the portfolio root remains a separate Pages site.

The fictional public demonstration is live at **https://radio.alextraynham.com** on Cloudflare Workers. Workers Builds deploys the `radio-ready-2` GitHub branch automatically. The portfolio root remains a separate Pages project. The local Wrangler CLI is not authenticated; use the connected build pipeline or log in explicitly for local deployment.

Account services are deliberately disabled until a remote libSQL database and runtime authentication secrets are provisioned and verified. Guest progress is stored only in the visitor's browser. No company content belongs in this deployment.

See [the audit](docs/AUDIT.md), [design decisions](docs/DESIGN.md), and [deployment/operations guide](docs/OPERATIONS.md). The original internal project is deliberately excluded. Internal use requires a separate company-approved environment, identity system, content owner and data policy.
