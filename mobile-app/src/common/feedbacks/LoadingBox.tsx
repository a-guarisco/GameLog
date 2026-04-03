import { Box } from '@gamelog/common/gluestack/box';
import { Spinner } from '@gamelog/common/gluestack/spinner';
import { Text } from '@gamelog/common/gluestack/text';
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
