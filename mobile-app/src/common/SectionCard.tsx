import { ReactNode } from 'react';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Card } from '@gamelog/common/gluestack/card';
import { Text } from '@gamelog/common/gluestack/text';

interface SectionCardProps {
  label?: string;
  children: ReactNode;
  className?: string;
  testID?: string;
}

const SectionCard = ({ label, children, className = '', testID }: SectionCardProps) => (
  <Card variant="elevated" className={`p-3 ${className}`} testID={testID}>
    <VStack space="sm">
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
  </Card>
);

export default SectionCard;
