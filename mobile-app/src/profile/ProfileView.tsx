import { useMemo } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { RECENT_PLAYTIME_DAYS } from '@gamelog/api-manager/useApi';
import { getReportTotalMinutes } from '@gamelog/common/selectPlaytimeReport';
import HeaderGameImage from '@gamelog/common/HeaderGameImage';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import { useStreakText } from '@gamelog/common/useStreakText';
import ProfileIdentity from './ProfileIdentity';
import ProfileStats from './ProfileStats';
import ProfileSectionTabs from './ProfileSectionTabs';
import { selectMemberSinceLabel, selectMostPlayedGame } from './selectProfile';
import { selectPlaytimeTrend } from '@gamelog/common/charts/playtime-trend/selectPlaytimeTrend';
import { selectPlatformSplit } from '@gamelog/common/charts/platform-split/selectPlatformSplit';
import { getSteamId } from '@gamelog/api-manager/steamApiKey';

import { useProfileChartsFetch } from './useProfileChartsFetch';

const ProfileView = () => {
  const USER_ID = getSteamId();
<<<<<<< HEAD

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
=======
  const { data, isLoading, errors, isLoadingStates } = useProfileChartsFetch(USER_ID);
  const { ownedGames, playersInfo, userStreak, playtimeReport, playtimeByUser } = data;
>>>>>>> 351a538 (refactor(mobile): overhaul ProfileView with tabbed layout, centralized fetch and migrated charts)
  const player = playersInfo?.response?.players?.[0];
  const streakText = useStreakText(userStreak?.streak, isLoadingStates.userStreak);

  const mostPlayedGame = useMemo(() => selectMostPlayedGame(ownedGames), [ownedGames]);
  const platformSplit = useMemo(() => selectPlatformSplit(ownedGames), [ownedGames]);
  const playtimeTrend = useMemo(
    () => selectPlaytimeTrend(playtimeByUser, RECENT_PLAYTIME_DAYS),
    [playtimeByUser]
  );

  return (
    <Box className="relative flex-1">
      <HeaderGameImage appid={mostPlayedGame?.appid} />

      <ScrollablePage>
        <ProfileIdentity
          name={player?.personaname ?? 'Unknown User'}
          avatarUrl={player?.avatarfull}
          streakText={streakText}
          memberSinceLabel={selectMemberSinceLabel(player?.timecreated)}
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
                playtimeTrend={playtimeTrend}
                errorPlaytimeTrend={errors.playtimeByUser}
                platformSplit={platformSplit}
                ownedGames={ownedGames}
                errorOwnedGames={errors.ownedGames}
                playtimeByUser={playtimeByUser}
                errorPlaytimeByUser={errors.playtimeByUser}
                userId={USER_ID}
                isLoading={isLoading}
              />
            </Box>
          </VStack>
        </Box>
      </ScrollablePage>
    </Box>
  );
};

export default ProfileView;
