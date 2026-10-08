# Deployment, accounts, backups, and recovery

## Public release

This application is independent of ChatGPT Sites. It uses native Next.js, standard npm scripts, a lockfile, and explicit environment configuration. The app root is the directory containing this README and package.json; when hosted inside the portfolio repository, choose `apps/radio-ready` as Vercel Root Directory. Do not point Vercel at the static portfolio root.

1. Import the dedicated branch/repository into Vercel, select Next.js and Node 22 or newer. Run `npm ci`, `npm run typecheck`, `npm test`, and `npm run build` before a release. The build does not migrate a database.
2. Deploy the fictional guest experience first. With no account configuration, `/api/config` reports `accounts:false`, the sign-in view explains the limitation, and restricted APIs return 503. This is an intentional fail-closed state, not simulated authentication.
3. To activate persistent account features, provision a separate Turso/libSQL database after selecting an acceptable plan. Configure `DATABASE_URL` (remote `libsql://` or `https://`), `DATABASE_AUTH_TOKEN`, a random `BETTER_AUTH_SECRET` of at least 32 characters, `BETTER_AUTH_URL`, and `APP_ORIGIN` as server environment variables. Both origins must be the exact HTTPS production origin. Never use NEXT_PUBLIC_ for database credentials.
4. Apply `scripts/setup.ts` from a secure administrative environment with the database configuration. It creates the version-1 schema and seeds only fictional demo content. It is idempotent. Subsequent schema changes require new numbered migrations; do not edit deployed migration history.
5. Provision the initial administrator with `scripts/create-account.ts`. Pass `ACCOUNT_EMAIL`, `ACCOUNT_PASSWORD`, `ACCOUNT_ROLE=admin`, and an optional display alias `ACCOUNT_NAME` through the secure shell environment. No public sign-up route exists. Use a unique password, not fixture credentials. Create a second reviewer account because authors cannot publish their own drafts. Training access is role-based on the server; an authenticated identity without an access-role row is denied.
6. Test sign-in, cross-device session resume, role enforcement, content draft/review/publish, and recovery before enabling accounts for others. The public deployment remains fictional even when accounts are enabled.
7. Add `radio.alextraynham.com` to this Vercel project. Use the exact DNS target Vercel returns in Cloudflare. Check for an existing record before modifying it. Do not modify the apex portfolio domain or nameservers. Verify HTTPS, the domain status, and all routes after propagation.

## Internal deployment is a separate project

Do not import internal content into this database, repository, personal Vercel project, or public CMS. A company-owned deployment requires organizational approval, not merely a password or email allowlist.

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

Record each deployed Git SHA and schema version. Prefer additive database changes compatible with the previous application. Roll back the application to the prior tested Vercel deployment, then verify public routes, login, and a saved-session read. Application rollback does not undo database migrations or content publishing. Revert content through a new reviewed revision; never mutate a revision pinned by an existing practice session. For a breaking schema rollback, use a separately verified database restore and document any lost writes.

## Current external blockers

On 2026-10-08 the connected Vercel team was readable, but integration listing and project creation returned 403 permission errors. No authenticated local Vercel CLI was available. No project, deployment or DNS change was made. Publishing requires Vercel project-creation/deployment access (or an authorized browser setup), a remote database for accounts, and Cloudflare DNS access for the requested subdomain. No paid plan was purchased.
