import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { LoadingBox, ErrorBox, InfoBox } from '@gamelog/common/feedbacks';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import SectionCard from '@gamelog/common/SectionCard';
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
    <VStack space="lg" className="px-4">
      {pendingRequests.length > 0 && (
        <SectionCard label={`Pending Friend Requests (${pendingRequests.length})`}>
          <VStack space="sm" className="pt-1">
            {pendingRequests.map((item) => (
              <UserCard
                key={item.user.id}
                item={item}
                onAcceptFriend={handlers.onAcceptFriend}
                onRefuseFriend={handlers.onRefuseFriend}
                isActionLoading={isActionLoading}
              />
            ))}
          </VStack>
        </SectionCard>
      )}

      <SectionCard label={`Friends (${acceptedFriends.length})`}>
        {acceptedFriends.length === 0 ? (
          <Box className="py-2">
            <InfoBox
              message="You don't have any friends added yet. Use the 'Find Users' tab to search and add friends!"
              className="py-4"
            />
          </Box>
        ) : (
          <VStack space="sm" className="pt-1">
            {acceptedFriends.map((item) => (
              <UserCard
                key={item.user.id}
                item={item}
                onSelectRecommendations={handlers.onSelectRecommendations}
                isActionLoading={isActionLoading}
              />
            ))}
          </VStack>
        )}
      </SectionCard>
    </VStack>
  );
};

export default FriendsTabContent;
