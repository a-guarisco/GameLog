const BASE_URL = 'https://api.steampowered.com/';
const STEAM_API_KEY: string = process.env.EXPO_PUBLIC_STEAM_API_KEY;

export default {
  GET_NEWS_FOR_APP: (appId: string, count: number, maxLength: number) =>
    `${BASE_URL}ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=${count}&maxlength=${maxLength}`,
  GET_GLOBAL_ACHIEVEMENTS_FOR_APP: (appId: string) =>
    `${BASE_URL}ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appId}`,
  GET_PLAYER_ACHIEVEMENTS: (appId: string, steamId: string) =>
    `${BASE_URL}ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${STEAM_API_KEY}&steamid=${steamId}`,
  GET_PLAYERS_INFO: (steamIds: string[]) =>
    `${BASE_URL}ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamIds.join(',')}`,
  GET_PLAYER_FRIENDS_LIST: (steamId: string, includePending: boolean) => {
    const relationship = includePending ? 'all' : 'friend';
    return `${BASE_URL}ISteamUser/GetFriendList/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&relationship=${relationship}`;
  },
  GET_PLAYER_STATS: (appId: string, steamId: string) =>
    `${BASE_URL}ISteamUserStats/GetUserStatsForGame/v0002/?appid=${appId}&key=${STEAM_API_KEY}&steamid=${steamId}`,
  GET_OWNED_GAMES: (steamId: string, includeFreeGame: boolean) =>
    `${BASE_URL}IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=${includeFreeGame}`,
  GET_RECENT_PLAYED_GAMES: (steamId: string, count: number) =>
    `${BASE_URL}IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&count=${count}`,
  GET_GAME_HEADER_IMAGE: (appId: string) =>
    `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`,
  GET_GAME_LOGO_IMAGE: (appId: string, imgIconUrl: string) =>
    `https://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/${appId}/${imgIconUrl}.jpg`,
  GET_GAME_CAPSULE_IMAGE: (appId: string) =>
    `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/capsule_231x87.jpg`,
  GET_GAME_LIBRARY_COVER_IMAGE: (appId: string) =>
    `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`,
  GET_GAME_GENRES: (appId: string) =>
    `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=genres`,
};
