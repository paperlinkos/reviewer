# Development progress

## Complete

- Phase 00 foundation and Docker-free local development.
- Better Auth email/password sessions and protected API guard.
- Isolated authentication integration database and seven real authentication lifecycle tests.
- Shared real NestJS/Better Auth/PostgreSQL integration harness. It validates that
  `VFP_TEST_DATABASE_URL` names exactly `visual_feedback_test`, configures a
  test-only auth secret/origins before boot, tracks only test-created users and
  workspaces, and closes Prisma and Nest cleanly.
- Workspace API: authenticated create/list/rename, member list/add/role-change/
  removal, non-discoverability for non-members, and OWNER/ADMIN/MEMBER rules.
  Final-owner mutations use a transaction-scoped PostgreSQL advisory lock so
  concurrent removal/demotion cannot leave a workspace ownerless.
- Dedicated Vitest configurations keep unit and integration suites separate.
- Next.js workspace dashboard: authenticated workspace creation/listing/selection,
  member listing and email-based addition, owner role controls, administrator
  member removal, and server-returned permission/error messaging. The browser
  sends credentialed requests only; the API remains the authorization authority.

### Verified workspace milestone (2026-10-24)

- `VFP_TEST_DATABASE_URL=…visual_feedback_test… pnpm --filter @vfp/api run test:integration`:
  **12/12 passed** (7 authentication, 5 workspace). Workspace coverage includes
  atomic creation, member listing/addition, elevation restrictions, member
  removal, cross-workspace isolation, and simultaneous final-owner operations.
- `pnpm --filter @vfp/api run test`: **4/4 passed**.
- `pnpm --filter @vfp/api run typecheck`: passed.
- `pnpm --filter @vfp/api run build`: passed.
- `pnpm --filter @vfp/web run typecheck`: passed.
- `pnpm --filter @vfp/web run build`: passed (with the pre-existing Next ESLint
  configuration warning that its Next plugin is not detected).

## In progress

- Phase 01 tenant foundation: workspace membership, projects, and client invitations.

### Project and review-access continuation (2026-10-24)

- Implemented workspace-scoped project CRUD and archive status updates; OWNER and
  ADMIN manage projects while MEMBER may only list/read authorized projects.
- Implemented invitation issue/list/revoke. Tokens are 32-byte cryptographic
  values, stored only as SHA-256 hashes, and are returned only when first issued.
- Implemented public review-link redemption and an HttpOnly, SameSite=Lax client
  session cookie. A client session is bound to its invitation/project and is
  rejected when the session, invitation, or project expires/is revoked/archived.
  Invitation revocation invalidates all sessions issued from it.
- `pnpm --filter @vfp/api run test:integration`: **14/14 passed**. A real test
  covers project permissions/archive and invitation redemption/revocation.
- Final regression run: API typecheck passed, API unit tests **4/4 passed**,
  API integration **14/14 passed**, API build passed, web typecheck passed, and
  web build passed. The web build retains the existing ESLint Next-plugin warning.
- The Prisma `ClientReviewSession.updatedAt` model field was restored to match
  the previously applied non-destructive migration; Prisma Client regenerated.

The Next.js project dashboard and public `/review/[token]` redemption/landing
page are implemented. Remaining test coverage includes explicit expired-token,
cross-project client-session, and developer/client-route separation assertions.

### Extension foundation (2026-10-24)

- Added MV3 popup-controlled review-mode foundation. It uses only `activeTab`,
  `scripting`, and local settings storage; page code is dynamically injected
  after a popup action, not on every site visit.
- The active overlay provides temporary removable click pins and a lightweight
  sidebar. Disabling it removes both the overlay and capture-phase click
  listener. It has no microphone, screenshot, history, or broad host access.
- Extension typecheck and production build passed. Next: persist authorized pins
  through a project-scoped feedback API and build annotation workflows.

### Feedback API foundation (2026-10-24)

- Added additive `Feedback` and `FeedbackComment` persistence migration, applied
  to both `visual_feedback` and guarded `visual_feedback_test` without reset.
- Client feedback endpoints validate the HttpOnly review session and exact
  project ID; developer status/reply endpoints validate workspace membership.
  Client sessions cannot use developer routes or create feedback for another
  project. Coordinates are normalized to the inclusive 0–1 range.
- API typecheck passed after implementation. Pending: focused feedback API and
  extension-overlay tests, developer inbox UI, extension composer/persistence,
  and explicit-action annotation/media workflow.
- Feedback integration test now passes in the guarded suite: **15/15 total**.
  It validates redemption-backed client creation, normalized coordinate input,
  malformed input rejection (HTTP 400), cross-project rejection, developer
  list/status/reply operations. The shared HTTP filter was repaired so Zod
  request validation no longer returns an incorrect HTTP 500.
- Developer feedback inbox is implemented with real data, filters, detail,
  status/reply actions, and loading/empty/error states. Web typecheck and
  production build passed (the existing Next ESLint-plugin warning remains).
- Extension authorization is deliberately not implemented yet: extension-origin
  requests use `chrome-extension://<id>`, cannot share the web HttpOnly cookie,
  and current API CORS only trusts the web origin. Secure continuation requires
  a stable configured extension origin plus a one-time, short-lived,
  project-bound handoff exchange; persistent extension storage and URL/DOM
  credential transport remain prohibited.

### Continuation point

Implement workspace-scoped project CRUD, then client invitations and
review-session authorization APIs with integration coverage. The workspace API
and dashboard interface are implemented and verified.

## Deferred

- Extension visual review controls, feedback/annotation/media workflows, developer inbox, and embeddable widget.
