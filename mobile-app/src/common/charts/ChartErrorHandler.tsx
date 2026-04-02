import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';

interface ChartErrorHandlingProps {
  ErrorBehaviour?: React.ComponentType;
}

const ChartErrorHandler = ({ ErrorBehaviour }: ChartErrorHandlingProps) => {
  const FallbackError: React.ComponentType = () => (
    <Box>
      <Text>Error loading chart</Text>
    </Box>
  );

  const ErrorComponent = ErrorBehaviour || FallbackError;
  return <ErrorComponent />;
};

export default ChartErrorHandler;
