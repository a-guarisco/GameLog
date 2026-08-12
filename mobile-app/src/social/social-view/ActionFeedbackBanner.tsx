import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';

interface ActionFeedbackBannerProps {
  message: string | null;
}

export const ActionFeedbackBanner: React.FC<ActionFeedbackBannerProps> = ({ message }) => {
  if (!message) return null;

  return (
    <Box className="relative overflow-hidden rounded-lg mt-3 bg-background-200 shadow-md px-3 py-2">
      <Text size="xs" className="text-primary-400 text-center font-medium">
        {message}
      </Text>
    </Box>
  );
};
