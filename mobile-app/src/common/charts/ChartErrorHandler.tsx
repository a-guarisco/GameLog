import { ComponentType } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';

interface ChartErrorHandlingProps {
  ErrorBehaviour?: ComponentType;
}

const ChartErrorHandler = ({ ErrorBehaviour }: ChartErrorHandlingProps) => {
  const FallbackError: ComponentType = () => (
    <Box className="py-8 items-center justify-center w-full">
      <Text className="text-typography-400">Error loading chart</Text>
    </Box>
  );

  const ErrorComponent = ErrorBehaviour || FallbackError;
  return <ErrorComponent />;
};

export default ChartErrorHandler;
