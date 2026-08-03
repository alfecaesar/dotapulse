// OpenDota API type definitions

export type PrimaryAttr = 'str' | 'agi' | 'int' | 'all';

export type AttackType = 'Melee' | 'Ranged';

export type HeroRole =
  | 'Carry'
  | 'Support'
  | 'Nuker'
  | 'Disabler'
  | 'Jungler'
  | 'Durable'
  | 'Escape'
  | 'Pusher'
  | 'Initiator';

export interface Hero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: PrimaryAttr;
  attack_type: AttackType;
  roles: string[];
  img: string;
  icon: string;
  base_health: number;
  base_health_regen: number;
  base_mana: number;
  base_mana_regen: number;
  base_armor: number;
  base_mr: number;
  base_attack_min: number;
  base_attack_max: number;
  base_str: number;
  base_agi: number;
  base_int: number;
  str_gain: number;
  agi_gain: number;
  int_gain: number;
  attack_range: number;
  projectile_speed: number;
  attack_rate: number;
  move_speed: number;
  turn_rate: number;
  legs: number;
  cm_enabled: boolean;
}

export interface HeroStat {
  id: number;
  name: string;
  localized_name?: string;
  img: string;
  icon: string;
  primary_attr: PrimaryAttr;
  attack_type: AttackType;
  roles: string[];
  pick1?: number;
  pick2?: number;
  pick3?: number;
  pick4?: number;
  pick5?: number;
  pick6?: number;
  pick7?: number;
  pick8?: number;
  pick9?: number;
  pick10?: number;
  pick11?: number;
  pick12?: number;
  pick13?: number;
  pick14?: number;
  pick15?: number;
  pick16?: number;
  pick17?: number;
  pick18?: number;
  pick19?: number;
  pick20?: number;
  pick21?: number;
  pick22?: number;
  ban1?: number;
  ban2?: number;
  ban3?: number;
  ban4?: number;
  ban5?: number;
  ban6?: number;
  ban7?: number;
  ban8?: number;
  win_count?: number;
  pick_count?: number;
  ban_count?: number;
  pro_pick_count?: number;
  pro_win_count?: number;
  pro_ban_count?: number;
  pro_pick?: number;
  pro_win?: number;
  pro_ban?: number;
  pub_pick_count?: number;
  pub_win_count?: number;
  pub_ban_count?: number;
  turbo_pick_count?: number;
  turbo_win_count?: number;
  turbo_picks?: number;
  turbo_wins?: number;
  pub_pick?: number;
  pub_win?: number;
  pub_ban?: number;
  pub_win_rate?: number;
  pro_win_rate?: number;
  turbo_win_rate?: number;
  pick_rate?: number;
  ban_rate?: number;
  base_health?: number;
  base_health_regen?: number;
  base_mana?: number;
  base_mana_regen?: number;
  base_armor?: number;
  base_mr?: number;
  base_attack_min?: number;
  base_attack_max?: number;
  base_str?: number;
  base_agi?: number;
  base_int?: number;
  str_gain?: number;
  agi_gain?: number;
  int_gain?: number;
  attack_range?: number;
  projectile_speed?: number;
  attack_rate?: number;
  move_speed?: number;
  turn_rate?: number;
  legs?: number;
  cm_enabled?: boolean;
}

export interface PlayerProfile {
  account_id: number;
  personaname: string;
  name: string | null;
  avatar: string | null;
  avatarmedium: string | null;
  avatarfull: string | null;
  profileurl: string | null;
  last_login: string | null;
  loccountrycode?: string | null;
  plus?: boolean;
  cheese?: { is_available?: boolean; gcm_status?: number };
}

export interface Player {
  account_id: number;
  profile: PlayerProfile;
  mmr_estimate?: {
    estimate: number | null;
    stdDev: number | null;
    n: number | null;
  };
  leaderboard_rank?: number | null;
  competitive_rank?: number | null;
  competitive_rank_tier?: number | null;
  rank_tier?: number | null;
  solo_competitive_rank?: string | null;
  tracked_until?: string | null;
  steamid?: string | null;
}

export interface WinLoss {
  win: number;
  lose: number;
}

export interface RecentMatch {
  match_id: number;
  player_slot: number;
  radiant_win: boolean | null;
  duration: number;
  game_mode: number;
  lobby_type: number;
  id: number;
  start_time: number;
  version: number | null;
  kills: number;
  deaths: number;
  assists: number;
  skill: number | null;
  lane: number | null;
  lane_role: number | null;
  is_roaming: boolean | null;
  cluster: number | null;
  leaver_status: number | null;
  party_size: number | null;
  item_0: number;
  item_1: number;
  item_2: number;
  item_3: number;
  item_4: number;
  item_5: number;
  item_neutral: number;
  gold_per_min: number;
  xp_per_min: number;
  last_hits: number;
  denies: number;
  total_xp: number;
  gold: number;
  gold_spent: number;
  hero_damage: number;
  tower_damage: number;
  hero_healing: number;
  level: number;
  stuns: number;
  creeps_stacked: number;
  rune_pickups: number;
  obs_placed: number;
  sen_placed: number;
  purchase_count?: number;
  team_win?: boolean;
  win?: boolean;
}

export interface PlayerHero {
  id: number;
  last_played: number;
  games: number;
  win: number;
  with_games: number;
  with_win: number;
  against_games: number;
  against_win: number;
  name: string;
  localized_name?: string;
  img: string;
  icon: string;
  primary_attr?: PrimaryAttr;
  attack_type?: AttackType;
  roles?: string[];
}

export interface MatchPlayer {
  match_id: number;
  player_slot: number;
  account_id: number | null;
  assists: number;
  deaths: number;
  denies: number;
  gold: number;
  gold_per_min: number;
  gold_spent: number;
  hero_damage: number;
  hero_healing: number;
  id: number;
  item_0: number;
  item_1: number;
  item_2: number;
  item_3: number;
  item_4: number;
  item_5: number;
  item_neutral: number;
  kills: number;
  last_hits: number;
  level: number;
  leaver_status: number;
  party_id: number | null;
  player_index?: number;
  isRadiant?: boolean;
  win?: boolean;
  personaname?: string | null;
  name?: string | null;
  rank_tier?: number | null;
  obs_placed: number;
  sen_placed: number;
  rune_pickups: number;
  stuns: number;
  tower_damage: number;
  xp_per_min: number;
  total_xp: number;
  purchase?: Record<string, number>;
  ability_upgrades?: Array<{ ability: number; level: number; time: number }>;
  ability_uses?: Record<string, number>;
  item_uses?: Record<string, number>;
  damage_targets?: Record<string, number>;
  actions_per_min?: number;
  pings?: number;
  purchase_time?: Record<string, number>;
  first_purchase_time?: Record<string, number>;
  item_win?: Record<string, number>;
  item_usage?: Record<string, number>;
  lane_pos?: Record<string, Record<string, number>>;
  observed?: number;
  spectator_count?: number;
  total_gold?: number;
  team_number?: number;
  net_worth?: number;
  damage_taken?: number;
  damage_inflictor?: Record<string, number>;
  damage_inflictor_received?: Record<string, number>;
  healing_received?: number;
  life_state?: Record<string, number>;
  life_state_dead?: number;
  scaled_hero_damage?: number;
  scaled_tower_damage?: number;
  scaled_hero_healing?: number;
  kills_per_min?: number;
  abandoned?: boolean;
  item_neutral_name?: string;
  permanent_buffs?: Array<{ permanent_buff: number; stack_count: number }>;
  click_count?: number;
  pred_vict?: number;
  runeword?: Record<string, number>;
  movement?: Record<string, number>;
  lane_role: number | null;
  is_roaming: boolean | null;
  cluster: number | null;
  version: number | null;
  skill: number | null;
  party_size: number | null;
  start_time: number;
  duration: number;
  game_mode: number;
  lobby_type: number;
  radiant_win: boolean | null;
  lane: number | null;
  creeps_stacked: number;
  obs?: number;
  sen?: number;
}

export interface Match {
  match_id: number;
  duration: number;
  start_time: number;
  radiant_win: boolean | null;
  radiant_score: number | null;
  dire_score: number | null;
  radiant_team_id?: number | null;
  dire_team_id?: number | null;
  leagueid?: number | null;
  series_type?: number | null;
  series_id?: number | null;
  cluster: number | null;
  game_mode: number;
  lobby_type: number;
  patch: number | null;
  region: number | null;
  skill: number | null;
  barracks_status_dire?: number;
  barracks_status_radiant?: number;
  first_blood_time: number;
  tower_status_dire: number;
  tower_status_radiant: number;
  replay_salt?: string | null;
  replay_url?: string | null;
  players: MatchPlayer[];
  objectives?: Array<{
    time: number;
    type: string;
    slot?: number;
    player_slot?: number;
    key?: string;
  }>;
  picks_bans?: Array<{
    is_pick: boolean;
    id: number;
    team: number;
    order: number;
  }>;
  draft_timings?: Array<{
    order: number;
    active_team: number;
    pick: boolean;
    id: number | null;
    player_slot: number | null;
    time: number;
  }>;
  radiant_gold_adv?: number[];
  radiant_xp_adv?: number[];
  teamfights?: Array<{
    start: number;
    end: number;
    last_death: number;
    deaths: number;
    radiant_deaths: number;
    radiant_gold_delta: number;
    radiant_xp_delta: number;
    players: Array<{
      deaths: number;
      kills: number;
      gold_delta: number;
      xp_delta: number;
      damage: number;
      healing: number;
      slot: number;
    }>;
  }>;
  version: number | null;
  cosmetics?: Record<string, number>;
  engine?: number;
  throw?: number;
  comeback?: number;
  loss?: number;
  win?: number;
  replay?: string;
  language?: number;
  skill_ranked?: number;
  lobby_name?: string | null;
  dire_team?: { team_id: number; name: string; tag: string; logo_url?: string } | null;
  radiant_team?: { team_id: number; name: string; tag: string; logo_url?: string } | null;
  human_players?: number;
  league?: { leagueid: number; name: string } | null;
}

export interface ProMatch {
  match_id: number;
  duration: number;
  start_time: number;
  radiant_team_id: number | null;
  dire_team_id: number | null;
  leagueid: number | null;
  league_name: string | null;
  series_id: number | null;
  series_type: number | null;
  radiant_score?: number;
  dire_score?: number;
  radiant_win: boolean;
  radiant_name?: string;
  dire_name?: string;
  radiant_team?: string;
  dire_team?: string;
  radiant_logo?: string;
  dire_logo?: string;
  cluster: number | null;
  game_mode: number | null;
  patch: number | null;
  region: number | null;
}

export interface PublicMatch {
  match_id: number;
  duration: number;
  start_time: number;
  radiant_win: boolean;
  radiant_team_comp?: string;
  dire_team_comp?: string;
  avg_mmr: number;
  num_mmr: number;
  lobby_type: number;
  game_mode: number;
  cluster: number;
  radiant_team?: string;
  dire_team?: string;
}

export interface HealthStatus {
  status: string;
  server_count?: number;
  last_added?: number;
  last_query?: number;
  metrics?: Record<string, number>;
}

export type GameModeId =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23;

export interface PlayerSearchResult {
  account_id: number;
  personaname: string;
  name: string | null;
  avatar: string | null;
  avatarmedium: string | null;
  avatarfull: string | null;
  profileurl: string | null;
  last_match_time?: string | null;
  similarity?: number;
  previous_account_id?: number | null;
}

export interface FavoriteItem {
  id: string;
  type: 'hero' | 'player';
  refId: number;
  name: string;
  image?: string | null;
  addedAt: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

// ─── Ability / Item constants ────────────────────────────────────────────────

export interface AbilityInfo {
  id: number;
  name: string;
  dname?: string;
  img?: string;
  desc?: string;
  lore?: string;
  attrib?: string;
  cmb?: string;
  aghanim_upgrade?: string;
  shard_upgrade?: string;
  behavior?: string;
  target_team?: string;
  target_type?: string;
  damage_type?: string;
  bkbpierce?: string;
  dispellable?: string;
  cast_range?: number;
  cast_point?: number;
  channel_time?: number;
  cooldown?: string;
  mana_cost?: string;
  is_autocast?: boolean;
  is_passive?: boolean;
  is_ultimate?: boolean;
  is_talent?: boolean;
  max_level?: number;
  ability_has_scepter_upgrade?: boolean;
  ability_has_shard_upgrade?: boolean;
}

export interface ItemInfo {
  id: number;
  name: string;
  dname?: string;
  img?: string;
  cost?: number;
  desc?: string;
  notes?: string;
  attrib?: string;
  components?: string[];
  lore?: string;
  active?: boolean;
  passive?: boolean;
  recipe?: boolean;
}

export interface HeroItemPopularity {
  start_time: number;
  winrate?: Record<string, number>;
  pickrate?: Record<string, number>;
}

export interface HeroConstants {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: PrimaryAttr;
  attack_type: AttackType;
  roles: string[];
  img: string;
  icon: string;
  base_health: number;
  base_mana: number;
  base_armor: number;
  base_attack_min: number;
  base_attack_max: number;
  move_speed: number;
  attack_range: number;
  projectile_speed?: number;
  attack_rate?: number;
  base_str: number;
  base_agi: number;
  base_int: number;
  str_gain: number;
  agi_gain: number;
  int_gain: number;
  turn_rate?: number;
  legs?: number;
  cm_enabled?: boolean;
  disabled?: boolean;
}

export interface AbilityUpgrade {
  ability: number;
  level: number;
  time: number;
}

export interface UpcomingProMatch {
  match_id?: number;
  team_radiant?: string;
  team_dire?: string;
  radiant_team_id?: number;
  dire_team_id?: number;
  league_name?: string;
  league_id?: number;
  series_type?: number;
  series_id?: number;
  start_time?: number;
  status?: number;
  game_mode?: number;
  cluster?: number;
  radiant_score?: number;
  dire_score?: number;
  radiant_win?: boolean;
  duration?: number;
  sort_attrs?: string;
  deleted?: boolean;
  radiant_team?: { team_id: number; name: string; tag: string; logo_url?: string };
  dire_team?: { team_id: number; name: string; tag: string; logo_url?: string };
}
