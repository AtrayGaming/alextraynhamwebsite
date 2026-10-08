# Cloudflare deployment, accounts, backups, and recovery

## Public release

The app root is `apps/radio-ready`. Its Worker is separate from the existing static portfolio Pages project. Keep the portfolio build configuration unchanged. The independent source branch is `radio-ready-2` until the reviewed changes are merged.

1. Verify the intended Cloudflare account and existing Workers/DNS records. The configured Worker name is `radio-ready`. Check for a collision before deployment. Do not use temporary preview accounts as the permanent home.
2. In a clean checkout without local environment files, run `npm ci`, `npm run typecheck`, the appropriate tests, and `npm run build:cloudflare`. This uses pinned OpenNext/Wrangler versions and does not run database migrations. Never commit `.env*`, `.dev.vars*`, `.open-next`, `.wrangler`, database files, or local test credentials.
3. Run `npm run preview:cloudflare` to test the generated code in the Workers runtime. Check the actual Worker compressed size against the current account limits. Obtain authorization before any paid-plan upgrade.
4. Use Workers Builds connected to the GitHub repository, with root directory `apps/radio-ready`, build command `npm run build:cloudflare`, and deploy command `npm run deploy:cloudflare`. Select the reviewed branch explicitly; the app does not exist in main yet. Alternatively deploy the already tested local output using the same deploy command after Wrangler login. Initial publication can enable the guest demonstration only.
5. With no account configuration, `/api/config` returns `accounts:false`; the sign-in view explains the limitation and restricted APIs return 503. No fake authentication or persistence is shown. Guest sessions stay in the visitor's browser.
6. For account features, provision a separate remote libSQL database. Add `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, and a random `BETTER_AUTH_SECRET` (at least 32 characters) as Worker runtime secrets, with `APP_ORIGIN` and `BETTER_AUTH_URL` set to the exact HTTPS deployment origin. Never use NEXT_PUBLIC_ for credentials. Do not supply production secrets to PR builds. Runtime secrets are distinct from build configuration; deployment preserves dashboard variables with `--keep-vars`.
7. Apply `scripts/setup.ts` in a secured administrative Node environment connected to the remote database. It creates schema v1 and seeds invented content only. Provision administrator accounts through `scripts/create-account.ts`, using secure environment variables for `ACCOUNT_EMAIL`, `ACCOUNT_PASSWORD`, and `ACCOUNT_ROLE`. Create a separate reviewer because authors cannot publish their own drafts. Public signup remains disabled.
8. Verify remote sign-in, cross-device resume, role/ownership enforcement, content review, secure cookies and backup recovery before enabling accounts for others. Local SQLite verification alone does not prove that the remote deployment works.
9. After verifying the Worker preview, add `radio.alextraynham.com` as a Worker Custom Domain in the same account as the zone. Check for an existing hostname record first. Do not change the apex portfolio domain or nameservers. Verify HTTPS and all public routes after propagation; update both auth origins if accounts are enabled.

## Internal deployment is a separate project

Do not import internal content into this database, repository, personal Cloudflare Worker, or public CMS. A company-owned deployment requires organizational approval, not merely a password or email allowlist.

The approval packet should identify: sponsor and content owner; data classification; permitted audience; hosting and identity owners; whether practice records may be collected; retention and deletion; accessibility requirements; support ownership; incident reporting; and content-review responsibility. Use synthetic content throughout evaluation.

Two paths to evaluate with the company:
- Company-approved web hosting with Microsoft Entra ID and an independently approved database. Reuse the interaction designs and pure learning engine, then replace identity and storage adapters in a separate company repository. This repository does not include an Entra integration and is not approved for that use.
- Power Apps with Dataverse or a restricted SharePoint List, subject to licensing and security review. The React app cannot simply be uploaded as a canvas app; the screens and session rules would need to be implemented in that platform. Teams or SharePoint embedding does not make external hosting approved.

## Data and privacy

Guest sessions are device-local and do not upload analytics. Public content can be read without an account. Signed-in sessions store an account identifier, version-pinned fictional items, attempts, completion state, timestamps, and optional facilitator scores. Auth stores email, display alias, password hash, expiring sessions and limited login metadata. No employee ID, venue, official assessment result, or personal demographic information is requested.

Aggregate analytics use at most the 2,000 most recently updated recall/scenario sessions; the interface labels that scope. Add indexed reporting tables or incremental aggregation before a larger rollout. Aggregate analytics require five distinct learners before results are shown. This is a basic small-group suppression rule, not a guarantee of anonymity; further organizational privacy review is required for internal use. Practice metrics exclude flashcard self-reviews and manual team scores. Correct answer events are graded on the server; they do not certify competence.

`DELETE /api/progress` deletes only the signed-in user's practice records. Account deletion/deactivation is an administrative operation. To revoke access, delete the access-role row and sessions for that user in the secured database; then complete deletion according to the approved retention policy. Password recovery is administrative only; there is no email reset service. For broader rollout, add verified-email enrollment, recovery, MFA or approved SSO before onboarding real staff.

## Retention

A public pilot should review practice records at 90 days and remove unused accounts. Choose an explicit retention policy before collection at scale; this release does not silently delete records on a timer. Better Auth enforces session expiration (8 hours). Periodically prune expired authentication sessions, verification records and rate-limit records. Audit records document publishing actions without recording original request bodies.

## Backups and restore

Local development uses `.data/`, excluded from Git. Stop writes before copying a local SQLite file, or use SQLite's backup API. Never copy a live file blindly when WAL is active. Keep backups encrypted and access-restricted; they contain authentication data.

For production, enable the database provider's backup/recovery option under the chosen plan. Verify actual retention and restore support rather than assuming it is included. Before schema changes: create a backup, record the schema and application versions, and restore into an isolated database to test recovery. For an incident: disable account traffic, restore to an isolated target, verify counts and constraints, rotate affected secrets if necessary, switch the database connection, verify permissions, and re-enable access. A production backup restore has not been tested here because no cloud database has been provisioned.

## Deployment rollback

Record each deployed Git SHA and schema version. Prefer additive database changes compatible with the previous application. Roll back the application to the prior tested Cloudflare Worker version, then verify public routes, login, and a saved-session read. Application rollback does not undo database migrations or content publishing. Revert content through a new reviewed revision; never mutate a revision pinned by an existing practice session. For a breaking schema rollback, use a separately verified database restore and document any lost writes.

## Live deployment: 2026-10-08

The fictional guest app is live at https://radio.alextraynham.com, served by the `radio-ready` Worker. The workers.dev URL is https://radio-ready.traynham.workers.dev. The `alextraynham.com` portfolio Pages configuration, apex DNS, and nameservers were left unchanged.

- Worker tag: `55140aa9c18b478f895f5a443a55bb4e`.
- Build trigger: `638a938d-adf2-4751-a80b-627595564b40`, named Radio Ready public demo.
- Source: `AtrayGaming/alextraynhamwebsite`, branch `radio-ready-2`, root `/apps/radio-ready`.
- Build/deploy: `npm run build:cloudflare` / `npm run deploy:cloudflare`.
- Build environment: Node 22.22.3; Next telemetry disabled. No account/database credentials provisioned.
- Custom domain ID: `65677b05266cdee9dbe27b85088b73b01e37b356`. The hostname is also committed in Wrangler configuration. Version-specific preview URLs are disabled.
- The build references an existing Cloudflare-managed token labeled `x402-proxy-template build token`. Its secret was neither retrieved nor copied. Prefer a dedicated Radio Ready build token at the next credential-maintenance review. No credentials were added to GitHub or this repository.
- The initial GitHub-access failure was resolved by reconnecting the installation. Build `6c19d030-c4b5-4c52-9cdf-ee831b51a5c9` successfully published commit `3257e0d4fcfa135f0ed4fd36bfb72914d1aa19b8`. The source-controlled custom-domain configuration follows in commit `89227f780af5cb652db1bb506b891a758208d7a0`.

All three public routes respond over HTTPS, all 53 served items are fictional, `/api/config` reports accounts disabled, and restricted session access returns 503. Guest progress stays in the browser. No remote database or account credentials are configured. No paid plan or service was purchased.

The `Radio Ready live demo` workflow tests both live origins without accounts or server-side writes. The Worker-origin browser suite passes; the custom-domain browser is challenged by existing Cloudflare bot protection. Keep this distinction visible in test reports and complete a normal human-browser check of the custom domain. It can be run manually after it reaches the default branch. Existing source CI separately tests API permissions against isolated synthetic accounts, all three browser engines, and the Workers runtime.

The portfolio integration is prepared in draft PR #1 and is not merged into the portfolio homepage. Keep the app's deployment branch set explicitly until a deliberate migration to main. For a rollback, choose a prior successful version in Cloudflare, verify the public routes, and align the source branch before the next automated deployment.

## OpenNext compatibility

The pinned OpenNext 1.20.9 build omits Next 16.4's `preview-props.json` manifest. `scripts/patch-opennext.mjs` applies a narrow, idempotent, version-checked glob fix before the Cloudflare build; see upstream `opennextjs/opennextjs-cloudflare#1356`. An adapter upgrade must review/remove this patch and rerun the Workers runtime tests. It does not alter application training content or security checks.

Account persistence still requires a separate remote libSQL database and verification. Internal company training still requires a separately approved organizational deployment.
