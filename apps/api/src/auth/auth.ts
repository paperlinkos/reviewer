import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.CORS_ORIGIN ?? 'http://localhost:3000'],
  advanced: { defaultCookieAttributes: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' } },
  rateLimit: { enabled: true, window: 60, max: 10 },
});
