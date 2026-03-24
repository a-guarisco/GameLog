import React from 'react';
import { Box } from '@gamelog/components/ui/box';
import { HStack } from '@gamelog/components/ui/hstack';
import { VStack } from '@gamelog/components/ui/vstack';
import { Text } from '@gamelog/components/ui/text';

interface AchievementItemProps {
  name: string;
  percentage: number;
  unlockTime?: number;
}

const AchievementItem = ({ name, percentage, unlockTime }: AchievementItemProps) => {
  return (
    <Box className="relative overflow-hidden rounded-2xl border-2 border-outline-500 mb-3 h-20" >
      <Box
        testID="global-progress-bar"
        className="absolute top-0 left-0 h-full bg-tertiary-500"
        style={{ width: `${percentage}%` }}
      />

      <HStack className="h-full px-5 items-center relative z-10" space="md">
        <VStack className="flex-1 items-center justify-center">
          <Text
            size="xl"
            className="font-bold uppercase text-center"
          >
            {name}
          </Text>
          {unlockTime && (
            <Text size="sm" className="font-mono text-center">
              Achievement unlocked on: {new Date(unlockTime * 1000).toLocaleDateString()}
            </Text>
          )}
        </VStack>

        <Box className="border-2 border-outline-500 rounded-xl px-4 py-1 bg-background-300">
          <Text size="sm" className="font-bold">
            {percentage}%
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

export default AchievementItem;
