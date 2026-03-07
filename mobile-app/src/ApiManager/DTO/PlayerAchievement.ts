interface PlayerAchievementItem {
    apiname: string;
    achieved: number;
}

interface PlayerStatItem {
    name: string;
    value: number;
}

export interface PlayerAchievement {
    playerstats: {
        steamID: string;
        gameName: string;
        achievements: PlayerAchievementItem[];
        stats: PlayerStatItem[];
    };
}