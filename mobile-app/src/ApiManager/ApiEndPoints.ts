const BASE_URL = 'http://api.steampowered.com/';

//todo .env file should be used, use react-native-dotenv: https://stackoverflow.com/questions/75186535/how-to-get-env-variables-in-react-native-with-typescript-and-rn-cli
const API_KEY = '724FF154B1D2A357857A257EA28C6415'

export default {
    GET_NEWS_FOR_APP : (appId: number, count: number, maxLength: number) => `${BASE_URL}ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=${count}&maxlength=${maxLength}`,
    GET_GLOBAL_ACHIEVEMENTS_FOR_APP : (appId: number) => `${BASE_URL}ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appId}`,
    GET_PLAYER_ACHIEVEMENTS: (appId: number, steamId: string) => `${BASE_URL}ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${API_KEY}&steamid=${steamId}`,
}