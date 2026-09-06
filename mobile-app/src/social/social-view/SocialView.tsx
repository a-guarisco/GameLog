import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import { useGetFriendList, useSearchUsers, useGetUserMe } from '@gamelog/api-manager/useApi';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import SocialIdentity from './SocialIdentity';
import RecommenderSummaryCard from './RecommenderSummaryCard';
import SocialSectionTabs from './SocialSectionTabs';
import { useFriendActions } from './useFriendActions';
import { selectPendingRequests, selectAcceptedFriends } from './friendListSelectors';
import { useSteamAvatars } from '../useSteamAvatars';

export const SocialView: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState('');

  const { currentUser, refetchUserMe } = useGetUserMe();

  const {
    friendList,
    isLoadingFriendList,
    errorFriendList,
    errorMessageFriendList,
    refetchFriendList,
  } = useGetFriendList();

  const { searchResults, isLoadingSearch, errorSearch, errorMessageSearch, refetchSearch } =
    useSearchUsers(searchQuery);

  const {
    isActionLoading,
    actionFeedback,
    handleAddFriend,
    handleAcceptFriend,
    handleRefuseFriend,
    handleBlockFriend,
    handleRemoveFriend,
    handleRemovePending,
    handleUnblockFriend,
  } = useFriendActions({
    onFriendListChanged: refetchFriendList,
    onSearchResultsChanged: refetchSearch,
  });

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('friendListChanged', () => {
      refetchFriendList();
      refetchSearch();
    });
    return () => sub.remove();
  }, [refetchFriendList, refetchSearch]);

  const pendingRequests = selectPendingRequests(friendList);
  const acceptedFriends = selectAcceptedFriends(friendList);

  const allSocialSteamIds = useMemo(() => {
    const ids: string[] = [];
    if (pendingRequests) {
      for (const item of pendingRequests) {
        if (item.user?.steam_id) ids.push(item.user.steam_id);
      }
    }
    if (acceptedFriends) {
      for (const item of acceptedFriends) {
        if (item.user?.steam_id) ids.push(item.user.steam_id);
      }
    }
    if (searchResults) {
      for (const item of searchResults) {
        if (item.user?.steam_id) ids.push(item.user.steam_id);
      }
    }
    return ids;
  }, [pendingRequests, acceptedFriends, searchResults]);

  const { avatarMap, refetchAvatars } = useSteamAvatars(allSocialSteamIds);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchUserMe(), refetchFriendList(), refetchSearch(), refetchAvatars()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchUserMe, refetchFriendList, refetchSearch, refetchAvatars]);

  const handleOpenRecommendations = (friendItem?: UserSearchResult) => {
    navigation.navigate('FriendRecommendations', {
      friendItem,
    });
  };

  const handleSelectUser = (item: UserSearchResult) => {
    navigation.navigate('OtherUserProfile', {
      item,
      user: item.user,
      friendship: item.friendship,
    });
  };

  return (
    <Box className="flex-1 relative bg-background-0">
      <ScrollablePage hasBanner={false} refreshing={refreshing} onRefresh={handleRefresh}>
        <SocialIdentity />

        <Box className="bg-background-0 pb-6">
          <VStack space="xl" className="pt-4">
            <Box className="px-4">
              <RecommenderSummaryCard
                onPress={() => handleOpenRecommendations()}
                testID="social-recommender-card"
              />
            </Box>

            <SocialSectionTabs
              isLoadingFriendList={isLoadingFriendList}
              errorFriendList={!!errorFriendList}
              errorMessageFriendList={errorMessageFriendList}
              pendingRequests={pendingRequests}
              acceptedFriends={acceptedFriends}
              searchQuery={searchQuery}
              onQueryChange={setSearchQuery}
              searchResults={searchResults}
              isLoadingSearch={isLoadingSearch}
              errorSearch={!!errorSearch}
              errorMessageSearch={errorMessageSearch}
              avatarMap={avatarMap}
              isActionLoading={isActionLoading}
              actionFeedback={actionFeedback}
              handlers={{
                currentUserId: currentUser?.id,
                onAddFriend: handleAddFriend,
                onAcceptFriend: handleAcceptFriend,
                onRefuseFriend: handleRefuseFriend,
                onBlockFriend: handleBlockFriend,
                onRemoveFriend: handleRemoveFriend,
                onRemovePending: handleRemovePending,
                onUnblockFriend: handleUnblockFriend,
                onSelectRecommendations: handleOpenRecommendations,
                onSelectUser: handleSelectUser,
              }}
            />
          </VStack>
        </Box>
      </ScrollablePage>
    </Box>
  );
};

export default SocialView;
