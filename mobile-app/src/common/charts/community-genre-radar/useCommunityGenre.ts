import { useCallback } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import { useAsyncFetch } from '@gamelog/common/useAsyncFetch';
import type { CommunityGenreHour, CommunityScope } from '@gamelog/api-manager/dto';

export const useCommunityGenre = (scope: CommunityScope, userId?: string) => {
  const fetchFunc = useCallback(
    () =>
      userId ? ApiManager.getCommunityGenre(scope, userId) : ApiManager.getCommunityGenre(scope),
    [scope, userId]
  );

  const { data, isLoading, error, errorMessage, refetch } =
    useAsyncFetch<CommunityGenreHour[]>(fetchFunc);

  return {
    communityGenres: data ?? [],
    isLoadingCommunity: isLoading,
    errorCommunity: error,
    errorMessageCommunity: errorMessage,
    refetchCommunity: refetch,
  };
};
