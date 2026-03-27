import { Box } from '@gamelog/components/ui/box';
import { Spinner } from '@gamelog/components/ui/spinner';
import { Text } from '@gamelog/components/ui/text';

export const LoadingBox = ({
  message,
  className,
}: {
  message: string | null;
  className?: string;
}) => {
  const displayMessage = message || 'Loading...';
  return (
    <Box className={`items-center justify-center ${className || ''}`}>
      <Spinner size="large" />
      <Text className="mt-2 text-typography-400">{displayMessage}</Text>
    </Box>
  );
};
