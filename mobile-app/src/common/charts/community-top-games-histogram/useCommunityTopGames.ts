import { useCallback, useMemo } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import { useAsyncFetch } from '@gamelog/common/useAsyncFetch';
import {
  getCommunityWeekRange,
  getCommunityTwoWeeksRange,
  getCommunityMonthRange,
  getCommunityYearRange,
  CommunityPeriodRange,
  CommunityDateRangeInfo,
} from '@gamelog/common/charts/community-playtime-histogram/useCommunityPlaytime';
import type { CommunityTopGame, CommunityScope, TopGameReference } from '@gamelog/api-manager/dto';

export interface UseCommunityTopGamesProps {
  scope: CommunityScope;
  periodRange: CommunityPeriodRange;
  reference?: TopGameReference;
  offset: number;
  currentDate?: Date;
  targetUserId?: string;
}

export const useCommunityTopGames = ({
  scope,
  periodRange,
  reference = 'community',
  offset,
  currentDate,
  targetUserId,
}: UseCommunityTopGamesProps) => {
  const dateTimestamp = currentDate ? currentDate.getTime() : null;
  const effectiveDate = useMemo(
    () => (dateTimestamp ? new Date(dateTimestamp) : new Date()),
    [dateTimestamp]
  );

  const dateRangeInfo: CommunityDateRangeInfo = useMemo(() => {
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

  const fetchFunc = useCallback(() => {
    if (periodRange === 'week' || periodRange === 'twoWeeks') {
      return targetUserId
        ? ApiManager.getCommunityWeeklyTopGames(scope, startDate, endDate, reference, targetUserId)
        : ApiManager.getCommunityWeeklyTopGames(scope, startDate, endDate, reference);
    }
    return targetUserId
      ? ApiManager.getCommunityMonthlyTopGames(scope, startDate, endDate, reference, targetUserId)
      : ApiManager.getCommunityMonthlyTopGames(scope, startDate, endDate, reference);
  }, [scope, periodRange, reference, startDate, endDate, targetUserId]);

  const { data, isLoading, error, errorMessage, refetch } =
    useAsyncFetch<CommunityTopGame[]>(fetchFunc);

  return {
    data,
    isLoading,
    error,
    errorMessage,
    refetch,
    dateRangeInfo,
  };
};
