import { useMemo } from 'react';
import type { DailyReport } from '@gamelog/api-manager/dto/report';

export function useReportStats(
  report: DailyReport | null,
  appliedStartDate: Date | undefined,
  appliedEndDate: Date | undefined,
  sortOrder: 'playtime' | 'streak' | 'alpha',
  gameNames: Record<string, string>
) {
  const formatDate = (d?: Date) => (d ? d.toLocaleDateString() : 'Select Date');

  const summaryStats = useMemo(() => {
    if (!report || !report.game_reports || report.game_reports.length === 0 || !appliedStartDate) return null;

    let totalPlaytime = 0;
    let topGamePlaytime = -1;
    let topGameId = '';

    report.game_reports.forEach((game) => {
      totalPlaytime += game.today_play_time;
      if (game.today_play_time > topGamePlaytime) {
        topGamePlaytime = game.today_play_time;
        topGameId = game.app_id;
      }
    });

    const totalGames = report.game_reports.length;
    const finalEndDate = appliedEndDate || new Date();
    // compute days difference. 'to' date is exclusive, so diffDays is simply (end - start)
    const diffTime = Math.abs(finalEndDate.getTime() - appliedStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return {
      totalPlaytime,
      topGamePlaytime,
      topGameId,
      totalGames,
      diffDays,
      formattedStart: formatDate(appliedStartDate),
      formattedEnd: formatDate(finalEndDate),
    };
  }, [report, appliedStartDate, appliedEndDate]);

  const sortedGameReports = useMemo(() => {
    if (!report || !report.game_reports) return [];
    return [...report.game_reports].sort((a, b) => {
      if (sortOrder === 'playtime') {
        return b.today_play_time - a.today_play_time;
      } else if (sortOrder === 'streak') {
        return b.streak - a.streak;
      } else {
        const nameA = gameNames[a.app_id] || `App ID: ${a.app_id}`;
        const nameB = gameNames[b.app_id] || `App ID: ${b.app_id}`;
        return nameA.localeCompare(nameB);
      }
    });
  }, [report, sortOrder, gameNames]);

  return { summaryStats, sortedGameReports, formatDate };
}
