import { Platform } from 'react-native';
import { getSteamApiKey } from '@gamelog/api-manager/steamApiKey';
import { CommunityScope, TopGameReference } from '@gamelog/api-manager/dto';

const STEAM_BASE_URL = 'https://api.steampowered.com/';
const STORE_BASE_URL = 'https://store.steampowered.com';

const getRelationship = (includePending: boolean): string => (includePending ? 'all' : 'friend');

const EndPoints = {
  getNewsForApp: (appId: string, count: number, maxLength: number) => {
    return `${STEAM_BASE_URL}ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=${count}&maxlength=${maxLength}`;
  },

  getGlobalAchievementsForApp: (appId: string) => {
    return `${STEAM_BASE_URL}ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appId}`;
  },

  getPlayerAchievements: (appId: string, steamId: string) => {
    return `${STEAM_BASE_URL}ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${getSteamApiKey()}&steamid=${steamId}`;
  },

  getPlayerStats: (appId: string, steamId: string) => {
    return `${STEAM_BASE_URL}ISteamUserStats/GetUserStatsForGame/v0002/?appid=${appId}&key=${getSteamApiKey()}&steamid=${steamId}`;
  },

  getPlayersInfo: (steamIds: string[]) => {
    return `${STEAM_BASE_URL}ISteamUser/GetPlayerSummaries/v0002/?key=${getSteamApiKey()}&steamids=${steamIds.join(',')}`;
  },

  getPlayerFriendsList: (steamId: string, includePending: boolean) => {
    return `${STEAM_BASE_URL}ISteamUser/GetFriendList/v0001/?key=${getSteamApiKey()}&steamid=${steamId}&relationship=${getRelationship(includePending)}`;
  },

  getOwnedGames: (steamId: string, include_sub: boolean, includeFreeGame: boolean) => {
    return `${STEAM_BASE_URL}IPlayerService/GetOwnedGames/v0001/?key=${getSteamApiKey()}&steamid=${steamId}&include_appinfo=true&include_free_sub=${include_sub}&include_played_free_games=${includeFreeGame}`;
  },

  getRecentPlayedGames: (steamId: string, count: number) => {
    return `${STEAM_BASE_URL}IPlayerService/GetRecentlyPlayedGames/v0001/?key=${getSteamApiKey()}&steamid=${steamId}&count=${count}`;
  },

  getGameGenres: (appId: string) => {
    return `${STORE_BASE_URL}/api/appdetails?appids=${appId}&filters=genres`;
  },

  getGameBasicInfo: (appId: string) => {
    return `${STORE_BASE_URL}/api/appdetails?appids=${appId}&filters=basic`;
  },

  getSchemaForGame: (appId: string) => {
    return `${STEAM_BASE_URL}ISteamUserStats/GetSchemaForGame/v2/?key=${getSteamApiKey()}&appid=${appId}`;
  },

  getNumberOfCurrentPlayers: (appId: string) => {
    return `${STEAM_BASE_URL}ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`;
  },

  /**
   * Community-published files for an app. query_type 3 is "ranked by trend",
   * filetype 4 is screenshots. `cursor` is the opaque token Steam hands back as
   * `next_cursor`; '*' asks for the first page.
   */
  queryPublishedFiles: (appId: string, cursor: string, numPerPage: number) => {
    return `${STEAM_BASE_URL}IPublishedFileService/QueryFiles/v1/?key=${getSteamApiKey()}&query_type=3&appid=${appId}&filetype=4&cursor=${encodeURIComponent(cursor)}&numperpage=${numPerPage}&return_short_description=true&return_previews=true`;
  },

  /**
   * Community guides for an app. creator_appid 766 is the Steam Community app that
   * publishes them, query_type 12 is "ranked by trend", filetype 11 is a guide, and
   * the required English tag keeps the panel readable. Cursor works as above.
   */
  queryPublishedGuides: (appId: string, cursor: string, numPerPage: number) => {
    return `${STEAM_BASE_URL}IPublishedFileService/QueryFiles/v1/?key=${getSteamApiKey()}&creator_appid=766&query_type=12&appid=${appId}&filetype=11&requiredtags[0]=English&match_all_tags=true&cursor=${encodeURIComponent(cursor)}&numperpage=${numPerPage}&return_short_description=true`;
  },

  getStreakByUser: () => {
    return `/games/streak_by_user`;
  },

  getStreakByGame: (appId: string) => {
    return `/games/streak_by_game?steam_app_id=${appId}`;
  },

  getPlaytimeReport: (startDate: string, endDate: string) => {
    return `/games/report?start_date=${startDate}&end_date=${endDate}`;
  },

  getGenresBatch: () => {
    return `/games/genres_batch`;
  },

  getPlaytimeByUser: (days: number) => {
    return `/games/playtime_by_user?days=${days}`;
  },

  getGameStatus: (steamAppId?: string) => {
    if (steamAppId) {
      return `/games/game_status?steam_app_id=${steamAppId}`;
    }
    return `/games/game_status`;
  },

  updateGameStatus: () => {
    return `/games/update_game_status`;
  },


  getAuthOutcome: () => {
    return `/me`;
  },

  getBackendHealth: () => {
    return `/health`;
  },

  registerUser: () => {
    return `/users/register`;
  },

  getUserMe: () => {
    return `/users/me`;
  },

  searchUsers: (query: string) => {
    return `/users/search?q=${encodeURIComponent(query)}`;
  },

  getFriendList: () => {
    return `/users/friend_list`;
  },

  addFriend: () => {
    return `/users/add_friend`;
  },

  manageFriendship: () => {
    return `/users/manage_friendship`;
  },

  getRecommendations: (friendId: string, includeTopGames: boolean = true) => {
    return `/games/recommendations?friend=${friendId}&include_top_games=${includeTopGames}`;
  },

  registerDeviceToken: () => {
    return `/notifications/register_device`;
  },

  unregisterDeviceToken: () => {
    return `/notifications/unregister_device`;
  },

  getDailyReport: (startDate?: string, endDate?: string) => {
    let url = `/games/report`;
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    return url;
  },

  getCommunityGenre: (scope: CommunityScope, userId?: string) => {
    let url = `/community/genre?scope=${scope}`;
    if (userId) url += `&user_id=${userId}`;
    return url;
  },

  getCommunityWeeklyPlaytime: (
    scope: CommunityScope,
    startDate: string,
    endDate: string,
    userId?: string
  ) => {
    let url = `/community/weekly_playtime?scope=${scope}&start_date=${startDate}&end_date=${endDate}`;
    if (userId) url += `&user_id=${userId}`;
    return url;
  },

  getCommunityMonthlyPlaytime: (
    scope: CommunityScope,
    startDate: string,
    endDate: string,
    userId?: string
  ) => {
    let url = `/community/monthly_playtime?scope=${scope}&start_date=${startDate}&end_date=${endDate}`;
    if (userId) url += `&user_id=${userId}`;
    return url;
  },

  getCommunityWeeklyTopGames: (
    scope: CommunityScope,
    startDate: string,
    endDate: string,
    reference: TopGameReference = 'community',
    userId?: string
  ) => {
    let url = `/community/weekly_top_game_playtime?scope=${scope}&start_date=${startDate}&end_date=${endDate}&reference=${reference}`;
    if (userId) url += `&user_id=${userId}`;
    return url;
  },

  getCommunityMonthlyTopGames: (
    scope: CommunityScope,
    startDate: string,
    endDate: string,
    reference: TopGameReference = 'community',
    userId?: string
  ) => {
    let url = `/community/monthly_top_game_playtime?scope=${scope}&start_date=${startDate}&end_date=${endDate}&reference=${reference}`;
    if (userId) url += `&user_id=${userId}`;
    return url;
  },

  getCommunityGameStatuses: (scope: CommunityScope, userId?: string) => {
    let url = `/community/game_statuses?scope=${scope}`;
    if (userId) url += `&user_id=${userId}`;
    return url;
  },
};

export default EndPoints;
