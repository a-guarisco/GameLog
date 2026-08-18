import type { DailyReport } from '@gamelog/api-manager/dto';

const getGameReports = (report?: DailyReport | null) => report?.game_reports ?? [];

/** Minutes played across the whole library in the reported window. */
export const getReportTotalMinutes = (report?: DailyReport | null): number =>
  getGameReports(report).reduce((sum, game) => sum + (game.today_play_time ?? 0), 0);

/**
 * Minutes played on one game in the reported window, 0 when it was never launched —
 * the backend omits untouched games entirely. App ids are compared as strings because
 * Steam payloads type them both ways.
 */
export const getReportMinutesForGame = (
  report: DailyReport | null | undefined,
  appid: string | number
): number =>
  getGameReports(report).find((game) => String(game.app_id) === String(appid))?.today_play_time ??
  0;
