import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import { UserAvatar } from './UserAvatar';
import { UserCardStatusSection, UserCardActionHandlers } from './UserCardStatusSection';

interface UserCardProps extends UserCardActionHandlers {
  item: UserSearchResult;
  isActionLoading?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ item, isActionLoading, ...handlers }) => {
  const { user, friendship } = item;
  const isFriend = friendship?.friendship_status === 'accepted';

  return (
    <Box className="relative overflow-hidden rounded-lg mb-3 bg-background-200 shadow-md">
      <HStack space="md" className="relative z-10 px-3 py-3 items-center">
        <UserAvatar username={user.username} isHighlighted={isFriend} />

        <VStack className="flex-1">
          <Text size="sm" className="font-bold uppercase" numberOfLines={1}>
            {user.username}
          </Text>
          <Text size="xs" className="font-medium text-typography-400 mt-0.5">
            Steam ID: {user.steam_id}
          </Text>
        </VStack>

        <Box className="items-end shrink-0">
          <UserCardStatusSection
            item={item}
            handlers={handlers}
            isActionLoading={isActionLoading}
          />
        </Box>
      </HStack>
    </Box>
  );
};
