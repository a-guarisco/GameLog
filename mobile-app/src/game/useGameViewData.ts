import { useCallback } from 'react';
import useAchievementsData from '@gamelog/game/useAchievementsData';
import { GameScreenshot } from '@gamelog/game/GameScreenshotsStrip';
import {
  useGetGameScreenshots,
  useGetGameStatus,
  useGetGameStreak,
  useGetGlobalAchievement,
  useGetNumberOfCurrentPlayers,
  useGetPlaytimeReport,
} from '@gamelog/api-manager/useApi';
import { getReportMinutesForGame } from '@gamelog/common/selectPlaytimeReport';
import { useStreakText } from '@gamelog/common/useStreakText';
import { formatMinutesToHoursShort, formatShortDateWithYear } from '@gamelog/utils/formatUtils';
import type { PublishedFileDetails } from '@gamelog/api-manager/dto';

/** Steam leaves short_description empty on plenty of screenshots, hence the fallback. */
export const toGameScreenshots = (files: PublishedFileDetails[]): GameScreenshot[] =>
  files.map((file) => ({
    id: file.publishedfileid,
    imageUrl: file.image_url,
    caption: file.short_description || file.title || 'Community screenshot',
  }));

export const useGameViewData = (gameItem: any, playerID: string) => {
  const { gameStreak, isLoadingGameStreak, refetchGameStreak } = useGetGameStreak(gameItem.appid);
  const streakText = useStreakText(gameStreak?.streak, isLoadingGameStreak);

  const { globalAchievements, refetchGlobalAchievements } = useGetGlobalAchievement(gameItem.appid);
  const { unlockedCount, totalCount, completionPercent, refetchAchievements } = useAchievementsData(
    gameItem.appid,
    playerID,
    globalAchievements
  );

  const {
    screenshots,
    totalScreenshots,
    loadMoreScreenshots,
    isLoadingScreenshots,
    isLoadingMoreScreenshots,
    refetchScreenshots,
  } = useGetGameScreenshots(gameItem.appid);

  const { currentPlayers, refetchCurrentPlayers } = useGetNumberOfCurrentPlayers(gameItem.appid);
  const livePlayers = currentPlayers?.response?.player_count ?? 0;
  const { playtimeReport, isLoadingPlaytimeReport, refetchPlaytimeReport } = useGetPlaytimeReport();
  const recentMinutes = getReportMinutesForGame(playtimeReport, gameItem.appid);
  const { gameStatus, isLoadingGameStatus, refetchGameStatus } = useGetGameStatus(
    String(gameItem.appid)
  );

  const stats = [
    { value: formatMinutesToHoursShort(gameItem.playtime_forever), label: 'Total' },
    {
      value:
        isLoadingPlaytimeReport || !playtimeReport ? '—' : formatMinutesToHoursShort(recentMinutes),
      label: '2 weeks',
    },
    { value: formatShortDateWithYear(gameItem.rtime_last_played), label: 'Last played' },
  ];

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchGameStreak?.(),
      refetchGlobalAchievements?.(),
      refetchAchievements?.(),
      refetchScreenshots?.(),
      refetchCurrentPlayers?.(),
      refetchPlaytimeReport?.(),
      refetchGameStatus?.(),
    ]);
  }, [
    refetchGameStreak,
    refetchGlobalAchievements,
    refetchAchievements,
    refetchScreenshots,
    refetchCurrentPlayers,
    refetchPlaytimeReport,
    refetchGameStatus,
  ]);

  return {
    streakText,
    globalAchievements,
    unlockedCount,
    totalCount,
    completionPercent,
    screenshots: toGameScreenshots(screenshots),
    totalScreenshots,
    loadMoreScreenshots,
    isLoadingScreenshots,
    isLoadingMoreScreenshots,
    livePlayers,
    stats,
    gameStatus,
    isLoadingGameStatus,
    refetchGameStatus,
    refetchAll,
  };
};

export default useGameViewData;
