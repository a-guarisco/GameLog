import React from 'react';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { formatMinutesToHoursShort } from '@gamelog/utils/formatUtils';
import { HEX_COLORS } from '@gamelog/theme/hexColors';
import Ionicons from '@react-native-vector-icons/ionicons';
import { GameListItemData, SortBy, PlatformFilter } from './useGameList';
import { formatGameStatus } from '@gamelog/api-manager/dto';
import { useOrientation } from '@gamelog/common/useOrientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MinimalBadge } from '@gamelog/common/MinimalBadge';

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
  platformFilter,
}: GameListCardBadgesProps) => {
  const { isLandscape, width: screenWidth } = useOrientation();
  const insets = useSafeAreaInsets() ?? { top: 0, left: 0, right: 0, bottom: 0 };

  const allChips = [
    {
      id: 'playtime',
      text: formatMinutesToHoursShort(gameItem.playtime_forever),
      icon: 'time',
      metric: {
        hex: HEX_COLORS.playtime.hex,
        bgClass: 'bg-semantic-playtime-100 dark:bg-semantic-playtime-900/40',
        textClass: 'text-semantic-playtime-600',
        borderClass: 'border-semantic-playtime-600',
      },
      show: true,
      hideText: false,
    },
    {
      id: 'streak',
      text: String(gameItem.streak),
      icon: 'flame',
      metric: {
        hex: HEX_COLORS.gameStreak.hex,
        bgClass: 'bg-semantic-gameStreak-100 dark:bg-semantic-gameStreak-900/40',
        textClass: 'text-semantic-gameStreak-600',
        borderClass: 'border-semantic-gameStreak-600',
      },
      show: gameItem.streak > 0,
      hideText: false,
    },
    {
      id: 'max_per_day',
      text: formatMinutesToHoursShort(gameItem.maxPlaytimePerDay),
      icon: 'flash',
      metric: {
        hex: HEX_COLORS.maxPerDay.hex,
        bgClass: 'bg-semantic-maxPerDay-100 dark:bg-semantic-maxPerDay-900/40',
        textClass: 'text-semantic-maxPerDay-600',
        borderClass: 'border-semantic-maxPerDay-600',
      },
      show: gameItem.maxPlaytimePerDay > 0,
      hideText: false,
    },
    {
      id: 'last_played',
      text: lastPlayedText,
      icon: 'calendar-clear',
      metric: {
        hex: HEX_COLORS.lastPlayed.hex,
        bgClass: 'bg-semantic-lastPlayed-100 dark:bg-semantic-lastPlayed-900/40',
        textClass: 'text-semantic-lastPlayed-600',
        borderClass: 'border-semantic-lastPlayed-600',
      },
      show: gameItem.rtime_last_played > 0,
      hideText: false,
    },
    {
      id: 'game_status',
      text: formatGameStatus(gameItem.gameStatus),
      icon: 'bookmark',
      metric: (() => {
        const gs = gameItem.gameStatus;
        if (gs === 'playing') {
          return {
            hex: HEX_COLORS.gameStatus[gs]?.hex || HEX_COLORS.muted.icon.hex,
            bgClass: 'bg-gameStatus-playing-100 dark:bg-gameStatus-playing-900/40',
            textClass: 'text-gameStatus-playing-600',
            borderClass: 'border-gameStatus-playing-600',
          };
        }
        if (gs === 'to_be_played') {
          return {
            hex: HEX_COLORS.gameStatus[gs]?.hex || HEX_COLORS.muted.icon.hex,
            bgClass: 'bg-gameStatus-toBePlayed-100 dark:bg-gameStatus-toBePlayed-900/40',
            textClass: 'text-gameStatus-toBePlayed-600',
            borderClass: 'border-gameStatus-toBePlayed-600',
          };
        }
        if (gs === 'shelved') {
          return {
            hex: HEX_COLORS.gameStatus[gs]?.hex || HEX_COLORS.muted.icon.hex,
            bgClass: 'bg-gameStatus-shelved-100 dark:bg-gameStatus-shelved-900/40',
            textClass: 'text-gameStatus-shelved-600',
            borderClass: 'border-gameStatus-shelved-600',
          };
        }
        if (gs === 'platinato') {
          return {
            hex: HEX_COLORS.gameStatus[gs]?.hex || HEX_COLORS.muted.icon.hex,
            bgClass: 'bg-gameStatus-platinato-100 dark:bg-gameStatus-platinato-900/40',
            textClass: 'text-gameStatus-platinato-600',
            borderClass: 'border-gameStatus-platinato-600',
          };
        }
        return {
          hex: HEX_COLORS.muted.icon.hex,
          bgClass: 'bg-transparent',
          textClass: 'text-typography-200',
          borderClass: 'border-outline-300',
        };
      })(),
      show: (isExpanded || isLandscape) && Boolean(gameItem.gameStatus),
      hideText: false,
    },
    {
      id: 'top_platform',
      text: topPlatform.name,
      icon: topPlatform.iconName,
      metric: {
        hex: HEX_COLORS.topPlatform.hex,
        bgClass: 'bg-semantic-topPlatform-100 dark:bg-semantic-topPlatform-900/40',
        textClass: 'text-semantic-topPlatform-600',
        borderClass: 'border-semantic-topPlatform-600',
      },
      show: topPlatform.time > 0,
      hideText: true,
    },
  ];

  let activeChips = allChips.filter((c) => c.show);

  // Determine priority
  const isPriority = (id: string) => {
    if (sortBy === id) return true;
    if (id === 'top_platform' && platformFilter !== 'All') return true;
    return false;
  };

  const defaultOrder = isLandscape
    ? ['playtime', 'streak', 'game_status', 'max_per_day', 'last_played', 'top_platform']
    : ['playtime', 'streak', 'max_per_day', 'last_played', 'game_status', 'top_platform'];

  activeChips.sort((a, b) => {
    const aPrio = isPriority(a.id);
    const bPrio = isPriority(b.id);
    if (aPrio && !bPrio) return -1;
    if (!aPrio && bPrio) return 1;
    return defaultOrder.indexOf(a.id) - defaultOrder.indexOf(b.id);
  });

  if (!isExpanded) {
    if (isLandscape) {
      // Dynamic width calculation in 3-column landscape grid
      const safeLeft = insets?.left ?? 0;
      const safeRight = insets?.right ?? 0;
      const usableWidth = Math.max(0, screenWidth - (safeLeft + 74) - safeRight - 16);
      const colWidth = usableWidth / 3;
      const availableWidth = Math.max(160, Math.floor(colWidth - 32));

      const getChipWidth = (c: (typeof allChips)[0]) =>
        c.hideText ? 32 : 28 + Math.ceil(c.text.length * 7);

      const calculateTotalWidth = (chips: typeof activeChips) => {
        if (chips.length === 0) return 0;
        const chipsWidth = chips.reduce((sum, c) => sum + getChipWidth(c), 0);
        const gapsWidth = (chips.length - 1) * 2;
        return chipsWidth + gapsWidth;
      };

      const fittingChips: typeof activeChips = [];
      for (const chip of activeChips) {
        const candidateList = [...fittingChips, chip];
        if (calculateTotalWidth(candidateList) <= availableWidth) {
          fittingChips.push(chip);
        }
      }
      activeChips = fittingChips;
    } else {
      const charWidth = 6;
      const baseChipWidth = 24;
      const MAX_WIDTH = 145; // Cards are in a 2-column grid, max width is roughly 160-180px

      let estimatedWidth = 0;
      activeChips.forEach((c) => {
        estimatedWidth += c.hideText ? baseChipWidth : c.text.length * charWidth + baseChipWidth;
      });

      // Iterate from right to left (least priority to highest priority)
      for (let i = activeChips.length - 1; i >= 0; i--) {
        if (estimatedWidth > MAX_WIDTH) {
          const c = activeChips[i];
          const chipW = c.hideText ? baseChipWidth : c.text.length * charWidth + baseChipWidth;
          estimatedWidth -= chipW;
          (c as any).hidden = true;
        }
      }

      activeChips = activeChips.filter((c: any) => !c.hidden);
    }
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
