import React from 'react';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import { UserCardActionHandlers } from './userCardActionHandlers';
import {
  AddFriendAction,
  IncomingRequestActions,
  AcceptedFriendActions,
  BlockedUserActions,
  PendingOutgoingAction,
} from './FriendshipActions';

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
        username={user.username}
        friendshipId={friendshipId}
        onAccept={handlers.onAcceptFriend}
        onRefuse={handlers.onRefuseFriend}
        onBlock={handlers.onBlockFriend}
        isDisabled={isActionLoading}
      />
    );
  }

  if (status === 'accepted' && friendshipId && handlers.onRemoveFriend) {
    return (
      <AcceptedFriendActions
        userId={user.id}
        username={user.username}
        friendshipId={friendshipId}
        item={item}
        onRemoveFriend={handlers.onRemoveFriend}
        onBlock={handlers.onBlockFriend}
        onSelectRecommendations={handlers.onSelectRecommendations}
        isDisabled={isActionLoading}
      />
    );
  }

  if (status === 'blocked' && friendshipId && handlers.onUnblockFriend) {
    return (
      <BlockedUserActions
        userId={user.id}
        username={user.username}
        friendshipId={friendshipId}
        friendshipRequesterId={friendship?.friendship_requester_id}
        currentUserId={handlers.currentUserId}
        onUnblock={handlers.onUnblockFriend}
        onAddFriend={handlers.onAddFriend}
        isDisabled={isActionLoading}
      />
    );
  }

  if (status === 'pending_outgoing' && friendshipId) {
    return (
      <PendingOutgoingAction
        userId={user.id}
        username={user.username}
        friendshipId={friendshipId}
        onRemovePending={handlers.onRemovePending || handlers.onRemoveFriend}
        onBlock={handlers.onBlockFriend}
        isDisabled={isActionLoading}
      />
    );
  }

  if (!status && handlers.onAddFriend) {
    return (
      <AddFriendAction
        userId={user.id}
        username={user.username}
        onAddFriend={handlers.onAddFriend}
        onBlock={handlers.onBlockFriend}
        isDisabled={isActionLoading}
      />
    );
  }

  return null;
};

export default UserCardActions;
