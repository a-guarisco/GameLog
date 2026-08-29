import { UserSearchResult } from '@gamelog/api-manager/dto';
import { UserCardActionHandlers } from './userCardActionHandlers';
import { AddFriendAction, IncomingRequestActions } from './FriendshipActions';

interface UserCardActionsProps {
  item: UserSearchResult;
  handlers: UserCardActionHandlers;
  isActionLoading?: boolean;
}

export const UserCardActions: React.FC<UserCardActionsProps> = ({
  item,
  handlers,
  isActionLoading,
}) => {
  const { user, friendship } = item;
  const status = friendship?.friendship_status;
  const friendshipId = friendship?.friendship_id;

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

  if (!status && handlers.onAddFriend) {
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

export default UserCardActions;
