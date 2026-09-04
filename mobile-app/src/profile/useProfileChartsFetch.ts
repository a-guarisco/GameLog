import { useCallback, useMemo } from 'react';
import {
  useGetOwnedGames,
  useGetPlayersInfo,
  useGetPlaytimeByUser,
  useGetPlaytimeReport,
  useGetUserStreak,
} from '@gamelog/api-manager/useApi';

export const useProfileChartsFetch = (userId: string) => {
  const { ownedGames, isLoadingOwnedGames, errorOwnedGames, refetchOwnedGames } = useGetOwnedGames(
    userId,
    false,
    false
  );

  const { playersInfo, isLoadingPlayersInfo, refetchPlayersInfo } = useGetPlayersInfo(
    useMemo(() => [userId], [userId])
  );
  const { userStreak, isLoadingUserStreak, refetchUserStreak } = useGetUserStreak();
  const { playtimeReport, isLoadingPlaytimeReport, refetchPlaytimeReport } = useGetPlaytimeReport();
  const { playtimeByUser, isLoadingPlaytimeByUser, errorPlaytimeByUser, refetchPlaytimeByUser } =
    useGetPlaytimeByUser(-1);

  const isLoading =
    isLoadingOwnedGames ||
    isLoadingPlayersInfo ||
    isLoadingUserStreak ||
    isLoadingPlaytimeReport ||
    isLoadingPlaytimeByUser;

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchOwnedGames(),
      refetchPlayersInfo(),
      refetchUserStreak(),
      refetchPlaytimeReport(),
      refetchPlaytimeByUser(),
    ]);
  }, [
    refetchOwnedGames,
    refetchPlayersInfo,
    refetchUserStreak,
    refetchPlaytimeReport,
    refetchPlaytimeByUser,
  ]);

  return {
    data: {
      ownedGames,
      playersInfo,
      userStreak,
      playtimeReport,
      playtimeByUser,
    },
    isLoading,
    errors: {
      ownedGames: errorOwnedGames,
      playtimeByUser: errorPlaytimeByUser,
    },
    isLoadingStates: {
      userStreak: isLoadingUserStreak, // Some components might need specific loading states (like useStreakText)
    },
    refetchAll,
  };
};
