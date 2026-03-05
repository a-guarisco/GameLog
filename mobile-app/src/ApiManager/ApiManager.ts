//https://tinyurl.com/React-Api-Manager

import EndPoints from "./ApiEndPoints";
import ApiEndPoints from "./ApiEndPoints";
import {SteamNews} from "./ApiResponse";

class ApiManager {
    static async getGameNews(appId: number, count: number, maxLength: number): Promise<SteamNews> {
        const url = EndPoints.GET_NEWS_FOR_APP(appId, count, maxLength);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error be like: ${response.status}`);
        }
        return response.json();
    }

    static async getGlobalAchievement(appId: number): Promise<any> {
        const url = EndPoints.GET_GLOBAL_ACHIEVEMENTS_FOR_APP(appId);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error be like: ${response.status}`);
        }
        return response.json();
    }

    static async getPlayerAchievement(
}