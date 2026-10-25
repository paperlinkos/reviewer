'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ProjectDashboard } from './project-dashboard';

type Role = 'OWNER' | 'ADMIN' | 'MEMBER';
type Workspace = { id: string; name: string; memberships: { role: Role }[] };
type Member = { userId: string; role: Role; user: { id: string; name: string; email: string } };
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.message === 'string' ? body.message : `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function WorkspaceDashboard() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selected, setSelected] = useState<Workspace>();
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { const next = await api<Workspace[]>('/api/v1/workspaces'); setWorkspaces(next); setSelected((current) => next.find((workspace) => workspace.id === current?.id) ?? next[0]); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load workspaces.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (!selected) { setMembers([]); return; } void api<Member[]>(`/api/v1/workspaces/${selected.id}/members`).then(setMembers).catch((reason) => setError(reason.message)); }, [selected]);
  async function create(event: FormEvent) { event.preventDefault(); try { const workspace = await api<Workspace>('/api/v1/workspaces', { method: 'POST', body: JSON.stringify({ name }) }); setName(''); await load(); setSelected(workspace); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create workspace.'); } }
  async function add(event: FormEvent) { event.preventDefault(); if (!selected) return; try { await api(`/api/v1/workspaces/${selected.id}/members`, { method: 'POST', body: JSON.stringify({ email }) }); setEmail(''); setMembers(await api<Member[]>(`/api/v1/workspaces/${selected.id}/members`)); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to add member.'); } }
  async function changeRole(member: Member, role: Role) { if (!selected) return; try { await api(`/api/v1/workspaces/${selected.id}/members/${member.userId}`, { method: 'PATCH', body: JSON.stringify({ role }) }); setMembers(await api<Member[]>(`/api/v1/workspaces/${selected.id}/members`)); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to change role.'); } }
  async function remove(member: Member) { if (!selected) return; try { await api(`/api/v1/workspaces/${selected.id}/members/${member.userId}`, { method: 'DELETE' }); setMembers(await api<Member[]>(`/api/v1/workspaces/${selected.id}/members`)); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to remove member.'); } }
  const role = selected?.memberships[0]?.role;
  return <><section className="workspace-grid"><aside className="workspace-list"><h2>Workspaces</h2><form onSubmit={create}><input value={name} onChange={(event) => setName(event.target.value)} placeholder="New workspace name" required maxLength={100}/><button>Create</button></form>{loading ? <p>Loading workspaces…</p> : workspaces.map((workspace) => <button className={workspace.id === selected?.id ? 'workspace active' : 'workspace'} key={workspace.id} onClick={() => setSelected(workspace)}>{workspace.name}<small>{workspace.memberships[0]?.role}</small></button>)}</aside><section className="workspace-detail"><p className="eyebrow">{role ?? 'Workspace'}</p><h2>{selected?.name ?? 'Create your first workspace'}</h2>{error && <p className="error" role="alert">{error}</p>}{selected && <><p className="muted">Membership is authorized by the API; these controls do not grant permissions client-side.</p>{(role === 'OWNER' || role === 'ADMIN') && <form onSubmit={add}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Registered member email" required/><button>Add member</button></form>}<div className="members">{members.map((member) => <article key={member.userId}><span><strong>{member.user.name}</strong><small>{member.user.email}</small></span><span>{role === 'OWNER' ? <select value={member.role} onChange={(event) => void changeRole(member, event.target.value as Role)}><option>OWNER</option><option>ADMIN</option><option>MEMBER</option></select> : <em>{member.role}</em>}{(role === 'OWNER' || (role === 'ADMIN' && member.role === 'MEMBER')) && <button onClick={() => void remove(member)}>Remove</button>}</span></article>)}</div></>}</section></section>{selected&&<ProjectDashboard workspaceId={selected.id} canManage={role==='OWNER'||role==='ADMIN'}/>}</>;
}
