import React from 'react';
import { Text } from '@gamelog/common/gluestack/text';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalTitle = ({ children, className = '' }: TypographyProps) => (
  <Text size="xl" className={`font-bold text-typography-0 ${className}`}>
    {children}
  </Text>
);

interface ModalOptionTextProps extends TypographyProps {
  isActive?: boolean;
}

export const ModalOptionText = ({
  children,
  isActive = false,
  className = '',
}: ModalOptionTextProps) => (
  <Text
    size="md"
    className={`py-3 ${isActive ? 'font-bold text-primary-500' : 'font-medium text-typography-200'} ${className}`}
  >
    {children}
  </Text>
);

export const SectionTitle = ({ children, className = '' }: TypographyProps) => (
  <Text size="sm" className={`font-bold text-typography-400 uppercase tracking-wider ${className}`}>
    {children}
  </Text>
);
