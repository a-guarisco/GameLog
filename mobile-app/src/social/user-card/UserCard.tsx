import { Box } from '@gamelog/common/gluestack/box';
import { Card } from '@gamelog/common/gluestack/card';
import { Text } from '@gamelog/common/gluestack/text';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import { UserAvatar } from './UserAvatar';
import { UserCardBadge } from './UserCardBadge';
import { UserCardActions } from './UserCardActions';
import { UserCardActionHandlers } from './userCardActionHandlers';

interface UserCardProps extends UserCardActionHandlers {
  item: UserSearchResult;
  isActionLoading?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ item, isActionLoading, ...handlers }) => {
  const { user, friendship } = item;
  const isFriend = friendship?.friendship_status === 'accepted';
  const isPending = friendship?.friendship_status === 'pending_incoming';

  return (
    <Card
      variant="elevated"
      className="relative overflow-hidden p-0 border border-outline-100 rounded-lg bg-background-50"
      testID={`user-card-${user.id}`}
    >
      <Box
        className={`absolute top-0 left-0 h-fullbg-transparent`}
        style={{ width: isFriend || isPending ? '100%' : '0%' }}
      />

      <HStack space="md" className="relative z-10 px-3 py-3 items-center">
        <UserAvatar username={user.username} isHighlighted={isFriend} />

        <VStack className="flex-1 pr-2">
          <Text size="sm" className="font-bold uppercase text-typography-0" numberOfLines={1}>
            {user.username}
          </Text>
          <Text size="xs" className="font-medium text-typography-200 mt-0.5">
            <Text
              size="xs"
              className={`font-bold ${
                isFriend
                  ? 'text-primary-500 dark:text-primary-400'
                  : isPending
                    ? 'text-warning-500 dark:text-warning-400'
                    : 'text-typography-300 dark:text-typography-400'
              }`}
            >
              {isFriend ? 'Friend' : isPending ? 'Pending' : 'Player'}
            </Text>{' '}
            · Steam ID: {user.steam_id}
          </Text>
          <UserCardBadge item={item} />
        </VStack>

        <Box className="items-end shrink-0">
          <UserCardActions item={item} handlers={handlers} isActionLoading={isActionLoading} />
        </Box>
      </HStack>
    </Card>
  );
};

export default UserCard;
