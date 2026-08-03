import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/components/providers';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from '@/components/ui/sonner';
import { THEME_STORAGE_KEY } from '@/utils/constants';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'DotaPulse — Dota 2 Analytics',
  description:
    'Real-time Dota 2 analytics powered by OpenDota. Explore hero stats, player profiles, match breakdowns, pro matches, and the live meta.',
  keywords: [
    'Dota 2',
    'analytics',
    'OpenDota',
    'hero stats',
    'match analysis',
    'pro matches',
    'meta',
  ],
  authors: [{ name: 'DotaPulse' }],
  openGraph: {
    title: 'DotaPulse — Dota 2 Analytics',
    description:
      'Real-time Dota 2 analytics powered by OpenDota. Heroes, players, matches, and the live meta.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DotaPulse — Dota 2 Analytics',
    description:
      'Real-time Dota 2 analytics powered by OpenDota. Heroes, players, matches, and the live meta.',
  },
};

export const viewport = {
  themeColor: '#0b0f1a',
  width: 'device-width',
  initialScale: 1,
};

const themeInitScript = `
(function() {
  try {
    var key = '${THEME_STORAGE_KEY}';
    var stored = localStorage.getItem(key);
    var mode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'dark';
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = mode === 'dark' || (mode === 'system' && systemDark);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="relative min-h-screen overflow-x-hidden bg-background font-sans text-foreground">
        <div className="pointer-events-none fixed inset-0 z-0 bg-gaming-radial" />
        <div className="pointer-events-none fixed inset-0 z-0 bg-grid opacity-30" />
        <QueryProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="bottom-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
