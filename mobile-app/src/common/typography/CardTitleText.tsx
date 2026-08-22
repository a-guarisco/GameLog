import { ReactNode } from 'react';
import { Text } from '@gamelog/common/gluestack/text';

interface CardTitleTextProps {
  children: ReactNode;
  className?: string;
}

const CardTitleText = ({ children, className = '' }: CardTitleTextProps) => {
  return (
    <Text
      size="2xs"
      className={`font-bold uppercase text-typography-200 ${className}`}
      style={{ letterSpacing: 1 }}
    >
      {children}
    </Text>
  );
};

export default CardTitleText;
