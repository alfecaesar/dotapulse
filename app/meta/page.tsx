'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { PageHeader } from '@/components/page-header';
import { ChartSkeleton, CardSkeleton } from '@/components/skeletons';
import { ErrorState, EmptyState } from '@/components/states';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHeroStats } from '@/hooks/use-opendota-queries';
import {
  PRIMARY_ATTR_LABELS,
  PRIMARY_ATTR_COLORS,
  HERO_ROLES,
} from '@/utils/constants';
import { formatPercent, formatNumber } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { HeroStat, PrimaryAttr } from '@/types';

type SortKey = 'winRate' | 'pickRate' | 'banRate';
type ProcessedHero = HeroStat & { _wr: number; _pr: number; _br: number };

export default function MetaPage() {
  const { data: rawHeroes, isLoading, isError, refetch } = useHeroStats();
  const heroes = rawHeroes as HeroStat[] | undefined;
  const [attrFilter, setAttrFilter] = useState<PrimaryAttr | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('winRate');

  const processed: ProcessedHero[] = useMemo(() => {
    if (!heroes) return [];
    return heroes
      .filter((h: HeroStat) => (h.pub_pick ?? 0) > 0)
      .filter((h: HeroStat) => attrFilter === 'all' || h.primary_attr === attrFilter)
      .filter((h: HeroStat) => roleFilter === 'all' || h.roles?.includes(roleFilter))
      .map((h: HeroStat): ProcessedHero => {
        const wr = (h.pub_win ?? 0) / Math.max(h.pub_pick ?? 1, 1);
        const pr = h.pub_pick ?? 0;
        const br = h.pub_ban ?? 0;
        return { ...h, _wr: wr, _pr: pr, _br: br };
      });
  }, [heroes, attrFilter, roleFilter]);

  const scatterData = processed.map((h: ProcessedHero) => ({
    name: h.localized_name ?? h.name,
    winRate: h._wr * 100,
    pickRate: h._pr,
    hero_id: h.hero_id,
    attr: h.primary_attr,
  }));

  const sorted = [...processed].sort((a, b) => {
    switch (sortKey) {
      case 'winRate':
        return b._wr - a._wr;
      case 'pickRate':
        return b._pr - a._pr;
      case 'banRate':
        return b._br - a._br;
    }
  });

  const topWinners = sorted.slice(0, 10);
  const topLosers = [...sorted].reverse().slice(0, 10);
  const topPicked = [...processed].sort((a, b) => b._pr - a._pr).slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meta Dashboard"
        description="Current hero meta across public matches — win rates, pick rates, and ban rates at a glance."
        icon={BarChart3}
      />

      {/* Filters */}
      <div className="glass flex flex-wrap items-center gap-2 rounded-xl p-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={attrFilter} onValueChange={(v) => setAttrFilter(v as PrimaryAttr | 'all')}>
          <SelectTrigger className="w-[140px]" aria-label="Filter by attribute">
            <SelectValue placeholder="Attribute" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Attributes</SelectItem>
            {Object.entries(PRIMARY_ATTR_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px]" aria-label="Filter by role">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {HERO_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-[140px]" aria-label="Sort by">
            <ArrowUpDown className="mr-1 h-3.5 w-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="winRate">Win Rate</SelectItem>
            <SelectItem value="pickRate">Pick Rate</SelectItem>
            <SelectItem value="banRate">Ban Rate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-6">
          <ChartSkeleton />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      ) : processed.length === 0 ? (
        <EmptyState icon={BarChart3} title="No data" message="No heroes match these filters." />
      ) : (
        <>
          {/* Scatter plot: win rate vs pick rate */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Win Rate vs Pick Rate
            </h3>
            <ResponsiveContainer width="100%" height={360}>
              <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis
                  type="number"
                  dataKey="pickRate"
                  name="Pick Rate"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => formatNumber(v)}
                />
                <YAxis
                  type="number"
                  dataKey="winRate"
                  name="Win Rate"
                  domain={[40, 60]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                />
                <ZAxis range={[60, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Win Rate') return [`${value.toFixed(1)}%`, name];
                    return [formatNumber(value), name];
                  }}
                  labelFormatter={(_, payload) => {
                    const p = payload?.[0]?.payload as { name?: string } | undefined;
                    return p?.name ?? '';
                  }}
                />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={PRIMARY_ATTR_COLORS[entry.attr] ?? 'hsl(var(--primary))'}
                      fillOpacity={0.7}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {Object.entries(PRIMARY_ATTR_COLORS).map(([attr, color]) => (
                <span key={attr} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {PRIMARY_ATTR_LABELS[attr]}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Top charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MetaBarCard
              title="Top Win Rate"
              icon={TrendingUp}
              accent="text-success"
              data={topWinners}
              valueKey="_wr"
              formatValue={(v: number) => formatPercent(v)}
            />
            <MetaBarCard
              title="Lowest Win Rate"
              icon={TrendingDown}
              accent="text-destructive"
              data={topLosers}
              valueKey="_wr"
              formatValue={(v: number) => formatPercent(v)}
            />
            <MetaBarCard
              title="Most Picked"
              icon={BarChart3}
              accent="text-primary"
              data={topPicked}
              valueKey="_pr"
              formatValue={(v: number) => formatNumber(v)}
            />
            <MetaBarCard
              title="Most Banned"
              icon={BarChart3}
              accent="text-warning"
              data={[...processed].sort((a, b) => b._br - a._br).slice(0, 10)}
              valueKey="_br"
              formatValue={(v: number) => formatNumber(v)}
            />
          </div>
        </>
      )}
    </div>
  );
}

function MetaBarCard({
  title,
  icon: Icon,
  accent,
  data,
  valueKey,
  formatValue,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  data: ProcessedHero[];
  valueKey: '_wr' | '_pr' | '_br';
  formatValue: (v: number) => string;
}) {
  const chartData = data.slice(0, 10).map((h: ProcessedHero) => ({
    name: (h.localized_name ?? h.name).slice(0, 12),
    value: h[valueKey],
    full: h.localized_name ?? h.name,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className={cn('h-4 w-4', accent)} />
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
          <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatValue(v)} />
          <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
            contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', fontSize: '0.875rem' }}
            formatter={(v: number) => [formatValue(v), title]}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
