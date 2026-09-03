import { useMemo } from 'react';
import type { CommunityPlaytimeResponse } from '@gamelog/api-manager/dto';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';
import { getChartAxisStyle } from '@gamelog/common/typography/ChartTypography';
import { parseRGB } from '@gamelog/common/charts/chartsHelpers';
import type { CommunityPeriodRange } from './useCommunityPlaytime';

export interface UseCommunityPlaytimeHistogramDataProps {
  data: CommunityPlaytimeResponse | null | undefined;
  periodRange: CommunityPeriodRange;
  labels: string[];
  offset: number;
  axisColor: string;
  primaryColor: string;
  purpleColor: string;
  theme: any;
  barWidth?: number;
  currentDate?: Date;
}

export const useCommunityPlaytimeHistogramData = ({
  data,
  periodRange,
  labels,
  offset,
  axisColor,
  primaryColor,
  purpleColor,
  theme,
  barWidth = 12,
  currentDate,
}: UseCommunityPlaytimeHistogramDataProps) => {
  const dateTimestamp = currentDate ? currentDate.getTime() : null;
  const effectiveDate = useMemo(
    () => (dateTimestamp ? new Date(dateTimestamp) : new Date()),
    [dateTimestamp]
  );

  const userValues = useMemo(() => data?.user ?? [], [data?.user]);
  const communityValues = useMemo(() => data?.community ?? [], [data?.community]);

  const userTotalHours = useMemo(
    () => userValues.reduce((acc, v) => acc + (Number(v) || 0), 0),
    [userValues]
  );
  const communityTotalHours = useMemo(
    () => communityValues.reduce((acc, v) => acc + (Number(v) || 0), 0),
    [communityValues]
  );

  const userTotalLabel = useMemo(
    () => formatMinutesToHours(Math.round(userTotalHours * 60)) || '0h',
    [userTotalHours]
  );
  const communityTotalLabel = useMemo(
    () => formatMinutesToHours(Math.round(communityTotalHours * 60)) || '0h',
    [communityTotalHours]
  );

  const maxVisibleHours = useMemo(() => {
    const all = [...userValues, ...communityValues].map((v) => Number(v) || 0);
    if (all.length === 0) return 0;
    const maxVal = Math.max(...all);
    return Math.ceil(maxVal);
  }, [userValues, communityValues]);

  const minVisibleHours = useMemo(() => {
    if (maxVisibleHours <= 0) return 0;
    const all = [...userValues, ...communityValues].map((v) => Number(v) || 0);
    const valid = all.filter((v) => {
      const ratio = v / maxVisibleHours;
      return ratio > 0.15 && ratio < 0.85;
    });
    if (valid.length === 0) return 0;
    return Math.min(...valid);
  }, [userValues, communityValues, maxVisibleHours]);

  const hasPlaytime = userTotalHours > 0 || communityTotalHours > 0;
  const pairWidth = 2 * barWidth + 2;

  const currentDayIndex = useMemo(() => {
    if (offset !== 0) return -1;
    if (periodRange === 'week') {
      const day = effectiveDate.getDay();
      return day === 0 ? 6 : day - 1; // 0 = Mon, 6 = Sun
    }
    if (periodRange === 'twoWeeks') {
      const day = effectiveDate.getDay();
      const dayInWeek = day === 0 ? 6 : day - 1;
      return 7 + dayInWeek;
    }
    if (periodRange === 'year') {
      return effectiveDate.getMonth();
    }
    return effectiveDate.getMonth() % 6;
  }, [offset, periodRange, effectiveDate]);

  const barData = useMemo(() => {
    const items: any[] = [];

    labels.forEach((label, index) => {
      const uVal = Number(userValues[index]) || 0;
      const cVal = Number(communityValues[index]) || 0;

      const isCurrent = index === currentDayIndex;
      const isFuture = offset === 0 && currentDayIndex >= 0 && index > currentDayIndex;

      const textColor = isFuture
        ? parseRGB(theme['--color-typography-600'])
        : isCurrent
          ? primaryColor
          : axisColor;

      // User Bar
      items.push({
        value: uVal,
        label,
        spacing: 2,
        labelWidth: pairWidth + 4,
        labelTextStyle: {
          ...getChartAxisStyle(textColor, isCurrent),
          textAlign: 'center',
          marginLeft: -barWidth / 2,
        },
        frontColor: primaryColor,
        topRadius: 4,
        bottomRadius: 4,
        borderRadius: 4,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
      });

      // Community Bar
      items.push({
        value: cVal,
        spacing: 12,
        frontColor: purpleColor,
        topRadius: 4,
        bottomRadius: 4,
        borderRadius: 4,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
      });
    });

    return items;
  }, [
    labels,
    userValues,
    communityValues,
    currentDayIndex,
    offset,
    theme,
    primaryColor,
    axisColor,
    purpleColor,
    pairWidth,
    barWidth,
  ]);

  const chartMaxValue = useMemo(() => {
    if (maxVisibleHours <= 0) return 10;
    return Math.ceil(maxVisibleHours * 1.15 * 10) / 10;
  }, [maxVisibleHours]);

  return {
    userValues,
    communityValues,
    userTotalHours,
    communityTotalHours,
    userTotalLabel,
    communityTotalLabel,
    maxVisibleHours,
    minVisibleHours,
    hasPlaytime,
    barData,
    chartMaxValue,
  };
};
