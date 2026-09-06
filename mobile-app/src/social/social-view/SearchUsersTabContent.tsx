import React from 'react';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Box } from '@gamelog/common/gluestack/box';
import { LoadingBox, ErrorBox, InfoBox } from '@gamelog/common/feedbacks';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import { CardTitleText } from '@gamelog/common/typography/CardTypography';
import { UserCard } from '../user-card/UserCard';
import { UserCardActionHandlers } from '../user-card/userCardActionHandlers';
import { UserSearchInput } from './UserSearchInput';

export interface SearchUsersTabContentProps {
  query: string;
  onQueryChange: (query: string) => void;
  results: UserSearchResult[];
  avatarMap?: Record<string, string>;
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
  avatarMap,
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
      <VStack space="sm">
        <CardTitleText>{`Search Results (${results.length})`}</CardTitleText>
        <VStack space="sm">
          {results.map((item) => (
            <UserCard
              key={item.user.id}
              item={item}
              avatarUrl={avatarMap?.[item.user.steam_id]}
              {...handlers}
              isActionLoading={isActionLoading}
            />
          ))}
        </VStack>
      </VStack>
    );
  };

  return (
    <VStack space="md" className="px-4">
      <Box>
        <UserSearchInput value={query} onChangeText={onQueryChange} />
      </Box>
      {renderResults()}
    </VStack>
  );
};

export default SearchUsersTabContent;
