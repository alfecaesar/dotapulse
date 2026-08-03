'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Trophy,
  Clock,
  ChevronDown,
  Users,
  TrendingUp,
  Swords,
  Radio,
  Calendar,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { TableSkeleton, CardSkeleton } from '@/components/skeletons';
import { ErrorState, EmptyState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useProMatches,
  usePublicMatches,
  useLiveMatches,
} from '@/hooks/use-opendota-queries';
import {
  formatDuration,
  timeAgo,
  formatDateTime,
} from '@/utils/format';
import { getGameMode } from '@/utils/constants';
import type { ProMatch, PublicMatch, UpcomingProMatch } from '@/types';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

export default function ProMatchesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pro Matches"
        description="Live games, recent results, and high-level public matches. Click any match for a full breakdown."
        icon={Trophy}
      />

      {/* Live / upcoming section */}
      <LiveMatchesSection />

      <Tabs defaultValue="pro" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="pro">
            <Trophy className="mr-2 h-4 w-4" />
            Pro Matches
          </TabsTrigger>
          <TabsTrigger value="public">
            <Users className="mr-2 h-4 w-4" />
            Public Matches
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pro">
          <ProMatchesList />
        </TabsContent>
        <TabsContent value="public">
          <PublicMatchesList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LiveMatchesSection() {
  const { data, isLoading, isError } = useLiveMatches();
  const matches = (data ?? []) as UpcomingProMatch[];

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-destructive" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Live & Upcoming
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || matches.length === 0) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Live & Upcoming
          </h2>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          No live pro matches right now. Check back during tournament hours — pro games appear here as soon as they start.
        </p>
      </div>
    );
  }

  // Sort: live games (status < 2) first, then by start time
  const sorted = [...matches].sort((a, b) => {
    const aLive = (a.status ?? 0) < 2;
    const bLive = (b.status ?? 0) < 2;
    if (aLive && !bLive) return -1;
    if (!aLive && bLive) return 1;
    return (a.start_time ?? 0) - (b.start_time ?? 0);
  });

  const shown = sorted.slice(0, 6);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Live & Upcoming
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((m: UpcomingProMatch, i: number) => {
          const isLive = (m.status ?? 0) < 2 && m.duration != null;
          const radiantName = m.radiant_team?.name ?? m.team_radiant ?? 'Radiant';
          const direName = m.dire_team?.name ?? m.team_dire ?? 'Dire';
          return (
            <motion.div
              key={`${m.match_id ?? i}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <div className="card-hover glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  {isLive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
                      <Radio className="h-3 w-3" />
                      Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                      <Clock className="h-3 w-3" />
                      Upcoming
                    </span>
                  )}
                  {m.league_name && (
                    <span className="truncate text-xs text-muted-foreground" title={m.league_name}>
                      {m.league_name}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 text-right">
                    <p className="truncate text-sm font-semibold text-success">{radiantName}</p>
                    {m.radiant_score != null && (
                      <p className="text-lg font-bold text-success">{m.radiant_score}</p>
                    )}
                  </div>
                  <div className="shrink-0 px-2 text-xs font-bold text-muted-foreground">VS</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-destructive">{direName}</p>
                    {m.dire_score != null && (
                      <p className="text-lg font-bold text-destructive">{m.dire_score}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{getGameMode(m.game_mode ?? undefined)}</span>
                  <span>{isLive ? formatDuration(m.duration ?? 0) : formatDateTime(m.start_time ?? 0)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ProMatchesList() {
  const { data, isLoading, isError, refetch } = useProMatches();
  const [visible, setVisible] = useState(PAGE_SIZE);

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading) return <TableSkeleton rows={10} />;

  const matches = (data ?? []) as ProMatch[];
  if (matches.length === 0) return <EmptyState icon={Trophy} title="No pro matches" />;

  const shown = matches.slice(0, visible);

  return (
    <div className="space-y-3">
      {shown.map((m: ProMatch, i: number) => (
        <motion.div
          key={m.match_id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
        >
          <Link
            href={`/matches/${m.match_id}`}
            className="card-hover glass flex items-center justify-between gap-4 rounded-lg p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  m.radiant_win ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                )}
              >
                <Trophy className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  <span className={m.radiant_win ? 'text-success' : ''}>
                    {m.radiant_name ?? 'Radiant'}
                  </span>
                  <span className="mx-1.5 text-muted-foreground">vs</span>
                  <span className={!m.radiant_win ? 'text-destructive' : ''}>
                    {m.dire_name ?? 'Dire'}
                  </span>
                </p>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {timeAgo(m.start_time)}
                  <span>·</span>
                  {formatDuration(m.duration)}
                  <span>·</span>
                  {getGameMode(m.game_mode ?? undefined)}
                </p>
              </div>
            </div>
            <div className="hidden shrink-0 items-center gap-2 text-right sm:flex">
              {m.league_name && (
                <span className="rounded-md bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                  {m.league_name}
                </span>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
      {visible < matches.length && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            <ChevronDown className="mr-2 h-4 w-4" />
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}

function PublicMatchesList() {
  const { data, isLoading, isError, refetch } = usePublicMatches();
  const [visible, setVisible] = useState(PAGE_SIZE);

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading) return <TableSkeleton rows={10} />;

  const matches = (data ?? []) as PublicMatch[];
  if (matches.length === 0) return <EmptyState icon={Users} title="No public matches" />;

  const shown = matches.slice(0, visible);

  return (
    <div className="space-y-3">
      {shown.map((m: PublicMatch, i: number) => (
        <motion.div
          key={m.match_id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
        >
          <Link
            href={`/matches/${m.match_id}`}
            className="card-hover glass flex items-center justify-between gap-4 rounded-lg p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  m.radiant_win ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                )}
              >
                <Swords className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {m.radiant_win ? 'Radiant Victory' : 'Dire Victory'}
                </p>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {timeAgo(m.start_time)}
                  <span>·</span>
                  {formatDuration(m.duration)}
                  <span>·</span>
                  {getGameMode(m.game_mode)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <TrendingUp className="h-3 w-3" />
                {m.avg_mmr} MMR
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
      {visible < matches.length && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            <ChevronDown className="mr-2 h-4 w-4" />
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
