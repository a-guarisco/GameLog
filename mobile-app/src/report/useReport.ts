import { useState } from 'react';
import apiManager from '@gamelog/api-manager/apiManager';
import type { DailyReport } from '@gamelog/api-manager/dto/report';

export function useReport() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [gameNames, setGameNames] = useState<Record<string, string>>({});
  
  const [appliedStartDate, setAppliedStartDate] = useState<Date | undefined>(undefined);
  const [appliedEndDate, setAppliedEndDate] = useState<Date | undefined>(undefined);

  const handleFetchReport = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      let finalStart = startDate;
      let finalEnd = endDate || new Date();

      if (!finalStart) {
        finalEnd = new Date();
        finalEnd.setDate(finalEnd.getDate() - 1); // Yesterday
        
        finalStart = new Date(finalEnd);
        finalStart.setDate(finalStart.getDate() - 13); // 14 days total including yesterday
      }

      if (finalStart > finalEnd) {
        throw new Error('Start date cannot be after end date');
      }

      const formattedStart = finalStart.toISOString().split('T')[0];
      const formattedEnd = finalEnd.toISOString().split('T')[0];

      setAppliedStartDate(finalStart);
      setAppliedEndDate(finalEnd);

      const data = await apiManager.getDailyReport(formattedStart, formattedEnd);
      setReport(data);

      // Fetch game names
      if (data && data.game_reports.length > 0) {
        const appIds = data.game_reports.map((g) => g.app_id);
        const results = await Promise.allSettled(
          appIds.map(async (appId) => {
            const response = await apiManager.getGameBasicInfo(appId);
            return { appId, name: response?.[appId]?.data?.name };
          })
        );
        const newNames: Record<string, string> = {};
        results.forEach((res) => {
          if (res.status === 'fulfilled' && res.value.name) {
            newNames[res.value.appId] = res.value.name;
          }
        });
        setGameNames(newNames);
      }
    } catch (err: any) {
      console.error('Failed to fetch report', err);
      setError(err.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const handleClearDates = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setAppliedStartDate(undefined);
    setAppliedEndDate(undefined);
    setReport(null);
    setError(null);
    setGameNames({});
  };

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    appliedStartDate,
    appliedEndDate,
    loading,
    error,
    report,
    gameNames,
    handleFetchReport,
    handleClearDates,
  };
}
