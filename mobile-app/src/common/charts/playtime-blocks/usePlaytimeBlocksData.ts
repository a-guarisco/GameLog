import { useState, useMemo, useEffect } from 'react';
import type { PlaytimeByUser } from '@gamelog/api-manager/dto';
import { selectPlaytimeTrend } from '../playtime-trend/selectPlaytimeTrend';
import { getChartAxisStyle } from '@gamelog/common/typography/ChartTypography';
import { parseRGB } from '@gamelog/common/charts/chartsHelpers';

export const usePlaytimeBlocksData = (
  playtimeByUser: PlaytimeByUser | null | undefined,
  trendRange: string,
  weekOffset: number,
  visibleStartIndex: number | null,
  axisColor: string,
  primaryColor: string,
  theme: any
) => {
  const [baseLimitDate, setBaseLimitDate] = useState<string | null>(null);

  const daysToFetch = trendRange === 'week' ? (Math.abs(weekOffset) + 2) * 7 : -1;

  useEffect(() => {
    if (playtimeByUser && playtimeByUser.length > 0 && playtimeByUser.length < daysToFetch) {
      setBaseLimitDate(playtimeByUser[0].date);
    }
  }, [playtimeByUser, daysToFetch]);

  const trend = useMemo(
    () =>
      selectPlaytimeTrend(
        playtimeByUser,
        trendRange === 'week'
          ? 'week'
          : playtimeByUser?.length
            ? Math.max(14, playtimeByUser.length)
            : 14,
        weekOffset,
        new Date(),
        baseLimitDate
      ),
    [playtimeByUser, trendRange, weekOffset, baseLimitDate]
  );

  const summaryDays = useMemo(() => {
    return trendRange === '14'
      ? trend.days.slice(
          visibleStartIndex ?? Math.max(0, trend.days.length - 14),
          (visibleStartIndex ?? Math.max(0, trend.days.length - 14)) + 14
        )
      : trend.days;
  }, [trend.days, trendRange, visibleStartIndex]);

  const maxVisiblePlaytime = useMemo(() => {
    return Math.max(0, ...summaryDays.map((d) => d.minutes));
  }, [summaryDays]);

  const minVisiblePlaytime = useMemo(() => {
    if (maxVisiblePlaytime <= 0) return 0;
    const validPlaytimes = summaryDays
      .map((d) => d.minutes)
      .filter((m) => {
        const ratio = m / maxVisiblePlaytime;
        return ratio > 0.15 && ratio < 0.85;
      });
    if (validPlaytimes.length === 0) return 0;
    return Math.min(...validPlaytimes);
  }, [summaryDays, maxVisiblePlaytime]);

  const stackData = useMemo(() => {
    return trend.days.map((day) => {
      const dayTotal = day.stacks.reduce((acc, s) => acc + s.value, 0);
      const scaleFactor = maxVisiblePlaytime > 0 ? 100 / Math.max(maxVisiblePlaytime, dayTotal) : 0;

      return {
        stacks: day.stacks.map((stack, stackIndex) => {
          let finalColor = stack.color || '#3b82f6';
          if (!finalColor.startsWith('#') && !finalColor.startsWith('rgb')) {
            finalColor = parseRGB(finalColor);
          }

          const isBottom = stackIndex === 0;
          const isTop = stackIndex === day.stacks.length - 1;

          return {
            value: stack.value * scaleFactor,
            color: finalColor,
            borderTopLeftRadius: isTop ? 4 : 0,
            borderTopRightRadius: isTop ? 4 : 0,
            borderBottomLeftRadius: isBottom ? 4 : 0,
            borderBottomRightRadius: isBottom ? 4 : 0,
            marginBottom: isBottom ? 0 : -1,
          };
        }),
        label: day.label,
      };
    });
  }, [trend.days, maxVisiblePlaytime]);

  const finalStackData = useMemo(() => {
    return stackData.map((data, index) => {
      const textColor =
        trend.days[index].isFuture || trend.days[index].isPastLimit
          ? parseRGB(theme['--color-typography-600'])
          : trend.days[index].weekday === 0 || trend.days[index].weekday === 6
            ? primaryColor
            : axisColor;

      return {
        ...data,
        label:
          trendRange === '14' ? new Date(trend.days[index].date).getDate().toString() : data.label,
        labelTextStyle: {
          ...getChartAxisStyle(textColor, trend.days[index].isToday),
          textAlign: 'center',
        },
      };
    });
  }, [stackData, theme, trend.days, axisColor, primaryColor, trendRange]);

  return {
    baseLimitDate,
    trend,
    summaryDays,
    maxVisiblePlaytime,
    minVisiblePlaytime,
    finalStackData,
  };
};
