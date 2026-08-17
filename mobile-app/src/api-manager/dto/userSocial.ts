export type FriendshipStatus = 'pending_outgoing' | 'pending_incoming' | 'accepted' | 'blocked';

export interface UserRead {
  id: string;
  firebase_uid: string;
  username: string;
  steam_id: string;
  has_steam_api_key: boolean;
}

export interface UserRegisterRequest {
  username: string;
  steam_id: string;
  steam_api_key?: string;
}

export interface FriendshipInfo {
  friendship_id?: string | null;
  friendship_status?: FriendshipStatus | null;
  friendship_requester_id?: string | null;
}

export interface UserSearchResult {
  user: UserRead;
  friendship: FriendshipInfo;
}

export interface Genre {
  id: string;
  description: string;
}

export interface CommonGames {
  gameSteamId: string;
  requester_play_time: number;
  friend_play_time: number;
}

export interface RecommendedTopGame {
  gameSteamId: string;
  keys: Genre[];
}

export interface RecommendationResponse {
  common_games: CommonGames[];
  common_genres: Genre[];
  top_games: RecommendedTopGame[];
}
