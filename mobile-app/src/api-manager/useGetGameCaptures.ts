import { useCallback, useEffect, useRef, useState } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import { PublishedFileDetails, PublishedFiles } from './dto';
import { filterValidCaptures, mergeUniqueCaptures } from './gameCapturesUtils';

export type GameCapturesFetcher = (
  appId: string,
  cursor: string,
  pageSize: number
) => Promise<PublishedFiles>;

export interface UseGetGameCapturesResult {
  captures: PublishedFileDetails[];
  totalCaptures: number;
  hasMoreCaptures: boolean;
  loadMoreCaptures: () => void;
  isLoadingCaptures: boolean;
  isLoadingMoreCaptures: boolean;
  errorCaptures: boolean;
  errorMessageCaptures: string | null;
}

export const CAPTURES_PAGE_SIZE = 50;
export const FIRST_CAPTURES_CURSOR = '*';

export const useGetGameCaptures = (
  appId: string,
  pageSize: number = CAPTURES_PAGE_SIZE,
  fetcher: GameCapturesFetcher = ApiManager.getGameCaptures
): UseGetGameCapturesResult => {
  const [captures, setCaptures] = useState<PublishedFileDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cursorRef = useRef(FIRST_CAPTURES_CURSOR);
  const isFetchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  const loadPage = useCallback(
    async (cursor: string, requestId: number) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      const isFirstPage = cursor === FIRST_CAPTURES_CURSOR;
      if (isFirstPage) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const { response } = await fetcher(appId, cursor, pageSize);
        if (!isMountedRef.current || requestId !== requestIdRef.current) return;

        const page = filterValidCaptures(response.publishedfiledetails);
        const nextCursor = response.next_cursor;

        setTotal(response.total ?? 0);
        setCaptures((previous) => mergeUniqueCaptures(previous, page));

        cursorRef.current = nextCursor ?? cursor;
        setHasMore(page.length > 0 && !!nextCursor && nextCursor !== cursor);
        setErrorMessage(null);
      } catch (err: unknown) {
        if (!isMountedRef.current || requestId !== requestIdRef.current) return;
        console.error('Error fetching game captures:', err);
        setErrorMessage(
          err instanceof Error ? err.message : 'An error occurred while fetching screenshots.'
        );
        setHasMore(false);
      } finally {
        isFetchingRef.current = false;
        if (isMountedRef.current && requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [appId, pageSize, fetcher]
  );

  useEffect(() => {
    requestIdRef.current += 1;
    isFetchingRef.current = false;
    cursorRef.current = FIRST_CAPTURES_CURSOR;
    setCaptures([]);
    setTotal(0);
    setHasMore(true);
    setErrorMessage(null);
    loadPage(FIRST_CAPTURES_CURSOR, requestIdRef.current);
  }, [loadPage]);

  const loadMoreCaptures = useCallback(() => {
    if (isFetchingRef.current || !hasMore) return;
    loadPage(cursorRef.current, requestIdRef.current);
  }, [hasMore, loadPage]);

  return {
    captures,
    totalCaptures: total,
    hasMoreCaptures: hasMore,
    loadMoreCaptures,
    isLoadingCaptures: isLoading,
    isLoadingMoreCaptures: isLoadingMore,
    errorCaptures: !!errorMessage,
    errorMessageCaptures: errorMessage,
  };
};
