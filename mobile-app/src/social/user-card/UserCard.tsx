import React from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { Card } from '@gamelog/common/gluestack/card';
import { Text } from '@gamelog/common/gluestack/text';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Pressable } from 'react-native';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import { UserAvatar } from './UserAvatar';
import { UserCardActions } from './UserCardActions';
import { UserCardActionHandlers } from './userCardActionHandlers';

export interface UserCardProps extends UserCardActionHandlers {
  item: UserSearchResult;
  avatarUrl?: string | null;
  isActionLoading?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  item,
  avatarUrl,
  isActionLoading,
  ...handlers
}) => {
  const { user, friendship } = item;
  const status = friendship?.friendship_status;
  const isFriend = status === 'accepted';
  const isPending = status === 'pending_incoming';
  const isPendingOutgoing = status === 'pending_outgoing';
  const isBlocked = status === 'blocked';

  const statusLabel = isFriend
    ? 'Friend'
    : isPending
      ? 'Pending'
      : isPendingOutgoing
        ? 'Requested'
        : isBlocked
          ? 'Blocked'
          : 'Player';

  const statusColorClass = isFriend
    ? 'text-primary-500 dark:text-primary-400'
    : isPending || isPendingOutgoing
      ? 'text-warning-500 dark:text-warning-400'
      : isBlocked
        ? 'text-red-400 dark:text-red-400'
        : 'text-typography-300 dark:text-typography-400';

  const handleCardPress = () => {
    if (handlers.onSelectUser) {
      handlers.onSelectUser(item);
    }
  };

  return (
    <Card
      variant="elevated"
      className="relative overflow-hidden p-0 border border-outline-100 rounded-lg bg-background-50"
      testID={`user-card-${user.id}`}
    >
      <HStack space="md" className="items-center justify-between px-3 py-3">
        <Pressable
          onPress={handleCardPress}
          className="flex-1 flex-row items-center pr-2"
          testID={`user-card-pressable-${user.id}`}
        >
          <HStack space="md" className="items-center flex-1">
            <UserAvatar
              username={user.username}
              avatarUrl={avatarUrl}
              steamId={user.steam_id}
              isHighlighted={isFriend}
            />

            <VStack className="flex-1">
              <Text size="sm" className="font-bold uppercase text-typography-0" numberOfLines={1}>
                {user.username}
              </Text>
              <Text size="xs" className="font-medium text-typography-200 mt-0.5" numberOfLines={1}>
                <Text size="xs" className={`font-bold ${statusColorClass}`}>
                  {statusLabel}
                </Text>
              </Text>
            </VStack>
          </HStack>
        </Pressable>

        <Box className="shrink-0">
          <UserCardActions item={item} handlers={handlers} isActionLoading={isActionLoading} />
        </Box>
      </HStack>
    </Card>
  );
};

export default UserCard;
