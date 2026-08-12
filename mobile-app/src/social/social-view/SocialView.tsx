import { useState } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import HeaderGameImage from '@gamelog/game/HeaderGameImage';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import { useGetFriendList, useSearchUsers } from '@gamelog/api-manager/useApi';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import { SocialHubBanner } from './SocialHubBanner';
import { SocialTabSwitcher, SocialTab } from './SocialTabSwitcher';
import { ActionFeedbackBanner } from './ActionFeedbackBanner';
import { FriendsTabContent } from './FriendsTabContent';
import { SearchUsersTabContent } from './SearchUsersTabContent';
import { RecommendationsModal } from './RecommendationsModal';
import { useFriendActions } from './useFriendActions';
import { selectPendingRequests, selectAcceptedFriends } from './friendListSelectors';

const BANNER_APPID = '730';

const SocialView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'search'>('friends');
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

  const tabs: SocialTab[] = [
    {
      id: 'friends',
      label: `Friends (${acceptedFriends.length + pendingRequests.length})`,
      testID: 'friends-tab-btn',
    },
    { id: 'search', label: 'Find Users', testID: 'search-tab-btn' },
  ];

  return (
    <Box className="flex-1 relative bg-background-0">
      <HeaderGameImage appid={BANNER_APPID} />
      <ScrollablePage>
        <SocialHubBanner />

        <Box className="w-80% bg-background-100 shadow-xl pt-6">
          <Box className="mb-5 px-4">
            <SocialTabSwitcher
              tabs={tabs}
              activeTabId={activeTab}
              onSelectTab={(id) => setActiveTab(id as 'friends' | 'search')}
            />
            <ActionFeedbackBanner message={actionFeedback} />
          </Box>

          {activeTab === 'friends' && (
            <FriendsTabContent
              isLoading={isLoadingFriendList}
              error={!!errorFriendList}
              errorMessage={errorMessageFriendList}
              pendingRequests={pendingRequests}
              acceptedFriends={acceptedFriends}
              handlers={{
                onAcceptFriend: handleAcceptFriend,
                onRefuseFriend: handleRefuseFriend,
                onSelectRecommendations: setSelectedFriend,
              }}
              isActionLoading={isActionLoading}
            />
          )}

          {activeTab === 'search' && (
            <SearchUsersTabContent
              query={searchQuery}
              onQueryChange={setSearchQuery}
              results={searchResults}
              isLoading={isLoadingSearch}
              error={!!errorSearch}
              errorMessage={errorMessageSearch}
              handlers={{
                onAddFriend: handleAddFriend,
                onAcceptFriend: handleAcceptFriend,
                onRefuseFriend: handleRefuseFriend,
                onSelectRecommendations: setSelectedFriend,
              }}
              isActionLoading={isActionLoading}
            />
          )}
        </Box>
      </ScrollablePage>

      <RecommendationsModal friendItem={selectedFriend} onClose={() => setSelectedFriend(null)} />
    </Box>
  );
};

export default SocialView;
