import Ionicons from '@react-native-vector-icons/ionicons';
import { HEX_COLORS } from '@gamelog/theme/hexColors';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
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
    <Box className={`w-full px-4 pt-6 pb-1 ${className ?? ''}`}>
      <VStack space="sm" className="w-full items-center justify-center">
        <PageTitle size="2xl" className={`text-center ${textClassName ?? ''}`} numberOfLines={3}>
          {title}
        </PageTitle>

        {(chips || secondaryText) && (
          <Box className="w-full items-center justify-center">
            {chips}
            {secondaryText && (
              <Box className="bg-background-200 border border-outline-100 rounded-full px-3 py-1 mt-1">
                <HStack space="xs" className="items-center">
                  <Ionicons name="flame" size={12} color={HEX_COLORS.streak.hex} />
                  <Text size="xs" className="font-bold text-typography-100">
                    {secondaryText}
                  </Text>
                </HStack>
              </Box>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default GameIdentity;
