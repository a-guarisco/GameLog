import { useMemo } from 'react';
import {
  useGetOwnedGames,
  useGetPlayersInfo,
  useGetPlaytimeByUser,
  useGetPlaytimeReport,
  useGetUserStreak,
} from '@gamelog/api-manager/useApi';

export const useProfileChartsFetch = (userId: string) => {
  const { ownedGames, isLoadingOwnedGames, errorOwnedGames } = useGetOwnedGames(
    userId,
    false,
    false
  );

  const { playersInfo, isLoadingPlayersInfo } = useGetPlayersInfo(
    useMemo(() => [userId], [userId])
  );
  const { userStreak, isLoadingUserStreak } = useGetUserStreak();
  const { playtimeReport, isLoadingPlaytimeReport } = useGetPlaytimeReport();
  const { playtimeByUser, isLoadingPlaytimeByUser, errorPlaytimeByUser } = useGetPlaytimeByUser(-1);

  const isLoading =
    isLoadingOwnedGames ||
    isLoadingPlayersInfo ||
    isLoadingUserStreak ||
    isLoadingPlaytimeReport ||
    isLoadingPlaytimeByUser;

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
  };
};
