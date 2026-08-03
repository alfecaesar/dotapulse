'use client';

import {
  useQuery,
  keepPreviousData,
} from '@tanstack/react-query';
import { opendotaService } from '@/services/opendota';
import { QUERY_KEYS, STALE_TIME } from '@/utils/constants';
import type {
  HeroStat,
  Player,
  WinLoss,
  RecentMatch,
  PlayerHero,
  Match,
  ProMatch,
  PublicMatch,
  HealthStatus,
  PlayerSearchResult,
  AbilityInfo,
  ItemInfo,
  HeroItemPopularity,
  HeroConstants,
  UpcomingProMatch,
} from '@/types';

export function useHeroes() {
  return useQuery({
    queryKey: QUERY_KEYS.heroStats,
    queryFn: (): Promise<HeroStat[]> => opendotaService.getHeroStats(),
    staleTime: STALE_TIME.static,
    gcTime: STALE_TIME.static,
  });
}

export function useHeroStats() {
  return useQuery({
    queryKey: QUERY_KEYS.heroStats,
    queryFn: (): Promise<HeroStat[]> => opendotaService.getHeroStats(),
    staleTime: STALE_TIME.static,
    gcTime: STALE_TIME.static,
  });
}

export function useHeroConstants() {
  return useQuery({
    queryKey: QUERY_KEYS.heroConstants,
    queryFn: (): Promise<Record<string, HeroConstants>> =>
      opendotaService.getHeroConstants(),
    staleTime: STALE_TIME.constants,
    gcTime: STALE_TIME.constants,
  });
}

export function useAbilityConstants() {
  return useQuery({
    queryKey: QUERY_KEYS.abilityConstants,
    queryFn: (): Promise<Record<string, AbilityInfo>> =>
      opendotaService.getAbilityConstants(),
    staleTime: STALE_TIME.constants,
    gcTime: STALE_TIME.constants,
  });
}

export function useItemConstants() {
  return useQuery({
    queryKey: QUERY_KEYS.itemConstants,
    queryFn: (): Promise<Record<string, ItemInfo>> =>
      opendotaService.getItemConstants(),
    staleTime: STALE_TIME.constants,
    gcTime: STALE_TIME.constants,
  });
}

export function useHeroItemPopularity(heroId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.heroItemPopularity(heroId ?? 0),
    queryFn: (): Promise<HeroItemPopularity[]> =>
      opendotaService.getHeroItemPopularity(heroId!),
    enabled: heroId != null && heroId > 0,
    staleTime: STALE_TIME.static,
  });
}

export function usePlayer(accountId: number | string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.player(accountId ?? ''),
    queryFn: (): Promise<Player> => opendotaService.getPlayer(accountId!),
    enabled: accountId != null && accountId !== '',
    staleTime: STALE_TIME.standard,
  });
}

export function usePlayerWL(accountId: number | string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.playerWL(accountId ?? ''),
    queryFn: (): Promise<WinLoss> => opendotaService.getPlayerWL(accountId!),
    enabled: accountId != null && accountId !== '',
    staleTime: STALE_TIME.standard,
  });
}

export function usePlayerRecentMatches(accountId: number | string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.playerRecentMatches(accountId ?? ''),
    queryFn: (): Promise<RecentMatch[]> =>
      opendotaService.getPlayerRecentMatches(accountId!),
    enabled: accountId != null && accountId !== '',
    staleTime: STALE_TIME.standard,
  });
}

export function usePlayerHeroes(accountId: number | string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.playerHeroes(accountId ?? ''),
    queryFn: (): Promise<PlayerHero[]> =>
      opendotaService.getPlayerHeroes(accountId!),
    enabled: accountId != null && accountId !== '',
    staleTime: STALE_TIME.standard,
  });
}

export function useMatch(matchId: number | string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.match(matchId ?? ''),
    queryFn: (): Promise<Match> => opendotaService.getMatch(matchId!),
    enabled: matchId != null && matchId !== '',
    staleTime: STALE_TIME.standard,
  });
}

export function useProMatches() {
  return useQuery({
    queryKey: QUERY_KEYS.proMatches(),
    queryFn: (): Promise<ProMatch[]> => opendotaService.getProMatches(),
    staleTime: STALE_TIME.live,
  });
}

export function useLiveMatches() {
  return useQuery({
    queryKey: ['liveMatches'],
    queryFn: (): Promise<UpcomingProMatch[]> => opendotaService.getLiveMatches(),
    staleTime: STALE_TIME.live,
    refetchInterval: 60_000,
  });
}

export function usePublicMatches(mmr?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.publicMatches(mmr),
    queryFn: (): Promise<PublicMatch[]> =>
      opendotaService.getPublicMatches({ mmr }),
    staleTime: STALE_TIME.live,
    placeholderData: keepPreviousData,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.health,
    queryFn: (): Promise<HealthStatus> => opendotaService.getHealth(),
    staleTime: STALE_TIME.live,
    refetchInterval: 60_000,
  });
}

export function useSearchPlayers(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.search(query),
    queryFn: (): Promise<PlayerSearchResult[]> =>
      opendotaService.searchPlayers(query),
    enabled: query.trim().length >= 2,
    staleTime: STALE_TIME.standard,
    placeholderData: keepPreviousData,
  });
}
