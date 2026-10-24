# Authentication architecture

Better Auth 1.7.12 is mounted by Nest at `/api/auth` through its Node handler and uses the existing PostgreSQL Prisma adapter. Email/password flows use Better Auth's vetted hashing and session lifecycle. Cookies are HttpOnly, SameSite=Lax, secure in production, and restricted to configured trusted origins. The Nest `AuthGuard` validates the Better Auth session server-side for protected API controllers; the web dashboard redirects unauthenticated or expired sessions to login.

Authentication requests are CORS-restricted to `CORS_ORIGIN` with credentials enabled. Better Auth validates trusted origins and applies a 10-request-per-minute rate limit. Tokens are never placed in URLs or browser persistent storage.
