import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { IntegrationHarness, type RegisteredTestUser } from '../test/integration-harness';

const harness = new IntegrationHarness();

beforeAll(() => harness.start());
afterAll(() => harness.close());

async function createWorkspace(owner: RegisteredTestUser, name = 'Integration workspace') {
  const response = await harness.authenticated(
    harness.request().post('/api/v1/workspaces').send({ name }), owner.cookies,
  );
  expect(response.status).toBe(201);
  harness.trackWorkspace(response.body.id);
  return response.body as { id: string; name: string; ownerId: string };
}

async function addMember(owner: RegisteredTestUser, workspaceId: string, user: RegisteredTestUser) {
  return harness.authenticated(
    harness.request().post(`/api/v1/workspaces/${workspaceId}/members`).send({ email: user.email }), owner.cookies,
  );
}

describe('workspace management', () => {
  it('creates a workspace atomically, makes its creator owner, and lists only that member workspace', async () => {
    const owner = await harness.registerUser();
    const workspace = await createWorkspace(owner, 'Owner workspace');
    expect(workspace.ownerId).toBe(owner.id);
    const list = await harness.authenticated(harness.request().get('/api/v1/workspaces'), owner.cookies);
    expect(list.status).toBe(200);
    expect(list.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: workspace.id, memberships: [expect.objectContaining({ role: 'OWNER' })] }),
    ]));
    const members = await harness.authenticated(harness.request().get(`/api/v1/workspaces/${workspace.id}/members`), owner.cookies);
    expect(members.status).toBe(200);
    expect(members.body).toEqual(expect.arrayContaining([expect.objectContaining({ userId: owner.id, role: 'OWNER' })]));
  });

  it('adds members and permits only owners to grant elevated roles', async () => {
    const owner = await harness.registerUser();
    const member = await harness.registerUser();
    const workspace = await createWorkspace(owner);
    expect((await addMember(owner, workspace.id, member)).status).toBe(201);
    const promote = await harness.authenticated(
      harness.request().patch(`/api/v1/workspaces/${workspace.id}/members/${member.id}`).send({ role: 'ADMIN' }), owner.cookies,
    );
    expect(promote.status).toBe(200);
    expect(promote.body.role).toBe('ADMIN');
    const other = await harness.registerUser();
    expect((await addMember(member, workspace.id, other)).status).toBe(201);
    const adminPromotion = await harness.authenticated(
      harness.request().patch(`/api/v1/workspaces/${workspace.id}/members/${other.id}`).send({ role: 'ADMIN' }), member.cookies,
    );
    expect(adminPromotion.status).toBe(403);
  });

  it('does not expose or modify a workspace for a non-member', async () => {
    const owner = await harness.registerUser();
    const outsider = await harness.registerUser();
    const workspace = await createWorkspace(owner);
    const list = await harness.authenticated(harness.request().get('/api/v1/workspaces'), outsider.cookies);
    expect(list.status).toBe(200);
    expect(list.body.find((item: { id: string }) => item.id === workspace.id)).toBeUndefined();
    expect((await harness.authenticated(harness.request().get(`/api/v1/workspaces/${workspace.id}/members`), outsider.cookies)).status).toBe(404);
    expect((await harness.authenticated(
      harness.request().post(`/api/v1/workspaces/${workspace.id}/members`).send({ email: outsider.email }), outsider.cookies,
    )).status).toBe(404);
  });

  it('lets an admin remove an ordinary member but not an owner or another administrator', async () => {
    const owner = await harness.registerUser();
    const admin = await harness.registerUser();
    const member = await harness.registerUser();
    const workspace = await createWorkspace(owner);
    expect((await addMember(owner, workspace.id, admin)).status).toBe(201);
    expect((await addMember(owner, workspace.id, member)).status).toBe(201);
    expect((await harness.authenticated(
      harness.request().patch(`/api/v1/workspaces/${workspace.id}/members/${admin.id}`).send({ role: 'ADMIN' }), owner.cookies,
    )).status).toBe(200);
    expect((await harness.authenticated(harness.request().delete(`/api/v1/workspaces/${workspace.id}/members/${member.id}`), admin.cookies)).status).toBe(200);
    expect((await harness.authenticated(harness.request().delete(`/api/v1/workspaces/${workspace.id}/members/${owner.id}`), admin.cookies)).status).toBe(403);
  });

  it('protects the final owner, including simultaneous removal and demotion requests', async () => {
    const owner = await harness.registerUser();
    const workspace = await createWorkspace(owner);
    const [remove, demote] = await Promise.all([
      harness.authenticated(harness.request().delete(`/api/v1/workspaces/${workspace.id}/members/${owner.id}`), owner.cookies),
      harness.authenticated(
        harness.request().patch(`/api/v1/workspaces/${workspace.id}/members/${owner.id}`).send({ role: 'MEMBER' }), owner.cookies,
      ),
    ]);
    expect([remove.status, demote.status]).toEqual([409, 409]);
    const owners = await harness.prisma.workspaceMembership.count({ where: { workspaceId: workspace.id, role: 'OWNER' } });
    expect(owners).toBe(1);
  });
});
