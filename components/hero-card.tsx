'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeroImage } from '@/components/hero-image';
import { PRIMARY_ATTR_LABELS, PRIMARY_ATTR_COLORS } from '@/utils/constants';
import { formatPercent } from '@/utils/format';
import type { HeroStat } from '@/types';

export function HeroCard({
  hero,
  index = 0,
  isFavorite,
  onToggleFavorite,
}: {
  hero: HeroStat;
  index?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const winRate =
    hero.pub_win != null && hero.pub_pick != null && hero.pub_pick > 0
      ? hero.pub_win / hero.pub_pick
      : null;
  const pickRate = hero.pub_pick ?? 0;
  const attr = hero.primary_attr;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.4) }}
      whileHover={{ y: -3 }}
      className="card-hover glass group relative overflow-hidden rounded-xl"
    >
      <div className="relative h-32 overflow-hidden">
        <HeroImage
          name={hero.name}
          localizedName={hero.localized_name}
          className="h-full w-full"
          imgClassName="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite();
            }}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm transition-colors hover:bg-background/90"
            aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
          >
            <Star
              className={cn(
                'h-4 w-4',
                isFavorite
                  ? 'fill-warning text-warning'
                  : 'text-muted-foreground'
              )}
            />
          </button>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {hero.localized_name ?? hero.name}
          </h3>
          <span
            className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase"
            style={{
              color: PRIMARY_ATTR_COLORS[attr] ?? '#888',
              backgroundColor: `${PRIMARY_ATTR_COLORS[attr] ?? '#888'}1a`,
            }}
          >
            {PRIMARY_ATTR_LABELS[attr] ?? attr}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {formatPercent(winRate, 1)} WR
          </span>
          <span className="text-muted-foreground">
            {pickRate.toLocaleString()} picks
          </span>
        </div>
        {winRate != null && (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                winRate >= 0.5 ? 'bg-success' : 'bg-destructive'
              )}
              style={{ width: `${winRate * 100}%` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
