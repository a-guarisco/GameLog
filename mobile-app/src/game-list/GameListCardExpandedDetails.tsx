import React from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { formatMinutesToHoursShort } from '@gamelog/utils/formatUtils';
import { formatGameStatus } from '@gamelog/api-manager/dto';
import { GameListItemData } from './useGameList';

import Ionicons from '@react-native-vector-icons/ionicons';
import { HEX_COLORS } from '@gamelog/theme/hexColors';

interface GameListCardExpandedDetailsProps {
  gameItem: GameListItemData;
  exactDateString: string;
  platforms: { name: string; time: number; iconName: string }[];
  lastPlayedText: string;
}

export const GameListCardExpandedDetails = ({
  gameItem,
  exactDateString,
  platforms,
  lastPlayedText,
}: GameListCardExpandedDetailsProps) => {
  return (
    <VStack space="xs" className="p-3 border-t border-outline-100 bg-background-50">
      
      {/* LAST PLAYED */}
      <HStack space="sm" className="items-center">
        <Ionicons name="calendar-clear-outline" size={16} color={HEX_COLORS.lastPlayed.hex} />
        <Text size="xs" className="font-bold text-typography-300 uppercase">
          Last Played
        </Text>
      </HStack>
      <Text size="sm" className="text-typography-100 ml-6">
        {gameItem.rtime_last_played > 0 
          ? `${exactDateString} (${lastPlayedText === 'Today' ? 'Today' : `${lastPlayedText} ago`})` 
          : 'Never'}
      </Text>
      
      <Box className="mt-2" />

      {/* STREAK */}
      <HStack space="sm" className="items-center">
        <Ionicons name="flame" size={16} color={HEX_COLORS.streak.hex} />
        <Text size="xs" className="font-bold text-typography-300 uppercase">
          Streak
        </Text>
      </HStack>
      <Text size="sm" className="text-typography-100 ml-6">
        {gameItem.streak > 0 ? `${gameItem.streak} days` : 'None'}
      </Text>

      <Box className="mt-2" />

      {/* MAX PER DAY */}
      <HStack space="sm" className="items-center">
        <Ionicons name="flash" size={16} color={HEX_COLORS.maxPerDay.hex} />
        <Text size="xs" className="font-bold text-typography-300 uppercase">
          Max / Day
        </Text>
      </HStack>
      <Text size="sm" className="text-typography-100 ml-6">
        {gameItem.maxPlaytimePerDay > 0 ? formatMinutesToHoursShort(gameItem.maxPlaytimePerDay) : 'None'}
      </Text>

      <Box className="mt-2" />

      {/* GENRES */}
      <HStack space="sm" className="items-center">
        <Ionicons name="game-controller-outline" size={16} color={HEX_COLORS.genre.hex} />
        <Text size="xs" className="font-bold text-typography-300 uppercase">
          Genres
        </Text>
      </HStack>
      <Text size="sm" className="text-typography-100 ml-6">
        {gameItem.genres?.length > 0 ? gameItem.genres.join(', ') : 'None'}
      </Text>

      <Box className="mt-2" />

      {/* STATUS */}
      <HStack space="sm" className="items-center">
        <Ionicons name="bookmark-outline" size={16} color={gameItem.gameStatus ? HEX_COLORS.gameStatus[gameItem.gameStatus].hex : HEX_COLORS.muted.icon.hex} />
        <Text size="xs" className="font-bold text-typography-300 uppercase">
          Status
        </Text>
      </HStack>
      <Text size="sm" className="text-typography-100 ml-6">
        {formatGameStatus(gameItem.gameStatus)}
      </Text>

      <Box className="mt-2" />

      {/* PLATFORMS */}
      <HStack space="sm" className="items-center mb-1">

        <Ionicons name="hardware-chip-outline" size={16} color={HEX_COLORS.topPlatform.hex} />
        <Text size="xs" className="font-bold text-typography-300 uppercase">
          Platform Split
        </Text>
      </HStack>
      <VStack space="xs" className="ml-6 pr-4">
        {platforms.map((p) => (
          <HStack key={p.name} className="justify-between items-center">
            <HStack space="sm" className="items-center">
              <Ionicons name={p.iconName} size={14} color={HEX_COLORS.topPlatform.hex} />
              <Text size="xs" className="text-typography-200">
                {p.name}
              </Text>
            </HStack>
            <Text size="xs" className="font-semibold text-typography-100">
              {p.time > 0 ? formatMinutesToHoursShort(p.time) : '0h'}
            </Text>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
};
