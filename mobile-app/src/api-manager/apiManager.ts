import EndPoints, { isBackendProvider } from '@gamelog/api-manager/apiEndsPoints';
import { getApiProvider, setApiProvider } from '@gamelog/api-manager/apiProvider';
import { mergeGlobalAchievementsWithSchema } from '@gamelog/api-manager/achievementMerger';
import { auth } from '@gamelog/auth/firebaseClient';
import type {
  GameGenres,
  GlobalAchievement,
  GameSchema,
  OwnedGames,
  PlayerAchievement,
  PlayerFriends,
  PlayersInfo,
  PlayerStats,
  RecentPlayedGames,
  SteamNews,
  Streak,
  UserSearchResult,
  RecommendationResponse,
} from '@gamelog/api-manager/dto';

async function fetchData<T>(url: string, init?: RequestInit): Promise<T> {
  const response = init ? await fetch(url, init) : await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}. url Called: ${url}`);
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

  getStreakByUser: () => fetchAuthenticatedData<Streak>(EndPoints.getStreakByUser()),
  getStreakByGame: (appId: string) =>
    fetchAuthenticatedData<Streak>(EndPoints.getStreakByGame(appId)),

  searchUsers: (query: string) =>
    fetchAuthenticatedData<UserSearchResult[]>(EndPoints.searchUsers(query)),
  getFriendList: () => fetchAuthenticatedData<UserSearchResult[]>(EndPoints.getFriendList()),
  addFriend: (addresseeId: string) =>
    fetchAuthenticatedData<{ message: string; friendship_id: string }>(EndPoints.addFriend(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addressee_id: addresseeId }),
    }),
  respondToFriend: (friendshipId: string, action: 'ACCEPTED' | 'REJECTED' | 'BLOCKED') =>
    fetchAuthenticatedData<{ message: string }>(EndPoints.respondToFriend(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendship_id: friendshipId, action }),
    }),
  getRecommendations: (friendId: string) =>
    fetchAuthenticatedData<RecommendationResponse>(EndPoints.getRecommendations(friendId)),
};
