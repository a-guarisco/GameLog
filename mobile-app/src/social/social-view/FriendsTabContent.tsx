import React from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { LoadingBox, ErrorBox, InfoBox } from '@gamelog/common/feedbacks';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import { CardTitleText } from '@gamelog/common/typography/CardTypography';
import { UserCard } from '../user-card/UserCard';
import { UserCardActionHandlers } from '../user-card/userCardActionHandlers';

interface FriendsTabContentProps {
  isLoading: boolean;
  error: boolean;
  errorMessage?: string;
  pendingRequests: UserSearchResult[];
  acceptedFriends: UserSearchResult[];
  handlers: UserCardActionHandlers;
  isActionLoading?: boolean;
}

export const FriendsTabContent: React.FC<FriendsTabContentProps> = ({
  isLoading,
  error,
  errorMessage,
  pendingRequests,
  acceptedFriends,
  handlers,
  isActionLoading,
}) => {
  if (isLoading) {
    return <LoadingBox message="Loading friends..." className="py-10" />;
  }

  if (error) {
    return (
      <ErrorBox errorMessage={errorMessage || 'Failed to load friend list.'} className="py-6" />
    );
  }

  return (
    <VStack space="xl" className="px-4">
      {pendingRequests.length > 0 && (
        <VStack space="sm">
          <CardTitleText>{`Pending Friend Requests (${pendingRequests.length})`}</CardTitleText>
          <VStack space="sm">
            {pendingRequests.map((item) => (
              <UserCard
                key={item.user.id}
                item={item}
                {...handlers}
                isActionLoading={isActionLoading}
              />
            ))}
          </VStack>
        </VStack>
      )}

      <VStack space="sm">
        <CardTitleText>{`Friends (${acceptedFriends.length})`}</CardTitleText>
        {acceptedFriends.length === 0 ? (
          <Box className="py-2">
            <InfoBox
              message="You don't have any friends added yet. Use the 'Find Users' tab to search and add friends!"
              className="py-4"
            />
          </Box>
        ) : (
          <VStack space="sm">
            {acceptedFriends.map((item) => (
              <UserCard
                key={item.user.id}
                item={item}
                {...handlers}
                isActionLoading={isActionLoading}
              />
            ))}
          </VStack>
        )}
      </VStack>
    </VStack>
  );
};

export default FriendsTabContent;
