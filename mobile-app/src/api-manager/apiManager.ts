import EndPoints, { isBackendProvider } from '@gamelog/api-manager/apiEndsPoints';
import { getApiProvider, setApiProvider } from '@gamelog/api-manager/apiProvider';
import { mergeGlobalAchievementsWithSchema } from '@gamelog/api-manager/achievementMerger';
import { auth } from '@gamelog/auth/firebaseClient';
import type {
  CurrentPlayers,
  DailyReport,
  PlaytimeByUser,
  GameBasicInfo,
  GameGenres,
  BackendGameGenres,
  GlobalAchievement,
  GameSchema,
  OwnedGames,
  PlayerAchievement,
  PlayerFriends,
  PlayersInfo,
  PlayerStats,
  PublishedFiles,
  RecentPlayedGames,
  SteamNews,
  Streak,
  UserRead,
  UserMeRead,
  UserRegisterRequest,
  UserSearchResult,
  RecommendationResponse,
  CommunityGenreHour,
  CommunityPlaytimeResponse,
  CommunityTopGame,
  CommunityScope,
  TopGameReference,
  GameStatus,
  GameStatusesResponse,
  CommunityGameStatusResponse,
} from '@gamelog/api-manager/dto';



async function fetchData<T>(url: string, init?: RequestInit): Promise<T> {
  const options = {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  };
  const response = await fetch(url, options);

  if (!response.ok) {
    let detail = `HTTP error: ${response.status}. url Called: ${url}`;
    try {
      const errorData = await response.json();
      detail = errorData.detail || detail;
    } catch (e) {
      // Ignore JSON parse error
    }
    const error: any = new Error(detail);
    error.response = { data: { detail }, status: response.status };
    throw error;
  }
  return response.json();
}

async function fetchAuthenticatedData<T>(url: string, init?: RequestInit): Promise<T> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error(
      'No active Firebase user session. Sign in before calling authenticated backend endpoints.'
    );
  }

  return fetchData<T>(url, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

export { getApiProvider, setApiProvider, isBackendProvider, fetchData, fetchAuthenticatedData };
export default {
  getNumberOfCurrentPlayers: (appId: string) =>
    fetchData<CurrentPlayers>(EndPoints.getNumberOfCurrentPlayers(appId)),
  getGameNews: (appId: string, count: number, maxLength: number) =>
    fetchData<SteamNews>(EndPoints.getNewsForApp(appId, count, maxLength)),
  getSchemaForGame: (appId: string) => fetchData<GameSchema>(EndPoints.getSchemaForGame(appId)),
  getGlobalAchievement: async (appId: string): Promise<GlobalAchievement> => {
    const globalAchievementsPromise = fetchData<GlobalAchievement>(
      EndPoints.getGlobalAchievementsForApp(appId)
    );
    const schemaPromise = fetchData<GameSchema>(EndPoints.getSchemaForGame(appId)).catch(
      () => null
    );

    const [globalData, schemaData] = await Promise.all([globalAchievementsPromise, schemaPromise]);

    return mergeGlobalAchievementsWithSchema(globalData, schemaData);
  },
  getAllPlayerAchievementsPerApp: (appId: string, steamId: string) =>
    fetchData<PlayerAchievement>(EndPoints.getPlayerAchievements(appId, steamId)),

  getCompletedPlayerAchievementsAndStatsPerApp: (appId: string, steamId: string) =>
    fetchData<PlayerStats>(EndPoints.getPlayerStats(appId, steamId)),

  getPlayersInfo: (steamIds: string[]) =>
    fetchData<PlayersInfo>(EndPoints.getPlayersInfo(steamIds)),

  getPlayerFriendsInfo: (steamId: string, includePending: boolean) =>
    fetchData<PlayerFriends>(EndPoints.getPlayerFriendsList(steamId, includePending)),

  getOwnedGames: (steamId: string, includeSub: boolean, includeFreeGame: boolean) =>
    fetchData<OwnedGames>(EndPoints.getOwnedGames(steamId, includeSub, includeFreeGame)),
  getRecentPlayedGames: (steamId: string, count: number) =>
    fetchData<RecentPlayedGames>(EndPoints.getRecentPlayedGames(steamId, count)),

  getGameGenres: (appId: string) => fetchData<GameGenres>(EndPoints.getGameGenres(appId)),

  getGameBasicInfo: (appId: string) => fetchData<GameBasicInfo>(EndPoints.getGameBasicInfo(appId)),

  /** Community screenshots for a game. Pass the previous `next_cursor` to page forward. */
  getGameScreenshots: (appId: string, cursor: string = '*', numPerPage: number = 50) =>
    fetchData<PublishedFiles>(EndPoints.queryPublishedFiles(appId, cursor, numPerPage)),

  /** Community guides for a game. Same cursor contract as getGameCaptures. */
  getGameGuides: (appId: string, cursor: string = '*', numPerPage: number = 50) =>
    fetchData<PublishedFiles>(EndPoints.queryPublishedGuides(appId, cursor, numPerPage)),

  getStreakByUser: () => fetchAuthenticatedData<Streak>(EndPoints.getStreakByUser()),
  getStreakByGame: (appId: string) =>
    fetchAuthenticatedData<Streak>(EndPoints.getStreakByGame(appId)),

  getPlaytimeReport: (startDate: string, endDate: string) =>
    fetchAuthenticatedData<DailyReport>(EndPoints.getPlaytimeReport(startDate, endDate)),

  getGenresBatch: (appIds: string[]) =>
    fetchAuthenticatedData<BackendGameGenres[]>(EndPoints.getGenresBatch(), {
      method: 'POST',
      body: JSON.stringify({ app_ids: appIds }),
    }),

  getPlaytimeByUser: (days: number) =>
    fetchAuthenticatedData<PlaytimeByUser>(EndPoints.getPlaytimeByUser(days)),

  getGameStatus: (steamAppId: string) =>
    fetchAuthenticatedData<GameStatus>(EndPoints.getGameStatus(steamAppId)),

  updateGameStatus: (appId: string, status: GameStatus) =>
    fetchAuthenticatedData<{ message: string }>(EndPoints.updateGameStatus(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, status }),
    }),

  getUserGameStatuses: () =>
    fetchAuthenticatedData<GameStatusesResponse[]>(EndPoints.getGameStatus()),




  searchUsers: (query: string) =>
    fetchAuthenticatedData<UserSearchResult[]>(EndPoints.searchUsers(query)),
  getFriendList: () => fetchAuthenticatedData<UserSearchResult[]>(EndPoints.getFriendList()),
  getUserMe: () => fetchAuthenticatedData<UserMeRead>(EndPoints.getUserMe()),
  registerUser: (data: UserRegisterRequest) =>
    fetchAuthenticatedData<UserMeRead>(EndPoints.registerUser(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updateSteamApiKey: (apiKey: string) =>
    fetchAuthenticatedData<UserMeRead>(`${EndPoints.getUserMe()}/steam-api-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steam_api_key: apiKey }),
    }),
  addFriend: (addresseeId: string) =>
    fetchAuthenticatedData<{ message: string; friendship_id: string }>(EndPoints.addFriend(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addressee_id: addresseeId }),
    }),
  manageFriendship: (
    action: 'ACCEPT' | 'REJECT' | 'CANCEL' | 'REMOVE' | 'BLOCK' | 'UNBLOCK',
    friendshipId?: string,
    targetUserId?: string
  ) =>
    fetchAuthenticatedData<{ message: string }>(EndPoints.manageFriendship(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        friendship_id: friendshipId || undefined,
        target_user_id: targetUserId || undefined,
      }),
    }),
  getRecommendations: (friendId: string) =>
    fetchAuthenticatedData<RecommendationResponse>(EndPoints.getRecommendations(friendId)),
  registerDeviceToken: (token: string, deviceType: string = 'android') =>
    fetchAuthenticatedData<{ id: string; device_token: string }>(EndPoints.registerDeviceToken(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, device_type: deviceType }),
    }),
  unregisterDeviceToken: (token: string) =>
    fetchAuthenticatedData<void>(EndPoints.unregisterDeviceToken(), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }),
  getDailyReport: (startDate?: string, endDate?: string) =>
    fetchAuthenticatedData<DailyReport>(EndPoints.getDailyReport(startDate, endDate)),
  getCommunityGenre: (scope: CommunityScope, userId?: string) =>
    fetchAuthenticatedData<CommunityGenreHour[]>(EndPoints.getCommunityGenre(scope, userId)),
  getCommunityWeeklyPlaytime: (
    scope: CommunityScope,
    startDate: string,
    endDate: string,
    userId?: string
  ) =>
    fetchAuthenticatedData<CommunityPlaytimeResponse>(
      EndPoints.getCommunityWeeklyPlaytime(scope, startDate, endDate, userId)
    ),
  getCommunityMonthlyPlaytime: (
    scope: CommunityScope,
    startDate: string,
    endDate: string,
    userId?: string
  ) =>
    fetchAuthenticatedData<CommunityPlaytimeResponse>(
      EndPoints.getCommunityMonthlyPlaytime(scope, startDate, endDate, userId)
    ),
  getCommunityWeeklyTopGames: (
    scope: CommunityScope,
    startDate: string,
    endDate: string,
    reference: TopGameReference = 'community',
    userId?: string
  ) =>
    fetchAuthenticatedData<CommunityTopGame[]>(
      EndPoints.getCommunityWeeklyTopGames(scope, startDate, endDate, reference, userId)
    ),
  getCommunityMonthlyTopGames: (
    scope: CommunityScope,
    startDate: string,
    endDate: string,
    reference: TopGameReference = 'community',
    userId?: string
  ) =>
    fetchAuthenticatedData<CommunityTopGame[]>(
      EndPoints.getCommunityMonthlyTopGames(scope, startDate, endDate, reference, userId)
    ),
  getCommunityGameStatuses: (scope: CommunityScope, userId?: string) =>
    fetchAuthenticatedData<CommunityGameStatusResponse>(
      EndPoints.getCommunityGameStatuses(scope, userId)
    ),
};
