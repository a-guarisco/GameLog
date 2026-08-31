export interface GamePlaytime {
  app_id: string;
  playtime_minutes: number;
}

export interface DayPlaytime {
  /** Local calendar day, ISO `YYYY-MM-DD`. */
  date: string;
  playtime_minutes: number;
  games?: GamePlaytime[];
}

export type PlaytimeByUser = DayPlaytime[];
