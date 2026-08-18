import { ReactNode } from 'react';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';

interface SectionCardProps {
  /** Uppercase kicker above the card body; omitted when the body speaks for itself. */
  label?: string;
  children: ReactNode;
  className?: string;
  testID?: string;
}

/** Outlined block used for a single piece of content inside a section panel. */
const SectionCard = ({ label, children, className = '', testID }: SectionCardProps) => (
  <VStack
    space="sm"
    testID={testID}
    className={`rounded-xl border border-outline-100 bg-background-200 p-3 ${className}`}
  >
    {!!label && (
      <Text
        size="2xs"
        className="font-bold uppercase text-typography-300"
        style={{ letterSpacing: 1 }}
      >
        {label}
      </Text>
    )}
    {children}
  </VStack>
);

export default SectionCard;
