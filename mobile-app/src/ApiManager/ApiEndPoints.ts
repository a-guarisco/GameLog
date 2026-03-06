import {STEAM_API_KEY} from '@env'

//todo: backend should use a https connection since plain http is block from android 9.0
const BASE_URL = 'https://api.steampowered.com/';

export default {
  GET_NEWS_FOR_APP: (appId: number, count: number, maxLength: number) =>
    `${BASE_URL}ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=${count}&maxlength=${maxLength}`,
  GET_GLOBAL_ACHIEVEMENTS_FOR_APP: (appId: number) =>
    `${BASE_URL}ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appId}`,
  GET_PLAYER_ACHIEVEMENTS: (appId: number, steamId: string) =>
    `${BASE_URL}ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${STEAM_API_KEY}&steamid=${steamId}`,
};
