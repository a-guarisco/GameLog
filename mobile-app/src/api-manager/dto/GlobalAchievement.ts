interface GlobalAchievementItem {
  name: string;
  percent: number;
}

export interface GlobalAchievement {
  achievementpercentages: {
    achievements: GlobalAchievementItem[];
  };
}
