export interface DayPlaytime {
  /** Local calendar day, ISO `YYYY-MM-DD`. */
  date: string;
  playtime_minutes: number;
}

export type PlaytimeByUser = DayPlaytime[];
