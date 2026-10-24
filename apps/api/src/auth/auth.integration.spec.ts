import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { IntegrationHarness, sessionCookies } from '../test/integration-harness';

const harness = new IntegrationHarness();

beforeAll(() => harness.start());
afterAll(() => harness.close());

describe('Better Auth registration', () => {
  it('registers a developer and persists a hashed password', async () => {
    const result = await harness.registerUser();
    const user = await harness.prisma.user.findUnique({ where: { id: result.id }, include: { accounts: true } });
    expect(user?.accounts[0]?.password).toBeTruthy();
    expect(user?.accounts[0]?.password).not.toBe(result.password);
  });
});

describe('Better Auth login and sessions', () => {
  it('logs in a registered developer and establishes a session', async () => {
    const user = await harness.registerUser();
    const response = await harness.request().post('/api/auth/sign-in/email')
      .set('Origin', 'http://localhost:3000').send({ email: user.email, password: user.password });
    expect(response.status).toBe(200);
    expect(sessionCookies(response).length).toBeGreaterThan(0);
  });

  it('rejects an incorrect password without creating an authenticated session', async () => {
    const user = await harness.registerUser();
    const response = await harness.request().post('/api/auth/sign-in/email')
      .set('Origin', 'http://localhost:3000').send({ email: user.email, password: 'wrong-password' });
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(sessionCookies(response)).toHaveLength(0);
  });

  it('persists a registration session across a separate protected API request', async () => {
    const user = await harness.registerUser();
    const response = await harness.authenticated(harness.request().get('/api/v1/auth/session'), user.cookies);
    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(user.email);
  });

  it('rejects unauthenticated protected API access', async () => {
    const response = await harness.request().get('/api/v1/auth/session');
    expect(response.status).toBe(401);
    expect(response.body.user).toBeUndefined();
  });

  it('invalidates a session server-side on logout', async () => {
    const user = await harness.registerUser();
    expect((await harness.authenticated(harness.request().get('/api/v1/auth/session'), user.cookies)).status).toBe(200);
    expect((await harness.authenticated(harness.request().post('/api/auth/sign-out').set('Origin', 'http://localhost:3000'), user.cookies)).status).toBe(200);
    expect((await harness.authenticated(harness.request().get('/api/v1/auth/session'), user.cookies)).status).toBe(401);
  });

  it('rejects an explicitly expired test-created session', async () => {
    const user = await harness.registerUser();
    await harness.prisma.session.updateMany({ where: { userId: user.id }, data: { expiresAt: new Date(Date.now() - 60_000) } });
    expect((await harness.authenticated(harness.request().get('/api/v1/auth/session'), user.cookies)).status).toBe(401);
  });
});
