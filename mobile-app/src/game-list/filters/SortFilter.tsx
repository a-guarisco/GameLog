import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { ModalOptionText } from '@gamelog/common/CommonTypography';
import { FilterChip } from './FilterChip';
import { FilterModalWrapper } from './FilterModalWrapper';
import { SortBy } from '../useGameList';

import { METRICS } from '@gamelog/theme/metrics';

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
        bg: METRICS.playtime.bgClass,
        border: METRICS.playtime.borderClass,
        text: METRICS.playtime.textClass,
        hex: METRICS.playtime.hex,
      };
    case 'last_played':
      return {
        bg: METRICS.lastPlayed.bgClass,
        border: METRICS.lastPlayed.borderClass,
        text: METRICS.lastPlayed.textClass,
        hex: METRICS.lastPlayed.hex,
      };
    case 'max_per_day':
      return {
        bg: METRICS.maxPerDay.bgClass,
        border: METRICS.maxPerDay.borderClass,
        text: METRICS.maxPerDay.textClass,
        hex: METRICS.maxPerDay.hex,
      };
    case 'top_platform':
      return {
        bg: METRICS.topPlatform.bgClass,
        border: METRICS.topPlatform.borderClass,
        text: METRICS.topPlatform.textClass,
        hex: METRICS.topPlatform.hex,
      };
    default:
      return {
        bg: 'bg-primary-500',
        border: 'border-primary-500',
        text: 'text-typography-0',
        hex: '#ffffff',
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
