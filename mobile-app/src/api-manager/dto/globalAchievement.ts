export interface GlobalAchievementItem {
  name: string;
  percent: number;
  displayName?: string;
  description?: string;
}

export interface GlobalAchievement {
  achievementpercentages: {
    achievements: GlobalAchievementItem[];
  };
}
