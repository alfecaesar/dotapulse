'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  UserSearch,
  ArrowRight,
  History,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/skeletons';
import { EmptyState, ErrorState } from '@/components/states';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchPlayers } from '@/hooks/use-opendota-queries';
import { timeAgo } from '@/utils/format';
import type { PlayerSearchResult } from '@/types';

const RECENT_KEY = 'dotapulse:recent-searches';

function useRecentSearches() {
  const get = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    } catch {
      return [];
    }
  };
  const add = (q: string) => {
    if (typeof window === 'undefined') return;
    const cur = get().filter((s: string) => s !== q);
    localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...cur].slice(0, 8)));
  };
  const clear = () => localStorage.setItem(RECENT_KEY, '[]');
  return { get, add, clear };
}

export default function PlayerSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 400);
  const { data: rawResults, isLoading, isError } = useSearchPlayers(debounced);
  const results = (rawResults ?? []) as PlayerSearchResult[];
  const recent = useRecentSearches();
  const [recentList, setRecentList] = useState<string[]>(() => recent.get());

  const handleDirectId = (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;
    if (/^\d+$/.test(trimmed)) {
      recent.add(trimmed);
      router.push(`/players/${trimmed}`);
    }
  };

  const clearRecent = () => {
    recent.clear();
    setRecentList([]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Player Search"
        description="Search by player name, or enter a Dota 2 account ID to jump straight to a profile."
        icon={Users}
      />

      {/* Search bar */}
      <div className="glass rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or enter account ID…"
            className="pl-9"
            aria-label="Search players"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleDirectId(query);
            }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Tip: enter a numeric account ID and press Enter to go directly to the profile.
        </p>
      </div>

      {/* Recent searches */}
      {recentList.length > 0 && !query && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <History className="h-4 w-4" />
              Recent Searches
            </h2>
            <Button variant="ghost" size="sm" onClick={clearRecent}>
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentList.map((id: string) => (
              <Link
                key={id}
                href={`/players/${id}`}
                className="card-hover glass inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-foreground"
              >
                <UserSearch className="h-3.5 w-3.5 text-muted-foreground" />
                {id}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {query && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Search Results
          </h2>
          {isError ? (
            <ErrorState title="Search failed" message="Could not search players right now." />
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass flex items-center gap-3 rounded-lg p-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon={UserSearch}
              title="No players found"
              message="Try a different name or enter an account ID directly."
            />
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {results.slice(0, 20).map((p: PlayerSearchResult, i: number) => (
                  <motion.div
                    key={p.account_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <Link
                      href={`/players/${p.account_id}`}
                      className="card-hover glass flex items-center gap-4 rounded-lg p-3"
                    >
                      <img
                        src={p.avatarfull ?? p.avatarmedium ?? p.avatar ?? ''}
                        alt={p.personaname}
                        className="h-12 w-12 rounded-full object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {p.personaname}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          ID: {p.account_id}
                          {p.last_match_time && ` · Last match ${timeAgo(p.last_match_time)}`}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
