import { STEAM_API_KEY } from '@env';

const BASE_URL = 'https://api.steampowered.com/';

export default {
  GET_NEWS_FOR_APP: (appId: number, count: number, maxLength: number) =>
    `${BASE_URL}ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=${count}&maxlength=${maxLength}`,
  GET_GLOBAL_ACHIEVEMENTS_FOR_APP: (appId: number) =>
    `${BASE_URL}ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appId}`,
  GET_PLAYER_ACHIEVEMENTS: (appId: number, steamId: string) =>
    `${BASE_URL}ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${STEAM_API_KEY}&steamid=${steamId}`,
  GET_PLAYERS_INFO: (steamIds: string[]) =>
    `${BASE_URL}ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamIds.join(',')}`,
  GET_PLAYER_FRIENDS_LIST: (steamId: string, includePending: boolean) => {
    const relationship = includePending ? 'all' : 'friend';
    return `${BASE_URL}ISteamUser/GetFriendList/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&relationship=${relationship}`;
  },
  GET_PLAYER_STATS: (appId: number, steamId: string) =>
    `${BASE_URL}ISteamUserStats/GetUserStatsForGame/v0002/?appid=${appId}&key=${STEAM_API_KEY}&steamid=${steamId}`,
  GET_OWNED_GAMES: (steamId: string, includeFreeGame: boolean) =>
    `${BASE_URL}IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=${includeFreeGame}`,
  GET_RECENT_PLAYED_GAMES: (steamId: string, count: number) =>
    `${BASE_URL}IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&count=${count}`,
  GET_GAME_HEADER_IMAGE: (appId: number) =>
    `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`,
  GET_GAME_LOGO_IMAGE: (appId: number, imgIconUrl: string) =>
    `https://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/${appId}/${imgIconUrl}.jpg`,
};
