'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  Swords,
  Users,
  Trophy,
  BarChart3,
  Heart,
  TrendingUp,
  Target,
  Shield,
  Server,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { HeroCard } from '@/components/hero-card';
import { GridSkeleton, CardSkeleton } from '@/components/skeletons';
import { ErrorState } from '@/components/states';
import { useHeroStats, useHealth, useProMatches } from '@/hooks/use-opendota-queries';
import { useFavorites } from '@/hooks/use-favorites';
import { formatNumber, formatPercent, timeAgo } from '@/utils/format';
import { PRIMARY_ATTR_LABELS } from '@/utils/constants';
import { HeroImage } from '@/components/hero-image';
import type { HeroStat, ProMatch } from '@/types';

export default function DashboardPage() {
  const { data: rawHeroes, isLoading: heroesLoading, isError: heroesError, refetch: refetchHeroes } = useHeroStats();
  const heroes = rawHeroes as HeroStat[] | undefined;
  const { data: health, isLoading: healthLoading } = useHealth();
  const { data: rawProMatches, isLoading: proLoading } = useProMatches();
  const proMatches = rawProMatches as ProMatch[] | undefined;
  const { isFavorite, toggleFavorite } = useFavorites();

  const heroesList = heroes ?? [];
  const totalHeroes = heroesList.length;
  const totalPicks = heroesList.reduce((s: number, h: HeroStat) => s + (h.pub_pick ?? 0), 0);
  const totalWins = heroesList.reduce((s: number, h: HeroStat) => s + (h.pub_win ?? 0), 0);
  const avgWinRate = totalPicks > 0 ? totalWins / totalPicks : 0;

  const topHeroes = [...heroesList]
    .filter((h: HeroStat) => (h.pub_pick ?? 0) > 0)
    .sort((a: HeroStat, b: HeroStat) => (b.pub_pick ?? 0) - (a.pub_pick ?? 0))
    .slice(0, 8);

  const topWinRate = [...heroesList]
    .filter((h: HeroStat) => (h.pub_pick ?? 0) > 1000)
    .map((h: HeroStat) => ({
      ...h,
      wr: (h.pub_win ?? 0) / (h.pub_pick ?? 1),
    }))
    .sort((a, b) => b.wr - a.wr)
    .slice(0, 5);

  const recentPro = (proMatches ?? []).slice(0, 5);

  const quickLinks = [
    { href: '/heroes', label: 'Hero Explorer', desc: 'Browse all heroes', icon: Swords },
    { href: '/players', label: 'Player Search', desc: 'Find any player', icon: Users },
    { href: '/matches', label: 'Match Analyzer', desc: 'Break down a match', icon: Activity },
    { href: '/pro-matches', label: 'Pro Matches', desc: 'Latest pro games', icon: Trophy },
    { href: '/meta', label: 'Meta Dashboard', desc: 'Win & pick rates', icon: BarChart3 },
    { href: '/favorites', label: 'Favorites', desc: 'Your saved items', icon: Heart },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Live Dota 2 analytics powered by OpenDota — heroes, players, matches, and the current meta."
        icon={Activity}
      />

      {/* Top stats */}
      {heroesLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Heroes"
            value={totalHeroes}
            icon={Swords}
            accent="primary"
            delay={0}
          />
          <StatCard
            label="Pub Picks Tracked"
            value={formatNumber(totalPicks)}
            icon={Target}
            accent="chart"
            delay={0.05}
          />
          <StatCard
            label="Average Win Rate"
            value={formatPercent(avgWinRate)}
            icon={TrendingUp}
            accent="success"
            delay={0.1}
          />
          <StatCard
            label="API Status"
            value={healthLoading ? '…' : health?.status === 'ok' ? 'Healthy' : 'Degraded'}
            subValue={health ? `${health.server_count ?? 0} servers` : 'Checking…'}
            icon={Server}
            accent={health?.status === 'ok' ? 'success' : 'warning'}
            delay={0.15}
          />
        </div>
      )}

      {/* Quick links */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link
                  href={link.href}
                  className="card-hover glass flex h-full flex-col gap-2 rounded-xl p-4"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {link.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{link.desc}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Top heroes + recent pro */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Most Picked Heroes
            </h2>
            <Link
              href="/heroes"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {heroesError ? (
            <ErrorState onRetry={() => refetchHeroes()} />
          ) : heroesLoading ? (
            <GridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {topHeroes.map((hero: HeroStat, i: number) => (
                <Link key={hero.id} href={`/heroes/${hero.id}`}>
                  <HeroCard
                    hero={hero}
                    index={i}
                    isFavorite={isFavorite('hero', hero.id)}
                    onToggleFavorite={() =>
                      toggleFavorite({
                        type: 'hero',
                        refId: hero.id,
                        name: hero.localized_name ?? hero.name,
                        image: hero.img,
                      })
                    }
                  />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Highest Win Rate
            </h2>
            <Link
              href="/meta"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Meta <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {topWinRate.map((hero, i) => (
              <motion.div
                key={hero.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link
                  href={`/heroes/${hero.id}`}
                  className="card-hover glass flex items-center gap-3 rounded-lg p-3"
                >
                  <span className="w-5 text-center text-xs font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <HeroImage
                    name={hero.name}
                    localizedName={hero.localized_name}
                    className="h-8 w-8 rounded"
                    sizes="32px"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {hero.localized_name ?? hero.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {PRIMARY_ATTR_LABELS[hero.primary_attr] ?? hero.primary_attr}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-success">
                    {formatPercent(hero.wr)}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent pro matches */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Pro Matches
          </h2>
          <Link
            href="/pro-matches"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {proLoading ? (
          <CardSkeleton />
        ) : (
          <div className="space-y-2">
            {recentPro.map((m: ProMatch, i: number) => (
              <motion.div
                key={m.match_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link
                  href={`/matches/${m.match_id}`}
                  className="card-hover glass flex items-center justify-between gap-3 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {m.radiant_name ?? 'Radiant'} vs {m.dire_name ?? 'Dire'}
                      </p>
                      <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {timeAgo(m.start_time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={m.radiant_win ? 'font-bold text-success' : 'text-muted-foreground'}>
                      {m.radiant_name ?? 'Radiant'}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className={!m.radiant_win ? 'font-bold text-destructive' : 'text-muted-foreground'}>
                      {m.dire_name ?? 'Dire'}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
