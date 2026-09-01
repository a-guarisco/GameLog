import { useCallback, useMemo } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import { useAsyncFetch } from '@gamelog/common/useAsyncFetch';
import {
  getCommunityWeekRange,
  getCommunityMonthRange,
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
  currentDate = new Date(),
  targetUserId,
}: UseCommunityTopGamesProps) => {
  const dateRangeInfo: CommunityDateRangeInfo = useMemo(() => {
    if (periodRange === 'week') {
      return getCommunityWeekRange(currentDate, offset);
    }
    return getCommunityMonthRange(currentDate, offset);
  }, [periodRange, offset, currentDate]);

  const fetchFunc = useCallback(() => {
    if (periodRange === 'week') {
      return ApiManager.getCommunityWeeklyTopGames(
        scope,
        dateRangeInfo.startDate,
        dateRangeInfo.endDate,
        reference,
        targetUserId
      );
    }
    return ApiManager.getCommunityMonthlyTopGames(
      scope,
      dateRangeInfo.startDate,
      dateRangeInfo.endDate,
      reference,
      targetUserId
    );
  }, [scope, periodRange, reference, dateRangeInfo.startDate, dateRangeInfo.endDate, targetUserId]);

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
