/**
 * One game's playtime over the reported window. `today_play_time` is the backend's name:
 * it holds the minutes played across the whole start_date..end_date range, not just the
 * last day, whenever the report is asked for more than a single date.
 */
export interface DailyGameReport {
  app_id: string;
  today_play_time: number;
  streak: number;
}

/** Games with no playtime in the window are omitted, so `game_reports` can be empty. */
export interface DailyReport {
  /** The window's end date, ISO `YYYY-MM-DD`. */
  date: string;
  game_reports: DailyGameReport[];
}
