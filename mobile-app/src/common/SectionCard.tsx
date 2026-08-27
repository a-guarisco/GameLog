import { ReactNode } from 'react';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Card } from '@gamelog/common/gluestack/card';
import { CardTitleText } from '@gamelog/common/typography/CardTypography';

import { HStack } from '@gamelog/common/gluestack/hstack';

interface SectionCardProps {
  label?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
  testID?: string;
}

const SectionCard = ({
  label,
  headerRight,
  children,
  className = '',
  testID,
}: SectionCardProps) => (
  <Card variant="elevated" className={`p-3 overflow-visible ${className}`} testID={testID}>
    <VStack space="sm" className="w-full">
      {(!!label || !!headerRight) && (
        <HStack className="w-full justify-between items-center">
          {!!label && <CardTitleText>{label}</CardTitleText>}
          {!!headerRight && headerRight}
        </HStack>
      )}
      {children}
    </VStack>
  </Card>
);

export default SectionCard;
