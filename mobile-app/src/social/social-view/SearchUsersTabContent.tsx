import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { LoadingBox, ErrorBox, InfoBox } from '@gamelog/common/feedbacks';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import { UserCard } from '../user-card/UserCard';
import { UserCardActionHandlers } from '../user-card/UserCardStatusSection';
import { UserSearchInput } from './UserSearchInput';

interface SearchUsersTabContentProps {
  query: string;
  onQueryChange: (query: string) => void;
  results: UserSearchResult[];
  isLoading: boolean;
  error: boolean;
  errorMessage?: string;
  handlers: UserCardActionHandlers;
  isActionLoading?: boolean;
}

export const SearchUsersTabContent: React.FC<SearchUsersTabContentProps> = ({
  query,
  onQueryChange,
  results,
  isLoading,
  error,
  errorMessage,
  handlers,
  isActionLoading,
}) => {
  const renderResults = () => {
    if (!query.trim()) {
      return (
        <InfoBox
          message="Type a username in the search bar above to find other gamers."
          className="py-6"
        />
      );
    }
    if (isLoading) {
      return <LoadingBox message="Searching users..." className="py-10" />;
    }
    if (error) {
      return <ErrorBox errorMessage={errorMessage || 'Error searching users.'} className="py-6" />;
    }
    if (results.length === 0) {
      return <InfoBox message={`No users found matching "${query}".`} className="py-6" />;
    }
    return (
      <VStack className="mb-4">
        <Text size="sm" className="font-bold uppercase text-typography-400 mb-2">
          Search Results ({results.length})
        </Text>
        {results.map((item) => (
          <UserCard
            key={item.user.id}
            item={item}
            onAddFriend={handlers.onAddFriend}
            onAcceptFriend={handlers.onAcceptFriend}
            onRefuseFriend={handlers.onRefuseFriend}
            onSelectRecommendations={handlers.onSelectRecommendations}
            isActionLoading={isActionLoading}
          />
        ))}
      </VStack>
    );
  };

  return (
    <VStack className="mb-4 px-4">
      <UserSearchInput value={query} onChangeText={onQueryChange} />
      {renderResults()}
    </VStack>
  );
};
