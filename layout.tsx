import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Olmex AI — One AI. Every Possibility.', description: 'Your AI workspace for conversations, projects, memory and developer tools.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
