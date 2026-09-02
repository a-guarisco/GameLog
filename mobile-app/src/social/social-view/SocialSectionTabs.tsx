import { useState, FC } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import SectionTabs, { SectionTab } from '@gamelog/common/SectionTabs';
import { ActionFeedbackBanner } from './ActionFeedbackBanner';
import { FriendsTabContent } from './FriendsTabContent';
import { SearchUsersTabContent } from './SearchUsersTabContent';
import { UserSearchResult } from '@gamelog/api-manager/dto';

interface SocialSectionTabsProps {
  // Friends Tab Props
  isLoadingFriendList: boolean;
  errorFriendList: boolean;
  errorMessageFriendList?: string | null;
  pendingRequests: UserSearchResult[];
  acceptedFriends: UserSearchResult[];

  // Search Tab Props
  searchQuery: string;
  onQueryChange: (query: string) => void;
  searchResults: UserSearchResult[];
  isLoadingSearch: boolean;
  errorSearch: boolean;
  errorMessageSearch?: string | null;

  // Shared Action Props
  isActionLoading: boolean;
  actionFeedback: string | null;
  handlers: {
    onAddFriend: (userId: string) => void;
    onAcceptFriend: (userId: string) => void;
    onRefuseFriend: (userId: string) => void;
    onSelectRecommendations: (item: UserSearchResult) => void;
  };
}

const SocialSectionTabs: FC<SocialSectionTabsProps> = ({
  isLoadingFriendList,
  errorFriendList,
  errorMessageFriendList,
  pendingRequests,
  acceptedFriends,
  searchQuery,
  onQueryChange,
  searchResults,
  isLoadingSearch,
  errorSearch,
  errorMessageSearch,
  isActionLoading,
  actionFeedback,
  handlers,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'search'>('friends');

  const tabs: SectionTab<'friends' | 'search'>[] = [
    {
      id: 'friends',
      label: `Friends (${acceptedFriends.length + pendingRequests.length})`,
    },
    { id: 'search', label: 'Find Users' },
  ];

  return (
    <>
      <Box className="mb-0">
        <Box className="px-4">
          <SectionTabs
            tabs={tabs}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as 'friends' | 'search')}
            testIDPrefix="social-tab"
          />
        </Box>
        <Box className="px-4">
          <ActionFeedbackBanner message={actionFeedback} />
        </Box>
      </Box>

      {activeTab === 'friends' && (
        <FriendsTabContent
          isLoading={isLoadingFriendList}
          error={errorFriendList}
          errorMessage={errorMessageFriendList || undefined}
          pendingRequests={pendingRequests}
          acceptedFriends={acceptedFriends}
          handlers={{
            onAcceptFriend: handlers.onAcceptFriend,
            onRefuseFriend: handlers.onRefuseFriend,
            onSelectRecommendations: handlers.onSelectRecommendations,
          }}
          isActionLoading={isActionLoading}
        />
      )}

      {activeTab === 'search' && (
        <SearchUsersTabContent
          query={searchQuery}
          onQueryChange={onQueryChange}
          results={searchResults}
          isLoading={isLoadingSearch}
          error={errorSearch}
          errorMessage={errorMessageSearch || undefined}
          handlers={handlers}
          isActionLoading={isActionLoading}
        />
      )}
    </>
  );
};

export default SocialSectionTabs;
