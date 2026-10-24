import { AppShell } from '../components/app-shell';
import { DashboardAuth } from '../components/dashboard-auth';
import { WorkspaceDashboard } from '../components/workspace-dashboard';
export default function Home() { return <DashboardAuth><AppShell><section className="hero"><p className="eyebrow">Dashboard</p><h1>Feedback, made actionable.</h1><p>Create and manage your team workspace before sharing review projects.</p></section><WorkspaceDashboard /></AppShell></DashboardAuth>; }
