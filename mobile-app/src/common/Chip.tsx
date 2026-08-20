import { ReactNode } from 'react';
import { HStack } from '@gamelog/common/gluestack/hstack';

export type ChipVariant = 'pill' | 'tag';

const VARIANT_CLASSES: Record<ChipVariant, string> = {
  pill: 'items-center rounded-full border px-3 py-1.5',
  tag: 'items-center rounded-md px-2 py-0.5',
};

interface ChipProps {
  children: ReactNode;
  variant?: ChipVariant;
  className?: string;
  testID?: string;
}

const Chip = ({ children, variant = 'pill', className = '', testID }: ChipProps) => (
  <HStack className={`${VARIANT_CLASSES[variant]} ${className}`} space="xs" testID={testID}>
    {children}
  </HStack>
);

export default Chip;
