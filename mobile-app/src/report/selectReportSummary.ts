import type { DailyReport } from '@gamelog/api-manager/dto/report';
import type { GameStat } from '@gamelog/common/StatBand';
import { formatMinutesToHoursShort, formatThousands } from '@gamelog/utils/formatUtils';

export interface ReportSummaryResult {
  stats: GameStat[];
  rangeText: string;
  totalPlaytime: number;
  totalGames: number;
  topGameName: string;
  maxPlaytimePerDay: number;
}

export const selectReportSummary = (
  report: DailyReport | null,
  appliedStartDate: Date | undefined,
  appliedEndDate: Date | undefined,
  gameNames: Record<string, string>
): ReportSummaryResult | null => {
  if (!report || !report.game_reports || report.game_reports.length === 0 || !appliedStartDate) {
    return null;
  }

  let totalPlaytime = 0;
  let topGamePlaytime = -1;
  let topGameId = '';
  let maxPlaytimePerDay = 0;

  report.game_reports.forEach((game) => {
    totalPlaytime += game.today_play_time;
    if (game.today_play_time > topGamePlaytime) {
      topGamePlaytime = game.today_play_time;
      topGameId = game.app_id;
    }
    if (game.max_playtime_per_day !== undefined && game.max_playtime_per_day > maxPlaytimePerDay) {
      maxPlaytimePerDay = game.max_playtime_per_day;
    }
  });

  const totalGames = report.game_reports.length;
  const finalEndDate = appliedEndDate || new Date();

  // compute days difference. 'to' date is exclusive, so diffDays is simply (end - start)
  const diffTime = Math.abs(finalEndDate.getTime() - appliedStartDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const formatDate = (d: Date) =>
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const rangeText = `${formatDate(appliedStartDate)} — ${formatDate(finalEndDate)} · ${diffDays} day${diffDays === 1 ? '' : 's'}`;

  const topGameName = gameNames[topGameId] || `App ID: ${topGameId}`;

  const stats: GameStat[] = [
    { value: formatMinutesToHoursShort(totalPlaytime), label: 'Playtime' },
    { value: formatThousands(totalGames), label: 'Games' },
    { value: topGameName, label: 'Top Game' },
  ];

  return {
    stats,
    rangeText,
    totalPlaytime,
    totalGames,
    topGameName,
    maxPlaytimePerDay,
  };
};
