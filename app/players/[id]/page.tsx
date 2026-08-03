'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Trophy,
  TrendingUp,
  TrendingDown,
  Clock,
  Swords,
  Heart,
  Users,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { CardSkeleton, Skeleton, TableSkeleton } from '@/components/skeletons';
import { ErrorState, EmptyState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  usePlayer,
  usePlayerWL,
  usePlayerRecentMatches,
  usePlayerHeroes,
  useHeroStats,
} from '@/hooks/use-opendota-queries';
import { useFavorites } from '@/hooks/use-favorites';
import type { HeroStat, RecentMatch, PlayerHero, Player as PlayerType, WinLoss } from '@/types';
import {
  formatPercent,
  formatNumber,
  timeAgo,
  kda,
  formatKDA,
  isRadiant,
} from '@/utils/format';
import {
  getGameMode,
  getRankTier,
  PRIMARY_ATTR_LABELS,
} from '@/utils/constants';
import { cn } from '@/lib/utils';
import { HeroImage } from '@/components/hero-image';

export default function PlayerProfilePage() {
  const params = useParams<{ id: string }>();
  const accountId = params.id;
  const { data: rawPlayer, isLoading, isError, refetch } = usePlayer(accountId);
  const player = rawPlayer as PlayerType | undefined;
  const { data: rawWL } = usePlayerWL(accountId);
  const wl = rawWL as WinLoss | undefined;
  const { data: rawRecentMatches } = usePlayerRecentMatches(accountId);
  const recentMatches = rawRecentMatches as RecentMatch[] | undefined;
  const { data: rawPlayerHeroes } = usePlayerHeroes(accountId);
  const playerHeroes = rawPlayerHeroes as PlayerHero[] | undefined;
  const { data: rawHeroStats } = useHeroStats();
  const heroStats = rawHeroStats as HeroStat[] | undefined;
  const { isFavorite, toggleFavorite } = useFavorites();

  if (isError) {
    return <ErrorState title="Player not found" message="This account may be private or does not exist." onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass flex items-center gap-4 rounded-xl p-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton />
      </div>
    );
  }

  const profile = player?.profile;
  const name = profile?.personaname ?? profile?.name ?? `Player ${accountId}`;
  const avatar = profile?.avatarfull ?? profile?.avatarmedium ?? profile?.avatar;
  const rankTier = player?.rank_tier ?? player?.leaderboard_rank;
  const fav = isFavorite('player', Number(accountId));

  const wins = wl?.win ?? 0;
  const losses = wl?.lose ?? 0;
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? wins / totalGames : 0;

  const wlData = [
    { name: 'Wins', value: wins, fill: 'hsl(var(--success))' },
    { name: 'Losses', value: losses, fill: 'hsl(var(--destructive))' },
  ];

  const topHeroes = (playerHeroes ?? [])
    .filter((h: PlayerHero) => h.games > 0)
    .sort((a: PlayerHero, b: PlayerHero) => b.games - a.games)
    .slice(0, 5);

  const heroMap = new Map<number, HeroStat>(
    (heroStats ?? []).map((h: HeroStat) => [h.id, h])
  );

  return (
    <div className="space-y-6">
      <Link
        href="/players"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Search
      </Link>

      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <img
            src={avatar ?? ''}
            alt={name}
            className="h-20 w-20 rounded-full border-2 border-primary/30 object-cover"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>ID: {accountId}</span>
              {profile?.loccountrycode && (
                <span className="rounded-md bg-muted/40 px-2 py-0.5 text-xs uppercase">
                  {profile.loccountrycode}
                </span>
              )}
              {rankTier != null && (
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <Trophy className="h-3 w-3" />
                  {getRankTier(rankTier)}
                </span>
              )}
              {player?.mmr_estimate?.estimate != null && (
                <span className="text-xs">
                  Est. MMR: {player.mmr_estimate.estimate.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <Button
            variant={fav ? 'default' : 'outline'}
            onClick={() =>
              toggleFavorite({
                type: 'player',
                refId: Number(accountId),
                name,
                image: avatar,
              })
            }
          >
            <Star className={cn('mr-2 h-4 w-4', fav && 'fill-current')} />
            {fav ? 'Favorited' : 'Add Favorite'}
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Games" value={formatNumber(totalGames)} icon={Swords} accent="primary" />
        <StatCard label="Wins" value={formatNumber(wins)} icon={TrendingUp} accent="success" delay={0.05} />
        <StatCard label="Losses" value={formatNumber(losses)} icon={TrendingDown} accent="destructive" delay={0.1} />
        <StatCard label="Win Rate" value={formatPercent(winRate)} icon={Trophy} accent={winRate >= 0.5 ? 'success' : 'warning'} delay={0.15} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">Recent Matches</TabsTrigger>
          <TabsTrigger value="heroes">Top Heroes</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6"
            >
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Win / Loss
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={wlData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {wlData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-success" />
                  {formatNumber(wins)} Wins
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-destructive" />
                  {formatNumber(losses)} Losses
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass rounded-xl p-6"
            >
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Top Heroes (by games)
              </h3>
              {topHeroes.length === 0 ? (
                <EmptyState icon={Heart} title="No hero data" message="This player has no recorded hero games." />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topHeroes.map((h: PlayerHero) => ({ name: h.localized_name ?? h.name, games: h.games }))} layout="vertical">
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                      contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                    />
                    <Bar dataKey="games" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>
        </TabsContent>

        {/* Recent matches */}
        <TabsContent value="matches">
          <RecentMatchesTable matches={recentMatches ?? []} heroMap={heroMap} loading={!recentMatches} />
        </TabsContent>

        {/* Top heroes */}
        <TabsContent value="heroes">
          <PlayerHeroesTable heroes={playerHeroes ?? []} loading={!playerHeroes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RecentMatchesTable({
  matches,
  heroMap,
  loading,
}: {
  matches: RecentMatch[];
  heroMap: Map<number, HeroStat>;
  loading: boolean;
}) {
  if (loading) return <TableSkeleton />;
  if (matches.length === 0) {
    return <EmptyState icon={Clock} title="No recent matches" message="This player has no recent recorded matches." />;
  }

  return (
    <div className="glass overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Hero</th>
              <th className="px-4 py-3 font-medium">Result</th>
              <th className="px-4 py-3 text-right font-medium">K/D/A</th>
              <th className="px-4 py-3 text-right font-medium">GPM</th>
              <th className="px-4 py-3 text-right font-medium">XPM</th>
              <th className="px-4 py-3 font-medium">Mode</th>
              <th className="px-4 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m: RecentMatch) => {
              const hero = heroMap.get(m.id);
              const radiant = isRadiant(m.player_slot);
              const won = m.radiant_win === radiant;
              return (
                <tr
                  key={m.match_id}
                  className="border-b border-border/40 transition-colors hover:bg-accent/30"
                >
                  <td className="px-4 py-3">
                    <Link href={`/matches/${m.match_id}`} className="flex items-center gap-2">
                      <HeroImage
                        name={hero?.name}
                        localizedName={hero?.localized_name}
                        className="h-8 w-8 rounded"
                        sizes="32px"
                      />
                      <span className="font-medium text-foreground hover:text-primary">
                        {hero?.localized_name ?? `Hero ${m.id}`}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-md px-2 py-0.5 text-xs font-bold',
                        won
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      )}
                    >
                      {won ? 'Won' : 'Lost'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">
                    {formatKDA(m.kills, m.deaths, m.assists)}
                    <span className="ml-1 text-muted-foreground">
                      ({kda(m.kills, m.deaths, m.assists).toFixed(2)})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{m.gold_per_min}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{m.xp_per_min}</td>
                  <td className="px-4 py-3 text-muted-foreground">{getGameMode(m.game_mode)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{timeAgo(m.start_time)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlayerHeroesTable({
  heroes,
  loading,
}: {
  heroes: PlayerHero[];
  loading: boolean;
}) {
  if (loading) return <TableSkeleton />;
  if (heroes.length === 0) {
    return <EmptyState icon={Heart} title="No hero data" message="This player has no recorded hero games." />;
  }

  const top = [...heroes].filter((h: PlayerHero) => h.games > 0).sort((a: PlayerHero, b: PlayerHero) => b.games - a.games).slice(0, 15);

  return (
    <div className="glass overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Hero</th>
              <th className="px-4 py-3 text-right font-medium">Games</th>
              <th className="px-4 py-3 text-right font-medium">Win Rate</th>
              <th className="px-4 py-3 text-right font-medium">With</th>
              <th className="px-4 py-3 text-right font-medium">Against</th>
              <th className="px-4 py-3 font-medium">Last Played</th>
            </tr>
          </thead>
          <tbody>
            {top.map((h: PlayerHero) => {
              const wr = h.games > 0 ? h.win / h.games : 0;
              return (
                <tr
                  key={h.id}
                  className="border-b border-border/40 transition-colors hover:bg-accent/30"
                >
                  <td className="px-4 py-3">
                    <Link href={`/heroes/${h.id}`} className="flex items-center gap-2">
                      <HeroImage
                        name={h.name}
                        localizedName={h.localized_name}
                        className="h-8 w-8 rounded"
                        sizes="32px"
                      />
                      <span className="font-medium text-foreground hover:text-primary">
                        {h.localized_name ?? h.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{h.games}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn('font-semibold', wr >= 0.5 ? 'text-success' : 'text-destructive')}>
                      {formatPercent(wr)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {h.with_games > 0 ? formatPercent(h.with_win / h.with_games) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {h.against_games > 0 ? formatPercent(h.against_win / h.against_games) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{timeAgo(h.last_played)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
