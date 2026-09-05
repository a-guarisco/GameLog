import { ReactNode } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Card } from '@gamelog/common/gluestack/card';
import { CardTitleText } from '@gamelog/common/typography/CardTypography';

import { HStack } from '@gamelog/common/gluestack/hstack';

interface SectionCardProps {
  label?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: any;
  testID?: string;
}

const SectionCard = ({
  label,
  headerRight,
  children,
  className = '',
  style,
  testID,
}: SectionCardProps) => {
  const isFill = className.includes('h-full') || className.includes('flex-1');
  return (
    <Card variant="elevated" className={`p-3 overflow-visible ${className}`} style={style} testID={testID}>
      <VStack
        space="sm"
        className={`w-full ${isFill ? 'h-full flex-1 justify-between' : ''}`}
      >
        {(!!label || !!headerRight) && (
          <HStack className="w-full justify-between items-center">
            {!!label && (
              <Box className={headerRight ? 'flex-1 mr-2' : 'w-full'}>
                <CardTitleText numberOfLines={2}>{label}</CardTitleText>
              </Box>
            )}
            {!!headerRight && headerRight}
          </HStack>
        )}
        {children}
      </VStack>
    </Card>
  );
};

export default SectionCard;

