//https://tinyurl.com/React-Api-Manager

import EndPoints from "./ApiEndPoints";
import {GlobalAchievement, PlayerAchievement, SteamNews} from "./ApiResponse";

class ApiManager {
    private static async fetchData<T>(url: string): Promise<T> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error be like: ${response.status}`);
        }
        return response.json();
    }

    static async getGameNews(appId: number, count: number, maxLength: number): Promise<SteamNews> {
        return this.fetchData<SteamNews>(EndPoints.GET_NEWS_FOR_APP(appId, count, maxLength));
    }

    static async getGlobalAchievement(appId: number): Promise<GlobalAchievement> {
        return this.fetchData<GlobalAchievement>(EndPoints.GET_GLOBAL_ACHIEVEMENTS_FOR_APP(appId));
    }

    static async getPlayerAchievements(appId: number, steamId: string): Promise<PlayerAchievement> {
        return this.fetchData<PlayerAchievement>(EndPoints.GET_PLAYER_ACHIEVEMENTS(appId, steamId));
    }
}
export default ApiManager;
