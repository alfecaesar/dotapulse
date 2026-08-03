import { apiFetch } from './api-client';
import type {
  Hero,
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

export const opendotaService = {
  getHeroes(): Promise<Hero[]> {
    return apiFetch<Hero[]>('/heroStats');
  },

  getHeroStats(): Promise<HeroStat[]> {
    return apiFetch<HeroStat[]>('/heroStats');
  },

  getHeroConstants(): Promise<Record<string, HeroConstants>> {
    return apiFetch<Record<string, HeroConstants>>('/constants/heroes');
  },

  getAbilityConstants(): Promise<Record<string, AbilityInfo>> {
    return apiFetch<Record<string, AbilityInfo>>('/constants/abilities');
  },

  getItemConstants(): Promise<Record<string, ItemInfo>> {
    return apiFetch<Record<string, ItemInfo>>('/constants/items');
  },

  getHeroItemPopularity(heroId: number): Promise<HeroItemPopularity[]> {
    return apiFetch<HeroItemPopularity[]>(`/heroes/${heroId}/itemPopularity`);
  },

  getHeroById(id: number, heroes: Hero[]): Hero | undefined {
    return heroes.find((h) => h.id === id);
  },

  getPlayer(accountId: number | string): Promise<Player> {
    return apiFetch<Player>(`/players/${accountId}`);
  },

  getPlayerWL(accountId: number | string): Promise<WinLoss> {
    return apiFetch<WinLoss>(`/players/${accountId}/wl`);
  },

  getPlayerRecentMatches(accountId: number | string): Promise<RecentMatch[]> {
    return apiFetch<RecentMatch[]>(`/players/${accountId}/recentMatches`);
  },

  getPlayerHeroes(accountId: number | string): Promise<PlayerHero[]> {
    return apiFetch<PlayerHero[]>(`/players/${accountId}/heroes`);
  },

  getMatch(matchId: number | string): Promise<Match> {
    return apiFetch<Match>(`/matches/${matchId}`);
  },

  getProMatches(): Promise<ProMatch[]> {
    return apiFetch<ProMatch[]>('/proMatches');
  },

  getLiveMatches(): Promise<UpcomingProMatch[]> {
    return apiFetch<UpcomingProMatch[]>('/live');
  },

  getPublicMatches(params?: { mmr?: string }): Promise<PublicMatch[]> {
    const query = params?.mmr ? `?mmr_desc=${params.mmr}` : '';
    return apiFetch<PublicMatch[]>(`/publicMatches${query}`);
  },

  getHealth(): Promise<HealthStatus> {
    return apiFetch<HealthStatus>('/health');
  },

  searchPlayers(query: string): Promise<PlayerSearchResult[]> {
    return apiFetch<PlayerSearchResult[]>(`/search?q=${encodeURIComponent(query)}`);
  },
};
