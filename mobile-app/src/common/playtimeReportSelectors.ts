import type { DailyReport } from '@gamelog/api-manager/dto';

const getGameReports = (report?: DailyReport | null) => report?.game_reports ?? [];

export const getReportTotalMinutes = (report?: DailyReport | null): number =>
  getGameReports(report).reduce((sum, game) => sum + (game.today_play_time ?? 0), 0);

export const getReportMinutesForGame = (
  report: DailyReport | null | undefined,
  appid: string | number
): number =>
  getGameReports(report).find((game) => String(game.app_id) === String(appid))?.today_play_time ??
  0;
