import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { ReactNode } from 'react';
import { PageTitle } from '@gamelog/common/typography/CommonTypography';

interface GameIdentityProps {
  title: string;
  secondaryText?: string;
  iconUrl?: string; // Kept for interface compatibility but unused
  textClassName?: string;
  className?: string;
  chips?: ReactNode;
}

const GameIdentity = ({
  title,
  secondaryText,
  className,
  chips,
  textClassName,
}: GameIdentityProps) => {
  return (
    <Box className={`w-full px-4 pt-6 pb-2 ${className ?? ''}`}>
      <HStack space="md" className="w-full justify-between items-center">
        <Box className="flex-1">
          <PageTitle size="2xl" className={`text-left ${textClassName ?? ''}`} numberOfLines={3}>
            {title}
          </PageTitle>
        </Box>

        {(chips || secondaryText) && (
          <Box className="flex-shrink-0 items-end">
            {chips}
            {secondaryText && (
              <Box className="bg-background-200 border border-outline-100 rounded-full px-3 py-1 mt-1">
                <Text size="xs" className="font-bold text-typography-100">
                  {secondaryText}
                </Text>
              </Box>
            )}
          </Box>
        )}
      </HStack>
    </Box>
  );
};

export default GameIdentity;
