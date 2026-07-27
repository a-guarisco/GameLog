import { useState, useEffect } from 'react';

export const useAsyncFetch = <T>(asyncFunction: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    asyncFunction()
      .then((result) => {
        if (isMounted) setData(result);
      })
      .catch((err: unknown) => {
        if (isMounted) {
          console.error('Error fetching data:', err);
          const nextErrorMessage =
            err instanceof Error ? err.message : 'An error occurred while fetching data.';
          setErrorMessage(nextErrorMessage);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [asyncFunction]);

  return { data, isLoading, error: !!errorMessage, errorMessage: errorMessage };
};
