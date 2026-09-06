import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Avatar, AvatarFallbackText, AvatarImage } from '@gamelog/common/gluestack/avatar';
import { Box } from '@gamelog/common/gluestack/box';
import Chip from '@gamelog/common/Chip';
import { PageTitle } from '@gamelog/common/typography/CommonTypography';
import { selectMemberSinceLabel } from '@gamelog/profile/selectProfile';
import Ionicons from '@react-native-vector-icons/ionicons';
import { HEX_COLORS } from '@gamelog/theme/hexColors';
import { ActionConfirmModal } from '@gamelog/common/ActionConfirmModal';
import { UserCardMenu, UserCardMenuItem } from '../user-card/UserCardMenu';
import { FriendshipStatusBadge } from '../user-card/FriendshipStatusBadge';
import type { UserSearchResult, UserRead, FriendshipInfo, Player } from '@gamelog/api-manager/dto';
import type { UserCardActionHandlers } from '../user-card/userCardActionHandlers';

interface OtherUserIdentityProps extends UserCardActionHandlers {
  user: UserRead;
  player?: Player;
  friendship?: FriendshipInfo | null;
  isActionLoading?: boolean;
}

export const hasOtherUserActionButtons = (
  friendship?: FriendshipInfo | null,
  handlers?: { onAcceptFriend?: unknown; onRefuseFriend?: unknown }
): boolean => {
  return (
    friendship?.friendship_status === 'pending_incoming' &&
    !!friendship?.friendship_id &&
    (!!handlers?.onAcceptFriend || !!handlers?.onRefuseFriend)
  );
};

export const OtherUserIdentity: React.FC<OtherUserIdentityProps> = ({
  user,
  player,
  friendship,
  isActionLoading,
  ...handlers
}) => {
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showRemoveFriendModal, setShowRemoveFriendModal] = useState(false);
  const [showRemovePendingModal, setShowRemovePendingModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);

  const status = friendship?.friendship_status;
  const friendshipId = friendship?.friendship_id;
  const isPending = status === 'pending_incoming';

  const displayName = player?.personaname || user.username;
  const memberSinceLabel = selectMemberSinceLabel(player?.timecreated);

  const searchResultItem: UserSearchResult = {
    user,
    friendship: friendship ?? {},
  };

  const menuItems: UserCardMenuItem[] = [];

  if (status === 'accepted') {
    if (handlers.onSelectRecommendations) {
      menuItems.push({
        label: 'Recommend Games',
        icon: 'game-controller',
        testID: `recommend-btn-${user.id}`,
        onPress: () => handlers.onSelectRecommendations?.(searchResultItem),
      });
    }
    if (handlers.onRemoveFriend && friendshipId) {
      menuItems.push({
        label: 'Remove Friend',
        icon: 'person-remove',
        isDestructive: true,
        testID: `remove-friend-btn-${user.id}`,
        onPress: () => setShowRemoveFriendModal(true),
      });
    }
    if (handlers.onBlockFriend) {
      menuItems.push({
        label: 'Block',
        icon: 'hand-right',
        isDestructive: true,
        testID: `block-friend-btn-${user.id}`,
        onPress: () => setShowBlockModal(true),
      });
    }
  } else if (status === 'pending_incoming') {
    if (handlers.onBlockFriend) {
      menuItems.push({
        label: 'Block',
        icon: 'hand-right',
        isDestructive: true,
        testID: `block-btn-${user.id}`,
        onPress: () => setShowBlockModal(true),
      });
    }
  } else if (status === 'pending_outgoing') {
    if ((handlers.onRemovePending || handlers.onRemoveFriend) && friendshipId) {
      menuItems.push({
        label: 'Remove Pending',
        icon: 'close-circle',
        isDestructive: true,
        testID: `remove-pending-btn-${user.id}`,
        onPress: () => setShowRemovePendingModal(true),
      });
    }
    if (handlers.onBlockFriend) {
      menuItems.push({
        label: 'Block',
        icon: 'hand-right',
        isDestructive: true,
        testID: `block-btn-${user.id}`,
        onPress: () => setShowBlockModal(true),
      });
    }
  } else if (status === 'blocked') {
    if (handlers.onUnblockFriend && friendshipId) {
      menuItems.push({
        label: 'Unblock',
        icon: 'lock-open',
        testID: `unblock-btn-${user.id}`,
        onPress: () => setShowUnblockModal(true),
      });
    }
    if (handlers.onAddFriend) {
      menuItems.push({
        label: 'Add Friend',
        icon: 'person-add',
        testID: `add-friend-btn-${user.id}`,
        onPress: () => handlers.onAddFriend?.(user.id),
      });
    }
  } else {
    // None / Player
    if (handlers.onAddFriend) {
      menuItems.push({
        label: 'Add Friend',
        icon: 'person-add',
        testID: `add-friend-btn-${user.id}`,
        onPress: () => handlers.onAddFriend?.(user.id),
      });
    }
    if (handlers.onBlockFriend) {
      menuItems.push({
        label: 'Block User',
        icon: 'hand-right',
        isDestructive: true,
        testID: `block-menu-item-${user.id}`,
        onPress: () => setShowBlockModal(true),
      });
    }
  }

  return (
    <>
      <Box className="w-full items-center z-10" style={{ height: 0, overflow: 'visible' }}>
        <VStack space="xs" className="absolute w-full items-center" style={{ top: -136 }}>
          <Avatar size="xl" className="border-[4px] border-background-0 bg-background-300 z-10">
            <AvatarFallbackText>{displayName}</AvatarFallbackText>
            {!!player?.avatarfull && (
              <AvatarImage
                source={{ uri: player.avatarfull }}
                alt={`${displayName} avatar`}
                resizeMode="cover"
              />
            )}
          </Avatar>

          <Box className="bg-background-0 px-4 py-1 rounded-full z-10">
            <PageTitle size="xl" className="text-center" numberOfLines={1}>
              {displayName}
            </PageTitle>
          </Box>

          {/* First row: Only badge chips, with 3 dots as the last element */}
          <HStack space="xs" className="flex-wrap items-center justify-center z-10">
            {!!memberSinceLabel && (
              <Chip
                className="bg-background-50 border border-outline-50 shadow-sm"
                testID="other-user-member-since-chip"
              >
                <Text size="xs" className="font-bold text-typography-100">
                  {memberSinceLabel}
                </Text>
              </Chip>
            )}

            <FriendshipStatusBadge status={status} testID="other-user-status-chip" />

            {menuItems.length > 0 ? (
              <UserCardMenu
                items={menuItems}
                isDisabled={isActionLoading}
                testID={`user-card-menu-btn-${user.id}`}
              />
            ) : (
              <Pressable
                disabled
                testID={`user-card-menu-btn-${user.id}`}
                className="w-8 h-8 rounded-lg items-center justify-center border border-outline-100 bg-background-100 opacity-50"
              >
                <Ionicons name="ellipsis-horizontal" size={16} color={HEX_COLORS.muted.icon.hex} />
              </Pressable>
            )}
          </HStack>

          {/* Action buttons to accept or refuse, only shown when pending */}
          {isPending &&
            !!friendshipId &&
            (!!handlers.onAcceptFriend || !!handlers.onRefuseFriend) && (
              <HStack space="xs" className="items-center justify-center pt-1 z-10">
                {!!handlers.onAcceptFriend && (
                  <Pressable
                    onPress={() => handlers.onAcceptFriend!(friendshipId)}
                    disabled={isActionLoading}
                    testID={`accept-btn-${user.id}`}
                    hitSlop={6}
                    className="flex-row items-center justify-center gap-1 rounded-lg border border-primary-500/60 bg-primary-500/15 px-3 py-1.5 active:opacity-70"
                  >
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color={HEX_COLORS.social.action.accept.hex}
                    />
                    <Text size="xs" className="font-semibold text-primary-500">
                      Accept
                    </Text>
                  </Pressable>
                )}

                {!!handlers.onRefuseFriend && (
                  <Pressable
                    onPress={() => handlers.onRefuseFriend!(friendshipId)}
                    disabled={isActionLoading}
                    testID={`refuse-btn-${user.id}`}
                    hitSlop={6}
                    className="flex-row items-center justify-center gap-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 active:opacity-70"
                  >
                    <Ionicons name="close" size={13} color={HEX_COLORS.social.action.neutral.hex} />
                    <Text size="xs" className="font-semibold text-typography-300">
                      Refuse
                    </Text>
                  </Pressable>
                )}
              </HStack>
            )}
        </VStack>
      </Box>

      <ActionConfirmModal
        isVisible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={() => handlers.onBlockFriend?.(friendshipId || user.id)}
        title="Block User"
        message={
          displayName
            ? `Are you sure you want to block ${displayName}?`
            : 'Are you sure you want to block this user?'
        }
        confirmLabel="Block"
        confirmVariant="destructive"
        testIDPrefix={`block-friend-${user.id}`}
      />

      <ActionConfirmModal
        isVisible={showRemoveFriendModal}
        onClose={() => setShowRemoveFriendModal(false)}
        onConfirm={() => friendshipId && handlers.onRemoveFriend?.(friendshipId)}
        title="Remove Friend"
        message={
          displayName
            ? `Are you sure you want to remove ${displayName} from your friends?`
            : 'Are you sure you want to remove this friend?'
        }
        confirmLabel="Remove"
        confirmVariant="destructive"
        testIDPrefix={`remove-friend-${user.id}`}
      />

      <ActionConfirmModal
        isVisible={showRemovePendingModal}
        onClose={() => setShowRemovePendingModal(false)}
        onConfirm={() =>
          friendshipId &&
          (handlers.onRemovePending?.(friendshipId) || handlers.onRemoveFriend?.(friendshipId))
        }
        title="Cancel Friend Request"
        message={
          displayName
            ? `Are you sure you want to cancel the friend request sent to ${displayName}?`
            : 'Are you sure you want to cancel this friend request?'
        }
        confirmLabel="Remove"
        confirmVariant="destructive"
        testIDPrefix={`remove-pending-${user.id}`}
      />

      <ActionConfirmModal
        isVisible={showUnblockModal}
        onClose={() => setShowUnblockModal(false)}
        onConfirm={() => friendshipId && handlers.onUnblockFriend?.(friendshipId)}
        title="Unblock User"
        message={
          displayName
            ? `Are you sure you want to unblock ${displayName}?`
            : 'Are you sure you want to unblock this user?'
        }
        confirmLabel="Unblock"
        confirmVariant="primary"
        testIDPrefix={`unblock-friend-${user.id}`}
      />
    </>
  );
};

export default OtherUserIdentity;
