import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { LoadingBox, ErrorBox, InfoBox } from '@gamelog/common/feedbacks';
import { UserSearchResult } from '@gamelog/api-manager/dto';
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
    <VStack className="mb-4 px-4">
      {pendingRequests.length > 0 && (
        <Box className="mb-5">
          <Text size="sm" className="font-bold uppercase text-warning-700 mb-2">
            Pending Friend Requests ({pendingRequests.length})
          </Text>
          {pendingRequests.map((item) => (
            <UserCard
              key={item.user.id}
              item={item}
              onAcceptFriend={handlers.onAcceptFriend}
              onRefuseFriend={handlers.onRefuseFriend}
              isActionLoading={isActionLoading}
            />
          ))}
        </Box>
      )}

      <Box className="mb-5">
        <Text size="sm" className="font-bold uppercase text-typography-400 mb-2">
          Friends ({acceptedFriends.length})
        </Text>
        {acceptedFriends.length === 0 ? (
          <InfoBox
            message="You don't have any friends added yet. Use the 'Find Users' tab to search and add friends!"
            className="py-6"
          />
        ) : (
          acceptedFriends.map((item) => (
            <UserCard
              key={item.user.id}
              item={item}
              onSelectRecommendations={handlers.onSelectRecommendations}
              isActionLoading={isActionLoading}
            />
          ))
        )}
      </Box>
    </VStack>
  );
};
