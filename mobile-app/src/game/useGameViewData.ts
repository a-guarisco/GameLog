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
  const { gameStreak, isLoadingGameStreak } = useGetGameStreak(gameItem.appid);
  const streakText = useStreakText(gameStreak?.streak, isLoadingGameStreak);

  const { globalAchievements } = useGetGlobalAchievement(gameItem.appid);
  const { unlockedCount, totalCount, completionPercent } = useAchievementsData(
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
  } = useGetGameScreenshots(gameItem.appid);

  const { currentPlayers } = useGetNumberOfCurrentPlayers(gameItem.appid);
  const livePlayers = currentPlayers?.response?.player_count ?? 0;
  const { playtimeReport, isLoadingPlaytimeReport } = useGetPlaytimeReport();
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
  };
};

export default useGameViewData;
