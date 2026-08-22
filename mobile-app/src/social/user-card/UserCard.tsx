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

  return (
    <Card variant="elevated" className="relative mb-3 p-0">
      <HStack space="md" className="relative z-10 px-3 py-3 items-center">
        <UserAvatar username={user.username} isHighlighted={isFriend} />

        <VStack className="flex-1">
          <Text size="sm" className="font-bold uppercase" numberOfLines={1}>
            {user.username}
          </Text>
          <Text size="xs" className="font-medium text-typography-400 mt-0.5">
            Steam ID: {user.steam_id}
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
