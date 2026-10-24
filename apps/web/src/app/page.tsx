import { AppShell } from '../components/app-shell';
import { DashboardAuth } from '../components/dashboard-auth';
export default function Home() { return <DashboardAuth><AppShell><section className="hero"><p className="eyebrow">Dashboard</p><h1>Feedback, made actionable.</h1><p>Your authenticated workspace will appear here as Phase 01 continues.</p></section><section className="empty"><h2>Your workspace is ready</h2><p>Invite clients and collect visual feedback in the next product phase.</p></section></AppShell></DashboardAuth>; }
