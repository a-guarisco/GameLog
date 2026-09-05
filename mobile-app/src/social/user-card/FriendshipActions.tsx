import React, { useState } from 'react';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import { UserCardMenu, UserCardMenuItem } from './UserCardMenu';
import { ActionConfirmModal } from '@gamelog/common/ActionConfirmModal';
import { SocialActionButton } from '@gamelog/common/button';

interface AddFriendActionProps {
  userId: string;
  username?: string;
  onAddFriend: (userId: string) => void;
  onBlock?: (userId: string) => void;
  isDisabled?: boolean;
}

export const AddFriendAction: React.FC<AddFriendActionProps> = ({
  userId,
  username,
  onAddFriend,
  onBlock,
  isDisabled,
}) => {
  const [showBlockModal, setShowBlockModal] = useState(false);

  const menuItems: UserCardMenuItem[] = [];
  if (onBlock) {
    menuItems.push({
      label: 'Block User',
      icon: 'hand-right',
      isDestructive: true,
      testID: `block-menu-item-${userId}`,
      onPress: () => setShowBlockModal(true),
    });
  }

  return (
    <>
      <HStack space="xs" className="items-center">
        <SocialActionButton
          actionType="add"
          onPress={() => onAddFriend(userId)}
          isDisabled={isDisabled}
          testID={`add-friend-btn-${userId}`}
        />

        {menuItems.length > 0 && (
          <UserCardMenu
            items={menuItems}
            isDisabled={isDisabled}
            testID={`user-card-menu-btn-${userId}`}
          />
        )}
      </HStack>

      <ActionConfirmModal
        isVisible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={() => onBlock?.(userId)}
        title="Block User"
        message={
          username
            ? `Are you sure you want to block ${username}?`
            : 'Are you sure you want to block this user?'
        }
        confirmLabel="Block"
        confirmVariant="destructive"
        testIDPrefix={`block-friend-${userId}`}
      />
    </>
  );
};

interface BlockedUserActionsProps {
  userId: string;
  username?: string;
  friendshipId: string;
  friendshipRequesterId?: string | null;
  currentUserId?: string;
  onUnblock: (friendshipId: string) => void;
  onAddFriend?: (userId: string) => void;
  isDisabled?: boolean;
}

export const BlockedUserActions: React.FC<BlockedUserActionsProps> = ({
  userId,
  username,
  friendshipId,
  friendshipRequesterId,
  currentUserId,
  onUnblock,
  onAddFriend,
  isDisabled,
}) => {
  const [showUnblockModal, setShowUnblockModal] = useState(false);

  // If currentUserId and friendshipRequesterId are available, only show if current user is requester
  const isBlockedByCurrentUser =
    !currentUserId || !friendshipRequesterId || currentUserId === friendshipRequesterId;

  if (!isBlockedByCurrentUser) {
    return null;
  }

  const menuItems: UserCardMenuItem[] = [
    {
      label: 'Unblock',
      icon: 'lock-open',
      testID: `unblock-btn-${userId}`,
      onPress: () => setShowUnblockModal(true),
    },
  ];

  if (onAddFriend) {
    menuItems.push({
      label: 'Add Friend',
      icon: 'person-add',
      testID: `add-friend-btn-${userId}`,
      onPress: () => onAddFriend(userId),
    });
  }

  return (
    <>
      <HStack space="xs" className="items-center">
        <UserCardMenu
          items={menuItems}
          isDisabled={isDisabled}
          testID={`user-card-menu-btn-${userId}`}
        />
      </HStack>

      <ActionConfirmModal
        isVisible={showUnblockModal}
        onClose={() => setShowUnblockModal(false)}
        onConfirm={() => onUnblock(friendshipId)}
        title="Unblock User"
        message={
          username
            ? `Are you sure you want to unblock ${username}?`
            : 'Are you sure you want to unblock this user?'
        }
        confirmLabel="Unblock"
        confirmVariant="primary"
        testIDPrefix={`unblock-friend-${userId}`}
      />
    </>
  );
};

interface PendingOutgoingActionProps {
  userId: string;
  username?: string;
  friendshipId: string;
  onRemovePending?: (friendshipId: string) => void;
  onBlock?: (friendshipId: string) => void;
  isDisabled?: boolean;
}

export const PendingOutgoingAction: React.FC<PendingOutgoingActionProps> = ({
  userId,
  username,
  friendshipId,
  onRemovePending,
  onBlock,
  isDisabled,
}) => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const menuItems: UserCardMenuItem[] = [];

  if (onRemovePending) {
    menuItems.push({
      label: 'Remove Pending',
      icon: 'close-circle',
      isDestructive: true,
      testID: `remove-pending-btn-${userId}`,
      onPress: () => setShowRemoveModal(true),
    });
  }

  if (onBlock) {
    menuItems.push({
      label: 'Block',
      icon: 'hand-right',
      isDestructive: true,
      testID: `block-btn-${userId}`,
      onPress: () => setShowBlockModal(true),
    });
  }

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <>
      <HStack space="xs" className="items-center">
        <UserCardMenu
          items={menuItems}
          isDisabled={isDisabled}
          testID={`user-card-menu-btn-${userId}`}
        />
      </HStack>

      <ActionConfirmModal
        isVisible={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={() => onRemovePending?.(friendshipId)}
        title="Cancel Friend Request"
        message={
          username
            ? `Are you sure you want to cancel the friend request sent to ${username}?`
            : 'Are you sure you want to cancel this friend request?'
        }
        confirmLabel="Remove"
        confirmVariant="destructive"
        testIDPrefix={`remove-pending-${userId}`}
      />

      <ActionConfirmModal
        isVisible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={() => onBlock?.(friendshipId)}
        title="Block User"
        message={
          username
            ? `Are you sure you want to block ${username}?`
            : 'Are you sure you want to block this user?'
        }
        confirmLabel="Block"
        confirmVariant="destructive"
        testIDPrefix={`block-friend-${userId}`}
      />
    </>
  );
};

interface IncomingRequestActionsProps {
  userId: string;
  username?: string;
  friendshipId: string;
  onAccept: (friendshipId: string) => void;
  onRefuse: (friendshipId: string) => void;
  onBlock?: (friendshipId: string) => void;
  isDisabled?: boolean;
}

export const IncomingRequestActions: React.FC<IncomingRequestActionsProps> = ({
  userId,
  username,
  friendshipId,
  onAccept,
  onRefuse,
  onBlock,
  isDisabled,
}) => {
  const [showBlockModal, setShowBlockModal] = useState(false);

  const menuItems: UserCardMenuItem[] = [];
  if (onBlock) {
    menuItems.push({
      label: 'Block',
      icon: 'hand-right',
      isDestructive: true,
      testID: `block-btn-${userId}`,
      onPress: () => setShowBlockModal(true),
    });
  }

  return (
    <>
      <HStack space="xs" className="items-center">
        <SocialActionButton
          actionType="accept"
          onPress={() => onAccept(friendshipId)}
          isDisabled={isDisabled}
          testID={`accept-btn-${userId}`}
        />

        <SocialActionButton
          actionType="refuse"
          onPress={() => onRefuse(friendshipId)}
          isDisabled={isDisabled}
          testID={`refuse-btn-${userId}`}
        />

        {menuItems.length > 0 && (
          <UserCardMenu
            items={menuItems}
            isDisabled={isDisabled}
            testID={`user-card-menu-btn-${userId}`}
          />
        )}
      </HStack>

      <ActionConfirmModal
        isVisible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={() => onBlock?.(friendshipId)}
        title="Block User"
        message={
          username
            ? `Are you sure you want to block ${username}?`
            : 'Are you sure you want to block this user?'
        }
        confirmLabel="Block"
        confirmVariant="destructive"
        testIDPrefix={`block-friend-${userId}`}
      />
    </>
  );
};

interface AcceptedFriendActionsProps {
  userId: string;
  username?: string;
  friendshipId: string;
  item?: UserSearchResult;
  onRemoveFriend: (friendshipId: string) => void;
  onBlock?: (friendshipId: string) => void;
  onSelectRecommendations?: (item: UserSearchResult) => void;
  isDisabled?: boolean;
}

export const AcceptedFriendActions: React.FC<AcceptedFriendActionsProps> = ({
  userId,
  username,
  friendshipId,
  item,
  onRemoveFriend,
  onBlock,
  onSelectRecommendations,
  isDisabled,
}) => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const menuItems: UserCardMenuItem[] = [];

  if (item && onSelectRecommendations) {
    menuItems.push({
      label: 'Recommend Games',
      icon: 'game-controller',
      testID: `recommend-btn-${userId}`,
      onPress: () => onSelectRecommendations(item),
    });
  }

  menuItems.push({
    label: 'Remove Friend',
    icon: 'person-remove',
    isDestructive: true,
    testID: `remove-friend-btn-${userId}`,
    onPress: () => setShowRemoveModal(true),
  });

  if (onBlock) {
    menuItems.push({
      label: 'Block',
      icon: 'hand-right',
      isDestructive: true,
      testID: `block-friend-btn-${userId}`,
      onPress: () => setShowBlockModal(true),
    });
  }

  return (
    <>
      <HStack space="xs" className="items-center">
        <UserCardMenu
          items={menuItems}
          isDisabled={isDisabled}
          testID={`user-card-menu-btn-${userId}`}
        />
      </HStack>

      <ActionConfirmModal
        isVisible={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={() => onRemoveFriend(friendshipId)}
        title="Remove Friend"
        message={
          username
            ? `Are you sure you want to remove ${username} from your friends?`
            : 'Are you sure you want to remove this friend?'
        }
        confirmLabel="Remove"
        confirmVariant="destructive"
        testIDPrefix={`remove-friend-${userId}`}
      />

      <ActionConfirmModal
        isVisible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={() => onBlock?.(friendshipId)}
        title="Block User"
        message={
          username
            ? `Are you sure you want to block ${username}?`
            : 'Are you sure you want to block this user?'
        }
        confirmLabel="Block"
        confirmVariant="destructive"
        testIDPrefix={`block-friend-${userId}`}
      />
    </>
  );
};
