import type { GameModeId } from '@/types';

export const OPENDOTA_API_BASE = 'https://api.opendota.com/api';
export const OPENDOTA_CDN = 'https://cdn.opendota.com' as const;
export const OPENDOTA_IMG_HOST = 'https://cdn.steamstatic.com' as const;

export const QUERY_KEYS = {
  heroes: ['heroes'] as const,
  heroStats: ['heroStats'] as const,
  heroConstants: ['heroConstants'] as const,
  abilityConstants: ['abilityConstants'] as const,
  itemConstants: ['itemConstants'] as const,
  heroItemPopularity: (id: number) => ['heroItemPopularity', id] as const,
  player: (id: number | string) => ['player', String(id)] as const,
  playerWL: (id: number | string) => ['player', String(id), 'wl'] as const,
  playerRecentMatches: (id: number | string) =>
    ['player', String(id), 'recentMatches'] as const,
  playerHeroes: (id: number | string) =>
    ['player', String(id), 'heroes'] as const,
  match: (id: number | string) => ['match', String(id)] as const,
  proMatches: (page?: number) => ['proMatches', page ?? 'all'] as const,
  publicMatches: (mmr?: string) => ['publicMatches', mmr ?? 'all'] as const,
  health: ['health'] as const,
  search: (query: string) => ['search', query] as const,
} as const;

export const STALE_TIME = {
  static: 1000 * 60 * 60 * 24, // 24h - heroes, heroStats
  constants: 1000 * 60 * 60 * 24, // 24h - constants never change
  standard: 1000 * 60 * 5, // 5min - player, match
  live: 1000 * 60, // 1min - health, proMatches
} as const;

export const GAME_MODES: Record<number, string> = {
  0: 'Unknown',
  1: 'All Pick',
  2: 'Captains Mode',
  3: 'Random Draft',
  4: 'Single Draft',
  5: 'All Random',
  6: 'Intro',
  7: 'Diretide',
  8: 'Reverse Captains Mode',
  9: 'Greeviling',
  10: 'Tutorial',
  11: 'Mid Only',
  12: 'Least Played',
  13: 'Limited Heroes',
  14: 'Compendium Matchmaking',
  15: 'Custom',
  16: 'Captains Draft',
  17: 'Balanced Draft',
  18: 'Ability Draft',
  19: 'Event',
  20: 'All Random Death Match',
  21: '1v1 Mid',
  22: 'Ranked All Pick',
  23: 'Turbo',
};

export const LOBBY_TYPES: Record<number, string> = {
  0: 'Normal',
  1: 'Practice',
  2: 'Tournament',
  3: 'Tutorial',
  4: 'Co-op with Bots',
  5: 'Team Match',
  6: 'Solo Queue',
  7: 'Ranked',
  8: 'Solo Mid',
  9: 'Battle Cup',
};

export const REGIONS: Record<number, string> = {
  1: 'US West',
  2: 'US East',
  3: 'Luxembourg',
  5: 'Singapore',
  6: 'Dubai',
  7: 'Australia',
  8: 'Stockholm',
  9: 'Austria',
  10: 'Brazil',
  11: 'South Africa',
  12: 'China TC Shanghai',
  13: 'China UC1',
  14: 'China TC Wuhan',
  15: 'China TC Guangzhou',
  16: 'China TC Beijing',
  17: 'China UC2',
  18: 'Spain',
  19: 'India',
  20: 'China TC Zhejiang',
  25: 'China UC3',
};

export const RANK_TIERS: Record<number, string> = {
  1: 'Herald',
  2: 'Guardian',
  3: 'Crusader',
  4: 'Archon',
  5: 'Legend',
  6: 'Ancient',
  7: 'Divine',
  8: 'Immortal',
};

export const PRIMARY_ATTR_LABELS: Record<string, string> = {
  str: 'Strength',
  agi: 'Agility',
  int: 'Intelligence',
  all: 'Universal',
};

export const PRIMARY_ATTR_COLORS: Record<string, string> = {
  str: '#ef4444',
  agi: '#22c55e',
  int: '#3b82f6',
  all: '#f59e0b',
};

export const SKILL_BRACKETS: Record<number, string> = {
  1: 'Normal',
  2: 'High',
  3: 'Very High',
};

export function getGameMode(id?: number | null): string {
  if (id == null) return 'Unknown';
  return GAME_MODES[id] ?? 'Unknown';
}

export function getLobbyType(id?: number | null): string {
  if (id == null) return 'Unknown';
  return LOBBY_TYPES[id] ?? 'Unknown';
}

export function getRegion(id?: number | null): string {
  if (id == null) return 'Unknown';
  return REGIONS[id] ?? 'Unknown';
}

export function getRankTier(tier?: number | null): string {
  if (tier == null) return 'Unranked';
  const bracket = Math.floor(tier / 10);
  const level = tier % 10;
  const name = RANK_TIERS[bracket] ?? 'Unranked';
  return level > 0 ? `${name} ${level}` : name;
}

export function getSkillBracket(skill?: number | null): string {
  if (skill == null) return 'Unknown';
  return SKILL_BRACKETS[skill] ?? 'Unknown';
}

export const FAVORITES_STORAGE_KEY = 'dotapulse:favorites';
export const THEME_STORAGE_KEY = 'dotapulse:theme';

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/heroes', label: 'Heroes', icon: 'Swords' },
  { href: '/players', label: 'Players', icon: 'Users' },
  { href: '/matches', label: 'Matches', icon: 'Swords' },
  { href: '/pro-matches', label: 'Pro Matches', icon: 'Trophy' },
  { href: '/meta', label: 'Meta', icon: 'BarChart3' },
  { href: '/favorites', label: 'Favorites', icon: 'Heart' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
  { href: '/about', label: 'About', icon: 'Info' },
] as const;

export const ITEMS_PER_PAGE = 20;

export const HERO_ROLES = [
  'Carry',
  'Support',
  'Nuker',
  'Disabler',
  'Jungler',
  'Durable',
  'Escape',
  'Pusher',
  'Initiator',
] as const;

export const GAME_MODE_IDS = Object.keys(GAME_MODES).map(Number) as GameModeId[];
