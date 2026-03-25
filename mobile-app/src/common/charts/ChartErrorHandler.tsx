import { Box } from '@gamelog/components/ui/box';
import { Text } from '@gamelog/components/ui/text';

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
