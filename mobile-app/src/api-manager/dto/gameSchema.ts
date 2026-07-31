export interface SchemaAchievementItem {
  name: string;
  displayName?: string;
  description?: string;
}

export interface GameSchema {
  game: {
    gameName: string;
    gameVersion: string;
    availableGameStats?: {
      achievements?: SchemaAchievementItem[];
    };
  };
}
