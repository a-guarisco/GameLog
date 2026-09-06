import { useState, useCallback, useMemo } from 'react';
import { ScrollView } from 'react-native';
import GLRefreshControl from '@gamelog/common/GLRefreshControl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { RECENT_PLAYTIME_DAYS } from '@gamelog/api-manager/useApi';
import { getReportTotalMinutes } from '@gamelog/common/selectPlaytimeReport';
import HeaderGameImage from '@gamelog/common/HeaderGameImage';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import { useStreakText } from '@gamelog/common/useStreakText';
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
  const { data, isLoading, errors, isLoadingStates, refetchAll } =
    useProfileChartsFetch(USER_ID);
  const { ownedGames, playersInfo, userStreak, playtimeReport, playtimeByUser } = data;
  const player = playersInfo?.response?.players?.[0];
  const streakText = useStreakText(userStreak?.streak, isLoadingStates.userStreak);
  const { isLandscape, isTablet } = useOrientation();
  const insets = useSafeAreaInsets();

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

  if (isLandscape) {
    const leftRailOffset = insets.left + 74;
    const bannerHeight = isTablet ? 280 : 120;

    return (
      <Box
        className="flex-1 bg-background-0"
        style={{
          paddingLeft: leftRailOffset,
          paddingRight: insets.right,
          paddingBottom: insets.bottom,
        }}
      >
        <Box className="w-full relative" style={{ height: bannerHeight }}>
          <HeaderGameImage
            appid={mostPlayedGame?.appid}
            compact={!isTablet}
            contained
            height={bannerHeight}
            scrollable
          />
        </Box>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={true}
          refreshControl={
            <GLRefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <Box className="pt-2">
            <ProfileIdentity
              name={player?.personaname ?? 'Unknown User'}
              avatarUrl={player?.avatarfull}
              streakText={streakText}
              memberSinceLabel={selectMemberSinceLabel(player?.timecreated)}
              mostPlayedName={mostPlayedGame?.name}
            />
          </Box>
          <Box className="bg-background-0 pb-6">
            <VStack space="xl" className="pt-6">
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
        </ScrollView>
      </Box>
    );
  }

  return (
    <Box className="relative flex-1">
      <HeaderGameImage appid={mostPlayedGame?.appid} />

      <ScrollablePage refreshing={refreshing} onRefresh={handleRefresh}>
        <VSpace size={vspaceHeight} testID="profile-vspace" />
        <ProfileIdentity
          name={player?.personaname ?? 'Unknown User'}
          avatarUrl={player?.avatarfull}
          streakText={streakText}
          memberSinceLabel={selectMemberSinceLabel(player?.timecreated)}
          mostPlayedName={mostPlayedGame?.name}
        />
        <Box className="bg-background-0 pb-6">
          {isLandscape ? (
            /* ── Landscape: stats row + tabs side-by-side ── */
            <VStack space="xl" className="pt-6">
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
          ) : (
            /* ── Portrait: original stacked layout ── */
            <VStack space="xl" className="pt-6">
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
          )}
        </Box>
      </ScrollablePage>
    </Box>
  );
};

export default ProfileView;
