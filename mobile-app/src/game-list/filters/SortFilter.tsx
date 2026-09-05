import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { ModalOptionText } from '@gamelog/common/CommonTypography';
import { FilterChip } from './FilterChip';
import { FilterModalWrapper } from './FilterModalWrapper';
import { SortBy } from '../useGameList';

import { HEX_COLORS } from '@gamelog/theme/hexColors';

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: 'Playtime', value: 'playtime' },
  { label: 'Last Played', value: 'last_played' },
  { label: 'Max per Day', value: 'max_per_day' },
  { label: 'Top Platform Time', value: 'top_platform' },
];

const getSortColorClasses = (sort: SortBy) => {
  switch (sort) {
    case 'playtime':
      return {
        bg: 'bg-semantic-playtime-100 dark:bg-semantic-playtime-900/40',
        border: 'border-semantic-playtime-600',
        text: 'text-semantic-playtime-600',
        hex: HEX_COLORS.playtime.hex,
      };
    case 'last_played':
      return {
        bg: 'bg-semantic-lastPlayed-100 dark:bg-semantic-lastPlayed-900/40',
        border: 'border-semantic-lastPlayed-600',
        text: 'text-semantic-lastPlayed-600',
        hex: HEX_COLORS.lastPlayed.hex,
      };
    case 'max_per_day':
      return {
        bg: 'bg-semantic-maxPerDay-100 dark:bg-semantic-maxPerDay-900/40',
        border: 'border-semantic-maxPerDay-600',
        text: 'text-semantic-maxPerDay-600',
        hex: HEX_COLORS.maxPerDay.hex,
      };
    case 'top_platform':
      return {
        bg: 'bg-semantic-topPlatform-100 dark:bg-semantic-topPlatform-900/40',
        border: 'border-semantic-topPlatform-600',
        text: 'text-semantic-topPlatform-600',
        hex: HEX_COLORS.topPlatform.hex,
      };
    default:
      return {
        bg: 'bg-primary-500',
        border: 'border-primary-500',
        text: 'text-typography-0',
        hex: HEX_COLORS.overlay.icon.hex,
      };
  }
};

interface SortFilterProps {
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
}

export const SortFilter = ({ sortBy, onSortChange }: SortFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeColors = getSortColorClasses(sortBy);

  return (
    <>
      <FilterChip
        label="Sort"
        value={SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
        onPress={() => setIsOpen(true)}
        isActive={true}
        activeBgClass={activeColors.bg}
        activeBorderClass={activeColors.border}
        activeTextClass={activeColors.text}
        activeIconColor={activeColors.hex}
      />

      <FilterModalWrapper isVisible={isOpen} onClose={() => setIsOpen(false)} title="Sort By">
        <VStack space="md">
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                onSortChange(opt.value);
                setIsOpen(false);
              }}
            >
              <ModalOptionText isActive={sortBy === opt.value}>{opt.label}</ModalOptionText>
            </Pressable>
          ))}
        </VStack>
      </FilterModalWrapper>
    </>
  );
};
