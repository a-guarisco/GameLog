import { useMemo } from 'react';

export const useStreakText = (streak: number | null | undefined, isLoading: boolean): string => {
  return useMemo(() => {
    if (isLoading) return 'Loading streak...';
    const value = typeof streak === 'number' ? streak : 0;
    return value > 0 ? `${value} day streak` : '0 day streak';
  }, [streak, isLoading]);
};
