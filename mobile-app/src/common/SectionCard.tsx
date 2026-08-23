import { ReactNode } from 'react';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Card } from '@gamelog/common/gluestack/card';
import CardTitleText from '@gamelog/common/typography/CardTitleText';

interface SectionCardProps {
  label?: string;
  children: ReactNode;
  className?: string;
  testID?: string;
}

const SectionCard = ({ label, children, className = '', testID }: SectionCardProps) => (
  <Card variant="elevated" className={`p-3 ${className}`} testID={testID}>
    <VStack space="sm" className="w-full">
      {!!label && <CardTitleText>{label}</CardTitleText>}
      {children}
    </VStack>
  </Card>
);

export default SectionCard;
