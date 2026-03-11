interface PlayerAchievementItem {
  name: string;
  achieved: number;
}

interface PlayerStatItem {
  name: string;
  value: number;
}

export interface PlayerStats {
  playerstats: {
    steamID: string;
    gameName: string;
    achievements: PlayerAchievementItem[];
    stats: PlayerStatItem[];
  };
}
