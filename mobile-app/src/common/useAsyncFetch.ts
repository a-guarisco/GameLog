import { useCallback, useEffect, useRef, useState } from 'react';

export const useAsyncFetch = <T>(asyncFunction: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const refetch = useCallback(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setErrorMessage(null);

    return asyncFunction()
      .then((result) => {
        if (isMountedRef.current && requestId === requestIdRef.current) setData(result);
      })
      .catch((err: unknown) => {
        if (isMountedRef.current && requestId === requestIdRef.current) {
          console.error('Error fetching data:', err);
          const nextErrorMessage =
            err instanceof Error ? err.message : 'An error occurred while fetching data.';
          setErrorMessage(nextErrorMessage);
        }
      })
      .finally(() => {
        if (isMountedRef.current && requestId === requestIdRef.current) setIsLoading(false);
      });
  }, [asyncFunction]);

  useEffect(() => { refetch(); }, [refetch]);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  return { data, isLoading, error: !!errorMessage, errorMessage: errorMessage, refetch };
};
