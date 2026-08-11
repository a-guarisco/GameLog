import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';

interface UserAvatarProps {
  username: string;
  isHighlighted?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ username, isHighlighted }) => (
  <Box
    className={`w-10 h-10 rounded-md items-center justify-center shrink-0 ${
      isHighlighted ? 'bg-success-100' : 'bg-background-300'
    }`}
  >
    <Text className="text-white font-bold text-lg uppercase">
      {username ? username.charAt(0) : 'U'}
    </Text>
  </Box>
);
