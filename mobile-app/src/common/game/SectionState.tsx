import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Spinner } from '@gamelog/common/gluestack/spinner';

/** Centred spinner for a section that is still loading. */
export const SectionSpinner = ({ className = 'items-center py-8' }: { className?: string }) => (
  <Box className={className}>
    <Spinner />
  </Box>
);

/** One-line explanation shown in place of a section's content. */
export const SectionMessage = ({ children }: { children: string }) => (
  <Text size="xs" className="py-8 text-center text-typography-300">
    {children}
  </Text>
);

interface SectionStateProps {
  isLoading?: boolean;
  hasError?: boolean;
  isEmpty?: boolean;
  errorMessage: string;
  emptyMessage: string;
  /** Overrides the spinner container, for sections that need a fixed-height slot. */
  loadingClassName?: string;
}

/**
 * The loading → error → empty chain every game section repeats. Renders nothing once
 * there is content to show, so it can sit above the list it guards.
 */
const SectionState = ({
  isLoading = false,
  hasError = false,
  isEmpty = false,
  errorMessage,
  emptyMessage,
  loadingClassName,
}: SectionStateProps) => {
  if (isLoading) return <SectionSpinner className={loadingClassName} />;
  if (hasError) return <SectionMessage>{errorMessage}</SectionMessage>;
  if (isEmpty) return <SectionMessage>{emptyMessage}</SectionMessage>;
  return null;
};

export default SectionState;
