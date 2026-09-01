import { useCallback } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import { useAsyncFetch } from '@gamelog/common/useAsyncFetch';
import type { CommunityGameStatusResponse, CommunityScope } from '@gamelog/api-manager/dto';

export const useCommunityGameStatus = (scope: CommunityScope, userId?: string) => {
  const fetchFunc = useCallback(
    () =>
      userId
        ? ApiManager.getCommunityGameStatuses(scope, userId)
        : ApiManager.getCommunityGameStatuses(scope),
    [scope, userId]
  );

  const { data, isLoading, error, errorMessage, refetch } =
    useAsyncFetch<CommunityGameStatusResponse>(fetchFunc);

  return {
    data,
    isLoading,
    error,
    errorMessage,
    refetch,
  };
};
