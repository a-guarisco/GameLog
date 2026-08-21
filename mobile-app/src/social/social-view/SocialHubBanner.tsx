import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';

export const SocialHubBanner: React.FC = () => (
  <Box className="bg-background-0 px-5 pt-5 pb-3 w-full items-center">
    <Text size="3xl" className="font-bold uppercase text-center mb-1">
      Social Hub
    </Text>
    <Text size="sm" className="text-typography-400 text-center">
      Connect with friends, manage requests, and compare game recommendations
    </Text>
  </Box>
);
