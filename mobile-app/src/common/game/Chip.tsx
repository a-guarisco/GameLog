import { ReactNode } from 'react';
import { HStack } from '@gamelog/common/gluestack/hstack';

export type ChipVariant = 'pill' | 'tag';

/** Shape only — colours stay with the caller so each chip keeps its own palette. */
const VARIANT_CLASSES: Record<ChipVariant, string> = {
  /** Full-height rounded chip with a border, used for the status chips under a game title. */
  pill: 'items-center rounded-full border px-3 py-1.5',
  /** Compact squared-off label, used for the topic tags on a guide card. */
  tag: 'items-center rounded-md px-2 py-0.5',
};

interface ChipProps {
  children: ReactNode;
  variant?: ChipVariant;
  /** Background/border colours, e.g. "border-primary-500 bg-primary-500". */
  className?: string;
  testID?: string;
}

const Chip = ({ children, variant = 'pill', className = '', testID }: ChipProps) => (
  <HStack className={`${VARIANT_CLASSES[variant]} ${className}`} space="xs" testID={testID}>
    {children}
  </HStack>
);

export default Chip;
