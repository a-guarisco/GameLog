import { Box } from '@gamelog/common/gluestack/box';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import { FRIENDSHIP_BADGES } from './friendshipStatus';
import { FriendshipStatusBadge } from './FriendshipStatusBadge';

interface UserCardBadgeProps {
  item: UserSearchResult;
}

export const UserCardBadge: React.FC<UserCardBadgeProps> = ({ item }) => {
  const status = item.friendship?.friendship_status;
  const badgeConfig = status ? FRIENDSHIP_BADGES[status] : undefined;

  if (!badgeConfig) return null;

  return (
    <Box className="mt-2 items-start">
      <FriendshipStatusBadge config={badgeConfig} />
    </Box>
  );
};
