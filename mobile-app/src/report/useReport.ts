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
      const yesterday = new Date();
      yesterday.setHours(0, 0, 0, 0);
      yesterday.setDate(yesterday.getDate() - 1);

      let finalStart = startDate;
      let uiEndDate = endDate ? new Date(endDate) : new Date(yesterday);

      // If no start date, default to exactly 14 days including end date
      if (!finalStart) {
        finalStart = new Date(uiEndDate);
        finalStart.setDate(finalStart.getDate() - 13);
      }

      if (finalStart > uiEndDate) {
        throw new Error('Start date must be before or equal to end date');
      }

      const formattedStart = finalStart.toISOString().split('T')[0];
      const formattedEnd = uiEndDate.toISOString().split('T')[0];

      // Save exclusive UI date
      setAppliedStartDate(finalStart);
      setAppliedEndDate(uiEndDate);

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
