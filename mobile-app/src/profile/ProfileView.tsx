import { useState, useCallback, useMemo } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { RECENT_PLAYTIME_DAYS } from '@gamelog/api-manager/useApi';
import { getReportTotalMinutes } from '@gamelog/common/selectPlaytimeReport';
import HeaderGameImage from '@gamelog/common/HeaderGameImage';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import VSpace from '@gamelog/common/VSpace';
import ProfileIdentity from './ProfileIdentity';
import ProfileStats from './ProfileStats';
import ProfileSectionTabs from './ProfileSectionTabs';
import { selectMemberSinceLabel, selectMostPlayedGame } from './selectProfile';
import { selectPlaytimeTrend } from '@gamelog/common/charts/playtime-trend/selectPlaytimeTrend';
import { selectPlatformSplit } from '@gamelog/common/charts/platform-split/selectPlatformSplit';
import { getSteamId } from '@gamelog/api-manager/steamApiKey';

import { useProfileSpacing } from './useProfileSpacing';
import { useProfileChartsFetch } from './useProfileChartsFetch';
import { useOrientation } from '@gamelog/common/useOrientation';

const ProfileView = () => {
  const USER_ID = getSteamId();
  const { vspaceHeight } = useProfileSpacing();
  const { data, isLoading, errors, refetchAll } = useProfileChartsFetch(USER_ID);
  const { ownedGames, playersInfo, userStreak, playtimeReport, playtimeByUser } = data;
  const player = playersInfo?.response?.players?.[0];
  const { isLandscape } = useOrientation();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [refetchAll]);

  const mostPlayedGame = useMemo(() => selectMostPlayedGame(ownedGames), [ownedGames]);
  const platformSplit = useMemo(() => selectPlatformSplit(ownedGames), [ownedGames]);
  const playtimeTrend = useMemo(
    () => selectPlaytimeTrend(playtimeByUser, RECENT_PLAYTIME_DAYS),
    [playtimeByUser]
  );

  const horizontalPadding = isLandscape ? 'px-8' : 'px-4';

  return (
    <Box className="relative flex-1 bg-background-0">
      <HeaderGameImage appid={mostPlayedGame?.appid} />

      <ScrollablePage refreshing={refreshing} onRefresh={handleRefresh}>
        <VSpace size={vspaceHeight} testID="profile-vspace" />
        <ProfileIdentity
          name={player?.personaname ?? 'Unknown User'}
          avatarUrl={player?.avatarfull}
          streak={userStreak?.streak ?? 0}
          memberSinceLabel={selectMemberSinceLabel(player?.timecreated)}
          mostPlayedName={mostPlayedGame?.name}
        />
        <Box className="bg-background-0 pb-6" style={{ marginTop: -36 }}>
          <VStack space="xl" style={{ paddingTop: 60 }}>
            <Box className={horizontalPadding}>
              <ProfileStats
                ownedGames={ownedGames}
                recentMinutes={getReportTotalMinutes(playtimeReport)}
              />
            </Box>

            <Box className={horizontalPadding}>
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
