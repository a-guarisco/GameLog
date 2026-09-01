import React from 'react';
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
  const { isLandscape } = useOrientation();
  const horizontalPadding = isLandscape ? 'px-8' : 'px-4';

  const {
    player,
    targetOwnedGames,
    currentUserOwnedGames,
    mostPlayedGame,
    friendship,
    isActionLoading,
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

  return (
    <Box className="relative flex-1 bg-background-0" testID="other-user-profile-view">
      <HeaderGameImage appid={mostPlayedGame?.appid} />

      <ScrollablePage>
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
              <VStack space="lg" className="w-full">
                {/* 1. Community Playtime with friend scope */}
                <CommunityPlaytimeHistogramChart
                  scope="user"
                  targetUserId={user.id}
                  targetUserName={username}
                  chartTitle={`${username}'s Playtime`}
                />

                {/* 2. Top Community Games with friend scope */}
                <CommunityTopGamesHistogramChart
                  scope="user"
                  targetUserId={user.id}
                  targetUserName={username}
                  chartTitle={`${username}'s Top Games`}
                  ownedGames={currentUserOwnedGames}
                />

                {/* 3. Library Status Breakdown with friend scope */}
                <CommunityGameStatusChart
                  scope="user"
                  targetUserId={user.id}
                  targetUserName={username}
                  chartTitle="Library Status Breakdown"
                />

                {/* 4. Community Radar with friend scope and selector hidden */}
                <CommunityGenreRadarChart
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
