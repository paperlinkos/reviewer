# Development progress

## Complete

- Phase 00 foundation and Docker-free local development.
- Better Auth email/password sessions and protected API guard.
- Isolated authentication integration database and seven real authentication lifecycle tests.

## In progress

- Phase 01 tenant foundation: workspace membership, projects, and client invitations.

### Workspace continuation point

Membership endpoints are implemented and API typecheck passed. Next required action: replace `apps/api/src/workspaces/workspaces.integration.spec.ts` placeholder with real tests that reuse/extract the guarded Better Auth harness from `auth.integration.spec.ts`; cover creation, listing, add/change/remove, cross-workspace rejection, final-owner protection, and concurrent owner mutations before enabling it in `test:integration`.

## Deferred

- Extension visual review controls, feedback/annotation/media workflows, developer inbox, and embeddable widget.
