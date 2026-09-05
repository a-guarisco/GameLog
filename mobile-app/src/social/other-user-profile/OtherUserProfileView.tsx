import React, { useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import GLRefreshControl from '@gamelog/common/GLRefreshControl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import HeaderGameImage from '@gamelog/common/HeaderGameImage';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import BackButton from '@gamelog/common/BackButton';
import VSpace from '@gamelog/common/VSpace';
import { useProfileSpacing } from '@gamelog/profile/useProfileSpacing';
import { useOrientation } from '@gamelog/common/useOrientation';
import CommunityPlaytimeHistogramChart from '@gamelog/common/charts/community-playtime-histogram/CommunityPlaytimeHistogramChart';
import CommunityTopGamesHistogramChart from '@gamelog/common/charts/community-top-games-histogram/CommunityTopGamesHistogramChart';
import CommunityGameStatusChart from '@gamelog/common/charts/community-game-status/CommunityGameStatusChart';
import CommunityGenreRadarChart from '@gamelog/common/charts/community-genre-radar/CommunityGenreRadarChart';
import OtherUserIdentity from './OtherUserIdentity';
import OtherUserStats from './OtherUserStats';
import { useOtherUserProfile } from './useOtherUserProfile';
import type { UserRead, FriendshipInfo, UserSearchResult } from '@gamelog/api-manager/dto';

export interface OtherUserProfileViewProps {
  item?: UserSearchResult;
  user?: UserRead;
  friendship?: FriendshipInfo | null;
  onClose?: () => void;
}

export const OtherUserProfileView: React.FC<OtherUserProfileViewProps> = ({
  item: propItem,
  user: propUser,
  friendship: propFriendship,
  onClose,
}) => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const routeItem = route.params?.item as UserSearchResult | undefined;
  const user = propUser ?? propItem?.user ?? routeItem?.user ?? route.params?.user;
  const initialFriendship =
    propFriendship ?? propItem?.friendship ?? routeItem?.friendship ?? route.params?.friendship;

  const { vspaceHeight } = useProfileSpacing();
  const { isLandscape, isTablet } = useOrientation();
  const insets = useSafeAreaInsets();
  const horizontalPadding = isLandscape ? 'px-8' : 'px-4';

  const {
    player,
    targetOwnedGames,
    currentUserOwnedGames,
    mostPlayedGame,
    friendship,
    isActionLoading,
    refetchAll,
    handleAddFriend,
    handleAcceptFriend,
    handleRefuseFriend,
    handleBlockFriend,
    handleRemoveFriend,
    handleRemovePending,
    handleUnblockFriend,
  } = useOtherUserProfile({
    user: user || { id: '', firebase_uid: '', username: 'User', steam_id: '', has_steam_api_key: false },
    initialFriendship,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    try {
      await refetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [refetchAll]);

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  if (!user) {
    return (
      <Box className="flex-1 bg-background-0">
        <BackButton onPress={handleBack} testID="other-user-profile-back-btn" />
      </Box>
    );
  }

  const username = user.username;
  const isFriend = friendship?.friendship_status === 'accepted';

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
        testID="other-user-profile-view"
      >
        <Box className="w-full relative" style={{ height: bannerHeight }}>
          <HeaderGameImage
            appid={mostPlayedGame?.appid}
            compact={!isTablet}
            contained
            height={bannerHeight}
            scrollable
          />
          <BackButton
            onPress={handleBack}
            testID="other-user-profile-back-btn"
            style={{ top: Math.max(insets.top, 8), left: 12 }}
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
            <OtherUserIdentity
              user={user}
              player={player}
              friendship={friendship}
              isActionLoading={isActionLoading}
              onAddFriend={handleAddFriend}
              onAcceptFriend={handleAcceptFriend}
              onRefuseFriend={handleRefuseFriend}
              onBlockFriend={handleBlockFriend}
              onRemoveFriend={handleRemoveFriend}
              onRemovePending={handleRemovePending}
              onUnblockFriend={handleUnblockFriend}
            />
          </Box>

          <Box className="bg-background-0 pb-10">
            <VStack space="xl" className="pt-6">
              <Box className={horizontalPadding}>
                <OtherUserStats
                  ownedGames={targetOwnedGames}
                  friendship={friendship}
                />
              </Box>

              {/* 4 Comparison charts in order */}
              <Box className={horizontalPadding}>
                <VStack space="lg" className="w-full" key={`charts-landscape-${refreshKey}`}>
                  {/* 1. Community Playtime with friend scope */}
                  <CommunityPlaytimeHistogramChart
                    key={`playtime-landscape-${refreshKey}`}
                    scope="user"
                    targetUserId={user.id}
                    targetUserName={username}
                    chartTitle={`${username}'s Playtime`}
                  />

                  {/* 2. Top Community Games with friend scope */}
                  <CommunityTopGamesHistogramChart
                    key={`topgames-landscape-${refreshKey}`}
                    scope="user"
                    targetUserId={user.id}
                    targetUserName={username}
                    chartTitle={`${username}'s Top Games`}
                    ownedGames={currentUserOwnedGames}
                    isFriend={isFriend}
                  />

                  {/* 3. Library Status Breakdown with friend scope */}
                  <CommunityGameStatusChart
                    key={`gamestatus-landscape-${refreshKey}`}
                    scope="user"
                    targetUserId={user.id}
                    targetUserName={username}
                    chartTitle="Library Status Breakdown"
                  />

                  {/* 4. Community Radar with friend scope and selector hidden */}
                  <CommunityGenreRadarChart
                    key={`radar-landscape-${refreshKey}`}
                    scope="user"
                    targetUserId={user.id}
                    targetUserName={username}
                    chartTitle={`${username}'s Radar`}
                    hideScopeSelector
                    ownedGames={currentUserOwnedGames}
                  />
                </VStack>
              </Box>
            </VStack>
          </Box>
        </ScrollView>
      </Box>
    );
  }

  return (
    <Box className="relative flex-1 bg-background-0" testID="other-user-profile-view">
      <HeaderGameImage appid={mostPlayedGame?.appid} />

      <ScrollablePage refreshing={refreshing} onRefresh={handleRefresh}>
        <VSpace size={vspaceHeight} testID="other-user-vspace" />

        <OtherUserIdentity
          user={user}
          player={player}
          friendship={friendship}
          isActionLoading={isActionLoading}
          onAddFriend={handleAddFriend}
          onAcceptFriend={handleAcceptFriend}
          onRefuseFriend={handleRefuseFriend}
          onBlockFriend={handleBlockFriend}
          onRemoveFriend={handleRemoveFriend}
          onRemovePending={handleRemovePending}
          onUnblockFriend={handleUnblockFriend}
        />

        <Box className="bg-background-0 pb-10">
          <VStack space="xl" className="pt-6">
            <Box className={horizontalPadding}>
              <OtherUserStats
                ownedGames={targetOwnedGames}
                friendship={friendship}
              />
            </Box>

            {/* 4 Comparison charts in order */}
            <Box className={horizontalPadding}>
              <VStack space="lg" className="w-full" key={`charts-portrait-${refreshKey}`}>
                {/* 1. Community Playtime with friend scope */}
                <CommunityPlaytimeHistogramChart
                  key={`playtime-portrait-${refreshKey}`}
                  scope="user"
                  targetUserId={user.id}
                  targetUserName={username}
                  chartTitle={`${username}'s Playtime`}
                />

                {/* 2. Top Community Games with friend scope */}
                <CommunityTopGamesHistogramChart
                  key={`topgames-portrait-${refreshKey}`}
                  scope="user"
                  targetUserId={user.id}
                  targetUserName={username}
                  chartTitle={`${username}'s Top Games`}
                  ownedGames={currentUserOwnedGames}
                  isFriend={isFriend}
                />

                {/* 3. Library Status Breakdown with friend scope */}
                <CommunityGameStatusChart
                  key={`gamestatus-portrait-${refreshKey}`}
                  scope="user"
                  targetUserId={user.id}
                  targetUserName={username}
                  chartTitle="Library Status Breakdown"
                />

                {/* 4. Community Radar with friend scope and selector hidden */}
                <CommunityGenreRadarChart
                  key={`radar-portrait-${refreshKey}`}
                  scope="user"
                  targetUserId={user.id}
                  targetUserName={username}
                  chartTitle={`${username}'s Radar`}
                  hideScopeSelector
                  ownedGames={currentUserOwnedGames}
                />
              </VStack>
            </Box>
          </VStack>
        </Box>
      </ScrollablePage>

      <BackButton onPress={handleBack} testID="other-user-profile-back-btn" />
    </Box>
  );
};

export default OtherUserProfileView;
