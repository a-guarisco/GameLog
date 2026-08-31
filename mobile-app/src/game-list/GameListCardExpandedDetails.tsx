import React from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { formatMinutesToHoursShort } from '@gamelog/utils/formatUtils';
import { GameListItemData } from './useGameList';

interface GameListCardExpandedDetailsProps {
  gameItem: GameListItemData;
  exactDateString: string;
  platforms: { name: string; time: number; iconName: string }[];
}

export const GameListCardExpandedDetails = ({
  gameItem,
  exactDateString,
  platforms,
}: GameListCardExpandedDetailsProps) => {
  return (
    <VStack space="xs" className="p-2 border-t border-outline-100 bg-background-50">
      <Text size="xs" className="font-bold text-typography-300 uppercase">
        Name
      </Text>
      <Text size="sm" className="text-typography-100">
        {gameItem.name}
      </Text>

      <Box className="mt-2" />

      <Text size="xs" className="font-bold text-typography-300 uppercase">
        Last Played
      </Text>
      <Text size="sm" className="text-typography-100">
        {gameItem.rtime_last_played > 0 ? exactDateString : 'Never'}
      </Text>

      <Box className="mt-2" />

      <Text size="xs" className="font-bold text-typography-300 uppercase">
        Genres
      </Text>
      <Text size="sm" className="text-typography-100">
        {gameItem.genres?.length > 0 ? gameItem.genres.join(', ') : 'None'}
      </Text>

      <Box className="mt-2" />

      <Text size="xs" className="font-bold text-typography-300 uppercase">
        Platform Split
      </Text>
      <VStack space="xs" className="mt-1 pr-4">
        {platforms
          .filter((p) => p.time > 0)
          .map((p) => (
            <HStack key={p.name} className="justify-between items-center">
              <Text size="xs" className="text-typography-200">
                {p.name}
              </Text>
              <Text size="xs" className="font-semibold text-typography-100">
                {formatMinutesToHoursShort(p.time)}
              </Text>
            </HStack>
          ))}
      </VStack>
    </VStack>
  );
};
