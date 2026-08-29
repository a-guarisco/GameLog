import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';

interface UserAvatarProps {
  username: string;
  isHighlighted?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ username, isHighlighted }) => (
  <Box
    className={`w-10 h-10 rounded-lg items-center justify-center shrink-0 ${
      isHighlighted
        ? 'bg-primary-500/15 dark:bg-primary-500/25 border border-primary-500/30'
        : 'bg-background-100 dark:bg-background-200 border border-outline-100 dark:border-outline-50'
    }`}
  >
    <Text
      className={`font-bold text-base uppercase ${
        isHighlighted
          ? 'text-primary-600 dark:text-primary-400'
          : 'text-typography-400 dark:text-typography-300'
      }`}
    >
      {username ? username.charAt(0) : 'U'}
    </Text>
  </Box>
);

export default UserAvatar;
