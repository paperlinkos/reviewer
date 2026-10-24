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

### Continuation point

Implement workspace-scoped project CRUD, then client invitations and
review-session authorization APIs with integration coverage. The workspace API
and dashboard interface are implemented and verified.

## Deferred

- Extension visual review controls, feedback/annotation/media workflows, developer inbox, and embeddable widget.
