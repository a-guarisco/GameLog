import { useMemo } from 'react';
import { formatMinutesToHours, formatMinutesWithSeconds } from '@gamelog/utils/formatUtils';
import { selectPlaytimeTrend } from './selectPlaytimeTrend';

export const usePlaytimeTrendChart = (
  playtimeByUser: any,
  trendRange: number,
  trendMode: 'avg' | 'tot',
  isLandscape: boolean = false
) => {
  const trend = useMemo(
    () => selectPlaytimeTrend(playtimeByUser, trendRange),
    [playtimeByUser, trendRange]
  );

  const {
    mode: timeGroupMode,
    baselineAveragePerUnit,
    baselineAverageFormatted,
  } = useMemo(() => {
    let m: 'D' | 'W' | 'M' = 'D';
    if (isLandscape) {
      // In landscape: retain daily granularity ('D') for ranges up to 90 days (60-90 days),
      // producing a smooth, high-density line curve rather than coarse weekly steps.
      if (trendRange > 90 && trendRange <= 180) m = 'W';
      if (trendRange > 180) m = 'M';
    } else {
      // In portrait: ranges >30 days group by weekly averages ('W')
      if (trendRange > 30 && trendRange <= 180) m = 'W';
      if (trendRange > 180) m = 'M';
    }

    const baselineAveragePerDay = trendRange > 0 ? trend.previousTotalMinutes / trendRange : 0;
    let baselineAveragePerUnit = baselineAveragePerDay;
    if (m === 'W') baselineAveragePerUnit = baselineAveragePerDay * 7;
    if (m === 'M') baselineAveragePerUnit = baselineAveragePerDay * 30;

    return {
      mode: m,
      baselineAveragePerUnit,
      baselineAverageFormatted: formatMinutesWithSeconds(baselineAveragePerUnit),
    };
  }, [trend.previousTotalMinutes, trendRange, isLandscape]);

  const lineData = useMemo(() => {
    const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const formatDDMMYYYY = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${WEEKDAYS[d.getUTCDay()]}, ${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
    };

    const getNextSunday = (d: Date) => {
      const day = d.getUTCDay();
      const diff = day === 0 ? 0 : 7 - day;
      const sunday = new Date(d.getTime());
      sunday.setUTCDate(d.getUTCDate() + diff);
      return sunday;
    };

    const getEndOfMonth = (d: Date) => {
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
    };

    const aggregatedMap = new Map<string, { minutes: number; daysInGroup: number }>();

    trend.days.forEach((day) => {
      const d = new Date(day.date + 'T00:00:00Z');
      let displayDate = d;

      if (timeGroupMode === 'W') {
        displayDate = getNextSunday(d);
      } else if (timeGroupMode === 'M') {
        displayDate = getEndOfMonth(d);
      }

      const groupKey = formatDDMMYYYY(displayDate);
      const current = aggregatedMap.get(groupKey) || { minutes: 0, daysInGroup: 0 };
      aggregatedMap.set(groupKey, {
        minutes: current.minutes + day.minutes,
        daysInGroup: current.daysInGroup + 1,
      });
    });

    const aggregatedArray = Array.from(aggregatedMap.entries()).map(([dateStr, data]) => ({
      dateStr,
      minutes: data.minutes,
      daysInGroup: data.daysInGroup,
    }));

    let cumulativeMinutes = 0;
    let cumulativeDays = 0;

    const res = aggregatedArray.map((point) => {
      cumulativeMinutes += point.minutes;
      cumulativeDays += point.daysInGroup;

      const runningAveragePerDay = cumulativeDays > 0 ? cumulativeMinutes / cumulativeDays : 0;
      let currentAverage = runningAveragePerDay;
      if (timeGroupMode === 'W') currentAverage = runningAveragePerDay * 7;
      if (timeGroupMode === 'M') currentAverage = runningAveragePerDay * 30;

      let percentChange = 0;
      if (baselineAveragePerUnit > 0) {
        percentChange = ((currentAverage - baselineAveragePerUnit) / baselineAveragePerUnit) * 100;
      } else if (currentAverage > 0) {
        percentChange = 100;
      }

      const delta = currentAverage - baselineAveragePerUnit;
      const absoluteDelta = Math.abs(delta);

      const cumulativeStepDelta = point.minutes;
      let cumulativePercent = 0;
      if (trend.previousTotalMinutes > 0) {
        cumulativePercent = (cumulativeMinutes / trend.previousTotalMinutes) * 100;
      } else if (cumulativeMinutes > 0) {
        cumulativePercent = 100;
      }

      return {
        value: trendMode === 'avg' ? currentAverage : cumulativeMinutes,
        rawCumulative: cumulativeMinutes,
        dataPointText: point.dateStr,
        cumulativeFormatted: formatMinutesToHours(cumulativeMinutes),
        currentAverageFormatted: formatMinutesWithSeconds(currentAverage),
        deltaFormatted: formatMinutesWithSeconds(absoluteDelta),
        percentChange,
        isPositive: percentChange >= 0,
        cumulativeStepDeltaFormatted: formatMinutesToHours(cumulativeStepDelta),
        cumulativePercent,
        cumulativeStepDeltaRaw: cumulativeStepDelta,
      };
    });

    if (trendMode === 'avg') {
      res.unshift({
        value: baselineAveragePerUnit,
        rawCumulative: 0,
        dataPointText: 'Previous Period Average',
        cumulativeFormatted: '0s',
        currentAverageFormatted: formatMinutesWithSeconds(baselineAveragePerUnit),
        deltaFormatted: '0s',
        percentChange: 0,
        isPositive: true,
        cumulativeStepDeltaFormatted: '0s',
        cumulativePercent: 0,
        cumulativeStepDeltaRaw: 0,
      });
    }

    return res;
  }, [trend.days, baselineAveragePerUnit, timeGroupMode, trendMode, trend.previousTotalMinutes]);

  const chartBounds = useMemo(() => {
    if (lineData.length === 0) return { min: 0, max: 100 };
    const values = lineData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { min, max };
  }, [lineData]);

  const finalPoint = useMemo(() => {
    return lineData.length > 0 ? lineData[lineData.length - 1] : null;
  }, [lineData]);

  const finalAverageFormatted = finalPoint ? finalPoint.currentAverageFormatted : '0s';

  const cumulativeDeltaInfo = useMemo(() => {
    const totalMinutes = finalPoint?.rawCumulative || 0;
    let percentChange = 0;
    if (trend.previousTotalMinutes > 0) {
      percentChange = (totalMinutes / trend.previousTotalMinutes) * 100;
    } else if (totalMinutes > 0) {
      percentChange = 100;
    }

    return {
      percentChange,
      isPositive: true,
      baselineFormatted: formatMinutesToHours(trend.previousTotalMinutes),
      deltaFormatted: formatMinutesToHours(totalMinutes),
    };
  }, [trend.previousTotalMinutes, finalPoint]);

  return {
    trend,
    timeGroupMode,
    baselineAveragePerUnit,
    baselineAverageFormatted,
    lineData,
    chartBounds,
    finalPoint,
    finalAverageFormatted,
    cumulativeDeltaInfo,
  };
};
