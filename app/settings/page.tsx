'use client';

import { motion } from 'framer-motion';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Trash2,
  Server,
  Database,
  Heart,
  Github,
  Activity,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTheme } from '@/hooks/use-theme';
import { useFavorites } from '@/hooks/use-favorites';
import { useHealth } from '@/hooks/use-opendota-queries';
import { FAVORITES_STORAGE_KEY, THEME_STORAGE_KEY } from '@/utils/constants';
import { cn } from '@/lib/utils';
import type { ThemeMode } from '@/types';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { value: 'light', label: 'Light', icon: Sun, desc: 'Bright theme for daytime' },
  { value: 'dark', label: 'Dark', icon: Moon, desc: 'Default gaming aesthetic' },
  { value: 'system', label: 'System', icon: Monitor, desc: 'Follow your OS setting' },
];

export default function SettingsPage() {
  const { theme, setTheme, mounted } = useTheme();
  const { favorites, clearAll, hydrated } = useFavorites();
  const { data: health } = useHealth();

  const clearAllData = () => {
    try {
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
      localStorage.removeItem(THEME_STORAGE_KEY);
      window.dispatchEvent(new Event('dotapulse:favorites-changed'));
    } catch {
      // ignore
    }
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Customize DotaPulse — theme, data, and app information."
        icon={Settings}
      />

      {/* Theme */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sun className="h-5 w-5 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>Choose how DotaPulse looks. Dark mode is recommended.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = mounted && theme === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  whileHover={{ y: -2 }}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors',
                    active
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted/20 hover:border-primary/40'
                  )}
                  aria-pressed={active}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-primary" />
            Local Data
          </CardTitle>
          <CardDescription>
            Favorites and preferences are stored in your browser. No account needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium text-foreground">Saved Favorites</p>
                <p className="text-xs text-muted-foreground">
                  {hydrated ? `${favorites.length} item${favorites.length !== 1 ? 's' : ''}` : 'Loading…'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={favorites.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear favorites
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground">Reset all data</p>
                <p className="text-xs text-muted-foreground">Clears favorites and theme, then reloads.</p>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={clearAllData}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API status */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Server className="h-5 w-5 text-primary" />
            API Status
          </CardTitle>
          <CardDescription>Live status of the OpenDota API powering this app.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-3 w-3 items-center justify-center rounded-full',
                  health?.status === 'ok' ? 'bg-success animate-pulse-glow' : 'bg-warning'
                )}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {health ? (health.status === 'ok' ? 'Operational' : 'Degraded') : 'Checking…'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {health ? `${health.server_count ?? 0} servers online` : 'Connecting to OpenDota'}
                </p>
              </div>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">About DotaPulse</CardTitle>
          <CardDescription>
            A Dota 2 analytics dashboard built with Next.js, TanStack Query, Recharts, and Framer Motion. Data provided by the OpenDota API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="rounded-md bg-muted/40 px-2.5 py-1">Next.js 15</span>
            <span className="rounded-md bg-muted/40 px-2.5 py-1">React 19</span>
            <span className="rounded-md bg-muted/40 px-2.5 py-1">TypeScript</span>
            <span className="rounded-md bg-muted/40 px-2.5 py-1">Tailwind CSS</span>
            <span className="rounded-md bg-muted/40 px-2.5 py-1">TanStack Query</span>
            <span className="rounded-md bg-muted/40 px-2.5 py-1">Recharts</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
