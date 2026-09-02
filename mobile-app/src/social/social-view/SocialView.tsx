import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import { useGetFriendList, useSearchUsers } from '@gamelog/api-manager/useApi';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import SocialIdentity from './SocialIdentity';
import SocialStats from './SocialStats';
import RecommenderSummaryCard from './RecommenderSummaryCard';
import SocialSectionTabs from './SocialSectionTabs';
import { useFriendActions } from './useFriendActions';
import { selectPendingRequests, selectAcceptedFriends } from './friendListSelectors';

export const SocialView: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState('');

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
  } = useFriendActions({
    onFriendListChanged: refetchFriendList,
    onSearchResultsChanged: refetchSearch,
  });

  const pendingRequests = selectPendingRequests(friendList);
  const acceptedFriends = selectAcceptedFriends(friendList);

  const handleOpenRecommendations = (friendItem?: UserSearchResult) => {
    navigation.navigate('FriendRecommendations', {
      friendItem,
    });
  };

  return (
    <Box className="flex-1 relative bg-background-0">
      <ScrollablePage hasBanner={false}>
        <SocialIdentity />

        <Box className="bg-background-0 pb-6">
          <VStack space="xl" className="pt-4">
            <Box className="px-4">
              <SocialStats
                acceptedCount={acceptedFriends.length}
                pendingCount={pendingRequests.length}
              />
            </Box>

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
              isActionLoading={isActionLoading}
              actionFeedback={actionFeedback}
              handlers={{
                onAddFriend: handleAddFriend,
                onAcceptFriend: handleAcceptFriend,
                onRefuseFriend: handleRefuseFriend,
                onSelectRecommendations: handleOpenRecommendations,
              }}
            />
          </VStack>
        </Box>
      </ScrollablePage>
    </Box>
  );
};

export default SocialView;
