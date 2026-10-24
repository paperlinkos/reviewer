# Architecture

The repository is a pnpm/Turborepo modular monolith. `apps/web` is the Next.js dashboard; `apps/api` is the NestJS HTTP API; `apps/extension` is the Manifest V3 WXT extension. Shared contracts, validation, API transport helpers, UI primitives, and annotation models live in `packages/`.

The API is versioned by URI (`/api/v1`). PostgreSQL is the system of record. In Docker-free development, a private local-filesystem adapter implements the media-storage boundary; S3-compatible storage remains the production-oriented replacement behind the same interface. The backend, not clients, will authorize every workspace, project, feedback, and media action. Better Auth was deliberately deferred: its NestJS/extension integration and session/token flow need an explicit Phase 01 design validation before adoption.
