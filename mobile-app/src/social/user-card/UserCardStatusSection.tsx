import { HStack } from '@gamelog/common/gluestack/hstack';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import { FRIENDSHIP_BADGES } from './friendshipStatus';
import { FriendshipStatusBadge } from './FriendshipStatusBadge';
import { AddFriendAction, IncomingRequestActions, RecommendAction } from './FriendshipActions';

export interface UserCardActionHandlers {
  onAddFriend?: (userId: string) => void;
  onAcceptFriend?: (friendshipId: string) => void;
  onRefuseFriend?: (friendshipId: string) => void;
  onSelectRecommendations?: (item: UserSearchResult) => void;
}

interface UserCardStatusSectionProps {
  item: UserSearchResult;
  handlers: UserCardActionHandlers;
  isActionLoading?: boolean;
}

export const UserCardStatusSection: React.FC<UserCardStatusSectionProps> = ({
  item,
  handlers,
  isActionLoading,
}) => {
  const { user, friendship } = item;
  const status = friendship?.friendship_status;
  const friendshipId = friendship?.friendship_id;

  if (status === 'accepted') {
    const badgeConfig = FRIENDSHIP_BADGES.accepted;
    return (
      <HStack space="sm" className="items-center">
        {badgeConfig && <FriendshipStatusBadge config={badgeConfig} />}
        {handlers.onSelectRecommendations && (
          <RecommendAction
            item={item}
            onSelectRecommendations={handlers.onSelectRecommendations}
            isDisabled={isActionLoading}
          />
        )}
      </HStack>
    );
  }

  if (
    status === 'pending_incoming' &&
    friendshipId &&
    handlers.onAcceptFriend &&
    handlers.onRefuseFriend
  ) {
    return (
      <IncomingRequestActions
        userId={user.id}
        friendshipId={friendshipId}
        onAccept={handlers.onAcceptFriend}
        onRefuse={handlers.onRefuseFriend}
        isDisabled={isActionLoading}
      />
    );
  }

  const badgeConfig = status ? FRIENDSHIP_BADGES[status] : undefined;
  if (badgeConfig) {
    return <FriendshipStatusBadge config={badgeConfig} />;
  }

  if (handlers.onAddFriend) {
    return (
      <AddFriendAction
        userId={user.id}
        onAddFriend={handlers.onAddFriend}
        isDisabled={isActionLoading}
      />
    );
  }

  return null;
};
