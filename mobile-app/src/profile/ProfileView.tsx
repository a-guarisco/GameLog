import { useMemo } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { LoadingBox } from '@gamelog/common/feedbacks/LoadingBox';
import {
  useGetOwnedGames,
  useGetGameGenreChartData,
  useGetPlayersInfo,
  useGetPlaytimeByUser,
  useGetPlaytimeReport,
  useGetUserStreak,
  RECENT_PLAYTIME_DAYS,
} from '@gamelog/api-manager/useApi';
import { getReportTotalMinutes } from '@gamelog/common/selectPlaytimeReport';
import HeaderGameImage from '@gamelog/common/HeaderGameImage';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import { useStreakText } from '@gamelog/common/useStreakText';
import ProfileIdentity from './ProfileIdentity';
import ProfileStats from './ProfileStats';
import ProfileSectionTabs from './ProfileSectionTabs';
import { getMemberSinceLabel, getMostPlayedGame, getTopGamesByHours } from './profileSelectors';
import { getPlaytimeTrend } from './playtimeTrendSelectors';
import { getPlatformSplit } from './platformSplitSelectors';
import { getSteamId } from '@gamelog/api-manager/steamApiKey';
import { ReportBox } from '../report/ReportBox';

const ProfileView = () => {
  const USER_ID = getSteamId();

  const { ownedGames, isLoadingOwnedGames, errorOwnedGames } = useGetOwnedGames(
    USER_ID,
    false,
    false
  );
  const { genreChartData, isLoadingGenreChart, errorGenreChart } = useGetGameGenreChartData(
    USER_ID,
    false,
    false
  );
  const { playersInfo, isLoadingPlayersInfo } = useGetPlayersInfo(useMemo(() => [USER_ID], []));
  const { userStreak, isLoadingUserStreak } = useGetUserStreak();
  const { playtimeReport, isLoadingPlaytimeReport } = useGetPlaytimeReport();
  const { playtimeByUser, isLoadingPlaytimeByUser, errorPlaytimeByUser } = useGetPlaytimeByUser();

  const isLoading =
    isLoadingOwnedGames ||
    isLoadingGenreChart ||
    isLoadingPlayersInfo ||
    isLoadingUserStreak ||
    isLoadingPlaytimeReport ||
    isLoadingPlaytimeByUser;
  const player = playersInfo?.response?.players?.[0];
  const streakText = useStreakText(userStreak?.streak, isLoadingUserStreak);

  const mostPlayedGame = useMemo(() => getMostPlayedGame(ownedGames), [ownedGames]);
  const topGames = useMemo(() => getTopGamesByHours(ownedGames), [ownedGames]);
  const platformSplit = useMemo(() => getPlatformSplit(ownedGames), [ownedGames]);
  const playtimeTrend = useMemo(
    () => getPlaytimeTrend(playtimeByUser, RECENT_PLAYTIME_DAYS),
    [playtimeByUser]
  );

  if (isLoading) {
    return (
      <LoadingBox
        message="Loading Profile"
        testID="profile-loading-box"
        style={{ flex: 1, paddingVertical: 60 }}
      />
    );
  }

  return (
    <Box className="relative flex-1">
      <HeaderGameImage appid={mostPlayedGame?.appid} />

      <ScrollablePage>
        <ProfileIdentity
          name={player?.personaname ?? 'Unknown User'}
          avatarUrl={player?.avatarfull}
          streakText={streakText}
          memberSinceLabel={getMemberSinceLabel(player?.timecreated)}
          mostPlayedName={mostPlayedGame?.name}
        />

        <Box className="bg-background-0 pb-6">
          <VStack space="xl" className="pt-6">
            <Box className="px-4">
              <ProfileStats
                ownedGames={ownedGames}
                recentMinutes={getReportTotalMinutes(playtimeReport)}
              />
            </Box>

            <Box className="px-4">
              <ProfileSectionTabs
                topGames={topGames}
                playtimeTrend={playtimeTrend}
                errorPlaytimeTrend={errorPlaytimeByUser}
                platformSplit={platformSplit}
                ownedGames={ownedGames}
                errorOwnedGames={errorOwnedGames}
                genreChartData={genreChartData}
                errorGenreChart={errorGenreChart}
              />
            </Box>
          </VStack>
        </Box>
      </ScrollablePage>
    </Box>
  );
};

export default ProfileView;
