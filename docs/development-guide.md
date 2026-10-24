# Development guide

Prerequisites: Node 22+ and pnpm 10+. Copy `.env.example` to `.env` and `apps/api/.env.example` to `apps/api/.env`; copy `apps/web/.env.example` to `apps/web/.env.local`. Replace local example passwords before using a shared machine. Docker Compose is optional; see [Docker-free local development](docker-free-development.md).

For Docker-free mode, use an existing local PostgreSQL instance, set the API environment as documented above, then run `pnpm install`, `pnpm db:generate`, and `pnpm db:migrate`. For optional Docker mode, run `docker compose up -d` before the Prisma commands. Start all active apps with `pnpm dev`, or start them individually with `pnpm --filter @vfp/web dev`, `pnpm --filter @vfp/api dev`, and `pnpm --filter @vfp/extension dev`. The dashboard is on port 3000 and API on 3001. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before a change is accepted.
