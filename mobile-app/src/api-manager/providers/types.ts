import {
  GameGenres,
  GlobalAchievement,
  OwnedGames,
  PlayerAchievement,
  PlayerFriends,
  PlayersInfo,
  PlayerStats,
  RecentPlayedGames,
  SteamNews,
} from '@gamelog/api-manager/dto';

export type ApiProvider = 'steam' | 'backend';

export type ApiClient = {
  getGameNews: (appId: string, count: number, maxLength: number) => Promise<SteamNews>;
  getGlobalAchievement: (appId: string) => Promise<GlobalAchievement>;
  getAllPlayerAchievementsPerApp: (appId: string, steamId: string) => Promise<PlayerAchievement>;
  getCompletedPlayerAchievementsAndStatsPerApp: (
    appId: string,
    steamId: string
  ) => Promise<PlayerStats>;
  getPlayersInfo: (steamIds: string[]) => Promise<PlayersInfo>;
  getPlayerFriendsInfo: (steamId: string, includePending: boolean) => Promise<PlayerFriends>;
  getOwnedGames: (steamId: string, includeFreeGame: boolean) => Promise<OwnedGames>;
  getRecentPlayedGames: (steamId: string, count: number) => Promise<RecentPlayedGames>;
  getGameGenres: (appId: string) => Promise<GameGenres>;
};
