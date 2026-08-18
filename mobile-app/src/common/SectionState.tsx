import { Box } from '@gamelog/common/gluestack/box';
import { Spinner } from '@gamelog/common/gluestack/spinner';
import { ErrorBox, InfoBox } from './feedbacks';

export const SectionSpinner = ({ className = 'items-center py-8' }: { className?: string }) => (
  <Box className={className}>
    <Spinner />
  </Box>
);

export const SectionMessage = ({ children }: { children: string }) => (
  <InfoBox message={children} className="py-4" />
);

interface SectionStateProps {
  isLoading?: boolean;
  hasError?: boolean;
  isEmpty?: boolean;
  errorMessage: string;
  emptyMessage: string;
  loadingClassName?: string;
}

const SectionState = ({
  isLoading = false,
  hasError = false,
  isEmpty = false,
  errorMessage,
  emptyMessage,
  loadingClassName,
}: SectionStateProps) => {
  if (isLoading) return <SectionSpinner className={loadingClassName} />;
  if (hasError) return <ErrorBox errorMessage={errorMessage} className="py-4" />;
  if (isEmpty) return <InfoBox message={emptyMessage} className="py-4" />;
  return null;
};

export default SectionState;

