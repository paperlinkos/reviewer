import { VersioningType, type INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Test } from '@nestjs/testing';
import { toNodeHandler } from 'better-auth/node';
import request from 'supertest';

const testOrigin = 'http://localhost:3000';
const testApiUrl = 'http://localhost:3001/api/auth';

export type TestIdentity = {
  email: string;
  password: string;
  name: string;
  ip: string;
};

export type RegisteredTestUser = TestIdentity & {
  id: string;
  cookies: string[];
  response: request.Response;
};

function testDatabaseUrl(): string {
  const value = process.env.VFP_TEST_DATABASE_URL;
  if (!value) throw new Error('VFP_TEST_DATABASE_URL is required for integration tests');
  let parsed: URL;
  try { parsed = new URL(value); } catch { throw new Error('VFP_TEST_DATABASE_URL must be a valid PostgreSQL URL'); }
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || parsed.pathname.replace(/^\//, '') !== 'visual_feedback_test') {
    throw new Error('Integration tests may connect only to the visual_feedback_test database');
  }
  return value;
}

export function sessionCookies(response: request.Response): string[] {
  const header = response.headers['set-cookie'];
  const values = Array.isArray(header) ? header : header ? [header] : [];
  return values.map((value) => value.split(';', 1)[0]).filter((value): value is string => Boolean(value));
}

export class IntegrationHarness {
  app!: INestApplication;
  prisma!: PrismaClient;
  private readonly url = testDatabaseUrl();
  private readonly createdUserIds = new Set<string>();
  private readonly createdWorkspaceIds = new Set<string>();

  async start() {
    // These assignments intentionally happen before importing modules that construct Better Auth.
    process.env.DATABASE_URL = this.url;
    process.env.BETTER_AUTH_SECRET = 'integration-test-secret-not-for-development-123456';
    process.env.BETTER_AUTH_URL = testApiUrl;
    process.env.CORS_ORIGIN = testOrigin;
    const [{ AppModule }, { auth }] = await Promise.all([
      import('../app.module'),
      import('../auth/auth'),
    ]);
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    this.app = module.createNestApplication();
    this.app.use('/api/auth', toNodeHandler(auth));
    this.app.setGlobalPrefix('api');
    this.app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    const { HttpErrorFilter } = await import('../common/http-exception.filter');
    this.app.useGlobalFilters(new HttpErrorFilter());
    await this.app.init();
    this.prisma = new PrismaClient({ datasources: { db: { url: this.url } } });
    await this.prisma.$connect();
  }

  identity(): TestIdentity {
    return {
      email: `integration-${crypto.randomUUID()}@example.test`,
      password: 'CorrectHorseBatteryStaple1!',
      name: 'Integration Developer',
      // Isolate Better Auth's rate-limit bucket for independently generated users.
      ip: `10.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`,
    };
  }

  async registerUser(identity = this.identity()): Promise<RegisteredTestUser> {
    const response = await request(this.app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('Origin', testOrigin)
      .set('X-Forwarded-For', identity.ip)
      .send({ name: identity.name, email: identity.email, password: identity.password });
    if (response.status !== 200) throw new Error(`Test registration failed with HTTP ${response.status}`);
    const persisted = await this.prisma.user.findUnique({ where: { email: identity.email } });
    if (!persisted) throw new Error('Registration did not create a user');
    this.createdUserIds.add(persisted.id);
    return { ...identity, id: persisted.id, response, cookies: sessionCookies(response) };
  }

  request() { return request(this.app.getHttpServer()); }

  authenticated(test: request.Test, cookies: string[]) { return test.set('Cookie', cookies); }

  trackWorkspace(id: string) { this.createdWorkspaceIds.add(id); }

  async close() {
    if (this.prisma) {
      if (this.createdWorkspaceIds.size) {
        await this.prisma.workspace.deleteMany({ where: { id: { in: [...this.createdWorkspaceIds] } } });
      }
      if (this.createdUserIds.size) {
        await this.prisma.user.deleteMany({ where: { id: { in: [...this.createdUserIds] } } });
      }
      await this.prisma.$disconnect();
    }
    if (this.app) await this.app.close();
  }
}
