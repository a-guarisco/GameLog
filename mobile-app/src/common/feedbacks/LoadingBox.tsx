import { Box } from '@gamelog/components/ui/box';
import { Spinner } from '@gamelog/components/ui/spinner';
import { Text } from '@gamelog/components/ui/text';
import { ViewProps } from 'react-native';

interface LoadingBoxProps extends ViewProps {
  message: string | null;
  className?: string;
}

export const LoadingBox = ({ message, className, ...props }: LoadingBoxProps) => {
  const displayMessage = message || 'Loading...';
  return (
    <Box {...props} className={`items-center justify-center ${className || ''}`}>
      <Spinner size="large" />
      <Text className="mt-2 text-typography-400">{displayMessage}</Text>
    </Box>
  );
};
