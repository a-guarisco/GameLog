export interface DailyGameReport {
  app_id: string;
  today_play_time: number;
  streak: number;
  days_played_count: number;
  max_playtime_per_day: number;
}

export interface DailyReport {
  /** The window's end date, ISO `YYYY-MM-DD`. */
  date: string;
  game_reports: DailyGameReport[];
}
