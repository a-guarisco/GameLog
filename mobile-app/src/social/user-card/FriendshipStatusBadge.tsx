import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { BadgeTone, FriendshipBadgeConfig } from './friendshipStatus';

const TONE_CLASSES: Record<BadgeTone, { bg: string; text: string }> = {
  success: { bg: 'bg-primary-500/15', text: 'text-primary-700 dark:text-primary-300' },
  warning: { bg: 'bg-background-50 border border-outline-100', text: 'text-typography-600' },
  error: { bg: 'bg-error-500/15', text: 'text-error-700 dark:text-error-400' },
};

interface FriendshipStatusBadgeProps {
  config: FriendshipBadgeConfig;
}

export const FriendshipStatusBadge: React.FC<FriendshipStatusBadgeProps> = ({ config }) => {
  const { bg, text } = TONE_CLASSES[config.tone];
  return (
    <Box className={`${bg} px-2 py-0.5 rounded-md`}>
      <Text size="xs" className={`font-bold uppercase ${text}`}>
        {config.label}
      </Text>
    </Box>
  );
};
