'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

function heroKey(input?: string | null): string {
  if (!input) return 'placeholder';
  let key = input.replace(/^npc_dota_hero_/, '');
  if (key.includes('/')) {
    key = key.split('/').pop() ?? '';
    key = key.replace(/\.\w+$/, '');
  }
  return key || 'placeholder';
}

export function HeroImage({
  name,
  localizedName,
  className,
  imgClassName = 'object-cover',
  sizes = '64px',
}: {
  name?: string | null;
  localizedName?: string | null;
  className?: string;
  imgClassName?: string;
  sizes?: string;
}) {
  const [status, setStatus] = useState<'loading' | 'loaded'>('loading');
  const [errored, setErrored] = useState(false);
  const key = heroKey(name);
  const src = errored ? '/heroes/placeholder.svg' : `/heroes/${key}.png`;
  const alt = localizedName ?? name ?? 'Hero';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {status === 'loading' && (
        <div className="absolute inset-0 shimmer rounded-[inherit]" aria-hidden="true" />
      )}
      <Image
        fill
        src={src}
        alt={alt}
        loading="lazy"
        sizes={sizes}
        className={cn(
          imgClassName,
          'transition-opacity duration-300',
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setStatus('loaded')}
        onError={() => {
          if (!errored) {
            setErrored(true);
            setStatus('loading');
          }
        }}
      />
    </div>
  );
}
