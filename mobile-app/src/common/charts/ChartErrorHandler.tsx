import { ComponentType } from 'react';
import { ErrorBox } from '@gamelog/common/feedbacks';

interface ChartErrorHandlingProps {
  ErrorBehaviour?: ComponentType;
}

const ChartErrorHandler = ({ ErrorBehaviour }: ChartErrorHandlingProps) => {
  const FallbackError: ComponentType = () => (
    <ErrorBox errorMessage="Error loading chart" variant="icon-top" />
  );

  const ErrorComponent = ErrorBehaviour || FallbackError;
  return <ErrorComponent />;
};

export default ChartErrorHandler;
