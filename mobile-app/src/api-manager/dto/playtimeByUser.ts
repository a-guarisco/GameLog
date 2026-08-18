/**
 * One day of the backend's `DayByDayPlaytime` series, diffed out of the Steam rolling
 * snapshots. Unlike the daily report this is per-day rather than per-game, which is what
 * a trend line needs.
 */
export interface DayPlaytime {
  /** Local calendar day, ISO `YYYY-MM-DD`. */
  date: string;
  playtime_minutes: number;
}

/** The series comes back oldest-first; days with no snapshot are simply absent. */
export type PlaytimeByUser = DayPlaytime[];
