import { useMemo } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { LoadingBox } from '@gamelog/common/feedbacks/LoadingBox';
import {
  useGetOwnedGames,
  useGetGameGenreChartData,
  useGetPlayersInfo,
  useGetPlaytimeReport,
  useGetUserStreak,
} from '@gamelog/api-manager/useApi';
import { getReportTotalMinutes } from '@gamelog/common/playtimeReportSelectors';
import HeaderGameImage from '@gamelog/game/HeaderGameImage';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import { useStreakText } from '@gamelog/common/useStreakText';
import ProfileIdentity from './ProfileIdentity';
import ProfileStats from './ProfileStats';
import ProfileSectionTabs from './ProfileSectionTabs';
import { getMemberSinceLabel, getMostPlayedGame, getTopGamesByHours } from './profileSelectors';

const USER_ID = '76561198077919169';
/** Stands in for the hero artwork until the library says which game deserves it. */
const FALLBACK_APPID = '236390';

const ProfileView = () => {
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

  const isLoading =
    isLoadingOwnedGames ||
    isLoadingGenreChart ||
    isLoadingPlayersInfo ||
    isLoadingUserStreak ||
    isLoadingPlaytimeReport;
  const player = playersInfo?.response?.players?.[0];
  const streakText = useStreakText(userStreak?.streak, isLoadingUserStreak);

  const mostPlayedGame = useMemo(() => getMostPlayedGame(ownedGames), [ownedGames]);
  const topGames = useMemo(() => getTopGamesByHours(ownedGames), [ownedGames]);

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
      <HeaderGameImage appid={mostPlayedGame?.appid ?? FALLBACK_APPID} />

      <ScrollablePage>
        <ProfileIdentity
          name={player?.personaname ?? 'Unknown User'}
          avatarUrl={player?.avatarfull}
          streakText={streakText}
          memberSinceLabel={getMemberSinceLabel(player?.timecreated)}
          mostPlayedName={mostPlayedGame?.name}
        />

        <Box className="bg-background-100 pb-6 shadow-xl">
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
