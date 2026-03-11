interface PlayerAchievementItem {
  apiname: string;
  achieved: number;
  unlocktime: number;
}

export interface PlayerAchievement {
  playerstats: {
    steamID: string;
    gameName: string;
    achievements: PlayerAchievementItem[];
    success: boolean;
  };
}
