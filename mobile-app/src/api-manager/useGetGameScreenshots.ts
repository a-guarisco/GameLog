import { useCallback, useEffect, useRef, useState } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import { PublishedFileDetails, PublishedFiles } from './dto';
import { filterValidScreenshots, mergeUniqueScreenshots } from './gameScreenshotsUtils';

export type GameScreenshotsFetcher = (
  appId: string,
  cursor: string,
  pageSize: number
) => Promise<PublishedFiles>;

export interface UseGetGameScreenshotsResult {
  screenshots: PublishedFileDetails[];
  totalScreenshots: number;
  hasMoreScreenshots: boolean;
  loadMoreScreenshots: () => void;
  isLoadingScreenshots: boolean;
  isLoadingMoreScreenshots: boolean;
  errorScreenshots: boolean;
  errorMessageScreenshots: string | null;
}

export const SCREENSHOTS_PAGE_SIZE = 50;
export const FIRST_SCREENSHOTS_CURSOR = '*';

export const useGetGameScreenshots = (
  appId: string,
  pageSize: number = SCREENSHOTS_PAGE_SIZE,
  fetcher: GameScreenshotsFetcher = ApiManager.getGameScreenshots
): UseGetGameScreenshotsResult => {
  const [screenshots, setScreenshots] = useState<PublishedFileDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cursorRef = useRef(FIRST_SCREENSHOTS_CURSOR);
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

      const isFirstPage = cursor === FIRST_SCREENSHOTS_CURSOR;
      if (isFirstPage) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const { response } = await fetcher(appId, cursor, pageSize);
        if (!isMountedRef.current || requestId !== requestIdRef.current) return;

        const page = filterValidScreenshots(response.publishedfiledetails);
        const nextCursor = response.next_cursor;

        setTotal(response.total ?? 0);
        setScreenshots((previous) => mergeUniqueScreenshots(previous, page));

        cursorRef.current = nextCursor ?? cursor;
        setHasMore(page.length > 0 && !!nextCursor && nextCursor !== cursor);
        setErrorMessage(null);
      } catch (err: unknown) {
        if (!isMountedRef.current || requestId !== requestIdRef.current) return;
        console.error('Error fetching game screenshots:', err);
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
    cursorRef.current = FIRST_SCREENSHOTS_CURSOR;
    setScreenshots([]);
    setTotal(0);
    setHasMore(true);
    setErrorMessage(null);
    loadPage(FIRST_SCREENSHOTS_CURSOR, requestIdRef.current);
  }, [loadPage]);

  const loadMoreScreenshots = useCallback(() => {
    if (isFetchingRef.current || !hasMore) return;
    loadPage(cursorRef.current, requestIdRef.current);
  }, [hasMore, loadPage]);

  return {
    screenshots,
    totalScreenshots: total,
    hasMoreScreenshots: hasMore,
    loadMoreScreenshots,
    isLoadingScreenshots: isLoading,
    isLoadingMoreScreenshots: isLoadingMore,
    errorScreenshots: !!errorMessage,
    errorMessageScreenshots: errorMessage,
  };
};
