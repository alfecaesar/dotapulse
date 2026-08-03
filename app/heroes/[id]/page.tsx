'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Heart,
  Shield,
  Zap,
  Swords,
  Activity,
  TrendingUp,
  Users,
  Gauge,
  Sparkles,
  Package,
  Crosshair,
  Footprints,
  type LucideIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { CardSkeleton, ChartSkeleton, Skeleton } from '@/components/skeletons';
import { ErrorState, EmptyState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useHeroStats,
  useAbilityConstants,
  useItemConstants,
  useHeroItemPopularity,
} from '@/hooks/use-opendota-queries';
import { useFavorites } from '@/hooks/use-favorites';
import { HeroImage } from '@/components/hero-image';
import { abilityImageUrl, itemImageUrl } from '@/utils/images';
import { formatPercent, formatNumber } from '@/utils/format';
import {
  PRIMARY_ATTR_LABELS,
  PRIMARY_ATTR_COLORS,
} from '@/utils/constants';
import { cn } from '@/lib/utils';
import type { HeroStat, AbilityInfo, ItemInfo, HeroItemPopularity } from '@/types';

export default function HeroDetailPage() {
  const params = useParams<{ id: string }>();
  const heroId = Number(params.id);
  const { data: rawHeroes, isLoading, isError, refetch } = useHeroStats();
  const heroes = rawHeroes as HeroStat[] | undefined;
  const { isFavorite, toggleFavorite } = useFavorites();

  const hero = heroes?.find((h: HeroStat) => h.id === heroId);

  if (isError) {
    return <ErrorState title="Could not load hero" onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return <HeroDetailSkeleton />;
  }

  if (!hero) {
    return (
      <EmptyState
        title="Hero not found"
        message="This hero does not exist or has no data."
        action={
          <Link href="/heroes">
            <Button variant="outline">Back to Heroes</Button>
          </Link>
        }
      />
    );
  }

  const wr = (hero.pub_win ?? 0) / Math.max(hero.pub_pick ?? 1, 1);
  const fav = isFavorite('hero', hero.id);
  const attr = hero.primary_attr;
  const attrColor = PRIMARY_ATTR_COLORS[attr] ?? '#888';

  const proPicks = hero.pro_pick_count ?? hero.pro_pick ?? 0;
  const proWins = hero.pro_win_count ?? hero.pro_win ?? 0;
  const proBans = hero.pro_ban_count ?? hero.pro_ban ?? 0;
  const proWinRate = proPicks > 0 ? proWins / proPicks : 0;

  const proData = [
    { name: 'Picks', value: proPicks, fill: 'hsl(var(--chart-2))' },
    { name: 'Wins', value: proWins, fill: 'hsl(var(--success))' },
    { name: 'Bans', value: proBans, fill: 'hsl(var(--destructive))' },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/heroes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Heroes
      </Link>

      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass relative overflow-hidden rounded-2xl"
      >
        <div className="relative h-48 overflow-hidden sm:h-64">
          <HeroImage
            name={hero.name}
            localizedName={hero.localized_name}
            className="h-full w-full"
            imgClassName="object-cover object-top"
            sizes="(max-width: 640px) 100vw, 640px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
        </div>
        <div className="relative -mt-16 px-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span
                  className="rounded-md px-2 py-1 text-xs font-bold uppercase"
                  style={{ color: attrColor, backgroundColor: `${attrColor}1a` }}
                >
                  {PRIMARY_ATTR_LABELS[attr] ?? attr}
                </span>
                <span className="text-xs text-muted-foreground">
                  {hero.attack_type}
                </span>
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {hero.localized_name ?? hero.name}
              </h1>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {hero.roles?.map((role: string) => (
                  <span
                    key={role}
                    className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <Button
              variant={fav ? 'default' : 'outline'}
              onClick={() =>
                toggleFavorite({
                  type: 'hero',
                  refId: hero.id,
                  name: hero.localized_name ?? hero.name,
                  image: hero.img,
                })
              }
            >
              <Star className={cn('mr-2 h-4 w-4', fav && 'fill-current')} />
              {fav ? 'Favorited' : 'Add to Favorites'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Pro stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pub Win Rate"
          value={formatPercent(wr)}
          icon={TrendingUp}
          accent={wr >= 0.5 ? 'success' : 'destructive'}
          delay={0}
        />
        <StatCard
          label="Pro Picks"
          value={formatNumber(proPicks)}
          icon={Users}
          accent="chart"
          delay={0.05}
        />
        <StatCard
          label="Pro Win Rate"
          value={formatPercent(proWinRate)}
          icon={Activity}
          accent={proWinRate >= 0.5 ? 'success' : 'warning'}
          delay={0.1}
        />
        <StatCard
          label="Pro Bans"
          value={formatNumber(proBans)}
          icon={Shield}
          accent="destructive"
          delay={0.15}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="abilities">Abilities</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Base attributes */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Base Attributes
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <AttrBox icon={Heart} label="Health" value={hero.base_health ?? 0} color="text-destructive" />
              <AttrBox icon={Zap} label="Mana" value={hero.base_mana ?? 0} color="text-chart-2" />
              <AttrBox icon={Shield} label="Armor" value={hero.base_armor ?? 0} color="text-chart-4" />
              <AttrBox icon={Swords} label="Attack" value={`${hero.base_attack_min ?? 0}-${hero.base_attack_max ?? 0}`} color="text-warning" />
              <AttrBox icon={Gauge} label="Move Speed" value={hero.move_speed ?? 0} color="text-primary" />
              <AttrBox icon={Crosshair} label="Attack Range" value={hero.attack_range ?? 0} color="text-chart-5" />
            </div>
          </motion.div>

          {/* STR / AGI / INT with gains */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Primary Stats &amp; Gains
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatGain
                label="Strength"
                base={hero.base_str ?? 0}
                gain={hero.str_gain ?? 0}
                color={PRIMARY_ATTR_COLORS.str ?? '#ef4444'}
                highlighted={attr === 'str'}
              />
              <StatGain
                label="Agility"
                base={hero.base_agi ?? 0}
                gain={hero.agi_gain ?? 0}
                color={PRIMARY_ATTR_COLORS.agi ?? '#22c55e'}
                highlighted={attr === 'agi'}
              />
              <StatGain
                label="Intelligence"
                base={hero.base_int ?? 0}
                gain={hero.int_gain ?? 0}
                color={PRIMARY_ATTR_COLORS.int ?? '#3b82f6'}
                highlighted={attr === 'int'}
              />
            </div>
          </motion.div>

          {/* Pro pick/win/ban chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Professional Pick / Win / Ban
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={proData}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => formatNumber(v)}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                  formatter={(v: number) => [formatNumber(v), '']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {proData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </TabsContent>

        {/* Abilities tab */}
        <TabsContent value="abilities">
          <AbilitiesSection heroName={hero.name} />
        </TabsContent>

        {/* Items tab */}
        <TabsContent value="items">
          <ItemsSection heroId={hero.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HeroDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <ChartSkeleton />
    </div>
  );
}

function AttrBox({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
      <Icon className={cn('mb-2 h-5 w-5', color)} />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function StatGain({
  label,
  base,
  gain,
  color,
  highlighted,
}: {
  label: string;
  base: number;
  gain: number;
  color: string;
  highlighted: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-colors',
        highlighted
          ? 'border-primary/40 bg-primary/5'
          : 'border-border/40 bg-muted/20'
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {highlighted && (
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase"
            style={{ color, backgroundColor: `${color}1a` }}
          >
            Primary
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Base</p>
          <p className="text-2xl font-bold text-foreground">{base}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Gain / lvl</p>
          <p className="text-xl font-semibold" style={{ color }}>
            +{gain.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}

function AbilitiesSection({ heroName }: { heroName: string }) {
  const { data: rawAbilities, isLoading, isError } = useAbilityConstants();
  const abilities = rawAbilities as Record<string, AbilityInfo> | undefined;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !abilities) {
    return <EmptyState icon={Sparkles} title="Abilities unavailable" message="Could not load ability data." />;
  }

  const heroKey = heroName.replace(/^npc_dota_hero_/, '');
  const heroAbilities = Object.entries(abilities)
    .filter(([key, ab]) => {
      if (ab.is_talent) return false;
      if (ab.is_passive && !ab.dname) return false;
      return key.startsWith(heroKey + '_');
    })
    .sort((a, b) => {
      if (a[1].is_ultimate && !b[1].is_ultimate) return 1;
      if (!a[1].is_ultimate && b[1].is_ultimate) return -1;
      return 0;
    });

  if (heroAbilities.length === 0) {
    return <EmptyState icon={Sparkles} title="No abilities found" message={`Could not find abilities for ${heroName}.`} />;
  }

  return (
    <div className="space-y-3">
      {heroAbilities.map(([key, ab]) => {
        const img = abilityImageUrl(ab.img);
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex gap-4">
              <div className="shrink-0">
                {img ? (
                  <img
                    src={img}
                    alt={ab.dname ?? key}
                    className="h-14 w-14 rounded-lg border border-border/40 bg-muted/20 object-contain p-1"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border/40 bg-muted/20">
                    <Sparkles className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground">
                    {ab.dname ?? key}
                  </h4>
                  {ab.is_ultimate && (
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                      Ultimate
                    </span>
                  )}
                  {ab.is_passive && (
                    <span className="rounded-md bg-muted/40 px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                      Passive
                    </span>
                  )}
                  {ab.damage_type && (
                    <span className="rounded-md bg-muted/40 px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                      {ab.damage_type}
                    </span>
                  )}
                </div>
                {ab.desc && (
                  <p className="mt-1 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: ab.desc }} />
                )}
                {ab.lore && (
                  <p className="mt-1 text-xs italic text-muted-foreground/70" dangerouslySetInnerHTML={{ __html: ab.lore }} />
                )}
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {ab.cooldown && (
                    <span><span className="font-medium text-foreground">CD:</span> {ab.cooldown}</span>
                  )}
                  {ab.mana_cost && (
                    <span><span className="font-medium text-foreground">Mana:</span> {ab.mana_cost}</span>
                  )}
                  {ab.cast_range != null && (
                    <span><span className="font-medium text-foreground">Range:</span> {ab.cast_range}</span>
                  )}
                </div>
                {ab.aghanim_upgrade && (
                  <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-2">
                    <p className="text-xs font-semibold text-primary">Aghanim's Scepter</p>
                    <p className="mt-0.5 text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: ab.aghanim_upgrade }} />
                  </div>
                )}
                {ab.shard_upgrade && (
                  <div className="mt-2 rounded-lg border border-chart-4/20 bg-chart-4/5 p-2">
                    <p className="text-xs font-semibold text-chart-4">Aghanim's Shard</p>
                    <p className="mt-0.5 text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: ab.shard_upgrade }} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function ItemsSection({ heroId }: { heroId: number }) {
  const { data: rawPopularity, isLoading: popLoading } = useHeroItemPopularity(heroId);
  const popularity = rawPopularity as HeroItemPopularity[] | undefined;
  const { data: rawItems, isLoading: itemsLoading } = useItemConstants();
  const items = rawItems as Record<string, ItemInfo> | undefined;

  if (popLoading || itemsLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-6">
            <Skeleton className="mb-4 h-5 w-32" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, j) => (
                <Skeleton key={j} className="h-16 w-16" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!popularity || popularity.length === 0 || !items) {
    return <EmptyState icon={Package} title="No item data" message="Item popularity data is not available for this hero." />;
  }

  const latest = popularity[popularity.length - 1];
  if (!latest) {
    return <EmptyState icon={Package} title="No item data" message="Item popularity data is not available for this hero." />;
  }

  const pickRates = latest.pickrate ?? {};
  const winRates = latest.winrate ?? {};

  const sortedItems = Object.entries(pickRates)
    .filter(([name]) => items[name])
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, 12);

  const topItems = sortedItems.slice(0, 6);
  const lateItems = sortedItems.slice(6, 12);

  return (
    <div className="space-y-6">
      <ItemGrid title="Popular Items" items={topItems} itemConstants={items} winRates={winRates} />
      {lateItems.length > 0 && (
        <ItemGrid title="Late Game / Situational" items={lateItems} itemConstants={items} winRates={winRates} />
      )}
    </div>
  );
}

function ItemGrid({
  title,
  items: entries,
  itemConstants,
  winRates,
}: {
  title: string;
  items: [string, number][];
  itemConstants: Record<string, ItemInfo>;
  winRates: Record<string, number>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {entries.map(([name, pickRate]) => {
          const info = itemConstants[name];
          const img = itemImageUrl(info?.img);
          const wr = winRates[name];
          return (
            <div
              key={name}
              className="group relative flex flex-col items-center gap-1.5 rounded-lg border border-border/40 bg-muted/20 p-3 transition-colors hover:border-primary/40"
            >
              {img ? (
                <img
                  src={img}
                  alt={info?.dname ?? name}
                  className="h-12 w-12 object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <p className="truncate text-xs font-medium text-foreground" title={info?.dname ?? name}>
                {info?.dname ?? name}
              </p>
              <div className="flex w-full justify-between text-[10px] text-muted-foreground">
                <span>{formatPercent(pickRate)} pick</span>
                {wr != null && (
                  <span className={wr >= 0.5 ? 'text-success' : 'text-destructive'}>
                    {formatPercent(wr)} win
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
