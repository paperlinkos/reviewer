'use client';
import { useEffect } from 'react';
import { authClient } from '../lib/auth-client';
export function DashboardAuth({ children }: { children: React.ReactNode }) { const { data, isPending } = authClient.useSession(); useEffect(() => { if (!isPending && !data?.user) location.replace('/login'); }, [data, isPending]); if (isPending) return <main className="shell">Loading your session…</main>; if (!data?.user) return <main className="shell">Redirecting to sign in…</main>; return <>{children}<button type="button" onClick={async () => { await authClient.signOut(); location.assign('/login'); }}>Sign out</button></>; }
