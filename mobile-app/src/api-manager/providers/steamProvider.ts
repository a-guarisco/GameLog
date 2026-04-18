import { fetchData } from '@gamelog/api-manager/providers/fetchData';
import { ApiClient } from '@gamelog/api-manager/providers/types';

const STEAM_BASE_URL = 'https://api.steampowered.com/';
const STEAM_API_KEY: string = process.env.EXPO_PUBLIC_STEAM_API_KEY;

export const steamApiEndpoints = {
  getNewsForApp: (appId: string, count: number, maxLength: number) =>
    `${STEAM_BASE_URL}ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=${count}&maxlength=${maxLength}`,
  getGlobalAchievementsForApp: (appId: string) =>
    `${STEAM_BASE_URL}ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appId}`,
  getPlayerAchievements: (appId: string, steamId: string) =>
    `${STEAM_BASE_URL}ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${STEAM_API_KEY}&steamid=${steamId}`,
  getPlayersInfo: (steamIds: string[]) =>
    `${STEAM_BASE_URL}ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamIds.join(',')}`,
  getPlayerFriendsList: (steamId: string, includePending: boolean) => {
    const relationship = includePending ? 'all' : 'friend';
    return `${STEAM_BASE_URL}ISteamUser/GetFriendList/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&relationship=${relationship}`;
  },
  getPlayerStats: (appId: string, steamId: string) =>
    `${STEAM_BASE_URL}ISteamUserStats/GetUserStatsForGame/v0002/?appid=${appId}&key=${STEAM_API_KEY}&steamid=${steamId}`,
  getOwnedGames: (steamId: string, includeFreeGame: boolean) =>
    `${STEAM_BASE_URL}IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=${includeFreeGame}`,
  getRecentPlayedGames: (steamId: string, count: number) =>
    `${STEAM_BASE_URL}IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&count=${count}`,
  getGameGenres: (appId: string) =>
    `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=genres`,
};

export const steamApiClient: ApiClient = {
  getGameNews: (appId, count, maxLength) =>
    fetchData(steamApiEndpoints.getNewsForApp(appId, count, maxLength)),

  getGlobalAchievement: (appId) => fetchData(steamApiEndpoints.getGlobalAchievementsForApp(appId)),

  getAllPlayerAchievementsPerApp: (appId, steamId) =>
    fetchData(steamApiEndpoints.getPlayerAchievements(appId, steamId)),

  getCompletedPlayerAchievementsAndStatsPerApp: (appId, steamId) =>
    fetchData(steamApiEndpoints.getPlayerStats(appId, steamId)),

  getPlayersInfo: (steamIds) => fetchData(steamApiEndpoints.getPlayersInfo(steamIds)),

  getPlayerFriendsInfo: (steamId, includePending) =>
    fetchData(steamApiEndpoints.getPlayerFriendsList(steamId, includePending)),

  getOwnedGames: (steamId, includeFreeGame) =>
    fetchData(steamApiEndpoints.getOwnedGames(steamId, includeFreeGame)),

  getRecentPlayedGames: (steamId, count) =>
    fetchData(steamApiEndpoints.getRecentPlayedGames(steamId, count)),

  getGameGenres: (appId) => fetchData(steamApiEndpoints.getGameGenres(appId)),
};
