import React from 'react';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { formatMinutesToHoursShort } from '@gamelog/utils/formatUtils';
import { METRICS } from '@gamelog/theme/metrics';
import Ionicons from '@react-native-vector-icons/ionicons';
import { GameListItemData, SortBy, PlatformFilter } from './useGameList';

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
    style={{ height: 22, minWidth: hideText ? 32 : undefined }}
    className={`items-center justify-center px-1.5 gap-0.5 rounded-full border ${borderColorClass} ${bgClass}`}
  >
    <Ionicons name={iconName} size={12} color={colorHex} />
    {!hideText && (
      <Text style={{ fontSize: 10 }} className={`font-bold ${textColorClass}`}>
        {text}
      </Text>
    )}
  </HStack>
);

interface GameListCardBadgesProps {
  gameItem: GameListItemData;
  topPlatform: { name: string; time: number; iconName: string };
  lastPlayedText: string;
  isExpanded?: boolean;
  sortBy: SortBy;
  platformFilter: PlatformFilter;
}

export const GameListCardBadges = ({ 
  gameItem, 
  topPlatform, 
  lastPlayedText, 
  isExpanded = false, 
  sortBy, 
  platformFilter 
}: GameListCardBadgesProps) => {
  const allChips = [
    {
      id: 'playtime',
      text: formatMinutesToHoursShort(gameItem.playtime_forever),
      icon: 'time-outline',
      metric: METRICS.playtime,
      show: true,
      hideText: false,
    },
    {
      id: 'streak',
      text: String(gameItem.streak),
      icon: 'flame',
      metric: METRICS.streak,
      show: gameItem.streak > 0,
      hideText: false,
    },
    {
      id: 'max_per_day',
      text: formatMinutesToHoursShort(gameItem.maxPlaytimePerDay),
      icon: 'flash',
      metric: METRICS.maxPerDay,
      show: gameItem.maxPlaytimePerDay > 0,
      hideText: false,
    },
    {
      id: 'last_played',
      text: lastPlayedText,
      icon: 'calendar-clear-outline',
      metric: METRICS.lastPlayed,
      show: gameItem.rtime_last_played > 0,
      hideText: false,
    },
    {
      id: 'top_platform',
      text: topPlatform.name,
      icon: topPlatform.iconName,
      metric: METRICS.topPlatform,
      show: topPlatform.time > 0,
      hideText: true,
    }
  ];

  let activeChips = allChips.filter((c) => c.show);

  // Determine priority
  const isPriority = (id: string) => {
    if (sortBy === id) return true;
    if (id === 'top_platform' && platformFilter !== 'All') return true;
    return false;
  };

  const defaultOrder = ['playtime', 'streak', 'max_per_day', 'last_played', 'top_platform'];
  
  activeChips.sort((a, b) => {
    const aPrio = isPriority(a.id);
    const bPrio = isPriority(b.id);
    if (aPrio && !bPrio) return -1;
    if (!aPrio && bPrio) return 1;
    return defaultOrder.indexOf(a.id) - defaultOrder.indexOf(b.id);
  });

  const charWidth = 6;
  const baseChipWidth = 24; 
  const MAX_WIDTH = 145; // Cards are in a 2-column grid, max width is roughly 160-180px

  if (!isExpanded) {
    let estimatedWidth = 0;
    activeChips.forEach((c) => {
      estimatedWidth += c.hideText ? baseChipWidth : ((c.text.length * charWidth) + baseChipWidth);
    });

    // Iterate from right to left (least priority to highest priority)
    for (let i = activeChips.length - 1; i >= 0; i--) {
      if (estimatedWidth > MAX_WIDTH) {
        const c = activeChips[i];
        const chipW = c.hideText ? baseChipWidth : ((c.text.length * charWidth) + baseChipWidth);
        estimatedWidth -= chipW;
        (c as any).hidden = true;
      }
    }
    
    activeChips = activeChips.filter((c: any) => !c.hidden);
  }

  return (
    <HStack className="flex-wrap gap-0.5">
      {activeChips.map((c) => (
        <MinimalBadge
          key={c.id}
          iconName={c.icon}
          text={c.text}
          colorHex={c.metric.hex}
          borderColorClass={c.metric.borderClass}
          textColorClass={c.metric.textClass}
          bgClass={c.metric.bgClass}
          hideText={c.hideText}
        />
      ))}
    </HStack>
  );
};
