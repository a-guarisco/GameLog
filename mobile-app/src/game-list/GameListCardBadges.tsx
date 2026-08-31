import React from 'react';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { formatMinutesToHoursShort } from '@gamelog/utils/formatUtils';
import { METRICS } from '@gamelog/theme/metrics';
import Ionicons from '@react-native-vector-icons/ionicons';
import { GameListItemData } from './useGameList';

const MinimalBadge = ({
  iconName,
  text,
  colorHex = '#737373',
  borderColorClass = 'border-outline-300',
  textColorClass = 'text-typography-200',
  bgClass = 'bg-transparent',
  hideText = false,
}: {
  iconName: string;
  text: string;
  colorHex?: string;
  borderColorClass?: string;
  textColorClass?: string;
  bgClass?: string;
  hideText?: boolean;
}) => (
  <HStack
    space="xs"
    className={`items-center px-2.5 py-1 rounded-full border ${borderColorClass} ${bgClass}`}
  >
    <Ionicons name={iconName} size={14} color={colorHex} />
    {!hideText && (
      <Text size="xs" className={`font-bold ${textColorClass}`}>
        {text}
      </Text>
    )}
  </HStack>
);

interface GameListCardBadgesProps {
  gameItem: GameListItemData;
  topPlatform: { name: string; time: number; iconName: string };
  lastPlayedText: string;
}

export const GameListCardBadges = ({ gameItem, topPlatform, lastPlayedText }: GameListCardBadgesProps) => {
  return (
    <HStack className="flex-wrap gap-1">
      <MinimalBadge
        iconName="time-outline"
        text={formatMinutesToHoursShort(gameItem.playtime_forever)}
        colorHex={METRICS.playtime.hex}
        borderColorClass={METRICS.playtime.borderClass}
        textColorClass={METRICS.playtime.textClass}
        bgClass={METRICS.playtime.bgClass}
      />
      {gameItem.rtime_last_played > 0 && (
        <MinimalBadge
          iconName="calendar-clear-outline"
          text={lastPlayedText}
          colorHex={METRICS.lastPlayed.hex}
          borderColorClass={METRICS.lastPlayed.borderClass}
          textColorClass={METRICS.lastPlayed.textClass}
          bgClass={METRICS.lastPlayed.bgClass}
        />
      )}
      {gameItem.genres?.length > 0 && (
        <MinimalBadge
          iconName="game-controller-outline"
          text={gameItem.genres[0]}
          colorHex={METRICS.genre.hex}
          borderColorClass={METRICS.genre.borderClass}
          textColorClass={METRICS.genre.textClass}
          bgClass={METRICS.genre.bgClass}
        />
      )}
      {gameItem.maxPlaytimePerDay > 0 && (
        <MinimalBadge
          iconName="flash"
          text={formatMinutesToHoursShort(gameItem.maxPlaytimePerDay)}
          colorHex={METRICS.maxPerDay.hex}
          borderColorClass={METRICS.maxPerDay.borderClass}
          textColorClass={METRICS.maxPerDay.textClass}
          bgClass={METRICS.maxPerDay.bgClass}
        />
      )}
      {gameItem.streak > 0 && (
        <MinimalBadge
          iconName="flame"
          text={String(gameItem.streak)}
          colorHex={METRICS.streak.hex}
          borderColorClass={METRICS.streak.borderClass}
          textColorClass={METRICS.streak.textClass}
          bgClass={METRICS.streak.bgClass}
        />
      )}
      {topPlatform.time > 0 && (
        <MinimalBadge
          iconName={topPlatform.iconName}
          text={topPlatform.name}
          colorHex={METRICS.topPlatform.hex}
          borderColorClass={METRICS.topPlatform.borderClass}
          textColorClass={METRICS.topPlatform.textClass}
          bgClass={METRICS.topPlatform.bgClass}
          hideText
        />
      )}
    </HStack>
  );
};
