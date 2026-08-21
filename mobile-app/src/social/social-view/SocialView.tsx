import { useState } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import HeaderGameImage from '@gamelog/common/HeaderGameImage';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import { useGetFriendList, useSearchUsers } from '@gamelog/api-manager/useApi';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import { SocialHubBanner } from './SocialHubBanner';
import SocialSectionTabs from './SocialSectionTabs';
import { RecommendationsModal } from './RecommendationsModal';
import { useFriendActions } from './useFriendActions';
import { selectPendingRequests, selectAcceptedFriends } from './friendListSelectors';

const BANNER_APPID = '730';

const SocialView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<UserSearchResult | null>(null);

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

  return (
    <Box className="flex-1 relative bg-background-0">
      <HeaderGameImage appid={BANNER_APPID} />
      <ScrollablePage>
        <SocialHubBanner />

        <Box className="flex-1 bg-background-0 pt-6">
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
              onSelectRecommendations: setSelectedFriend,
            }}
          />
        </Box>
      </ScrollablePage>

      <RecommendationsModal friendItem={selectedFriend} onClose={() => setSelectedFriend(null)} />
    </Box>
  );
};

export default SocialView;
