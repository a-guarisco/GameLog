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

