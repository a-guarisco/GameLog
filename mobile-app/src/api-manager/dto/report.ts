export interface DailyGameReport {
  app_id: string;
  today_play_time: number;
  streak: number;
}

export interface DailyReport {
  date: string; // ISO format date (YYYY-MM-DD)
  game_reports: DailyGameReport[];
}
