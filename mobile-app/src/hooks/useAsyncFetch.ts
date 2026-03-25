import { useState, useEffect } from 'react';

export const useAsyncFetch = <T>(asyncFunction: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(false);

    asyncFunction()
      .then((result) => {
        if (isMounted) setData(result);
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error fetching data:', err);
          setError(true);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [asyncFunction]);

  return { data, isLoading, error };
};
