export type CommunityScope = 'global' | 'region' | 'friends';

export interface CommunityGenreHour {
  id: string;
  description: string;
  percentage: number;
}

export interface CommunityPlaytimeResponse {
  user: number[];
  community: number[];
}

export interface CommunityTopGame {
  id: string;
  user_playtime: number;
  community_playtime: number;
}
export type TopGameReference = 'community' | 'user';

import type { GameStatus } from './gameStatus';

export interface CommunityGameStatusItem {
  status: GameStatus;
  count: number;
  percentage: number;
}

export interface CommunityGameStatusResponse {
  user: CommunityGameStatusItem[];
  community: CommunityGameStatusItem[];
  user_num_of_games: number;
  community_num_of_games: number;
}
