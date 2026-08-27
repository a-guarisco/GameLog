import { useMemo } from 'react';
import type { DailyReport } from '@gamelog/api-manager/dto/report';
import { selectReportSummary } from './selectReportSummary';

export function useReportStats(
  report: DailyReport | null,
  appliedStartDate: Date | undefined,
  appliedEndDate: Date | undefined,
  sortOrder: 'playtime' | 'streak' | 'alpha',
  gameNames: Record<string, string>
) {
  const formatDate = (d?: Date) => (d ? d.toLocaleDateString() : 'Select Date');

  const summary = useMemo(
    () => selectReportSummary(report, appliedStartDate, appliedEndDate, gameNames),
    [report, appliedStartDate, appliedEndDate, gameNames]
  );

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

  return { summary, sortedGameReports, formatDate };
}
