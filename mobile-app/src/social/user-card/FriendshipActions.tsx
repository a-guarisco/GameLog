import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import Ionicons from '@react-native-vector-icons/ionicons';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';
import { UserCardMenu, UserCardMenuItem } from './UserCardMenu';
import { ActionConfirmModal } from '@gamelog/common/ActionConfirmModal';
import { HEX_COLORS } from '@gamelog/theme/hexColors';


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
      icon: 'ban',
      isDestructive: true,
      testID: `block-menu-item-${userId}`,
      onPress: () => setShowBlockModal(true),
    });
  }

  return (
    <>
      <HStack space="xs" className="items-center">
        <Pressable
          onPress={() => onAddFriend(userId)}
          disabled={isDisabled}
          testID={`add-friend-btn-${userId}`}
          hitSlop={6}
          className="flex-row items-center justify-center gap-1.5 rounded-lg border border-primary-500/60 bg-transparent px-3 py-1.5 active:opacity-70"
        >
          <Ionicons name="person-add-outline" size={13} color={toHex(brand.primary['400'])} />
          <Text size="xs" className="font-semibold text-primary-400">
            Add Friend
          </Text>
        </Pressable>

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
      icon: 'lock-open-outline',
      testID: `unblock-btn-${userId}`,
      onPress: () => setShowUnblockModal(true),
    },
  ];

  if (onAddFriend) {
    menuItems.push({
      label: 'Add Friend',
      icon: 'person-add-outline',
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
      icon: 'close-circle-outline',
      isDestructive: true,
      testID: `remove-pending-btn-${userId}`,
      onPress: () => setShowRemoveModal(true),
    });
  }

  if (onBlock) {
    menuItems.push({
      label: 'Block',
      icon: 'ban',
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
      icon: 'ban',
      isDestructive: true,
      testID: `block-btn-${userId}`,
      onPress: () => setShowBlockModal(true),
    });
  }

  return (
    <>
      <HStack space="xs" className="items-center">
        <Pressable
          onPress={() => onAccept(friendshipId)}
          disabled={isDisabled}
          testID={`accept-btn-${userId}`}
          hitSlop={6}
          className="flex-row items-center justify-center gap-1 rounded-lg border border-primary-500/60 bg-primary-500/15 px-3 py-1.5 active:opacity-70"
        >
          <Ionicons name="checkmark" size={13} color={toHex(brand.primary['400'])} />
          <Text size="xs" className="font-semibold text-primary-400">
            Accept
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onRefuse(friendshipId)}
          disabled={isDisabled}
          testID={`refuse-btn-${userId}`}
          hitSlop={6}
          className="flex-row items-center justify-center gap-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 active:opacity-70"
        >
          <Ionicons name="close" size={13} color={HEX_COLORS.muted.icon.hex} />
          <Text size="xs" className="font-semibold text-typography-300">
            Refuse
          </Text>
        </Pressable>

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
      icon: 'game-controller-outline',
      testID: `recommend-btn-${userId}`,
      onPress: () => onSelectRecommendations(item),
    });
  }

  menuItems.push({
    label: 'Remove Friend',
    icon: 'person-remove-outline',
    isDestructive: true,
    testID: `remove-friend-btn-${userId}`,
    onPress: () => setShowRemoveModal(true),
  });

  if (onBlock) {
    menuItems.push({
      label: 'Block',
      icon: 'ban',
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
