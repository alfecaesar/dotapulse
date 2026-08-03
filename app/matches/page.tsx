'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Search, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MatchesPage() {
  const router = useRouter();
  const [matchId, setMatchId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = matchId.trim();
    if (id) router.push(`/matches/${id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Match Analyzer"
        description="Enter a Dota 2 match ID to view a full breakdown — players, scores, gold advantage, and more."
        icon={Activity}
      />

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6">
        <label htmlFor="match-id" className="mb-2 block text-sm font-medium text-foreground">
          Match ID
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="match-id"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              placeholder="e.g. 7123456789"
              className="pl-9"
              inputMode="numeric"
            />
          </div>
          <Button type="submit" disabled={!matchId.trim()}>
            Analyze
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          You can find a match ID from the in-game client, Dota 2 match pages, or OpenDota.
        </p>
      </form>
    </div>
  );
}
