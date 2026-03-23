import React from 'react';
import { Box } from '@gamelog/components/ui/box';
import { HStack } from '@gamelog/components/ui/hstack';
import { VStack } from '@gamelog/components/ui/vstack';
import { TextGL } from '@gamelog/common';

interface AchievementItemProps {
  name: string;
  percentage: number;
  unlockTime?: number;
}

const AchievementItem = ({ name, percentage, unlockTime }: AchievementItemProps) => {
  return (
    <Box className="relative overflow-hidden rounded-2xl border-2 border-primary-0 bg-background-950 mb-3 h-20">
      <Box
        testID="global-progress-bar"
        className="absolute top-0 left-0 h-full bg-tertiary-800"
        style={{ width: `${percentage}%` }}
      />

      <HStack className="h-full px-5 items-center relative z-10" space="md">
        <VStack className="flex-1 items-center justify-center">
          <TextGL
            variant="h3"
            className="text-typography-0 font-bold tracking-widest uppercase italic text-center"
          >
            {name}
          </TextGL>
          {unlockTime && (
            <TextGL variant="bodySm" className="text-typography-0 opacity-70 font-mono text-center">
              Achievement unlocked on: {new Date(unlockTime * 1000).toLocaleDateString()}
            </TextGL>
          )}
        </VStack>

        <Box className="border-2 border-primary-0 rounded-xl px-4 py-1 bg-background-900">
          <TextGL variant="bodySm" className="text-typography-0 font-mono font-bold">
            {percentage}%
          </TextGL>
        </Box>
      </HStack>
    </Box>
  );
};

export default AchievementItem;
