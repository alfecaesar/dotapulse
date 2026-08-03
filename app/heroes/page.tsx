'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Swords,
  Search,
  ArrowUpDown,
  Star,
  LayoutGrid,
  Rows3,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { HeroCard } from '@/components/hero-card';
import { HeroImage } from '@/components/hero-image';
import { GridSkeleton } from '@/components/skeletons';
import { ErrorState, EmptyState } from '@/components/states';
import { useHeroStats } from '@/hooks/use-opendota-queries';
import { useFavorites } from '@/hooks/use-favorites';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  PRIMARY_ATTR_LABELS,
  HERO_ROLES,
} from '@/utils/constants';
import { cn } from '@/lib/utils';
import type { HeroStat, PrimaryAttr } from '@/types';

type SortKey = 'name' | 'winRate' | 'pickRate' | 'banRate';
type ViewMode = 'grid' | 'table';

export default function HeroesPage() {
  const { data: rawHeroes, isLoading, isError, refetch } = useHeroStats();
  const heroes = rawHeroes as HeroStat[] | undefined;
  const { isFavorite, toggleFavorite } = useFavorites();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [attrFilter, setAttrFilter] = useState<PrimaryAttr | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('winRate');
  const [view, setView] = useState<ViewMode>('grid');

  const filtered: HeroStat[] = useMemo(() => {
    if (!heroes) return [];
    let list: HeroStat[] = [...heroes];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (h: HeroStat) =>
          (h.localized_name ?? h.name).toLowerCase().includes(q) ||
          h.name.toLowerCase().includes(q)
      );
    }

    if (attrFilter !== 'all') {
      list = list.filter((h: HeroStat) => h.primary_attr === attrFilter);
    }

    if (roleFilter !== 'all') {
      list = list.filter((h: HeroStat) => h.roles?.includes(roleFilter));
    }

    list.sort((a: HeroStat, b: HeroStat) => {
      switch (sortKey) {
        case 'name':
          return (a.localized_name ?? a.name).localeCompare(
            b.localized_name ?? b.name
          );
        case 'winRate': {
          const awr = (a.pub_win ?? 0) / Math.max(a.pub_pick ?? 1, 1);
          const bwr = (b.pub_win ?? 0) / Math.max(b.pub_pick ?? 1, 1);
          return bwr - awr;
        }
        case 'pickRate':
          return (b.pub_pick ?? 0) - (a.pub_pick ?? 0);
        case 'banRate':
          return (b.pub_ban ?? 0) - (a.pub_ban ?? 0);
      }
    });

    return list;
  }, [heroes, debouncedSearch, attrFilter, roleFilter, sortKey]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hero Explorer"
        description="Browse every Dota 2 hero. Filter by attribute and role, search by name, and sort by performance."
        icon={Swords}
      />

      {/* Filters */}
      <div className="glass sticky top-16 z-20 rounded-xl p-4 lg:top-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search heroes by name…"
              className="pl-9"
              aria-label="Search heroes"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => v && setView(v as ViewMode)}
              variant="outline"
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Table view">
                <Rows3 className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {filtered.length} hero{filtered.length !== 1 ? 'es' : ''} found
        </p>
      </div>

      {/* Content */}
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <GridSkeleton count={12} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No heroes found"
          message="Try adjusting your search or filters."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setAttrFilter('all');
                setRoleFilter('all');
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((hero: HeroStat, i: number) => (
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
      ) : (
        <HeroTable heroes={filtered} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
      )}
    </div>
  );
}

function HeroTable({
  heroes,
  isFavorite,
  toggleFavorite,
}: {
  heroes: HeroStat[];
  isFavorite: (type: 'hero' | 'player', refId: number) => boolean;
  toggleFavorite: (item: { type: 'hero'; refId: number; name: string; image?: string }) => void;
}) {
  return (
    <div className="glass overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Hero</th>
              <th className="px-4 py-3 font-medium">Attr</th>
              <th className="px-4 py-3 text-right font-medium">Win Rate</th>
              <th className="px-4 py-3 text-right font-medium">Picks</th>
              <th className="px-4 py-3 text-right font-medium">Bans</th>
              <th className="px-4 py-3 text-center font-medium">Fav</th>
            </tr>
          </thead>
          <tbody>
            {heroes.map((hero: HeroStat) => {
              const wr =
                (hero.pub_win ?? 0) / Math.max(hero.pub_pick ?? 1, 1);
              return (
                <tr
                  key={hero.id}
                  className="border-b border-border/40 transition-colors hover:bg-accent/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/heroes/${hero.id}`}
                      className="flex items-center gap-3"
                    >
                      <HeroImage
                        name={hero.name}
                        localizedName={hero.localized_name}
                        className="h-8 w-8 rounded"
                        sizes="32px"
                      />
                      <span className="font-medium text-foreground hover:text-primary">
                        {hero.localized_name ?? hero.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {PRIMARY_ATTR_LABELS[hero.primary_attr] ?? hero.primary_attr}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        'font-semibold',
                        wr >= 0.5 ? 'text-success' : 'text-destructive'
                      )}
                    >
                      {(wr * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {(hero.pub_pick ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {(hero.pub_ban ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        toggleFavorite({
                          type: 'hero',
                          refId: hero.id,
                          name: hero.localized_name ?? hero.name,
                          image: hero.img,
                        })
                      }
                      aria-label="Toggle favorite"
                    >
                      <Star
                        className={cn(
                          'mx-auto h-4 w-4',
                          isFavorite('hero', hero.id)
                            ? 'fill-warning text-warning'
                            : 'text-muted-foreground'
                        )}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
