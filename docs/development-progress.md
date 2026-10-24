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

### Verified workspace milestone (2026-10-24)

- `VFP_TEST_DATABASE_URL=…visual_feedback_test… pnpm --filter @vfp/api run test:integration`:
  **12/12 passed** (7 authentication, 5 workspace). Workspace coverage includes
  atomic creation, member listing/addition, elevation restrictions, member
  removal, cross-workspace isolation, and simultaneous final-owner operations.
- `pnpm --filter @vfp/api run test`: **4/4 passed**.
- `pnpm --filter @vfp/api run typecheck`: passed.
- `pnpm --filter @vfp/api run build`: passed.

## In progress

- Phase 01 tenant foundation: workspace membership, projects, and client invitations.

### Continuation point

Implement the authenticated Next.js workspace creation, selection, and member
management interface using the verified API. Then add workspace-scoped project
CRUD and client-invitation/review-session APIs and their integration coverage.

## Deferred

- Extension visual review controls, feedback/annotation/media workflows, developer inbox, and embeddable widget.
