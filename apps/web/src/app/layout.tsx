import type { Metadata } from 'next';
import './tailwind.css';
import './styles.css';
export const metadata: Metadata = { title: 'Visual Feedback Platform', description: 'A calmer way to turn feedback into progress.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><body>{children}</body></html>; }
