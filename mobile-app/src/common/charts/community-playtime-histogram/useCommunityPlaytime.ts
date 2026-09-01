import { useCallback, useMemo } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import { useAsyncFetch } from '@gamelog/common/useAsyncFetch';
import { toIsoDate } from '@gamelog/utils/formatUtils';
import type { CommunityPlaytimeResponse, CommunityScope } from '@gamelog/api-manager/dto';

export type CommunityPeriodRange = 'week' | 'month';

export const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
export const FIRST_HALF_MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
export const SECOND_HALF_MONTH_LABELS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface CommunityDateRangeInfo {
  startDate: string;
  endDate: string;
  startTimestamp: number;
  endTimestamp: number;
  labels: string[];
}

export const getCommunityWeekRange = (date: Date = new Date(), offset: number = 0): CommunityDateRangeInfo => {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diffToMonday + offset * 7);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);

  return {
    startDate: toIsoDate(monday),
    endDate: toIsoDate(sunday),
    startTimestamp: Math.floor(monday.getTime() / 1000),
    endTimestamp: Math.floor(sunday.getTime() / 1000),
    labels: WEEKDAY_LABELS,
  };
};

export const getCommunityMonthRange = (date: Date = new Date(), offset: number = 0): CommunityDateRangeInfo => {
  const d = new Date(date);
  const currentYear = d.getFullYear();
  const currentMonth = d.getMonth(); // 0-11
  const currentSemester = currentMonth < 6 ? 0 : 1;

  const totalSemester = currentYear * 2 + currentSemester + offset;
  const targetYear = Math.floor(totalSemester / 2);
  const targetSemester = ((totalSemester % 2) + 2) % 2;

  const startMonth = targetSemester === 0 ? 0 : 6;
  const endMonth = targetSemester === 0 ? 5 : 11;

  const startDateObj = new Date(targetYear, startMonth, 1);
  const endDateObj = new Date(targetYear, endMonth + 1, 0);

  return {
    startDate: toIsoDate(startDateObj),
    endDate: toIsoDate(endDateObj),
    startTimestamp: Math.floor(startDateObj.getTime() / 1000),
    endTimestamp: Math.floor(endDateObj.getTime() / 1000),
    labels: targetSemester === 0 ? FIRST_HALF_MONTH_LABELS : SECOND_HALF_MONTH_LABELS,
  };
};

export interface UseCommunityPlaytimeProps {
  scope: CommunityScope;
  periodRange: CommunityPeriodRange;
  offset: number;
  currentDate?: Date;
  targetUserId?: string;
}

export const useCommunityPlaytime = ({
  scope,
  periodRange,
  offset,
  currentDate = new Date(),
  targetUserId,
}: UseCommunityPlaytimeProps) => {
  const dateRangeInfo = useMemo(() => {
    if (periodRange === 'week') {
      return getCommunityWeekRange(currentDate, offset);
    }
    return getCommunityMonthRange(currentDate, offset);
  }, [periodRange, offset, currentDate]);

  const fetchFunc = useCallback(() => {
    if (periodRange === 'week') {
      return ApiManager.getCommunityWeeklyPlaytime(
        scope,
        dateRangeInfo.startDate,
        dateRangeInfo.endDate,
        targetUserId
      );
    }
    return ApiManager.getCommunityMonthlyPlaytime(
      scope,
      dateRangeInfo.startDate,
      dateRangeInfo.endDate,
      targetUserId
    );
  }, [scope, periodRange, dateRangeInfo.startDate, dateRangeInfo.endDate, targetUserId]);

  const { data, isLoading, error, errorMessage, refetch } = useAsyncFetch<CommunityPlaytimeResponse>(fetchFunc);

  return {
    data,
    isLoading,
    error,
    errorMessage,
    refetch,
    dateRangeInfo,
  };
};
