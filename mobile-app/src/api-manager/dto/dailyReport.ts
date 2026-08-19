export interface DailyGameReport {
  app_id: string;
  today_play_time: number;
  streak: number;
}

export interface DailyReport {
  /** The window's end date, ISO `YYYY-MM-DD`. */
  date: string;
  game_reports: DailyGameReport[];
}
