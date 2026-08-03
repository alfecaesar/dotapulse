'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Activity,
  Clock,
  Trophy,
  Swords,
  Crown,
  Copy,
  Check,
  Share2,
  ChevronDown,
  Shield,
  Zap,
  Eye,
  MapPin,
  type LucideIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { CardSkeleton, Skeleton, TableSkeleton } from '@/components/skeletons';
import { ErrorState, EmptyState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { useMatch, useHeroStats } from '@/hooks/use-opendota-queries';
import { useToast } from '@/hooks/use-toast';
import { HeroImage } from '@/components/hero-image';
import { itemImageUrl, teamLogoUrl } from '@/utils/images';
import {
  formatDuration,
  formatNumber,
  formatDateTime,
  kda,
  formatKDA,
  isRadiant,
} from '@/utils/format';
import { getGameMode, getRegion } from '@/utils/constants';
import type { MatchPlayer, HeroStat, Match as MatchType } from '@/types';
import { cn } from '@/lib/utils';

const ITEM_SLOTS = ['item_0', 'item_1', 'item_2', 'item_3', 'item_4', 'item_5', 'item_neutral'] as const;

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>();
  const matchId = params.id;
  const { data: match, isLoading, isError, refetch } = useMatch(matchId);
  const { data: heroStats } = useHeroStats();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const heroMap = new Map<number, HeroStat>(
    (heroStats ?? []).map((h: HeroStat) => [h.id, h])
  );

  const handleCopyId = () => {
    if (!match) return;
    navigator.clipboard.writeText(String(match.match_id));
    setCopied(true);
    toast({ title: 'Match ID copied', description: String(match.match_id) });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!match) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: `Match ${match.match_id}`, url });
      } else {
        navigator.clipboard.writeText(url);
        toast({ title: 'Link copied', description: 'Match link copied to clipboard' });
      }
    } catch {
      // user cancelled or clipboard failed
    }
  };

  if (isError) {
    return <ErrorState title="Match not found" message="This match may not exist or is not available." onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return <MatchDetailSkeleton />;
  }

  if (!match) {
    return <EmptyState title="No match data" />;
  }

  const m: MatchType = match;
  const radiantWon = m.radiant_win;
  const radiantPlayers = m.players.filter((p: MatchPlayer) => isRadiant(p.player_slot));
  const direPlayers = m.players.filter((p: MatchPlayer) => !isRadiant(p.player_slot));
  const radiantName = m.radiant_team?.name ?? 'Radiant';
  const direName = m.dire_team?.name ?? 'Dire';
  const radiantLogo = m.radiant_team?.logo_url;
  const direLogo = m.dire_team?.logo_url;

  return (
    <div className="space-y-6">
      <Link
        href="/matches"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Analyze another match
      </Link>

      <PageHeader
        title={`Match ${m.match_id}`}
        description={`${getGameMode(m.game_mode)} · ${getRegion(m.region)} · ${formatDateTime(m.start_time)}`}
        icon={Activity}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyId}>
              {copied ? <Check className="mr-1.5 h-4 w-4 text-success" /> : <Copy className="mr-1.5 h-4 w-4" />}
              {copied ? 'Copied' : 'Copy ID'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-1.5 h-4 w-4" />
              Share
            </Button>
          </div>
        }
      />

      {/* Match header stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Duration" value={formatDuration(m.duration)} icon={Clock} accent="primary" />
        <StatCard label="Radiant Score" value={m.radiant_score ?? 0} icon={Swords} accent="success" delay={0.05} />
        <StatCard label="Dire Score" value={m.dire_score ?? 0} icon={Swords} accent="destructive" delay={0.1} />
        <StatCard label="First Blood" value={formatDuration(m.first_blood_time)} icon={Activity} accent="warning" delay={0.15} />
      </div>

      {/* Team summary */}
      <TeamSummary
        radiantName={radiantName}
        direName={direName}
        radiantLogo={radiantLogo}
        direLogo={direLogo}
        radiantScore={m.radiant_score ?? 0}
        direScore={m.dire_score ?? 0}
        radiantWon={!!radiantWon}
      />

      {/* Draft */}
      {m.picks_bans && m.picks_bans.length > 0 && (
        <DraftSection picksBans={m.picks_bans} heroMap={heroMap} />
      )}

      {/* Gold Advantage chart */}
      {m.radiant_gold_adv && m.radiant_gold_adv.length > 0 && (
        <AdvantageChart
          title="Gold Advantage"
          data={m.radiant_gold_adv}
          unit="Gold"
        />
      )}

      {/* XP Advantage chart */}
      {m.radiant_xp_adv && m.radiant_xp_adv.length > 0 && (
        <AdvantageChart
          title="XP Advantage"
          data={m.radiant_xp_adv}
          unit="XP"
        />
      )}

      {/* Player tables */}
      <PlayerTable title="Radiant" players={radiantPlayers} heroMap={heroMap} won={!!radiantWon} />
      <PlayerTable title="Dire" players={direPlayers} heroMap={heroMap} won={!radiantWon} />
    </div>
  );
}

function TeamSummary({
  radiantName,
  direName,
  radiantLogo,
  direLogo,
  radiantScore,
  direScore,
  radiantWon,
}: {
  radiantName: string;
  direName: string;
  radiantLogo?: string;
  direLogo?: string;
  radiantScore: number;
  direScore: number;
  radiantWon: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Radiant */}
        <div className={cn('flex flex-1 items-center gap-3', radiantWon && 'opacity-100')}>
          <TeamLogo url={radiantLogo} name={radiantName} color="success" />
          <div className="min-w-0">
            <p className={cn('truncate text-sm font-bold', radiantWon ? 'text-success' : 'text-muted-foreground')}>
              {radiantName}
            </p>
            <p className="text-2xl font-bold text-foreground">{radiantScore}</p>
          </div>
          {radiantWon && <Crown className="h-5 w-5 text-warning" />}
        </div>

        {/* Center VS */}
        <div className="shrink-0 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">VS</span>
        </div>

        {/* Dire */}
        <div className={cn('flex flex-1 items-center justify-end gap-3 text-right', !radiantWon && 'opacity-100')}>
          {!radiantWon && <Crown className="h-5 w-5 text-warning" />}
          <div className="min-w-0">
            <p className={cn('truncate text-sm font-bold', !radiantWon ? 'text-destructive' : 'text-muted-foreground')}>
              {direName}
            </p>
            <p className="text-2xl font-bold text-foreground">{direScore}</p>
          </div>
          <TeamLogo url={direLogo} name={direName} color="destructive" />
        </div>
      </div>
    </motion.div>
  );
}

function TeamLogo({ url, name, color }: { url?: string; name: string; color: 'success' | 'destructive' }) {
  const colorClasses = color === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive';
  if (url) {
    return (
      <img
        src={teamLogoUrl(url) ?? ''}
        alt={name}
        className="h-12 w-12 rounded-lg border border-border/40 object-contain"
      />
    );
  }
  return (
    <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', colorClasses)}>
      <Shield className="h-6 w-6" />
    </div>
  );
}

function DraftSection({
  picksBans,
  heroMap,
}: {
  picksBans: Array<{ is_pick: boolean; id: number; team: number; order: number }>;
  heroMap: Map<number, HeroStat>;
}) {
  const sorted = [...picksBans].sort((a, b) => a.order - b.order);
  const radiant = sorted.filter((p) => p.team === 0);
  const dire = sorted.filter((p) => p.team === 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Draft
      </h3>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DraftColumn title="Radiant" picks={radiant} heroMap={heroMap} color="success" />
        <DraftColumn title="Dire" picks={dire} heroMap={heroMap} color="destructive" />
      </div>
    </motion.div>
  );
}

function DraftColumn({
  title,
  picks,
  heroMap,
  color,
}: {
  title: string;
  picks: Array<{ is_pick: boolean; id: number; order: number }>;
  heroMap: Map<number, HeroStat>;
  color: 'success' | 'destructive';
}) {
  return (
    <div>
      <p className={cn('mb-2 text-xs font-bold uppercase', color === 'success' ? 'text-success' : 'text-destructive')}>
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {picks.map((p) => {
          const hero = heroMap.get(p.id);
          return (
            <div
              key={`${p.order}-${p.id}`}
              className={cn(
                'relative rounded-lg border p-1',
                p.is_pick
                  ? color === 'success'
                    ? 'border-success/30 bg-success/5'
                    : 'border-destructive/30 bg-destructive/5'
                  : 'border-border/40 bg-muted/20 opacity-60'
              )}
              title={`${p.is_pick ? 'Pick' : 'Ban'} #${p.order + 1} — ${hero?.localized_name ?? 'Unknown'}`}
            >
              <HeroImage
                name={hero?.name}
                localizedName={hero?.localized_name}
                className="h-10 w-10 rounded"
                sizes="40px"
              />
              {!p.is_pick && (
                <div className="absolute inset-0 flex items-center justify-center rounded bg-background/60">
                  <span className="text-[8px] font-bold uppercase text-destructive">Ban</span>
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background text-[8px] font-bold text-muted-foreground">
                {p.order + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdvantageChart({
  title,
  data,
  unit,
}: {
  title: string;
  data: number[];
  unit: string;
}) {
  const chartData = data.map((v: number, i: number) => ({ minute: i, advantage: v }));

  const tooltipFormatter = (value: number) => {
    if (value >= 0) {
      return [`Radiant +${formatNumber(value)} ${unit}`, 'Advantage'];
    }
    return [`Dire +${formatNumber(Math.abs(value))} ${unit}`, 'Advantage'];
  };

  const labelFormatter = (label: number) => `${label} min`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`grad-radiant-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.5} />
              <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id={`grad-dire-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.05} />
              <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="minute"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}m`}
          />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatNumber(v)}
          />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1.5} />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
            labelFormatter={labelFormatter}
            formatter={tooltipFormatter}
          />
          <Area
            type="monotone"
            dataKey="advantage"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            fill={`url(#grad-radiant-${title})`}
            baseValue={0}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded bg-success" />
          Radiant advantage
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded bg-destructive" />
          Dire advantage
        </span>
      </div>
    </motion.div>
  );
}

function PlayerTable({
  title,
  players,
  heroMap,
  won,
}: {
  title: string;
  players: MatchPlayer[];
  heroMap: Map<number, HeroStat>;
  won: boolean;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass overflow-hidden rounded-xl"
    >
      <div
        className={cn(
          'flex items-center justify-between border-b border-border/60 px-4 py-3',
          won ? 'bg-success/5' : 'bg-destructive/5'
        )}
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
          {won && <Crown className="h-4 w-4 text-warning" />}
          <span className={won ? 'text-success' : 'text-destructive'}>{title}</span>
        </h3>
        <span className="text-xs text-muted-foreground">{players.length} players</span>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-3 font-medium">Player</th>
              <th className="px-3 py-3 text-right font-medium">KDA</th>
              <th className="px-3 py-3 text-right font-medium">Net</th>
              <th className="px-3 py-3 text-right font-medium">GPM</th>
              <th className="px-3 py-3 text-right font-medium">XPM</th>
              <th className="px-3 py-3 text-right font-medium">LH</th>
              <th className="px-3 py-3 text-right font-medium">DN</th>
              <th className="px-3 py-3 text-right font-medium">DMG</th>
              <th className="px-3 py-3 text-right font-medium">TD</th>
              <th className="px-3 py-3 text-right font-medium">Heal</th>
              <th className="px-3 py-3 text-right font-medium">Obs</th>
              <th className="px-3 py-3 text-right font-medium">Sen</th>
              <th className="px-3 py-3 font-medium">Items</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p: MatchPlayer, i: number) => {
              const hero = heroMap.get(p.hero_id);
              return (
                <PlayerRow
                  key={`${p.player_slot}-${i}`}
                  player={p}
                  hero={hero}
                  isExpanded={expanded === i}
                  onToggle={() => setExpanded(expanded === i ? null : i)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 p-3 lg:hidden">
        {players.map((p: MatchPlayer, i: number) => {
          const hero = heroMap.get(p.id);
          return (
            <MobilePlayerCard
              key={`${p.player_slot}-${i}`}
              player={p}
              hero={hero}
              isExpanded={expanded === i}
              onToggle={() => setExpanded(expanded === i ? null : i)}
            />
          );
        })}
      </div>
    </motion.section>
  );
}

function PlayerRow({
  player: p,
  hero,
  isExpanded,
  onToggle,
}: {
  player: MatchPlayer;
  hero?: HeroStat;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="cursor-pointer border-b border-border/30 transition-colors hover:bg-accent/30"
        onClick={onToggle}
      >
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <HeroImage
              name={hero?.name}
              localizedName={hero?.localized_name}
              className="h-8 w-8 rounded"
              sizes="32px"
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">
                {p.personaname ?? p.name ?? 'Anonymous'}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {hero?.localized_name ?? `Hero ${p.id}`}
              </p>
            </div>
            <ChevronDown className={cn('h-3 w-3 shrink-0 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
          </div>
        </td>
        <td className="px-3 py-3 text-right font-mono text-xs">
          {formatKDA(p.kills, p.deaths, p.assists)}
          <span className="ml-1 text-muted-foreground">({kda(p.kills, p.deaths, p.assists).toFixed(2)})</span>
        </td>
        <td className="px-3 py-3 text-right font-medium text-foreground">{formatNumber(p.net_worth ?? p.total_gold ?? p.gold_spent)}</td>
        <td className="px-3 py-3 text-right text-muted-foreground">{p.gold_per_min}</td>
        <td className="px-3 py-3 text-right text-muted-foreground">{p.xp_per_min}</td>
        <td className="px-3 py-3 text-right text-muted-foreground">{p.last_hits}</td>
        <td className="px-3 py-3 text-right text-muted-foreground">{p.denies}</td>
        <td className="px-3 py-3 text-right text-muted-foreground">{formatNumber(p.hero_damage)}</td>
        <td className="px-3 py-3 text-right text-muted-foreground">{formatNumber(p.tower_damage)}</td>
        <td className="px-3 py-3 text-right text-muted-foreground">{formatNumber(p.hero_healing)}</td>
        <td className="px-3 py-3 text-right text-muted-foreground">{p.obs_placed}</td>
        <td className="px-3 py-3 text-right text-muted-foreground">{p.sen_placed}</td>
        <td className="px-3 py-3">
          <div className="flex gap-1">
            {ITEM_SLOTS.map((slot) => {
              const itemName = p[slot];
              if (!itemName) return <div key={slot} className="h-6 w-6 rounded border border-border/20 bg-muted/20" />;
              return (
                <img
                  key={slot}
                  src={itemImageUrl(`items/${itemName}.png`) ?? ''}
                  alt=""
                  className="h-6 w-6 rounded border border-border/20 object-contain"
                  loading="lazy"
                />
              );
            })}
          </div>
        </td>
      </tr>
      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={13} className="border-b border-border/30 bg-muted/10 p-4">
              <ExpandedPlayerDetails player={p} />
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

function MobilePlayerCard({
  player: p,
  hero,
  isExpanded,
  onToggle,
}: {
  player: MatchPlayer;
  hero?: HeroStat;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/20">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <HeroImage
          name={hero?.name}
          localizedName={hero?.localized_name}
          className="h-10 w-10 rounded"
          sizes="40px"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {p.personaname ?? p.name ?? 'Anonymous'}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {hero?.localized_name ?? `Hero ${p.id}`} · {formatKDA(p.kills, p.deaths, p.assists)}
          </p>
        </div>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/30 p-3">
              <ExpandedPlayerDetails player={p} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExpandedPlayerDetails({ player: p }: { player: MatchPlayer }) {
  const stats: Array<{ label: string; value: string | number }> = [
    { label: 'Level', value: p.level },
    { label: 'GPM', value: p.gold_per_min },
    { label: 'XPM', value: p.xp_per_min },
    { label: 'Last Hits', value: p.last_hits },
    { label: 'Denies', value: p.denies },
    { label: 'Hero Damage', value: formatNumber(p.hero_damage) },
    { label: 'Tower Damage', value: formatNumber(p.tower_damage) },
    { label: 'Hero Healing', value: formatNumber(p.hero_healing) },
    { label: 'Observer Wards', value: p.obs_placed },
    { label: 'Sentry Wards', value: p.sen_placed },
    { label: 'Stuns', value: p.stuns?.toFixed(1) ?? '0' },
    { label: 'Net Worth', value: formatNumber(p.net_worth ?? p.total_gold ?? p.gold_spent) },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border border-border/30 bg-muted/20 px-2 py-1.5">
            <p className="text-[10px] uppercase text-muted-foreground">{s.label}</p>
            <p className="text-sm font-semibold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="mb-1.5 text-[10px] uppercase text-muted-foreground">Items</p>
        <div className="flex flex-wrap gap-1.5">
          {ITEM_SLOTS.map((slot) => {
            const itemName = p[slot];
            if (!itemName) return <div key={slot} className="h-8 w-8 rounded border border-border/20 bg-muted/20" />;
            return (
              <img
                key={slot}
                src={itemImageUrl(`items/${itemName}.png`) ?? ''}
                alt=""
                className="h-8 w-8 rounded border border-border/20 object-contain"
                loading="lazy"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MatchDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-72 w-full rounded-xl" />
      <TableSkeleton rows={10} />
    </div>
  );
}
