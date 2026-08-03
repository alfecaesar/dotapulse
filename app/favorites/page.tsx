'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Star,
  Users,
  Trash2,
  ArrowRight,
  Swords,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFavorites } from '@/hooks/use-favorites';
import { HeroImage } from '@/components/hero-image';
import { timeAgo } from '@/utils/format';

export default function FavoritesPage() {
  const { favorites, removeFavorite, clearAll, hydrated } = useFavorites();

  const heroes = favorites.filter((f) => f.type === 'hero');
  const players = favorites.filter((f) => f.type === 'player');

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <PageHeader title="Favorites" description="Your saved heroes and players." icon={Heart} />
        <div className="h-40 animate-pulse rounded-xl bg-muted/30" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Favorites" description="Your saved heroes and players." icon={Heart} />
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          message="Star heroes and players to keep them here for quick access."
          action={
            <Link href="/heroes">
              <Button variant="outline">
                <Swords className="mr-2 h-4 w-4" />
                Browse Heroes
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Favorites"
        description="Your saved heroes and players, stored locally on this device."
        icon={Heart}
        actions={
          favorites.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear all
            </Button>
          )
        }
      />

      <Tabs defaultValue="heroes" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="heroes">
            <Star className="mr-2 h-4 w-4" />
            Heroes ({heroes.length})
          </TabsTrigger>
          <TabsTrigger value="players">
            <Users className="mr-2 h-4 w-4" />
            Players ({players.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="heroes">
          {heroes.length === 0 ? (
            <EmptyState icon={Star} title="No favorite heroes" message="Star heroes from the Hero Explorer to add them here." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              <AnimatePresence>
                {heroes.map((fav, i) => (
                  <motion.div
                    key={fav.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                    className="card-hover glass group relative overflow-hidden rounded-xl"
                  >
                    <Link href={`/heroes/${fav.refId}`}>
                      <div className="relative h-28 overflow-hidden">
                        <HeroImage
                          name={fav.image}
                          localizedName={fav.name}
                          className="h-full w-full"
                          imgClassName="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                      </div>
                      <div className="p-3">
                        <p className="truncate text-sm font-semibold text-foreground">{fav.name}</p>
                        <p className="text-xs text-muted-foreground">Added {timeAgo(fav.addedAt / 1000)}</p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFavorite(fav.id)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/60 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove favorite"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="players">
          {players.length === 0 ? (
            <EmptyState icon={Users} title="No favorite players" message="Add players from their profile page to see them here." />
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {players.map((fav, i) => (
                  <motion.div
                    key={fav.id}
                    layout
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <div className="card-hover glass flex items-center gap-4 rounded-lg p-3">
                      <Link href={`/players/${fav.refId}`} className="flex flex-1 items-center gap-3">
                        <img
                          src={fav.image ?? ''}
                          alt={fav.name}
                          className="h-12 w-12 rounded-full object-cover"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{fav.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {fav.refId}</p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2">
                        <Link href={`/players/${fav.refId}`}>
                          <Button variant="ghost" size="icon" aria-label="View profile">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFavorite(fav.id)}
                          aria-label="Remove favorite"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
