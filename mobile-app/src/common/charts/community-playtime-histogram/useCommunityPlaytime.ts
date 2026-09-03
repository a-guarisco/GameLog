import { useCallback, useMemo } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import { useAsyncFetch } from '@gamelog/common/useAsyncFetch';
import { toIsoDate } from '@gamelog/utils/formatUtils';
import type { CommunityPlaytimeResponse, CommunityScope } from '@gamelog/api-manager/dto';

export type CommunityPeriodRange = 'week' | 'twoWeeks' | 'month' | 'year';

export const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
export const FIRST_HALF_MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
export const SECOND_HALF_MONTH_LABELS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const FULL_YEAR_MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export interface CommunityDateRangeInfo {
  startDate: string;
  endDate: string;
  startTimestamp: number;
  endTimestamp: number;
  labels: string[];
}

export interface CommunityTwoWeeksRangeInfo extends CommunityDateRangeInfo {
  week1: { startDate: string; endDate: string };
  week2: { startDate: string; endDate: string };
}

export const getCommunityWeekRange = (
  date: Date = new Date(),
  offset: number = 0
): CommunityDateRangeInfo => {
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

export const getCommunityTwoWeeksRange = (
  date: Date = new Date(),
  offset: number = 0
): CommunityTwoWeeksRangeInfo => {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const week2Monday = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate() + diffToMonday + offset * 14
  );
  const week2Sunday = new Date(
    week2Monday.getFullYear(),
    week2Monday.getMonth(),
    week2Monday.getDate() + 6
  );
  const week1Monday = new Date(
    week2Monday.getFullYear(),
    week2Monday.getMonth(),
    week2Monday.getDate() - 7
  );
  const week1Sunday = new Date(
    week1Monday.getFullYear(),
    week1Monday.getMonth(),
    week1Monday.getDate() + 6
  );

  return {
    startDate: toIsoDate(week1Monday),
    endDate: toIsoDate(week2Sunday),
    startTimestamp: Math.floor(week1Monday.getTime() / 1000),
    endTimestamp: Math.floor(week2Sunday.getTime() / 1000),
    labels: [...WEEKDAY_LABELS, ...WEEKDAY_LABELS],
    week1: {
      startDate: toIsoDate(week1Monday),
      endDate: toIsoDate(week1Sunday),
    },
    week2: {
      startDate: toIsoDate(week2Monday),
      endDate: toIsoDate(week2Sunday),
    },
  };
};

export const getCommunityMonthRange = (
  date: Date = new Date(),
  offset: number = 0
): CommunityDateRangeInfo => {
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

export const getCommunityYearRange = (
  date: Date = new Date(),
  offset: number = 0
): CommunityDateRangeInfo => {
  const d = new Date(date);
  const targetYear = d.getFullYear() + offset;

  const startDateObj = new Date(targetYear, 0, 1);
  const endDateObj = new Date(targetYear, 11, 31);

  return {
    startDate: toIsoDate(startDateObj),
    endDate: toIsoDate(endDateObj),
    startTimestamp: Math.floor(startDateObj.getTime() / 1000),
    endTimestamp: Math.floor(endDateObj.getTime() / 1000),
    labels: FULL_YEAR_MONTH_LABELS,
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
  currentDate,
  targetUserId,
}: UseCommunityPlaytimeProps) => {
  const dateTimestamp = currentDate ? currentDate.getTime() : null;
  const effectiveDate = useMemo(
    () => (dateTimestamp ? new Date(dateTimestamp) : new Date()),
    [dateTimestamp]
  );

  const dateRangeInfo = useMemo(() => {
    if (periodRange === 'week') {
      return getCommunityWeekRange(effectiveDate, offset);
    }
    if (periodRange === 'twoWeeks') {
      return getCommunityTwoWeeksRange(effectiveDate, offset);
    }
    if (periodRange === 'year') {
      return getCommunityYearRange(effectiveDate, offset);
    }
    return getCommunityMonthRange(effectiveDate, offset);
  }, [periodRange, offset, effectiveDate]);

  const startDate = dateRangeInfo.startDate;
  const endDate = dateRangeInfo.endDate;
  const twoWeeksInfo =
    periodRange === 'twoWeeks' ? (dateRangeInfo as CommunityTwoWeeksRangeInfo) : null;
  const week1Start = twoWeeksInfo?.week1.startDate;
  const week1End = twoWeeksInfo?.week1.endDate;
  const week2Start = twoWeeksInfo?.week2.startDate;
  const week2End = twoWeeksInfo?.week2.endDate;

  const fetchFunc = useCallback(() => {
    if (periodRange === 'week') {
      return targetUserId
        ? ApiManager.getCommunityWeeklyPlaytime(scope, startDate, endDate, targetUserId)
        : ApiManager.getCommunityWeeklyPlaytime(scope, startDate, endDate);
    }
    if (periodRange === 'twoWeeks' && week1Start && week1End && week2Start && week2End) {
      const p1 = targetUserId
        ? ApiManager.getCommunityWeeklyPlaytime(scope, week1Start, week1End, targetUserId)
        : ApiManager.getCommunityWeeklyPlaytime(scope, week1Start, week1End);
      const p2 = targetUserId
        ? ApiManager.getCommunityWeeklyPlaytime(scope, week2Start, week2End, targetUserId)
        : ApiManager.getCommunityWeeklyPlaytime(scope, week2Start, week2End);
      return Promise.all([p1, p2]).then(([w1, w2]) => ({
        user: [...(w1?.user || []), ...(w2?.user || [])],
        community: [...(w1?.community || []), ...(w2?.community || [])],
      }));
    }
    return targetUserId
      ? ApiManager.getCommunityMonthlyPlaytime(scope, startDate, endDate, targetUserId)
      : ApiManager.getCommunityMonthlyPlaytime(scope, startDate, endDate);
  }, [
    scope,
    periodRange,
    startDate,
    endDate,
    week1Start,
    week1End,
    week2Start,
    week2End,
    targetUserId,
  ]);

  const { data, isLoading, error, errorMessage, refetch } =
    useAsyncFetch<CommunityPlaytimeResponse>(fetchFunc);

  return {
    data,
    isLoading,
    error,
    errorMessage,
    refetch,
    dateRangeInfo,
  };
};
